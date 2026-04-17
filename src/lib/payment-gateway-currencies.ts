// Single-source-of-truth registry for which currencies each payment gateway
// supports. The canonical data lives in shared/payment-gateway-currencies.json
// and is consumed by BOTH the client (this file) and the Deno edge function
// at supabase/functions/_shared/payment-gateway-currencies.ts.
//
// - `must-switch` mode: gateway supports exactly one currency.
// - `pick-one`   mode: gateway supports a small list and the buyer must pick.
// - Gateways NOT listed in the JSON registry are treated as fail-closed when
//   the gateway ID is recognized by the UI's allPaymentGateways registry; for
//   truly unknown gateway IDs we fall through with `ok` so undecorated gateways
//   keep working.

import gatewayCurrencyData from '../../shared/payment-gateway-currencies.json';

export interface GatewayCurrencySupport {
  currencies: string[];
  reason: string;
}

export const GATEWAY_CURRENCY_SUPPORT: Record<string, GatewayCurrencySupport> =
  gatewayCurrencyData as Record<string, GatewayCurrencySupport>;

export type CurrencyCheckResult =
  | { kind: 'ok' }
  | { kind: 'must-switch'; currency: string; reason: string }
  | { kind: 'pick-one'; currencies: string[]; reason: string };

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

export function isCurrencyAllowedForGateway(gatewayId: string, currency: string): boolean {
  const support = GATEWAY_CURRENCY_SUPPORT[gatewayId];
  if (!support) return true;
  return support.currencies.includes((currency || '').toUpperCase());
}

const ALL_REGISTERED_CURRENCIES: ReadonlySet<string> = new Set(
  Object.values(GATEWAY_CURRENCY_SUPPORT).flatMap((g) => g.currencies)
);

export function isKnownGatewayCurrency(code: string): boolean {
  return ALL_REGISTERED_CURRENCIES.has((code || '').toUpperCase());
}
