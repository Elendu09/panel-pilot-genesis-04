

# Plan: Fix Payment Webhook Balance Issues, Onboarding Errors & Billing Enhancements

## Critical Issues Found

### Issue 1: Webhook balance credit for panel owner deposits is unreliable

**Root cause**: In `payment-webhook/index.ts` lines 445-566, the flow is:
1. Check if `txMetadata.type === 'subscription'` — handle subscription (lines 447-487)
2. Then **always** try to find a `client_users` record by `userId` (line 490-494)
3. If `buyer` found → credit client_users balance (wrong for owner deposits!)
4. If `buyer` NOT found → fall through to panel owner check (lines 541-565)

**The problem**: For panel owner deposits with `metadata.type === 'panel_deposit'`, the code still falls through to the `client_users` lookup first. If the `userId` (which is `profile.id`) accidentally matches a `client_users.id`, the balance goes to the wrong place. More critically, after handling a subscription payment (lines 447-487), the code **continues** to the deposit section and tries to credit balance AGAIN — double-handling.

**Fix**: Add explicit `panel_deposit` check and `return`/`break` after subscription handling to prevent fall-through.

In `payment-webhook/index.ts`, restructure the completed payment logic (lines 445-567):
```
if (txMetadata?.type === 'subscription') {
  // handle subscription... (existing code)
  // DON'T fall through to deposit logic
} else if (txMetadata?.type === 'panel_deposit') {
  // Directly credit panel balance without checking client_users first
  const { data: panelData } = await supabase
    .from('panels')
    .select('balance, owner_id')
    .eq('id', txPanelId)
    .single();
  if (panelData) {
    const newBalance = (panelData.balance || 0) + depositAmount;
    await supabase.from('panels').update({ balance: newBalance }).eq('id', txPanelId);
    // notify...
  }
} else if (txType === 'order_payment' && orderId) {
  // existing order handling
} else {
  // Regular buyer deposit (existing client_users logic)
}
```

### Issue 2: Billing page `fetchBillingData` uses stale `panel.balance`

In `Billing.tsx` line 164: `setPanelBalance(panel.balance || 0)` uses the `usePanel()` hook's cached value, which doesn't re-fetch after webhook updates.

**Fix**: Query the panel balance fresh from the database in `fetchBillingData`:
```typescript
const { data: freshPanel } = await supabase
  .from('panels')
  .select('balance')
  .eq('id', panel.id)
  .single();
setPanelBalance(freshPanel?.balance || 0);
```

### Issue 3: Onboarding payment step — `onSkip` sets plan to 'free' incorrectly

In `PanelOnboardingV2.tsx` line 645-649, the `onSkip` callback:
```typescript
onSkip={() => {
  setSelectedPlan('free');  // Bug: resets plan to free instead of keeping trial
  setPaymentCompleted(true);
  handleNext();
}}
```
This should use the `handleSkipWithTrial` from `OnboardingPaymentStep` (which correctly keeps the selected plan and sets trial status), but the parent also overrides the plan to 'free'. The `onSkip` in the parent should NOT reset `selectedPlan` to 'free' — it should keep the selected plan and let the trial logic work.

**Fix**: Change `onSkip` to not reset `selectedPlan`:
```typescript
onSkip={() => {
  setPaymentCompleted(true);
  markStepComplete(currentStep);
  setCurrentStep(currentStep + 1);
}}
```

### Issue 4: Onboarding step counter still shows wrong after payment return

The step counter fix from the previous edit is in place but there's still a timing issue: when `?payment=success` is detected (line 200), `setPaymentCompleted(true)` causes `shouldShowPaymentStep` to become false, which removes the payment step from `visibleSteps`. The progress indicator then shows the wrong step count.

The existing fallback (`visibleSteps.findIndex(s => s.id > currentStep)`) should handle this, but the step label text in the header (around line 1050) uses `visibleStepIndex + 1` which could show "Step 0" if both fallbacks fail.

**Fix**: Clamp `visibleStepIndex` to minimum 0 and ensure step label shows correctly.

### Issue 5: Billing page doesn't re-fetch panel data after realtime transaction update

In `Billing.tsx` line 148, `fetchBillingData()` is called on realtime transaction update, but it reads `panel.balance` from the cached hook. Need to fetch fresh balance.

**Fix**: Same as Issue 2 — fetch fresh balance from DB instead of hook cache.

## Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/payment-webhook/index.ts` | Restructure completed payment logic: add explicit `panel_deposit` handling, prevent fall-through from subscription to deposit, eliminate double-crediting |
| `src/pages/panel/Billing.tsx` | Fetch fresh panel balance from DB instead of using cached hook value |
| `src/pages/panel/PanelOnboardingV2.tsx` | Fix `onSkip` to not reset selectedPlan to 'free'; fix step counter edge case |
| Edge function redeployment | Redeploy `payment-webhook` |

