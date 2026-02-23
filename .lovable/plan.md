
# Fix Plan: Payment Gateways, SEO Domain, Onboarding Step Counter, Auth Redirect, and Panel Name Sync

## Issue 1: Panel Payment Methods Page Only Shows Flutterwave

**Root Cause:** In `PaymentMethods.tsx` lines 264-270, the gateway filter checks `platformEnabledProviderNames`. When admin has enabled providers in `platform_payment_providers`, the filter hides ALL gateways not in that set. Since only Flutterwave is enabled by admin (`is_enabled: true`), only Flutterwave appears.

**The problem:** Admin-enabled payment providers should ONLY be used for billing/subscription/owner deposits. Panel owners should see ALL available gateways in their Payment Methods page so they can configure their own buyer-facing payment methods with their own API keys.

**Fix in `PaymentMethods.tsx`:**
- Remove the `platformEnabledProviderNames` filter from `filteredGateways` (lines 264-270). Panel owners should see all gateways and configure whichever ones they want for their buyers.
- Remove the `platformEnabledProviderNames` state, `fetchPlatformEnabledProviders` function, and related `useEffect` -- these are unnecessary for the buyer-facing payment config page.
- Keep the `useAdminPaymentGateways` import only if used elsewhere; otherwise remove it too.

## Issue 2: SEO Google Preview Shows "homeofsmm.com" in Onboarding

**Root Cause:** The SEO step in `PanelOnboardingV2.tsx` line 914 already uses `smmpilot.online` correctly. But the COMPLETE step (line 960-961) also uses `smmpilot.online` correctly. The screenshot shows `aisoc.homeofsmm.com` which suggests the user saw a cached version or the legacy `PanelOnboarding.tsx` was rendered.

**However**, there are still `homeofsmm.com` references in other files that need fixing:
- `DesignCustomization.tsx` lines 2389, 2408, 3462, 3638 -- browser preview URL bars
- `Integrations.tsx` line 466 -- domain list
- `APIManagement.tsx` lines 105, 108 -- API base URL
- `tenant-domain-config.ts` lines 284-287, 328-330, 343-345, 357-359, 371-373 -- DNS TXT records still use `homeofsmm-verify` and `_homeofsmm`
- `DirectProviderCard.tsx` line 77 -- provider card domain

**Fix:** Replace all `homeofsmm.com` subdomain references with `smmpilot.online` in:
| File | Lines | Change |
|------|-------|--------|
| `DesignCustomization.tsx` | 2389, 2408, 3462, 3638 | `.homeofsmm.com` to `.smmpilot.online` |
| `Integrations.tsx` | 466 | `.homeofsmm.com` to `.smmpilot.online` |
| `APIManagement.tsx` | 105, 108 | `homeofsmm.com` to `smmpilot.online` |
| `tenant-domain-config.ts` | 284-287, 328-330, 343-345, 357-359, 371-373 | `homeofsmm-verify` to `smmpilot-verify`, `_homeofsmm` to `_smmpilot` |
| `DirectProviderCard.tsx` | 77 | `.homeofsmm.com` to `.smmpilot.online` |

## Issue 3: Onboarding Payment Step Shows "Step 0 of 6"

**Root Cause:** In `PanelOnboardingV2.tsx` line 1018-1019, the step counter shows `visibleStepIndex + 1` of `visibleSteps.length`. The `visibleStepIndex` is calculated at line 113 using `visibleSteps.findIndex(s => s.id === currentStep)`.

The payment step has `id: 2` (from `allSteps`). When the plan is NOT free, `visibleSteps` includes the payment step. The issue is that `currentStep` is stored as a raw index (0-6) and the `findIndex` looks for `s.id === currentStep`. Since `allSteps[2].id = 2`, this should match. But the screenshot shows "Step 0 of 6" which means `visibleStepIndex` is -1 (findIndex returned -1, +1 = 0).

This happens when the user resumes onboarding. If they previously selected `free` plan (which skips payment step), but then changed to `basic`, the `currentStep` might still be set to 2 (payment), but `visibleSteps` might not have been recalculated yet, or the `savedStep` from the database was set to a step index that no longer exists in `visibleSteps`.

