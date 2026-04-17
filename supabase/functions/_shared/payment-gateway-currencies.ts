// Server-side wrapper for the canonical gateway-currency registry.
// The data lives in shared/payment-gateway-currencies.json at the repo root
// and is consumed by BOTH the client (src/lib/payment-gateway-currencies.ts)
// and this Deno edge-function helper. There is exactly one source of truth.

import gatewayCurrencyData from '../../../shared/payment-gateway-currencies.json' with { type: 'json' };

export interface GatewayCurrencySupport {
  currencies: string[];
  reason: string;
}

export const GATEWAY_CURRENCY_SUPPORT: Record<string, GatewayCurrencySupport> =
  gatewayCurrencyData as Record<string, GatewayCurrencySupport>;

export function isCurrencyAllowedForGateway(gatewayId: string, currency: string): boolean {
  const support = GATEWAY_CURRENCY_SUPPORT[gatewayId];
  if (!support) return true;
  return support.currencies.includes((currency || '').toUpperCase());
}
