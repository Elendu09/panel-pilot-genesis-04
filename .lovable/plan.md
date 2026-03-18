

# Plan: Fix Data Cascade, Server-Side Price Validation, and Provider Service ID Forwarding

## Issue 1: Deleting Services Wipes Orders, Analytics, and Dashboard Data

**Root cause**: The `orders.service_id` foreign key has `ON DELETE CASCADE` — confirmed via `pg_constraint` query showing `confdeltype: c`. The migration at `20260305122801` attempted to change it to `SET NULL`, but it failed silently (the original CASCADE constraint from `20250713082633` was never properly dropped, or the migration ran before the old constraint existed under a different name).

Similarly, `service_reviews.service_id`, `buyer_favorites.service_id`, and `service_access.service_id` all have `ON DELETE CASCADE`.

**Fix**: Database migration to:
1. Drop and recreate `orders_service_id_fkey` as `ON DELETE SET NULL`
2. Change `service_reviews.service_id` FK to `ON DELETE SET NULL`
3. Change `buyer_favorites.service_id` FK to `ON DELETE CASCADE` (fine — favorites for deleted services should go)
4. Change `service_access.service_id` FK to `ON DELETE CASCADE` (fine — access to deleted services is meaningless)

**Also fix queries**: `OrdersManagement.tsx` joins `service:services(name, category)` — when `service_id` is NULL (after deletion), this returns `null`. The code already has `service_name` column on orders as a fallback (added in migration `20260305122801`). Update the query to use `service_name` as fallback when `service` join returns null.

Same for `Analytics.tsx` line 197 which joins `services(name, category)` — use `service_name` fallback.
Same for `PanelOverview.tsx` which selects `service_id` for today's top service.

## Issue 2: Server-Side Price Validation in `buyer-order`

**Root cause**: The edge function accepts `price` from the client and uses it directly without verifying against the service's actual price. A malicious buyer could send `price: 0`.

**Fix**: In `buyer-order/index.ts`, after fetching the service, recalculate the expected price server-side:
```
const expectedPrice = (service.price * quantity) / 1000;
```
Reject if the client-sent price is less than the server-calculated price (with small epsilon for floating point). This ensures panel owner pricing is always enforced.

Also add: reject orders where `price <= 0` unless the service itself is free.

## Issue 3: Provider Service ID Forwarding

**Current state**: The `provider_service_id` column on `services` already stores the correct external IDs ("1", "2", "3"...). The `resolveExternalServiceId` function correctly detects these as non-UUIDs and uses them directly. The `provider_services` table is empty, so the UUID lookup path is dead code.

The mapping is actually working correctly for the current data. The "Incorrect service ID" errors from providers are because those specific services were removed/changed on the provider's end, not a mapping bug.

**Fix**: Simplify `resolveExternalServiceId` in both `buyer-order` and `buyer-api` to just use `provider_service_id` directly (it's always the external ID string). Remove the dead `provider_services` table lookup. Add better error logging so it's clear which service ID was sent.

## Issue 4: BuyerNewOrder Also Needs Balance Enforcement

BuyerNewOrder already blocks on insufficient balance (line 371-378). FastOrder falls through to `direct` payment when balance is low. Both paths are fine — the key fix is server-side price verification (Issue 2).

## Files to Modify

| File | Change |
|------|--------|
| **New migration** | Fix FK constraints on `orders.service_id` (SET NULL), `service_reviews.service_id` (SET NULL) |
| `supabase/functions/buyer-order/index.ts` | Add server-side price recalculation and validation; simplify `resolveExternalServiceId` |
| `supabase/functions/buyer-api/index.ts` | Simplify `resolveExternalServiceId` to match |
| `src/pages/panel/OrdersManagement.tsx` | Use `service_name` fallback when `service` join is null |
| `src/pages/panel/Analytics.tsx` | Use `service_name` fallback when `services` join is null |
| `src/pages/panel/PanelOverview.tsx` | Handle null `service_id` in top service calculation |

## Migration SQL

```sql
-- Fix orders.service_id: CASCADE -> SET NULL
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_service_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_service_id_fkey
  FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;

-- Fix service_reviews.service_id: CASCADE -> SET NULL  
ALTER TABLE public.service_reviews DROP CONSTRAINT IF EXISTS service_reviews_service_id_fkey;
ALTER TABLE public.service_reviews
  ADD CONSTRAINT service_reviews_service_id_fkey
  FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;
```

## Server-Side Price Validation (buyer-order)

After fetching the service (line 199-204), add:
```typescript
// Server-side price verification — prevent client price manipulation
const serverPrice = (service.price * quantity) / 1000;
const priceDiff = Math.abs(serverPrice - price);
if (price < serverPrice * 0.99 && priceDiff > 0.01) {
  return error('Price mismatch: service price has changed');
}
// Use server-calculated price to ensure panel owner profit
const verifiedPrice = Math.max(price, serverPrice);
```

