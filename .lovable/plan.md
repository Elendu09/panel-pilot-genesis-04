

# Plan: Auth Brand Icon, Payment Real-time Sync, Domain Validation & Edge Fix

## 4 Issues to Fix

### 1. Auth Sidebar Uses Zap Icon Instead of Brand Favicon
**Lines 276-278 and 315-317 in `Auth.tsx`**: Two Zap icons — one in the desktop sidebar, one in the mobile header. Replace both with the `favicon.ico` brand image.

### 2. Payment "Paid" Status Doesn't Sync in Real-time
**Root cause**: After gateway redirect back with `?payment=success`, the `handlePaymentSuccess` is only called from the URL param detection, which sets `paymentCompleted=true`. But the actual payment step component (`OnboardingPaymentStep`) has no mechanism to detect that payment succeeded — it still shows "Pay" buttons because it doesn't poll or subscribe for status changes.

**Fix**: Add a Supabase realtime subscription on the `panels` table in `OnboardingPaymentStep` to detect when `subscription_status` changes to `active` or `trial`. Also add polling fallback (3 attempts, 5s intervals) when returning from gateway.

### 3. Domain "Configure" Doesn't Validate Domain Format
**Root cause**: `handleDomainSubmit` (line 126) only checks `!customDomain` — no regex validation for proper domain format (must have TLD like `.com`, `.xyz`, etc). User can type "iiiii" or "abcc" and it submits.

**Fix**: Add domain format validation regex before submitting: must match pattern like `^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$`.

### 4. Edge Function Error on Configure Click
**Root cause**: `add-vercel-domain` and `verify-domain-dns` were NOT deployed — no logs existed. I've now deployed them. The edge error should be resolved.

---

## Changes

### `src/pages/Auth.tsx`
- Replace `Zap` icon (line 277) with `<img src="/favicon.ico" ... />` for the branded icon
- Same for mobile header (line 316)
- Remove `Zap` from imports if no longer used

### `src/components/onboarding/OnboardingDomainStep.tsx`
- Add domain format validation in `handleDomainSubmit` before the API call
- Regex: `/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/`
- Show toast error: "Please enter a valid domain name (e.g. yourdomain.com)"

### `src/components/onboarding/OnboardingPaymentStep.tsx`
- Add realtime subscription on `panels` table filtered by `panelId` watching for `subscription_status` changes
- When status becomes `active` or `trial`, call `onPaymentSuccess()`
- Add polling fallback: on mount, if `panelId` exists and `!paymentCompleted`, poll every 5s (max 3 times) checking `panels.subscription_status`

### Edge Functions (already done)
- Deployed `add-vercel-domain`, `verify-domain-dns`, `verify-domain-txt`

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Replace Zap with favicon.ico brand image |
| `src/components/onboarding/OnboardingDomainStep.tsx` | Add domain format validation |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | Add realtime + polling for payment status sync |

