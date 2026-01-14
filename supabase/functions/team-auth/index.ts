import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JWT_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'fallback-secret-key';
const JWT_EXPIRY_SECONDS = 28800; // 8 hours for team members

// Rate limiting
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function jsonResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Base64URL encoding for JWT
function base64UrlEncode(data: string): string {
  return btoa(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(data: string): string {
  const padded = data + '='.repeat((4 - data.length % 4) % 4);
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

// Create JWT token
async function createJWT(payload: Record<string, any>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = { ...payload, iat: now, exp: now + JWT_EXPIRY_SECONDS };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureInput));
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// Verify JWT token
async function verifyJWT(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, error: 'Invalid token format' };

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = Uint8Array.from(
      base64UrlDecode(encodedSignature).split('').map(c => c.charCodeAt(0))
    );

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(signatureInput));
    if (!isValid) return { valid: false, error: 'Invalid signature' };

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, payload };
  } catch (error) {
    console.error('JWT verification error:', error);
    return { valid: false, error: 'Token verification failed' };
  }
}

// Rate limiting helpers
function checkRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
  const key = identifier.toLowerCase();
  const now = Date.now();
  const record = failedAttempts.get(key);

  if (!record) return { allowed: true };
  if (now - record.lastAttempt > LOCKOUT_DURATION_MS) {
    failedAttempts.delete(key);
    return { allowed: true };
  }
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_DURATION_MS - (now - record.lastAttempt)) / 1000);
    return { allowed: false, remainingTime };
  }
  return { allowed: true };
}

function recordFailedAttempt(identifier: string): void {
  const key = identifier.toLowerCase();
  const now = Date.now();
  const record = failedAttempts.get(key);
  if (!record) {
    failedAttempts.set(key, { count: 1, lastAttempt: now });
  } else {
    record.count += 1;
    record.lastAttempt = now;
  }
}

function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier.toLowerCase());
}

// PBKDF2-based password hashing
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000;
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  
  const hashArray = new Uint8Array(derivedBits);
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...hashArray));
  
  return `$pbkdf2$${iterations}$${saltB64}$${hashB64}`;
}

