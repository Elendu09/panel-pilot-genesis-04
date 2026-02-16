

# Fix Payment Onboarding, Admin Payment Management, and Homepage SEO

## Problem Summary

Three distinct issues need fixing:

1. **Payment in onboarding fails** because the `process-payment` edge function reads credentials from the **panel's own settings** (buyer-facing gateways), but during onboarding, the panel has no payment settings configured. Subscription payments should use credentials from `platform_payment_providers.config` (admin-configured gateways).

2. **Admin panel funding fails silently** because the frontend sends `panelId` (camelCase) but the edge function `admin-panel-ops` expects `panel_id` (snake_case), so the destructured value is always `undefined`.

3. **Homepage SEO conflict**: The `Index.tsx` Helmet overrides `index.html` with a different, shorter title ("HOME OF SMM - #1 SMM Panel Platform") and description. The user wants the exact title and description from `index.html` to be used consistently. The canonical URL in `Index.tsx` uses `window.location.origin` which produces wrong URLs on preview/non-production domains.

---

## Plan

### 1. Create a dedicated `process-subscription-payment` Edge Function

The existing `process-payment` function is designed for buyer deposits (reads panel settings). Subscription payments are fundamentally different -- they use admin-configured credentials from `platform_payment_providers`.

**New file: `supabase/functions/process-subscription-payment/index.ts`**

This function will:
- Accept `{ gateway, amount, panelId, userId, plan, returnUrl, currency }`
- Look up gateway credentials from `platform_payment_providers.config` (NOT panel settings)
- Support the same gateway switch-case logic (Stripe, Flutterwave, PayPal, Paystack, Razorpay) but only for subscription-capable providers
- Create a transaction record with type `subscription`
- Return `{ success: true, url: '...' }` for redirect

### 2. Update `OnboardingPaymentStep.tsx`

Change the edge function call from `process-payment` to `process-subscription-payment`:

```
body: {
  gateway: selectedProvider,
  amount: planPrices[selectedPlan],
  plan: selectedPlan,
  panelId,
  userId: user.id,
  returnUrl,
  currency: 'usd',
}
```

### 3. Fix `admin-panel-ops` field naming mismatch

**File: `src/pages/admin/PaymentManagement.tsx`** (line 204)

Change `panelId: selectedPanelId` to `panel_id: selectedPanelId` to match what the edge function destructures.

### 4. Fix Homepage SEO (title, description, canonical)

**File: `src/pages/Index.tsx`**

- Update `seoTitle` to: `HOME OF SMM – Create & Manage Your Own SMM Panel`
- Update `seoDescription` to: `Launch your own SMM panel with Home of SMM. Get custom branding, automated orders, multiple payment gateways, and real-time analytics to grow revenue.`
- Change canonical URL from `window.location.origin` to hardcoded `https://homeofsmm.com` (the production domain) so it's always correct regardless of which domain serves the page

---

## Technical Details

### Edge Function: `process-subscription-payment`

Key differences from `process-payment`:
- Credentials come from `platform_payment_providers` table (`config` JSONB column), not from panel settings
- Only providers with `supports_subscriptions = true` are accepted
- Transaction type is `subscription` instead of `deposit`
- Product name references the plan (e.g., "Basic Plan - HOME OF SMM") not "Account Deposit"

The function will support the currently enabled provider (Flutterwave) and all providers marked `supports_subscriptions = true` in the database: Stripe, PayPal, Paystack, Razorpay, Polar.

### Onboarding Step Calculation

The onboarding flow already correctly handles step calculation:
- 7 fixed steps (0-6): Basic Info, Plan, Payment, Domain, Theme, SEO, Complete
- Payment step (index 2) is skipped when `selectedPlan === 'free'`
- Progress bar uses `visibleSteps` count for accurate percentage
- No changes needed to step logic

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/process-subscription-payment/index.ts` | New edge function for subscription payments using admin credentials |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | Call `process-subscription-payment` instead of `process-payment` |
| `src/pages/admin/PaymentManagement.tsx` | Fix `panelId` to `panel_id` in funding request body |
| `src/pages/Index.tsx` | Update title, description, and hardcode canonical to `https://homeofsmm.com` |

