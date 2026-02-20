

# Fix Plan: SEO Isolation, Payment Gateway Errors, Services Visibility, and Panel Name Sync

## Issue 1: SEO -- index.html Overriding Helmet on All Pages

**Root Cause (Critical):**
1. The `index.html` has a broken structure -- everything after line 231 (`</html>`) is **duplicated content outside the HTML document**. Lines 232-417 are orphaned tags that browsers try to parse but produce unpredictable results.
2. The `<title>` tag on line 35 uses `data-platform` attribute, but the cleanup script (line 186) only removes `[data-platform-only]` elements. So the platform `<title>` and `<meta description>` are **never removed** for tenant domains.
3. The hardcoded `<title>` in `index.html` competes with React Helmet's `<title>` -- React Helmet should win, but the duplicated/malformed HTML confuses it.

**Fix:**
- Clean up `index.html` completely: remove all duplicated content after `</html>` (lines 232+)
- Change `data-platform` to `data-platform-only` on the `<title>` and `<meta description>` tags so the tenant cleanup script removes them
- The `Index.tsx` Helmet already sets proper homepage-specific SEO tags -- that remains the single source for platform pages
- The `TenantHead.tsx` Helmet already reads from `panel_settings` for tenant pages -- that remains the single source for tenant SEO
- Ensure `TenantHead.tsx` also syncs SEO from the panel's `settings.seo` and `panel_settings` table (it already does via `panelSettings?.seo_title`, `panelSettings?.seo_description`)

## Issue 2: Payment "Missing Required Fields" Error (Billing Deposit + Onboarding)

**Root Cause:**
The `process-payment` edge function (line 37) requires `buyerId` as a mandatory field:
```
if (!gateway || !amount || !panelId || !buyerId) { return "Missing required fields" }
```

But the **Billing page** `handleDeposit` (line 303) sends `userId: profile.id` instead of `buyerId`. The field name mismatch means `buyerId` is `undefined`, triggering the "Missing required fields" error.

Additionally, the edge function (lines 45-106) looks up gateway credentials from the **panel's** `settings.payments.enabledMethods`. But for panel owner billing, the gateways come from `platform_payment_providers` (admin-configured). The panel owner may not have "flutterwave" in their buyer-facing payment methods, causing the "flutterwave is not enabled for this panel" error shown in screenshot 1.

**Fix for Billing.tsx (handleDeposit):**
- Change `userId: profile.id` to `buyerId: profile.id` to match the edge function's expected field name
- Add `isOwnerDeposit: true` flag (already present, but not used by edge function)

**Fix for process-payment edge function:**
- Add logic to check `platform_payment_providers` table when `isOwnerDeposit: true` or when the payment is a subscription/commission type
- Use admin gateway credentials from `platform_payment_providers.config` instead of the panel's buyer-facing settings
- This way panel owner billing (subscriptions, deposits, commissions) uses admin-configured gateways while buyer deposits use panel-configured gateways

**Fix for OnboardingPaymentStep.tsx:**
- It sends `buyerId: user.id` (correct field name) but the edge function then looks for the gateway in the **panel's** settings, which are empty during onboarding. The panel hasn't configured any buyer payment methods yet.
- Same fix: the edge function needs to check `platform_payment_providers` for admin gateways when the request context indicates it's an owner/subscription payment.

## Issue 3: Services Not Showing for "soc" Panel in Tenant

**Database check:** Panel "AiSoc" (subdomain: soc) has **2,073 active, visible services**. The data exists.

**Root Cause:** The `useUnifiedServices` hook fetches services from the `services` table using RLS. The RLS policy "Public can view services from active panels" should allow this. However, the services query requires `panelId` which comes from `useTenant()`. If tenant detection fails or is delayed, `panelId` is `null` and no services are fetched.

**Likely cause:** The `useTenant` hook queries `panels_public` view which may not include the `soc` panel if its `status` is not 'active'. Let me verify.

**Fix:**
- Check if the `panels_public` view filters by status and ensure the soc panel has `status = 'active'`
- Add better error logging in `useUnifiedServices` when panelId is null or services return 0 despite data existing

