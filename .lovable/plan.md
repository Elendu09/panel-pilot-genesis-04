

# Plan: Transaction Colors, Payment Routes, Customer UI, Detail Sheet, Desktop Table, Domain Settings

## 1. Transaction Timeline Indicator Colors — Use Status-Based Colors
**`src/components/billing/TransactionHistory.tsx`**
- The timeline indicator line (left bar, line 190-191) currently uses `getIndicatorColor` which is based on transaction **type** (deposit=green, withdrawal=orange, etc.)
- Change it to use **status-based** colors instead: green for completed, yellow for pending, red for failed
- Add a `getStatusIndicatorColor` function: `completed/null → bg-green-500`, `pending → bg-yellow-500`, `failed → bg-red-500`
- Replace `getIndicatorColor(tx.type)` with `getStatusIndicatorColor(tx.status)` on line 191

## 2. Payment Button Routes — Fix PanelOverview + Notifications
**`src/pages/panel/PanelOverview.tsx`**
- Lines 653, 1090: Change `navigate('/panel/payment-methods')` → `navigate('/panel/payments')` (the route is `/panel/payments`, not `/panel/payment-methods`)

**Notifications** — Already correct. `use-notifications.tsx` routes payment to `/panel/payments?tab=transactions`. No change needed.

## 3. Customer Empty State — Show "No Customers" Text
**`src/pages/panel/CustomerManagement.tsx`**
- Lines 1041-1046 (desktop table empty): Already shows "No customers found" — enhance to "No customers yet. Add your first customer to get started."
- Lines 1178-1180 (desktop grid empty): Same enhancement
- Lines 1261-1263 (mobile grid empty): Same
- Mobile list view (line 1214): Add empty state check before the `<tbody>` — if `filteredCustomers.length === 0`, show text instead of empty table

## 4. Customer List/Grid Toggle — Move Beside "All Customers"
**`src/pages/panel/CustomerManagement.tsx`**
- Remove the List/Grid toggle from the mobile search section (lines 893-912)
- Move it inside the card header (line 943-944) next to "All Customers" title, visible on mobile too
- Change the desktop Table/Grid toggle (line 945) to show on all screens but with different labels: List/Grid on mobile, Table/Grid on desktop
- Unify: on mobile use `mobileViewMode`, on desktop use `viewMode`

## 5. Customer Detail Sheet — Reduce Padding, Compact UI
**`src/components/customers/CustomerDetailPage.tsx`**
- Reduce avatar size: `h-12 w-12` → `h-10 w-10` (line 342)
- Reduce stats card padding: `p-4` → `p-3` (lines 377, 386, 395, 404)
- Reduce stats text: `text-2xl` → `text-xl` (lines 382, 391, 400)
- Reduce section header text: already `text-sm`, keep as-is
- Reduce ScrollArea top padding: `py-4` → `py-3` (line 372)
- Reduce `space-y-6` → `space-y-4` (line 373)
- Reduce separator padding by using tighter spacing

## 6. Desktop Table Responsiveness
**`src/pages/panel/CustomerManagement.tsx`**
- Add `overflow-x-auto` to the table container (line 1005) — already has it? Check: it has `overflow-hidden`. Change to `overflow-x-auto`
- Reduce table cell padding for tighter fit
- Add `text-xs` or `text-sm` consistently to table cells
- The "Joined" column shows raw ISO date (line 1100) — format it to short date

## 7. Domain Settings — Fix UpgradePrompt for Basic Users
**`src/pages/panel/DomainSettings.tsx`**
- The issue: `panel?.subscription_tier === 'free'` check at line 344. If the user's panel has `subscription_tier` set correctly to 'basic', this should NOT show the prompt.
- The real problem may be that the panel record has `subscription_tier = null` (not updated when subscribing via billing page). The `Billing.tsx` updates `panel_subscriptions` but may not update `panels.subscription_tier`.
- Fix: In `DomainSettings.tsx`, also check the `panel_subscriptions` table for the actual plan. Fetch the active subscription and use `subscription.plan_type` instead of relying solely on `panel.subscription_tier`.
- Add a `useEffect` to fetch the active subscription from `panel_subscriptions` where `panel_id = panel.id` and `status = 'active'`
- Use the fetched plan_type for the tier check instead of `panel.subscription_tier`

## Files to Change

| File | Change |
|------|--------|
| `src/components/billing/TransactionHistory.tsx` | Change timeline indicator to status-based colors (green/yellow/red) |
| `src/pages/panel/PanelOverview.tsx` | Fix payment button routes: `/panel/payment-methods` → `/panel/payments` |
| `src/pages/panel/CustomerManagement.tsx` | Move List/Grid toggle beside "All Customers"; add empty state text; fix table overflow; format dates |
| `src/components/customers/CustomerDetailPage.tsx` | Reduce padding, text sizes, spacing for compact UI |
| `src/pages/panel/DomainSettings.tsx` | Fetch active subscription from `panel_subscriptions` to correctly determine tier; fix UpgradePrompt gating |

