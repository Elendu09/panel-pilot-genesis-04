import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BalanceRequest {
  providerId: string;
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const rateLimitKey = `${claims.user.id}:${providerId}`;
    if (!checkRateLimit(rateLimitKey)) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

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

    const { data: provider, error: providerError } = await supabaseAdmin
      .from('providers')
      .select('id, api_endpoint, api_key, panel_id, currency, currency_rate_to_usd')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ success: false, error: "Provider not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const providerCurrency = provider.currency || 'USD';
    const rateToUsd = provider.currency_rate_to_usd || 1.0;

    console.log(`Fetching balance for provider: ${providerId} (currency: ${providerCurrency}, rate: ${rateToUsd})`);

    // Validate API endpoint
    let apiUrl: URL;
    try {
      apiUrl = new URL(provider.api_endpoint);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid provider API endpoint URL" }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try POST first (most SMM panels use POST), then GET as fallback
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response | null = null;
    let lastError: string | null = null;

    // Method 1: POST with form data (standard SMM panel format)
    try {
      const formData = new URLSearchParams();
      formData.append('key', provider.api_key);
      formData.append('action', 'balance');

      response = await fetch(provider.api_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'SMM-Panel/2.0',
          'Accept': 'application/json',
        },
        body: formData,
        signal: controller.signal,
      });
    } catch (postErr: unknown) {
      lastError = (postErr as Error).message;
      console.log('POST failed, trying GET fallback...');
    }

    // Method 2: GET with query params (fallback for some providers)
    if (!response || !response.ok) {
      try {
        const getUrl = new URL(provider.api_endpoint);
        getUrl.searchParams.set('key', provider.api_key);
        getUrl.searchParams.set('action', 'balance');

        response = await fetch(getUrl.toString(), {
          method: 'GET',
          headers: {
            'User-Agent': 'SMM-Panel/2.0',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
      } catch (getErr: unknown) {
        clearTimeout(timeout);
        const errMsg = lastError || (getErr as Error).message;
        
        if ((getErr as Error).name === 'AbortError') {
          return new Response(
            JSON.stringify({ success: false, error: "Provider API timed out after 15 seconds" }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: false, error: `Network error: ${errMsg}` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    clearTimeout(timeout);

    if (!response || !response.ok) {
      const status = response?.status || 'unknown';
      console.error(`Provider API returned status: ${status}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Provider API returned status ${status}. Check the API endpoint URL is correct.` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse response with fallback for malformed JSON
    const responseText = await response.text();
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch {
      // Try cleaning malformed JSON
      const cleaned = responseText
        .trim()
        .replace(/^\uFEFF/, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      try {
        data = JSON.parse(cleaned);
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid JSON response from provider" }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for error response first
    if (data.error) {
      return new Response(
        JSON.stringify({ success: false, error: `Provider error: ${data.error}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different response formats from various SMM providers
    let originalBalance: number | undefined;

    if (typeof data.balance !== 'undefined') {
      originalBalance = parseFloat(data.balance);
    } else if (typeof data.funds !== 'undefined') {
      originalBalance = parseFloat(data.funds);
    } else if (typeof data.credit !== 'undefined') {
      originalBalance = parseFloat(data.credit);
    }

    if (originalBalance !== undefined && !isNaN(originalBalance)) {
      const balanceUsd = originalBalance * rateToUsd;
      
      console.log(`Original balance: ${originalBalance} ${providerCurrency}, USD equivalent: $${balanceUsd.toFixed(4)}`);

      // Update provider balance in database
      await supabaseAdmin
        .from('providers')
        .update({ 
          balance: balanceUsd, 
          sync_status: 'synced',
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', providerId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          balance: balanceUsd,
          originalBalance: originalBalance,
          currency: providerCurrency,
          rateToUsd: rateToUsd
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

  } catch (error: unknown) {
    console.error("Error fetching provider balance:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message || "Failed to fetch balance" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
