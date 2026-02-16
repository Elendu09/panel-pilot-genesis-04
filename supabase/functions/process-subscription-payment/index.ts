import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubscriptionPaymentRequest {
  gateway: string;
  amount: number;
  panelId: string;
  userId: string;
  plan: string;
  returnUrl: string;
  currency?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body: SubscriptionPaymentRequest = await req.json();
    const { gateway, amount, panelId, userId, plan, returnUrl, currency = 'usd' } = body;

    console.log(`[subscription-payment] ${gateway} $${amount} plan=${plan} panel=${panelId}`);

    if (!gateway || !amount || !panelId || !userId || !plan) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch admin-configured gateway credentials from platform_payment_providers
    const { data: provider, error: provError } = await supabase
      .from('platform_payment_providers')
      .select('*')
      .eq('provider_name', gateway)
      .eq('is_enabled', true)
      .eq('supports_subscriptions', true)
      .single();

    if (provError || !provider) {
      console.error('[subscription-payment] Provider not found:', provError);
      return new Response(
        JSON.stringify({ success: false, error: `Payment provider "${gateway}" is not available for subscriptions.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const config = (provider.config as Record<string, any>) || {};
    const productName = `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - HOME OF SMM`;

    // Fetch user email for payment providers that need it
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', userId)
      .single();

    const userEmail = profile?.email || `user-${userId}@homeofsmm.com`;

    // Create transaction record
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        panel_id: panelId,
        amount,
        type: 'subscription',
        payment_method: gateway,
        status: 'pending',
        description: `Subscription: ${productName}`,
      })
      .select('id')
      .single();

    if (txError) {
      console.error('[subscription-payment] Tx creation error:', txError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create transaction' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const txId = tx.id;
    let redirectUrl: string | null = null;

    switch (gateway) {
      case 'stripe': {
        const secretKey = config.secret_key || config.secretKey;
        if (!secretKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'Stripe not configured by admin' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'payment_method_types[0]': 'card',
            'line_items[0][price_data][currency]': currency,
            'line_items[0][price_data][product_data][name]': productName,
            'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
            'line_items[0][quantity]': '1',
            'mode': 'payment',
            'success_url': `${returnUrl}?success=true&transaction_id=${txId}`,
            'cancel_url': `${returnUrl}?cancelled=true&transaction_id=${txId}`,
            'customer_email': userEmail,
            'metadata[panelId]': panelId,
            'metadata[userId]': userId,
            'metadata[transactionId]': txId,
            'metadata[plan]': plan,
            'metadata[type]': 'subscription',
          }),
        });

        const session = await stripeRes.json();
        if (session.error) {
          console.error('[subscription-payment] Stripe error:', session.error);
          return new Response(
            JSON.stringify({ success: false, error: session.error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        redirectUrl = session.url;
        break;
      }

      case 'flutterwave': {
        const secretKey = config.secret_key || config.secretKey;
        if (!secretKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'Flutterwave not configured by admin' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const flwRes = await fetch('https://api.flutterwave.com/v3/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tx_ref: txId,
            amount,
            currency: currency.toUpperCase(),
            redirect_url: `${returnUrl}?success=true&transaction_id=${txId}`,
            customer: { email: userEmail, name: profile?.full_name || 'Panel Owner' },
            customizations: {
              title: productName,
              description: `Subscription payment for ${plan} plan`,
            },
            payment_options: 'card,banktransfer,ussd,mobilemoney',
            meta: { panelId, userId, transactionId: txId, plan, type: 'subscription' },
          }),
        });

        const flwData = await flwRes.json();
        if (flwData.status !== 'success') {
          console.error('[subscription-payment] Flutterwave error:', flwData);
          return new Response(
            JSON.stringify({ success: false, error: flwData.message || 'Flutterwave payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        redirectUrl = flwData.data?.link;
        break;
      }

      case 'paypal': {
        const clientId = config.client_id || config.apiKey;
        const secret = config.secret_key || config.secretKey;
        if (!clientId || !secret) {
          return new Response(
            JSON.stringify({ success: false, error: 'PayPal not configured by admin' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${clientId}:${secret}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to authenticate with PayPal' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              amount: { currency_code: currency.toUpperCase(), value: amount.toFixed(2) },
              description: productName,
              custom_id: txId,
            }],
            application_context: {
              return_url: `${returnUrl}?success=true&transaction_id=${txId}`,
              cancel_url: `${returnUrl}?cancelled=true&transaction_id=${txId}`,
            },
          }),
        });
        const order = await orderRes.json();
        const approveLink = order.links?.find((l: any) => l.rel === 'approve');
        redirectUrl = approveLink?.href;
        break;
      }

      case 'paystack': {
        const secretKey = config.secret_key || config.secretKey;
        if (!secretKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'Paystack not configured by admin' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const psRes = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            amount: Math.round(amount * 100),
            currency: currency.toUpperCase(),
            callback_url: `${returnUrl}?success=true&transaction_id=${txId}`,
            reference: txId,
            metadata: { panelId, userId, plan, type: 'subscription' },
          }),
        });
        const psData = await psRes.json();
        if (!psData.status) {
          return new Response(
            JSON.stringify({ success: false, error: psData.message || 'Paystack payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        redirectUrl = psData.data?.authorization_url;
        break;
      }

      case 'razorpay': {
        const keyId = config.key_id || config.apiKey;
        const keySecret = config.secret_key || config.secretKey;
        if (!keyId || !keySecret) {
          return new Response(
            JSON.stringify({ success: false, error: 'Razorpay not configured by admin' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const rzpRes = await fetch('https://api.razorpay.com/v1/payment_links', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${keyId}:${keySecret}`)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: currency.toUpperCase(),
            description: productName,
            callback_url: `${returnUrl}?success=true&transaction_id=${txId}`,
            callback_method: 'get',
            notes: { panelId, userId, plan, type: 'subscription' },
          }),
        });
        const rzpData = await rzpRes.json();
        redirectUrl = rzpData.short_url;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unsupported gateway: ${gateway}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (!redirectUrl) {
      // Mark transaction as failed
      await supabase.from('transactions').update({ status: 'failed' }).eq('id', txId);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get payment URL from provider' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[subscription-payment] Redirect URL obtained for ${gateway}, tx=${txId}`);

    return new Response(
      JSON.stringify({ success: true, url: redirectUrl, transactionId: txId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[subscription-payment] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
