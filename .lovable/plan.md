

# Plan: Admin Dashboard Updates, Monthly/Yearly Billing, Downgrade, Support Tickets, Service Edit Fixes, Payment Webhook

## Issues Identified

### 1. Admin Panel Management — Needs Account Grouping
**Current**: Flat list of all panels. Shows owner email but no grouping by account. Admin can't see which user owns multiple panels.
**Fix**: Group panels by owner account. Show account card with owner name/email, number of panels, subscription tier, and then expand to show each panel underneath. Add "Account View" toggle alongside existing table/kanban views.

### 2. Admin User Management — Tenant Users Labeled as "Panel Owner"
**Current**: All users from `profiles` table show role as either `admin` or `panel_owner` (line 268-269). There's no concept of "tenant user" — tenant users are in `client_users` table, not `profiles`. The `profiles` table only contains platform users (panel owners and admins).
**Fix**: 
- Rename "Panel Owner" badge to "User" for non-admin profiles
- Add a separate "Tenant Users" tab that queries `client_users` table to show all tenant users across panels with their panel name
- Show which panels each user owns (already done via `fetchUserDetails`)
- Add column/badge indicating how many panels they own (0 = no panels yet, just registered)

### 3. Admin Subscription Management — Needs Better Clarity
**Current**: Lists subscriptions but lacks summary stats breakdown by plan tier.
**Fix**: Add pie chart showing plan distribution (Free/Basic/Pro), expiry timeline, MRR (Monthly Recurring Revenue) stat. Add filter by plan type.

### 4. Admin Revenue Analytics — Needs More Context
**Current**: Shows totals and charts but lacks breakdown by revenue source clarity.
**Fix**: Add revenue source breakdown cards (Subscriptions vs Commissions vs Deposits), add ARPU (Average Revenue Per User), churn indicator for expired subscriptions.

### 5. Billing — No Monthly/Yearly Toggle or Discount
**Current**: `Billing.tsx` plans array has flat `price` per `month` (Free=$0, Basic=$5, Pro=$15). No yearly option. No yearly discount like the Pricing page has (Pricing.tsx has `monthlyPrice` and `yearlyPrice` with ~17% discount).
**Fix**: 
- Add `monthlyPrice` and `yearlyPrice` to plans in `Billing.tsx` (matching Pricing.tsx: Basic $5/mo or $50/yr, Pro $15/mo or $150/yr)
- Add monthly/yearly toggle switch above plan cards
- Show savings badge when yearly is selected
- Pass `billing_cycle: 'monthly' | 'yearly'` to `process-payment` and store in subscription metadata
- Update subscription expiry: monthly = 30 days, yearly = 365 days

### 6. Billing — No Downgrade Option
**Current**: Line 734-736 shows `isLowerTier && isActivePaid` → button disabled with "Downgrade N/A".
**Fix**: Allow downgrade. When panel owner clicks a lower tier while on active paid plan:
- Show dialog: "Your current {plan} will remain active until {expires_at}. After that, you'll be on {new plan}."
- Set `pending_downgrade` field on subscription record
- When subscription expires and auto-renew runs, use the pending downgrade plan instead

### 7. Support Tickets — Platform Tickets Verification
**Current**: Platform tickets (`panel_to_admin`) exist in SupportCenter.tsx. Panel owners can create tickets to admin. Admin can see and respond via SupportTickets.tsx. Tenant tickets (`user_to_panel`) go from tenant to panel owner.
**Issues**:
- Verify admin can reply to platform tickets (need to check if reply logic works in SupportTickets.tsx)
- Verify tenant ticket creation works (previously had panelId issues)
- Ensure all ticket flows are functional

### 8. ServiceViewDialog — Clipboard Copy for Provider Service ID
**Current**: `ServiceViewDialog.tsx` shows provider info (line 226-261) but no copy button for provider_service_id. The Copy button (line 269-271) is for duplicating the service, not for copying the provider service ID.
**Fix**: 
- Add `providerServiceId` to ServiceViewDialogProps interface
- Show provider service ID as a badge/code with a clipboard copy button
- Pass `providerServiceId` from `ServicesManagement.tsx` when opening the view dialog

### 9. ServiceEditDialog — Markup Doesn't Reflect Import Config
**Current**: `markupPercent` defaults to 25 (line 127). When editing, `service.originalPrice` is used as `providerPrice` (line 198). But the markup slider always starts at 25%, not the actual markup that was set during import.
**Fix**: 
- Calculate actual markup from `service.price` and `service.originalPrice`: `markup = ((price - originalPrice) / originalPrice) * 100`
- Set `markupPercent` to the calculated value in the useEffect (line 159-178) instead of leaving it at default 25%
- If `useFixedPrice` should be detected (when price doesn't match any percentage markup), set it accordingly

### 10. Payment Method Webhooks
**Current**: Webhook URLs are dynamically constructed in `process-payment` edge function. Need to verify that payment success/failure callbacks actually update transaction status and panel balance.
**Fix**: Verify the webhook handler in `process-payment` handles status updates. Add transaction ID visibility in panel owner's transaction history so they can help troubleshoot tenant payment issues.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/PanelManagement.tsx` | Add account grouping view — group panels by owner_id, show owner card with panel count |
| `src/pages/admin/UserManagement.tsx` | Rename "Panel Owner" to "User" for non-admin; add "Tenant Users" tab querying client_users; show panel count per user |
| `src/pages/admin/SubscriptionManagement.tsx` | Add plan distribution pie chart, MRR stat, plan type filter |
| `src/pages/admin/RevenueAnalytics.tsx` | Add revenue source breakdown, ARPU stat |
| `src/pages/panel/Billing.tsx` | Add monthly/yearly toggle, yearly prices with discount, downgrade option with pending_downgrade dialog |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | Add monthly/yearly toggle matching Billing page |
| `src/components/services/ServiceViewDialog.tsx` | Add providerServiceId prop with clipboard copy button |
| `src/components/services/ServiceEditDialog.tsx` | Calculate actual markup from price/originalPrice instead of defaulting to 25% |
| `src/pages/panel/ServicesManagement.tsx` | Pass providerServiceId to ServiceViewDialog |
| `src/pages/admin/SupportTickets.tsx` | Verify reply functionality works for both ticket types |
| Database migration | Add `pending_downgrade` column to `panel_subscriptions`, add `billing_cycle` column |

