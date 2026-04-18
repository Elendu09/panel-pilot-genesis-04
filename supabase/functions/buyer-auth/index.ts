import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore — npm: specifier supported by Supabase Edge Runtime (Deno)
import nodemailer from "npm:nodemailer@6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// JWT secret - in production, use a proper secret management system
const JWT_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'fallback-secret-key';
const JWT_EXPIRY_SECONDS = 3600; // 1 hour

// Rate limiting: track failed attempts per IP/email
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// Panel-specific rate limiting
const panelRateLimits = new Map<string, { count: number; lastReset: number }>();

// Helper to return JSON response - ALWAYS use 200 status to avoid "service unavailable" errors
function jsonResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ========= SECURITY ENFORCEMENT FUNCTIONS =========

// Load panel security settings for enforcement
async function loadSecuritySettings(supabase: any, panelId: string): Promise<Record<string, any>> {
  try {
    const { data: panel } = await supabase
      .from('panels')
      .select('settings')
      .eq('id', panelId)
      .single();
    
    return panel?.settings?.security || {};
  } catch {
    return {};
  }
}

// Check if IP is blocked/allowed based on panel security settings
function isIpBlocked(clientIp: string, settings: Record<string, any>): { blocked: boolean; reason?: string } {
  const ipAllowlist = (settings.ipAllowlist || '').split(',').map((ip: string) => ip.trim()).filter(Boolean);
  const ipBlocklist = (settings.ipBlocklist || '').split(',').map((ip: string) => ip.trim()).filter(Boolean);
  
  // If allowlist exists and IP not in it, block
  if (ipAllowlist.length > 0 && !ipAllowlist.includes(clientIp)) {
    return { blocked: true, reason: 'IP not in allowlist' };
  }
  
  // If IP in blocklist, block
  if (ipBlocklist.includes(clientIp)) {
    return { blocked: true, reason: 'IP is blocked' };
  }
  
  return { blocked: false };
}

// Check panel-specific rate limit (requests per minute)
function checkPanelRateLimit(
  identifier: string,
  panelId: string,
  settings: Record<string, any>
): { allowed: boolean; remainingTime?: number } {
  const maxRequests = parseInt(settings.rateLimit || '60');
  const windowMs = 60 * 1000; // 1 minute window
  const lockoutMinutes = parseInt(settings.lockoutDuration || '15');
  const lockoutMs = lockoutMinutes * 60 * 1000;
  
  const key = `${panelId}:${identifier}`;
  const now = Date.now();
  const record = panelRateLimits.get(key);
  
  // Reset window if expired
  if (!record || now - record.lastReset > windowMs) {
    panelRateLimits.set(key, { count: 1, lastReset: now });
    return { allowed: true };
  }
  
  // Check if exceeded
  if (record.count >= maxRequests) {
    const remainingTime = Math.ceil((windowMs - (now - record.lastReset)) / 1000);
    return { allowed: false, remainingTime };
  }
  
  // Increment count
  record.count++;
  panelRateLimits.set(key, record);
  return { allowed: true };
}

// Check if CAPTCHA is required based on failed attempts
function isCaptchaRequired(
  identifier: string,
  settings: Record<string, any>
): { required: boolean; threshold: number } {
  if (!settings.captchaEnabled) {
    return { required: false, threshold: 0 };
  }
  
  const threshold = parseInt(settings.captchaThreshold || '3');
  const key = identifier.toLowerCase();
  const record = failedAttempts.get(key);
  
  if (!record) {
    return { required: false, threshold };
  }
  
  return { required: record.count >= threshold, threshold };
}

// Log security event for audit
async function logSecurityEvent(
  supabase: any,
  panelId: string,
  action: string,
  details: Record<string, any>,
  clientIp: string
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      panel_id: panelId,
      action: action,
      resource_type: 'security',
      details: details,
      ip_address: clientIp,
    });
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}

// ========= TOTP FUNCTIONS FOR BUYER MFA =========
function base32Encode(buffer: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0, output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) { output += alphabet[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(encoded: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanInput = encoded.replace(/=+$/, '').toUpperCase();
  let bits = 0, value = 0;
  const output: number[] = [];
  for (let i = 0; i < cleanInput.length; i++) {
    const idx = alphabet.indexOf(cleanInput[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { output.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return new Uint8Array(output);
}

async function verifyTOTP(secret: string, token: string, window = 1): Promise<boolean> {
  for (let i = -window; i <= window; i++) {
    const epoch = Math.floor(Date.now() / 1000) + (i * 30);
    const counter = Math.floor(epoch / 30);
    const key = base32Decode(secret);
    const counterBytes = new Uint8Array(8);
    let tmp = counter;
    for (let j = 7; j >= 0; j--) { counterBytes[j] = tmp & 0xff; tmp = Math.floor(tmp / 256); }
    const cryptoKey = await crypto.subtle.importKey('raw', key.buffer as ArrayBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBytes.buffer as ArrayBuffer);
    const hmac = new Uint8Array(signature);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    if (String(code % 1000000).padStart(6, '0') === token) return true;
  }
  return false;
}

function generateMfaBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex.substring(0, 4).toUpperCase() + '-' + hex.substring(4, 8).toUpperCase();
  });
}

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
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRY_SECONDS
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Create HMAC-SHA256 signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signatureInput)
  );

  const encodedSignature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// Verify JWT token
async function verifyJWT(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    // Verify signature
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

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(signatureInput)
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Decode and check expiry
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

// Check rate limiting
function checkRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
  const key = identifier.toLowerCase();
  const now = Date.now();
  const record = failedAttempts.get(key);

  if (!record) {
    return { allowed: true };
  }

  // Check if lockout period has passed
  if (now - record.lastAttempt > LOCKOUT_DURATION_MS) {
    failedAttempts.delete(key);
    return { allowed: true };
  }

  // Check if too many attempts
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_DURATION_MS - (now - record.lastAttempt)) / 1000);
    return { allowed: false, remainingTime };
  }

  return { allowed: true };
}

// Record failed attempt
function recordFailedAttempt(identifier: string): void {
  const key = identifier.toLowerCase();
  const now = Date.now();
  const record = failedAttempts.get(key);

  if (!record) {
    failedAttempts.set(key, { count: 1, lastAttempt: now });
  } else {
    record.count += 1;
    record.lastAttempt = now;
    failedAttempts.set(key, record);
  }
}

// Clear failed attempts on successful login
function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier.toLowerCase());
}

// PBKDF2-based password hashing using Web Crypto API (no workers needed)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000;
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  // Use hex encoding for consistency (avoids btoa/atob edge cases)
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `$pbkdf2-hex$${iterations}$${saltHex}$${hashHex}`;
}

// Verify password against hash
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // New hex-based PBKDF2 format: $pbkdf2-hex$iterations$saltHex$hashHex
    if (storedHash.startsWith('$pbkdf2-hex$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 5) return false;
      
      const iterations = parseInt(parts[2]);
      const saltHex = parts[3];
      const storedHashHex = parts[4];
      
      const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
      
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: iterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );
      
      const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex === storedHashHex;
    }
    
    // Legacy base64 PBKDF2 format: $pbkdf2$iterations$salt$hash
    if (storedHash.startsWith('$pbkdf2$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 5) return false;
      
      const iterations = parseInt(parts[2]);
      const saltB64 = parts[3];
      const storedHashB64 = parts[4];
      
      // Decode salt from base64
      const saltStr = atob(saltB64);
      const salt = new Uint8Array(saltStr.length);
      for (let i = 0; i < saltStr.length; i++) {
        salt[i] = saltStr.charCodeAt(i);
      }
      
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: iterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );
      
      // Try base64 comparison (chunked for safety)
      const hashArray = new Uint8Array(derivedBits);
      let hashB64 = '';
      const chunkSize = 8192;
      for (let i = 0; i < hashArray.length; i += chunkSize) {
        const chunk = hashArray.subarray(i, Math.min(i + chunkSize, hashArray.length));
        hashB64 += String.fromCharCode(...chunk);
      }
      hashB64 = btoa(hashB64);
      
      if (hashB64 === storedHashB64) return true;
      
      return false;
    }
    
    // Legacy bcrypt hash - cannot verify without workers, return false
    if (storedHash.startsWith('$2')) {
      console.log('Legacy bcrypt hash detected - cannot verify without workers');
      return false;
    }
    
    // Legacy plaintext comparison (for very old accounts)
    return storedHash === password;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Check if a string is a bcrypt hash
