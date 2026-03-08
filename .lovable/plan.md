

# Plan: Domain Sync, Service Import Fixes, Provider Edge Error

## Issues Found

### 1. Domain Config in Onboarding Does NOT Fully Sync with Domain Management
The onboarding completion (line 611-626 in `PanelOnboardingV2.tsx`) upserts to `panel_domains` and sets `panels.custom_domain`. However:
- It sets `verification_status: 'verified'` immediately without actual DNS verification
- The `DomainSettings.tsx` page queries `panel_domains` by `panel_id` — this already works IF the onboarding upsert succeeds
- But the API endpoint (`buyer-api`, `panel-api`) reads from `panels.custom_domain` — this IS set in onboarding
- **Missing**: The onboarding doesn't sync the `panel_domains.verification_token` properly with what was used in the domain step, and if the user only completed TXT verification (not full DNS), the data is inconsistent

**Fix**: On onboarding completion, if the user completed domain verification during the domain step, use the actual verification status. If they only did partial verification, set `verification_status: 'txt_verified'` or `'pending'` instead of `'verified'`. Also sync the verification token from the domain step state.

### 2. Service Import — Provider Service ID for Service Mapping
"Service mapping" in SMM context means linking each imported service to its upstream provider's service ID (`external_service_id` / `provider_service_id`). This is already implemented:
- `provider_services` table stores `external_service_id` (the upstream provider's service number)
- `services` table has `provider_service_id` (same upstream ID) and `provider_service_ref` (FK to `provider_services.id`)
- The `sync-provider-services` edge function uses `provider_service_id` as the join key for updates

This is correctly implemented. The service mapping enables real-time sync via the `sync-provider-services` function which matches by `provider_service_id`.

### 3. Service Import Errors — Functions Not Deployed
The `sync-provider-services` function (called by ProviderManagement import) and `import-provider-services` both show NO LOGS — they may not be deployed. Also:
- `sync-provider-services/index.ts` line 6 has old CORS headers missing `x-supabase-client-platform` headers — this causes CORS failures from the browser
- `provider-services/index.ts` line 5 also has old CORS headers — same issue for the ServiceImportDialog fetch

**Fix**: Update CORS headers in `sync-provider-services`, `provider-services`, and `provider-balance`. Deploy all functions.

### 4. Admin Provider Management Edge Error ("homeofsmm")
**Root cause**: `PlatformProviderManagement.tsx` line 159 calls `provider-balance` with `{ api_endpoint, api_key }` (raw credentials), but the `provider-balance` function expects `{ providerId }` and fetches credentials from the database. The function receives `undefined` for `providerId`, fails at line 78, and returns "Provider ID is required".

**Fix**: The admin page should NOT use the panel-owner `provider-balance` function. Instead, create a direct balance check inline — or fix the admin sync to call the provider API directly (similar to the old behavior with `api_endpoint` and `api_key` params).

### 5. `enable-direct-provider` Not in config.toml
The function exists in `supabase/functions/enable-direct-provider/` but is NOT registered in `supabase/config.toml`, so it was never deployed. Same for `transfer-provider-balance`.

---

## Changes

### `supabase/config.toml`
- Add `[functions.enable-direct-provider]` and `[functions.transfer-provider-balance]` with `verify_jwt = false`

### `supabase/functions/sync-provider-services/index.ts`
- Fix CORS headers (line 5-6) to include `x-supabase-client-platform` headers

### `supabase/functions/provider-services/index.ts`
- Fix CORS headers (line 4-6) to include `x-supabase-client-platform` headers

### `supabase/functions/provider-balance/index.ts`
- Fix CORS headers (line 4-6) to include `x-supabase-client-platform` headers

### `src/pages/admin/PlatformProviderManagement.tsx`
- Fix `handleSync` to call the provider API directly with `api_endpoint` and `api_key` instead of invoking `provider-balance` (which expects a DB-stored provider ID). Build the balance fetch inline using `fetch()` with `URLSearchParams`.

### `src/pages/panel/PanelOnboardingV2.tsx`
- Fix domain sync on completion: check if domain was actually verified during onboarding step, use appropriate `verification_status` instead of always `'verified'`

### Deploy Edge Functions
- Deploy `enable-direct-provider`, `sync-provider-services`, `provider-services`, `provider-balance` — all will auto-deploy with code changes

---

## Files to Change

| File | Change |
|------|--------|
| `supabase/config.toml` | Add missing function registrations |
| `supabase/functions/sync-provider-services/index.ts` | Fix CORS headers |
| `supabase/functions/provider-services/index.ts` | Fix CORS headers |
| `supabase/functions/provider-balance/index.ts` | Fix CORS headers |
| `src/pages/admin/PlatformProviderManagement.tsx` | Fix admin provider sync to call API directly |
| `src/pages/panel/PanelOnboardingV2.tsx` | Fix domain verification status sync on completion |

