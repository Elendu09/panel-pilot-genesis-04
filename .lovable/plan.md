

# Plan: Fix Order Tracking, Service Count Mismatch, and Provider Service ID Mapping

## Root Causes Found

### 1. "Failed to load order status" in Fast Order
`LiveOrderTracker` relies on `buyer.api_key` to call `buyer-api` edge function. Only 4 of 11 buyers have API keys generated. Buyers created via guest signup or without explicit key generation have `api_key = null`, causing the edge function to return "Invalid API key" and the tracker to fail.

**Fix**: Modify `LiveOrderTracker` to accept `buyerId` + `panelId` as props and add a new lightweight action `get-order-by-id` to `buyer-api` that authenticates via buyerId+panelId (already validated during order creation) instead of requiring an API key. Also ensure all new buyer accounts get an API key generated on creation.

### 2. Network/category count mismatch between Fast Order and New Order
`FastOrder.tsx` fetches services with a direct Supabase query (line 408) which is limited to default 1000 rows. `BuyerNewOrder.tsx` uses `useUnifiedServices` hook which paginates up to 10,000 rows.

**Fix**: Replace the direct query in `FastOrder.tsx` with `useUnifiedServices` hook, consistent with all other buyer pages. Pass the unified services to `FastOrderSection` instead of the direct query results.

### 3. Provider service ID mapping — "Incorrect service ID" errors
The current system stores `provider_service_id` correctly (e.g., "111" from upstream provider). The `resolveExternalServiceId` function correctly uses this for API requests. However, the user wants a clear **panel service ID** (sequential, human-readable number like "25", "26") shown to tenants — separate from the **provider service ID** used internally for API forwarding.

Currently, `display_order` exists but is only used for sorting, not as a tenant-facing ID. The user's reference screenshots show socpanel using sequential IDs.

**Fix**: Use `display_order` as the tenant-facing "Service ID" (rename/alias as `panel_service_id` in the UI). In Services Management, show both the panel service ID and the provider service ID. In tenant-facing pages (Fast Order, New Order, Services), show only the panel service ID. In order forwarding, continue using `provider_service_id` for API requests (no change needed).

Also: ensure `buyer-auth` guest-order flow generates an `api_key` for every new buyer.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/order/LiveOrderTracker.tsx` | Accept `buyerId`+`panelId` props; fetch order by passing these to edge function instead of requiring API key |
| `supabase/functions/buyer-api/index.ts` | Add alternative auth path for `get-order` that accepts `buyerId`+`panelId` directly (validated pair) |
| `src/pages/FastOrder.tsx` | Replace direct service query with `useUnifiedServices` hook for consistent counts |
| `src/components/storefront/FastOrderSection.tsx` | Pass `buyerId`+`panelId` to `LiveOrderTracker` |
| `supabase/functions/buyer-auth/index.ts` | Ensure guest-order creates `api_key` for new buyers |
| `src/pages/panel/ServicesManagement.tsx` | Show `display_order` as "Panel Service ID" and `provider_service_id` as "Provider ID" in the table |

## Technical Details

**Order tracking auth bypass**: Instead of requiring API key, `LiveOrderTracker` passes `{ action: 'get-order', orderId, buyerId, panelId }`. The edge function validates that the order belongs to `buyerId` on `panelId` using service role. This is secure because the buyerId is from the authenticated buyer context, not user input.

**Service count fix**: Simply swap:
```typescript
// Before (FastOrder.tsx line 408-414)
const { data: servicesData } = await supabase.from('services').select(...)

// After
const { services } = useUnifiedServices({ panelId: resolvedPanelId });
```

**Panel service ID**: The `display_order` field (0-indexed integer assigned during import) serves as the tenant-facing service ID. No new columns needed. Just display it as "ID" in tenant pages and "Panel ID" in admin pages.

