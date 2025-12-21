import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BalanceRequest {
  api_endpoint: string;
  api_key: string;
}

interface BalanceResponse {
  success: boolean;
  balance?: number;
  currency?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { api_endpoint, api_key }: BalanceRequest = await req.json();

    if (!api_endpoint || !api_key) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing api_endpoint or api_key" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching balance from: ${api_endpoint}`);

    // SMM Panel standard API format for balance check
    const formData = new URLSearchParams();
    formData.append('key', api_key);
    formData.append('action', 'balance');

    const response = await fetch(api_endpoint, {
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
    console.log("Provider response:", JSON.stringify(data));

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
