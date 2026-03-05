

# Plan: Fix Service Import Sync, Order Data Persistence, and Order Management UI

## Root Cause Analysis

### 1. "Incorrect service ID" from Provider
The import stores services correctly with `external_service_id` matching the provider's IDs. The `buyer-order` function sends `service.provider_service_id` (from `services` table) to the provider API. This is correct. The error means the specific service ID no longer exists on the provider. The real problem: **the import never deactivates services that the provider has removed**. When a re-import runs, only services returned by the API are upserted — stale services remain active.

### 2. "Total Revenue/Orders Return to 0" After Deleting Services  
Order stats are calculated live from the `orders` array joined with `services`. When services are deleted, `order.service` becomes null, and `provider_cost` (used for profit calc) is lost. The `orders` table has no `provider_cost` column — it only exists on `services`. Stats must survive service deletion.

### 3. Import Function Silent Failures
- `import-provider-services` has **old CORS headers** (line 6) — missing platform headers
- The function updates `providers.sync_status` and `providers.last_sync_at` (line 518-524) but **these columns don't exist** on the `providers` table, causing the update to silently fail
- Uses hardcoded `min_quantity: 10` and `max_quantity: 1000000` instead of the provider's actual values

### 4. `services.provider_id` is TEXT, not UUID
There's no FK from `services.provider_id` to `providers.id`. The Supabase PostgREST join `provider:providers(name)` in OrderManagement won't resolve without a FK. Need to add one (converting text to uuid or adding a proper FK relationship).

### 5. Missing Order Detail Dialog
`OrderManagement.tsx` sets `selectedOrder` on the Eye button click but never renders a `<Dialog>` for order details.

### 6. Conversion Rate
**Conversion rate** = (Completed Orders / Total Orders) × 100. It measures what percentage of placed orders actually get fulfilled. Currently not calculated.

---

## Changes

### Database Migration
```sql
-- 1. Add missing columns to providers
ALTER TABLE providers ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'pending';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS last_sync_at timestamptz;

-- 2. Add provider_cost to orders (persists cost at order time)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_cost numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_id text;

-- 3. Fix services.provider_id: add FK (provider_id is text storing UUID)
ALTER TABLE services ALTER COLUMN provider_id TYPE uuid USING provider_id::uuid;
ALTER TABLE services ADD CONSTRAINT services_provider_id_fkey 
  FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;
```

### `import-provider-services/index.ts`
- Fix CORS headers (line 6)
- Use actual `min_quantity`/`max_quantity` from provider API response instead of hardcoded values (lines 350-351, 445-446)
- **After import: deactivate stale services** — query all active services for this provider+panel, compare against the set of `external_service_id`s just imported, set `is_active = false` for any not in the new set
- The `sync_status`/`last_sync_at` update will work after the migration adds these columns

### `buyer-order/index.ts`
- After order creation, store `provider_cost` and `provider_id` on the order record by fetching from the service before insert

### `OrderManagement.tsx`
- **Stats from orders table directly**: Use `order.provider_cost` (persisted) instead of `order.service?.provider_cost` for profit calculation — survives service deletion
- **Add cards**: "Total Order Amount" (sum of all `price`), rename "Revenue (Profit)" to "Profit from Orders" (sum of `price - provider_cost`), add "Conversion Rate" (completed/total × 100)
- **Add order detail Dialog**: Show full order info when Eye button is clicked, with proper mobile email display (`break-all`, reduced padding)
- **Mobile email fix**: Use `break-all` and `text-xs` on email text in both table and dialog

---

## Files to Change

| File | Change |
|------|--------|
| Database migration | Add `sync_status`/`last_sync_at` to providers, `provider_cost`/`provider_id` to orders, fix `services.provider_id` FK |
| `supabase/functions/import-provider-services/index.ts` | Fix CORS, use real min/max, deactivate stale services after import |
| `supabase/functions/buyer-order/index.ts` | Store `provider_cost` and `provider_id` on order at creation |
| `src/pages/OrderManagement.tsx` | Add Total Order Amount card, rename to Profit from Orders, add conversion rate, add order detail dialog, fix mobile email |

