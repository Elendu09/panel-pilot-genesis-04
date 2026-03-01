

# Plan: Provider API Fixes, Security Page Audit, Admin Pages Improvement

## Part 1: Buyer API — Critical Balance & Error Handling Gaps

### Issue 1: `handleAddOrder` skips balance check
The `buyer-api` edge function's `handleAddOrder` (line 280-341) creates orders **without checking or deducting buyer balance**. The separate `buyer-order` function does this correctly, but the API endpoint does not. External panels calling via API get free orders.

**Fix in `supabase/functions/buyer-api/index.ts`:**
- After service lookup, if `buyerId` is set, check `client_users.balance >= price`
- If insufficient, return `{"error": "Not enough funds"}` (standard SMM API error)
- Deduct balance and increment `total_spent` after order creation
- If `buyerId` is null (panel-level key), check `panels.balance` instead

### Issue 2: Provider forwarding errors not surfaced to API caller
When `forwardOrderToProvider` fails, the order is created with status `pending` and a note, but the API response still returns `{ order: "ORD..." }` with no indication of failure. The caller assumes success.

**Fix:** After forwarding, if provider returns an error, include `provider_error` in the response alongside the order number so the caller knows the order needs attention.

### Issue 3: Services response missing `service` ID consistency
Line 198: `service: s.provider_service_id || String(index + 1)` — if `provider_service_id` is null, the ID becomes a sequential index which won't match on order placement. Should use the service's actual database `id` as fallback.

**Fix:** Change to `service: s.provider_service_id || s.id`

### Issue 4: CORS headers incomplete
Line 5-7: Missing `x-supabase-client-platform` headers required by Supabase client calls.

**Fix:** Update CORS headers to include full set per platform standards.

---

## Part 2: Panel-API Edge Function Audit

**`supabase/functions/panel-api/index.ts`** — verify same CORS header fix needed. Check that all actions return proper error messages.

---

## Part 3: Security Pages — Switch & UI Audit

### Panel Owner SecuritySettings (`src/pages/panel/SecuritySettings.tsx`)
All switches already use real `<Switch>` components with proper `checked`/`onCheckedChange` bindings:
- `enforce2FA`, `passwordMinLength`, `passwordNumbers`, `passwordSymbols`, `notifyNewDevice`, `blockTorVpn`, `rateLimitEnabled`, `captchaEnabled`, `alertOnFailedLogin`, `alertEmail`, `alertInApp`
- All save correctly to `panels.settings.security`
- **No fake data detected** — sessions, alerts, and audit logs derive from real `audit_logs` and `client_users` tables

### Admin SecuritySettings (`src/pages/admin/SecuritySettings.tsx`)
- Uses `<Switch>` components for platform-level security toggles
- Fetches/saves to `platform_settings` table
- **Verify all switches render and save correctly** — need to confirm the save handler updates the right keys

### Tenant Security (buyer-facing)
- No separate tenant security settings page exists — tenant security is inherited from panel owner settings
- This is correct behavior per the architecture

---

## Part 4: Admin Pages — Improvement Plan

### Current State Assessment
All 22 admin pages exist and are functional with real data. Key observations:

| Page | Status | Issues |
|------|--------|--------|
| AdminOverview | Working | Security Score hardcoded as "98.2%" (line 204) |
| PanelManagement | Working | Full CRUD, kanban/table views, subscription display |
| UserManagement | Working | Full CRUD, role management |
| RevenueAnalytics | Working | Real charts from orders/transactions |
| PaymentManagement | Working | 60+ payment methods, transaction history |
| SecuritySettings | Working | Switches + audit logs |
| SupportTickets | Working | Ticket CRUD with replies |
| SubscriptionManagement | Working | Plan management with upgrade/downgrade |
| PlatformSettings | Working | Platform config with Vercel integration |
| SystemHealth | Working | Uses real Supabase metrics |
| AuditLogs | Working | Real data from audit_logs table |
| PlatformProviderManagement | Working | Provider ecosystem management |
| AdsManagement | Working | Ad management |
| DomainManagement | Working | Domain ops |
| ReportsExport | Working | Export functionality |
| BlogManagement | Working | Blog CMS |
| DocsManagement | Working | Docs CMS |
| AnnouncementsManagement | Working | Announcements |
| WebhookManagement | Working | Webhook config |
| BackupManagement | Working | Backup operations |
| ReceiptManagement | Working | Receipt viewing |
| AdminMoreMenu | Working | Navigation |

### Improvements to implement:

1. **AdminOverview — Fix hardcoded Security Score**: Replace `'98.2%'` with a real calculated score based on platform settings (2FA enforcement, password policies, etc.)

2. **AdminOverview — Add quick action buttons**: Add "Approve All Pending", "Export Report", "View System Health" quick actions

3. **Sidebar — Add missing routes**: `SystemHealth`, `SubscriptionManagement`, `AdsManagement`, `DomainManagement`, `BackupManagement` are not in the sidebar (`SuperAdminSidebar.tsx`) — users can't navigate to them

4. **PanelManagement — Add bulk actions**: Select multiple panels for bulk approve/suspend/delete

5. **UserManagement — Add role assignment via user_roles table**: Currently shows roles from `profiles.role` but doesn't use the `user_roles` table for proper role management per security guidelines

---

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/buyer-api/index.ts` | Add balance check/deduction in `handleAddOrder`; fix service ID fallback; improve provider error surfacing; update CORS headers |
| `supabase/functions/panel-api/index.ts` | Update CORS headers |
| `src/pages/admin/AdminOverview.tsx` | Replace hardcoded Security Score with real calculation |
| `src/components/dashboard/SuperAdminSidebar.tsx` | Add missing admin page routes (System Health, Subscriptions, Ads, Domains, Backups) |

