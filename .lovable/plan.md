

# Plan: Fix Mobile Bulk Select, Enhance Order Management, Fix API Errors

## Issues Found

### 1. Mobile Width Error — BulkActionToolbar (Customer & Order Management)

**Customer BulkActionToolbar** (`BulkActionToolbar.tsx`): The toolbar uses `rounded-full` which causes content to overflow on mobile. It has `max-w-[calc(100vw-2rem)]` and `overflow-x-auto` but the rounded-full shape clips buttons. Needs `rounded-2xl` on mobile and tighter padding.

**Order BulkActionToolbar** (`OrdersManagement.tsx` line 615-649): The fixed bulk bar has `w-[calc(100vw-2rem)] max-w-2xl` — but on small screens the Select + buttons don't fit. The Select width `w-[130px]` is still too wide combined with the count text and buttons.

**Fix**: 
- `BulkActionToolbar.tsx`: Change `rounded-full` to `rounded-2xl` on mobile, reduce gap, make buttons icon-only on mobile.
- `OrdersManagement.tsx`: Stack bulk bar vertically on mobile (count + action on separate rows), reduce select width.

### 2. Order Management SMM Panel Enhancements

**Missing features for SMM panel order management**:
- **Drip-feed info**: No drip-feed column or display anywhere
- **Start count / Remains columns**: Available in data but not shown in table
- **Provider order ID**: Not visible in table or details
- **Auto-refresh**: No real-time subscription for order updates (unlike CustomerManagement which has one)
- **Refund doesn't actually refund balance**: `processRefund` only sets order to cancelled + adds note — never restores buyer balance
- **`syncOrders` uses wrong URL**: Calls `/functions/v1/sync-orders` but that route is on the Express server at `/functions/v1/sync-orders`. This works because the Express server mounts `fnRouter` on `/functions/v1`. However, in production the frontend is served from a different origin — needs `supabase.functions.invoke()` or full URL.

**Fix**:
- Add Start Count and Remains columns to desktop table (hidden on smaller screens)
- Show provider order ID in order details dialog
- Add Supabase realtime subscription for order status updates
- Fix refund to actually restore buyer balance
- Fix sync URL to use proper edge function invocation or server path

### 3. Buyer API (`buyer-api/index.ts`) Errors

**Bug 1 — Line 342**: `buyer.total_spent` is accessed but only `balance` is selected (line 326). This causes `buyer.total_spent` to be `undefined`, so `total_spent` gets set to `0 + price` (losing existing spend data).

**Fix**: Change `.select('balance')` to `.select('balance, total_spent')`.

**Bug 2 — Refund on order failure (line 400)**: Calls `supabase.rpc('increment_balance')` which doesn't exist as a DB function. Falls back to a manual update, but the fallback reads `b.balance` which could have a race condition.

**Fix**: Remove the non-existent RPC call, keep only the direct update fallback.

**Bug 3 — Cancel refund (line 620-624)**: Same race-condition issue with direct balance update on cancellation. Not atomic.

**Fix**: Read `balance` and `total_spent` together, update both atomically.

### 4. Panel API (`panel-api/index.ts`) Issues

**The panel API looks mostly correct**. Minor issues:
- `handleServiceUpdate` uses `.or()` with raw string interpolation for `service_id` — potential injection if `service_id` contains special characters. Should sanitize.
- No issue with core logic.

**Fix**: Use proper parameterized query for the `.or()` clause.

### 5. Buyer Order (`buyer-order/index.ts`) Issues

**Bug — Promo code update (line 340)**: Uses `supabase.rpc('increment_promo_usage')` inside an `.update()` call — this won't work. The `update()` expects a value, not an RPC call result.

**Fix**: Increment promo usage with a separate query (read current `used_count`, then update).

---

## Files to Change

| File | Changes |
|------|---------|
| `src/components/customers/BulkActionToolbar.tsx` | Fix mobile width: `rounded-2xl`, reduce gaps, tighter layout |
| `src/pages/panel/OrdersManagement.tsx` | Fix mobile bulk bar, add Start Count/Remains columns, add realtime subscription, fix refund to restore balance, fix sync URL, show provider_order_id in details |
| `supabase/functions/buyer-api/index.ts` | Fix missing `total_spent` in select, remove non-existent RPC, fix cancel refund race |
| `supabase/functions/buyer-order/index.ts` | Fix promo code increment logic |
| `supabase/functions/panel-api/index.ts` | Sanitize `service_id` in `.or()` query |

