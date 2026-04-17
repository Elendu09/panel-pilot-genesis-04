// Shared single-source-of-truth registry for which currencies each payment
// gateway supports. Used by BuyerDeposit, FastOrderSection, and the
// process-payment edge function (mirrored in supabase/functions/_shared).
//
// - Gateways NOT listed here are assumed to accept ANY currency (default-allow).
// - `must-switch` mode: gateway supports exactly one currency.
// - `pick-one`   mode: gateway supports a small list and the buyer must pick one.

export interface GatewayCurrencySupport {
  currencies: string[];
  reason: string;
}

export const GATEWAY_CURRENCY_SUPPORT: Record<string, GatewayCurrencySupport> = {
  // === Africa — NGN only ===
  korapay:  { currencies: ['NGN'], reason: 'KoraPay exclusively processes payments in Nigerian Naira.' },
  monnify:  { currencies: ['NGN'], reason: 'Monnify exclusively processes payments in Nigerian Naira.' },
  squad:    { currencies: ['NGN'], reason: 'Squad exclusively processes payments in Nigerian Naira.' },
  lenco:    { currencies: ['NGN'], reason: 'Lenco exclusively processes payments in Nigerian Naira.' },

  // === Africa — multi-currency ===
  paystack:    { currencies: ['NGN', 'GHS', 'ZAR', 'KES', 'USD'], reason: 'Paystack supports payments in select African currencies and USD.' },
  flutterwave: { currencies: ['NGN', 'KES', 'GHS', 'UGX', 'TZS', 'ZMW', 'USD', 'EUR', 'GBP'], reason: 'Flutterwave supports payments in select African currencies and major foreign currencies.' },

  // === SE Asia — single-currency ===
  toyyibpay:  { currencies: ['MYR'], reason: 'toyyibPay only processes payments in Malaysian Ringgit.' },
  billplz:    { currencies: ['MYR'], reason: 'Billplz only processes payments in Malaysian Ringgit.' },
  senangpay:  { currencies: ['MYR'], reason: 'senangPay only processes payments in Malaysian Ringgit.' },
  midtrans:   { currencies: ['IDR'], reason: 'Midtrans only processes payments in Indonesian Rupiah.' },
  vnpay:      { currencies: ['VND'], reason: 'VNPay only processes payments in Vietnamese Dong.' },
  momo:       { currencies: ['VND'], reason: 'MoMo only processes payments in Vietnamese Dong.' },
  dragonpay:  { currencies: ['PHP'], reason: 'DragonPay only processes payments in Philippine Peso.' },
  gcash:      { currencies: ['PHP'], reason: 'GCash only processes payments in Philippine Peso.' },

  // === SE Asia — multi-currency ===
  xendit:  { currencies: ['IDR', 'PHP', 'MYR', 'THB', 'VND'], reason: 'Xendit supports several Southeast Asian currencies.' },
  ipay88:  { currencies: ['MYR', 'SGD', 'IDR', 'PHP', 'THB'], reason: 'iPay88 supports several Southeast Asian currencies.' },
  omise:   { currencies: ['THB', 'JPY', 'SGD', 'MYR', 'USD'], reason: 'Omise supports Thai Baht and several APAC currencies.' },
  '2c2p':  { currencies: ['THB', 'SGD', 'MYR', 'PHP', 'IDR', 'VND', 'HKD', 'USD', 'AUD', 'JPY'], reason: '2C2P supports many Asia-Pacific currencies.' },

  // === LATAM ===
  pagseguro:   { currencies: ['BRL'], reason: 'PagSeguro only processes payments in Brazilian Real.' },
  pix:         { currencies: ['BRL'], reason: 'PIX is a Brazilian instant-payment system; only BRL is supported.' },
  mercadopago: { currencies: ['BRL', 'ARS', 'CLP', 'COP', 'MXN', 'PEN'], reason: 'Mercado Pago supports several LATAM currencies.' },
  payu:        { currencies: ['INR', 'COP', 'MXN', 'BRL', 'ARS', 'PEN'], reason: 'PayU supports Indian Rupee and several LATAM currencies.' },

  // === India ===
  razorpay: { currencies: ['INR'], reason: 'Razorpay only processes payments in Indian Rupee.' },
  paytm:    { currencies: ['INR'], reason: 'Paytm only processes payments in Indian Rupee.' },
  phonepe:  { currencies: ['INR'], reason: 'PhonePe only processes payments in Indian Rupee.' },
  upi:      { currencies: ['INR'], reason: 'UPI is an Indian payment rail; only INR is supported.' },

  // === Europe ===
  ideal:      { currencies: ['EUR'], reason: 'iDEAL is a Dutch bank-transfer system; only EUR is supported.' },
  sofort:     { currencies: ['EUR'], reason: 'Sofort only processes payments in Euro.' },
  giropay:    { currencies: ['EUR'], reason: 'Giropay only processes payments in Euro.' },
  bancontact: { currencies: ['EUR'], reason: 'Bancontact only processes payments in Euro.' },
  mollie:     { currencies: ['EUR'], reason: 'Mollie processes payments in Euro by default.' },
  klarna:     { currencies: ['EUR', 'SEK', 'NOK', 'DKK', 'USD', 'GBP'], reason: 'Klarna supports several European currencies plus USD/GBP.' },
};

export type CurrencyCheckResult =
  | { kind: 'ok' }
  | { kind: 'must-switch'; currency: string; reason: string }
  | { kind: 'pick-one'; currencies: string[]; reason: string };

/**
 * Decide what to do when the buyer selects a payment gateway with their current currency.
 * - 'ok': current currency is supported; proceed normally
 * - 'must-switch': only one supported currency; auto-switch to it
 * - 'pick-one': multiple supported currencies; show a picker
 */
export function checkGatewayCurrency(
  gatewayId: string,
  currentCurrency: string
): CurrencyCheckResult {
  const support = GATEWAY_CURRENCY_SUPPORT[gatewayId];
  if (!support) return { kind: 'ok' };
  const upper = (currentCurrency || '').toUpperCase();
  if (support.currencies.includes(upper)) return { kind: 'ok' };
  if (support.currencies.length === 1) {
    return { kind: 'must-switch', currency: support.currencies[0], reason: support.reason };
  }
  return { kind: 'pick-one', currencies: support.currencies, reason: support.reason };
}

/** Server-friendly check: returns true if currency is allowed, false otherwise. */
export function isCurrencyAllowedForGateway(gatewayId: string, currency: string): boolean {
  const support = GATEWAY_CURRENCY_SUPPORT[gatewayId];
  if (!support) return true;
  return support.currencies.includes((currency || '').toUpperCase());
}
