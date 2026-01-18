import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  gateway: string;
  amount: number;
  panelId: string;
  buyerId: string;
  transactionId: string;
  returnUrl: string;
  currency?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: PaymentRequest = await req.json();
    const { gateway, amount, panelId, buyerId, transactionId, returnUrl, currency = 'usd' } = body;

    console.log(`[process-payment] Processing ${gateway} payment: $${amount} for panel ${panelId}`);

    if (!gateway || !amount || !panelId || !buyerId || !transactionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch panel's payment gateway credentials
    const { data: panel } = await supabase
      .from('panels')
      .select('settings, name')
      .eq('id', panelId)
      .single();

    if (!panel) {
      return new Response(
        JSON.stringify({ error: 'Panel not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const panelSettings = panel.settings as Record<string, any> || {};
    const paymentSettings = panelSettings.payments || {};
    const enabledMethods = paymentSettings.enabledMethods || [];
    
    // Find the gateway config
    const gatewayConfig = enabledMethods.find((m: any) => m.id === gateway);
    
    if (!gatewayConfig || !gatewayConfig.enabled) {
      return new Response(
        JSON.stringify({ error: `${gateway} is not enabled for this panel` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let redirectUrl: string | null = null;
    let paymentId: string | null = null;

    switch (gateway) {
      case 'stripe': {
        // Use Stripe API to create a checkout session
        const stripeSecretKey = gatewayConfig.secretKey || Deno.env.get('STRIPE_SECRET_KEY');
        
        if (!stripeSecretKey) {
          return new Response(
            JSON.stringify({ error: 'Stripe not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'payment_method_types[0]': 'card',
            'line_items[0][price_data][currency]': currency,
            'line_items[0][price_data][product_data][name]': `Account Deposit - ${panel.name}`,
            'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
            'line_items[0][quantity]': '1',
            'mode': 'payment',
            'success_url': `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}&transaction_id=${transactionId}`,
            'cancel_url': `${returnUrl}?cancelled=true&transaction_id=${transactionId}`,
            'metadata[panelId]': panelId,
            'metadata[buyerId]': buyerId,
            'metadata[transactionId]': transactionId,
          }),
        });

        const session = await stripeResponse.json();
        
        if (session.error) {
          console.error('[process-payment] Stripe error:', session.error);
          return new Response(
            JSON.stringify({ error: session.error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = session.url;
        paymentId = session.id;
        break;
      }

      case 'paypal': {
        // PayPal integration - create order via PayPal REST API
        const paypalClientId = gatewayConfig.apiKey;
        const paypalSecret = gatewayConfig.secretKey;
        
        if (!paypalClientId || !paypalSecret) {
          return new Response(
            JSON.stringify({ error: 'PayPal not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get PayPal access token
        const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalSecret}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
          return new Response(
            JSON.stringify({ error: 'Failed to authenticate with PayPal' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create PayPal order
        const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              amount: {
                currency_code: currency.toUpperCase(),
                value: amount.toFixed(2),
              },
              description: `Account Deposit - ${panel.name}`,
              custom_id: transactionId,
            }],
            application_context: {
              return_url: `${returnUrl}?success=true&transaction_id=${transactionId}`,
              cancel_url: `${returnUrl}?cancelled=true&transaction_id=${transactionId}`,
            },
          }),
        });

        const order = await orderResponse.json();
        
        if (order.error) {
          return new Response(
            JSON.stringify({ error: order.error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const approveLink = order.links?.find((l: any) => l.rel === 'approve');
        redirectUrl = approveLink?.href;
        paymentId = order.id;
        break;
      }

      case 'crypto':
      case 'coinbase': {
        // Coinbase Commerce integration
        const coinbaseApiKey = gatewayConfig.apiKey || Deno.env.get('COINBASE_COMMERCE_API_KEY');
        
        if (!coinbaseApiKey) {
          return new Response(
            JSON.stringify({ error: 'Crypto payment not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const chargeResponse = await fetch('https://api.commerce.coinbase.com/charges', {
          method: 'POST',
          headers: {
            'X-CC-Api-Key': coinbaseApiKey,
            'X-CC-Version': '2018-03-22',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `Deposit - ${panel.name}`,
            description: `Account deposit of $${amount}`,
            pricing_type: 'fixed_price',
            local_price: {
              amount: amount.toString(),
              currency: currency.toUpperCase(),
            },
            metadata: {
              panelId,
              buyerId,
              transactionId,
            },
            redirect_url: `${returnUrl}?success=true&transaction_id=${transactionId}`,
            cancel_url: `${returnUrl}?cancelled=true&transaction_id=${transactionId}`,
          }),
        });

        const charge = await chargeResponse.json();
        
        if (charge.error) {
          return new Response(
            JSON.stringify({ error: charge.error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = charge.data?.hosted_url;
        paymentId = charge.data?.id;
        break;
      }

      case 'flutterwave': {
        // Flutterwave integration
        const flwSecretKey = gatewayConfig.secretKey;
        
        if (!flwSecretKey) {
          return new Response(
            JSON.stringify({ error: 'Flutterwave not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const flwResponse = await fetch('https://api.flutterwave.com/v3/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${flwSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tx_ref: transactionId,
            amount: amount,
            currency: currency.toUpperCase(),
            redirect_url: `${returnUrl}?success=true&transaction_id=${transactionId}`,
            customer: {
              email: `buyer-${buyerId}@panel.local`,
            },
            customizations: {
              title: `Deposit - ${panel.name}`,
              description: `Account deposit of $${amount}`,
            },
            payment_options: 'card,banktransfer,ussd,mobilemoney',
            meta: {
              panelId,
              buyerId,
              transactionId,
            },
          }),
        });

        const flwData = await flwResponse.json();
        
        if (flwData.status !== 'success') {
          console.error('[process-payment] Flutterwave error:', flwData);
          return new Response(
            JSON.stringify({ error: flwData.message || 'Flutterwave payment failed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = flwData.data?.link;
        paymentId = flwData.data?.id?.toString();
        break;
      }

      case 'paystack': {
        // Paystack integration
        const paystackSecretKey = gatewayConfig.secretKey;
        
        if (!paystackSecretKey) {
          return new Response(
            JSON.stringify({ error: 'Paystack not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: `buyer-${buyerId}@panel.local`,
            amount: Math.round(amount * 100), // Paystack uses kobo/cents
            currency: currency.toUpperCase(),
            callback_url: `${returnUrl}?success=true&transaction_id=${transactionId}`,
            reference: transactionId,
            metadata: {
              panelId,
              buyerId,
              transactionId,
            },
          }),
        });

        const paystackData = await paystackResponse.json();
        
        if (!paystackData.status) {
          console.error('[process-payment] Paystack error:', paystackData);
          return new Response(
            JSON.stringify({ error: paystackData.message || 'Paystack payment failed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = paystackData.data?.authorization_url;
        paymentId = paystackData.data?.reference;
        break;
      }

      case 'korapay': {
        // Kora Pay integration
        const koraSecretKey = gatewayConfig.secretKey;
        
        if (!koraSecretKey) {
          return new Response(
            JSON.stringify({ error: 'Kora Pay not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const koraResponse = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${koraSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            currency: currency.toUpperCase(),
            reference: transactionId,
            redirect_url: `${returnUrl}?success=true&transaction_id=${transactionId}`,
            customer: {
              email: `buyer-${buyerId}@panel.local`,
            },
            metadata: {
              panelId,
              buyerId,
              transactionId,
            },
          }),
        });

        const koraData = await koraResponse.json();
        
        if (!koraData.status) {
          console.error('[process-payment] Kora Pay error:', koraData);
          return new Response(
            JSON.stringify({ error: koraData.message || 'Kora Pay payment failed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = koraData.data?.checkout_url;
        paymentId = koraData.data?.reference;
        break;
      }

      case 'razorpay': {
        // Razorpay integration (creates an order, frontend handles payment)
        const razorpayKeyId = gatewayConfig.apiKey;
        const razorpayKeySecret = gatewayConfig.secretKey;
        
        if (!razorpayKeyId || !razorpayKeySecret) {
          return new Response(
            JSON.stringify({ error: 'Razorpay not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
        const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${razorpayAuth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Razorpay uses paise
            currency: currency.toUpperCase(),
            receipt: transactionId,
            notes: {
              panelId,
              buyerId,
              transactionId,
            },
          }),
        });

        const razorpayData = await razorpayResponse.json();
        
        if (razorpayData.error) {
          console.error('[process-payment] Razorpay error:', razorpayData);
          return new Response(
            JSON.stringify({ error: razorpayData.error.description || 'Razorpay payment failed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Razorpay doesn't have a hosted checkout URL, return order details for frontend
        return new Response(
          JSON.stringify({ 
            success: true,
            gateway: 'razorpay',
            orderId: razorpayData.id,
            keyId: razorpayKeyId,
            amount: razorpayData.amount,
            currency: razorpayData.currency,
            transactionId,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'monnify': {
        // Monnify integration
        const monnifyApiKey = gatewayConfig.apiKey;
        const monnifySecretKey = gatewayConfig.secretKey;
        const monnifyContractCode = gatewayConfig.contractCode;
        
        if (!monnifyApiKey || !monnifySecretKey) {
          return new Response(
            JSON.stringify({ error: 'Monnify not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get Monnify access token
        const monnifyAuth = btoa(`${monnifyApiKey}:${monnifySecretKey}`);
        const tokenResponse = await fetch('https://api.monnify.com/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${monnifyAuth}`,
          },
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenData.requestSuccessful) {
          return new Response(
            JSON.stringify({ error: 'Failed to authenticate with Monnify' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Initialize transaction
        const monnifyResponse = await fetch('https://api.monnify.com/api/v1/merchant/transactions/init-transaction', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.responseBody.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            customerEmail: `buyer-${buyerId}@panel.local`,
            paymentReference: transactionId,
            paymentDescription: `Deposit - ${panel.name}`,
            currencyCode: currency.toUpperCase(),
            contractCode: monnifyContractCode,
            redirectUrl: `${returnUrl}?success=true&transaction_id=${transactionId}`,
            paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
          }),
        });

        const monnifyData = await monnifyResponse.json();
        
        if (!monnifyData.requestSuccessful) {
          console.error('[process-payment] Monnify error:', monnifyData);
          return new Response(
            JSON.stringify({ error: monnifyData.responseMessage || 'Monnify payment failed' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = monnifyData.responseBody?.checkoutUrl;
        paymentId = monnifyData.responseBody?.transactionReference;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unsupported gateway: ${gateway}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Update transaction with external payment ID
    if (paymentId) {
      await supabase
        .from('transactions')
        .update({ 
          external_id: paymentId,
          status: 'processing'
        })
        .eq('id', transactionId);
    }

    console.log(`[process-payment] Payment initiated: ${gateway}, redirect: ${redirectUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        redirectUrl,
        paymentId,
        gateway
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[process-payment] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
