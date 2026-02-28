# Plan: Funnel Detail Breakdowns, Service Selection Insights & Verification

## Current State Analysis

### What's Already Working

- **Visitor tracking**: `trackPageVisit('fast_order')` fires on mount in `FastOrder.tsx` line 371 — inserts `fast_order_visit` event
- **Selection tracking**: `trackServiceSelect(serviceId, serviceName, category)` fires in `FastOrderSection.tsx` line 381 — inserts `service_select` event with metadata `{ serviceId, serviceName, category }`
- **Checkout tracking**: `trackCheckoutStart(serviceId, totalPrice)` fires in line 394 — inserts `checkout_start` event
- **Order complete**: `trackOrderComplete` fires at order success points
- **NotificationCenter**: Already in the dashboard header (`PanelOwnerDashboard.tsx` line 409), uses real `panel_notifications` table with realtime subscriptions, shows "No notifications" when empty — no fake data

### What's Missing

1. **Selection detail not shown**: The funnel card shows "Selections: 42" but never reveals WHICH services were selected most. The `service_select` metadata contains `{ serviceName, category }` but it's never extracted or displayed.
2. **No expandable detail on funnel stages**: Clicking a funnel stage does nothing — no drill-down to see service breakdown, daily trends, or session details.
3. **Analytics query fetches metadata but ignores it**: `Analytics.tsx` line 223 selects `metadata` from analytics_events but `buildFastOrderFunnel()` only counts unique sessions — it never aggregates the service names from metadata.
4. **Test the analytics page end-to-end — verify that all funnel cards show real data, notification bell works, and the top services breakdown renders correctly**
5. Improve the Panel balance display, itß size, how it appears and Enhance 

## Planned Changes

### 1. Extract top selected services from analytics events (`Analytics.tsx`)

- After fetching `analyticsEvents`, filter for `service_select` events
- Aggregate `metadata.serviceName` + `metadata.category` to build a "Top Selected Services" list (name, category, count)
- Pass this list to `FastOrderAnalyticsCard`

### 2. Add expandable "Top Services" breakdown to FastOrderAnalyticsCard

- Add a collapsible section below the funnel stages
- When "Selections" count > 0, show a "View top services" toggle
- Display ranked list: service name, category badge, selection count, percentage of total selections
- Shows real data only — if no selections, section hidden

### 3. Add FAQ click tracking on storefront

- In the storefront FAQ component, track `faq_click` events with `{ question }` metadata when a buyer expands an FAQ item
- This feeds future analytics but requires identifying the FAQ rendering component

### 4. Test all funnel cards, display, ui, drop off and make sure all iß collecting from real data and not none, like if completed is zero, it's display must not be full

### 5. Verify NotificationCenter is properly connected (no changes needed)

- Already uses `useNotifications` hook → `panel_notifications` table
- Already has realtime INSERT/UPDATE/DELETE subscriptions
- Already shows "No notifications" with Bell icon when empty
- Already categorizes by order/payment/system with tabs

## Files to Change


| File                                                       | Change                                                                                                                      |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/panel/Analytics.tsx`                            | Extract top services from `service_select` metadata; fetch `faq_click` events; pass `topServices` to FastOrderAnalyticsCard |
| `src/components/analytics/FastOrderAnalyticsCard.tsx`      | Add `topServices` prop; add collapsible "Top Selected Services" breakdown below funnel                                      |
| `src/lib/analytics-utils.ts`                               | Add `extractTopServices(events)` utility function                                                                           |
| `src/components/storefront/FAQSection.tsx` (or equivalent) | Add `trackEvent('faq_click', { question })` on accordion expand                                                             |
| `src/hooks/use-analytics-tracking.tsx`                     | Add `trackFaqClick` convenience method                                                                                      |
