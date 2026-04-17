import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto as stdCrypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-paystack-signature, x-flutterwave-signature, verif-hash, x-squad-signature, x-webhook-signature, x-callback-token, x-signature, x-request-id, x-korapay-signature, x-razorpay-signature, monnify-signature, x-cc-webhook-signature, x-nowpayments-sig, btcpay-sig, x-square-hmacsha256-signature, binancepay-timestamp, binancepay-nonce, binancepay-signature, paypal-auth-algo, paypal-cert-url, paypal-transmission-id, paypal-transmission-sig, paypal-transmission-time, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// === Signature verification helpers (Web Crypto / Deno) ===
const enc = new TextEncoder();

function bytesToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function hmacHex(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512', secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: algorithm }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return bytesToHex(sig);
}

async function hmacBase64(algorithm: 'SHA-256' | 'SHA-512', secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: algorithm }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return bytesToBase64(sig);
}

async function sha1Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-1', enc.encode(data));
  return bytesToHex(buf);
}

async function sha512Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-512', enc.encode(data));
  return bytesToHex(buf);
}

async function md5Hex(data: string): Promise<string> {
  // Web Crypto subtle does not implement MD5; use Deno std crypto which does.
  const buf = await stdCrypto.subtle.digest('MD5', enc.encode(data));
  return bytesToHex(buf as ArrayBuffer);
}

function sortObjectDeep(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObjectDeep);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((acc: any, k) => {
      acc[k] = sortObjectDeep(obj[k]);
      return acc;
    }, {});
  }
  return obj;
}

function parseKvHeader(h: string): Record<string, string> {
  return Object.fromEntries(
    h.split(',').map((p) => p.trim().split('=')).filter((p) => p.length === 2 && p[0])
  );
}

