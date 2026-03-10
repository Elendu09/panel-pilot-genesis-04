

# Plan: Fix Build Errors, Header Toggle, Admin Functions, Subdomain, Payment & Import

## Overview

This plan addresses 5 areas: (1) fix all 12 build errors in edge functions, (2) replace ThemeToggle with a header visibility switch in MoreMenu, (3) fix admin pages that call non-existent `admin-data` function, (4) restore `smmpilot.online` as the subdomain suffix, and (5) fix payment verification status updates.

---

## 1. Fix Build Errors (12 TypeScript errors across 6 edge functions)

| File | Error | Fix |
|------|-------|-----|
| `dns-lookup/index.ts` L210, L295 | `'error' is of type 'unknown'` | Cast to `(error as Error).message` |
| `domain-health-check/index.ts` L167 | TXT returns `string[][]` not `string[]` | Cast: `as unknown as string[]` or flatten |
| `import-provider-services/index.ts` L612 | `'error' is of type 'unknown'` | Cast to `(error as Error).message` |
| `mfa-setup/index.ts` L59, L85 | `Uint8Array` not assignable to `BufferSource` | Cast: `key as unknown as ArrayBuffer` or use `.buffer` |
| `security-audit/index.ts` L89 | `'err' is of type 'unknown'` | Cast to `(err as Error).message` |
| `serve-favicon/index.ts` L100-101 | `custom_branding` not on array type | Add `.single()` type assertion or check `Array.isArray` |
| `webhook-notify/index.ts` L191 | `string | null` not assignable to fetch | Add null guard before fetch |
| `webhook-notify/index.ts` L232-233 | `supabaseAdmin.rpc` always truthy, `.raw` doesn't exist | Replace with simple `failure_count: 1` (increment via SQL or just set 1) |

## 2. MoreMenu: Replace ThemeToggle with Header Menu Icon Toggle

Replace `<ThemeToggle />` in the user profile card with a `<Switch>` component labeled "Show Menu Icon" that controls whether the hamburger/menu icon appears in the mobile header.

- Store setting in `localStorage` key `header-menu-visible` (default: `false` = disabled = hidden)
- Create a simple context or use localStorage directly; the header component reads this value
- The switch is only rendered in mobile mode (use `useIsMobile()`)
- When enabled → show the hamburger menu icon in the dashboard header
- When disabled → hide it (current default behavior for clean mobile UI)

## 3. Fix Admin Pages — Replace `admin-data` with Direct Supabase Calls

Six admin pages call `/functions/v1/admin-data` which **does not exist** as an edge function. The existing function is `admin-panel-ops` (handles add_funds, update_subscription, bulk_update only — not data fetching).

**Fix**: Replace `fetch('/functions/v1/admin-data', ...)` calls with direct `supabase.from(...)` queries using the service role via RLS policies (admin already has `is_any_admin` policies on panels).

Affected pages and their replacement queries:
- **`PanelManagement.tsx`**: `get_panels` → `supabase.from('panels').select('*, owner:profiles!panels_owner_id_fkey(email, full_name), subscription:panel_subscriptions(plan_type, status)')` 
- **`AdminOverview.tsx`**: `get_dashboard_stats` → aggregate from panels, orders, transactions, client_users tables
- **`UserManagement.tsx`**: `get_users` → `supabase.from('profiles').select('*')`
- **`PaymentManagement.tsx`**: `get_transactions` → `supabase.from('transactions').select('*')`
- **`SystemHealth.tsx`**: `get_system_health` → compute from table counts
- **`SupportTickets.tsx`**: `get_tickets` / `update_ticket` → `supabase.from('support_tickets').select/update`

Also fix CORS on `admin-panel-ops/index.ts` (line 5 missing platform headers).

## 4. Restore Subdomain Suffix to `smmpilot.online`

Update references in:
- `tenant-domain-config.ts`: Change default fallback from `homeofsmm.com` to `smmpilot.online` (line 39)
- `generate-sitemap/index.ts`: Change `homeofsmm.com` URLs to `smmpilot.online`
- `docs/DocsHub.tsx`: Change example URLs from `homeofsmm.com` to `smmpilot.online`
- Remove Replit patterns from `DEV_PATTERNS` in `tenant-domain-config.ts` (lines 80-83) and `TenantRouter.tsx` (lines 39-42)
- Keep `homeofsmm.com` in `PLATFORM_DOMAINS` array (it's the brand) but ensure `smmpilot.online` is primary for subdomains

## 5. Fix Payment Verification & Subscription Upgrade Flow

### Deposit status not updating in transaction history
The verification flow in `Billing.tsx` (lines 183-226) already calls `verify-payment` on return. The issue is timing — if the gateway hasn't confirmed yet, verification returns `pending`. 

**Fix**: Add a retry loop (poll 3 times with 5s intervals) when status comes back as `pending` after returning from payment.

### Subscription upgrade from balance
Currently `handleUpgrade` always goes through the payment gateway. Add an option to pay from panel balance:
- Before calling `process-payment`, check if `panelBalance >= plan.price`
- Show a dialog asking: "Pay from balance ($X available) or use payment gateway?"
- If balance: directly deduct from `panels.balance`, create completed transaction, update subscription — all via a new `balance-payment` action in `process-payment`

---

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/dns-lookup/index.ts` | Cast error types |
| `supabase/functions/domain-health-check/index.ts` | Fix TXT record type |
| `supabase/functions/import-provider-services/index.ts` | Cast error type |
| `supabase/functions/mfa-setup/index.ts` | Fix crypto key type |
| `supabase/functions/security-audit/index.ts` | Cast error type |
| `supabase/functions/serve-favicon/index.ts` | Fix panel type check |
| `supabase/functions/webhook-notify/index.ts` | Fix null check + remove `.rpc`/`.raw` |
| `supabase/functions/admin-panel-ops/index.ts` | Fix CORS headers |
| `src/pages/panel/MoreMenu.tsx` | Replace ThemeToggle with header menu switch |
| `src/pages/admin/PanelManagement.tsx` | Replace admin-data with direct Supabase |
| `src/pages/admin/AdminOverview.tsx` | Replace admin-data with direct Supabase |
| `src/pages/admin/UserManagement.tsx` | Replace admin-data with direct Supabase |
| `src/pages/admin/PaymentManagement.tsx` | Replace admin-data with direct Supabase |
| `src/pages/admin/SystemHealth.tsx` | Replace admin-data with direct Supabase |
| `src/pages/admin/SupportTickets.tsx` | Replace admin-data with direct Supabase |
| `src/lib/tenant-domain-config.ts` | Fix default domain, remove Replit |
| `src/pages/TenantRouter.tsx` | Remove Replit patterns |
| `supabase/functions/generate-sitemap/index.ts` | Fix URLs |
| `src/pages/docs/DocsHub.tsx` | Fix example URLs |
| `src/pages/panel/Billing.tsx` | Add retry polling, balance payment option |
| `supabase/functions/process-payment/index.ts` | Add balance-payment action |