function isBcryptHash(str: string): boolean {
  return Boolean(str && str.startsWith('$2'));
}

// Check if a string is a PBKDF2 hash
function isPbkdf2Hash(str: string): boolean {
  return Boolean(str && (str.startsWith('$pbkdf2$') || str.startsWith('$pbkdf2-hex$')));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { panelId, action } = body;
    
    console.log(`Buyer auth request: action=${action}, panelId=${panelId}`);

    if (!panelId) {
      return jsonResponse({ error: 'Missing panel ID' });
    }

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Handle different actions
    switch (action) {
      case 'login':
        return await handleLogin(supabaseAdmin, body, req);
      case 'fetch':
        return await handleFetch(supabaseAdmin, body);
      case 'verify-token':
        return await handleVerifyToken(body);
      case 'signup':
        return await handleSignup(supabaseAdmin, body, req);
      case 'guest-order':
        return await handleGuestOrder(supabaseAdmin, body);
      case 'forgot-password':
        return await handleForgotPassword(supabaseAdmin, body, req);
      case 'change-password':
        return await handleChangePassword(supabaseAdmin, body);
      case 'generate-api-key':
        return await handleGenerateApiKey(supabaseAdmin, body);
      case 'resend-verification':
        return await handleResendVerification(supabaseAdmin, body);
      case 'transactions':
        return await handleTransactions(supabaseAdmin, body);
      case 'create-chat-session':
        return await handleCreateChatSession(supabaseAdmin, body);
      case 'send-chat-message':
        return await handleSendChatMessage(supabaseAdmin, body);
      case 'create-support-ticket':
        return await handleCreateSupportTicket(supabaseAdmin, body);
      case 'list-tickets':
        return await handleListTickets(supabaseAdmin, body);
      case 'list-chat-sessions':
        return await handleListChatSessions(supabaseAdmin, body);
      case 'list-chat-messages':
        return await handleListChatMessages(supabaseAdmin, body);
      case 'reply-ticket':
        return await handleReplyTicket(supabaseAdmin, body);
      case 'close-ticket':
        return await handleCloseTicket(supabaseAdmin, body);
      case 'end-chat':
        return await handleEndChat(supabaseAdmin, body);
      case 'rate-chat':
        return await handleRateChat(supabaseAdmin, body);
      case 'send-ai-chat-message':
        return await handleSendAIChatMessage(supabaseAdmin, body);
      case 'mfa-enroll':
        return await handleMfaEnroll(supabaseAdmin, body);
      case 'mfa-verify':
        return await handleMfaVerify(supabaseAdmin, body);
      case 'mfa-validate':
        return await handleMfaValidate(supabaseAdmin, body);
      case 'mfa-backup':
        return await handleMfaBackup(supabaseAdmin, body);
      case 'mfa-disable':
        return await handleMfaDisable(supabaseAdmin, body);
      case 'mfa-status':
        return await handleMfaStatus(supabaseAdmin, body);
      case 'verify-email-token':
        return await handleVerifyEmailToken(supabaseAdmin, body);
      default:
        return jsonResponse({ error: 'Invalid action' });
    }

  } catch (error: unknown) {
    console.error('Buyer auth error:', error);
    return jsonResponse({ error: (error as Error).message || 'Authentication failed' });
  }
});

