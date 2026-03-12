

# Plan: Payment Success Detection, Admin Transaction Management, Service Import Fix

## Issues Identified

### 1. Payment Success Not Auto-Detected on Return
**Root cause**: The URL from Flutterwave is `?payment=success?success=true&transaction_id=...` — note the double `?`. The code checks `params.get('payment') === 'success'` but the second `?` makes the parser treat everything after it as part of the value of `payment`, so it gets `success?success=true&...` instead of `success`. Additionally, even if the URL is parsed correctly, the polling only checks `subscription_status` on the `panels` table, but the webhook may not have fired yet. The polling should also check the `transactions` table directly for the transaction ID in the URL.

**Fix in `PanelOnboardingV2.tsx`**:
- Parse the return URL more robustly: check if `payment` param starts with `success` (not exact match)
- Also extract `transaction_id` and `tx_ref` from the URL params
- Poll the `transactions` table for the specific transaction ID to check if status is `completed`
- Increase polling from 3 attempts to 6 attempts at 5s intervals (30s total)
- When payment confirmed: set `paymentCompleted = true`, update DB immediately, show success toast

**Fix in `OnboardingPaymentStep.tsx`**:
- Add a "Payment Processing" state between submitting and confirmed — shows a spinner with "Verifying payment..." message
- Add a "Payment Failed" state with retry button
- When `paymentCompleted` is true, the realtime subscription can stop

### 2. Plan Not Locked After Successful Payment
**Root cause**: `handlePaymentSuccess` sets `paymentCompleted = true` and persists it, but the `lockedPlan` prop already uses `paymentCompleted ? selectedPlan : null`. The issue is that on return from payment gateway, `selectedPlan` may not be restored yet when `paymentCompleted` fires because state restore is async. Also the payment detection `useEffect` runs before `restoringState` completes.

**Fix in `PanelOnboardingV2.tsx`**:
- In the payment return detection useEffect, also read `selectedPlan` from the panel's `onboarding_data` to ensure the correct plan is locked
- After payment is confirmed, persist both `paymentCompleted: true` and `selectedPlan` to `onboarding_data`
- On state restore, if `paymentCompleted` is true, also read `subscription_tier` from the panel and force-set `selectedPlan` to match

### 3. No Admin Transaction Management Page
**Current state**: `PaymentManagement.tsx` already has a "Transactions" tab that shows all transactions. But there's no ability to manually update transaction status.

**Fix in `PaymentManagement.tsx`**:
- In the transaction detail modal or inline, add an "Update Status" dropdown for admins to manually change transaction status to `completed` or `failed`
- When marking a transaction as `completed`, also trigger the same logic as the webhook: update `panels.subscription_status` if it's a subscription transaction, or credit balance if it's a deposit
- Add a "Retry Webhook" button that re-processes the transaction's metadata

### 4. Service Import — Batch Insert Failures (CRITICAL)
**Root cause**: The edge function's `VALID_CATEGORIES` includes `google` and `website`, but the database `service_category` enum does NOT include these values. When the function maps a service to `google` or `website` and inserts a batch of 100 services, the entire batch fails with a PostgreSQL enum constraint error. This is why the progress bar completes but zero services actually appear.

**Fix — two-pronged**:
1. **Database migration**: Add `google` and `website` to the `service_category` enum
2. **Edge function**: Add a safety fallback — if a mapped category is not in the DB enum, fall back to `other`. Also log the actual batch insert errors so they surface to the UI.
3. **Edge function**: Return per-batch error details in the response so the UI can display exactly what failed
4. **UI (`ProviderManagement.tsx`)**: Show actual error messages from failed batches, not just "0 services imported"

### 5. Custom Domain Sync to Tenant Pages
**Current state**: The `useTenant` hook already uses realtime subscriptions on the `panels` table. Custom domains are stored in `panel_domains` and resolved in the tenant router. This should already work — the domain just needs to be in `panel_domains` with `verification_status = 'verified'` and `dns_configured = true`. No code changes needed unless there's a specific bug reported.

## Files to Create/Modify

| File | Action |
|------|---------|
| `src/pages/panel/PanelOnboardingV2.tsx` | Fix URL parsing for payment return, robust polling with transaction_id, lock plan on restore |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | Add "Verifying Payment" spinner state, better payment status display |
| `src/pages/admin/PaymentManagement.tsx` | Add admin transaction status update capability |
| `supabase/functions/sync-provider-services/index.ts` | Map `google`→`googlebusiness`, `website`→`other` as fallbacks, surface batch errors |
| **DB Migration** | `ALTER TYPE service_category ADD VALUE 'google'; ALTER TYPE service_category ADD VALUE 'website';` |

## Implementation Order
1. DB migration (add missing enum values)
2. Fix edge function category mapping fallback
3. Fix payment return URL parsing + polling
4. Add admin transaction management
5. Verify custom domain sync (read-only check)