## Issue 4: Panel Name Change Not Reflected in Tenant Storefront

**Root Cause:** When the panel owner updates their panel name in General Settings, `handleSave` (line 254) updates `panels.name` but does NOT update `custom_branding.companyName`. The storefront hero (line 122) reads `customization.companyName` first (from `custom_branding`), which still holds the old value.

For example, the "soc" panel has:
- `panels.name` = "AiSoc" (updated)
- `custom_branding.companyName` = "socpanel ai" (stale)

The storefront displays "socpanel ai" because `companyName` in `custom_branding` takes priority.

**Fix in GeneralSettings.tsx `handleSave`:**
- When updating `custom_branding`, also sync `companyName` to match the new panel name:
```
custom_branding: {
  ...existingBranding,
  companyName: settings.panelName, // <-- ADD THIS LINE
  faviconUrl: settings.faviconUrl,
  ...
}
```

## Issue 5: Build Errors (TypeScript)

All 40+ build errors are pre-existing TypeScript issues in edge functions (`error.message` on `unknown` type, type mismatches). These need to be fixed with `(error as Error).message` patterns and proper type assertions.

**Fix:** Apply `(error as Error).message` across all affected edge functions and fix specific type issues:
- `buyer-auth/index.ts`: Fix boolean return type with `return Boolean(str && str.startsWith('$2'))`
- `serve-favicon/index.ts`: Add `.maybeSingle()` type handling
- `process-payment/index.ts`: Fix `string | undefined` assignments with `transactionIdToUse!` or default values
- `generate-invoice-pdf/index.ts`: Fix `address` property on company object
- `domain-health-check/index.ts`: Fix DNS TXT record type casting

---

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Remove duplicated content after `</html>` (lines 232+); change `data-platform` to `data-platform-only` on title and meta description |
| `src/pages/panel/Billing.tsx` | Line 303: Change `userId: profile.id` to `buyerId: profile.id` |
| `src/pages/panel/GeneralSettings.tsx` | Line 258: Add `companyName: settings.panelName` to custom_branding update |
| `supabase/functions/process-payment/index.ts` | Add admin gateway lookup when `isOwnerDeposit` or subscription payment; fix TypeScript errors |
| Multiple edge function files | Fix `(error as Error).message` and other TS errors across ~20 files |

## Technical Details

### process-payment edge function changes:
After line 33 (body parsing), add logic:
```typescript
// For panel owner payments (billing, subscriptions), use admin-configured gateways
const isOwnerPayment = body.isOwnerDeposit || body.metadata?.type === 'subscription' || body.metadata?.type === 'commission_payment';

if (isOwnerPayment) {
  // Fetch from platform_payment_providers instead of panel settings
  const { data: adminProvider } = await supabase
    .from('platform_payment_providers')
    .select('*')
    .eq('provider_name', gateway)
    .eq('is_enabled', true)
    .maybeSingle();
  
  if (!adminProvider) {
    return error response: gateway not configured by admin
  }
  
  gatewayConfig = { 
    id: adminProvider.provider_name, 
    enabled: true, 
    secretKey: adminProvider.config?.secret_key,
    apiKey: adminProvider.config?.api_key 
  };
  // Skip the panel settings gateway lookup
}
```

### Billing.tsx handleDeposit fix (line 299-313):
```typescript
body: {
  gateway: method,
  amount,
  panelId: panel.id,
  buyerId: profile.id,  // was 'userId' -- edge function expects 'buyerId'
  isOwnerDeposit: true,
  returnUrl: ...,
  ...
}
```

### GeneralSettings.tsx handleSave fix (line 257-264):
```typescript
custom_branding: {
  ...existingBranding,
  companyName: settings.panelName,  // Sync with panel name
  faviconUrl: settings.faviconUrl,
  appleTouchIconUrl: settings.appleTouchIconUrl,
  ogImageUrl: settings.ogImageUrl,
  logoUrl: settings.logoUrl,
  heroImageUrl: settings.heroImageUrl,
},
```

