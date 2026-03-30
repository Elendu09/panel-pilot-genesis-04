

# Plan: Payment Method Configuration Overhaul, Webhook URL Fix, Live Chat Panel ID Fix, Tenant API URL Fix, Service Types & Drip Feed Implementation

## 1. Remove Test Mode & Add Per-Gateway Setup Instructions

**Problems found**:
- Line 907-913 in `PaymentMethods.tsx`: "Test Mode" toggle with `formData.testMode` — unnecessary, everything should be live/production.
- Line 828-850: "Mode Detection" section that checks for "test"/"sandbox" in API key — misleading.
- Webhook URL at line 881 uses `window.location.origin` which shows `lovable.app` instead of the tenant's subdomain/custom domain.
- Many gateways (50+) lack per-gateway setup instructions in the config dialog.
- `dripfeed` is hardcoded to `false` in `buyer-api/index.ts` line 208.

**Fix**:
- Remove `testMode` from `formData` state and all references (lines 184, 344, 371, 907-913).
- Remove the sandbox/test mode detection UI (lines 828-850).
- Add a `gatewaySetupSteps` record with per-gateway step-by-step instructions on how to obtain live API keys, displayed in the config dialog. Example:
```typescript
const gatewaySetupSteps: Record<string, string[]> = {
  stripe: [
    "1. Go to stripe.com/dashboard → Developers → API Keys",
    "2. Copy your Publishable Key (pk_live_...)",
    "3. Copy your Secret Key (sk_live_...)",
    "4. Ensure you're in Live mode (not Test)"
  ],
  paypal: [
    "1. Go to developer.paypal.com → My Apps",
    "2. Select your Live app (or create one)",
    "3. Copy Client ID and Secret from Live tab"
  ],
  // ... for all 70+ gateways
};
```
- Display these steps in the config dialog between the key inputs and the webhook URL section.

## 2. Fix Webhook URL to Use Tenant Domain

**Problem**: Line 881 uses `window.location.origin` which resolves to the panel owner's dashboard URL, not the tenant-facing URL.

**Fix**: Construct webhook URL from `panel.custom_domain` or `panel.subdomain`:
```typescript
const tenantWebhookBase = panel?.custom_domain 
  ? `https://${panel.custom_domain}`
  : panel?.subdomain 
    ? `https://${panel.subdomain}.smmpilot.online`
    : window.location.origin;
// Display: `${tenantWebhookBase}/api/webhooks/${selectedGateway?.id}`
```

## 3. Fix Tenant Live Chat "Missing Panel ID"

**Problem**: In `BuyerSupport.tsx`, `handleStartChat` (line 346) checks `panel?.id` and early returns with toast if missing. The `panel` comes from `useTenant()`. If the tenant hook hasn't resolved yet or fails, `panel?.id` is undefined.

**Fix**:
- Add a loading guard — don't render the chat UI until `panel` is resolved.
- Add better error messaging when `panel` is still loading vs actually missing.
- Ensure the `panelId` is passed correctly in `handleStartChat` body (line 352 already does this — but verify `panel` is not null at call time).

Also in `handleQuickReply` (line 384), `buyer?.id` might be undefined — add guard.

## 4. Fix Tenant API URL Format

**Problem**: `BuyerAPI.tsx` line 49 shows URL as `https://soc.smmpilot.online/api/v2/buyer-api`. The standard SMM panel API format should be just `https://domain.com/api/v2` — not `/api/v2/buyer-api`. The `/buyer-api` suffix is an internal edge function name, not part of the public API URL.

**Fix**: Change the displayed URL to end at `/api/v2`:
```typescript
const apiBaseUrl = panel?.custom_domain 
  ? `https://${panel.custom_domain}/api/v2`
  : panel?.subdomain 
    ? `https://${panel.subdomain}.${platformDomain}/api/v2`
    : `https://yourpanel.${platformDomain}/api/v2`;
```

The actual routing (edge function `buyer-api`) happens server-side — the user-facing API documentation should show the clean `/api/v2` endpoint.

## 5. Implement Service Types (Poll, Subscription, Drip Feed) in Tenant Orders

**Problem**: The database has `service_type` column on `services` table (values: followers, likes, views, poll, subscriptions, drip_feed, etc.), but:
- `BuyerNewOrder.tsx` and `FastOrderSection.tsx` don't show service-type-specific form fields (e.g., drip feed needs `runs` + `interval`; poll needs `answers`; subscription needs `expiry`).
- `buyer-api/index.ts` line 208 hardcodes `dripfeed: false`.
- The order creation doesn't pass drip feed parameters to the provider.

**Fix**:

### buyer-api/index.ts
- Change line 208: read `dripfeed` from the service's actual data:
```typescript
dripfeed: s.dripfeed_available || false,
```
- In `handleAddOrder`, accept and forward `runs`, `interval`, `delay` parameters to the upstream provider when placing orders.

### BuyerNewOrder.tsx
- After service selection, check `service.service_type` or `service.dripfeed_available`:
  - If drip feed available: show "Runs" and "Interval (minutes)" inputs
  - Save these in order metadata and pass to `buyer-order`/`buyer-api`
- For subscription-type services: show "Expiry" date picker
- For poll-type services: show "Answers" textarea (comma-separated)

### FastOrderSection.tsx
- Same conditional fields for drip feed when service supports it

### buyer-order edge function
- Accept `runs`, `interval`, `delay`, `answers`, `expiry` params and forward to provider API

### ServicesManagement.tsx
- Show `service_type` and `dripfeed_available` columns in the service list so panel owners can see/verify what types their imported services have

## 6. Ensure `dripfeed_available` is Read from Provider Import

**Current state**: `sync-provider-services` and `import-provider-services` already read `dripfeed` from provider API responses and store in `provider_services.dripfeed_available`. But when creating the `services` table entry, this field may not be copied over.

**Fix**: Ensure import logic copies `dripfeed_available` from `provider_services` to `services` table during import/sync.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/PaymentMethods.tsx` | Remove test mode toggle/detection; add `gatewaySetupSteps` with live key instructions for all gateways; fix webhook URL to use tenant domain; display setup steps in config dialog |
| `src/pages/buyer/BuyerAPI.tsx` | Fix API URL: remove `/buyer-api` suffix, show clean `/api/v2` |
| `src/pages/buyer/BuyerSupport.tsx` | Add loading guard for panel ID in chat; improve error handling |
| `src/pages/buyer/BuyerNewOrder.tsx` | Add drip feed fields (runs, interval) when service supports it; add poll/subscription fields |
| `src/components/storefront/FastOrderSection.tsx` | Add drip feed fields when applicable |
| `supabase/functions/buyer-api/index.ts` | Fix `dripfeed` to read from DB; accept/forward runs, interval, delay params |
| `supabase/functions/buyer-order/index.ts` | Accept/forward drip feed and service-type-specific params |
| `src/pages/panel/ServicesManagement.tsx` | Show service_type and dripfeed_available in service list |