// Stripe sends potentially multiple `v1=...` entries in `stripe-signature`
// during signing-secret rotation. Collect every value for the requested key.
function parseKvHeaderMulti(h: string, key: string): string[] {
  return h.split(',')
    .map((p) => p.trim().split('='))
    .filter((p) => p.length === 2 && p[0] === key)
    .map((p) => p[1]);
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
    // Try multiple resolution strategies: internal id, provider-native
    // external_id, and metadata fields. Webhook payloads commonly carry
    // the provider's own id (Mollie/MercadoPago/Wise/Braintree) rather
    // than our internal transaction uuid, so we have to look in several
    // places to find the owning panel before we can load its secrets.
    let panelId: string | null = null;
    // Internal uuid lookup
    const { data: txById } = await supabase
      .from('transactions')
      .select('panel_id')
      .eq('id', transactionRef)
      .maybeSingle();
    panelId = txById?.panel_id || null;
    // External provider id lookup
    if (!panelId) {
      const { data: txByExternal } = await supabase
        .from('transactions')
        .select('panel_id')
        .eq('external_id', String(transactionRef))
        .maybeSingle();
      panelId = txByExternal?.panel_id || null;
    }
    // Metadata fallback (recent pending only — bounded scan)
    if (!panelId) {
      const { data: candidates } = await supabase
        .from('transactions')
        .select('panel_id, metadata, external_id')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(100);
      const ref = String(transactionRef);
      const hit = (candidates || []).find((t: any) => {
        const m = (t.metadata || {}) as Record<string, any>;
        return m.transactionId === ref || m.orderId === ref || m.externalId === ref || t.external_id === ref;
      });
      panelId = hit?.panel_id || null;
    }
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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.data?.object?.metadata?.transactionId;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'stripe');
        const secret = cfg?.webhookSecret || cfg?.webhook_secret
          || cfg?.signingSecret || cfg?.signing_secret
          || Deno.env.get('STRIPE_WEBHOOK_SECRET');
        if (!secret) return unauthorized('stripe: webhook signing secret not configured');
        const sigHeader = req.headers.get('stripe-signature') || '';
        const t = parseKvHeader(sigHeader)['t'];
        const v1List = parseKvHeaderMulti(sigHeader, 'v1').map((s) => s.toLowerCase());
        if (!t || v1List.length === 0) return unauthorized('stripe: malformed signature header');
        const expected = await hmacHex('SHA-256', secret, `${t}.${body}`);
        if (!v1List.some((v) => timingSafeEqual(v, expected))) return unauthorized('stripe: invalid signature');
        // Reject signatures older than 5 minutes to prevent replay
        const tsAge = Math.abs(Date.now() / 1000 - parseInt(t, 10));
        if (!Number.isFinite(tsAge) || tsAge > 300) return unauthorized('stripe: signature timestamp out of tolerance');
        event = preEvent;

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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.resource?.purchase_units?.[0]?.custom_id
          || preEvent.resource?.custom_id
          || preEvent.resource?.invoice_id;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'paypal');
        const webhookId = cfg?.webhookId || cfg?.webhook_id;
        const clientId = cfg?.apiKey || cfg?.api_key || cfg?.clientId || cfg?.client_id;
        const clientSecret = cfg?.secretKey || cfg?.secret_key;
        if (!webhookId || !clientId || !clientSecret) {
          return unauthorized('paypal: webhookId/clientId/clientSecret not configured');
        }
        // Get PayPal access token to verify the webhook signature via PayPal API
        const sandbox = !!cfg?.sandbox;
        const apiBase = sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
        const tokenResp = await fetch(`${apiBase}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });
        const tokenJson = await tokenResp.json().catch(() => null);
        const accessToken = tokenJson?.access_token;
        if (!accessToken) return unauthorized('paypal: failed to obtain access token');
        const verifyBody = {
          auth_algo: req.headers.get('paypal-auth-algo'),
          cert_url: req.headers.get('paypal-cert-url'),
          transmission_id: req.headers.get('paypal-transmission-id'),
          transmission_sig: req.headers.get('paypal-transmission-sig'),
          transmission_time: req.headers.get('paypal-transmission-time'),
          webhook_id: webhookId,
          webhook_event: preEvent,
        };
        if (!verifyBody.auth_algo || !verifyBody.cert_url || !verifyBody.transmission_id
          || !verifyBody.transmission_sig || !verifyBody.transmission_time) {
          return unauthorized('paypal: missing webhook signature headers');
        }
        const verifyResp = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(verifyBody),
        });
        const verifyJson = await verifyResp.json().catch(() => null);
        if (verifyJson?.verification_status !== 'SUCCESS') {
          return unauthorized('paypal: signature verification failed');
        }
        event = preEvent;
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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.event?.data?.metadata?.transactionId;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'coinbase');
        const sharedSecret = cfg?.webhookSecret || cfg?.webhook_secret
          || cfg?.sharedSecret || cfg?.shared_secret;
        if (!sharedSecret) return unauthorized('coinbase: webhook shared secret not configured');
        const sigHeader = (req.headers.get('x-cc-webhook-signature') || '').toLowerCase();
        const expected = await hmacHex('SHA-256', sharedSecret, body);
        if (!timingSafeEqual(sigHeader, expected)) return unauthorized('coinbase: invalid signature');
        event = preEvent;
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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.data?.tx_ref;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'flutterwave');
        const secretHash = cfg?.webhookSecret || cfg?.webhook_secret
          || cfg?.secretHash || cfg?.secret_hash;
        if (!secretHash) return unauthorized('flutterwave: secret hash not configured');
        const provided = req.headers.get('verif-hash') || '';
        if (!timingSafeEqual(provided, secretHash)) return unauthorized('flutterwave: invalid verif-hash');
        event = preEvent;
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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.data?.reference;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'paystack');
        const secret = cfg?.secretKey || cfg?.secret_key;
        if (!secret) return unauthorized('paystack: secret key not configured');
        const sigHeader = (req.headers.get('x-paystack-signature') || '').toLowerCase();
        const expected = await hmacHex('SHA-512', secret, body);
        if (!timingSafeEqual(sigHeader, expected)) return unauthorized('paystack: invalid signature');
        event = preEvent;
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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.data?.reference;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'korapay');
        const secret = cfg?.secretKey || cfg?.secret_key;
        if (!secret) return unauthorized('korapay: secret key not configured');
        const sigHeader = (req.headers.get('x-korapay-signature') || '').toLowerCase();
        // Kora Pay signs the JSON-stringified `data` field with the secret key (HMAC-SHA256)
        const expected = await hmacHex('SHA-256', secret, JSON.stringify(preEvent.data ?? {}));
        if (!timingSafeEqual(sigHeader, expected)) return unauthorized('korapay: invalid signature');
        event = preEvent;
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
        const preEvent = JSON.parse(body);
        const prePay = preEvent.payload?.payment?.entity || preEvent.payload?.order?.entity;
        const preTx = prePay?.notes?.transactionId || prePay?.receipt;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'razorpay');
        const webhookSecret = cfg?.webhookSecret || cfg?.webhook_secret;
        if (!webhookSecret) return unauthorized('razorpay: webhook secret not configured');
        const sigHeader = (req.headers.get('x-razorpay-signature') || '').toLowerCase();
        const expected = await hmacHex('SHA-256', webhookSecret, body);
        if (!timingSafeEqual(sigHeader, expected)) return unauthorized('razorpay: invalid signature');
        event = preEvent;
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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.eventData?.paymentReference;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'monnify');
        const secret = cfg?.secretKey || cfg?.secret_key;
        if (!secret) return unauthorized('monnify: secret key not configured');
        const sigHeader = (req.headers.get('monnify-signature') || '').toLowerCase();
        const expected = await hmacHex('SHA-512', secret, body);
        if (!timingSafeEqual(sigHeader, expected)) return unauthorized('monnify: invalid signature');
        event = preEvent;
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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.data?.id?.toString();
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'mercadopago');
        const secret = cfg?.webhookSecret || cfg?.webhook_secret || cfg?.secretKey;
        if (!secret) return unauthorized('mercadopago: webhook secret not configured');
        const sigHeader = req.headers.get('x-signature') || '';
        const parts = parseKvHeader(sigHeader);
        const ts = parts['ts'];
        const v1 = (parts['v1'] || '').toLowerCase();
        const requestId = req.headers.get('x-request-id') || '';
        const dataId = preEvent.data?.id?.toString() || '';
        if (!ts || !v1) return unauthorized('mercadopago: malformed signature header');
        const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
        const expected = await hmacHex('SHA-256', secret, manifest);
        if (!timingSafeEqual(v1, expected)) return unauthorized('mercadopago: invalid signature');
        event = preEvent;
        if (event.type === 'payment' && event.action === 'payment.created') {
          // Fetch payment details from Mercado Pago API
          transactionId = event.data?.id?.toString();
          status = 'completed';
          console.log(`[payment-webhook] Mercado Pago payment received: ${transactionId}`);
        }
        break;
      }

      case 'payu': {
        // PayU posts as form-urlencoded with `sign` field. Verify with
        // md5(ApiKey~merchantId~referenceCode~TX_VALUE~currency~transactionState).
        const params = new URLSearchParams(body);
        const preTx = params.get('reference_sale') || params.get('referenceCode') || params.get('reference');
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'payu');
        const apiKey = cfg?.apiKey || cfg?.api_key;
        const merchantId = cfg?.merchantId || cfg?.merchant_id;
        if (!apiKey || !merchantId) return unauthorized('payu: api key/merchant id not configured');
        const provided = String(params.get('sign') || params.get('signature') || '').toLowerCase();
        const refCode = String(params.get('reference_sale') || params.get('referenceCode') || '');
        // PayU rounds value to 1 decimal (or whole if integer)
        const rawValue = parseFloat(String(params.get('value') || params.get('TX_VALUE') || params.get('amount') || '0'));
        const valueStr = (Math.round(rawValue * 10) / 10).toString();
        const currency = String(params.get('currency') || '').toUpperCase();
        const txState = String(params.get('state_pol') || params.get('transactionState') || '');
        const data = `${apiKey}~${merchantId}~${refCode}~${valueStr}~${currency}~${txState}`;
        const expected = await md5Hex(data);
        if (!timingSafeEqual(provided, expected)) return unauthorized('payu: invalid signature');
        // PayU state_pol: 4 = APPROVED, 6 = DECLINED, 104 = ERROR
        const approved = txState === '4' || params.get('status') === 'APPROVED' || params.get('transactionState') === 'APPROVED';
        const declined = txState === '6' || txState === '104' || params.get('status') === 'DECLINED' || params.get('status') === 'ERROR';
        if (approved) {
          transactionId = refCode;
          status = 'completed';
          amount = rawValue;
          console.log(`[payment-webhook] PayU payment completed: ${transactionId}, amount: ${amount}`);
        } else if (declined) {
          transactionId = refCode;
          status = 'failed';
        }
        break;
      }

      case 'mollie': {
        // Mollie does not sign callbacks. The body contains only the payment id.
        // Verify by calling the Mollie API with the panel's API key.
        const params = new URLSearchParams(body);
        const paymentId = params.get('id');
        if (!paymentId) return unauthorized('mollie: missing payment id');
        const cfg = await loadGatewayConfigForTransaction(supabase, paymentId, 'mollie');
        const apiKey = cfg?.secretKey || cfg?.secret_key || cfg?.apiKey || cfg?.api_key;
        if (!apiKey) return unauthorized('mollie: api key not configured');
        const verifyResp = await fetch(`https://api.mollie.com/v2/payments/${encodeURIComponent(paymentId)}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (!verifyResp.ok) return unauthorized('mollie: payment verification failed');
        const verifyData = await verifyResp.json().catch(() => null);
        if (!verifyData?.id) return unauthorized('mollie: invalid verification response');
        event = verifyData;
        transactionId = verifyData.metadata?.transactionId || paymentId;
        amount = parseFloat(verifyData.amount?.value || '0');
        if (verifyData.status === 'paid') {
          status = 'completed';
          console.log(`[payment-webhook] Mollie payment confirmed: ${transactionId}, amount: ${amount}`);
        } else if (verifyData.status === 'failed' || verifyData.status === 'expired' || verifyData.status === 'canceled') {
          status = 'failed';
        } else {
          // Pending/open/authorized — ignore
          transactionId = null;
        }
        break;
      }

      case 'nowpayments': {
        const preEvent = JSON.parse(body);
        const preTx = preEvent.order_id;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'nowpayments');
        const ipnSecret = cfg?.ipnSecret || cfg?.ipn_secret
          || cfg?.webhookSecret || cfg?.webhook_secret;
        if (!ipnSecret) return unauthorized('nowpayments: ipn secret not configured');
        const sigHeader = (req.headers.get('x-nowpayments-sig') || '').toLowerCase();
        // NOWPayments requires HMAC-SHA512 of the JSON body with keys deeply sorted alphabetically
        const sortedJson = JSON.stringify(sortObjectDeep(preEvent));
        const expected = await hmacHex('SHA-512', ipnSecret, sortedJson);
        if (!timingSafeEqual(sigHeader, expected)) return unauthorized('nowpayments: invalid signature');
        event = preEvent;
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
        // CoinGate callbacks aren't HMAC-signed. Re-verify by fetching the
        // order from CoinGate's API using the panel-configured API token.
        const preEvent = JSON.parse(body);
        const preTx = preEvent.order_id;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'coingate');
        const apiToken = cfg?.apiToken || cfg?.api_token
          || cfg?.secretKey || cfg?.secret_key || cfg?.apiKey || cfg?.api_key;
        if (!apiToken) return unauthorized('coingate: api token not configured');
        const orderId = preEvent.id;
        if (!orderId) return unauthorized('coingate: missing order id');
        const sandbox = !!cfg?.sandbox;
        const apiBase = sandbox ? 'https://api-sandbox.coingate.com' : 'https://api.coingate.com';
        const verifyResp = await fetch(`${apiBase}/v2/orders/${encodeURIComponent(orderId)}`, {
          headers: { 'Authorization': `Token ${apiToken}` },
        });
        if (!verifyResp.ok) return unauthorized('coingate: order verification failed');
        const verifyData = await verifyResp.json().catch(() => null);
        if (!verifyData?.id) return unauthorized('coingate: invalid verification response');
        if (String(verifyData.status) !== String(preEvent.status)) {
          return unauthorized('coingate: callback status mismatch');
        }
        if (String(verifyData.order_id || '') !== String(preEvent.order_id || '')) {
          return unauthorized('coingate: callback order_id mismatch');
        }
        event = preEvent;
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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.data?.merchantTradeNo;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'binancepay');
        const secret = cfg?.secretKey || cfg?.secret_key;
        if (!secret) return unauthorized('binancepay: secret key not configured');
        const ts = req.headers.get('binancepay-timestamp') || '';
        const nonce = req.headers.get('binancepay-nonce') || '';
        const sigHeader = (req.headers.get('binancepay-signature') || '').toUpperCase();
        if (!ts || !nonce || !sigHeader) return unauthorized('binancepay: missing signature headers');
        const payload = `${ts}\n${nonce}\n${body}\n`;
        const expected = (await hmacHex('SHA-512', secret, payload)).toUpperCase();
        if (!timingSafeEqual(sigHeader, expected)) return unauthorized('binancepay: invalid signature');
        event = preEvent;
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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.data?.object?.order_id || preEvent.data?.object?.note;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'square');
        const sigKey = cfg?.webhookSignatureKey || cfg?.webhook_signature_key
          || cfg?.signatureKey || cfg?.signature_key;
        const notificationUrl = cfg?.notificationUrl || cfg?.notification_url
          || `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook?gateway=square`;
        if (!sigKey) return unauthorized('square: webhook signature key not configured');
        const sigHeader = req.headers.get('x-square-hmacsha256-signature') || '';
        const expected = await hmacBase64('SHA-256', sigKey, notificationUrl + body);
        if (!timingSafeEqual(sigHeader, expected)) return unauthorized('square: invalid signature');
        event = preEvent;
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
        // Braintree webhooks arrive as form-encoded bt_signature/bt_payload.
        // bt_signature contains pairs publicKey|sig joined by &; verify by
        // HMAC-SHA1(payload) with key = sha1(privateKey) for our public key.
        // The decoded payload itself is XML, so we extract the fields we
        // need with small regex helpers — no XML library is available in
        // Deno Edge Functions and we only need a handful of leaf values.
        const params = new URLSearchParams(body);
        const btSig = params.get('bt_signature');
        const btPayload = params.get('bt_payload');
        if (!btSig || !btPayload) return unauthorized('braintree: missing bt_signature/bt_payload');
        let xml = '';
        try {
          xml = atob(btPayload.replace(/\s+/g, ''));
        } catch (_e) {
          return unauthorized('braintree: bt_payload is not valid base64');
        }
        const xmlText = (tag: string): string | null => {
          const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
          return m ? m[1].trim() : null;
        };
        const preTx = xmlText('id') || xmlText('transaction-id') || xmlText('order-id') || xmlText('custom-field');
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'braintree');
        const publicKey = cfg?.publicKey || cfg?.public_key;
        const privateKey = cfg?.secretKey || cfg?.secret_key || cfg?.privateKey || cfg?.private_key;
        if (!publicKey || !privateKey) return unauthorized('braintree: keys not configured');
        const pairs = btSig.split('&').map((p) => p.split('|')).filter((p) => p.length === 2);
        const matched = pairs.find(([k]) => k === publicKey);
        if (!matched) return unauthorized('braintree: no matching public key in signature');
        const sigKeyHash = await sha1Hex(privateKey);
        const expected = await hmacHex('SHA-1', sigKeyHash, btPayload);
        if (!timingSafeEqual(matched[1].toLowerCase(), expected)) {
          return unauthorized('braintree: invalid signature');
        }
        const kind = xmlText('kind') || '';
        const txAmount = xmlText('amount');
        const orderRef = xmlText('order-id') || xmlText('custom-field');
        const txId = xmlText('id') || xmlText('transaction-id');
        event = { kind, transaction: { id: txId, amount: txAmount, order_id: orderRef } };
        if (kind === 'transaction_settled' || kind === 'disbursement') {
          transactionId = orderRef || txId;
          status = 'completed';
          amount = parseFloat(txAmount || '0');
          console.log(`[payment-webhook] Braintree payment settled: ${transactionId}, amount: ${amount}`);
        } else if (kind === 'transaction_settled_failed' || kind === 'transaction_settlement_declined') {
          transactionId = orderRef || txId;
          status = 'failed';
        }
        break;
      }

      case 'ach':
      case 'sepa': {
        // ACH/SEPA use Stripe under the hood — verify Stripe webhook signature.
        const preEvent = JSON.parse(body);
        const preTx = preEvent.data?.object?.metadata?.transactionId;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'stripe');
        const secret = cfg?.webhookSecret || cfg?.webhook_secret
          || cfg?.signingSecret || cfg?.signing_secret
          || Deno.env.get('STRIPE_WEBHOOK_SECRET');
        if (!secret) return unauthorized(`${gateway}: stripe webhook signing secret not configured`);
        const sigHeader = req.headers.get('stripe-signature') || '';
        const t = parseKvHeader(sigHeader)['t'];
        const v1List = parseKvHeaderMulti(sigHeader, 'v1').map((s) => s.toLowerCase());
        if (!t || v1List.length === 0) return unauthorized(`${gateway}: malformed stripe signature header`);
        const expected = await hmacHex('SHA-256', secret, `${t}.${body}`);
        if (!v1List.some((v) => timingSafeEqual(v, expected))) return unauthorized(`${gateway}: invalid stripe signature`);
        const tsAge = Math.abs(Date.now() / 1000 - parseInt(t, 10));
        if (!Number.isFinite(tsAge) || tsAge > 300) return unauthorized(`${gateway}: stripe signature timestamp out of tolerance`);
        event = preEvent;
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
        const preEvent = JSON.parse(body);
        const preTx = preEvent.invoiceId || preEvent.metadata?.orderId;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'btcpay');
        const secret = cfg?.webhookSecret || cfg?.webhook_secret;
        if (!secret) return unauthorized('btcpay: webhook secret not configured');
        const sigHeader = (req.headers.get('btcpay-sig') || '').replace(/^sha256=/i, '').toLowerCase();
        const expected = await hmacHex('SHA-256', secret, body);
        if (!timingSafeEqual(sigHeader, expected)) return unauthorized('btcpay: invalid signature');
        event = preEvent;
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
        // Wise signs webhooks with RSA-SHA256 (X-Signature-SHA256) using
        // Wise's public key. Without a cached/configured public key we
        // re-verify by fetching the transfer status from Wise's API.
        const preEvent = JSON.parse(body);
        const preTx = preEvent.data?.resource?.id?.toString();
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'wise');
        const apiKey = cfg?.secretKey || cfg?.secret_key || cfg?.apiKey || cfg?.api_key;
        if (!apiKey) return unauthorized('wise: api key not configured');
        const transferId = preEvent.data?.resource?.id;
        const profileId = preEvent.data?.resource?.profile_id;
        if (!transferId) return unauthorized('wise: missing transfer id');
        const verifyResp = await fetch(
          `https://api.transferwise.com/v1/profiles/${encodeURIComponent(String(profileId || ''))}/transfers/${encodeURIComponent(String(transferId))}`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } },
        );
        if (!verifyResp.ok) {
          // Fall back to flat endpoint
          const altResp = await fetch(`https://api.transferwise.com/v1/transfers/${encodeURIComponent(String(transferId))}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
          });
          if (!altResp.ok) return unauthorized('wise: transfer verification failed');
          const altData = await altResp.json().catch(() => null);
          if (!altData?.id) return unauthorized('wise: invalid verification response');
          if (preEvent.data?.current_state && altData.status !== preEvent.data.current_state) {
            return unauthorized('wise: callback state mismatch');
          }
        } else {
          const verifyData = await verifyResp.json().catch(() => null);
          if (!verifyData?.id) return unauthorized('wise: invalid verification response');
          if (preEvent.data?.current_state && verifyData.status !== preEvent.data.current_state) {
            return unauthorized('wise: callback state mismatch');
          }
        }
        event = preEvent;
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
        // Cryptomus signs each callback with `sign` = md5(base64(JSON without sign) + apiKey)
        const preEvent = JSON.parse(body);
        const preTx = preEvent.order_id;
        const cfg = await loadGatewayConfigForTransaction(supabase, preTx, 'cryptomus');
        const paymentApiKey = cfg?.paymentApiKey || cfg?.payment_api_key
          || cfg?.apiKey || cfg?.api_key;
        if (!paymentApiKey) return unauthorized('cryptomus: payment api key not configured');
        const provided = String(preEvent.sign || '').toLowerCase();
        if (!provided) return unauthorized('cryptomus: missing sign');
        const { sign: _omit, ...rest } = preEvent;
        // Cryptomus uses PHP json_encode with JSON_UNESCAPED_UNICODE — slashes are escaped (\/)
        const jsonNoSign = JSON.stringify(rest).replace(/\//g, '\\/');
        const expected = await md5Hex(btoa(jsonNoSign) + paymentApiKey);
        if (!timingSafeEqual(provided, expected)) return unauthorized('cryptomus: invalid sign');
        event = preEvent;
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
        if (!Array.isArray(verifyData) || verifyData.length === 0) {
          return unauthorized('toyyibpay: empty verification response');
        }
        // Bind verified bill to OUR internal transaction by external reference,
        // verified payment status, and verified paid amount. This prevents an
        // attacker from forging a callback that points an unrelated cheap bill
        // at a different (more valuable) pending transaction.
        const callbackStatus = String(params.get('status_id'));
        const callbackRef = params.get('order_id') || params.get('billExternalReferenceNo') || '';
        const callbackAmountSen = parseFloat(params.get('amount') || '0');
        const verified = verifyData.find((t: any) =>
          String(t.billpaymentStatus) === callbackStatus
          && String(t.billExternalReferenceNo || '') === String(callbackRef)
          && Math.abs(parseFloat(String(t.billpaymentAmount || '0')) - callbackAmountSen) < 1
        );
        if (!verified) {
          return unauthorized(
            'toyyibpay: callback does not match verified bill (reference/status/amount mismatch)'
          );
        }
        // Now also check our internal transaction matches the verified amount/currency.
        if (callbackRef) {
          const { data: internalTx } = await supabase
            .from('transactions')
            .select('id, amount, currency, status')
            .eq('id', callbackRef)
            .maybeSingle();
          if (!internalTx) return unauthorized('toyyibpay: unknown internal transaction');
          const verifiedMyr = callbackAmountSen / 100;
          if (Math.abs(Number(internalTx.amount) - verifiedMyr) > 0.01) {
            return unauthorized('toyyibpay: amount mismatch with internal transaction');
          }
          if (String(internalTx.currency || '').toUpperCase() !== 'MYR') {
            return unauthorized('toyyibpay: currency mismatch with internal transaction');
          }
        }
        transactionId = callbackRef;
        amount = callbackAmountSen / 100;
        if (callbackStatus === '1') {
          status = 'completed';
          console.log(`[payment-webhook] toyyibPay payment completed: ${transactionId}, amount: ${amount}`);
        } else if (callbackStatus === '3') {
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

    // Update transaction status. Apply an idempotency / state-transition
    // guard for `completed`: only allow `pending -> completed`. This prevents
    // a replayed (or otherwise duplicated) webhook from re-completing an
    // already-finalized transaction and crediting balance twice.
    let updateQuery = supabase
      .from('transactions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', transactionId);
    if (status === 'completed') {
      updateQuery = updateQuery.eq('status', 'pending');
    }
    const { data: transaction, error: txError } = await updateQuery.select().single();

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
