

# Plan: Complete Missing Implementations — SMTP in Integrations, Drip Feed Toggle + Panel Visibility, Order Storage

## Audit Summary

### Confirmed Working
- **Auth password fix**: `password_temp` stored separately, login checks both independently, `normalizedEmail` bug fixed
- **Live chat panel ID**: Triple fallback implemented (`authPanelId || panel?.id || localStorage`)
- **Support tickets**: All operations use `resolvedPanelId`
- **SupportCenter**: Defaults to "livechat" tab, FAQ CRUD implemented
- **SMTP config UI**: Present in GeneralSettings with all fields
- **Drip feed forwarding**: `buyer-order` accepts `runs`/`interval`/`delay` and forwards to provider API
- **Drip feed UI**: Present in both BuyerNewOrder and FastOrderSection
- **Commission 5%**: Implemented in `buyer-order`

### Gaps Found

1. **SMTP not in Integrations page** — user wants an SMTP card in Integrations that links to General Settings
2. **Drip feed auto-shows** instead of using a toggle — user expects a Switch toggle that reveals the fields when turned on
3. **Orders table doesn't store drip feed params** — `runs`, `interval` are forwarded to provider but never saved on the order record, so panel owners can't see which orders are drip feed
4. **OrdersManagement doesn't show drip feed info** — no badge or column indicating drip feed orders

---

## 1. Add SMTP Card to Integrations Page

**File**: `src/pages/panel/Integrations.tsx`

Add an "Email / SMTP" card in the integrations list that:
- Shows an email icon with description "Configure SMTP for sending tenant emails"
- Has a "Configure" button that navigates to `/panel/settings` (General Settings)
- Shows a "Connected" badge if SMTP host is already configured

---

## 2. Drip Feed Toggle in New Order & Fast Order

**Files**: `src/pages/buyer/BuyerNewOrder.tsx`, `src/components/storefront/FastOrderSection.tsx`

Currently drip feed fields auto-show when `dripfeed_available` is true. Change to:
- Add a `dripFeedEnabled` boolean state (default `false`)
- When `dripfeed_available` is true, show a Switch toggle labeled "Enable Drip Feed"
- Only show runs/interval inputs when toggle is ON
- When toggle is OFF, don't send `runs`/`interval` params (current behavior when `dripFeedRuns <= 1`)
- Reset toggle to OFF when service changes

---

## 3. Store Drip Feed Params on Orders

**Database migration**: Add `drip_feed_runs` (integer, nullable) and `drip_feed_interval` (integer, nullable) columns to `orders` table.

**File**: `supabase/functions/buyer-order/index.ts`
- Save `runs` and `interval` to the order record in the insert payload as `drip_feed_runs` and `drip_feed_interval`

**File**: `supabase/functions/buyer-api/index.ts`
- Same: save drip feed params to order record

---

## 4. Show Drip Feed Info in Panel Owner Orders

**File**: `src/pages/panel/OrdersManagement.tsx`
- Add a "Drip Feed" badge on orders where `drip_feed_runs > 1`
- Show tooltip or detail: "X runs every Y min"

**File**: `src/components/team/TeamOrdersTab.tsx`
- Same drip feed badge display

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/Integrations.tsx` | Add SMTP integration card linking to General Settings |
| `src/pages/buyer/BuyerNewOrder.tsx` | Add drip feed toggle Switch instead of auto-show |
| `src/components/storefront/FastOrderSection.tsx` | Add drip feed toggle Switch instead of auto-show |
| `supabase/functions/buyer-order/index.ts` | Store `drip_feed_runs`, `drip_feed_interval` on order |
| `supabase/functions/buyer-api/index.ts` | Store drip feed params on order |
| `src/pages/panel/OrdersManagement.tsx` | Show drip feed badge on orders |
| `src/components/team/TeamOrdersTab.tsx` | Show drip feed badge on orders |
| Database migration | Add `drip_feed_runs`, `drip_feed_interval` columns to `orders` |

