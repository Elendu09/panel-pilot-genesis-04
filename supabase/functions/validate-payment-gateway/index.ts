import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  gateway: string;
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
  } catch (error: unknown) {
    console.error('Stripe validation error:', error);
    return {
      success: false,
      message: 'Failed to connect to Stripe',
      error: (error as Error).message,
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
  } catch (error: unknown) {
    console.error('PayPal validation error:', error);
    return {
      success: false,
      message: 'Failed to connect to PayPal',
      error: (error as Error).message,
    };
  }
}

// Validate Coinbase Commerce API key
async function validateCoinbase(apiKey: string): Promise<ValidationResponse> {
  try {
    // Try /checkouts first (newer), then fallback to /charges
    const headers = {
      'X-CC-Api-Key': apiKey,
      'X-CC-Version': '2018-03-22',
    };

    let response = await fetch('https://api.commerce.coinbase.com/checkouts', {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Fallback to /charges
      response = await fetch('https://api.commerce.coinbase.com/charges', {
        method: 'GET',
        headers,
      });
    }

    if (response.ok) {
      return {
        success: true,
        message: 'Coinbase Commerce API key is valid',
        accountName: 'Coinbase Commerce',
        mode: 'live',
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: 'Invalid Coinbase Commerce API key',
        error: errorData.error?.message || errorData.message || 'Authentication failed',
      };
    }
  } catch (error: unknown) {
    console.error('Coinbase validation error:', error);
    return {
      success: false,
      message: 'Failed to connect to Coinbase Commerce',
      error: (error as Error).message,
    };
  }
}

// Validate Flutterwave API key
async function validateFlutterwave(secretKey: string): Promise<ValidationResponse> {
  try {
    const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Flutterwave API key is valid',
        accountName: 'Flutterwave',
        mode: secretKey.includes('test') ? 'test' : 'live',
      };
    } else {
      return {
        success: false,
        message: 'Invalid Flutterwave API key',
        error: 'Authentication failed',
      };
    }
  } catch (error: unknown) {
    console.error('Flutterwave validation error:', error);
    return {
      success: false,
      message: 'Failed to connect to Flutterwave',
      error: (error as Error).message,
    };
  }
}

// Validate Paystack API key
async function validatePaystack(secretKey: string): Promise<ValidationResponse> {
  try {
    const response = await fetch('https://api.paystack.co/bank', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Paystack API key is valid',
        accountName: 'Paystack',
        mode: secretKey.startsWith('sk_test_') ? 'test' : 'live',
      };
    } else {
      return {
        success: false,
        message: 'Invalid Paystack API key',
        error: 'Authentication failed',
      };
    }
  } catch (error: unknown) {
    console.error('Paystack validation error:', error);
    return {
      success: false,
      message: 'Failed to connect to Paystack',
      error: (error as Error).message,
    };
  }
}

// Validate Kora Pay API key
async function validateKoraPay(secretKey: string): Promise<ValidationResponse> {
  try {
    const response = await fetch('https://api.korapay.com/merchant/api/v1/misc/banks?countryCode=NG', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Kora Pay API key is valid',
        accountName: 'Kora Pay',
        mode: secretKey.includes('test') ? 'test' : 'live',
      };
    } else {
      return {
        success: false,
        message: 'Invalid Kora Pay API key',
        error: 'Authentication failed',
      };
    }
  } catch (error: unknown) {
    console.error('Kora Pay validation error:', error);
    return {
      success: false,
      message: 'Failed to connect to Kora Pay',
      error: (error as Error).message,
    };
  }
}

// Validate Heleket API credentials
async function validateHeleket(merchantId: string, apiKey: string): Promise<ValidationResponse> {
  try {
    // Heleket uses MD5(base64(body) + apiKey) for signing
    // Test with a simple test endpoint or validate credentials format
    if (!merchantId || merchantId.length < 5) {
      return {
        success: false,
        message: 'Invalid Heleket Merchant ID',
        error: 'Merchant ID appears too short',
      };
    }
    if (!apiKey || apiKey.length < 10) {
      return {
        success: false,
        message: 'Invalid Heleket API Key',
        error: 'API Key appears too short',
      };
    }

    // Try to call the balance endpoint to verify credentials
    const payload = JSON.stringify({ currency: 'USD' });
    const encoder = new TextEncoder();
    const payloadBase64 = btoa(payload);
    const signData = encoder.encode(payloadBase64 + apiKey);
    const hashBuffer = await crypto.subtle.digest('MD5', signData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sign = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const response = await fetch('https://api.heleket.com/v1/balance', {
      method: 'POST',
      headers: {
        'merchant': merchantId,
        'sign': sign,
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Heleket credentials are valid',
        accountName: 'Heleket',
        mode: 'live',
      };
    } else {
      return {
        success: false,
        message: 'Invalid Heleket credentials',
        error: 'Authentication failed - check Merchant ID and API Key',
      };
    }
  } catch (error: unknown) {
    console.error('Heleket validation error:', error);
    return {
      success: false,
      message: 'Failed to connect to Heleket',
      error: (error as Error).message,
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
      case 'crypto':
        result = await validateCoinbase(apiKey);
        break;
      case 'flutterwave':
        result = await validateFlutterwave(secretKey || apiKey);
        break;
      case 'paystack':
        result = await validatePaystack(secretKey || apiKey);
        break;
      case 'korapay':
        result = await validateKoraPay(secretKey || apiKey);
        break;
      default:
        // For unknown gateways, return a generic success if keys are provided
        result = {
          success: true,
          message: `${gateway} credentials saved (validation not available)`,
          accountName: gateway.charAt(0).toUpperCase() + gateway.slice(1),
          mode: 'live',
        };
    }

    console.log(`Validation result for ${gateway}:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error', error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
