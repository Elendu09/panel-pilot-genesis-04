

# Plan: Webhook URL, Panel Balance Display, Deposit Flow, Onboarding Fixes & Enhancements

## Issue 1: Webhook URL should use homeofsmm.com instead of Supabase URL

The Flutterwave/Paystack webhook URL is configured externally in gateway dashboards. The `process-payment` edge function doesn't set a webhook URL in the API calls — gateways rely on dashboard-configured webhook URLs. Since you want `homeofsmm.com` as the webhook endpoint, we need to **proxy** the webhook through your domain.

**However**, Lovable projects can't run custom backend routes at `homeofsmm.com/api/...`. The practical solution is to add the webhook URL explicitly in the `process-payment` function for gateways that support it (Flutterwave supports `webhook_url` in the payment initialization payload).

**Fix in `supabase/functions/process-payment/index.ts`**:
- For Flutterwave (line ~402): Add `webhook_url` field pointing to the Supabase edge function URL (since homeofsmm.com can't handle POST webhooks). The correct webhook URL remains the Supabase function URL but we'll construct it dynamically:
```typescript
webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook?gateway=flutterwave`
```
- For Paystack (line ~455): Paystack doesn't support per-transaction webhook URLs — it must be configured in the Paystack dashboard. No code change, but I'll add a comment.

## Issue 2: Add "Panel Balance" display to dashboard header

**Fix in `src/pages/panel/PanelOverview.tsx`** (around line 580-606):
Add a Panel Balance badge/display next to the existing Plan Badge and action buttons in the welcome header's right side:
```tsx
<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
  <Wallet className="w-4 h-4 text-emerald-500" />
  <div className="text-right">
    <p className="text-[10px] text-muted-foreground leading-none">Panel Balance</p>
    <p className="text-sm font-bold text-emerald-500">${panelData?.balance?.toFixed(2) || '0.00'}</p>
  </div>
</div>
```

## Issue 3: Deposit stays "pending" — webhook not firing

The gateway webhook URLs must be configured in Flutterwave/Paystack dashboard. But we can also improve the flow:

**Fix in `supabase/functions/process-payment/index.ts`**: Add explicit `webhook_url` for Flutterwave so the webhook auto-fires without manual dashboard configuration.

**Fix in `supabase/functions/payment-webhook/index.ts`**: The existing code at lines 541-565 correctly handles panel owner deposits. The issue is likely that the webhook never arrives. Adding `webhook_url` to the Flutterwave init call should fix this.

## Issue 4: "Step 1 of 6" counter bug on payment step

**Root cause**: The `?payment=success` URL param detection (line 197) sets `paymentCompleted = true` immediately. This removes the payment step from `visibleSteps`, so `visibleSteps.findIndex(s => s.id === 2)` returns -1, and `Math.max(0, -1)` = 0, showing "Step 1 of 6" even though the user is on step 2.

**Fix in `src/pages/panel/PanelOnboardingV2.tsx`**: In the progress calculation (line 114), handle the case where the current step is not in `visibleSteps`:
```typescript
const visibleStepIndex = visibleSteps.findIndex(s => s.id === currentStep);
const safeVisibleIndex = visibleStepIndex >= 0 ? visibleStepIndex : Math.max(0, visibleSteps.findIndex(s => s.id > currentStep));
const progress = ((safeVisibleIndex + 1) / visibleSteps.length) * 100;
```

Also, move the `setPaymentCompleted(true)` + `setCurrentStep(3)` to happen atomically together BEFORE the filter logic re-evaluates.

## Issue 5: Enhance OnboardingPaymentStep with glow effects for Basic/Pro

**Fix in `src/components/onboarding/OnboardingPaymentStep.tsx`**:
- Add animated glow border around the payment card
- Add gradient shimmer on the "Pay" button
- Add a "3-day free trial" badge/notice for Basic and Pro plans
- Update the order summary to mention "3-day free trial, then $X/mo"

**Fix in `src/components/onboarding/OnboardingPlanSelector.tsx`**:
- Add glow effect (`shadow-[0_0_30px_rgba(59,130,246,0.3)]`) to Basic card
- Add gold glow (`shadow-[0_0_30px_rgba(245,158,11,0.3)]`) to Pro card
- Add "3-day free trial" badge on both Basic and Pro cards

## Issue 6: Implement 3-day trial logic

**Fix in `supabase/functions/payment-webhook/index.ts`**: When subscription payment completes, set `trial_ends_at` to 3 days from now in `panel_subscriptions`. If payment isn't confirmed within 3 days, subscription reverts to free.

**Fix in `src/pages/panel/PanelOnboardingV2.tsx`**: When user selects Basic/Pro but skips payment, still set subscription_tier with `trial` status and `trial_ends_at = now + 3 days`. This allows them to proceed with the trial.

**Database migration**: Add `trial_ends_at` column to `panel_subscriptions` if not exists.

## Issue 7: Enhance Free Subdomain UI in onboarding

**Fix in `src/components/onboarding/OnboardingDomainStep.tsx`** (lines 176-260):
- Reduce padding on the currency selector and subdomain preview cards
- Make the subdomain preview box more compact with tighter spacing
- Improve the "Your panel will be available at" preview box with better contained styling
- Reduce overall `space-y-6` to `space-y-4` for tighter layout

## Summary of All Changes

| File | Change |
|------|--------|
| `supabase/functions/process-payment/index.ts` | Add `webhook_url` for Flutterwave gateway |
| `supabase/functions/payment-webhook/index.ts` | Add trial logic for subscriptions |
| `src/pages/panel/PanelOverview.tsx` | Add Panel Balance display in header |
| `src/pages/panel/PanelOnboardingV2.tsx` | Fix step counter bug, add trial skip logic |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | Add glow effects, trial notice |
| `src/components/onboarding/OnboardingPlanSelector.tsx` | Add glow to Basic/Pro cards, trial badges |
| `src/components/onboarding/OnboardingDomainStep.tsx` | Tighten UI spacing, enhance subdomain preview |
| `src/components/onboarding/OnboardingCurrencySelector.tsx` | Reduce padding for compact layout |
| Database migration | Add `trial_ends_at` to `panel_subscriptions` |
| Edge function redeployment | Redeploy `process-payment` and `payment-webhook` |

