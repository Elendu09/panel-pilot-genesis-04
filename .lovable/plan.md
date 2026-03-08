

# Plan: Fix Service Import, Order Forwarding & Data Integrity

## 3 User Concerns Analyzed

---

### 1. "What happens if I delete imported services?"

**Finding: Data is safe.** Orders store `service_name` directly on the `orders` table (not just a FK). The `service_id` FK on orders is nullable, so deleting a service sets it to null but the order retains: `order_number`, `service_name`, `target_url`, `quantity`, `price`, `status`, `provider_order_id`, `buyer_id`, and all other fields. No cascading deletes exist.

However, the current `deleteService` function does a raw `.delete()` without checking for active orders. The UI falls back to `order.service_name || 'Unknown Service'` which works, but we should:
- **Soft-delete services** (set `is_active = false`) instead of hard delete when orders reference them
- Show a warning before deleting services with active orders

---

### 2. "Orders don't go to providers when tenant buyers order"

**Root cause identified:** The forwarding logic in both `buyer-order` and `buyer-api` works correctly in code. The issue is **the `provider_service_id` mapping**. Here's the chain:

1. Import stores `provider_service_id = String(service.id)` on the `services` table (e.g., `"1234"`)
2. `resolveExternalServiceId()` checks if `provider_service_id` is a UUID — if not, it uses it directly as the external ID
3. But `provider_service_ref` (the FK to `provider_services` table) is also set during import

**Bug:** `resolveExternalServiceId()` checks `provider_service_ref` first, but the `provider_services` row's `external_service_id` may not match the actual provider's service ID. During import, `external_service_id` is set to `String(service.id)` which IS correct. So the chain works... unless:
- The provider is not linked (`provider_id` is null on the service) — forwarding silently skips
- The provider is inactive — forwarding silently skips
- The `provider_service_id` on the `services` table was overwritten during sync

**Real fix needed:** Add better logging and error surfacing. When forwarding fails or is skipped, the order stays "pending" forever with no feedback to the panel owner. We need to:
- Log forwarding attempts and results to `panel_notifications`
- Show provider forwarding status in Order Management UI
- Add a "Retry Forward" button for failed/skipped orders

---

### 3. "Service import crashes, is slow, services go to 'other'"

**Multiple bugs found:**

**A. Import is slow / crashes:** The import in `ServicesManagement.tsx` does 3 sequential bulk upserts to the database (provider_services → normalized_services → services). For large imports (1000+ services), this is a single massive payload. No chunking, no progress updates between steps. The progress bar jumps from 10% to 100% with nothing in between (line 360-362).

**B. Services going to "other":** Two separate detection systems exist:
- **Client-side** (`src/lib/service-icon-detection.ts`): `detectPlatformEnhanced()` — used during import in `ServiceImportDialog.tsx`
- **Edge function** (`provider-services/index.ts`): `detectPlatform()` — used when fetching from provider API

The edge function returns `category` as the detected platform. Then `ServiceImportDialog.tsx` runs its OWN detection on the service name, **ignoring the edge function's detection**. This double-detection causes mismatches. The edge function's `detectPlatform()` uses the provider's raw category string + service name. The client's `detectPlatformEnhanced()` only uses the service name.

**Key problem: NEGATIVE_KEYWORDS are too aggressive.** Words like "google review", "yelp", "trustpilot", "tripadvisor", "google map", "google business" are in `NEGATIVE_KEYWORDS` (line 292-293), which forces services to "other" with confidence 1.0 — **even though** these are valid platforms in `VALID_CATEGORIES` and have their own detection patterns. This means Google Business reviews, Trustpilot reviews, Yelp reviews all get forced to "other".

**C. Progress doesn't show flow:** The stepper component `ImportProgressStepper.tsx` exists but is never used in the import flow. `ServiceImportDialog.tsx` only shows a simple progress bar.

---

## Changes

### `src/pages/panel/ServicesManagement.tsx`
- **Soft-delete with warning**: Change `deleteService` to check for active orders first. If orders exist, set `is_active = false` instead of deleting. Show warning dialog.
- **Chunked import with real progress**: Split the import into chunks of 200 services. Update progress after each chunk (connecting → fetching → processing → complete). Use the existing `ImportProgressStepper` component.
- **Show forwarding status**: After import, surface the provider link status.

### `src/components/services/ServiceImportDialog.tsx`
- **Use edge function's detection**: When mapping fetched services, use the `category` returned by the edge function (which already does detection) instead of re-running `detectPlatformEnhanced()`. Only fall back to client-side detection if edge returns "other".
- **Integrate ImportProgressStepper**: Replace the simple progress bar with the 4-step stepper (connecting → fetching → processing → complete) during fetch and import.

### `src/lib/service-icon-detection.ts`
- **Fix NEGATIVE_KEYWORDS conflict**: Remove platform names that are valid categories from `NEGATIVE_KEYWORDS`: "google review", "google map", "google business", "yelp", "trustpilot", "tripadvisor". These should be detected as their respective platforms, not forced to "other".

### `supabase/functions/buyer-order/index.ts`
- **Better error handling on forwarding failure**: When `forwardToProvider` returns `{ success: false }`, update order status to reflect the issue (not leave as "pending" silently). Add `panel_notifications` entry for forwarding failures.

### `supabase/functions/buyer-api/index.ts`
- **Same forwarding failure handling**: When `forwardOrderToProvider` fails, surface the error in the order notes and notify panel owner.

### `src/pages/panel/OrdersManagement.tsx`
- **Add "Retry Forward" action**: For orders with status "pending" that have no `provider_order_id`, add a button to retry provider forwarding.

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/panel/ServicesManagement.tsx` | Soft-delete with order check, chunked import with real progress |
| `src/components/services/ServiceImportDialog.tsx` | Use edge detection, integrate ImportProgressStepper, chunk-aware progress |
| `src/lib/service-icon-detection.ts` | Remove platform names from NEGATIVE_KEYWORDS |
| `supabase/functions/buyer-order/index.ts` | Surface forwarding failures, notify panel owner |
| `supabase/functions/buyer-api/index.ts` | Surface forwarding failures in order notes |
| `src/pages/panel/OrdersManagement.tsx` | Add retry forward button for stuck orders |

