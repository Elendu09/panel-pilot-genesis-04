

# Plan: Fix Balance Updates, Subscription Logic, Onboarding Payment, Mobile Layout

## Critical Issues Found

### Issue 1: Panel Owner Balance Never Updates After Deposit

**Root cause**: The `payment-webhook` function (lines 445-498) only updates `client_users.balance` after a successful payment. Panel owners are NOT in the `client_users` table -- they're in `profiles`. So when the webhook looks up the `userId` in `client_users`, it gets null and silently skips the balance update.

**Fix in `supabase/functions/payment-webhook/index.ts`** (lines 445-498):
After the existing `client_users` lookup fails (buyer is null), add a fallback that checks if the user is a panel owner and updates `panels.balance` instead:

```typescript
} else {
  // Not a client_user — check if this is a panel owner deposit
  if (txPanelId) {
    const { data: panelData } = await supabase
      .from('panels')
      .select('balance, owner_id')
      .eq('id', txPanelId)
      .single();

    if (panelData && panelData.owner_id === userId) {
      const newBalance = (panelData.balance || 0) + depositAmount;
      await supabase
        .from('panels')
        .update({ balance: newBalance })
        .eq('id', txPanelId);
      console.log(`[payment-webhook] Credited $${depositAmount} to panel ${txPanelId}, new balance: ${newBalance}`);
    }
  }
}
```

### Issue 2: Subscription Not Updated After Payment Webhook

**Root cause**: The webhook handles `order_payment` and `deposit` types, but NOT `subscription` type. When a user pays for a plan upgrade, the webhook completes the transaction but never updates `panel_subscriptions` or `panels.subscription_tier`.

**Fix in `supabase/functions/payment-webhook/index.ts`**: Add a subscription handler block before the deposit fallback. Check `txMetadata.type === 'subscription'`:

```typescript
if (txMetadata?.type === 'subscription' && txPanelId) {
  const planName = txMetadata.plan || 'basic';
  
  // Update panel subscription tier
  await supabase.from('panels').update({
    subscription_tier: planName,
    subscription_status: 'active',
  }).eq('id', txPanelId);
  
  // Upsert panel_subscriptions record
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  
  await supabase.from('panel_subscriptions').upsert({
    panel_id: txPanelId,
    plan_type: planName,
    price: depositAmount,
    status: 'active',
    started_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  }, { onConflict: 'panel_id' });
  
  console.log(`[payment-webhook] Subscription updated: ${planName} for panel ${txPanelId}`);
}
```

Also update the panel balance for subscription payments (deduct from balance if they have funds, or just record it).

### Issue 3: Onboarding Payment Return URL Wrong

**Root cause**: `OnboardingPaymentStep.tsx` line 88 sets `returnUrl` to `/panel/billing?payment=success` instead of back to the onboarding page. After payment, the user lands on Billing page instead of resuming onboarding.

**Fix in `src/components/onboarding/OnboardingPaymentStep.tsx`** (line 88):
```typescript
const returnUrl = `${window.location.origin}/panel/onboarding?payment=success`;
```

**Fix in `src/pages/panel/PanelOnboardingV2.tsx`**: Add URL parameter detection on mount to auto-advance from payment step:
```typescript
// After restoring state, check for payment=success in URL
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    setPaymentCompleted(true);
    // If currently on payment step, advance to domain step
    if (currentStep === 2) {
      markStepComplete(2);
      setCurrentStep(3);
      // Clean URL
      window.history.replaceState({}, '', '/panel/onboarding');
    }
  }
}, [restoringState]); // Run after state is restored
```

### Issue 4: Terms & Privacy Mobile Width Overflow

**Root cause**: Both pages use `<div className="flex gap-8">` which doesn't stack on mobile. The desktop TOC sidebar has `hidden lg:block` but the flex container still applies `gap-8` and doesn't wrap.

**Fix in `src/pages/Terms.tsx`** and `src/pages/Privacy.tsx`**:
- Change `<div className="flex gap-8">` to `<div className="flex flex-col lg:flex-row gap-8">`
- Change `<div className="flex-1 max-w-4xl">` to `<div className="flex-1 min-w-0">` (prevents overflow)
- Update brand references from "HOME OF SMM" / "homeofsmm.com" to "SMMPilot" / "smmpilot.online"

### Issue 5: Billing Page -- Detect Return from Payment Gateway

**Root cause**: When user returns to Billing page with `?deposit=success` or `?upgrade=success`, nothing happens. The page doesn't poll for transaction status or show confirmation.

**Fix in `src/pages/panel/Billing.tsx`**: Add useEffect to detect URL params and show a toast + refetch data:
```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('deposit') === 'success' || params.get('upgrade') === 'success') {
    toast({ title: 'Payment Processing', description: 'Your payment is being confirmed. Balance will update shortly.' });
    // Refetch after a short delay to allow webhook to process
    setTimeout(() => fetchBillingData(), 3000);
    // Clean URL
    window.history.replaceState({}, '', '/panel/billing');
  }
}, []);
```

### Issue 6: Admin Payment Section -- Category Tabs Overflow on Mobile

**Root cause**: `SubscriptionProviderManager.tsx` line 446 uses `grid-cols-6` for category tabs which doesn't fit on mobile screens.

**Fix**: Change `grid grid-cols-6` to responsive: `grid grid-cols-3 md:grid-cols-6`.

---

## Summary of All Changes

| File | Change |
|------|--------|
| `supabase/functions/payment-webhook/index.ts` | Add panel owner balance update fallback; add subscription type handler |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | Fix returnUrl to point to `/panel/onboarding` |
| `src/pages/panel/PanelOnboardingV2.tsx` | Detect `?payment=success` URL param and auto-advance |
| `src/pages/panel/Billing.tsx` | Detect return URL params, show toast, refetch data |
| `src/pages/Terms.tsx` | Fix mobile layout (flex-col lg:flex-row), update branding |
| `src/pages/Privacy.tsx` | Fix mobile layout (flex-col lg:flex-row), update branding |
| `src/components/admin/SubscriptionProviderManager.tsx` | Fix category tabs mobile overflow |
| Edge function redeployment | Redeploy `payment-webhook` with balance + subscription logic |

