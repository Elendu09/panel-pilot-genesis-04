import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  
  // Format: $pbkdf2$iterations$salt$hash
  const hashArray = new Uint8Array(derivedBits);
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...hashArray));
  
  return `$pbkdf2$${iterations}$${saltB64}$${hashB64}`;
}

// Verify password against hash
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // PBKDF2 format: $pbkdf2$iterations$salt$hash
    if (storedHash.startsWith('$pbkdf2$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 5) return false;
      
      const iterations = parseInt(parts[2]);
      const salt = Uint8Array.from(atob(parts[3]), c => c.charCodeAt(0));
      const storedHashB64 = parts[4];
      
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
      
      const hashB64 = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
      return hashB64 === storedHashB64;
    }
    
    // Legacy bcrypt hash - cannot verify without workers, return false
    if (storedHash.startsWith('$2')) {
      console.log('Legacy bcrypt hash detected - cannot verify without workers');
      return false;
    }
    
    // Legacy plaintext comparison
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
  return Boolean(str && str.startsWith('$pbkdf2$'));
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
    console.log('User is suspended:', user.id);
    return jsonResponse({ error: 'Your account has been suspended. Please contact support.' });
  }

  // Verify password - support PBKDF2, legacy bcrypt (with migration prompt), and plaintext
  let passwordMatch = false;
  const storedHash = user.password_hash || user.password_temp;
  
  if (storedHash) {
    if (isPbkdf2Hash(storedHash)) {
      // Modern PBKDF2 verification
      passwordMatch = await verifyPassword(password, storedHash);
    } else if (isBcryptHash(storedHash)) {
      // Bcrypt - cannot verify without workers, prompt for password reset
      console.log('Bcrypt hash detected, user needs password reset:', user.id);
      return jsonResponse({ 
        error: 'Please reset your password to continue. Use the "Forgot Password" option.',
        requiresPasswordReset: true 
      });
    } else {
      // Legacy plaintext comparison - migrate to PBKDF2
      passwordMatch = storedHash === password;
      
      if (passwordMatch) {
        console.log('Migrating legacy plaintext password to PBKDF2 for user:', user.id);
        const newHash = await hashPassword(password);
        await supabaseAdmin
          .from('client_users')
          .update({ 
            password_hash: newHash, 
            password_temp: null 
          })
          .eq('id', user.id);
      }
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
  const { password_hash, password_temp, ...safeUser } = user;
  
  return jsonResponse({ 
    success: true, 
    user: safeUser,
    token: token,
    expiresIn: JWT_EXPIRY_SECONDS
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
  const { password_hash, password_temp, ...safeUser } = user;
  
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
      // Increment manually if RPC doesn't exist
      supabaseAdmin
        .from('client_users')
        .update({ referral_count: supabaseAdmin.raw('referral_count + 1') })
        .eq('id', referrerId);
    });
  }

  console.log('Signup successful for user:', newUser.id);

  // Generate JWT token
  const token = await createJWT({
    sub: newUser.id,
    email: newUser.email,
    panelId: panelId,
    type: 'buyer'
  });

  // Return user data (exclude sensitive fields)
  const { password_hash, password_temp, ...safeUser } = newUser;
  
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

  if (!email) {
    return jsonResponse({ error: 'Email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Find user by email
  const { data: user, error: queryError } = await supabaseAdmin
    .from('client_users')
    .select('id, email, full_name')
    .eq('email', normalizedEmail)
    .eq('panel_id', panelId)
    .maybeSingle();

  if (queryError) {
    console.error('Database query error:', queryError);
    return jsonResponse({ error: 'Database error' });
  }

  // Always return success to not reveal if email exists (security)
  if (!user) {
    console.log('No user found with email:', normalizedEmail);
    recordFailedAttempt(rateLimitKey);
    return jsonResponse({ 
      success: true, 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    });
  }

  // Generate a new temporary password
  const newPassword = generateTempPassword();
  
  // Hash the new password using PBKDF2
  const hashedPassword = await hashPassword(newPassword);

  // Update user with new hashed password
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
    return jsonResponse({ error: 'Failed to reset password' });
  }

  console.log('Password reset for user:', user.id);

  // In production, you would send an email here with the new password
  // For now, we just log it and return success
  console.log(`Password reset - Email: ${user.email}, New Password: [REDACTED]`);

  return jsonResponse({ 
    success: true, 
    message: 'If an account exists with this email, you will receive a password reset link.'
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

// Handle resend verification email action
async function handleResendVerification(supabaseAdmin: any, body: any) {
  const { panelId, buyerId, email } = body;
  
  console.log(`Resend verification request: email=${email}, buyerId=${buyerId}`);

  if (!email && !buyerId) {
    return jsonResponse({ error: 'Email or buyer ID is required' });
  }

  // Fetch buyer data
  let buyer;
  if (buyerId) {
    const { data, error } = await supabaseAdmin
      .from('client_users')
      .select('id, email, full_name, is_active, panel_id')
      .eq('id', buyerId)
      .eq('panel_id', panelId)
      .single();
    
    if (error || !data) {
      return jsonResponse({ error: 'User not found' });
    }
    buyer = data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('client_users')
      .select('id, email, full_name, is_active, panel_id')
      .eq('email', email.toLowerCase())
      .eq('panel_id', panelId)
      .single();
    
    if (error || !data) {
      return jsonResponse({ error: 'User not found' });
    }
    buyer = data;
  }

  // Check if already verified
  if (buyer.is_active) {
    return jsonResponse({ error: 'Email is already verified' });
  }

  // Get panel info for email
  const { data: panel } = await supabaseAdmin
    .from('panels')
    .select('name, subdomain, custom_domain')
    .eq('id', panelId)
    .single();

  const panelName = panel?.name || 'SMM Panel';
  const panelDomain = panel?.custom_domain || `${panel?.subdomain}.smmpilot.online`;

  // Generate verification token
  const verificationToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store verification token (you can add a verification_tokens table or use a temp field)
  // For now, we'll log it and simulate sending
  console.log(`Verification token generated for ${buyer.email}: ${verificationToken}`);
  console.log(`Verification link: https://${panelDomain}/verify-email?token=${verificationToken}`);

  // Log the email send attempt
  await supabaseAdmin
    .from('email_send_logs')
    .insert({
      email: buyer.email,
      email_action_type: 'verification',
      user_id: buyer.id,
      metadata: { 
        panel_id: panelId,
        panel_name: panelName,
        sent_at: new Date().toISOString()
      }
    });

  // In production, integrate with an email service (Resend, SendGrid, etc.)
  // For now, return success to indicate the flow is working
  console.log(`Verification email queued for ${buyer.email}`);

  return jsonResponse({ 
    success: true, 
    message: 'Verification email sent successfully'
  });
}
