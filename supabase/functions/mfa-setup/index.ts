import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Simple TOTP implementation using Web Crypto API
function base32Encode(buffer: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(encoded: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanInput = encoded.replace(/=+$/, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (let i = 0; i < cleanInput.length; i++) {
    const idx = alphabet.indexOf(cleanInput[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

async function generateTOTP(secret: string, timeStep = 30, digits = 6): Promise<string> {
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);
  
  const counterBytes = new Uint8Array(8);
  let tmp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = tmp & 0xff;
    tmp = Math.floor(tmp / 256);
  }

  const cryptoKey = await crypto.subtle.importKey('raw', key.buffer as ArrayBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBytes.buffer as ArrayBuffer);
  const hmac = new Uint8Array(signature);
  
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);
  
  return String(code % Math.pow(10, digits)).padStart(digits, '0');
}

async function verifyTOTP(secret: string, token: string, window = 1): Promise<boolean> {
  for (let i = -window; i <= window; i++) {
    const epoch = Math.floor(Date.now() / 1000) + (i * 30);
    const counter = Math.floor(epoch / 30);
    
    const key = base32Decode(secret);
    const counterBytes = new Uint8Array(8);
    let tmp = counter;
    for (let j = 7; j >= 0; j--) {
      counterBytes[j] = tmp & 0xff;
      tmp = Math.floor(tmp / 256);
    }
    
    const cryptoKey = await crypto.subtle.importKey('raw', key.buffer as ArrayBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBytes.buffer as ArrayBuffer);
    const hmac = new Uint8Array(signature);
    
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
    
    const otp = String(code % 1000000).padStart(6, '0');
    if (otp === token) return true;
  }
  return false;
}

function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex.substring(0, 4).toUpperCase() + '-' + hex.substring(4, 8).toUpperCase();
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const accessToken = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(accessToken);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const user = {
      id: claimsData.claims.sub as string,
      email: (claimsData.claims.email as string | undefined) ?? '',
    };

    const { action, token, backup_code } = await req.json();

    // Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, mfa_secret, mfa_verified, mfa_backup_codes')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const jsonResponse = (data: any, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    switch (action) {
      case 'enroll': {
        // Generate new TOTP secret
        const secretBytes = new Uint8Array(20);
        crypto.getRandomValues(secretBytes);
        const secret = base32Encode(secretBytes);
        const backupCodes = generateBackupCodes();
        
        // Store secret (not yet verified)
        await supabaseAdmin.from('profiles').update({
          mfa_secret: secret,
          mfa_verified: false,
          mfa_backup_codes: backupCodes.map(c => ({ code: c, used: false }))
        }).eq('id', profile.id);

        const issuer = 'SMMPilot';
        const otpauthUri = `otpauth://totp/${issuer}:${user.email}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

        return jsonResponse({ secret, otpauth_uri: otpauthUri, backup_codes: backupCodes });
      }

      case 'verify': {
        // Verify the TOTP token to confirm enrollment
        if (!token || token.length !== 6) {
          return jsonResponse({ error: 'Invalid token format' }, 400);
        }
        if (!profile.mfa_secret) {
          return jsonResponse({ error: 'No MFA enrollment found. Please enroll first.' }, 400);
        }

        const valid = await verifyTOTP(profile.mfa_secret, token);
        if (!valid) {
          return jsonResponse({ error: 'Invalid verification code. Please try again.' }, 400);
        }

        await supabaseAdmin.from('profiles').update({ mfa_verified: true }).eq('id', profile.id);
        return jsonResponse({ success: true, message: '2FA enabled successfully' });
      }

      case 'validate': {
        // Post-login validation
        if (!profile.mfa_verified || !profile.mfa_secret) {
          return jsonResponse({ error: 'MFA not enabled' }, 400);
        }
        if (!token || token.length !== 6) {
          return jsonResponse({ error: 'Invalid token format' }, 400);
        }

        const valid = await verifyTOTP(profile.mfa_secret, token);
        return jsonResponse({ valid });
      }

      case 'use_backup': {
        if (!profile.mfa_verified || !profile.mfa_secret) {
          return jsonResponse({ error: 'MFA not enabled' }, 400);
        }
        if (!backup_code) {
          return jsonResponse({ error: 'Backup code required' }, 400);
        }

        const codes = (profile.mfa_backup_codes as any[]) || [];
        const codeIndex = codes.findIndex((c: any) => c.code === backup_code.toUpperCase() && !c.used);
        
        if (codeIndex === -1) {
          return jsonResponse({ error: 'Invalid or already used backup code' }, 400);
        }

        codes[codeIndex].used = true;
        await supabaseAdmin.from('profiles').update({ mfa_backup_codes: codes }).eq('id', profile.id);
        return jsonResponse({ valid: true, remaining: codes.filter((c: any) => !c.used).length });
      }

      case 'disable': {
        await supabaseAdmin.from('profiles').update({
          mfa_secret: null,
          mfa_verified: false,
          mfa_backup_codes: []
        }).eq('id', profile.id);
        return jsonResponse({ success: true, message: '2FA disabled' });
      }

      case 'status': {
        return jsonResponse({
          enabled: profile.mfa_verified === true,
          has_secret: !!profile.mfa_secret,
          backup_codes_remaining: ((profile.mfa_backup_codes as any[]) || []).filter((c: any) => !c.used).length
        });
      }

      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (err) {
    console.error('[mfa-setup] Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});