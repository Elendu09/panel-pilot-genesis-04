

# Plan: Fix Order Creation Error, Service IDs, Validation, Links, and Crypto Payments

## Issue 1: "Cannot access 'verifiedPrice' before initialization" (CRITICAL)

**Root cause**: In `buyer-order/index.ts`, `verifiedPrice` is used on line 162 (balance check) but declared on line 201 (after service fetch and price calculation). JavaScript `const` has a temporal dead zone — using it before declaration throws this exact error.

**Fix**: Reorder the logic in the edge function so that:
1. Fetch buyer
2. Fetch service
3. Calculate `verifiedPrice`
4. THEN check balance against `verifiedPrice`

This single fix resolves the "Order Failed" error on both Fast Order and New Order pages.

## Issue 2: Service IDs for Tenant Users

**Current state**: Tenant users see `provider_service_id` (the external provider ID) or a truncated UUID. They should see a simple sequential panel-local ID (like #1, #2, #3) based on `display_order`.

**Fix**: In `FastOrderSection.tsx` line 1163-1165 and `BuyerNewOrder.tsx`, show `display_order` as the tenant-facing service ID (e.g., "ID: 1") instead of `provider_service_id`. The `provider_service_id` remains visible only to panel owners in ServicesManagement.

## Issue 3: Fast Order Missing Validations

**Current state**: Step 4 (Order Details) does not validate:
- Empty or invalid URL/username
- Quantity below `min_quantity` or above `max_quantity`

**Fix**: In `handleDetailsConfirmed()` (line 387), add:
- URL/username presence check (already exists but no format validation)
- Quantity range validation against `selectedService.min_quantity` and `max_quantity`
- Show clear error toasts with the allowed range

Also clamp quantity when it's out of range in the quantity input `onChange`.

## Issue 4: Order Links Opening Incorrectly

**Current state**: The screenshot shows "Homeofsmm.com" as the link text in the order summary. This is the `targetUrl` the buyer entered — the system displays it correctly. The issue is that when clicking the link in Order Management or order details, it should open in a new tab with the correct URL.

**Fix**: In `OrdersManagement.tsx`, the link on line 1058 already uses `target="_blank"`. The "homeofsmm" text is the actual `target_url` the buyer typed. This is working correctly — the buyer entered that URL. No code change needed here.

However, in `FastOrderSection.tsx` Step 5 (line 1407-1410), the `targetUrl` is displayed as plain text, not as a clickable link. Make it clickable with `target="_blank"`.

## Issue 5: Crypto Payment "Not Configured" Error

**Root cause**: When a panel owner tries to pay for billing/subscription via crypto (Coinbase Commerce), the system looks up `platform_payment_providers` for the gateway name `crypto` or `coinbase`. The admin may have configured it under a different name, or the `config` object may not have `apiKey` set.

The error "Crypto payment not configured" comes from line 553-557 when `gatewayConfig.apiKey` is null. For owner payments, the config is built from `platform_payment_providers.config` which maps `api_key` to `apiKey` (line 329). If the admin stored the key under a different field name (like `commerce_api_key`), it won't be found.

**Fix**: In `process-payment/index.ts`, for the `crypto`/`coinbase` case, also check `gatewayConfig.commerceApiKey` and the env fallback `COINBASE_COMMERCE_API_KEY`. Also improve the error message to say which config field is missing so the admin knows what to set.

For the `cryptomus` case, same pattern — check more field name variants.

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/buyer-order/index.ts` | Reorder balance check AFTER `verifiedPrice` declaration |
| `src/components/storefront/FastOrderSection.tsx` | Show `display_order` as tenant ID; add quantity validation; make target URL clickable |
| `src/pages/buyer/BuyerNewOrder.tsx` | Show `display_order` as tenant service ID |
| `supabase/functions/process-payment/index.ts` | Improve crypto config key resolution with more field name fallbacks |

## Key Code Changes

**buyer-order/index.ts** — Move balance check after service fetch:
```
// Current broken order:
// 1. Fetch buyer → 2. Check balance vs verifiedPrice (ERROR!) → 3. Fetch service → 4. Declare verifiedPrice

// Fixed order:
// 1. Fetch buyer → 2. Fetch service → 3. Declare verifiedPrice → 4. Check balance vs verifiedPrice
```

**FastOrderSection.tsx** — Quantity validation in `handleDetailsConfirmed`:
```typescript
const minQty = selectedService?.min_quantity || 1;
const maxQty = selectedService?.max_quantity || 1000000;
if (quantity < minQty || quantity > maxQty) {
  toast({ title: `Quantity must be between ${minQty} and ${maxQty.toLocaleString()}`, variant: "destructive" });
  return;
}
```

**Service ID display** — Show sequential panel ID:
```typescript
// Instead of provider_service_id
<Badge>ID: {service.display_order || index + 1}</Badge>
```

