import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PBKDF2-based password hashing using Web Crypto API
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
  
  const hashArray = new Uint8Array(derivedBits);
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...hashArray));
  
  return `$pbkdf2$${iterations}$${saltB64}$${hashB64}`;
}

function jsonResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, panelId, customer } = body;

    console.log(`Panel customers request: action=${action}, panelId=${panelId}`);

    if (!panelId) {
      return jsonResponse({ error: 'Panel ID is required' }, 400);
    }

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verify the request comes from an authenticated panel owner
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Authorization required' }, 401);
    }

    // Create a regular client to verify the user's session
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } }
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    // Verify user owns this panel
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return jsonResponse({ error: 'Profile not found' }, 403);
    }

    const { data: panel } = await supabaseAdmin
      .from('panels')
      .select('id, owner_id')
      .eq('id', panelId)
      .single();

    if (!panel || panel.owner_id !== profile.id) {
      return jsonResponse({ error: 'You do not have permission to manage this panel' }, 403);
    }

    // Handle different actions
    switch (action) {
      case 'create':
        return await createCustomer(supabaseAdmin, panelId, customer);
      default:
        return jsonResponse({ error: 'Invalid action' }, 400);
    }
  } catch (error: unknown) {
    console.error('Panel customers error:', error);
    return jsonResponse({ error: (error as Error).message || 'Internal server error' }, 500);
  }
});

async function createCustomer(supabaseAdmin: any, panelId: string, customer: any) {
  const { email, fullName, username, password, balance, status } = customer;

  // Validate required fields
  if (!email) {
    return jsonResponse({ error: 'Email is required' }, 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return jsonResponse({ error: 'Invalid email format' }, 400);
  }

  // Check if email already exists for this panel
  const { data: existingEmail } = await supabaseAdmin
    .from('client_users')
    .select('id')
    .eq('panel_id', panelId)
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (existingEmail) {
    return jsonResponse({ error: 'A customer with this email already exists' }, 400);
  }

  // Check if username exists (if provided)
  if (username) {
    const { data: existingUsername } = await supabaseAdmin
      .from('client_users')
      .select('id')
      .eq('panel_id', panelId)
      .ilike('username', username.trim())
      .maybeSingle();

    if (existingUsername) {
      return jsonResponse({ error: 'A customer with this username already exists' }, 400);
    }
  }

  // Hash password if provided - store in password_temp with expiry (main password_hash stays null)
  let passwordHash = null;
  let passwordTemp = null;
  let passwordTempExpiresAt = null;
  if (password && password.length >= 6) {
    // If this is a new customer creation, set as main password_hash
    passwordHash = await hashPassword(password);
  }

  // Insert the customer
  const { data: newCustomer, error: insertError } = await supabaseAdmin
    .from('client_users')
    .insert({
      panel_id: panelId,
      email: email.trim().toLowerCase(),
      full_name: fullName?.trim() || null,
      username: username?.trim() || null,
      password_hash: passwordHash,
      balance: parseFloat(balance) || 0,
      is_active: status === 'active',
      is_banned: false,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Insert error:', insertError);
    
    // Handle unique constraint violations
    if (insertError.code === '23505') {
      if (insertError.message?.includes('email')) {
        return jsonResponse({ error: 'A customer with this email already exists' }, 400);
      }
      if (insertError.message?.includes('username')) {
        return jsonResponse({ error: 'A customer with this username already exists' }, 400);
      }
    }
    
    return jsonResponse({ error: 'Failed to create customer: ' + insertError.message }, 500);
  }

  console.log('Customer created successfully:', newCustomer.id);

  // Return customer without sensitive fields
  const { password_hash, password_temp, ...safeCustomer } = newCustomer;
  
  return jsonResponse({ 
    success: true, 
    customer: safeCustomer 
  });
}
