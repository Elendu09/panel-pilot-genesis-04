import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PaymentRequest {
  gateway: string;
  amount: number;
  panelId: string;
  buyerId: string;
  transactionId?: string;
  returnUrl: string;
  currency?: string;
  orderId?: string;
  isOwnerDeposit?: boolean;
  metadata?: Record<string, any>;
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

    const body = await req.json();

    // === VERIFY-PAYMENT ACTION: allows client to verify & finalize a payment on return ===
    if (body.action === 'verify-payment') {
      const { transactionId, gateway: verifyGateway } = body;
      if (!transactionId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing transactionId' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Look up the transaction
      const { data: tx, error: txLookupError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (txLookupError || !tx) {
        return new Response(
          JSON.stringify({ success: false, error: 'Transaction not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Already completed or failed — just return current status
      if (tx.status === 'completed' || tx.status === 'failed') {
        return new Response(
          JSON.stringify({ success: true, status: tx.status, amount: tx.amount }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Try to verify with the gateway
      const gw = verifyGateway || tx.payment_method;
      let verified = false;
      let verifiedAmount = tx.amount;

      try {
        if (gw === 'stripe' && tx.external_id) {
          // Fetch admin or panel gateway config for stripe secret
          const { data: adminProvider } = await supabase
            .from('platform_payment_providers')
            .select('config')
            .eq('provider_name', 'stripe')
            .eq('is_enabled', true)
            .maybeSingle();
          const stripeKey = (adminProvider?.config as any)?.secret_key || (adminProvider?.config as any)?.secretKey || Deno.env.get('STRIPE_SECRET_KEY');
          if (stripeKey) {
            const sessionRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${tx.external_id}`, {
              headers: { 'Authorization': `Bearer ${stripeKey}` },
            });
            const session = await sessionRes.json();
            if (session.payment_status === 'paid') {
              verified = true;
              verifiedAmount = (session.amount_total || 0) / 100;
            }
          }
        } else if (gw === 'flutterwave' && tx.external_id) {
          const { data: adminProvider } = await supabase
            .from('platform_payment_providers')
            .select('config')
            .eq('provider_name', 'flutterwave')
            .eq('is_enabled', true)
            .maybeSingle();
          const flwKey = (adminProvider?.config as any)?.secret_key || (adminProvider?.config as any)?.secretKey;
          if (flwKey) {
            const flwRes = await fetch(`https://api.flutterwave.com/v3/transactions/${tx.external_id}/verify`, {
              headers: { 'Authorization': `Bearer ${flwKey}` },
            });
            const flwData = await flwRes.json();
            if (flwData.status === 'success' && flwData.data?.status === 'successful') {
              verified = true;
              verifiedAmount = flwData.data.amount;
            }
          }
        } else if (gw === 'paystack') {
          const { data: adminProvider } = await supabase
            .from('platform_payment_providers')
            .select('config')
            .eq('provider_name', 'paystack')
            .eq('is_enabled', true)
            .maybeSingle();
          const psKey = (adminProvider?.config as any)?.secret_key || (adminProvider?.config as any)?.secretKey;
          if (psKey) {
            const psRes = await fetch(`https://api.paystack.co/transaction/verify/${transactionId}`, {
              headers: { 'Authorization': `Bearer ${psKey}` },
            });
            const psData = await psRes.json();
            if (psData.status && psData.data?.status === 'success') {
              verified = true;
              verifiedAmount = (psData.data.amount || 0) / 100;
            }
          }
        }
      } catch (verifyErr) {
        console.error('[process-payment] Gateway verification error:', verifyErr);
      }

      if (verified) {
        // Update transaction to completed
        await supabase
          .from('transactions')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', transactionId);

        // Credit balance based on metadata type
        const txMeta = (tx.metadata as Record<string, any>) || {};
        if (txMeta.type === 'panel_deposit' && tx.panel_id) {
          const { data: panelData } = await supabase
            .from('panels')
            .select('balance')
            .eq('id', tx.panel_id)
            .single();
          if (panelData) {
            await supabase
              .from('panels')
              .update({ balance: (panelData.balance || 0) + verifiedAmount })
              .eq('id', tx.panel_id);
          }
        } else if (tx.buyer_id) {
          const { data: buyerData } = await supabase
            .from('client_users')
            .select('balance')
            .eq('id', tx.buyer_id)
            .single();
          if (buyerData) {
            await supabase
              .from('client_users')
              .update({ balance: (buyerData.balance || 0) + verifiedAmount })
              .eq('id', tx.buyer_id);
          }
        }

        console.log(`[process-payment] Verified & completed transaction ${transactionId}, amount: ${verifiedAmount}`);
        return new Response(
          JSON.stringify({ success: true, status: 'completed', amount: verifiedAmount }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Not verified yet — return current status
      return new Response(
        JSON.stringify({ success: true, status: tx.status, amount: tx.amount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === STANDARD PAYMENT FLOW ===
    const { gateway, amount, panelId, buyerId, transactionId, returnUrl, currency = 'usd', orderId, isOwnerDeposit, metadata } = body as PaymentRequest;

    console.log(`[process-payment] Processing ${gateway} payment: $${amount} for panel ${panelId}${orderId ? `, order: ${orderId}` : ''}`);

    // Determine if this is a panel owner payment (billing, subscriptions, commissions)
    const isOwnerPayment = isOwnerDeposit || metadata?.type === 'subscription' || metadata?.type === 'commission_payment';

    if (!gateway || !amount || !buyerId || (!panelId && !isOwnerPayment)) {
      console.error('[process-payment] Missing fields:', { gateway, amount, panelId, buyerId });
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch panel name (needed for payment descriptions) - skip if no panelId
    let panel: any = null;
    if (panelId) {
      const { data: panelData, error: panelError } = await supabase
        .from('panels')
        .select('settings, name')
        .eq('id', panelId)
        .single();

      if (panelError || !panelData) {
        console.error('[process-payment] Panel fetch error:', panelError);
        return new Response(
          JSON.stringify({ success: false, error: 'Panel not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      panel = panelData;
    }

    const panelName = panel?.name || 'Platform';

    // Fetch user email for payment gateways that require it
    let buyerEmail = metadata?.ownerEmail || '';
    if (!buyerEmail) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', buyerId)
        .single();
      buyerEmail = profileData?.email || `user-${buyerId}@platform.local`;
    }

    let gatewayConfig: any = null;

    if (isOwnerPayment) {
      // For panel owner payments (billing, subscriptions, commissions), use admin-configured gateways
      console.log('[process-payment] Owner payment detected, looking up admin gateway:', gateway);
      
      const { data: adminProvider, error: adminError } = await supabase
        .from('platform_payment_providers')
        .select('*')
        .eq('provider_name', gateway)
        .eq('is_enabled', true)
        .maybeSingle();

      if (adminError) {
        console.error('[process-payment] Admin provider lookup error:', adminError);
      }

      if (!adminProvider) {
        console.error('[process-payment] Admin gateway not found:', gateway);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Payment gateway "${gateway}" is not configured by the platform administrator. Please contact support.` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const config = adminProvider.config as Record<string, any> || {};
      gatewayConfig = {
        id: adminProvider.provider_name,
        enabled: true,
        secretKey: config.secret_key || config.secretKey,
        apiKey: config.api_key || config.apiKey,
        publicKey: config.public_key || config.publicKey,
        contractCode: config.contract_code || config.contractCode,
        payeeName: config.payee_name || config.payeeName,
        storeId: config.store_id || config.storeId,
      };
      
      console.log('[process-payment] Using admin gateway config for:', gateway);
    } else {
      // For buyer/tenant payments, use panel-configured gateways
      const panelSettings = panel.settings as Record<string, any> || {};
      const paymentSettings = panelSettings.payments || {};
      const enabledMethods = paymentSettings.enabledMethods || [];
      const manualPayments = paymentSettings.manualPayments || [];
      
      console.log('[process-payment] Buyer payment - Panel settings:', { 
        panelName: panel.name, 
        enabledMethodsCount: enabledMethods.length,
        manualPaymentsCount: manualPayments.length,
        requestedGateway: gateway 
      });
      
      // Find the gateway config
      gatewayConfig = enabledMethods.find((m: any) => {
        const methodId = typeof m === 'string' ? m : m.id;
        return methodId === gateway;
      });
      
      // For string-only entries, create a minimal config
      if (typeof gatewayConfig === 'string') {
        gatewayConfig = { id: gatewayConfig, enabled: true };
      }
      
      // For manual payment methods, check manualPayments array
      if (!gatewayConfig && (gateway.startsWith('manual_') || gateway === 'manual_transfer')) {
        gatewayConfig = manualPayments.find((m: any) => m.id === gateway);
      }
      
      // If still no config but gateway is in enabled list (for simpler configs)
      if (!gatewayConfig && enabledMethods.includes(gateway)) {
        gatewayConfig = { id: gateway, enabled: true };
      }
      
      if (!gatewayConfig || gatewayConfig.enabled === false) {
        console.error('[process-payment] Gateway not enabled:', { 
          gateway, 
          enabledMethods,
          foundConfig: gatewayConfig 
        });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `${gateway} is not enabled for this panel. Please configure payment methods in panel settings.` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Now create transaction AFTER validating gateway (server-side creation bypasses RLS)
    let txId = transactionId;
    if (!txId) {
      const txType = orderId ? 'order_payment' : 'deposit';
      const txDescription = orderId ? `Order payment via ${gateway}` : `Deposit via ${gateway}`;
      
      const { data: newTx, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: buyerId,
          // buyer_id FK references client_users, so only set it for buyer (non-owner) payments
          ...(isOwnerPayment ? {} : { buyer_id: buyerId }),
          panel_id: panelId,
          amount: amount,
          type: txType,
          payment_method: gateway,
          status: 'pending',
          description: txDescription,
          // Always store client-provided metadata + orderId for webhook processing
          metadata: {
            ...(metadata || {}),
            ...(orderId ? { orderId } : {}),
          }
        })
        .select('id')
        .single();
      
      if (txError) {
        console.error('[process-payment] Transaction creation error:', txError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create transaction record' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      txId = newTx.id;
      console.log('[process-payment] Created transaction:', txId, orderId ? `for order ${orderId}` : '');
    }
    const transactionIdToUse: string = txId!;

    let redirectUrl: string | null = null;
    let paymentId: string | null = null;

    switch (gateway) {
      case 'stripe': {
        // Use Stripe API to create a checkout session
        const stripeSecretKey = gatewayConfig.secretKey || Deno.env.get('STRIPE_SECRET_KEY');
        
        if (!stripeSecretKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'Stripe not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            'line_items[0][price_data][product_data][name]': `Account Deposit - ${panelName}`,
            'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
            'line_items[0][quantity]': '1',
            'mode': 'payment',
            'success_url': `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}&transaction_id=${transactionIdToUse}`,
            'cancel_url': `${returnUrl}?cancelled=true&transaction_id=${transactionIdToUse}`,
            'metadata[panelId]': panelId,
            'metadata[buyerId]': buyerId,
            'metadata[transactionId]': transactionIdToUse,
          }),
        });

        const session = await stripeResponse.json();
        
        if (session.error) {
          console.error('[process-payment] Stripe error:', session.error);
          return new Response(
            JSON.stringify({ success: false, error: session.error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            JSON.stringify({ success: false, error: 'PayPal not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get PayPal access token
        const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
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
            JSON.stringify({ success: false, error: 'Failed to authenticate with PayPal' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create PayPal order
        const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
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
              description: `Account Deposit - ${panelName}`,
              custom_id: transactionIdToUse,
            }],
            application_context: {
              return_url: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
              cancel_url: `${returnUrl}?cancelled=true&transaction_id=${transactionIdToUse}`,
            },
          }),
        });

        const order = await orderResponse.json();
        
        if (order.error) {
          return new Response(
            JSON.stringify({ success: false, error: order.error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            JSON.stringify({ success: false, error: 'Crypto payment not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            name: `Deposit - ${panelName}`,
            description: `Account deposit of $${amount}`,
            pricing_type: 'fixed_price',
            local_price: {
              amount: amount.toString(),
              currency: currency.toUpperCase(),
            },
            metadata: {
              panelId,
              buyerId,
              transactionId: transactionIdToUse,
            },
            redirect_url: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
            cancel_url: `${returnUrl}?cancelled=true&transaction_id=${transactionIdToUse}`,
          }),
        });

        const charge = await chargeResponse.json();
        
        if (charge.error) {
          return new Response(
            JSON.stringify({ success: false, error: charge.error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            JSON.stringify({ success: false, error: 'Flutterwave not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const flwResponse = await fetch('https://api.flutterwave.com/v3/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${flwSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tx_ref: transactionIdToUse,
            amount: amount,
            currency: currency.toUpperCase(),
            redirect_url: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
            // Explicitly set webhook URL so Flutterwave sends callbacks without manual dashboard config
            webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook?gateway=flutterwave`,
            customer: {
              email: buyerEmail,
            },
            customizations: {
              title: `Deposit - ${panelName}`,
              description: `Account deposit of $${amount}`,
            },
            payment_options: 'card,banktransfer,ussd,mobilemoney',
            meta: {
              panelId,
              buyerId,
              transactionId: transactionIdToUse,
            },
          }),
        });

        const flwData = await flwResponse.json();
        
        if (flwData.status !== 'success') {
          console.error('[process-payment] Flutterwave error:', flwData);
          return new Response(
            JSON.stringify({ success: false, error: flwData.message || 'Flutterwave payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            JSON.stringify({ success: false, error: 'Paystack not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: buyerEmail,
            amount: Math.round(amount * 100),
            currency: currency.toUpperCase(),
            callback_url: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
            reference: transactionIdToUse,
            // Note: Paystack does NOT support per-transaction webhook URLs.
            // You must configure the webhook URL in your Paystack dashboard:
            // https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/payment-webhook?gateway=paystack
            metadata: {
              panelId,
              buyerId,
              transactionId: transactionIdToUse,
            },
          }),
        });

        const paystackData = await paystackResponse.json();
        
        if (!paystackData.status) {
          console.error('[process-payment] Paystack error:', paystackData);
          return new Response(
            JSON.stringify({ success: false, error: paystackData.message || 'Paystack payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            JSON.stringify({ success: false, error: 'Kora Pay not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            reference: transactionIdToUse,
            redirect_url: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
            customer: {
              email: buyerEmail,
            },
            metadata: {
              panelId,
              buyerId,
              transactionId: transactionIdToUse,
            },
          }),
        });

        const koraData = await koraResponse.json();
        
        if (!koraData.status) {
          console.error('[process-payment] Kora Pay error:', koraData);
          return new Response(
            JSON.stringify({ success: false, error: koraData.message || 'Kora Pay payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            JSON.stringify({ success: false, error: 'Razorpay not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            amount: Math.round(amount * 100),
            currency: currency.toUpperCase(),
            receipt: transactionIdToUse,
            notes: {
              panelId,
              buyerId,
              transactionId: transactionIdToUse,
            },
          }),
        });

        const razorpayData = await razorpayResponse.json();
        
        if (razorpayData.error) {
          console.error('[process-payment] Razorpay error:', razorpayData);
          return new Response(
            JSON.stringify({ success: false, error: razorpayData.error.description || 'Razorpay payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
            transactionId: transactionIdToUse,
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
            JSON.stringify({ success: false, error: 'Monnify not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const monnifyAuth = btoa(`${monnifyApiKey}:${monnifySecretKey}`);
        const tokenResponse = await fetch('https://api.monnify.com/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Authorization': `Basic ${monnifyAuth}` },
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenData.requestSuccessful) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to authenticate with Monnify' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const monnifyResponse = await fetch('https://api.monnify.com/api/v1/merchant/transactions/init-transaction', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.responseBody.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            customerEmail: buyerEmail,
            paymentReference: transactionIdToUse,
            paymentDescription: `Deposit - ${panelName}`,
            currencyCode: currency.toUpperCase(),
            contractCode: monnifyContractCode,
            redirectUrl: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
            paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
          }),
        });

        const monnifyData = await monnifyResponse.json();
        
        if (!monnifyData.requestSuccessful) {
          return new Response(
            JSON.stringify({ success: false, error: monnifyData.responseMessage || 'Monnify payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = monnifyData.responseBody?.checkoutUrl;
        paymentId = monnifyData.responseBody?.transactionReference;
        break;
      }

      case 'nowpayments': {
        const nowPaymentsApiKey = gatewayConfig.apiKey;
        if (!nowPaymentsApiKey) {
          return new Response(JSON.stringify({ success: false, error: 'NowPayments not configured' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        const nowPaymentsResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
          method: 'POST',
          headers: { 'x-api-key': nowPaymentsApiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            price_amount: amount, price_currency: currency, order_id: transactionIdToUse,
            order_description: `Deposit - ${panelName}`,
            ipn_callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook?gateway=nowpayments`,
            success_url: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
            cancel_url: `${returnUrl}?cancelled=true&transaction_id=${transactionIdToUse}`,
          }),
        });
        const nowPaymentsData = await nowPaymentsResponse.json();
        if (!nowPaymentsData.invoice_url) {
          return new Response(JSON.stringify({ success: false, error: nowPaymentsData.message || 'NowPayments payment failed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        redirectUrl = nowPaymentsData.invoice_url;
        paymentId = nowPaymentsData.id;
        break;
      }

      case 'coingate': {
        // CoinGate crypto integration
        const coinGateApiKey = gatewayConfig.apiKey;
        
        if (!coinGateApiKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'CoinGate not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const coinGateResponse = await fetch('https://api.coingate.com/v2/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${coinGateApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: transactionIdToUse,
            price_amount: amount,
            price_currency: currency.toUpperCase(),
            receive_currency: currency.toUpperCase(),
            title: `Deposit - ${panelName}`,
            callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook?gateway=coingate`,
            success_url: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
            cancel_url: `${returnUrl}?cancelled=true&transaction_id=${transactionIdToUse}`,
          }),
        });

        const coinGateData = await coinGateResponse.json();
        
        if (!coinGateData.payment_url) {
          console.error('[process-payment] CoinGate error:', coinGateData);
          return new Response(
            JSON.stringify({ success: false, error: coinGateData.message || 'CoinGate payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = coinGateData.payment_url;
        paymentId = coinGateData.id;
        break;
      }

      case 'binancepay': {
        // Binance Pay integration
        const binanceApiKey = gatewayConfig.apiKey;
        const binanceSecretKey = gatewayConfig.secretKey;
        
        if (!binanceApiKey || !binanceSecretKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'Binance Pay not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const timestamp = Date.now().toString();
        const nonce = Math.random().toString(36).substring(2, 15);
        const requestBody = JSON.stringify({
          env: { terminalType: 'WEB' },
          merchantTradeNo: transactionIdToUse,
          orderAmount: amount,
          currency: currency.toUpperCase(),
          goods: {
            goodsType: '01',
            goodsCategory: 'Z000',
            referenceGoodsId: transactionIdToUse,
            goodsName: `Deposit - ${panelName}`,
          },
          returnUrl: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
          cancelUrl: `${returnUrl}?cancelled=true&transaction_id=${transactionIdToUse}`,
        });

        const binanceResponse = await fetch('https://bpay.binanceapi.com/binancepay/openapi/v2/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'BinancePay-Timestamp': timestamp,
            'BinancePay-Nonce': nonce,
            'BinancePay-Certificate-SN': binanceApiKey,
          },
          body: requestBody,
        });

        const binanceData = await binanceResponse.json();
        
        if (binanceData.status !== 'SUCCESS') {
          console.error('[process-payment] Binance Pay error:', binanceData);
          return new Response(
            JSON.stringify({ success: false, error: binanceData.errorMessage || 'Binance Pay payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = binanceData.data?.checkoutUrl;
        paymentId = binanceData.data?.prepayId;
        break;
      }

      case 'cryptomus': {
        // Cryptomus crypto payment integration
        const cryptomusApiKey = gatewayConfig.apiKey; // Payment API key
        const cryptomusMerchantId = gatewayConfig.secretKey; // Merchant UUID
        
        if (!cryptomusApiKey || !cryptomusMerchantId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Cryptomus not configured. Please add API Key and Merchant ID.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Cryptomus uses HMAC-MD5 signature: base64(json) + api_key
        const cryptomusPayload = {
          amount: amount.toString(),
          currency: currency.toUpperCase(),
          order_id: transactionIdToUse,
          url_return: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
          url_callback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook?gateway=cryptomus`,
          is_payment_multiple: false,
          lifetime: 3600, // 1 hour
          additional_data: JSON.stringify({ panelId, buyerId }),
        };

        // Create MD5 signature
        const encoder = new TextEncoder();
        const payloadBase64 = btoa(JSON.stringify(cryptomusPayload));
        const signData = encoder.encode(payloadBase64 + cryptomusApiKey);
        const hashBuffer = await crypto.subtle.digest('MD5', signData);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const sign = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const cryptomusResponse = await fetch('https://api.cryptomus.com/v1/payment', {
          method: 'POST',
          headers: {
            'merchant': cryptomusMerchantId,
            'sign': sign,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cryptomusPayload),
        });

        const cryptomusData = await cryptomusResponse.json();
        
        if (!cryptomusData.result?.url) {
          console.error('[process-payment] Cryptomus error:', cryptomusData);
          return new Response(
            JSON.stringify({ success: false, error: cryptomusData.message || 'Cryptomus payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = cryptomusData.result.url;
        paymentId = cryptomusData.result.uuid;
        break;
      }

      case 'skrill': {
        // Skrill e-wallet integration
        const skrillEmail = gatewayConfig.apiKey; // Merchant email
        
        if (!skrillEmail) {
          return new Response(
            JSON.stringify({ success: false, error: 'Skrill not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Skrill uses form-based redirect
        const skrillParams = new URLSearchParams({
          pay_to_email: skrillEmail,
          amount: amount.toString(),
          currency: currency.toUpperCase(),
          detail1_description: `Deposit - ${panelName}`,
          transaction_id: transactionIdToUse,
          return_url: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
          cancel_url: `${returnUrl}?cancelled=true&transaction_id=${transactionIdToUse}`,
          status_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook?gateway=skrill`,
        });

        redirectUrl = `https://pay.skrill.com?${skrillParams.toString()}`;
        paymentId = transactionIdToUse;
        break;
      }

      case 'perfectmoney': {
        // Perfect Money integration
        const pmAccountId = gatewayConfig.apiKey;
        const pmPayeeName = gatewayConfig.payeeName || panelName;
        
        if (!pmAccountId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Perfect Money not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Perfect Money uses form-based redirect
        const pmParams = new URLSearchParams({
          PAYEE_ACCOUNT: pmAccountId,
          PAYEE_NAME: pmPayeeName,
          PAYMENT_AMOUNT: amount.toString(),
          PAYMENT_UNITS: currency.toUpperCase(),
          PAYMENT_ID: transactionIdToUse,
          STATUS_URL: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook?gateway=perfectmoney`,
          PAYMENT_URL: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
          NOPAYMENT_URL: `${returnUrl}?cancelled=true&transaction_id=${transactionIdToUse}`,
        });

        redirectUrl = `https://perfectmoney.is/api/step1.asp?${pmParams.toString()}`;
        paymentId = transactionIdToUse;
        break;
      }

      case 'square': {
        // Square Checkout integration
        const squareAccessToken = gatewayConfig.secretKey;
        const squareLocationId = gatewayConfig.apiKey; // Location ID stored as apiKey
        
        if (!squareAccessToken || !squareLocationId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Square not configured. Please add Access Token and Location ID.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const squareResponse = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${squareAccessToken}`,
            'Content-Type': 'application/json',
            'Square-Version': '2024-01-18',
          },
          body: JSON.stringify({
            idempotency_key: transactionIdToUse,
            quick_pay: {
              name: `Deposit - ${panelName}`,
              price_money: {
                amount: Math.round(amount * 100), // Square uses cents
                currency: currency.toUpperCase(),
              },
              location_id: squareLocationId,
            },
            checkout_options: {
              redirect_url: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
            },
            pre_populated_data: {
              buyer_email: buyerId ? undefined : undefined, // Could fetch buyer email if needed
            },
          }),
        });

        const squareData = await squareResponse.json();
        
        if (!squareData.payment_link?.url) {
          console.error('[process-payment] Square error:', squareData);
          return new Response(
            JSON.stringify({ success: false, error: squareData.errors?.[0]?.detail || 'Square payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = squareData.payment_link.url;
        paymentId = squareData.payment_link.id;
        break;
      }

      case 'braintree': {
        // Braintree - typically uses client-side SDK, returns hosted fields URL
        const braintreeMerchantId = gatewayConfig.apiKey;
        const braintreePrivateKey = gatewayConfig.secretKey;
        const braintreePublicKey = gatewayConfig.publicKey || '';
        
        if (!braintreeMerchantId || !braintreePrivateKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'Braintree not configured. Please add Merchant ID and Private Key.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Braintree doesn't have a simple redirect checkout like Stripe
        // Return config for client-side integration
        return new Response(
          JSON.stringify({ 
            success: true,
            gateway: 'braintree',
            requiresClientIntegration: true,
            transactionId: transactionIdToUse,
            amount,
            currency: currency.toUpperCase(),
            config: {
              merchantId: braintreeMerchantId,
              publicKey: braintreePublicKey,
              // Note: In production, generate a client token server-side
            },
            message: 'Braintree requires client-side integration. Use the Braintree SDK with the provided config.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'ach': {
        // ACH Transfer via Stripe
        const stripeSecretKey = gatewayConfig.secretKey || Deno.env.get('STRIPE_SECRET_KEY');
        
        if (!stripeSecretKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'ACH (Stripe) not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const achResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'payment_method_types[0]': 'us_bank_account',
            'line_items[0][price_data][currency]': 'usd', // ACH only supports USD
             'line_items[0][price_data][product_data][name]': `Account Deposit - ${panelName}`,
            'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
            'line_items[0][quantity]': '1',
            'mode': 'payment',
            'success_url': `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}&transaction_id=${transactionIdToUse}`,
            'cancel_url': `${returnUrl}?cancelled=true&transaction_id=${transactionIdToUse}`,
            'metadata[panelId]': panelId,
            'metadata[buyerId]': buyerId,
            'metadata[transactionId]': transactionIdToUse,
            'payment_method_options[us_bank_account][financial_connections][permissions][0]': 'payment_method',
          }),
        });

        const achSession = await achResponse.json();
        
        if (achSession.error) {
          console.error('[process-payment] ACH error:', achSession.error);
          return new Response(
            JSON.stringify({ success: false, error: achSession.error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = achSession.url;
        paymentId = achSession.id;
        break;
      }

      case 'sepa': {
        // SEPA Transfer via Stripe
        const stripeSecretKey = gatewayConfig.secretKey || Deno.env.get('STRIPE_SECRET_KEY');
        
        if (!stripeSecretKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'SEPA (Stripe) not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const sepaResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'payment_method_types[0]': 'sepa_debit',
            'line_items[0][price_data][currency]': 'eur', // SEPA only supports EUR
            'line_items[0][price_data][product_data][name]': `Account Deposit - ${panelName}`,
            'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
            'line_items[0][quantity]': '1',
            'mode': 'payment',
            'success_url': `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}&transaction_id=${transactionIdToUse}`,
            'cancel_url': `${returnUrl}?cancelled=true&transaction_id=${transactionIdToUse}`,
            'metadata[panelId]': panelId,
            'metadata[buyerId]': buyerId,
            'metadata[transactionId]': transactionIdToUse,
          }),
        });

        const sepaSession = await sepaResponse.json();
        
        if (sepaSession.error) {
          console.error('[process-payment] SEPA error:', sepaSession.error);
          return new Response(
            JSON.stringify({ success: false, error: sepaSession.error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = sepaSession.url;
        paymentId = sepaSession.id;
        break;
      }

      case 'btcpay': {
        // BTCPay Server integration
        const btcpayHost = gatewayConfig.apiKey; // Store URL as apiKey (e.g., https://btcpay.example.com)
        const btcpayApiKey = gatewayConfig.secretKey;
        const btcpayStoreId = gatewayConfig.storeId || gatewayConfig.publicKey || '';
        
        if (!btcpayHost || !btcpayApiKey) {
          return new Response(
            JSON.stringify({ success: false, error: 'BTCPay Server not configured. Please add Server URL and API Key.' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Normalize host URL
        const btcpayUrl = btcpayHost.endsWith('/') ? btcpayHost.slice(0, -1) : btcpayHost;

        const btcpayResponse = await fetch(`${btcpayUrl}/api/v1/stores/${btcpayStoreId}/invoices`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${btcpayApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount.toString(),
            currency: currency.toUpperCase(),
            metadata: {
              orderId: transactionIdToUse,
              panelId: panelId,
              buyerId: buyerId,
            },
            checkout: {
              redirectURL: `${returnUrl}?success=true&transaction_id=${transactionIdToUse}`,
              redirectAutomatically: true,
            },
            receipt: {
              enabled: true,
            },
          }),
        });

        const btcpayData = await btcpayResponse.json();
        
        if (!btcpayData.checkoutLink) {
          console.error('[process-payment] BTCPay error:', btcpayData);
          return new Response(
            JSON.stringify({ success: false, error: btcpayData.message || 'BTCPay Server payment failed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        redirectUrl = btcpayData.checkoutLink;
        paymentId = btcpayData.id;
        break;
      }

      case 'wise': {
        // Wise (TransferWise) - returns bank details for manual transfer
        return new Response(
          JSON.stringify({ 
            success: true,
            gateway: 'wise',
            requiresManualTransfer: true,
            transactionId: transactionIdToUse,
            amount,
            currency: currency.toUpperCase(),
            message: 'Please transfer the amount using Wise. Your balance will be credited once payment is confirmed.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'manual_transfer':
      default: {
        // Manual transfer or unsupported gateway - return the transaction ID for manual handling
        if (gateway.startsWith('manual_') || gateway === 'manual_transfer') {
          // Update status to pending_verification for manual transfers (so it shows in buyer's history)
          await supabase
            .from('transactions')
            .update({ status: 'pending_verification' })
            .eq('id', transactionIdToUse);
          
          console.log(`[process-payment] Manual transfer ${transactionIdToUse} status set to pending_verification`);
          
          // ========= NOTIFY PANEL OWNER ABOUT PENDING DEPOSIT =========
          try {
            // Get panel owner
            const { data: panelOwnerData } = await supabase
              .from('panels')
              .select('owner_id, name')
              .eq('id', panelId)
              .single();
            
            if (panelOwnerData?.owner_id) {
              // Get buyer info for notification
              const { data: buyerData } = await supabase
                .from('client_users')
                .select('email, full_name')
                .eq('id', buyerId)
                .single();
              
              const buyerName = buyerData?.full_name || buyerData?.email || 'A customer';
              const gatewayDisplayName = gateway.replace('manual_', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
              
              // Create in-app notification for panel owner
              await supabase.from('panel_notifications').insert({
                panel_id: panelId,
                user_id: panelOwnerData.owner_id,
                type: 'warning',
                title: 'New Deposit Pending Verification',
                message: `${buyerName} submitted a manual deposit of $${amount.toFixed(2)} via ${gatewayDisplayName}. Please verify and approve in Transactions.`,
                is_read: false,
              });
              
              console.log(`[process-payment] Panel owner notification created for pending deposit ${transactionIdToUse}`);
              
              // Get owner email for email notification
              const { data: ownerProfile } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', panelOwnerData.owner_id)
                .single();
              
              if (ownerProfile?.email) {
                // Call send-notification for email
                await supabase.functions.invoke('send-notification', {
                  body: {
                    panelId,
                    userId: panelOwnerData.owner_id,
                    type: 'pending_deposit',
                    title: 'New Deposit Pending Verification',
                    message: `${buyerName} submitted a manual deposit of $${amount.toFixed(2)} via ${gatewayDisplayName}. Log in to approve.`,
                    sendEmail: true,
                    emailTo: ownerProfile.email,
                    metadata: {
                      transactionId: transactionIdToUse,
                      amount,
                      gateway,
                      buyerEmail: buyerData?.email
                    }
                  }
                });
                console.log(`[process-payment] Email notification sent to panel owner: ${ownerProfile.email}`);
              }
            }
          } catch (notifyError) {
            // Don't fail the payment if notification fails
            console.error(`[process-payment] Failed to notify panel owner:`, notifyError);
          }
          // ========= END NOTIFICATION =========
          
          return new Response(
            JSON.stringify({ 
              success: true,
              gateway: gateway,
              requiresManualTransfer: true,
              transactionId: transactionIdToUse,
              amount,
              currency: currency.toUpperCase(),
              config: gatewayConfig,
              message: 'Please complete the transfer manually. Your balance will be credited once payment is confirmed.',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: false, error: `Unsupported gateway: ${gateway}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update transaction with external payment ID
    if (paymentId) {
      await supabase
        .from('transactions')
        .update({ 
          external_id: paymentId,
          status: 'processing'
        })
        .eq('id', transactionIdToUse);
    }

    console.log(`[process-payment] Payment initiated: ${gateway}, redirect: ${redirectUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        redirectUrl,
        paymentId,
        transactionId: transactionIdToUse,
        gateway
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[process-payment] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