// Verify password against hash
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    if (storedHash.startsWith('$pbkdf2$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 5) return false;
      
      const iterations = parseInt(parts[2]);
      const salt = Uint8Array.from(atob(parts[3]), c => c.charCodeAt(0));
      const storedHashB64 = parts[4];
      
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw', encoder.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
      );
      
      const derivedBits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
        keyMaterial,
        256
      );
      
      const hashB64 = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
      return hashB64 === storedHashB64;
    }
    
    // Legacy plaintext comparison
    return storedHash === password;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { panelId, action } = body;
    
    console.log(`Team auth request: action=${action}, panelId=${panelId}`);

    if (!panelId) {
      return jsonResponse({ error: 'Missing panel ID' });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    switch (action) {
      case 'login':
        return await handleLogin(supabaseAdmin, body, req);
      case 'verify-token':
        return await handleVerifyToken(body);
      case 'set-password':
        return await handleSetPassword(supabaseAdmin, body);
      case 'fetch':
        return await handleFetch(supabaseAdmin, body);
      default:
        return jsonResponse({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Team auth error:', error);
    return jsonResponse({ error: error.message || 'Authentication failed' });
  }
});

// Handle team member login
async function handleLogin(supabaseAdmin: any, body: any, req: Request) {
  const { panelId, email, password } = body;
  
  console.log(`Team login attempt: email=${email}`);

  if (!email || !password) {
    return jsonResponse({ error: 'Email and password are required' });
  }

  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `team:${clientIP}:${email}`;

  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return jsonResponse({ 
      error: `Too many failed attempts. Please try again in ${rateLimit.remainingTime} seconds.`,
      rateLimited: true,
      retryAfter: rateLimit.remainingTime
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Query for team member
  const { data: member, error: queryError } = await supabaseAdmin
    .from('panel_team_members')
    .select('*')
    .eq('panel_id', panelId)
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (queryError) {
    console.error('Database query error:', queryError);
    return jsonResponse({ error: 'Database error' });
  }

  if (!member) {
    console.log('No team member found with email:', normalizedEmail);
    recordFailedAttempt(rateLimitKey);
    return jsonResponse({ error: 'No team member account found with this email' });
  }

  // Check if member is active
  if (!member.is_active) {
    return jsonResponse({ error: 'Your account has been deactivated. Please contact the panel owner.' });
  }

  // Check if password is set
  if (!member.password_hash) {
    // First login - need to set password
    return jsonResponse({ 
      needsPasswordSetup: true,
      memberId: member.id,
      message: 'Please set your password to continue'
    });
  }

  // Verify password
  const passwordMatch = await verifyPassword(password, member.password_hash);
  if (!passwordMatch) {
    console.log('Password mismatch for team member:', member.id);
    recordFailedAttempt(rateLimitKey);
    return jsonResponse({ error: 'Incorrect password. Please try again.' });
  }

  clearFailedAttempts(rateLimitKey);

  // Update last login and accepted_at if not set
  const updates: any = { updated_at: new Date().toISOString() };
  if (!member.accepted_at) {
    updates.accepted_at = new Date().toISOString();
  }
  
  await supabaseAdmin
    .from('panel_team_members')
    .update(updates)
    .eq('id', member.id);

  console.log('Team login successful for member:', member.id);

  // Generate JWT token
  const token = await createJWT({
    sub: member.id,
    email: member.email,
    panelId: panelId,
    role: member.role,
    type: 'team_member'
  });

  const { password_hash, ...safeMember } = member;
  
  return jsonResponse({ 
    success: true, 
    member: safeMember,
    token: token,
    expiresIn: JWT_EXPIRY_SECONDS
  });
}

// Handle token verification
async function handleVerifyToken(body: any) {
  const { token } = body;
  
  if (!token) {
    return jsonResponse({ error: 'Token is required' });
  }

  const verification = await verifyJWT(token);
  if (!verification.valid) {
    return jsonResponse({ error: verification.error, valid: false });
  }

  return jsonResponse({ valid: true, payload: verification.payload });
}

// Handle setting password for first-time login
async function handleSetPassword(supabaseAdmin: any, body: any) {
  const { panelId, memberId, password } = body;
  
  if (!memberId || !password) {
    return jsonResponse({ error: 'Member ID and password are required' });
  }

  if (password.length < 8) {
    return jsonResponse({ error: 'Password must be at least 8 characters' });
  }

  // Verify member exists and belongs to panel
  const { data: member, error: queryError } = await supabaseAdmin
    .from('panel_team_members')
    .select('*')
    .eq('id', memberId)
    .eq('panel_id', panelId)
    .maybeSingle();

  if (queryError || !member) {
    return jsonResponse({ error: 'Team member not found' });
  }

  // Hash and save password
  const hashedPassword = await hashPassword(password);
  
  const { error: updateError } = await supabaseAdmin
    .from('panel_team_members')
    .update({ 
      password_hash: hashedPassword,
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', memberId);

  if (updateError) {
    console.error('Error setting password:', updateError);
    return jsonResponse({ error: 'Failed to set password' });
  }

  // Generate token and log them in
  const token = await createJWT({
    sub: member.id,
    email: member.email,
    panelId: panelId,
    role: member.role,
    type: 'team_member'
  });

  return jsonResponse({ 
    success: true,
    message: 'Password set successfully',
    token: token,
    member: {
      id: member.id,
      email: member.email,
      full_name: member.full_name,
      role: member.role
    },
    expiresIn: JWT_EXPIRY_SECONDS
  });
}

// Handle session restoration
async function handleFetch(supabaseAdmin: any, body: any) {
  const { panelId, memberId, token } = body;
  
  if (token) {
    const verification = await verifyJWT(token);
    if (!verification.valid) {
      return jsonResponse({ error: 'Session expired. Please login again.', tokenExpired: true });
    }
    
    if (verification.payload?.sub !== memberId || verification.payload?.panelId !== panelId) {
      return jsonResponse({ error: 'Invalid session. Please login again.', tokenInvalid: true });
    }
  }

  if (!memberId) {
    return jsonResponse({ error: 'Member ID is required' });
  }

  const { data: member, error: queryError } = await supabaseAdmin
    .from('panel_team_members')
    .select('*')
    .eq('id', memberId)
    .eq('panel_id', panelId)
    .maybeSingle();

  if (queryError || !member) {
    return jsonResponse({ error: 'Team member not found' });
  }

  if (!member.is_active) {
    return jsonResponse({ error: 'Your account has been deactivated.' });
  }

  const { password_hash, ...safeMember } = member;
  return jsonResponse({ success: true, member: safeMember });
}
