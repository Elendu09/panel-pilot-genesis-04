import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-paystack-signature, x-flutterwave-signature, x-squad-signature, x-webhook-signature, x-callback-token, x-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// === Signature verification helpers (Web Crypto / Deno) ===
const enc = new TextEncoder();

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(algorithm: 'SHA-256' | 'SHA-512', secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: algorithm }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return bytesToHex(sig);
}

async function sha512Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-512', enc.encode(data));
  return bytesToHex(buf);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Load the per-tenant gateway config by following the transaction reference
 * back to the owning panel's `settings.payments.enabledMethods` entry — the
 * same source process-payment uses at initiation. This keeps secret-of-record
 * authority on the panel level so each tenant's webhook is verified with the
 * exact credentials they configured. Falls back to the platform-level
 * provider config (rarely populated) only if no panel match is found.
 */
async function loadGatewayConfigForTransaction(
  supabase: any,
  transactionRef: string | null,
  providerName: string,
): Promise<Record<string, any> | null> {
  if (transactionRef) {
    const { data: tx } = await supabase
      .from('transactions')
      .select('panel_id')
      .eq('id', transactionRef)
      .maybeSingle();
    const panelId = tx?.panel_id;
    if (panelId) {
      const { data: panel } = await supabase
        .from('panels')
        .select('settings')
        .eq('id', panelId)
        .maybeSingle();
      const settings = (panel?.settings as Record<string, any>) || {};
      const enabledMethods: any[] = settings?.payments?.enabledMethods || [];
      const match = enabledMethods.find((m) => {
        const id = typeof m === 'string' ? m : m?.id;
        return id === providerName;
      });
      if (match && typeof match === 'object') return match as Record<string, any>;
    }
  }
  // Fall back to platform-level provider defaults, if any.
  const { data: platformRow } = await supabase
    .from('platform_payment_providers')
    .select('config')
    .eq('provider_name', providerName)
    .maybeSingle();
  return (platformRow?.config as Record<string, any>) || null;
}