// Handle login action
async function handleLogin(supabaseAdmin: any, body: any, req: Request) {
  const { panelId, identifier, password, captchaToken } = body;
  
  console.log(`Login attempt: identifier=${identifier}`);

  if (!identifier || !password) {
    return jsonResponse({ error: 'Email/username and password are required' });
  }

  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `${clientIP}:${identifier}`;

  // ========= SECURITY ENFORCEMENT =========
  // Load panel security settings
  const securitySettings = await loadSecuritySettings(supabaseAdmin, panelId);
  
  // 1. Check IP allowlist/blocklist
  const ipCheck = isIpBlocked(clientIP, securitySettings);
  if (ipCheck.blocked) {
    console.log(`IP blocked for panel ${panelId}: ${clientIP} - ${ipCheck.reason}`);
    await logSecurityEvent(supabaseAdmin, panelId, 'ip_blocked', { 
      ip: clientIP, 
      reason: ipCheck.reason,
      identifier 
    }, clientIP);
    return jsonResponse({ 
      error: 'Access denied. Your IP address is not allowed.',
      blocked: true
    });
  }
  
  // 2. Check panel-specific rate limit (requests per minute)
  const panelRateLimit = checkPanelRateLimit(identifier, panelId, securitySettings);
  if (!panelRateLimit.allowed) {
    console.log(`Panel rate limit exceeded: ${panelId}:${identifier}`);
    await logSecurityEvent(supabaseAdmin, panelId, 'rate_limit_exceeded', { 
      identifier,
      remainingTime: panelRateLimit.remainingTime 
    }, clientIP);
    return jsonResponse({ 
      error: `Too many requests. Please try again in ${panelRateLimit.remainingTime} seconds.`,
      rateLimited: true,
      retryAfter: panelRateLimit.remainingTime
    });
  }
  
  // 3. Check if CAPTCHA is required
  const captchaCheck = isCaptchaRequired(identifier, securitySettings);
  if (captchaCheck.required && !captchaToken) {
    console.log(`CAPTCHA required for: ${identifier}`);
    return jsonResponse({ 
      error: 'CAPTCHA verification required due to multiple failed attempts.',
      captchaRequired: true,
      threshold: captchaCheck.threshold
    });
  }
  // ========= END SECURITY ENFORCEMENT =========

  // Check standard rate limit (failed attempts)
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    console.log(`Rate limited: ${rateLimitKey}`);
    return jsonResponse({ 
      error: `Too many failed attempts. Please try again in ${rateLimit.remainingTime} seconds.`,
      rateLimited: true,
      retryAfter: rateLimit.remainingTime
    });
  }

  // Normalize identifier (trim and lowercase)
  const normalizedIdentifier = identifier.trim().toLowerCase();

  // Query for user by email OR username
  const { data: users, error: queryError } = await supabaseAdmin
    .from('client_users')
    .select('*')
    .eq('panel_id', panelId)
    .or(`email.eq.${normalizedIdentifier},username.ilike.${normalizedIdentifier}`);

  if (queryError) {
    console.error('Database query error:', queryError);
    return jsonResponse({ error: 'Database error' });
  }

  if (!users || users.length === 0) {
    console.log('No user found with identifier:', normalizedIdentifier);
    recordFailedAttempt(rateLimitKey);
    return jsonResponse({ error: 'No account found with this email or username' });
  }

  const user = users[0];

  // Check if user is banned
  if (user.is_banned) {
    console.log('User is banned:', user.id);
    return jsonResponse({ 
      error: 'Your account has been banned',
      reason: user.ban_reason || 'Contact support for more information'
    });
  }

  // Check if user is suspended (inactive)
  if (!user.is_active) {
    // Distinguish between email-not-verified and admin-suspended
    if (user.verification_token) {
      console.log('User email not verified:', user.id);
      return jsonResponse({
        error: 'Please verify your email before logging in. Check your inbox or request a new verification email.',
        requiresVerification: true,
        email: user.email,
      });
    }
    console.log('User is suspended:', user.id);
    return jsonResponse({ error: 'Your account has been suspended. Please contact support.' });
  }

  // Verify password - check password_hash first, then password_temp independently
  let passwordMatch = false;
  
  // Step 1: Check main password_hash
  if (user.password_hash) {
    if (isPbkdf2Hash(user.password_hash)) {
      passwordMatch = await verifyPassword(password, user.password_hash);
      // Re-hash legacy base64 format to hex for future consistency
      if (passwordMatch && user.password_hash.startsWith('$pbkdf2$')) {
        try {
          console.log('Migrating legacy base64 PBKDF2 to hex format for user:', user.id);
          const newHash = await hashPassword(password);
          await supabaseAdmin
            .from('client_users')
            .update({ password_hash: newHash })
            .eq('id', user.id);
        } catch (rehashErr) {
          console.error('Re-hash migration error (non-fatal):', rehashErr);
        }
      }
    } else if (isBcryptHash(user.password_hash)) {
      console.log('Bcrypt hash detected, user needs password reset:', user.id);
      return jsonResponse({ 
        error: 'Please reset your password to continue. Use the "Forgot Password" option.',
        requiresPasswordReset: true 
      });
    } else {
      // Legacy plaintext comparison - migrate to PBKDF2
      passwordMatch = user.password_hash === password;
      if (passwordMatch) {
        console.log('Migrating legacy plaintext password to PBKDF2 for user:', user.id);
        const newHash = await hashPassword(password);
        await supabaseAdmin
          .from('client_users')
          .update({ password_hash: newHash, password_temp: null })
          .eq('id', user.id);
      }
    }
  }
  
  // Step 2: If main password didn't match, check password_temp (if set and not expired)
  if (!passwordMatch && user.password_temp) {
    // Check expiry
    const tempExpired = user.password_temp_expires_at && new Date(user.password_temp_expires_at) < new Date();
    if (!tempExpired) {
      if (isPbkdf2Hash(user.password_temp)) {
        passwordMatch = await verifyPassword(password, user.password_temp);
      } else {
        // Plaintext temp password
        passwordMatch = user.password_temp === password;
      }
      if (passwordMatch) {
        console.log('Login via temp password for user:', user.id);
      }
    } else {
      console.log('Temp password expired for user:', user.id);
      // Clear expired temp password
      await supabaseAdmin
        .from('client_users')
        .update({ password_temp: null, password_temp_expires_at: null })
        .eq('id', user.id);
    }
  }
  
  if (!passwordMatch) {
    console.log('Password mismatch for user:', user.id);
    recordFailedAttempt(rateLimitKey);
    return jsonResponse({ error: 'Incorrect password. Please try again.' });
  }

  // Clear failed attempts on successful login
  clearFailedAttempts(rateLimitKey);

  // Update last login timestamp
  await supabaseAdmin
    .from('client_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);

  console.log('Login successful for user:', user.id);

  // Generate JWT token
  const token = await createJWT({
    sub: user.id,
    email: user.email,
    panelId: panelId,
    type: 'buyer'
  });

  // Return user data (exclude sensitive fields)
  const { password_hash, password_temp, api_key: _ak, mfa_secret, ...safeUser } = user;
  
  // Check if MFA is enabled
  const mfaRequired = user.mfa_verified === true && !!user.mfa_secret;
  
  return jsonResponse({ 
    success: true, 
    user: safeUser,
    token: token,
    expiresIn: JWT_EXPIRY_SECONDS,
    mfa_required: mfaRequired
  });
}

// Handle fetch action (session restoration)
async function handleFetch(supabaseAdmin: any, body: any) {
  const { panelId, buyerId, token } = body;
  
  console.log(`Fetch buyer: buyerId=${buyerId}, panelId=${panelId}`);

  // Verify JWT if provided
  if (token) {
    const verification = await verifyJWT(token);
    if (!verification.valid) {
      console.log('Token verification failed:', verification.error);
      return jsonResponse({ error: 'Session expired. Please login again.', tokenExpired: true });
    }
    
    // Ensure token matches requested buyer
    if (verification.payload?.sub !== buyerId || verification.payload?.panelId !== panelId) {
      console.log('Token mismatch');
      return jsonResponse({ error: 'Invalid session. Please login again.', tokenInvalid: true });
    }
  }

  if (!buyerId) {
    return jsonResponse({ error: 'Buyer ID is required' });
  }

  // Fetch buyer by ID
  const { data: user, error: queryError } = await supabaseAdmin
    .from('client_users')
    .select('*')
    .eq('id', buyerId)
    .eq('panel_id', panelId)
    .maybeSingle();

  if (queryError || !user) {
    console.log('No user found with id:', buyerId);
    return jsonResponse({ error: 'User not found' });
  }

  // Check if user is banned
  if (user.is_banned) {
    console.log('User is banned:', user.id);
    return jsonResponse({ 
      error: 'Your account has been banned',
      reason: user.ban_reason || 'Contact support for more information'
    });
  }

  // Check if user is suspended (inactive)
  if (!user.is_active) {
    console.log('User is suspended:', user.id);
    return jsonResponse({ error: 'Your account has been suspended. Please contact support.' });
  }

  console.log('Fetch successful for user:', user.id);

  // Return user data (exclude sensitive fields)
  const { password_hash, password_temp, api_key: _ak2, mfa_secret: _ms, ...safeUser } = user;
  
  return jsonResponse({ 
    success: true, 
    user: safeUser 
  });
}

// Handle token verification
async function handleVerifyToken(body: any) {
  const { token } = body;
  
  if (!token) {
    return jsonResponse({ valid: false, error: 'No token provided' });
  }

  const verification = await verifyJWT(token);
  return jsonResponse(verification);
}

