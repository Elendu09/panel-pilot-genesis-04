

# Plan: Fix Order Creation, Deposit Balance, Direct Provider, and CORS Issues

## Root Cause Analysis

### Issue 1: "Order Failed — Failed to create order" (CRITICAL)
**Root cause**: The `orders.buyer_id` column has a foreign key constraint referencing `profiles(id)`. But the `buyer-order` edge function inserts `client_users.id` as `buyer_id`. Since `client_users.id` is not a `profiles.id`, the FK constraint rejects the INSERT every time a tenant places an order.

**Evidence**: `orders_buyer_id_fkey: FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE` — but tenant buyers are `client_users`, not `profiles`.

**Fix**: Drop the incorrect FK and re-create it pointing to `client_users(id)`. The orders table is empty so no data migration needed.

### Issue 2: Tenant Deposit — Records Not Created
**Root cause**: The `process-payment` edge function has **incomplete CORS headers** (line 7: only `authorization, x-client-info, apikey, content-type`). The Supabase JS client sends additional headers (`x-supabase-client-platform`, etc.) causing CORS preflight failures. The browser blocks the request before it reaches the function.

**Fix**: Update CORS headers in `process-payment` to include all platform headers.

### Issue 3: Panel Owner Balance Not Updated After Deposit
**Root cause**: Two compounding issues:
1. Same CORS problem on `payment-webhook` (line 7) — though webhooks from payment servers shouldn't need CORS, the function's transaction update logic is correct
2. The real issue: all owner deposits show `status: pending` in the database. Payment gateways like Cryptomus, Flutterwave require their webhook URL to be configured in their dashboards pointing to `https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/payment-webhook?gateway=<name>`. Without this, the webhook never fires and the balance never updates
3. Additionally, the `process-payment` function doesn't handle the **return URL callback** — when a user is redirected back with `?success=true&transaction_id=...`, nothing in the client code verifies the payment and updates the status

**Fix**: 
- Fix CORS on all three functions
- Add client-side payment verification on return (call a new verify endpoint or update status client-side)
- In `Billing.tsx` and `BuyerDeposit.tsx`, detect `?success=true&transaction_id=...` in URL params, then call a verification edge function to confirm and finalize the payment

### Issue 4: Direct Provider Edge Error
**Root cause**: `enable-direct-provider` has incomplete CORS headers (line 7: `authorization, x-client-info, apikey, content-type`), same issue.

**Fix**: Update CORS headers.

## Changes

### 1. Database Migration
```sql
-- Fix orders.buyer_id to reference client_users instead of profiles
ALTER TABLE orders DROP CONSTRAINT orders_buyer_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_buyer_id_fkey 
  FOREIGN KEY (buyer_id) REFERENCES client_users(id) ON DELETE CASCADE;
```

### 2. CORS Header Fixes (3 edge functions)
Update CORS headers in:
- `supabase/functions/process-payment/index.ts` (line 7)
- `supabase/functions/payment-webhook/index.ts` (line 7)  
- `supabase/functions/enable-direct-provider/index.ts` (line 7)

All to: `'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version'`

### 3. Payment Return Verification
Add a `verify-payment` action to `process-payment` (or create a new lightweight function) that:
- Takes `transactionId` and `gateway`
- For Stripe: calls `GET /v1/checkout/sessions/{id}` to check status
- For Flutterwave: calls `GET /v3/transactions/{id}/verify`
- For Paystack: calls `GET /transaction/verify/{reference}`
- Updates transaction status + credits balance (same logic as webhook)

Then in `BuyerDeposit.tsx` and `Billing.tsx`, on mount check for `?success=true&transaction_id=...` in the URL and call this verification function to finalize the payment immediately (don't rely solely on webhooks).

### 4. Order Management RLS Fix
The `OrderManagement.tsx` page queries orders with `buyer:profiles!orders_buyer_id_fkey(email, full_name)`. After changing the FK to `client_users`, update this join to `buyer:client_users!orders_buyer_id_fkey(email, full_name)`.

## Files to Change

| File | Change |
|------|--------|
| Database migration | Change `orders.buyer_id` FK from `profiles` to `client_users` |
| `supabase/functions/process-payment/index.ts` | Fix CORS headers; add payment verification action |
| `supabase/functions/payment-webhook/index.ts` | Fix CORS headers |
| `supabase/functions/enable-direct-provider/index.ts` | Fix CORS headers |
| `src/pages/buyer/BuyerDeposit.tsx` | Add payment return verification on mount |
| `src/pages/panel/Billing.tsx` | Add payment return verification on mount |
| `src/pages/OrderManagement.tsx` | Update buyer join from profiles to client_users |

