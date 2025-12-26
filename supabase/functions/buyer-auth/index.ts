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
    const { panelId, identifier, password, action } = await req.json();
    
    console.log(`Buyer auth request: action=${action}, panelId=${panelId}, identifier=${identifier}`);

    if (!panelId || !identifier || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

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

  } catch (error) {
    console.error('Buyer auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Authentication failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
