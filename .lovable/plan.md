
# Fix Plan: Onboarding Guard, Payment Errors, SEO Domain, and Panel Gateway Configuration

## Issue 1: Users Can Bypass Onboarding to Dashboard (CRITICAL)

**Root Cause:** The `ProtectedRoute` component only checks if the user is authenticated and has the correct role (`panel_owner`). It does NOT check `onboarding_completed`. The onboarding redirect only happens in `Auth.tsx` after login -- but if a user navigates directly to `/panel` via URL bar, they skip the guard entirely.

Screenshot evidence: User's panel "AiSMM" has `onboarding_completed: false` and `status: pending` in the database, yet the dashboard shows it as "Live" with full access.

**Fix:** Add an onboarding guard in `PanelOwnerDashboard.tsx` that checks `panel.onboarding_completed` on load. If `false`, redirect to `/panel/onboarding`. This is the single chokepoint since all `/panel/*` routes render through `PanelOwnerDashboard`.

## Issue 2: Payment Error -- "flutterwave is not enabled for this panel"

**Root Cause:** The edge function code was updated to handle `isOwnerDeposit` correctly in the previous session. However, the `OnboardingPaymentStep` passes `panelId: undefined` because `createdPanelId` is never captured when `saveProgress` fails silently.

The `saveProgress` upsert on `owner_id` was added but the unique index migration may have failed (panels can have duplicate `owner_id` -- confirmed by database: the same user has multiple panels). A unique index on `owner_id` would break multi-panel support.

**Real fix:** Instead of relying on upsert with `owner_id`, the payment step needs `panelId` to be available. Since onboarding creates a panel in `saveProgress`, we need to:
1. Change `saveProgress` from upsert to: first check if `createdPanelId` exists, then UPDATE; if not, INSERT and capture the ID
2. Ensure `handlePayment` in `OnboardingPaymentStep` validates `panelId` exists before calling the edge function, showing a clear error if not

Additionally, the `process-payment` edge function needs `panelId` to fetch panel settings. For owner payments during onboarding (when the panel may not have settings yet), we should allow `panelId` to be optional for owner deposits and skip the panel settings lookup entirely.

## Issue 3: Only Flutterwave Shows in Payment Gateways

**Root Cause:** This is correct behavior based on the database. Only Flutterwave has `is_enabled: true` in `platform_payment_providers`. All other providers (Stripe, PayPal, Paystack, Razorpay, etc.) have `is_enabled: false`. The admin needs to enable more providers in the admin panel.

The `OnboardingPaymentStep` correctly queries `platform_payment_providers` with `.eq('is_enabled', true)`.

**No code fix needed** -- this is an admin configuration issue. However, the user also mentions "panel payment gateway cannot be configured by admin only user." This means the panel owner's Payment Methods page should only allow panel owners to configure their buyer-facing gateways (not admin gateways). This is already the correct architecture. No change needed.

## Issue 4: SEO Preview Shows "homeofsmm.com" in Onboarding

**Root Cause:** The `OnboardingDomainStep.tsx` component still has `homeofsmm` references in the DNS verification TXT record instructions (lines 143, 372, 374, 379).

Additionally, the SEO step in `PanelOnboardingV2.tsx` was already fixed to use `smmpilot.online` (line 879). The screenshot showing `aiii.homeofsmm.com` suggests the user is viewing an older cached version or the legacy onboarding page.

**Fix:** Update `OnboardingDomainStep.tsx` to replace remaining `homeofsmm` references with `smmpilot` branding for consistency.

## Issue 5: Services Not Showing for "soc" Panel

The previous migration created the `is_panel_active()` SECURITY DEFINER function and updated the RLS policy. The "soc" panel has `status: active` and 2,073 services. If the migration was applied successfully, services should now be visible. If the user is still experiencing this issue, it may be a deployment/cache issue.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/PanelOwnerDashboard.tsx` | Add onboarding guard: if `panel.onboarding_completed === false`, redirect to `/panel/onboarding` |
| `src/pages/panel/PanelOnboardingV2.tsx` | Fix `saveProgress` to use INSERT/UPDATE instead of broken upsert; ensure `createdPanelId` is always set before payment step |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | Add validation that `panelId` is present; show error if missing instead of silent failure |
| `supabase/functions/process-payment/index.ts` | Make `panelId` optional for owner deposits; skip panel settings lookup when not needed |
| `src/components/onboarding/OnboardingDomainStep.tsx` | Replace `homeofsmm` references with `smmpilot` for TXT verification records |

## Technical Details

### PanelOwnerDashboard.tsx -- Onboarding Guard
```typescript
// After line 82 (const { panel } = usePanel())
const navigate = useNavigate();

useEffect(() => {
  if (!loading && panel && !panel.onboarding_completed) {
    navigate('/panel/onboarding', { replace: true });
  }
}, [panel, loading, navigate]);

// Also handle case where no panel exists yet
useEffect(() => {
  if (!loading && !panel && profile?.role === 'panel_owner') {
    navigate('/panel/onboarding', { replace: true });
  }
}, [panel, loading, profile, navigate]);
```

### PanelOnboardingV2.tsx -- Fix saveProgress
Replace the upsert approach (which requires a unique constraint that breaks multi-panel support) with explicit INSERT or UPDATE:
```typescript
const saveProgress = async (step: number) => {
  if (!profile?.id) return;
  
  const progressData = { ... };

  try {
    if (createdPanelId) {
      // UPDATE existing panel
      await supabase.from('panels')
        .update({
          name: panelName || 'My Panel',
          subdomain: subdomain || 'temp-' + profile.id.slice(0, 8),
          onboarding_step: step,
          onboarding_data: progressData,
          default_currency: currency,
        })
        .eq('id', createdPanelId);
    } else {
      // INSERT new panel
      const { data } = await supabase.from('panels')
        .insert({
          owner_id: profile.id,
          name: panelName || 'My Panel',
          subdomain: subdomain || 'temp-' + profile.id.slice(0, 8),
          onboarding_step: step,
          onboarding_data: progressData,
          default_currency: currency,
          onboarding_completed: false,
          status: 'pending',
        })
        .select('id')
        .single();
      
      if (data?.id) {
        setCreatedPanelId(data.id);
      }
    }
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};
```

### OnboardingPaymentStep.tsx -- Validate panelId
```typescript
const handlePayment = async () => {
  if (!panelId) {
    toast({ 
      variant: 'destructive', 
      title: 'Setup Error', 
      description: 'Panel not yet created. Please go back and complete previous steps first.' 
    });
    return;
  }
  // ... rest of payment logic
};
```

### process-payment edge function -- Optional panelId for owner deposits
For owner/subscription payments, make `panelId` validation more lenient and skip the panel settings lookup when not strictly needed:
```typescript
if (!gateway || !amount || !buyerId) {
  // panelId is required for buyer payments but optional for owner deposits
  if (!isOwnerDeposit && !panelId) {
    return error: 'Missing required fields';
  }
}
```

### OnboardingDomainStep.tsx -- Replace homeofsmm references
- Line 143: `homeofsmm-verify=` to `smmpilot-verify=`
- Line 372: `_homeofsmm` to `_smmpilot`
- Line 374: `homeofsmm-verify=` to `smmpilot-verify=`
- Line 379: `homeofsmm-verify=` to `smmpilot-verify=`

### Database -- Remove broken unique index
The unique index on `owner_id` from the previous migration needs to be dropped since users can have multiple panels:
```sql
DROP INDEX IF EXISTS panels_owner_id_unique;
```
