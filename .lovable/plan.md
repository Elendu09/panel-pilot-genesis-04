

# Plan: Fix Menu Toggle, Admin Pages, Onboarding Payment Flow, Domain Edge Error, Auth Redesign & Import Verification

## Issues Identified

### 1. Menu Switch Doesn't Apply Immediately
**Root cause**: `PanelOwnerDashboard.tsx` line 450 reads `localStorage.getItem('header-menu-visible')` directly in JSX — this is a static read, not reactive. The component doesn't re-render when `MoreMenu` dispatches `window.dispatchEvent(new Event('storage'))` because there's no state tracking this value.

**Fix**: Add a `headerMenuVisible` state in `PanelOwnerDashboard` initialized from localStorage, and listen for `storage` events to update it reactively.

### 2. Admin Pages — Panels/Users Not All Showing
**Root cause**: `PanelManagement.tsx` and `UserManagement.tsx` use direct `supabase.from()` queries which respect RLS. The admin RLS policy on `panels` uses `is_any_admin(auth.uid())` but `profiles` table may not have an admin SELECT ALL policy. Also, the default Supabase row limit is 1000 — if there are many records, pagination is needed.

**Fix**: 
- Add `.limit(10000)` or pagination to admin queries
- Verify RLS policies allow admin to see all `profiles` rows (add policy if missing)

### 3. Onboarding Payment — No Auto-Redirect + No "Next" Button on Payment Step
**Root cause**: 
- The `?payment=success` detection (line 211-226) only fires if `currentStep === 2` (payment step). But if the user returns and the state hasn't been restored yet (`restoringState` is still true), the check is skipped entirely because of the guard on line 213.
- Navigation buttons are hidden when `isPaymentStep` is true (line 1272: `!isPaymentStep`). This means once you're on the payment step, there's NO way to navigate away without paying — even on return visits where payment was already completed.

**Fix**:
- Move the `?payment=success` check to run independently of `restoringState` — detect it immediately on mount
- Always show "Next" button on payment step, but label it "Skip" or "Next" if `paymentCompleted` is already true
- Add a check: if returning to onboarding and `subscription_status !== 'pending'`, auto-skip payment step

### 4. Custom Domain Edge Error in Onboarding
**Root cause**: Two issues:
- `panelId` prop is **NOT passed** to `OnboardingDomainStep` (line 734-747 — no `panelId` prop). The component uses `panelId || 'pending'` as fallback, which means `add-vercel-domain` receives `panel_id: 'pending'` — not a valid UUID, causing the edge function to fail when it tries to upsert to `panel_domains` with a FK constraint.
- `add-vercel-domain` has outdated CORS headers (line 6) missing the `x-supabase-client-platform` headers.

**Fix**:
- Pass `panelId={createdPanelIdRef.current || undefined}` to `OnboardingDomainStep`
- Fix CORS headers in `add-vercel-domain/index.ts`

### 5. Auth Page Redesign
The current auth page is functional but the user wants the previous design restored. Based on the current code, it's a centered card with gradient background. The user likely wants a split-screen or more visually striking design. I'll enhance it with a left panel showing branding/features and right panel with the form — a common SaaS auth pattern.

### 6. Service Import Verification
The import function at `import-provider-services/index.ts` is already structured correctly. Main concerns are speed and error handling. Will verify CORS, error casting, and ensure batch operations don't crash on large datasets.

---

## Changes

### Database Migration
```sql
-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR is_any_admin(auth.uid()));
```

### `src/pages/PanelOwnerDashboard.tsx`
- Add `const [headerMenuVisible, setHeaderMenuVisible] = useState(() => localStorage.getItem('header-menu-visible') === 'true')`
- Add `useEffect` listening to `storage` event to update `headerMenuVisible` state reactively
- Replace `localStorage.getItem('header-menu-visible') === 'true'` in JSX with `headerMenuVisible`

### `src/pages/panel/PanelOnboardingV2.tsx`
- Pass `panelId={createdPanelIdRef.current || undefined}` to `OnboardingDomainStep` (line 734)
- Fix `?payment=success` detection: run it before `restoringState` check, set a ref to prevent double-fire
- Show navigation buttons even on payment step: change condition from `!isPaymentStep` to `true`, but label the "Next" button as "Skip" when on payment step if `paymentCompleted` is true
- Add logic: if panel already has `subscription_status` not 'pending', treat payment as completed on restore

### `supabase/functions/add-vercel-domain/index.ts`
- Fix CORS headers (line 6) to include platform headers

### `src/pages/Auth.tsx`
- Redesign to split-screen layout: left side with branding/features/gradient, right side with auth form
- Mobile: full-width card as current (responsive)

### `src/pages/admin/PanelManagement.tsx` & `UserManagement.tsx`
- Add `.limit(5000)` to queries to ensure all records load
- Verify data displays correctly

---

## Files to Change

| File | Change |
|------|--------|
| Database migration | Admin SELECT policy on profiles |
| `src/pages/PanelOwnerDashboard.tsx` | Reactive header menu visibility state |
| `src/pages/panel/PanelOnboardingV2.tsx` | Pass panelId to domain step, fix payment redirect, show Next button |
| `supabase/functions/add-vercel-domain/index.ts` | Fix CORS headers |
| `src/pages/Auth.tsx` | Redesign with split-screen layout |
| `src/pages/admin/PanelManagement.tsx` | Add query limit |
| `src/pages/admin/UserManagement.tsx` | Add query limit |

