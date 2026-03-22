

# Plan: Fix Admin Payment Config, Add Korapay/Heleket, Fix Tenant Order IDs, Fix Coinbase

## Issue 1: Admin Payment "Configured" Status and Hidden Keys

**Root cause**: `SubscriptionProviderManager.tsx` line 392/466 checks `config.secretKey` to determine "Configured" status. But Coinbase only uses `publicKey` (field1) — it has no field2/secretKey. So it perpetually shows "Needs Setup".

Also, the field1 input (line 557-562) uses plain text for ALL providers, exposing API keys. Only field2 uses `type="password"`.

**Fix**:
- Change `isConfigured` to check based on provider's required fields from `providerFieldConfig` — if `hasField2` is false, check field1 only
- Add `type="password"` to field1 input when the field contains a secret (API keys, access tokens)
- Add a show/hide toggle for both field1 and field2

## Issue 2: Add Korapay and Heleket to Admin Payment Providers

**Korapay** (from docs):
- Uses public key for checkout widget, secret key for server-side API calls
- Config: `publicKey` + `secretKey`
- Checkout Standard: `https://korablobstorage.blob.core.windows.net/modal-bucket/korapay-collections.min.js`
- API: `POST https://api.korapay.com/merchant/api/v1/charges/initialize` with `Authorization: Bearer SECRET_KEY`

**Heleket** (from docs):
- Uses `merchant` ID header + payment API key for signing
- API: `POST https://api.heleket.com/v1/payment`
- Headers: `merchant: MERCHANT_ID`, `sign: MD5(body_json + API_KEY)`
- Response returns `result.url` for payment page redirect

**Fix**:
- Add field configs for `korapay` and `heleket` in `SubscriptionProviderManager.tsx`
- Insert rows into `platform_payment_providers` table via migration
- Add `korapay` and `heleket` cases to `process-payment/index.ts`
- Add validation functions to `validate-payment-gateway/index.ts`

## Issue 3: Tenant Orders Showing Provider Service ID

**Root cause**: `BuyerOrders.tsx` lines 452-456 and 537-541 display `service.provider_service_id` — this is the upstream provider's ID that tenants should never see.

**Fix**: Replace `provider_service_id` with `display_order` in the service join query and display. Show "ID: #X" using the panel-local service ID, or remove the badge entirely since tenants don't need internal IDs.

## Issue 4: Coinbase Commerce ForbiddenError

**Root cause**: The Coinbase config stores the API key under `publicKey` (value: `26884c60-...`). In `process-payment`, line 416 resolves it via `resolvedPublicKey`. The key IS being passed to Coinbase, so the `ForbiddenError` is coming from Coinbase's API itself.

Two code improvements:
1. The `validate-payment-gateway` function uses `GET /charges` to validate — should also try the newer endpoint
2. Add `publicKey` to the Coinbase key resolution chain explicitly (it's already there via `resolvedPublicKey` on line 416, but adding it directly in the Coinbase case makes it clearer)
3. Log the exact error response from Coinbase so the admin can see if it's an account-level issue

## Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/SubscriptionProviderManager.tsx` | Fix `isConfigured` logic; hide field1 keys; add Korapay/Heleket field configs |
| `supabase/functions/process-payment/index.ts` | Add `korapay` and `heleket` payment cases; improve Coinbase key resolution |
| `supabase/functions/validate-payment-gateway/index.ts` | Add Korapay/Heleket validation; fix Coinbase validation endpoint |
| `src/pages/buyer/BuyerOrders.tsx` | Replace `provider_service_id` with `display_order` in service join and display |
| New migration | Insert `korapay` and `heleket` rows into `platform_payment_providers` |

## Key Implementation Details

### isConfigured fix:
```typescript
const fieldConfig = getProviderFieldConfig(provider.provider_name);
const isConfigured = fieldConfig.hasField2 
  ? (config as any)[fieldConfig.field2Key]?.length > 0
  : (config as any)[fieldConfig.field1Key]?.length > 0;
```

### Korapay in process-payment:
```typescript
case 'korapay': {
  const koraSecretKey = gatewayConfig.secretKey;
  const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${koraSecretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount, currency: currency.toUpperCase(),
      reference: transactionIdToUse,
      redirect_url: returnUrl,
      customer: { email: buyerEmail || 'customer@panel.com' },
    }),
  });
  // Extract checkout_url from response
}
```

### Heleket in process-payment:
```typescript
case 'heleket': {
  const merchantId = gatewayConfig.merchantId;
  const paymentKey = gatewayConfig.secretKey;
  const bodyJson = JSON.stringify({ amount: amount.toString(), currency: 'USD', order_id: transactionIdToUse, url_callback: webhookUrl, url_return: returnUrl });
  // Sign: MD5(base64(bodyJson) + paymentKey)
  const sign = await md5(btoa(bodyJson) + paymentKey);
  const response = await fetch('https://api.heleket.com/v1/payment', {
    method: 'POST',
    headers: { 'merchant': merchantId, 'sign': sign, 'Content-Type': 'application/json' },
    body: bodyJson,
  });
  // Extract result.url from response
}
```

### BuyerOrders service ID fix:
```typescript
// Change service join to include display_order
service?: { name: string; display_order?: number } | null;

// Display: show panel-local ID instead of provider ID
{selectedOrder.service?.display_order && (
  <Badge variant="secondary" className="text-xs font-mono">
    ID: #{selectedOrder.service.display_order}
  </Badge>
)}
```

