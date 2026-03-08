

# Plan: Fix Onboarding Loop, Payment Flow, Auth Redesign & Domain Edge Error

## Issues Found

### 1. Onboarding Loop When Creating New Panel
**Root cause**: In `PanelOnboardingV2.tsx` line 148-158, it checks for ANY panel with `onboarding_completed: true`. If user already has a completed panel and navigates to `/panel/onboarding` (without `?new=true`), it redirects to `/panel`. But the dashboard or auth page redirects back to `/panel/onboarding` if a new incomplete panel exists. This creates a redirect loop.

The same `checkOnboardingAndRedirect` in `Auth.tsx` (line 89-113) queries for completed panels — if it finds NONE completed but there IS an incomplete one, it sends to onboarding. But once there, the onboarding check finds a COMPLETED panel and sends back to `/panel`.

**Fix**: Change onboarding to check for incomplete panels belonging to the current user FIRST. If an incomplete panel exists, resume it. If all panels are completed, only redirect to `/panel` — don't create the loop. Also ensure the "create new panel" flow always uses `?new=true`.

### 2. Payment Gateway Email — Uses Wrong ID for Lookup
**Root cause**: `OnboardingPaymentStep` sends `buyerId: user.id` (auth UID), but `process-payment` line 288-293 queries `profiles` by `WHERE id = buyerId`. Since `profiles.id` is a separate auto-generated UUID (not `user_id`), the email lookup fails silently, falling back to `user-xxx@platform.local`.

**Fix**: In `process-payment`, change the email lookup to query `profiles` by `user_id` instead of `id`. Also fetch `full_name` for gateways that need it.

### 3. Payment Step Button Logic
**Current**: The payment step has "Start Free Trial" and "Pay $X" buttons inside `OnboardingPaymentStep`, plus "Back"/"Next" (or "Skip") buttons in the navigation bar below. The user wants:
- Lock "Next" until either "Start Free Trial" or "Pay" is actioned
- If "Start Free Trial" → unlock Next, let user click to proceed
- If "Pay" → on successful return, auto-unlock Next and save payment status to DB
- If payment fails → Next stays locked

**Fix**: 
- Remove the automatic `onSkip` behavior that auto-advances to next step
- Instead, `onSkip` (trial) just sets `paymentCompleted = true` without advancing
- The Next button becomes enabled only when `paymentCompleted === true`
- On `?payment=success` return, set `paymentCompleted = true` and save to panel's `onboarding_data`

### 4. Auth Page Redesign
**Current**: Split-screen with gradient backgrounds. User wants: light/dark only (no gradient), Google button below the form, official Google logo SVG.

**Fix**: Remove all gradient classes from Auth.tsx backgrounds. Use `bg-background` for the page and `bg-card` for the form. Move Google button below the form (after sign in/up button). Use the official Google "G" SVG inline instead of `SiGoogle` from react-icons.

### 5. Domain Edge Error in Onboarding
**Root cause**: `OnboardingDomainStep` line 124 uses `panelId || 'pending'` — if `panelId` is undefined, it sends `panel_id: 'pending'` to the edge function. The `panel_domains` table has a FK constraint on `panel_id` referencing `panels.id`, so `'pending'` (not a valid UUID) causes a DB error.

The `panelId` prop IS now passed from `PanelOnboardingV2.tsx` (line 754), but only if `createdPanelIdRef.current` has been set. If the user skips straight to domain step before `saveProgress` creates the panel, it's still undefined.

**Fix**: In `OnboardingDomainStep`, don't allow domain submission if `panelId` is undefined. Show a message like "Please complete previous steps first". Also ensure `saveProgress` is called before reaching the domain step.

---

## Changes

### `src/pages/panel/PanelOnboardingV2.tsx`
- Fix the existing panel check: if user has a completed panel AND an incomplete panel, resume the incomplete one instead of redirecting
- Change `onSkip` handler to NOT auto-advance — only set `paymentCompleted = true`
- Change `handlePaymentSuccess` to set `paymentCompleted = true` without auto-advancing
- Make Next button disabled on payment step when `!paymentCompleted`
- On `?payment=success`, also persist `paymentCompleted: true` to `onboarding_data`

### `src/components/onboarding/OnboardingPaymentStep.tsx`
- Change `onSkip` callback to not navigate — just signal completion
- `handleSkipWithTrial` should call `onSkip()` without navigating

### `supabase/functions/process-payment/index.ts`
- Line 288-293: Change `.eq('id', buyerId)` to `.eq('user_id', buyerId)` for email lookup
- Also select `full_name` and pass to gateways that need it

### `src/pages/Auth.tsx`
- Replace gradient backgrounds with solid `bg-background` / `bg-card`
- Move GoogleButton to render AFTER the sign-in/sign-up form (below the submit button)
- Replace `SiGoogle` with inline SVG of official Google "G" logo
- Remove the `Divider` component (no longer needed between google and form)
- Keep the left panel branding on desktop but remove gradient there too

### `src/components/onboarding/OnboardingDomainStep.tsx`
- Add guard: if `panelId` is falsy, show a notice instead of allowing domain submission
- Remove `'pending'` fallback on line 124

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/panel/PanelOnboardingV2.tsx` | Fix onboarding loop, payment step Next locking |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | Trial skip doesn't auto-advance |
| `supabase/functions/process-payment/index.ts` | Fix email lookup to use `user_id` |
| `src/pages/Auth.tsx` | Redesign: no gradients, Google below form, official SVG |
| `src/components/onboarding/OnboardingDomainStep.tsx` | Guard against missing panelId |

