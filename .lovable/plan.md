

# Plan: Fix Webhook URLs, Manual Methods Clearing, Test Connection, and KoraPay Deposit Error

## Issues Found

### 1. Webhook URL Shows Fake SPA Path (Returns 404)
**Problem**: The config dialog (line 1261) generates a webhook URL like `https://{tenant-domain}/api/payments/{gateway}/webhook`. This is a client-side SPA route that doesn't exist on the server -- it returns 404 when payment providers hit it. The actual working webhook endpoint is the Supabase edge function: `https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/payment-webhook?gateway={id}`.

**Fix**: Change the displayed webhook URL to point to the real Supabase edge function endpoint. For tenant panel owners, the webhook URL must be `https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/payment-webhook?gateway={gatewayId}`. This is the actual endpoint that receives and processes payment callbacks.

### 2. Saving a Payment Gateway Clears All Manual Methods
**Problem**: In `saveGatewayConfig` (line 749-755), the code builds `updatedSettings.payments` as `{ enabledMethods, configuredAt }` -- this completely overwrites the existing `payments` object, including `manualPayments`. Same issue exists in `toggleGateway` (line 796-803).

**Fix**: Preserve `manualPayments` when saving gateway configs by spreading the existing `payments` sub-object:
```
payments: { ...currentSettings.payments, enabledMethods, configuredAt }
```

### 3. "Test Connection" Shows "Gateway Not Yet Supported for Real Testing"
**Problem**: The `testConnection` function (line 825-838) only supports real API validation for Stripe, PayPal, and Coinbase. It calls a `validate-payment-gateway` edge function that doesn't exist in the codebase. For all other gateways (200+), it simulates success with the misleading message.

**Fix**: 
- Create the `validate-payment-gateway` edge function with real API validation for the most common gateways: Stripe (GET /v1/account), PayPal (POST /v1/oauth2/token), Paystack (GET /transaction/verify), Flutterwave (GET /v3/transactions), KoraPay (GET /merchant/api/v1/misc/banks), Razorpay (GET /v1/payments), Coinbase (GET /charges)
- Expand the client-side `testConnection` to pass all gateway types to this edge function
- For gateways without a test endpoint, display "Credentials saved -- connection will be validated on first payment" instead of the fake "simulated" message

### 4. KoraPay (and Other Gateways) Deposit Fails with "Issue with Input"
**Problem**: In `process-payment` (line 372-378), the buyer email is fetched from the `profiles` table using `user_id = buyerId`. But tenant buyers are stored in `client_users`, not `profiles`. The query returns null, and the fallback email `user-{uuid}@platform.local` is used. KoraPay (and many other gateways) reject this fake email, causing the "issue with your input" error.

**Fix**: Add a fallback query to `client_users` when `profiles` returns no result:
```typescript
if (!buyerEmail || buyerEmail.includes('@platform.local')) {
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('email, full_name')
    .eq('id', buyerId)
    .single();
  buyerEmail = clientUser?.email || buyerEmail;
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/PaymentMethods.tsx` | Fix webhook URL to use real Supabase endpoint; preserve `manualPayments` in `saveGatewayConfig` and `toggleGateway`; expand `testConnection` to pass all gateways to validation function; update simulated message text |
| `supabase/functions/validate-payment-gateway/index.ts` | New edge function -- validates API credentials by making lightweight test calls to each gateway's API |
| `supabase/functions/process-payment/index.ts` | Add `client_users` email fallback when `profiles` query returns no result for buyer email resolution |

