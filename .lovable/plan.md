

# Plan: Fix Auth Loading on Tab Switch, MFA Error Handling, and Revamp Analytics Dashboard

## 1. Fix Loading Spinner on Tab Return (AuthContext.tsx)

**Root Cause**: When the user switches tabs and returns, Supabase fires a `TOKEN_REFRESHED` event through `onAuthStateChange`. The handler sets `loading = true` on line 244, then awaits `fetchProfile` + `enforceMfaIfEnabled` (edge function call). If the network is slow or the call hangs, the app shows a loading spinner indefinitely.

Additionally, both `getSession()` (line 262) and `onAuthStateChange` (line 230) race each other -- both set loading and fetch profile, causing duplicate work and potential stuck states.

**Fix**:
- Add an `initializedRef` flag. The `getSession()` block handles the initial load. Once initialized, `onAuthStateChange` should NOT set `loading = true` for `TOKEN_REFRESHED` events -- only for `SIGNED_IN` / `SIGNED_OUT`.
- For `TOKEN_REFRESHED`, silently refresh profile and MFA status without showing a loading spinner (user is already authenticated).
- Guard against double-initialization by checking `initializedRef.current` before the initial `getSession` block runs its profile/MFA fetch.

**File**: `src/contexts/AuthContext.tsx`

## 2. MFA Dialog Error Handling

**Current State**: The `TwoFactorChallenge` component already has error toasts on lines 34 and 38 for invalid TOTP codes and backup codes. However, the error messages could be clearer.

**Fix**:
- Add a visible inline error message below the OTP input (red text, e.g., "Invalid code. Please try again.") that resets when the user types a new code, in addition to the toast.
- Keep the "Welcome back" toast after successful MFA verification (already handled by `handleMfaVerified` -> profile fetch -> app renders).
- Add the welcome toast explicitly in `handleMfaVerified` in AuthContext.tsx.

**Files**: `src/components/auth/TwoFactorChallenge.tsx`, `src/contexts/AuthContext.tsx`

## 3. Revamped Analytics Dashboard (Above Existing Sections)

**Requirement**: Add new sections ABOVE the existing deposit funnel and analytics cards. Existing sections stay intact below. The new sections match the uploaded reference images (dark glassmorphic style, theme-aware).

**New Components to Create** (all in `src/components/analytics/`):

| Component | Description |
|-----------|-------------|
| `OrderAnalyticsCard.tsx` | 3/5 grid: dual-line area chart (orders + revenue) with gradient fills, donut chart for order status breakdown, filter tabs (All/Completed/Processing/Pending/Cancelled) |
| `RecentOrdersPanel.tsx` | 2/5 grid: live order list with colored status dots, service name, order ID, quantity, timestamp, price. "View All" link |
| `PlatformServiceCards.tsx` | 4 cards (Instagram/YouTube/Twitter/Facebook) with colored icons, order counts, revenue |
| `KPIMetricsGrid.tsx` | 6 cards in 3x2: Avg Order Value, Profit Margin, Refund Rate, Avg Delivery Time, API Uptime, Support Tickets |
| `OrderPipelineKanban.tsx` | 4 columns: Pending/Processing/Completed/Failed with colored headers, order cards with service name, user, qty, timestamp |
| `LiveActivityFeed.tsx` | Auto-updating feed (every 4s), colored type icons, service name, username, amount, relative timestamp, green pulsing LIVE indicator |
| `TrafficGeographyPanel.tsx` | Device breakdown bar + cards (Desktop/Mobile/Tablet), country list with flag emojis and progress bars |
| `RevenueExpensesChart.tsx` | Dual bar chart (revenue blue, expenses purple) with rounded tops |
| `TopProvidersCard.tsx` | Provider list with colored status indicators (Active/Slow/Down), order counts, progress bars |
| `SystemHealthCard.tsx` | 3 radial gauges (Server Load, API Quota, Balance) + Avg Response Time + Error Rate |

**Layout in Analytics.tsx** (new order):

```text
Row 1: 4 Stat Cards (existing TopStatCard - add sparkline + glow + count-up)
Row 2: Order Analytics (3/5) + Recent Orders (2/5)          [NEW]
Row 3: 4 Platform Service Cards                              [NEW]
Row 4: KPI Metrics Grid (3x2)                               [NEW]
Row 5: Order Pipeline Kanban (4 columns)                     [NEW]
Row 6: Live Activity Feed (3/5) + Traffic & Geography (2/5)  [NEW]
Row 7: Revenue vs Expenses (1/3) + Top Providers (1/3) + System Health (1/3) [NEW]
--- existing sections below ---
Row 8: Payment Funnel + Deposit Card (existing)
Row 9: Retention/Transactions/Customers/Insights (existing)
Row 10: Order Trends + Revenue charts (existing)
Row 11: Fast Order + Ads funnels (existing)
Row 12: Customer Growth (existing)
```

**Styling**: All new cards use glassmorphic `bg-card/80 backdrop-blur-xl border-border/50` with subtle glow shadows. Theme-aware (works in both light and dark). Staggered `motion.div` entry animations. Hover scale 1.03x. `tabular-nums` for numbers. Uppercase `tracking-wider` labels.

**Data Source**: All new components pull from the same Supabase queries already in `fetchAnalytics` (orders, customers, transactions, analytics_events). No new edge functions needed -- the data is already fetched.

**Skeleton Update**: Update `AnalyticsSkeleton.tsx` to include shimmer placeholders for all new sections so the loading state matches the final layout.

## Files to Modify/Create

| File | Changes |
|------|---------|
| `src/contexts/AuthContext.tsx` | Add `initializedRef`, skip `setLoading(true)` on TOKEN_REFRESHED; add welcome toast on MFA success |
| `src/components/auth/TwoFactorChallenge.tsx` | Add inline error message below OTP input |
| `src/components/analytics/OrderAnalyticsCard.tsx` | New: area chart + donut + filter tabs |
| `src/components/analytics/RecentOrdersPanel.tsx` | New: live order list |
| `src/components/analytics/PlatformServiceCards.tsx` | New: 4 platform cards |
| `src/components/analytics/KPIMetricsGrid.tsx` | New: 6 KPI metric cards |
| `src/components/analytics/OrderPipelineKanban.tsx` | New: 4-column kanban |
| `src/components/analytics/LiveActivityFeed.tsx` | New: auto-updating feed |
| `src/components/analytics/TrafficGeographyPanel.tsx` | New: device + geography |
| `src/components/analytics/RevenueExpensesChart.tsx` | New: dual bar chart |
| `src/components/analytics/TopProvidersCard.tsx` | New: provider list |
| `src/components/analytics/SystemHealthCard.tsx` | New: gauges + stats |
| `src/components/analytics/AnalyticsSkeleton.tsx` | Update with new section skeletons |
| `src/components/analytics/index.ts` | Export all new components |
| `src/pages/panel/Analytics.tsx` | Import and render new sections above existing ones; pass data props |

