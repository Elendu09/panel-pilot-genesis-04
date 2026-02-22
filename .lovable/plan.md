

# Implementation Plan: Onboarding Guard, Payment Fix, SEO Domain, and Services

## 1. Onboarding Guard -- Prevent Dashboard Bypass (CRITICAL)

Add a guard in `PanelOwnerDashboard.tsx` that redirects users to `/panel/onboarding` if their panel has `onboarding_completed: false` or if no panel exists yet.

**File:** `src/pages/PanelOwnerDashboard.tsx`
- Import `useNavigate` from react-router-dom (already imported via `Link`)
- After line 82 (`const { panel } = usePanel()`), add `useNavigate()` hook
- Add a `useEffect` that checks: if `!loading && panel && !panel.onboarding_completed`, redirect to `/panel/onboarding`
- Also handle case where `!loading && !panel` (no panel created yet) -- redirect to `/panel/onboarding`
- The `usePanel` hook already exposes `loading` -- need to destructure it: `const { panel, loading } = usePanel()`

## 2. Fix Payment -- saveProgress Must Capture panelId (CRITICAL)

The `saveProgress` function uses `.upsert({...}, { onConflict: 'owner_id' })`. The previous migration added a unique index on `owner_id`. However, the plan says to DROP this index because it breaks multi-panel support. Instead, we will switch to INSERT/UPDATE pattern.

**File:** `src/pages/panel/PanelOnboardingV2.tsx`

Replace the `saveProgress` function (lines 280-308) with INSERT/UPDATE logic:
- If `createdPanelId` exists: UPDATE the existing panel
- If not: INSERT a new panel and capture the returned ID via `.select('id').single()`

Also fix `handleComplete` (lines 375-498): Change from `.upsert({...}, { onConflict: 'owner_id' })` to use `createdPanelId` for UPDATE, with INSERT fallback.

**File:** `src/components/onboarding/OnboardingPaymentStep.tsx`

Add validation at the start of `handlePayment`: if `!panelId`, show a toast error telling user to go back and complete previous steps.

## 3. Fix process-payment -- Make panelId Optional for Owner Deposits

**File:** `supabase/functions/process-payment/index.ts`

Line 39 currently requires panelId for ALL payments. Change to only require it for non-owner payments:

```text
Before: if (!gateway || !amount || !panelId || !buyerId)
After:  if (!gateway || !amount || !buyerId || (!panelId && !isOwnerDeposit))
```

When `panelId` is missing but `isOwnerDeposit` is true, skip the panel fetch (lines 51-63) and use a fallback panel name.

## 4. Fix SEO Domain -- Replace "homeofsmm" in OnboardingDomainStep

**File:** `src/components/onboarding/OnboardingDomainStep.tsx`
- Line 143: `homeofsmm-verify=` to `smmpilot-verify=`
- Line 372: `_homeofsmm` to `_smmpilot`
- Line 374: `homeofsmm-verify=` to `smmpilot-verify=`
- Line 379: `homeofsmm-verify=` to `smmpilot-verify=`

## 5. Database Migration -- Drop Unique Index + Keep RLS Fix

**New migration file** to drop the `panels_owner_id_unique` index (since multi-panel support is needed):

```sql
DROP INDEX IF EXISTS panels_owner_id_unique;
```

The `is_panel_active()` function and services RLS policy from the previous migration are correct and should remain.

## 6. Panel Name Sync in GeneralSettings

**File:** `src/pages/panel/GeneralSettings.tsx`

Verify that `companyName: settings.panelName` is included in the `custom_branding` update object during `handleSave`. (Already confirmed present from previous fix.)

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/PanelOwnerDashboard.tsx` | Add onboarding guard redirect |
| `src/pages/panel/PanelOnboardingV2.tsx` | Replace upsert with INSERT/UPDATE in saveProgress and handleComplete |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | Add panelId validation before payment |
| `supabase/functions/process-payment/index.ts` | Make panelId optional for owner deposits |
| `src/components/onboarding/OnboardingDomainStep.tsx` | Replace homeofsmm with smmpilot (4 places) |
| New migration SQL | Drop `panels_owner_id_unique` index |