function unauthorized(reason: string): Response {
  console.warn(`[payment-webhook] Rejecting webhook: ${reason}`);
  return new Response(JSON.stringify({ received: false, error: reason }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const gateway = url.searchParams.get('gateway') || 'stripe';
    
    console.log(`[payment-webhook] Received ${gateway} webhook`);

    const body = await req.text();
    let event: any;
    let transactionId: string | null = null;
    let status: 'completed' | 'failed' = 'failed';
    let amount: number = 0;
    let buyerId: string | null = null;
    let panelId: string | null = null;

    switch (gateway) {
      case 'stripe': {
        event = JSON.parse(body);
        // In production, verify webhook signature with Stripe
        // const sig = req.headers.get('stripe-signature');
        
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          transactionId = session.metadata?.transactionId;
          status = 'completed';
          amount = (session.amount_total || 0) / 100;
          buyerId = session.metadata?.buyerId;
          panelId = session.metadata?.panelId;
          console.log(`[payment-webhook] Stripe checkout completed: ${transactionId}, amount: ${amount}`);
        } else if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
          const session = event.data.object;
          transactionId = session.metadata?.transactionId;
          status = 'failed';
        }
        break;
      }

      case 'paypal': {
        event = JSON.parse(body);
        if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
          const resource = event.resource;
          transactionId = resource.purchase_units?.[0]?.custom_id;
          status = 'completed';
          amount = parseFloat(resource.purchase_units?.[0]?.amount?.value || '0');
          console.log(`[payment-webhook] PayPal payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.event_type === 'PAYMENT.CAPTURE.DENIED' || event.event_type === 'CHECKOUT.ORDER.CANCELLED') {
          transactionId = event.resource?.purchase_units?.[0]?.custom_id;
          status = 'failed';
        }
        break;
      }

      case 'coinbase': {
        event = JSON.parse(body);
        if (event.event?.type === 'charge:confirmed' || event.event?.type === 'charge:resolved') {
          const charge = event.event.data;
          transactionId = charge.metadata?.transactionId;
          status = 'completed';
          amount = parseFloat(charge.pricing?.local?.amount || '0');
          buyerId = charge.metadata?.buyerId;
          panelId = charge.metadata?.panelId;
          console.log(`[payment-webhook] Coinbase payment confirmed: ${transactionId}, amount: ${amount}`);
        } else if (event.event?.type === 'charge:failed' || event.event?.type === 'charge:expired') {
          const charge = event.event.data;
          transactionId = charge.metadata?.transactionId;
          status = 'failed';
        }
        break;
      }

      case 'flutterwave': {
        event = JSON.parse(body);
        // Verify webhook signature in production
        // const signature = req.headers.get('verif-hash');
        
        if (event.event === 'charge.completed' && event.data?.status === 'successful') {
          transactionId = event.data?.tx_ref;
          status = 'completed';
          amount = parseFloat(event.data?.amount || '0');
          panelId = event.data?.meta?.panelId;
          buyerId = event.data?.meta?.buyerId;
          console.log(`[payment-webhook] Flutterwave payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.event === 'charge.failed' || event.data?.status === 'failed') {
          transactionId = event.data?.tx_ref;
          status = 'failed';
        }
        break;
      }

      case 'paystack': {
        event = JSON.parse(body);
        // Verify webhook signature in production
        // const signature = req.headers.get('x-paystack-signature');
        
        if (event.event === 'charge.success') {
          transactionId = event.data?.reference;
          status = 'completed';
          amount = (event.data?.amount || 0) / 100; // Paystack uses kobo
          panelId = event.data?.metadata?.panelId;
          buyerId = event.data?.metadata?.buyerId;
          console.log(`[payment-webhook] Paystack payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.event === 'charge.failed') {
          transactionId = event.data?.reference;
          status = 'failed';
        }
        break;
      }

      case 'korapay': {
        event = JSON.parse(body);
        if (event.event === 'charge.success' || event.data?.status === 'success') {
          transactionId = event.data?.reference;
          status = 'completed';
          amount = parseFloat(event.data?.amount || '0');
          panelId = event.data?.metadata?.panelId;
          buyerId = event.data?.metadata?.buyerId;
          console.log(`[payment-webhook] Kora Pay payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.event === 'charge.failed' || event.data?.status === 'failed') {
          transactionId = event.data?.reference;
          status = 'failed';
        }
        break;
      }

      case 'razorpay': {
        event = JSON.parse(body);
        // Verify webhook signature in production
        
        if (event.event === 'payment.captured' || event.event === 'order.paid') {
          const payment = event.payload?.payment?.entity || event.payload?.order?.entity;
          transactionId = payment?.receipt || payment?.notes?.transactionId;
          status = 'completed';
          amount = (payment?.amount || 0) / 100; // Razorpay uses paise
          panelId = payment?.notes?.panelId;
          buyerId = payment?.notes?.buyerId;
          console.log(`[payment-webhook] Razorpay payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.event === 'payment.failed') {
          const payment = event.payload?.payment?.entity;
          transactionId = payment?.receipt || payment?.notes?.transactionId;
          status = 'failed';
        }
        break;
      }

      case 'monnify': {
        event = JSON.parse(body);
        if (event.eventType === 'SUCCESSFUL_TRANSACTION' || event.eventData?.paymentStatus === 'PAID') {
          transactionId = event.eventData?.paymentReference;
          status = 'completed';
          amount = parseFloat(event.eventData?.amountPaid || event.eventData?.amount || '0');
          console.log(`[payment-webhook] Monnify payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.eventType === 'FAILED_TRANSACTION' || event.eventData?.paymentStatus === 'FAILED') {
          transactionId = event.eventData?.paymentReference;
          status = 'failed';
        }
        break;
      }

      case 'mercadopago': {
        event = JSON.parse(body);
        if (event.type === 'payment' && event.action === 'payment.created') {
          // Fetch payment details from Mercado Pago API
          transactionId = event.data?.id?.toString();
          status = 'completed';
          console.log(`[payment-webhook] Mercado Pago payment received: ${transactionId}`);
        }
        break;
      }

      case 'payu': {
        event = JSON.parse(body);
        if (event.status === 'APPROVED' || event.transactionState === 'APPROVED') {
          transactionId = event.referenceCode || event.reference;
          status = 'completed';
          amount = parseFloat(event.amount || event.value || '0');
          console.log(`[payment-webhook] PayU payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.status === 'DECLINED' || event.status === 'ERROR') {
          transactionId = event.referenceCode || event.reference;
          status = 'failed';
        }
        break;
      }

      case 'mollie': {
        event = JSON.parse(body);
        // Mollie sends payment ID, need to fetch status
        if (event.id) {
          transactionId = event.metadata?.transactionId || event.id;
          // Status would need to be fetched from Mollie API
          // For now, assume it's a success notification
          status = 'completed';
          console.log(`[payment-webhook] Mollie payment webhook: ${transactionId}`);
        }
        break;
      }

      case 'nowpayments': {
        event = JSON.parse(body);
        if (event.payment_status === 'finished' || event.payment_status === 'confirmed') {
          transactionId = event.order_id;
          status = 'completed';
          amount = parseFloat(event.price_amount || '0');
          console.log(`[payment-webhook] NowPayments completed: ${transactionId}, amount: ${amount}`);
        } else if (event.payment_status === 'failed' || event.payment_status === 'expired') {
          transactionId = event.order_id;
          status = 'failed';
        }
        break;
      }

      case 'coingate': {
        event = JSON.parse(body);
        if (event.status === 'paid') {
          transactionId = event.order_id;
          status = 'completed';
          amount = parseFloat(event.price_amount || '0');
          console.log(`[payment-webhook] CoinGate payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.status === 'canceled' || event.status === 'expired' || event.status === 'invalid') {
          transactionId = event.order_id;
          status = 'failed';
        }
        break;
      }

      case 'binancepay': {
        event = JSON.parse(body);
        if (event.bizStatus === 'PAY_SUCCESS') {
          transactionId = event.data?.merchantTradeNo;
          status = 'completed';
          amount = parseFloat(event.data?.orderAmount || '0');
          console.log(`[payment-webhook] Binance Pay completed: ${transactionId}, amount: ${amount}`);
        } else if (event.bizStatus === 'PAY_CLOSED') {
          transactionId = event.data?.merchantTradeNo;
          status = 'failed';
        }
        break;
      }

      case 'square': {
        event = JSON.parse(body);
        if (event.type === 'payment.completed' || event.data?.object?.status === 'COMPLETED') {
          transactionId = event.data?.object?.order_id || event.data?.object?.note;
          status = 'completed';
          amount = (event.data?.object?.amount_money?.amount || 0) / 100;
          buyerId = event.data?.object?.buyer_email_address;
          console.log(`[payment-webhook] Square payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.type === 'payment.failed') {
          transactionId = event.data?.object?.order_id;
          status = 'failed';
        }
        break;
      }

      case 'braintree': {
        event = JSON.parse(body);
        if (event.kind === 'transaction_settled' || event.kind === 'disbursement') {
          transactionId = event.transaction?.id || event.subject?.transactions?.[0]?.id;
          status = 'completed';
          amount = parseFloat(event.transaction?.amount || '0');
          console.log(`[payment-webhook] Braintree payment settled: ${transactionId}, amount: ${amount}`);
        } else if (event.kind === 'transaction_settled_failed' || event.kind === 'transaction_settlement_declined') {
          transactionId = event.transaction?.id;
          status = 'failed';
        }
        break;
      }

      case 'ach':
      case 'sepa': {
        // ACH/SEPA use Stripe under the hood
        event = JSON.parse(body);
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          transactionId = session.metadata?.transactionId;
          status = 'completed';
          amount = (session.amount_total || 0) / 100;
          buyerId = session.metadata?.buyerId;
          panelId = session.metadata?.panelId;
          console.log(`[payment-webhook] ${gateway.toUpperCase()} payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
          transactionId = event.data.object.metadata?.transactionId;
          status = 'failed';
        }
        break;
      }

      case 'btcpay': {
        event = JSON.parse(body);
        if (event.type === 'InvoiceSettled' || event.type === 'InvoiceProcessing') {
          transactionId = event.invoiceId || event.metadata?.orderId;
          status = 'completed';
          amount = parseFloat(event.price || event.btcPaid || '0');
          console.log(`[payment-webhook] BTCPay invoice settled: ${transactionId}, amount: ${amount}`);
        } else if (event.type === 'InvoiceExpired' || event.type === 'InvoiceInvalid') {
          transactionId = event.invoiceId;
          status = 'failed';
        }
        break;
      }

      case 'wise': {
        event = JSON.parse(body);
        if (event.event_type === 'transfers#state-change' && event.data?.current_state === 'outgoing_payment_sent') {
          transactionId = event.data?.resource?.id?.toString();
          status = 'completed';
          amount = parseFloat(event.data?.resource?.targetValue || '0');
          console.log(`[payment-webhook] Wise transfer completed: ${transactionId}, amount: ${amount}`);
        } else if (event.data?.current_state === 'cancelled' || event.data?.current_state === 'funds_refunded') {
          transactionId = event.data?.resource?.id?.toString();
          status = 'failed';
        }
        break;
      }

      case 'cryptomus': {
        // Cryptomus crypto payment webhook
        event = JSON.parse(body);
        // Cryptomus status: paid, paid_over, wrong_amount, process, confirm_check, wrong_amount_waiting, check, fail, cancel, system_fail, refund_process, refund_fail, refund_paid
        if (event.status === 'paid' || event.status === 'paid_over') {
          transactionId = event.order_id;
          status = 'completed';
          amount = parseFloat(event.amount || '0');
          // Parse additional data for panelId and buyerId
          try {
            const additionalData = JSON.parse(event.additional_data || '{}');
            panelId = additionalData.panelId;
            buyerId = additionalData.buyerId;
          } catch (e) {
            console.log('[payment-webhook] Cryptomus: Could not parse additional_data');
          }
          console.log(`[payment-webhook] Cryptomus payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.status === 'fail' || event.status === 'cancel' || event.status === 'system_fail') {
          transactionId = event.order_id;
          status = 'failed';
        }
        break;
      }

      case 'squad': {
        // Pre-parse to extract our internal transaction ref so we can resolve
        // the panel-scoped gateway config (same secret used at initiation).
        const preEvent = JSON.parse(body);
        const preTx = preEvent.TransactionRef
          || preEvent.Body?.transaction_ref
          || preEvent.Body?.merchant_reference
          || preEvent.data?.transaction_ref;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'squad');
        const secret = cfg?.secretKey || cfg?.secret_key || cfg?.webhookSecret;
        if (!secret) return unauthorized('squad: panel webhook secret not configured');
        const sigHeader = (req.headers.get('x-squad-signature') || req.headers.get('squad-signature') || '').toLowerCase();
        const expected = await hmacHex('SHA-512', secret, body);
        if (!timingSafeEqual(sigHeader, expected)) {
          return unauthorized('squad: invalid signature');
        }
        event = preEvent;
        // Squad: { Event: 'charge_successful', TransactionRef, Body: { transaction_status, ... } }
        const evtType = event.Event || event.event;
        const txData = event.Body || event.data || {};
        if (evtType === 'charge_successful' || txData.transaction_status === 'success') {
          transactionId = event.TransactionRef || txData.transaction_ref || txData.merchant_reference;
          status = 'completed';
          amount = parseFloat(txData.transaction_amount || txData.amount || '0') / 100;
          panelId = txData.metadata?.panelId;
          buyerId = txData.metadata?.buyerId;
          console.log(`[payment-webhook] Squad payment completed: ${transactionId}, amount: ${amount}`);
        } else if (evtType === 'charge_failed') {
          transactionId = event.TransactionRef || txData.transaction_ref;
          status = 'failed';
        }
        break;
      }

      case 'lenco': {
        const preEvent = JSON.parse(body);
        const preTx = preEvent.data?.reference;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'lenco');
        const secret = cfg?.webhookSecret || cfg?.webhook_secret || cfg?.secretKey;
        if (!secret) return unauthorized('lenco: panel webhook secret not configured');
        const sigHeader = (req.headers.get('x-webhook-signature') || '').toLowerCase();
        const expected = await hmacHex('SHA-256', secret, body);
        if (!timingSafeEqual(sigHeader, expected)) {
          return unauthorized('lenco: invalid signature');
        }
        event = preEvent;
        // Lenco: { event: 'collection.successful' | 'collection.failed', data: { reference, amount } }
        if (event.event === 'collection.successful' || event.data?.status === 'successful') {
          transactionId = event.data?.reference;
          status = 'completed';
          amount = parseFloat(event.data?.amount || '0');
          console.log(`[payment-webhook] Lenco payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.event === 'collection.failed' || event.data?.status === 'failed') {
          transactionId = event.data?.reference;
          status = 'failed';
        }
        break;
      }

      case 'toyyibpay': {
        // toyyibPay does not sign callbacks. Verify out-of-band by re-fetching
        // the bill from toyyibPay's API using the panel-configured secret key.
        const params = new URLSearchParams(body);
        const billCode = params.get('billcode') || params.get('billCode');
        const preTx = params.get('order_id') || params.get('billExternalReferenceNo');
        if (!billCode) return unauthorized('toyyibpay: missing billcode');
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'toyyibpay');
        const secret = cfg?.secretKey || cfg?.userSecretKey;
        if (!secret) return unauthorized('toyyibpay: panel secret key not configured');
        const baseUrl = cfg?.sandbox ? 'https://dev.toyyibpay.com' : 'https://toyyibpay.com';
        const verifyResp = await fetch(`${baseUrl}/index.php/api/getBillTransactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ userSecretKey: secret, billCode }).toString(),
        });
        if (!verifyResp.ok) return unauthorized('toyyibpay: callback verification failed');
        const verifyData = await verifyResp.json().catch(() => null);
        const verified = Array.isArray(verifyData) && verifyData.find(
          (t: any) => String(t.billpaymentStatus) === String(params.get('status_id'))
        );
        if (!verified) return unauthorized('toyyibpay: callback does not match billing record');
        const statusId = params.get('status_id');
        transactionId = params.get('order_id') || params.get('billExternalReferenceNo');
        amount = parseFloat(params.get('amount') || '0') / 100;
        if (statusId === '1') {
          status = 'completed';
          console.log(`[payment-webhook] toyyibPay payment completed: ${transactionId}, amount: ${amount}`);
        } else if (statusId === '3') {
          status = 'failed';
        } else {
          // status 2 = pending; ignore
          transactionId = null;
        }
        break;
      }

      case 'billplz': {
        // Billplz x_signature: HMAC-SHA256 of `key1value1|key2value2|...` (sorted),
        // excluding `x_signature` itself, using the X-Signature key from Billplz.
        const params = new URLSearchParams(body);
        const preTx = params.get('reference_1') || params.get('id');
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'billplz');
        const xSignatureKey = cfg?.xSignatureKey || cfg?.x_signature_key;
        if (!xSignatureKey) return unauthorized('billplz: panel x_signature key not configured');
        const provided = params.get('x_signature') || '';
        const sortedKeys = [...params.keys()].filter((k) => k !== 'x_signature').sort();
        const source = sortedKeys.map((k) => `${k}${params.get(k) ?? ''}`).join('|');
        const expected = await hmacHex('SHA-256', xSignatureKey, source);
        if (!timingSafeEqual(provided.toLowerCase(), expected)) {
          return unauthorized('billplz: invalid x_signature');
        }
        transactionId = params.get('reference_1') || params.get('id');
        amount = parseFloat(params.get('amount') || '0') / 100;
        const paid = params.get('paid');
        if (paid === 'true') {
          status = 'completed';
          console.log(`[payment-webhook] Billplz payment completed: ${transactionId}, amount: ${amount}`);
        } else {
          status = 'failed';
        }
        break;
      }

      case 'midtrans': {
        // Midtrans signature_key = SHA-512(order_id + status_code + gross_amount + server_key)
        event = JSON.parse(body);
        const preTx = event.order_id;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'midtrans');
        const serverKey = cfg?.serverKey || cfg?.server_key;
        if (!serverKey) return unauthorized('midtrans: panel server key not configured');
        const provided = (event.signature_key || '').toLowerCase();
        const expected = await sha512Hex(
          `${event.order_id || ''}${event.status_code || ''}${event.gross_amount || ''}${serverKey}`
        );
        if (!timingSafeEqual(provided, expected)) {
          return unauthorized('midtrans: invalid signature_key');
        }
        // Midtrans: transaction_status = capture, settlement, pending, deny, cancel, expire, failure
        transactionId = event.order_id;
        amount = parseFloat(event.gross_amount || '0');
        const ts = event.transaction_status;
        if (ts === 'capture' || ts === 'settlement') {
          status = 'completed';
          console.log(`[payment-webhook] Midtrans payment completed: ${transactionId}, amount: ${amount}`);
        } else if (ts === 'deny' || ts === 'cancel' || ts === 'expire' || ts === 'failure') {
          status = 'failed';
        } else {
          // pending; ignore
          transactionId = null;
        }
        break;
      }

      case 'xendit': {
        // Xendit uses a static callback verification token in `x-callback-token`.
        event = JSON.parse(body);
        const preTx = event.external_id;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'xendit');
        const expectedToken = cfg?.callbackToken || cfg?.callback_token || cfg?.webhookToken;
        if (!expectedToken) return unauthorized('xendit: panel callback token not configured');
        const provided = req.headers.get('x-callback-token') || '';
        if (!timingSafeEqual(provided, expectedToken)) {
          return unauthorized('xendit: invalid callback token');
        }
        // Xendit invoice webhook: { external_id, status: 'PAID' | 'EXPIRED' | 'FAILED', paid_amount }
        transactionId = event.external_id;
        amount = parseFloat(event.paid_amount || event.amount || '0');
        if (event.status === 'PAID' || event.status === 'SETTLED') {
          status = 'completed';
          console.log(`[payment-webhook] Xendit payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.status === 'EXPIRED' || event.status === 'FAILED') {
          status = 'failed';
        }
        break;
      }

      default: {
        console.log(`[payment-webhook] Unknown gateway: ${gateway}`);
        return new Response(
          JSON.stringify({ received: true, processed: false, reason: 'Unknown gateway' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!transactionId) {
      console.log('[payment-webhook] No transaction ID found, ignoring event');
      return new Response(
        JSON.stringify({ received: true, processed: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction status
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (txError) {
      console.error('[payment-webhook] Error updating transaction by id:', txError);
      // Try to find by external_id
      const { data: txByExternal } = await supabase
        .from('transactions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('external_id', transactionId)
        .select()
        .single();
      
      if (!txByExternal) {
        // Secondary fallback: search by metadata->transactionId
        console.log('[payment-webhook] Trying metadata lookup for:', transactionId);
        const { data: allPending } = await supabase
          .from('transactions')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(50);
        
        const matchedTx = allPending?.find((t: any) => {
          const meta = t.metadata as Record<string, any> || {};
          return meta.transactionId === transactionId || t.external_id === transactionId;
        });

        if (matchedTx) {
          await supabase.from('transactions').update({ status, updated_at: new Date().toISOString() }).eq('id', matchedTx.id);
          console.log(`[payment-webhook] Found via metadata fallback: ${matchedTx.id}`);
          // Use matched tx for balance updates below
          Object.assign(transaction || {}, matchedTx);
        } else {
          return new Response(
            JSON.stringify({ error: 'Transaction not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    const tx = transaction || null;

    // If payment completed, handle based on transaction type
    if (status === 'completed') {
      const userId = tx?.user_id || buyerId;
      const depositAmount = tx?.amount || amount;
      const txPanelId = tx?.panel_id || panelId;
      const txType = tx?.type || 'deposit';
      const txMetadata = tx?.metadata as Record<string, any> || {};
      const orderId = txMetadata?.orderId;

      if (userId) {
        // Check if this is an order payment or a deposit
        if (txType === 'order_payment' && orderId) {
          // This is a direct order payment - update order status, don't credit balance
          const { error: orderError } = await supabase
            .from('orders')
            .update({ 
              status: 'pending', // Move from awaiting_payment to pending
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

          if (orderError) {
            console.error('[payment-webhook] Error updating order:', orderError);
          } else {
            console.log(`[payment-webhook] Order ${orderId} moved to pending after payment`);
          }

          // Create notification for order payment success
          await supabase
            .from('buyer_notifications')
            .insert({
              buyer_id: userId,
              panel_id: txPanelId,
              order_id: orderId,
              type: 'order',
              title: 'Order Payment Successful',
              message: `Your payment of $${depositAmount.toFixed(2)} was successful. Your order is now being processed.`,
            });
        } else {
          // Route by metadata type to prevent fall-through and double-crediting
          if (txMetadata?.type === 'subscription' && txPanelId) {
            // === SUBSCRIPTION PAYMENT ===
            const planName = txMetadata.plan || 'basic';
            
            await supabase.from('panels').update({
              subscription_tier: planName,
              subscription_status: 'active',
            }).eq('id', txPanelId);
            
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            
            await supabase.from('panel_subscriptions').upsert({
              panel_id: txPanelId,
              plan_type: planName,
              price: depositAmount,
              status: 'active',
              started_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            }, { onConflict: 'panel_id' });
            
            console.log(`[payment-webhook] Subscription updated: ${planName} for panel ${txPanelId}`);

            const { data: subPanel } = await supabase
              .from('panels')
              .select('owner_id')
              .eq('id', txPanelId)
              .single();

            if (subPanel?.owner_id) {
              await supabase.from('panel_notifications').insert({
                panel_id: txPanelId,
                user_id: subPanel.owner_id,
                type: 'payment',
                title: 'Subscription Activated',
                message: `Your ${planName} plan subscription has been activated successfully.`,
              });
            }
            // STOP — don't fall through to deposit logic
          } else if (txMetadata?.type === 'panel_deposit' && txPanelId) {
            // === PANEL OWNER DEPOSIT — credit panels.balance directly ===
            const { data: panelData } = await supabase
              .from('panels')
              .select('balance, owner_id')
              .eq('id', txPanelId)
              .single();

            if (panelData) {
              const newBalance = (panelData.balance || 0) + depositAmount;
              await supabase
                .from('panels')
                .update({ balance: newBalance })
                .eq('id', txPanelId);
              console.log(`[payment-webhook] Credited $${depositAmount} to panel ${txPanelId}, new balance: ${newBalance}`);

              await supabase.from('panel_notifications').insert({
                panel_id: txPanelId,
                user_id: panelData.owner_id || userId,
                type: 'payment',
                title: 'Deposit Successful',
                message: `$${depositAmount.toFixed(2)} has been added to your panel balance via ${gateway}.`,
              });
            }
            // STOP — don't fall through to buyer deposit logic
          } else if (txMetadata?.type === 'commission_payment' && txPanelId) {
            // === COMMISSION PAYMENT — just mark as paid, don't credit balance ===
            console.log(`[payment-webhook] Commission payment of $${depositAmount} received for panel ${txPanelId}`);
            
            await supabase.from('panel_notifications').insert({
              panel_id: txPanelId,
              user_id: userId,
              type: 'payment',
              title: 'Commission Paid',
              message: `Commission payment of $${depositAmount.toFixed(2)} has been processed.`,
            });
            // STOP
          } else {
            // === REGULAR BUYER DEPOSIT — credit client_users.balance ===
            // Balance is always in USD — use amount_usd if available for foreign currency deposits
            const txCurrency = (tx?.currency || txMetadata?.currency || 'USD') as string;
            const amountUsd = tx?.amount_usd || txMetadata?.amountUsd;
            const creditAmount = (txCurrency !== 'USD' && amountUsd) ? Number(amountUsd) : depositAmount;
            
            const { data: buyer } = await supabase
              .from('client_users')
              .select('balance, total_spent')
              .eq('id', userId)
              .single();

            if (buyer) {
              const newBalance = (buyer.balance || 0) + creditAmount;
              
              await supabase
                .from('client_users')
                .update({ 
                  balance: newBalance
                })
                .eq('id', userId);

              console.log(`[payment-webhook] Credited $${creditAmount} USD to buyer ${userId} (paid ${txCurrency} ${depositAmount}), new balance: ${newBalance}`);

              await supabase
                .from('buyer_notifications')
                .insert({
                  buyer_id: userId,
                  panel_id: txPanelId,
                  type: 'deposit',
                  title: 'Deposit Successful',
                  message: txCurrency !== 'USD' 
                    ? `${txCurrency} ${depositAmount.toFixed(2)} (≈ $${creditAmount.toFixed(2)} USD) has been added to your account via ${gateway}`
                    : `$${creditAmount.toFixed(2)} has been added to your account via ${gateway}`,
                });

              if (txPanelId) {
                const { data: panelOwner } = await supabase
                  .from('panels')
                  .select('owner_id')
                  .eq('id', txPanelId)
                  .single();

                if (panelOwner?.owner_id) {
                  await supabase
                    .from('panel_notifications')
                    .insert({
                      panel_id: txPanelId,
                      user_id: panelOwner.owner_id,
                      type: 'payment',
                      title: 'Payment Received',
                      message: `A deposit of $${depositAmount.toFixed(2)} was completed via ${gateway}.`,
                    });
                }
              }
            } else if (txPanelId) {
              // Fallback: no client_user found, check if panel owner deposit without metadata
              const { data: panelData } = await supabase
                .from('panels')
                .select('balance, owner_id')
                .eq('id', txPanelId)
                .single();

              if (panelData && panelData.owner_id === userId) {
                const newBalance = (panelData.balance || 0) + depositAmount;
                await supabase
                  .from('panels')
                  .update({ balance: newBalance })
                  .eq('id', txPanelId);
                console.log(`[payment-webhook] Fallback: Credited $${depositAmount} to panel ${txPanelId}`);

                await supabase.from('panel_notifications').insert({
                  panel_id: txPanelId,
                  user_id: userId,
                  type: 'payment',
                  title: 'Deposit Successful',
                  message: `$${depositAmount.toFixed(2)} has been added to your panel balance via ${gateway}.`,
                });
              }
            }
          }
        }
      }
    } else if (status === 'failed') {
      const userId = tx?.user_id || buyerId;
      const txPanelId = tx?.panel_id || panelId;
      const failedAmount = tx?.amount || amount;
      
      if (userId) {
        // Create notification for failed payment (buyer)
        await supabase
          .from('buyer_notifications')
          .insert({
            buyer_id: userId,
            panel_id: txPanelId,
            type: 'payment',
            title: 'Payment Failed',
            message: `Your ${gateway} payment could not be processed. Please try again.`,
          });
      }

      // Notify panel owner about failed payment
      if (txPanelId) {
        try {
          const { data: panelOwner } = await supabase
            .from('panels')
            .select('owner_id')
            .eq('id', txPanelId)
            .single();

          if (panelOwner?.owner_id) {
            await supabase.from('panel_notifications').insert({
              panel_id: txPanelId,
              user_id: panelOwner.owner_id,
              type: 'payment',
              title: 'Payment Failed',
              message: `A ${gateway} payment of $${failedAmount.toFixed(2)} failed.`,
            });
          }
        } catch (notifErr) {
          console.error('[payment-webhook] Panel owner fail notification error:', notifErr);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        received: true, 
        processed: true,
        transactionId,
        status,
        gateway
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[payment-webhook] Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
