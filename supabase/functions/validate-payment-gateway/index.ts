import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  gateway: 'stripe' | 'paypal' | 'coinbase';
  apiKey: string;
  secretKey?: string;
}

interface ValidationResponse {
  success: boolean;
  message: string;
  accountName?: string;
  mode?: 'test' | 'live';
  error?: string;
}

// Validate Stripe API key
async function validateStripe(apiKey: string): Promise<ValidationResponse> {
  try {
    const response = await fetch('https://api.stripe.com/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const isTestMode = apiKey.startsWith('sk_test_') || apiKey.startsWith('pk_test_');
      return {
        success: true,
        message: 'Stripe API key is valid',
        accountName: data.business_profile?.name || data.email || 'Stripe Account',
        mode: isTestMode ? 'test' : 'live',
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: 'Invalid Stripe API key',
        error: errorData.error?.message || 'Authentication failed',
      };
    }
  } catch (error) {
    console.error('Stripe validation error:', error);
    return {
      success: false,
      message: 'Failed to connect to Stripe',
      error: error.message,
    };
  }
}

// Validate PayPal API credentials
async function validatePayPal(clientId: string, clientSecret: string): Promise<ValidationResponse> {
  try {
    // Detect sandbox or live based on client ID pattern
    const isSandbox = clientId.startsWith('sb-') || clientId.includes('sandbox');
    const baseUrl = isSandbox 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    const credentials = btoa(`${clientId}:${clientSecret}`);
    
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'PayPal credentials are valid',
        accountName: data.app_id || 'PayPal Account',
        mode: isSandbox ? 'test' : 'live',
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: 'Invalid PayPal credentials',
        error: errorData.error_description || 'Authentication failed',
      };
    }
  } catch (error) {
    console.error('PayPal validation error:', error);
    return {
      success: false,
      message: 'Failed to connect to PayPal',
      error: error.message,
    };
  }
}

// Validate Coinbase Commerce API key
async function validateCoinbase(apiKey: string): Promise<ValidationResponse> {
  try {
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'GET',
      headers: {
        'X-CC-Api-Key': apiKey,
        'X-CC-Version': '2018-03-22',
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Coinbase Commerce API key is valid',
        accountName: 'Coinbase Commerce',
        mode: 'live', // Coinbase Commerce doesn't have a sandbox
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: 'Invalid Coinbase Commerce API key',
        error: errorData.error?.message || 'Authentication failed',
      };
    }
  } catch (error) {
    console.error('Coinbase validation error:', error);
    return {
      success: false,
      message: 'Failed to connect to Coinbase Commerce',
      error: error.message,
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gateway, apiKey, secretKey }: ValidationRequest = await req.json();

    console.log(`Validating ${gateway} gateway...`);

    if (!gateway || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Gateway and API key are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let result: ValidationResponse;

    switch (gateway) {
      case 'stripe':
        result = await validateStripe(apiKey);
        break;
      case 'paypal':
        if (!secretKey) {
          return new Response(
            JSON.stringify({ success: false, message: 'PayPal requires both Client ID and Secret' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        result = await validatePayPal(apiKey, secretKey);
        break;
      case 'coinbase':
        result = await validateCoinbase(apiKey);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, message: `Unsupported gateway: ${gateway}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }

    console.log(`Validation result for ${gateway}:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error', error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
