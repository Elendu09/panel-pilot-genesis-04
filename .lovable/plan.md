
Goal: resolve tenant fast-order failures, enforce imported-service provider integrity, harden onboarding payment verification UX/finalization, and make provider re-import reliable with plan limits.

1) Fast Order “Failed to create order” (critical backend fix)
- Root cause found: `buyer-order` inserts `orders.service_name`, but the connected DB currently does not have `service_name` on `orders` (confirmed from schema query).
- Implement:
  - Add idempotent migration to ensure `public.orders.service_name text` exists and backfill from `services.name`.
  - Keep `buyer-order`/`buyer-api` writing `service_name` for historical integrity.
  - Add explicit edge-function error logging around order insert payload + DB error text for faster production debugging.

Files:
- `supabase/migrations/*_ensure_orders_service_name.sql`
- `supabase/functions/buyer-order/index.ts`
- `supabase/functions/buyer-api/index.ts`

2) Imported services: lock provider field + show provider service ID
(Using your chosen behavior: “Lock provider only”)
- In edit sheet, detect imported service (`provider_service_id` or `provider_service_ref` present).
- Provider section:
  - Imported service: show read-only provider name badge/text (no dropdown).
  - Non-imported/manual service: keep dropdown.
- Header ID badge:
  - Show provider service ID first (e.g. `#2c7e48a2`), fallback to internal UUID only if missing.
- Preserve provider linkage on save for imported services (never change `provider_id` there).

Files:
- `src/pages/panel/ServicesManagement.tsx` (pass provider service metadata to edit sheet)
- `src/components/services/ServiceEditSheet.tsx` (read-only provider UI for imported services)

3) Onboarding payment verification: reliable finalize + timeout decision dialog
(Using your chosen behavior: “Manual choice dialog”)
- Replace table-only polling with gateway verification call:
  - Use `process-payment` with `{ action: 'verify-payment', transactionId }` each poll tick.
  - Keep fallback checks on `transactions.status` and `panels.subscription_status`.
- Robust return parsing:
  - Detect payment return via any of: `payment=success*`, `success=true`, `status=successful`, `transaction_id`, `tx_ref`.
  - Parse malformed/double-`?` callbacks safely.
- Timeout behavior:
  - On 30s timeout, open dialog with:
    - “Keep waiting” (resume verification)
    - “Continue with free plan (3-day trial)” (set trial state and unlock Next)
- UI controls:
  - During verification: keep Back replaced by red Cancel.
  - After successful payment: show completed state + enabled Next.
  - If continued as trial: Next label changes to “Payment still processing, continue with free plan” until payment is confirmed later.

Files:
- `src/pages/panel/PanelOnboardingV2.tsx`
- `src/components/onboarding/OnboardingPaymentStep.tsx`
- `supabase/functions/process-payment/index.ts` (safe return URL query appender + verification resiliency)

4) Provider re-import reliability (actual persistence + sync-safe mapping)
- Fix sync key collisions in `sync-provider-services`:
  - Match existing rows by `(panel_id, provider_id, provider_service_id)` (not only provider_service_id).
  - Prevent cross-provider overwrite when two providers share numeric IDs.
- Enforce plan service caps in sync path:
  - Free 100, Basic 5000, Pro 10000 (respect remaining capacity before inserts).
- Improve import result contract:
  - Return `processed`, `inserted`, `updated`, `skipped_limit`, `failed`, and per-batch errors.
- ProviderManagement import progress:
  - Replace fake progress with real counters from function response.
  - Show actionable error summary when imported count is zero.
- Ensure imported services keep provider external IDs and stay order-forwarding ready.

Files:
- `supabase/functions/sync-provider-services/index.ts`
- `src/pages/panel/ProviderManagement.tsx`

5) Consistency checks for tenant ordering + provider sync
- Validate that imported services have:
  - `provider_id` set
  - `provider_service_id` = upstream provider ID
  - category normalized to valid enum values
- Confirm buyer order forwarding still resolves external service ID correctly after re-imports (`buyer-order.resolveExternalServiceId` path).

Files:
- `supabase/functions/buyer-order/index.ts` (verification logs only if needed)

Technical details (concise)
- Main fast-order blocker is schema drift (`orders.service_name` absent), not UI.
- Main re-import blocker is identity mismatch in sync (`provider_service_id` alone is not unique across providers).
- Onboarding verification should treat webhook as eventual consistency and actively finalize via `process-payment verify-payment`.
- Imported-service provider mutability is causing mapping corruption risk; lock provider edit only for imported services (as requested).

Acceptance checks
- Fast order: complete all steps and pay via balance/direct without “Failed to create order”.
- Edit imported service: provider shown read-only, no dropdown; displayed ID equals provider service ID.
- Onboarding:
  - verifying state shows timer + cancel replaces back;
  - timeout opens manual choice dialog;
  - successful payment shows completed state and Next works;
  - “continue with free plan” path allows progress while payment can still finalize later.
- Re-import:
  - counts reflect actual DB writes;
  - no silent zero-import success;
  - imported services appear in Services Management and tenant storefront with correct provider linkage.
