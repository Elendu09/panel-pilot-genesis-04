
Plan: Fix panel-owner transaction status finalization, subscription visibility, Coinbase Commerce redirects/failures, and order profit details.

1. Fix transaction history data model so statuses do not linger incorrectly
- Audit all owner-payment paths in `process-payment` and `payment-webhook` so every initiated owner transaction ends in a real terminal state: `completed` on confirmed payment, `failed` on rejected/expired/cancelled gateway result.
- Normalize the “in-flight” states:
  - use `processing` only after a gateway checkout/payment link is successfully created,
  - keep `pending` only before external checkout creation,
  - mark failures explicitly when Coinbase/other gateway init fails instead of leaving rows pending.
- Update `TransactionHistory.tsx` summary/filter logic to count `processing`, `pending_verification`, `cancelled`, and `failed` correctly instead of treating missing/unknown statuses as completed.

2. Make subscription payments always appear in panel-owner transaction history
- Ensure all subscription flows create transaction rows with:
  - `type: 'subscription'`
  - correct `panel_id`
  - correct owner `user_id`
  - clear description like “Subscription upgrade to Pro via Coinbase Commerce”.
- Review onboarding and billing subscription flows together:
  - `OnboardingPaymentStep.tsx`
  - `Billing.tsx`
  - `PanelOnboardingV2.tsx`
- Remove any fallback behavior that updates `panel_subscriptions` / `panels.subscription_status` without keeping the matching transaction properly finalized and visible.
- Update `TransactionHistory.tsx` filtering so “Subs” reliably includes all `type='subscription'` rows regardless of gateway.

3. Fix Coinbase Commerce so it redirects properly and no longer throws ForbiddenError silently
- Root cause from inspection:
  - Coinbase is enabled in `platform_payment_providers`, but currently `supports_subscriptions` is false, so onboarding/billing can exclude or mis-handle it for subscription use.
  - current owner Coinbase transactions are being created repeatedly and left `pending`/`processing`, which means checkout creation or finalization is breaking before terminal update.
  - current implementation tries both `/charges` and `/checkouts`, but the app does not persist enough failure detail or fail the transaction row when both fail.
- Fixes:
  - update admin provider data/migration so Coinbase supports subscriptions where intended,
  - tighten Coinbase config resolution to use the correct Commerce API key field consistently,
  - store/initiate owner subscription and deposit transactions only after gateway eligibility is confirmed,
  - if Coinbase returns 403/Forbidden, capture the exact response body in logs and mark the transaction `failed`,
  - only set `external_id` + `processing` after a valid `hosted_url` is returned,
  - ensure returned `redirectUrl` is always sent back to onboarding and billing callers.
- Also update verification flow so Coinbase can be finalized by:
  - direct verify-payment polling on return,
  - webhook completion if Coinbase callback arrives,
  - failed status if provider says expired/failed/forbidden.
- Add stronger user-facing errors in billing/onboarding instead of generic “Deposit Failed”.

4. Align admin gateway selection with subscription availability
- `useAdminPaymentGateways.tsx` currently fetches all enabled admin gateways for billing deposits.
- Split the admin-gateway usage clearly:
  - billing deposit can show enabled owner-billing gateways,
  - onboarding subscription and plan upgrade should only show gateways with `supports_subscriptions = true`.
- Ensure Coinbase appears for subscriptions only if admin has enabled it and marked it subscription-capable.

5. Show explicit profit breakdown in order details
- `OrderManagement.tsx` already has `price` and `provider_cost`; add a dedicated “Profit” field in the order details dialog:
  - profit = `price - provider_cost`
- Also show a clearer earnings breakdown in the clicked order details:
  - Customer paid
  - Provider cost
  - Your profit
- Keep using persisted `orders.provider_cost` so deleted/changed services do not break historical profit calculations.

6. Hardening and consistency updates
- Update owner transaction descriptions so deposits, subscriptions, and commission payments are clearly distinguishable in history.
- Expand `TransactionHistory.tsx` status badges/colors for `processing` and `pending_verification`.
- Ensure cancelled returns from billing/onboarding can mark transactions failed/cancelled instead of leaving them pending forever when the gateway flow never completes.

Technical details
- Files to update:
  - `supabase/functions/process-payment/index.ts`
  - `supabase/functions/payment-webhook/index.ts`
  - `src/components/billing/TransactionHistory.tsx`
  - `src/hooks/useAdminPaymentGateways.tsx`
  - `src/components/onboarding/OnboardingPaymentStep.tsx`
  - `src/pages/panel/Billing.tsx`
  - `src/pages/panel/PanelOnboardingV2.tsx`
  - `src/pages/OrderManagement.tsx`
  - new migration for `platform_payment_providers` Coinbase flags if needed
- Key implementation rules:
  - never leave a failed gateway init as `pending`,
  - never mark a transaction `processing` unless checkout URL exists,
  - never activate subscription without the matching transaction being traceable,
  - always preserve profit from persisted `orders.provider_cost`.

What I found during analysis
- Panel-owner transaction history currently reads only `transactions`, and many owner deposits/subscription attempts remain `pending`.
- There are real subscription transactions in the database, but current UI/filtering/finalization logic is inconsistent.
- Coinbase is enabled in the database, but its provider row currently shows `supports_subscriptions = false`, which conflicts with using it for onboarding/upgrade subscriptions.
- Multiple Coinbase owner transactions exist with `external_id = null` and `status = pending`, confirming checkout initialization/failure handling is incomplete.
- Order details already show provider cost, but not explicit profit.