**Fix:** Add a guard to ensure `visibleStepIndex` is never -1:
```typescript
const visibleStepIndex = Math.max(0, visibleSteps.findIndex(s => s.id === currentStep));
```

## Issue 4: Onboarding Guard for /panel Route

**Already implemented** in `PanelOwnerDashboard.tsx` lines 87-91. The guard checks `!panelLoading && (!panel || !panel.onboarding_completed)` and redirects to `/panel/onboarding`. This is already in place.

## Issue 5: Panel Owner Auth Users Redirecting to Main Homepage

**Root Cause:** In `Auth.tsx` lines 54-71, after login, the `checkOnboardingAndRedirect` function (lines 73-97) correctly redirects to `/panel/onboarding` if onboarding is incomplete, or to `/panel` if complete. This looks correct.

However, the `AuthContext.tsx` `createPanel` function (lines 52-82) creates a panel with `status: 'active'` and `is_approved: true` but does NOT set `onboarding_completed: true`. This means if `createPanel` runs (from `pendingPanelCreation` localStorage), a panel is created with `onboarding_completed` defaulting to `false`, and the user should be redirected to onboarding. But the issue is that `Auth.tsx` line 84 checks `panels[0].onboarding_completed`, and if this returns `false`, it correctly redirects to onboarding.

The redirect to "main homepage" could happen if the `panels` query fails (line 93 catch block) which falls through to `navigate('/panel')`, and then the dashboard guard redirects to onboarding. The real issue might be that `checkOnboardingAndRedirect` is called before the profile is fully loaded.

**Fix:** In `Auth.tsx` `checkOnboardingAndRedirect`, add explicit error handling:
```typescript
} catch (error) {
  console.error('Error checking onboarding:', error);
  // Default to onboarding if we can't determine status
  navigate('/panel/onboarding', { replace: true });
}
```

## Issue 6: Panel Name Change Not Reflected in Tenant Storefront

**Already fixed** in `GeneralSettings.tsx` line 259: `companyName: settings.panelName` is included in the `custom_branding` update. And in `Storefront.tsx` line 189/206, `companyName` is read from `customBranding.companyName || panel.name`. All buyer themes (lines 87-89 in each) use `customization.companyName || panelName`. This chain is correct.

The themes receive `panelName` from `Storefront.tsx` line 206: `panelName: customBranding?.companyName || panel?.name`. Since `companyName` is now synced in GeneralSettings, this should work.

However, the old theme wrappers (`ThemeTGRef.tsx`, `ThemeAliPanel.tsx`) pass `panelName={panel?.name}` directly (not `customBranding.companyName`). These wrappers are used for legacy theme routes in Storefront but the buyer theme components themselves do `customization.companyName || panelName` so it should still work since `customization` includes `companyName`.

**No additional code change needed** -- the fix is already in place. The tenant cache has a 30-second TTL.

---

## Summary of All Changes

| File | Change |
|------|--------|
| `src/pages/panel/PaymentMethods.tsx` | Remove platform provider filter -- panel owners see all gateways to configure with their own API keys |
| `src/pages/panel/PanelOnboardingV2.tsx` | Fix `visibleStepIndex` to never be -1 (guard with `Math.max(0, ...)`) |
| `src/pages/panel/DesignCustomization.tsx` | Replace 4 instances of `.homeofsmm.com` with `.smmpilot.online` |
| `src/pages/panel/Integrations.tsx` | Replace `.homeofsmm.com` with `.smmpilot.online` |
| `src/pages/panel/APIManagement.tsx` | Replace `homeofsmm.com` with `smmpilot.online` in 2 places |
| `src/lib/tenant-domain-config.ts` | Replace `homeofsmm-verify` with `smmpilot-verify` and `_homeofsmm` with `_smmpilot` in DNS records |
| `src/components/providers/DirectProviderCard.tsx` | Replace `.homeofsmm.com` with `.smmpilot.online` |
| `src/pages/Auth.tsx` | Fix catch block to redirect to onboarding instead of `/panel` on error |
