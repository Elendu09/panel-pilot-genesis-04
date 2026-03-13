
Goal: fix onboarding payment UX/state sync and fully stabilize service import so imports actually persist with correct limits and provider linkage.

1) Onboarding Payment UX + Navigation (verifying state)
- In `PanelOnboardingV2.tsx`, add a single source of truth for payment verification state:
  - `isVerifyingPayment`, `verificationSecondsLeft`, `verifyingTxId`, `verificationPollRef`.
- Replace the current auto-advance behavior (the effect that jumps from step 2 to step 3) with explicit transitions:
  - Stay on payment step while verifying.
  - Move forward only when user clicks `Next` after `paymentCompleted=true`.
- While verifying:
  - Hide payment-step “upper/lower” sections (trial notice + order summary + method list) in `OnboardingPaymentStep.tsx`.
  - Replace Back button with red `Cancel` button (desktop + mobile nav).
  - Disable plan switching unless verification is canceled.
- Add visible countdown timer (30s) in payment step verification card.
- Cancel flow:
  - Cancels verification polling.
  - Resets `isVerifyingPayment` + timer.
  - Restores normal Back button.
  - Shows confirmation warning (“verification cancelled; you can now change plan”).

2) Reliable Payment Success Detection + Auto Upgrade During Onboarding
- In `PanelOnboardingV2.tsx`, replace table-only polling with gateway-assisted finalization:
  - Parse return URL robustly (supports malformed/double-`?` redirects and duplicate `transaction_id` params).
  - Poll `process-payment` with `{ action: 'verify-payment', transactionId }` (same proven billing pattern).
  - Fallback checks: `transactions.status` and `panels.subscription_status`.
- On successful verification:
  - Set `paymentCompleted=true`, `trialStarted=false`, `isVerifyingPayment=false`.
  - Immediately persist:
    - `panels.subscription_status='active'`
    - `panels.subscription_tier=<paid plan>`
    - `panel_subscriptions` upsert as active with dates.
  - Persist onboarding state so returning users see “Payment Complete” and can click `Next`.
- Keep plan locked after successful payment:
  - Force `selectedPlan` from DB (`panel_subscriptions.plan_type` / `panels.subscription_tier`) on restore.
  - Pass `lockedPlan` to `OnboardingPlanSelector`.
- Fix trial false-positive in realtime callback:
  - In `OnboardingPaymentStep.tsx`, stop calling `onPaymentSuccess` when status is `trial`; only `active` should mark paid.

3) Plan-change rules during verification / trial flow
- Enforce this behavior:
  - If verifying payment: user must Cancel first before changing plan.
  - If trial was started and user picks different plan: reset trial state + clear persisted trial onboarding flags.
  - If same plan is re-selected after trial continuation: show compact “Trial Active + Slide to continue” view (no full payment blocks), but require sliding again each re-entry.

4) Pricing + Limits Consistency (requested: Free 100, Basic 5000, Pro 10000)
- Update plan limits and copy in:
  - `OnboardingPlanSelector.tsx`
  - `Billing.tsx` plan feature text
  - `ServicesManagement.tsx` service limit enforcement
  - any limit banners/components that currently use 50 or hardcoded 10000.
- Remove conflicting hardcoded `SERVICE_LIMIT = 10000` usage in Services Management UI where plan-aware limit should be shown/passed.

5) Service Import: root-cause fix + real progress + provider/category integrity
- Primary persistence bug fix in `ServicesManagement.tsx` import path:
  - Add strict DB category normalization before insert/upsert (map unknown detection outputs to valid enum `other`).
  - Current detector returns categories not in DB enum (e.g. extra platforms), which can fail writes.
- Convert import writes to chunked transactional-style flow:
  - Chunk size 200.
  - Per chunk: upsert `provider_services` -> upsert `normalized_services` -> upsert `services`.
  - Track success/fail per chunk; continue safely; surface exact failures.
- Add real-time progress counters (not fake percentages):
  - `processed/total`, `inserted`, `updated`, `failed`.
  - Wire progress callback from `ServicesManagement.handleImport` to `ServiceImportDialog`.
- Enforce plan service cap at source:
  - Compute remaining slots with plan-aware cap (100/5000/10000).
  - Limit selected imports before writing.
  - Also protect quick provider sync path (`sync-provider-services` edge function) with same cap logic.
- Provider ID + tenant order integrity:
  - Ensure imported `services.provider_service_id` is always upstream provider ID.
  - Keep `provider_id` and `provider_service_ref` linked to source provider records.
  - Ensure re-sync updates existing rows by `(panel_id, provider_id, provider_service_id)` without duplicating.
- Category sync after import:
  - Trigger category refresh/sync (`service_categories`) after successful import batches so tenant storefront reflects new services immediately.

6) Files to modify
- `src/pages/panel/PanelOnboardingV2.tsx`
- `src/components/onboarding/OnboardingPaymentStep.tsx`
- `src/components/onboarding/OnboardingPlanSelector.tsx`
- `src/pages/panel/ServicesManagement.tsx`
- `src/components/services/ServiceImportDialog.tsx`
- `src/pages/panel/ProviderManagement.tsx` (quick-sync UX + error visibility/progress)
- `supabase/functions/sync-provider-services/index.ts` (plan cap + safer import reporting)
- `supabase/functions/process-payment/index.ts` (safe return URL query appending helper)
- optional consistency touch: `src/pages/panel/Billing.tsx` plan copy

Technical details
- Main onboarding bug is state orchestration: verification and completion are mixed with premature step jumps and ambiguous realtime callbacks.
- Main import bug is data validity + hardcoded limit mismatch + non-real progress:
  - invalid category values can break DB writes,
  - free/basic/pro limits are inconsistent across UI/import handlers,
  - progress UI currently advances without guaranteed persisted row counts.
- The fix keeps existing architecture (Supabase + current edge functions) and hardens state transitions, idempotency, and import persistence.

Acceptance checks
- Paid onboarding return:
  - shows verifying screen + countdown + red Cancel (Back hidden).
  - after success, shows Payment Complete and Next works.
  - plan selector is locked to paid plan.
- Verifying cancellation:
  - user cannot change plan until cancel.
  - after cancel, Back returns and plan change is allowed.
- Trial re-entry:
  - same plan -> compact Trial Active + slide again.
  - different plan -> fresh payment UI.
- Service import:
  - “Select all” imports actual rows into `services`.
  - counts in progress match inserted/updated rows.
  - limits enforced by plan (100/5000/10000).
  - tenant storefront sees imported services and provider mapping remains valid for ordering flow.