// Handle signup action
async function handleSignup(supabaseAdmin: any, body: any, req: Request) {
  const { panelId, email, password, fullName, username, referralCode } = body;
  
  console.log(`Signup attempt: email=${email}, panelId=${panelId}`);

  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `signup:${clientIP}`;

  // Check rate limit (more lenient for signup)
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return jsonResponse({ 
      error: `Too many signup attempts. Please try again later.`,
      rateLimited: true
    });
  }

  if (!email || !password) {
    return jsonResponse({ error: 'Email and password are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!emailRegex.test(normalizedEmail)) {
    return jsonResponse({ error: 'Invalid email format' });
  }

  if (password.length < 8) {
    return jsonResponse({ error: 'Password must be at least 8 characters' });
  }

  // Password strength check
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return jsonResponse({ 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    });
  }

  // Check if email already exists for this panel
  const { data: existingEmail } = await supabaseAdmin
    .from('client_users')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('panel_id', panelId)
    .maybeSingle();

  if (existingEmail) {
    return jsonResponse({ error: 'Email already registered', needsLogin: true });
  }

  // Check if username exists (if provided)
  if (username) {
    const normalizedUsername = username.trim().toLowerCase();
    const { data: existingUsername } = await supabaseAdmin
      .from('client_users')
      .select('id')
      .ilike('username', normalizedUsername)
      .eq('panel_id', panelId)
      .maybeSingle();

    if (existingUsername) {
      return jsonResponse({ error: 'Username already taken' });
    }
  }

  // Check for referrer if referral code provided
  let referrerId = null;
  if (referralCode) {
    const { data: referrer } = await supabaseAdmin
      .from('client_users')
      .select('id')
      .eq('referral_code', referralCode.toUpperCase())
      .eq('panel_id', panelId)
      .maybeSingle();
    
    if (referrer) {
      referrerId = referrer.id;
    }
  }

  // Hash password using PBKDF2
  const hashedPassword = await hashPassword(password);

  // Create new buyer account
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('client_users')
    .insert({
      email: normalizedEmail,
      full_name: fullName?.trim() || null,
      username: username?.trim() || null,
      password_hash: hashedPassword,
      password_temp: null, // Never store plaintext
      panel_id: panelId,
      is_active: true,
      is_banned: false,
      balance: 0,
      total_spent: 0,
      referral_count: 0,
      custom_discount: 0,
      referred_by: referrerId,
      api_key: crypto.randomUUID(),
    })
    .select()
    .single();

  if (insertError) {
    console.error('Signup error:', insertError);
    recordFailedAttempt(rateLimitKey);
    return jsonResponse({ error: insertError.message || 'Registration failed' });
  }

  // Update referrer's count
  if (referrerId) {
    await supabaseAdmin.rpc('increment_referral_count', { user_id: referrerId }).catch(() => {
      supabaseAdmin
        .from('client_users')
        .update({ referral_count: supabaseAdmin.raw('referral_count + 1') })
        .eq('id', referrerId);
    });
  }

  console.log('Signup successful for user:', newUser.id);

  // ── Email verification gate ──
  // If the panel has SMTP configured, require email verification before login
  const smtpConfigAtSignup = await getPanelSMTPConfig(supabaseAdmin, panelId);
  if (smtpConfigAtSignup) {
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Mark user as unverified
    await supabaseAdmin
      .from('client_users')
      .update({
        is_active: false,
        verification_token: verificationToken,
        verification_token_expires_at: expiresAt,
      })
      .eq('id', newUser.id);

    // Get panel domain for verify link
    const { data: panelInfo } = await supabaseAdmin
      .from('panels')
      .select('name, subdomain, custom_domain, settings')
      .eq('id', panelId)
      .single();
    const panelName = panelInfo?.name || 'SMM Panel';
    const panelDomain = panelInfo?.custom_domain || (panelInfo?.subdomain ? `${panelInfo.subdomain}.smmpilot.online` : null);
    const verifyLink = panelDomain
      ? `https://${panelDomain}/verify-email?token=${verificationToken}&panelId=${panelId}`
      : null;

    if (verifyLink) {
      const panelSettings = panelInfo?.settings as any;
      const bodyTemplate = panelSettings?.smtpVerifyBody
        || '<h2>Verify Your Email</h2><p>Hi {username},</p><p>Please click the link below to verify your email address:</p><p><a href="{verify_link}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;">Verify Email</a></p><p>This link expires in 24 hours.</p><p>— {panel_name}</p>';
      const subjectTemplate = panelSettings?.smtpVerifySubject || `Verify your email for ${panelName}`;
      const htmlBody = bodyTemplate
        .replace(/\{username\}/g, newUser.full_name || newUser.email.split('@')[0])
        .replace(/\{panel_name\}/g, panelName)
        .replace(/\{verify_link\}/g, verifyLink)
        .replace(/\{login_url\}/g, `https://${panelDomain}/auth`);

      const emailResult = await sendSMTPEmail(smtpConfigAtSignup, normalizedEmail, subjectTemplate, htmlBody);
      console.log(`[handleSignup] Verification email sent=${emailResult.success} to ${normalizedEmail}`);
    }

    return jsonResponse({
      success: true,
      requiresVerification: true,
      message: 'Registration successful. Please check your email and verify your account before logging in.',
    });
  }

  // Generate JWT token (no email verification required)
  const token = await createJWT({
    sub: newUser.id,
    email: newUser.email,
    panelId: panelId,
    type: 'buyer'
  });

  // Return user data (exclude sensitive fields)
  const { password_hash, password_temp, api_key: _ak3, mfa_secret: _ms2, ...safeUser } = newUser;
  
  return jsonResponse({ 
    success: true, 
    user: safeUser,
    token: token,
    expiresIn: JWT_EXPIRY_SECONDS
  });
}

