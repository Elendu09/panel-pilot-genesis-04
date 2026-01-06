import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BalanceRequest {
  providerId: string; // ID of provider in database - credentials fetched securely
}

interface BalanceResponse {
  success: boolean;
  balance?: number;
  currency?: string;
  error?: string;
}

// Rate limiting
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  record.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !claims?.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { providerId }: BalanceRequest = await req.json();

    if (!providerId) {
      return new Response(
        JSON.stringify({ success: false, error: "Provider ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit per user+provider
    const rateLimitKey = `${claims.user.id}:${providerId}`;
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client to fetch provider credentials
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Get the user's profile to find their panel
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', claims.user.id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ success: false, error: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch provider credentials from database - verify ownership
    const { data: provider, error: providerError } = await supabaseAdmin
      .from('providers')
      .select('id, api_endpoint, api_key, panel_id')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ success: false, error: "Provider not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user owns the panel this provider belongs to
    const { data: panel } = await supabaseAdmin
      .from('panels')
      .select('owner_id')
      .eq('id', provider.panel_id)
      .single();

    if (!panel || panel.owner_id !== profile.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching balance for provider: ${providerId} by user ${claims.user.id}`);

    // SMM Panel standard API format for balance check
    const formData = new URLSearchParams();
    formData.append('key', provider.api_key);
    formData.append('action', 'balance');

    const response = await fetch(provider.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      console.error(`Provider API returned status: ${response.status}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Provider API returned status ${response.status}` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log("Provider response received");

    // Handle different response formats from various SMM providers
    let balance: number | undefined;
    let currency = "USD";

    if (typeof data.balance !== 'undefined') {
      balance = parseFloat(data.balance);
    } else if (typeof data.funds !== 'undefined') {
      balance = parseFloat(data.funds);
    } else if (typeof data.credit !== 'undefined') {
      balance = parseFloat(data.credit);
    }

    if (data.currency) {
      currency = data.currency;
    }

    if (balance !== undefined && !isNaN(balance)) {
      // Update provider balance in database
      await supabaseAdmin
        .from('providers')
        .update({ balance, updated_at: new Date().toISOString() })
        .eq('id', providerId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          balance,
          currency
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for error response
    if (data.error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.error 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Could not parse balance from provider response" 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error fetching provider balance:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to fetch balance" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
