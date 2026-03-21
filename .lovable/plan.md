

# Plan: Fix "origin is not defined" Error, Balance-Based Upgrades, Trial Expiry Locking, and Payment Separation

## Issue 1: "Deposit Failed: origin is not defined" (CRITICAL)

**Root cause**: In `process-payment/index.ts` line 588-589, the Coinbase Commerce charge payload uses `${origin}` for `redirect_url` and `cancel_url`, but `origin` is never declared in the edge function. In Deno edge functions, there is no `window.location.origin`. The `returnUrl` parameter IS passed in the request body (line 249) but is not used for the Coinbase case.

**Fix**: Replace `${origin}` with `${returnUrl}` on lines 588-589, consistent with how Stripe, Flutterwave, Paystack, and all other gateways use `returnUrl`.

## Issue 2: Balance-Based Plan Upgrade in Billing Page

**Current state**: `handleUpgrade()` always redirects to a payment gateway. No option to use panel balance.

**Fix**: Before calling `process-payment`, check if `panelBalance >= plan.price`. If yes, show a dialog asking:
- "Use Balance ($X.XX)" — deducts from panel balance directly via a new `balance-payment` action in `process-payment`
- "Pay via Gateway" — proceeds to external payment as current flow

Also: when subscription `expires_at` is reached and `panelBalance >= plan.price`, auto-renew by calling the balance-payment path automatically. This check runs in `usePanel.tsx` during the existing expiry check loop.

## Issue 3: Trial Expiry Locking

**Current state**: `usePanel.tsx` already auto-downgrades expired trials to `free` tier. `TrialExpiryBanner` shows a warning banner. But there is NO lock that redirects panel owners to billing when their trial/subscription expires.

**Fix**:
- In the panel layout/guard component, when `subscription_status === 'expired'`, show a full-screen lock overlay (not just a banner) that only allows navigation to `/panel/billing`
- Add countdown warning at 3 days, 1 day, and final hours before expiry
- The `TrialExpiryBanner` already handles active trial warnings — enhance it to also cover paid subscription expiry (not just trials)

## Issue 4: Admin vs Panel Owner Payment Method Separation

**Current state**: Both admin and panel owner payments go through the SAME `process-payment` edge function, which is correct — they just use different config sources (admin: `platform_payment_providers` table; panel owner: `panels.settings.payments`). The separation already exists at lines 298-388.

**No new edge function needed.** The current architecture correctly separates:
- Admin gateways (from `platform_payment_providers`) → used when `isOwnerDeposit=true` or `metadata.type='subscription'`
- Panel owner gateways (from `panel.settings.payments`) → used for tenant/buyer payments

The database already stores admin keys in `platform_payment_providers.config` and panel keys in `panels.settings.payments.enabledMethods`. These are already separate. Creating duplicate edge functions would introduce maintenance burden with no security benefit.

**Clarification for user**: Admin payment methods = `platform_payment_providers` table (for panel owner billing). Panel payment methods = `panels.settings.payments` JSON (for tenant deposits/orders). Already separate databases/storage.

## Issue 5: Coinbase Commerce API Error

The `/charges` endpoint returning `ForbiddenError` or deprecation — this is because:
1. `origin` is undefined (Issue 1) causing the entire request to fail before reaching Coinbase
2. Some Coinbase Commerce API keys only support `/charges` (older) or only `/checkouts` (newer)

The dual-endpoint fallback is already implemented. Fixing `origin` → `returnUrl` will resolve this.

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/process-payment/index.ts` | Fix `${origin}` → `${returnUrl}` on lines 588-589; add `balance-payment` action for direct balance deduction |
| `src/pages/panel/Billing.tsx` | Add balance-upgrade dialog; add subscription expiry lock overlay |
| `src/components/billing/TrialExpiryBanner.tsx` | Enhance to cover paid subscription expiry countdown |
| `src/hooks/usePanel.tsx` | Add auto-renewal check when subscription expires and balance is sufficient |

## Key Implementation Details

### process-payment fix (lines 588-589):
```typescript
redirect_url: `${returnUrl}?gateway=coinbase&tx=${transactionIdToUse}`,
cancel_url: `${returnUrl}?gateway=coinbase&tx=${transactionIdToUse}&cancelled=true`,
```

### Balance-payment action in process-payment:
```typescript
if (body.action === 'balance-payment') {
  // Deduct from panel balance, create completed transaction, update subscription
  // Used when panel owner chooses to pay from their panel balance
}
```

### Billing page upgrade dialog:
```typescript
// Before handleUpgrade redirects to gateway:
if (panelBalance >= plan.price) {
  // Show AlertDialog: "You have $X.XX. Pay from balance or use gateway?"
  // Option 1: Call balance-payment action → instant upgrade
  // Option 2: Proceed to gateway as before
}
```

### Subscription expiry lock in Billing.tsx:
```typescript
// Full-page overlay when subscription_status === 'expired'
if (subscription?.status === 'expired' && currentPlan !== 'free') {
  // Lock all panel pages except /panel/billing
  // Show "Your subscription has expired. Please renew to continue."
}
```

### Auto-renewal in usePanel.tsx:
```typescript
// During expiry check, if balance >= plan price:
if (sub?.expires_at && new Date(sub.expires_at) < new Date()) {
  if (panel.balance >= planPrice) {
    // Auto-renew via balance-payment
  } else {
    // Mark as expired (existing logic)
  }
}
```

