

# Plan: Fix Order Visibility, Sync Orders, and Payment Verification

## Root Causes Found

### 1. Orders invisible to buyers (CRITICAL)
The `orders` table RLS only has a SELECT policy for panel owners. There is NO policy allowing buyers (`client_users`) to read their own orders. This causes:
- **"Loading order status..." forever** in Fast Order step 6 (`LiveOrderTracker`)
- **Orders missing from "My Orders"** page (`BuyerOrders`)
- The `buyer-order` edge function creates orders using service role (bypasses RLS), but subsequent client-side reads fail silently

**Fix**: Add RLS SELECT policy for buyers. However, buyers authenticate via `buyer-auth` (custom tokens in `client_users`), not via `auth.uid()`. The client-side queries use the anon key. We need to either:
- (a) Add a permissive SELECT policy that allows buyers to read their own orders — but `buyer_id` maps to `client_users.id`, not `auth.uid()`. Since buyers don't use Supabase Auth, we can't use `auth.uid()` in the policy.
- (b) Route all buyer order reads through an edge function (like `buyer-api` or a new `buyer-orders` function) that uses service role.

**Chosen approach**: (b) — use edge function for buyer order reads. This is consistent with the existing pattern (`buyer-order`, `buyer-auth`). We'll update `LiveOrderTracker` and `BuyerOrders` to fetch via a lightweight edge function instead of direct Supabase client queries.

### 2. "Sync Orders" edge function missing
`OrdersManagement.tsx` calls `supabase.functions.invoke('sync-orders')` but no such function exists. This causes "Could not reach the server" error.

**Fix**: Create `sync-orders` edge function that:
- Fetches all active orders (with `provider_order_id`) for the panel
- Calls each provider's API with `action=status&order=<provider_order_id>`
- Updates order status, start_count, remains, progress in the DB
- Returns count of updated orders

### 3. Subscription not auto-upgrading after payment
The `process-payment` verify-payment logic works correctly. The issue is that `PanelOnboardingV2` may not be extracting the `transactionId` from the return URL. Looking at the code, it tries to get `transaction_id` or `tx_ref` from URL params — but the actual transaction ID is a UUID stored during payment initialization. The return URL from gateways often uses different param names. 

Also, the onboarding code may not be storing the `transactionId` before redirect, so on return it has nothing to verify against.

**Fix**: Before redirecting to gateway, store the `transactionId` in localStorage. On return, read it back and use it for verification polling. Also add a fallback: query `transactions` table for the most recent pending subscription transaction for this panel.

### 4. Provider "Incorrect service ID"
This is NOT a code bug. Service ID 113 on FAMSUP may have been removed/changed. The system correctly stores the provider's service ID and forwards it. The import and mapping logic is working as designed.

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/sync-orders/index.ts` | **Create** — sync order statuses from upstream providers |
| `supabase/functions/buyer-api/index.ts` | **Modify** — add `action: 'get-orders'` handler for buyer order reads |
| `src/components/order/LiveOrderTracker.tsx` | **Modify** — fetch order via edge function instead of direct query |
| `src/pages/buyer/BuyerOrders.tsx` | **Modify** — fetch orders via edge function instead of direct query |
| `src/pages/panel/PanelOnboardingV2.tsx` | **Modify** — store transactionId in localStorage before redirect; read on return for verification |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | **Modify** — store transactionId before gateway redirect |

## Implementation Details

### sync-orders edge function
```
POST body: { panelId }
- Fetch orders with provider_order_id, status in (pending, in_progress, processing)
- Group by provider_id
- For each provider: batch call ?action=status&order=id1,id2,...
- Parse response, update orders table with new status/start_count/remains
- Return { success, total, updated }
```

### buyer-api order reads
Add to existing `buyer-api` edge function:
```
action: 'get-orders' -> returns orders for authenticated buyer
action: 'get-order' -> returns single order by ID for authenticated buyer
```
Uses service role key, so RLS is bypassed. Validates buyer ownership.

### LiveOrderTracker + BuyerOrders
Replace `supabase.from('orders').select(...)` with `supabase.functions.invoke('buyer-api', { body: { action: 'get-order', ... } })`. Keep realtime subscriptions as-is (they work because they use the channel system, not RLS).

### Onboarding payment persistence
Before redirect: `localStorage.setItem('onboarding_payment_tx', transactionId)`
On return: read it back, pass to `startPaymentVerification(txId)`.
Fallback: query transactions table for recent pending subscription tx for this panel.

