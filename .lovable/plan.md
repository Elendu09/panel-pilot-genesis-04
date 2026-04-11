
# Plan: User Analytics Kanban, Sidebar Alignment Fix, Order Management Improvements

## 1. Add User Analytics Kanban Below Order Analytics

**Location**: `src/pages/panel/Analytics.tsx`, insert after Row 2 (line 345) and before Row 3

**New component**: `src/components/analytics/UserAnalyticsKanban.tsx` -- a kanban-style card similar to `OrderPipelineKanban` but for user/customer metrics:
- 4 columns: **New Users** (signed up in period), **Active** (placed orders), **Returning** (>1 order), **Inactive** (no orders in 30d)
- Each column shows count + list of user cards with avatar initial, email, and last activity
- Data sourced from `rawOrders` buyer data (extract unique buyers, classify by activity)
- Glass card styling matching existing analytics cards

**Also update**: `src/components/analytics/index.ts` to export the new component

## 2. Fix Sidebar Bottom Section Alignment When Collapsed

**File**: `src/pages/PanelOwnerDashboard.tsx`, lines 390-453

**Problem**: When sidebar is collapsed (`sidebarOpen = false`), the bottom section (avatar, notification/theme/help/logout buttons) doesn't center-align like the top nav icons do. The top nav uses `NavItem` which has proper `justify-center` when collapsed, but the bottom section's container uses `p-2` without centering.

**Fix**:
- Line 390: Add `!sidebarOpen && "items-center"` to the bottom container div
- Line 412-414 (avatar row): Already has `!sidebarOpen && "justify-center p-2"` -- good
- Line 429-431 (buttons row): Has `!sidebarOpen && "flex-col"` -- add `items-center` to center the icons
- Ensure `PanelSwitcher` component aligns centered when collapsed (it receives `collapsed` prop)

## 3. Improve Order Management Expanded Row & Dropdown Actions

**File**: `src/pages/panel/OrdersManagement.tsx`

**Improvements to expanded row (lines 1029-1106)**:
- **View Details**: Already works via `viewOrderDetails(order)`
- **Open Link**: Add null check -- if `target_url` is empty, disable the button
- **Refill button**: Currently calls `updateOrderStatus(order.id, 'in_progress')` which is wrong for "Refill". Change to call a proper refill function that re-submits to the provider API
- **Start Processing + Sync logic**: When an order is cancelled by provider (via sync), "Start Processing" should be disabled or hidden for cancelled orders. Add status-aware button rendering:
  - If `status === 'cancelled'` or `status === 'completed'`: hide "Start Processing"
  - If `status === 'pending'`: show "Start Processing"
  - If `status === 'in_progress'`: show "Pause" instead
- **Cancel button**: Disable for already cancelled/completed orders
- **Add "Retry" button**: For cancelled orders, add a "Retry Order" button that re-submits to provider
- **Add "Add Note" button**: To the expanded row actions
- **Provider name**: Currently hardcoded "Provider A" (line 1063) -- fetch actual provider name from order's service provider relationship

**Dropdown menu improvements (lines 997-1025 and 830-860)**:
- Add status-conditional rendering: don't show "Start Processing" for cancelled/completed orders
- Add "Pause" and "Resume" options contextually based on current status
- Add "Retry" for cancelled orders

## 4. Deploy mfa-setup Edge Function

Redeploy the `mfa-setup` edge function with the JWT-based profile validation fix from the previous session.

---

## Files to Create/Modify

| File | Changes |
|------|---------|
| `src/components/analytics/UserAnalyticsKanban.tsx` | New: Kanban-style user analytics with 4 columns |
| `src/components/analytics/index.ts` | Export `UserAnalyticsKanban` |
| `src/pages/panel/Analytics.tsx` | Add `UserAnalyticsKanban` after order analytics row |
| `src/pages/PanelOwnerDashboard.tsx` | Fix bottom sidebar alignment when collapsed |
| `src/pages/panel/OrdersManagement.tsx` | Status-aware actions, fix hardcoded provider, improve expanded row buttons |
| `supabase/functions/mfa-setup/index.ts` | Redeploy |