// Handle guest order - creates account and prepares for order
async function handleGuestOrder(supabaseAdmin: any, body: any) {
  const { panelId, email, fullName, username } = body;
  
  console.log(`Guest order attempt: email=${email}, username=${username}, panelId=${panelId}`);

  if (!email) {
    return jsonResponse({ error: 'Email is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!emailRegex.test(normalizedEmail)) {
    return jsonResponse({ error: 'Invalid email format' });
  }

  // Check if email already exists for this panel
  const { data: existingUser } = await supabaseAdmin
    .from('client_users')
    .select('*')
    .eq('email', normalizedEmail)
    .eq('panel_id', panelId)
    .maybeSingle();

  if (existingUser) {
    // Account exists - check if banned or inactive
    if (existingUser.is_banned) {
      return jsonResponse({ 
        error: 'This account has been banned',
        reason: existingUser.ban_reason || 'Contact support for more information'
      });
    }
    if (!existingUser.is_active) {
      return jsonResponse({ error: 'This account has been suspended. Please contact support.' });
    }
    
    // Return that login is needed
    return jsonResponse({ 
      error: 'Account already exists. Please login to continue.',
      needsLogin: true,
      existingEmail: normalizedEmail
    });
  }

  // Generate temporary password (user-friendly)
  const tempPassword = generateTempPassword();
  
  // Hash the temporary password using PBKDF2
  const hashedPassword = await hashPassword(tempPassword);

  // Create new buyer account with auto-generated or provided username
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('client_users')
    .insert({
      email: normalizedEmail,
      full_name: fullName?.trim() || null,
      username: username?.trim() || null,
      password_hash: hashedPassword,
      password_temp: null, // Store hash, not plaintext
      panel_id: panelId,
      is_active: true,
      is_banned: false,
      balance: 0,
      total_spent: 0,
      referral_count: 0,
      custom_discount: 0,
      api_key: crypto.randomUUID(),
    })
    .select()
    .single();

  if (insertError) {
    console.error('Guest signup error:', insertError);
    return jsonResponse({ error: insertError.message || 'Account creation failed' });
  }

  // Update last login
  await supabaseAdmin
    .from('client_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', newUser.id);

  console.log('Guest account created:', newUser.id);

  // Generate JWT token
  const token = await createJWT({
    sub: newUser.id,
    email: newUser.email,
    panelId: panelId,
    type: 'buyer'
  });

  // Return user data with temp password (so user knows their credentials)
  const { password_hash, ...safeUser } = newUser;
  
  return jsonResponse({ 
    success: true, 
    user: { ...safeUser, password_temp: undefined },
    tempPassword: tempPassword, // Send plaintext to user for initial login
    token: token,
    expiresIn: JWT_EXPIRY_SECONDS,
    username: newUser.username || normalizedEmail,
    isNewAccount: true,
    message: 'Account created! Add funds to place your order.'
  });
}

// Generate a user-friendly temporary password
function generateTempPassword(): string {
  // Generate a stronger password with mixed case and numbers
  const lowerChars = 'abcdefghjkmnpqrstuvwxyz';
  const upperChars = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const numbers = '23456789';
  
  let password = '';
  // Ensure at least one of each type
  password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  
  // Fill the rest
  const allChars = lowerChars + upperChars + numbers;
  for (let i = 0; i < 9; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Handle forgot password action
async function handleForgotPassword(supabaseAdmin: any, body: any, req: Request) {
  const { panelId, email } = body;
  
  console.log(`Forgot password request: email=${email}`);

  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `forgot:${clientIP}:${email}`;

  // Check rate limit
  const rateLimit = checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    // Don't reveal rate limiting to prevent email enumeration
    return jsonResponse({ 
      success: true, 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    });
  }

  const identifier = email || body.identifier;
  if (!identifier) {
    return jsonResponse({ error: 'Email or username is required' });
  }

  const trimmedIdentifier = identifier.trim().toLowerCase();
  const isEmail = trimmedIdentifier.includes('@');

  let user: any = null;
  let queryError: any = null;

  if (isEmail) {
    // Find user by email
    const result = await supabaseAdmin
      .from('client_users')
      .select('id, email, full_name')
      .eq('email', trimmedIdentifier)
      .eq('panel_id', panelId)
      .maybeSingle();
    user = result.data;
    queryError = result.error;
  } else {
    // Find user by username
    const result = await supabaseAdmin
      .from('client_users')
      .select('id, email, full_name')
      .ilike('username', trimmedIdentifier)
      .eq('panel_id', panelId)
      .maybeSingle();
    user = result.data;
    queryError = result.error;
  }

  if (queryError) {
    console.error('Database query error:', queryError);
    return jsonResponse({ error: 'Database error' });
  }

  // Always return success to not reveal if email exists (security)
  if (!user) {
    console.log('No user found with identifier:', trimmedIdentifier);
    recordFailedAttempt(rateLimitKey);
    return jsonResponse({ 
      success: true, 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    });
  }

  // Generate a new temporary password
  const newPassword = generateTempPassword();
  
  // Hash the new password using PBKDF2
  const hashedTempPassword = await hashPassword(newPassword);

  // Store temp password WITHOUT overwriting main password_hash
  // Temp password expires in 24 hours by default
  const tempExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabaseAdmin
    .from('client_users')
    .update({ 
      password_temp: hashedTempPassword,
      password_temp_expires_at: tempExpiresAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating temp password:', updateError);
    return jsonResponse({ error: 'Failed to reset password' });
  }

  console.log('Temp password set for user:', user.id, 'expires at:', tempExpiresAt);

  // Attempt SMTP delivery if panel has it configured
  const smtpConfig = await getPanelSMTPConfig(supabaseAdmin, panelId);
  let emailSent = false;

  if (smtpConfig) {
    const { data: panelData } = await supabaseAdmin
      .from('panels')
      .select('name, subdomain, custom_domain, settings')
      .eq('id', panelId)
      .single();

    const panelName = panelData?.name || 'SMM Panel';
    const panelDomain = panelData?.custom_domain || (panelData?.subdomain ? `${panelData.subdomain}.smmpilot.online` : '');
    const panelSettings = panelData?.settings as any;

    const subjectTemplate = panelSettings?.smtpResetSubject || 'Password Reset - {panel_name}';
    const bodyTemplate = panelSettings?.smtpResetBody
      || '<h2>Password Reset</h2><p>Hi {username},</p><p>Your temporary password is: <strong>{temp_password}</strong></p><p>This password expires in 24 hours. Please log in and change it immediately.</p><p>— {panel_name}</p>';

    const subject = subjectTemplate.replace(/\{panel_name\}/g, panelName);
    const htmlBody = bodyTemplate
      .replace(/\{username\}/g, user.full_name || user.email.split('@')[0])
      .replace(/\{panel_name\}/g, panelName)
      .replace(/\{temp_password\}/g, newPassword)
      .replace(/\{login_url\}/g, panelDomain ? `https://${panelDomain}/auth` : '');

    const result = await sendSMTPEmail(smtpConfig, user.email, subject, htmlBody);
    emailSent = result.success;
    if (!result.success) {
      console.warn('Password reset email SMTP error:', result.error);
    }
  }

  return jsonResponse({ 
    success: true, 
    tempPassword: emailSent ? undefined : newPassword,
    email_sent: emailSent,
    message: emailSent
      ? 'A temporary password has been sent to your email address.'
      : 'Your temporary password has been generated. Your original password still works. The temporary password expires in 24 hours.'
  });
}

// Handle password change
async function handleChangePassword(supabaseAdmin: any, body: any) {
  const { panelId, buyerId, token, currentPassword, newPassword } = body;
  
  console.log(`Password change request for buyer: ${buyerId}`);

  // Verify JWT token
  if (token) {
    const verification = await verifyJWT(token);
    if (!verification.valid) {
      return jsonResponse({ error: 'Session expired. Please login again.', tokenExpired: true });
    }
    
    if (verification.payload?.sub !== buyerId) {
      return jsonResponse({ error: 'Invalid session' });
    }
  }

  if (!buyerId || !currentPassword || !newPassword) {
    return jsonResponse({ error: 'Missing required fields' });
  }

  if (newPassword.length < 8) {
    return jsonResponse({ error: 'New password must be at least 8 characters' });
  }

  // Password strength check
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return jsonResponse({ 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    });
  }

  // Fetch user
  const { data: user, error: queryError } = await supabaseAdmin
    .from('client_users')
    .select('id, password_hash, password_temp')
    .eq('id', buyerId)
    .eq('panel_id', panelId)
    .maybeSingle();

  if (queryError || !user) {
    return jsonResponse({ error: 'User not found' });
  }

  // Verify current password
  const storedHash = user.password_hash || user.password_temp;
  let passwordMatch = false;
  
  if (storedHash) {
    passwordMatch = await verifyPassword(currentPassword, storedHash);
  }

  if (!passwordMatch) {
    return jsonResponse({ error: 'Current password is incorrect' });
  }

  // Hash new password using PBKDF2
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  const { error: updateError } = await supabaseAdmin
    .from('client_users')
    .update({ 
      password_hash: hashedPassword,
      password_temp: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating password:', updateError);
    return jsonResponse({ error: 'Failed to update password' });
  }

  console.log('Password changed successfully for user:', user.id);

  return jsonResponse({ 
    success: true, 
    message: 'Password updated successfully' 
  });
}

// Handle API key generation
async function handleGenerateApiKey(supabaseAdmin: any, body: any) {
  const { panelId, buyerId, token } = body;
  
  console.log(`Generate API key request: buyerId=${buyerId}, panelId=${panelId}`);

  // Verify JWT token
  if (!token) {
    return jsonResponse({ error: 'Authentication required' });
  }
  
  const verification = await verifyJWT(token);
  if (!verification.valid) {
    return jsonResponse({ error: 'Session expired. Please login again.', tokenExpired: true });
  }
  
  if (verification.payload?.sub !== buyerId) {
    return jsonResponse({ error: 'Invalid session' });
  }

  if (!buyerId || !panelId) {
    return jsonResponse({ error: 'Missing required fields' });
  }

  // Generate secure API key with panel prefix
  const panelPrefix = panelId.substring(0, 8);
  const randomPart = crypto.randomUUID().replace(/-/g, '');
  const apiKey = `sk_${panelPrefix}_${randomPart}`;

  // Update in database (bypasses RLS with admin client)
  const { error: updateError } = await supabaseAdmin
    .from('client_users')
    .update({ 
      api_key: apiKey,
      updated_at: new Date().toISOString()
    })
    .eq('id', buyerId)
    .eq('panel_id', panelId);

  if (updateError) {
    console.error('Error generating API key:', updateError);
    
    // Handle unique constraint violation - retry once
    if (updateError.code === '23505') {
      const retryKey = `sk_${panelPrefix}_${crypto.randomUUID().replace(/-/g, '')}`;
      const { error: retryError } = await supabaseAdmin
        .from('client_users')
        .update({ 
          api_key: retryKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', buyerId)
        .eq('panel_id', panelId);
      
      if (retryError) {
        console.error('Retry error generating API key:', retryError);
        return jsonResponse({ error: 'Failed to generate API key' });
      }
      
      console.log('API key generated successfully (retry) for buyer:', buyerId);
      return jsonResponse({ success: true, api_key: retryKey });
    }
    
    return jsonResponse({ error: 'Failed to generate API key' });
  }

  console.log('API key generated successfully for buyer:', buyerId);
  return jsonResponse({ success: true, api_key: apiKey });
}

// ========= SMTP EMAIL HELPER =========

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  secure?: boolean;
}

async function sendSMTPEmail(
  smtp: SMTPConfig,
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure ?? (smtp.port === 465),
      auth: {
        user: smtp.username,
        pass: smtp.password,
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
      to,
      subject,
      html: htmlBody,
    });

    return { success: true };
  } catch (err: any) {
    console.error('SMTP send error:', err?.message || err);
    return { success: false, error: err?.message || 'SMTP send failed' };
  }
}

async function getPanelSMTPConfig(supabaseAdmin: any, panelId: string): Promise<SMTPConfig | null> {
  const { data: panel } = await supabaseAdmin
    .from('panels')
    .select('settings')
    .eq('id', panelId)
    .single();

  const settings = panel?.settings as any;
  if (!settings?.smtpHost || !settings?.smtpUsername || !settings?.smtpPassword) {
    return null;
  }

  return {
    host: settings.smtpHost,
    port: parseInt(settings.smtpPort || '587', 10),
    username: settings.smtpUsername,
    password: settings.smtpPassword,
    fromEmail: settings.smtpFromEmail || settings.smtpUsername,
    fromName: settings.smtpFromName || 'SMM Panel',
  };
}

// ========= RESEND VERIFICATION =========

async function handleResendVerification(supabaseAdmin: any, body: any) {
  const { panelId, buyerId, email } = body;
  
  console.log(`Resend verification request: email=${email}, buyerId=${buyerId}`);

  if (!email && !buyerId) {
    return jsonResponse({ error: 'Email or buyer ID is required' });
  }

  // Fetch buyer data
  let buyer: any;
  if (buyerId) {
    const { data, error } = await supabaseAdmin
      .from('client_users')
      .select('id, email, full_name, is_active, panel_id')
      .eq('id', buyerId)
      .eq('panel_id', panelId)
      .single();
    
    if (error || !data) return jsonResponse({ error: 'User not found' });
    buyer = data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('client_users')
      .select('id, email, full_name, is_active, panel_id')
      .eq('email', email.toLowerCase())
      .eq('panel_id', panelId)
      .single();
    
    if (error || !data) return jsonResponse({ error: 'User not found' });
    buyer = data;
  }

  if (buyer.is_active) {
    return jsonResponse({ error: 'Email is already verified' });
  }

  // Get panel info
  const { data: panel } = await supabaseAdmin
    .from('panels')
    .select('name, subdomain, custom_domain, settings')
    .eq('id', panelId)
    .single();

  const panelName = panel?.name || 'SMM Panel';
  const panelDomain = panel?.custom_domain || (panel?.subdomain ? `${panel.subdomain}.smmpilot.online` : null);

  // Generate and store verification token (24-hour expiry)
  const verificationToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await supabaseAdmin
    .from('client_users')
    .update({
      verification_token: verificationToken,
      verification_token_expires_at: expiresAt,
    })
    .eq('id', buyer.id);

  const verifyLink = panelDomain
    ? `https://${panelDomain}/verify-email?token=${verificationToken}&panelId=${panelId}`
    : `[verification-link-unavailable-no-domain-configured]`;

  console.log(`Verification link for ${buyer.email}: ${verifyLink}`);

  // Attempt SMTP send if panel has SMTP configured
  const panelSettings = panel?.settings as any;
  const smtpConfig = await getPanelSMTPConfig(supabaseAdmin, panelId);

  let emailSent = false;
  let emailError: string | undefined;

  if (smtpConfig && panelDomain) {
    // Use panel's custom verify body template if set, otherwise default
    const bodyTemplate = panelSettings?.smtpVerifyBody
      || '<h2>Verify Your Email</h2><p>Hi {username},</p><p>Please click the link below to verify your email address:</p><p><a href="{verify_link}">Verify Email</a></p><p>This link expires in 24 hours.</p><p>— {panel_name}</p>';

    const subjectTemplate = panelSettings?.smtpVerifySubject || 'Verify your email address';

    const htmlBody = bodyTemplate
      .replace(/\{username\}/g, buyer.full_name || buyer.email.split('@')[0])
      .replace(/\{panel_name\}/g, panelName)
      .replace(/\{verify_link\}/g, verifyLink)
      .replace(/\{login_url\}/g, `https://${panelDomain}/auth`);

    const result = await sendSMTPEmail(smtpConfig, buyer.email, subjectTemplate, htmlBody);
    emailSent = result.success;
    emailError = result.error;
  }

  // Log the send attempt
  await supabaseAdmin
    .from('email_send_logs')
    .insert({
      email: buyer.email,
      email_action_type: 'verification',
      user_id: buyer.id,
      metadata: {
        panel_id: panelId,
        panel_name: panelName,
        email_sent: emailSent,
        smtp_error: emailError || null,
        sent_at: new Date().toISOString(),
      }
    })
    .catch(() => {});

  if (!smtpConfig) {
    return jsonResponse({
      success: true,
      message: 'Verification token generated. Email delivery requires SMTP configuration in your panel settings.',
      email_sent: false,
      no_smtp: true,
    });
  }

  if (!emailSent) {
    return jsonResponse({
      success: false,
      error: `Failed to send email: ${emailError || 'Unknown SMTP error'}. Please check your panel SMTP settings.`,
    });
  }

  return jsonResponse({ success: true, message: 'Verification email sent successfully', email_sent: true });
}

// ========= VERIFY EMAIL TOKEN =========

async function handleVerifyEmailToken(supabaseAdmin: any, body: any) {
  const { token, panelId } = body;
  if (!token || !panelId) return jsonResponse({ error: 'Missing token or panelId' });

  const { data: user, error } = await supabaseAdmin
    .from('client_users')
    .select('id, email, is_active, verification_token, verification_token_expires_at')
    .eq('panel_id', panelId)
    .eq('verification_token', token)
    .single();

  if (error || !user) {
    return jsonResponse({ error: 'Invalid or already used verification link' });
  }

  if (user.is_active) {
    return jsonResponse({ success: true, message: 'Email is already verified' });
  }

  if (user.verification_token_expires_at && new Date(user.verification_token_expires_at) < new Date()) {
    return jsonResponse({ error: 'This verification link has expired. Please request a new one.' });
  }

  await supabaseAdmin
    .from('client_users')
    .update({
      is_active: true,
      verification_token: null,
      verification_token_expires_at: null,
    })
    .eq('id', user.id);

  return jsonResponse({ success: true, message: 'Email verified successfully' });
}

// Handle transactions history for buyer
async function handleTransactions(supabaseAdmin: any, body: any) {
  const { panelId, buyerId } = body;

  if (!buyerId || !panelId) {
    return jsonResponse({ error: 'Missing buyerId or panelId' });
  }

  // Verify buyer belongs to panel
  const { data: buyer } = await supabaseAdmin
    .from('client_users')
    .select('id')
    .eq('id', buyerId)
    .eq('panel_id', panelId)
    .single();

  if (!buyer) {
    return jsonResponse({ error: 'Invalid buyer' });
  }

  // Fetch ALL transaction types for this buyer
  const { data: transactions, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .or(`buyer_id.eq.${buyerId},user_id.eq.${buyerId}`)
    .eq('panel_id', panelId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching transactions:', error);
    return jsonResponse({ error: 'Failed to fetch transactions' });
  }

  return jsonResponse({ transactions: transactions || [] });
}

// Handle creating a chat session for buyer (bypasses RLS)
async function handleCreateChatSession(supabaseAdmin: any, body: any) {
  const { panelId, buyerId, buyerName, buyerEmail } = body;

  if (!buyerId || !panelId) {
    return jsonResponse({ error: 'Missing buyerId or panelId' });
  }

  // Verify buyer belongs to panel
  const { data: buyer } = await supabaseAdmin
    .from('client_users')
    .select('id')
    .eq('id', buyerId)
    .eq('panel_id', panelId)
    .single();

  if (!buyer) {
    return jsonResponse({ error: 'Invalid buyer' });
  }

  const { data: session, error } = await supabaseAdmin
    .from('chat_sessions')
    .insert({
      panel_id: panelId,
      visitor_id: buyerId,
      visitor_name: buyerName || buyerEmail || 'Buyer',
      visitor_email: buyerEmail || null,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create chat session:', error);
    return jsonResponse({ error: 'Failed to start chat session' });
  }

  return jsonResponse({ session });
}

// Handle sending a chat message for buyer (bypasses RLS)
async function handleSendChatMessage(supabaseAdmin: any, body: any) {
  const { sessionId, buyerId, content } = body;

  if (!sessionId || !buyerId || !content?.trim()) {
    return jsonResponse({ error: 'Missing sessionId, buyerId, or content' });
  }

  // Verify session belongs to buyer
  const { data: session } = await supabaseAdmin
    .from('chat_sessions')
    .select('id, visitor_id')
    .eq('id', sessionId)
    .eq('visitor_id', buyerId)
    .single();

  if (!session) {
    return jsonResponse({ error: 'Invalid session' });
  }

  const { data: message, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      sender_type: 'visitor',
      content: content.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to send chat message:', error);
    return jsonResponse({ error: 'Failed to send message' });
  }

  // Update last_message_at
  await supabaseAdmin
    .from('chat_sessions')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', sessionId);

  return jsonResponse({ message });
}

// Handle creating a support ticket for buyer (bypasses RLS)
async function handleCreateSupportTicket(supabaseAdmin: any, body: any) {
  const { panelId, buyerId, subject, message, senderName, senderEmail } = body;

  if (!panelId || !subject || !message) {
    return jsonResponse({ error: 'Missing required fields (panelId, subject, message)' });
  }

  const priority = body.priority || 'medium';

  const { data: ticket, error } = await supabaseAdmin
    .from('support_tickets')
    .insert({
      panel_id: panelId,
      user_id: null,
      buyer_id: buyerId || null,
      subject,
      status: 'open',
      priority,
      ticket_type: 'user_to_panel',
      messages: [{
        sender: 'buyer',
        content: message,
        timestamp: new Date().toISOString(),
        senderName: senderName || 'Guest',
        senderEmail: senderEmail || '',
      }],
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create support ticket:', error);
    return jsonResponse({ error: 'Failed to create support ticket' });
  }

  return jsonResponse({ ticket });
}

// ========= MFA HANDLER FUNCTIONS =========

async function getMfaUser(supabaseAdmin: any, body: any) {
  const { panelId, buyerId, token } = body;
  if (!buyerId || !panelId) return { error: 'Missing buyerId or panelId' };
  
  // Verify token
  if (token) {
    const v = await verifyJWT(token);
    if (!v.valid || v.payload?.sub !== buyerId) return { error: 'Invalid token' };
  }
  
  const { data: user } = await supabaseAdmin
    .from('client_users')
    .select('id, email, panel_id, mfa_secret, mfa_verified, mfa_backup_codes')
    .eq('id', buyerId)
    .eq('panel_id', panelId)
    .single();
  
  if (!user) return { error: 'User not found' };
  return { user };
}

async function handleMfaEnroll(supabaseAdmin: any, body: any) {
  const result = await getMfaUser(supabaseAdmin, body);
  if (result.error) return jsonResponse({ error: result.error });
  const user = result.user;

  const secretBytes = new Uint8Array(20);
  crypto.getRandomValues(secretBytes);
  const secret = base32Encode(secretBytes);
  const backupCodes = generateMfaBackupCodes();

  // Get panel name for issuer
  const { data: panel } = await supabaseAdmin
    .from('panels')
    .select('name')
    .eq('id', user.panel_id)
    .single();

  const issuer = panel?.name || 'SMM Panel';
  const otpauthUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

  await supabaseAdmin
    .from('client_users')
    .update({
      mfa_secret: secret,
      mfa_verified: false,
      mfa_backup_codes: backupCodes.map((c: string) => ({ code: c, used: false }))
    })
    .eq('id', user.id);

  return jsonResponse({ secret, otpauth_uri: otpauthUri, backup_codes: backupCodes });
}

async function handleMfaVerify(supabaseAdmin: any, body: any) {
  const { mfaToken } = body;
  const result = await getMfaUser(supabaseAdmin, body);
  if (result.error) return jsonResponse({ error: result.error });
  const user = result.user;

  if (!mfaToken || mfaToken.length !== 6) return jsonResponse({ error: 'Invalid token format' });
  if (!user.mfa_secret) return jsonResponse({ error: 'No MFA enrollment found' });

  const valid = await verifyTOTP(user.mfa_secret, mfaToken);
  if (!valid) return jsonResponse({ error: 'Invalid code. Please try again.' });

  await supabaseAdmin
    .from('client_users')
    .update({ mfa_verified: true })
    .eq('id', user.id);

  return jsonResponse({ success: true });
}

async function handleMfaValidate(supabaseAdmin: any, body: any) {
  const { mfaToken } = body;
  const result = await getMfaUser(supabaseAdmin, body);
  if (result.error) return jsonResponse({ error: result.error });
  const user = result.user;

  if (!user.mfa_verified || !user.mfa_secret) return jsonResponse({ error: 'MFA not enabled' });
  if (!mfaToken || mfaToken.length !== 6) return jsonResponse({ error: 'Invalid token format' });

  const valid = await verifyTOTP(user.mfa_secret, mfaToken);
  return jsonResponse({ valid });
}

async function handleMfaBackup(supabaseAdmin: any, body: any) {
  const { backupCode } = body;
  const result = await getMfaUser(supabaseAdmin, body);
  if (result.error) return jsonResponse({ error: result.error });
  const user = result.user;

  if (!user.mfa_verified || !user.mfa_secret) return jsonResponse({ error: 'MFA not enabled' });
  if (!backupCode) return jsonResponse({ error: 'Backup code required' });

  const codes = (user.mfa_backup_codes as any[]) || [];
  const idx = codes.findIndex((c: any) => c.code === backupCode.toUpperCase() && !c.used);
  if (idx === -1) return jsonResponse({ error: 'Invalid or already used backup code' });

  codes[idx].used = true;
  await supabaseAdmin
    .from('client_users')
    .update({ mfa_backup_codes: codes })
    .eq('id', user.id);

  return jsonResponse({ valid: true, remaining: codes.filter((c: any) => !c.used).length });
}

async function handleMfaDisable(supabaseAdmin: any, body: any) {
  const result = await getMfaUser(supabaseAdmin, body);
  if (result.error) return jsonResponse({ error: result.error });

  await supabaseAdmin
    .from('client_users')
    .update({ mfa_secret: null, mfa_verified: false, mfa_backup_codes: [] })
    .eq('id', result.user.id);

  return jsonResponse({ success: true });
}

async function handleMfaStatus(supabaseAdmin: any, body: any) {
  const result = await getMfaUser(supabaseAdmin, body);
  if (result.error) return jsonResponse({ error: result.error });
  const user = result.user;

  return jsonResponse({
    enabled: user.mfa_verified === true,
    has_secret: !!user.mfa_secret,
    backup_codes_remaining: ((user.mfa_backup_codes as any[]) || []).filter((c: any) => !c.used).length
  });
}

// Handle listing tickets for a buyer (bypasses RLS)
async function handleListTickets(supabaseAdmin: any, body: any) {
  const { panelId, buyerId } = body;
  if (!panelId || !buyerId) {
    return jsonResponse({ error: 'Missing panelId or buyerId' });
  }

  const { data: tickets, error } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .eq('panel_id', panelId)
    .eq('buyer_id', buyerId)
    .eq('ticket_type', 'user_to_panel')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to list tickets:', error);
    return jsonResponse({ tickets: [] });
  }

  return jsonResponse({ tickets: tickets || [] });
}

// Handle listing chat sessions for a buyer (bypasses RLS)
async function handleListChatSessions(supabaseAdmin: any, body: any) {
  const { panelId, buyerId } = body;
  if (!panelId || !buyerId) {
    return jsonResponse({ sessions: [] });
  }

  const { data: sessions, error } = await supabaseAdmin
    .from('chat_sessions')
    .select('*')
    .eq('panel_id', panelId)
    .eq('visitor_id', buyerId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) {
    console.error('Failed to list chat sessions:', error);
    return jsonResponse({ sessions: [] });
  }

  return jsonResponse({ sessions: sessions || [] });
}

// Handle listing chat messages for a session (bypasses RLS)
async function handleListChatMessages(supabaseAdmin: any, body: any) {
  const { sessionId, buyerId } = body;
  if (!sessionId || !buyerId) {
    return jsonResponse({ messages: [] });
  }

  // Verify session belongs to buyer
  const { data: session } = await supabaseAdmin
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('visitor_id', buyerId)
    .single();

  if (!session) {
    return jsonResponse({ error: 'Invalid session', messages: [] });
  }

  const { data: messages, error } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to list chat messages:', error);
    return jsonResponse({ messages: [] });
  }

  return jsonResponse({ messages: messages || [] });
}

// Handle reply to ticket (buyer appends message)
async function handleReplyTicket(supabaseAdmin: any, body: any) {
  const { buyerId, ticketId, content } = body;
  if (!buyerId || !ticketId || !content) {
    return jsonResponse({ error: 'Missing required fields' });
  }

  // Fetch current ticket - check both buyer_id and user_id for backwards compatibility
  const { data: ticket, error: fetchErr } = await supabaseAdmin
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('buyer_id', buyerId)
    .single();

  if (fetchErr || !ticket) {
    return jsonResponse({ error: 'Ticket not found' });
  }

  const newMsg = { sender: 'buyer', content, timestamp: new Date().toISOString() };
  const updatedMessages = [...(ticket.messages || []), newMsg];

  const { error: updateErr } = await supabaseAdmin
    .from('support_tickets')
    .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
    .eq('id', ticketId);

  if (updateErr) {
    console.error('Failed to reply to ticket:', updateErr);
    return jsonResponse({ error: 'Failed to send reply' });
  }

  return jsonResponse({ success: true, messages: updatedMessages });
}

// Handle close ticket
async function handleCloseTicket(supabaseAdmin: any, body: any) {
  const { buyerId, ticketId } = body;
  if (!buyerId || !ticketId) {
    return jsonResponse({ error: 'Missing required fields' });
  }

  const { error } = await supabaseAdmin
    .from('support_tickets')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .eq('buyer_id', buyerId);

  if (error) {
    console.error('Failed to close ticket:', error);
    return jsonResponse({ error: 'Failed to close ticket' });
  }

  return jsonResponse({ success: true });
}

// Handle end chat session
async function handleEndChat(supabaseAdmin: any, body: any) {
  const { buyerId, sessionId } = body;
  if (!buyerId || !sessionId) {
    return jsonResponse({ error: 'Missing required fields' });
  }

  const { error } = await supabaseAdmin
    .from('chat_sessions')
    .update({ status: 'closed', updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('visitor_id', buyerId);

  if (error) {
    console.error('Failed to end chat:', error);
    return jsonResponse({ error: 'Failed to end conversation' });
  }

  return jsonResponse({ success: true });
}

// Handle rate chat session
async function handleRateChat(supabaseAdmin: any, body: any) {
  const { buyerId, sessionId, rating } = body;
  if (!buyerId || !sessionId || !rating) {
    return jsonResponse({ error: 'Missing required fields' });
  }

  if (rating < 1 || rating > 5) {
    return jsonResponse({ error: 'Rating must be between 1 and 5' });
  }

  const { error } = await supabaseAdmin
    .from('chat_sessions')
    .update({ rating, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('visitor_id', buyerId);

  if (error) {
    console.error('Failed to rate chat:', error);
    return jsonResponse({ error: 'Failed to submit rating' });
  }

  return jsonResponse({ success: true });
}

// Handle AI chat message — saves user msg, gets AI reply, saves AI reply, returns both
async function handleSendAIChatMessage(supabaseAdmin: any, body: any) {
  const { sessionId, buyerId, content, panelId } = body;

  if (!sessionId || !buyerId || !content?.trim()) {
    return jsonResponse({ error: 'Missing sessionId, buyerId, or content' });
  }

  // Verify session belongs to buyer
  const { data: session } = await supabaseAdmin
    .from('chat_sessions')
    .select('id, visitor_id, panel_id')
    .eq('id', sessionId)
    .eq('visitor_id', buyerId)
    .single();

  if (!session) {
    return jsonResponse({ error: 'Invalid session' });
  }

  // 1. Save user message as 'visitor'
  const { data: userMsg, error: userErr } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      sender_type: 'visitor',
      content: content.trim(),
    })
    .select()
    .single();

  if (userErr) {
    console.error('Failed to save user AI message:', userErr);
    return jsonResponse({ error: 'Failed to send message' });
  }

  // Update last_message_at
  await supabaseAdmin
    .from('chat_sessions')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', sessionId);

  // 2. Get panel info for AI context
  const { data: panel } = await supabaseAdmin
    .from('panels')
    .select('name')
    .eq('id', session.panel_id)
    .single();

  // 3. Fetch recent conversation history for context
  const { data: recentMsgs } = await supabaseAdmin
    .from('chat_messages')
    .select('sender_type, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(10);

  const conversationHistory = (recentMsgs || []).reverse().map((m: any) => ({
    role: m.sender_type === 'visitor' ? 'user' : 'assistant',
    content: m.content,
  }));

  // 4. Call AI chat reply edge function
  let aiReplyText = "I'm sorry, I couldn't generate a response right now. A human agent will assist you shortly.";
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat-reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        message: content.trim(),
        pageContext: 'Live Chat Support',
        panelInfo: { name: panel?.name || 'SMM Panel' },
        conversationHistory,
      }),
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      if (aiData.reply) {
        aiReplyText = aiData.reply;
      }
    }
  } catch (err) {
    console.error('AI reply error:', err);
  }

  // 5. Save AI reply as 'ai' sender_type
  const { data: aiMsg, error: aiErr } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      sender_type: 'ai',
      content: aiReplyText,
    })
    .select()
    .single();

  if (aiErr) {
    console.error('Failed to save AI reply:', aiErr);
  }

  return jsonResponse({ 
    userMessage: userMsg,
    aiMessage: aiMsg || { id: `ai-fallback-${Date.now()}`, session_id: sessionId, sender_type: 'ai', content: aiReplyText, created_at: new Date().toISOString() },
  });
}
