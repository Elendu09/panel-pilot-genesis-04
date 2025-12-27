import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to return JSON response - ALWAYS use 200 status to avoid "service unavailable" errors
// Error details are in the response body
function jsonResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
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
        return await handleLogin(supabaseAdmin, body);
      case 'fetch':
        return await handleFetch(supabaseAdmin, body);
      case 'signup':
        return await handleSignup(supabaseAdmin, body);
      case 'guest-order':
        return await handleGuestOrder(supabaseAdmin, body);
      default:
        return jsonResponse({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Buyer auth error:', error);
    return jsonResponse({ error: error.message || 'Authentication failed' });
  }
});

// Handle login action
async function handleLogin(supabaseAdmin: any, body: any) {
  const { panelId, identifier, password } = body;
  
  console.log(`Login attempt: identifier=${identifier}`);

  if (!identifier || !password) {
    return jsonResponse({ error: 'Email/username and password are required' });
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

  // Verify password (check both password_temp and password_hash)
  const passwordMatch = user.password_temp === password || user.password_hash === password;
  
  if (!passwordMatch) {
    console.log('Password mismatch for user:', user.id);
    return jsonResponse({ error: 'Incorrect password. Please try again.' });
  }

  // Update last login timestamp
  await supabaseAdmin
    .from('client_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);

  console.log('Login successful for user:', user.id);

  // Return user data (exclude sensitive fields)
  const { password_hash, password_temp, ...safeUser } = user;
  
  return jsonResponse({ 
    success: true, 
    user: safeUser 
  });
}

// Handle fetch action (session restoration)
async function handleFetch(supabaseAdmin: any, body: any) {
  const { panelId, buyerId } = body;
  
  console.log(`Fetch buyer: buyerId=${buyerId}, panelId=${panelId}`);

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

// Handle signup action
async function handleSignup(supabaseAdmin: any, body: any) {
  const { panelId, email, password, fullName, username, referralCode } = body;
  
  console.log(`Signup attempt: email=${email}, panelId=${panelId}`);

  if (!email || !password) {
    return jsonResponse({ error: 'Email and password are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!emailRegex.test(normalizedEmail)) {
    return jsonResponse({ error: 'Invalid email format' });
  }

  if (password.length < 6) {
    return jsonResponse({ error: 'Password must be at least 6 characters' });
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

  // Create new buyer account
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('client_users')
    .insert({
      email: normalizedEmail,
      full_name: fullName?.trim() || null,
      username: username?.trim() || null,
      password_temp: password,
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

  // Return user data (exclude sensitive fields)
  const { password_hash, password_temp, ...safeUser } = newUser;
  
  return jsonResponse({ 
    success: true, 
    user: safeUser 
  });
}

// Handle guest order - creates account and prepares for order
async function handleGuestOrder(supabaseAdmin: any, body: any) {
  const { panelId, email, fullName } = body;
  
  console.log(`Guest order attempt: email=${email}, panelId=${panelId}`);

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

  // Create new buyer account
  const { data: newUser, error: insertError } = await supabaseAdmin
    .from('client_users')
    .insert({
      email: normalizedEmail,
      full_name: fullName?.trim() || null,
      password_temp: tempPassword,
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

  // Return user data with temp password (so user knows their password)
  const { password_hash, ...safeUser } = newUser;
  
  return jsonResponse({ 
    success: true, 
    user: { ...safeUser, password_temp: undefined },
    tempPassword: tempPassword,
    isNewAccount: true,
    message: 'Account created! Add funds to place your order.'
  });
}

// Generate a user-friendly temporary password
function generateTempPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
