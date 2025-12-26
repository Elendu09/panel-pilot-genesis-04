import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      return new Response(
        JSON.stringify({ error: 'Missing panel ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Buyer auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Authentication failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Handle login action
async function handleLogin(supabaseAdmin: any, body: any) {
  const { panelId, identifier, password } = body;
  
  console.log(`Login attempt: identifier=${identifier}`);

  if (!identifier || !password) {
    return new Response(
      JSON.stringify({ error: 'Email/username and password are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
    return new Response(
      JSON.stringify({ error: 'Database error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!users || users.length === 0) {
    console.log('No user found with identifier:', normalizedIdentifier);
    return new Response(
      JSON.stringify({ error: 'No account found with this email or username' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const user = users[0];

  // Check if user is banned
  if (user.is_banned) {
    console.log('User is banned:', user.id);
    return new Response(
      JSON.stringify({ 
        error: 'Your account has been banned',
        reason: user.ban_reason || 'Contact support for more information'
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check if user is suspended (inactive)
  if (!user.is_active) {
    console.log('User is suspended:', user.id);
    return new Response(
      JSON.stringify({ error: 'Your account has been suspended. Please contact support.' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify password (check both password_temp and password_hash)
  const passwordMatch = user.password_temp === password || user.password_hash === password;
  
  if (!passwordMatch) {
    console.log('Password mismatch for user:', user.id);
    return new Response(
      JSON.stringify({ error: 'Incorrect password. Please try again.' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Update last login timestamp
  await supabaseAdmin
    .from('client_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);

  console.log('Login successful for user:', user.id);

  // Return user data (exclude sensitive fields)
  const { password_hash, password_temp, ...safeUser } = user;
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      user: safeUser 
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handle fetch action (session restoration)
async function handleFetch(supabaseAdmin: any, body: any) {
  const { panelId, buyerId } = body;
  
  console.log(`Fetch buyer: buyerId=${buyerId}, panelId=${panelId}`);

  if (!buyerId) {
    return new Response(
      JSON.stringify({ error: 'Buyer ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Fetch buyer by ID
  const { data: user, error: queryError } = await supabaseAdmin
    .from('client_users')
    .select('*')
    .eq('id', buyerId)
    .eq('panel_id', panelId)
    .single();

  if (queryError || !user) {
    console.log('No user found with id:', buyerId);
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check if user is banned
  if (user.is_banned) {
    console.log('User is banned:', user.id);
    return new Response(
      JSON.stringify({ 
        error: 'Your account has been banned',
        reason: user.ban_reason || 'Contact support for more information'
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check if user is suspended (inactive)
  if (!user.is_active) {
    console.log('User is suspended:', user.id);
    return new Response(
      JSON.stringify({ error: 'Your account has been suspended. Please contact support.' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Fetch successful for user:', user.id);

  // Return user data (exclude sensitive fields)
  const { password_hash, password_temp, ...safeUser } = user;
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      user: safeUser 
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handle signup action
async function handleSignup(supabaseAdmin: any, body: any) {
  const { panelId, email, password, fullName, username } = body;
  
  console.log(`Signup attempt: email=${email}, panelId=${panelId}`);

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email and password are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!emailRegex.test(normalizedEmail)) {
    return new Response(
      JSON.stringify({ error: 'Invalid email format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (password.length < 6) {
    return new Response(
      JSON.stringify({ error: 'Password must be at least 6 characters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check if email already exists for this panel
  const { data: existingEmail } = await supabaseAdmin
    .from('client_users')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('panel_id', panelId)
    .single();

  if (existingEmail) {
    return new Response(
      JSON.stringify({ error: 'Email already registered' }),
      { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check if username exists (if provided)
  if (username) {
    const normalizedUsername = username.trim().toLowerCase();
    const { data: existingUsername } = await supabaseAdmin
      .from('client_users')
      .select('id')
      .ilike('username', normalizedUsername)
      .eq('panel_id', panelId)
      .single();

    if (existingUsername) {
      return new Response(
        JSON.stringify({ error: 'Username already taken' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    })
    .select()
    .single();

  if (insertError) {
    console.error('Signup error:', insertError);
    return new Response(
      JSON.stringify({ error: insertError.message || 'Registration failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Signup successful for user:', newUser.id);

  // Return user data (exclude sensitive fields)
  const { password_hash, password_temp, ...safeUser } = newUser;
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      user: safeUser 
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
