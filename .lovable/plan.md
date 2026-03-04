

# Plan: Fix Payments, Orders, Panel Management & Provider Integration

## Root Cause Analysis

### 1. Payment Balance Never Updates (Panel Owners & Tenants)
**Root cause**: Two compounding issues:
- **Flutterwave verify uses wrong endpoint**: The `verify-payment` action calls `GET /v3/transactions/${tx.external_id}/verify` — but `external_id` stores Flutterwave's *payment link ID*, not a transaction ID. Flutterwave's verify-by-ID endpoint expects a Flutterwave transaction ID (returned after payment completion), not the link ID. Fix: use `GET /v3/transactions/verify_by_reference?tx_ref=${transactionId}` which uses our `tx_ref` (our transaction UUID) that we set during payment init (line 552).
- **Webhook never fires**: Zero logs in `payment-webhook`. The dynamically injected `webhook_url` on line 557 should work for Flutterwave, but Cryptomus and Paystack require manual dashboard config. Since the user has configured webhooks in their provider dashboards, the issue may be that `payment-webhook` receives the call but the `transactionId` lookup fails. The webhook matches `transactionId = event.data?.tx_ref` (Flutterwave), then updates by `eq('id', transactionId)`. But `tx_ref` is our UUID — the update `eq('id', transactionId)` should work. If not, the fallback `eq('external_id', transactionId)` fires, which won't match because `external_id` stores the payment link ID, not the tx_ref.
- **Additionally**: Cryptomus verify isn't implemented in `verify-payment` at all, but the user has Cryptomus configured.

**Fix**:
- Rewrite Flutterwave verification to use `tx_ref` reference lookup
- Add Cryptomus verification support 
- Add fallback: if webhook `eq('id', transactionId)` fails, also try matching by metadata or tx_ref pattern
- Store the Flutterwave `transaction_id` (from callback URL) as additional metadata for verification

### 2. Buyer Orders Not Showing in "My Orders" 
**Root cause**: The `orders` table has **no SELECT RLS policy for the `public` role**. Buyer auth is custom (localStorage-based `client_users` session, not Supabase `auth.users`), so all buyer queries use the `anon` key. Without a public SELECT policy, the anon role gets zero rows. Other tenant tables (`services`, `client_users`) already have `public` role policies — `orders` is the only one missing.

**Fix**: Add `CREATE POLICY "Public can view orders" ON orders FOR SELECT TO public USING (true)` — consistent with the existing architecture where all tenant-facing tables allow public reads (the query is filtered by `buyer_id` client-side).

### 3. Admin Panel Management Not Showing All Panels
**Root cause**: The `panels` table has only ONE RLS policy: `Panel owners can manage their panels` with `USING (owner_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))`. The admin user's `auth.uid()` doesn't match other panels' `owner_id`, so they can only see their own panels.

**Fix**: Add admin SELECT policy: `FOR SELECT TO authenticated USING (is_any_admin(auth.uid()) OR owner_id IN (...))`.

### 4. Provider Error "Incorrect service ID"
**Root cause**: The service has `provider_service_id = '680'` which is passed as `service=680` to `worldofsmm.com/api/v2`. The provider rejected it. The `provider_services` table has **0 records** for this provider — suggesting the 3-tier import either failed silently or the provider_services upsert errored (code swallows errors on line 1616-1618).

This is likely a data issue (service 680 may not exist on worldofsmm), but the import process should be made more robust:
- The import should verify service IDs exist on the provider before committing
- The `buyer-order` forwarding should handle "Incorrect service ID" gracefully and update order status

**Fix**: 
- Add a pre-import verification step that calls the provider API with `action=services` to confirm imported service IDs exist
- Update `buyer-order` to mark orders with provider errors as `partial` or `cancelled` with clear error notes instead of leaving them as `in_progress` with just a note

### 5. Order Management Enhancements
- **Missing provider info**: Query doesn't join providers. Fix: add `provider:providers!services_provider_id_fkey(name)` through service join
- **Revenue vs Total Spent**: Currently `totalRevenue` just sums all order prices. Fix: calculate separately — Total Spent = sum of all `price`, Revenue = sum of `price - provider_cost` (need to include `provider_cost` from services)
- **Mobile width customer email**: The email column in the table overflows on mobile. Fix: add `truncate max-w-[120px]` to the email cell

---

## Database Migration

```sql
-- 1. Allow buyers (public/anon) to read orders
CREATE POLICY "Public can view orders" ON orders FOR SELECT TO public USING (true);

-- 2. Allow admins to see all panels
DROP POLICY IF EXISTS "Panel owners can manage their panels" ON panels;
CREATE POLICY "Panel owners can manage their panels" ON panels FOR ALL TO authenticated 
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_any_admin(auth.uid()));
```

## Edge Function Changes

### `process-payment/index.ts` — Fix Flutterwave + Cryptomus Verification
- Line ~102: Change Flutterwave verify from `GET /v3/transactions/${tx.external_id}/verify` to `GET /v3/transactions/verify_by_reference?tx_ref=${transactionId}` (uses our transaction UUID as reference)
- Add Cryptomus verification: `POST https://api.cryptomus.com/v1/payment/info` with `order_id = transactionId`
- For all gateways: if verification succeeds, also store the gateway's transaction ID in `external_id` for future lookups

### `buyer-order/index.ts` — Better Error Handling
- When provider returns "Incorrect service ID", set order status to `partial` instead of leaving as `in_progress`
- Add the `provider_order_id` field as null and clear error note for failed forwards

### `payment-webhook/index.ts` — Improve Transaction Lookup
- After the primary `eq('id', transactionId)` lookup fails (line 374-382), add a secondary lookup by `metadata->>'transactionId'` or partial match for gateways that use different reference formats
- This catches cases where webhooks send a different reference than our UUID

## Frontend Changes

### `OrderManagement.tsx`
- Update service select to include provider info: `service:services(name, category, provider_cost, provider_id, provider:providers(name))`
- Add "Provider" column showing provider name
- Split stats: "Total Revenue" = sum(price - provider_cost), "Total Spent" = sum(price)
- Fix mobile: truncate customer email column, add `max-w-[120px]` to email display

### `BuyerOrders.tsx`
- Add `processing` and `awaiting_payment` to `statusConfig` so these statuses render properly

---

## Files to Change

| File | Change |
|------|--------|
| Database migration | Add public SELECT on orders, admin ALL on panels |
| `supabase/functions/process-payment/index.ts` | Fix Flutterwave verify, add Cryptomus verify |
| `supabase/functions/buyer-order/index.ts` | Better error status on provider failures |
| `supabase/functions/payment-webhook/index.ts` | Improve transaction lookup fallback |
| `src/pages/OrderManagement.tsx` | Add provider column, revenue vs spent, mobile fix |
| `src/pages/buyer/BuyerOrders.tsx` | Add missing status configs |

