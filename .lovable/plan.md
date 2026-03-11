

# Plan: Slide-to-Unlock Trial, Paid Plan Locking, Tenant Domain Guards & Service Import Fix

## 1. Slide-to-Unlock for Trial on Payment Step

**Problem**: After clicking "Start Free Trial", the Next button is disabled (`isNextDisabled = isPaymentStep && !paymentCompleted`). Trial users cannot proceed.

**Solution**: Add a slide-to-unlock component that, once slid, enables the Next button.

### New component: `src/components/onboarding/SlideToUnlock.tsx`
- A track with a draggable thumb (using framer-motion drag)
- User drags right to ~85% of track width → triggers `onUnlock` callback
- Shows "Slide right to continue →" text
- Once unlocked: shows green checkmark, thumb stays at end

### Changes to `OnboardingPaymentStep.tsx`:
- Add `onSlideUnlocked` prop callback
- When `trialStarted && !paymentCompleted`: show slide-to-unlock instead of disabled button
- Replace "Trial Active — Click Next to continue" with the slide component
- When slide completes → call `onSlideUnlocked()`

### Changes to `PanelOnboardingV2.tsx`:
- Add `trialSlideUnlocked` state (boolean)
- Pass `onSlideUnlocked={() => setTrialSlideUnlocked(true)}` to OnboardingPaymentStep
- Update `isNextDisabled` logic: `isPaymentStep && !paymentCompleted && !trialSlideUnlocked`
- **Going back to Plan step**: If user selects a DIFFERENT plan → reset `trialStarted`, `trialSlideUnlocked`, and the DB trial record. Show fresh payment UI.
- **Going back and selecting SAME plan**: If `trialStarted` is true and plan matches → keep trial state, show only "Trial Active" + slide (no payment methods/order summary re-shown)
- Store `trialPlan` alongside `trialStarted` in onboarding_data to detect plan changes

## 2. Lock Plan After Successful Payment

**Problem**: After paying, user can go back to plan step and select a different plan.

### Changes to `PanelOnboardingV2.tsx`:
- When `paymentCompleted === true`, check `subscription_status` in DB on restore
- If `paymentCompleted`: on the Plan step, disable all plan cards except the paid one. Show a notice: "You've already subscribed to [Plan]. Continue with your current plan."
- On `handlePrevious`: if going back to plan step and payment is confirmed, show toast warning
- In `handlePaymentSuccess`: also write to `panel_subscriptions` table immediately (upsert with status='active', plan_type, price)

### Changes to `OnboardingPlanSelector.tsx`:
- Accept `lockedPlan` prop (string | null)
- When `lockedPlan` is set: disable other plans, show lock icon on non-selected plans, show "Paid" badge on locked plan

## 3. Payment → Subscription Sync

**Problem**: Payment success in onboarding doesn't immediately write to `panel_subscriptions`.

### Changes to `handlePaymentSuccess` in `PanelOnboardingV2.tsx`:
- After setting `subscription_status: 'active'`, also upsert `panel_subscriptions`:
  ```
  panel_subscriptions.upsert({
    panel_id, plan_type: selectedPlan, price: planPrices[selectedPlan],
    status: 'active', started_at: now, expires_at: null
  })
  ```

## 4. Tenant Domain — Block Storefront for Unlaunched Panels

**Problem**: `panels_public` view includes `status IN ('active', 'pending')`, so unlaunched panels load their storefront.

### Changes to `src/hooks/useTenant.tsx`:
- After resolving `panelData`, check `panelData.status`:
  - If `status === 'pending'`: set `panel` to null + set error to a special marker like `'panel_pending'`
- This causes TenantRouter to show the "Claim This Subdomain" page (since panel is null)

### Changes to `src/pages/TenantRouter.tsx`:
- In the `isTenantDomain && !panel` block, check if the domain's panel exists but is pending
- Show a different message: "This panel is being set up. Check back soon." instead of "Available for Registration"
- Or simply show the claim page as-is (subdomain IS registered but panel not launched)

**Better approach**: Add an `onboarding_completed` field to `panels_public` view, and in useTenant filter: only resolve panel if `onboarding_completed === true` (for storefront rendering). Panels still mid-onboarding won't load storefronts.

Actually simplest: just check in useTenant after fetching — if the panel's `status` is `'pending'` AND we're on a tenant domain, treat it as "not found" so the claim/setup page shows.

## 5. "Claim This Subdomain" → homeofsmm.com

**Problem**: `TenantRouter.tsx` line 521 uses `platformDomain` (which is `smmpilot.online` on tenant subdomains) for the auth redirect.

### Changes to `src/pages/TenantRouter.tsx`:
- Line 521: Change `https://${platformDomain}/auth` → `https://homeofsmm.com/auth`
- Line 528: Change visit URL similarly or keep as-is (visiting the subdomain is fine)
- This is a hardcoded brand URL, not infrastructure

## 6. Service Import — Investigate Hang Issue

**Problem**: Progress bar shows but hangs, then shows "imported" without actual services appearing.

### Root cause analysis:
Looking at `sync-provider-services/index.ts`:
- The edge function does proper batch insert/upsert with error handling
- Errors in batch operations are caught but **not surfaced to the client** clearly — `result.errors` are included in the response but the UI only shows the `summary` counts
- If the insert fails (e.g., RLS policy blocks it, or a constraint violation), the function still returns `success: true` with `totalNew: 0`

### Changes to `src/pages/panel/ProviderManagement.tsx`:
- In `handleImportServices`: check `data.results` for errors array and surface them
- If `totalNew === 0 && totalUpdated === 0`, show a warning toast instead of success
- Log the full response for debugging

### Changes to `supabase/functions/sync-provider-services/index.ts`:
- Add provider `sync_status` update after sync completes
- Return `success: false` if ALL providers had errors and zero services were processed

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/onboarding/SlideToUnlock.tsx` | **Create** — slide-right-to-unlock component |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | **Modify** — add slide-to-unlock for trial state |
| `src/pages/panel/PanelOnboardingV2.tsx` | **Modify** — trial slide state, plan locking, payment→subscription sync |
| `src/components/onboarding/OnboardingPlanSelector.tsx` | **Modify** — accept lockedPlan prop |
| `src/hooks/useTenant.tsx` | **Modify** — block storefront for unlaunched panels |
| `src/pages/TenantRouter.tsx` | **Modify** — homeofsmm.com redirect, pending panel message |
| `src/pages/panel/ProviderManagement.tsx` | **Modify** — better error surfacing for imports |
| `supabase/functions/sync-provider-services/index.ts` | **Modify** — sync_status update, error reporting |

