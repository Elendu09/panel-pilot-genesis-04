

# Plan: Real-time Balance, Analytics Overhaul & Tracking Fixes

## Issues Found

### 1. Panel Overview header balance never updates in real-time (BUG)
`PanelOverview.tsx` line 586: `panelData?.balance` is set once on mount and only updates when orders come in (which updates `totalRevenue`, not balance). There's no realtime subscription on the `panels` table for balance changes.

**Fix**: Add a realtime subscription on the `panels` table filtered by `id=eq.${panelData.id}` listening for UPDATE events. On update, refresh `panelData.balance` from `payload.new.balance`.

### 2. `trackOrderComplete` is imported but NEVER called (CRITICAL TRACKING BUG)
In `FastOrderSection.tsx` line 163, `trackOrderComplete` is destructured from `useAnalyticsTracking` but never invoked. The funnel's "Completed" stage in analytics relies on `completedOrdersCount` from orders table, but no `order_complete` event is ever inserted into `analytics_events`. This means the Fast Order funnel has zero real tracking data for completions.

**Fix**: Call `trackOrderComplete(order.id, totalPrice)` at the three places where orders succeed (lines ~629, ~718, ~778) in `FastOrderSection.tsx`.

### 3. Fast Order funnel uses fake fallback data when real events are missing (DATA INTEGRITY)
In `analytics-utils.ts` `buildFastOrderFunnel()` lines 468-494: When real tracking data is sparse, the function fabricates numbers like `Math.round(baseVisitors * 0.6)` and `Math.round(completed * 1.2)`. This produces fake data displayed as real.

**Fix**: Remove all fabricated fallbacks. Show only real tracked counts. If `selections === 0`, show 0, not `baseVisitors * 0.6`. If `visitors === 0` and there are completed orders, set `baseVisitors = 0` (don't estimate).

### 4. Analytics page has 3 tabs but should only show Overview (USER REQUEST)
Remove `AnalyticsTabs` component usage and all `activeTab` filtering. Show all content as a single Overview page.

### 5. Analytics desktop layout is not "analytics vibes" — too sparse
Current layout issues:
- Deposit Analytics card sits alone in a 1/3 grid (`lg:grid-cols-3` but only 1 card)
- Retention/Transactions/Customers/Insights are in a 4-col grid that's too cramped
- No visual section headers to separate funnel area from stats area

**Fix**: Restructure the grid:
- Move DepositAnalyticsCard into the funnel row (3 funnels = Payment + FastOrder + Ads becomes 2+1 layout with Deposit alongside)
- Make Retention + Insights span the full width in a 2-col layout
- Add Gross Volume card (currently unused but exists) into the stats row
- Add section dividers with labels ("Funnels", "Performance", "Trends")

### 6. Ads funnel `conversions` is estimated, not tracked (FAKE DATA)
`AdsFunnelCard.tsx` line 118: `estimatedConversions = Math.floor(totalClicks * 0.15)`. This is completely fabricated. Previous period metrics (lines 134-136) multiply by 0.7 — also fake.

**Fix**: Remove the fabricated `estimatedConversions`. Show 0 if no real conversion tracking exists. Remove the `0.7` multiplier for previous period — just show 0 for previous if no historical data.

### 7. InsightsCard "View all" button does nothing (NON-FUNCTIONAL BUTTON)
`InsightsCard.tsx` line 197: `<Button variant="ghost" size="sm">View all</Button>` — no onClick handler.

**Fix**: Make the button toggle showing all insights within the card (expand the card to show all insights instead of just the top one).

### 8. PaymentsFunnelCard "AI prompt" section is static and non-functional (FAKE UI)
`PaymentsFunnelCard.tsx` lines 155-166: Shows "What would you like to explore?" with a static "Analyze drop-off" prompt. No AI is integrated — this is purely decorative.

**Fix**: Remove the fake AI prompt section. Replace with a meaningful summary row or remove entirely.

### 9. MoreHorizontal buttons do nothing (NON-FUNCTIONAL BUTTONS)
Multiple cards have `<Button variant="ghost" size="icon"><MoreHorizontal /></Button>` with no onClick handlers (InsightsCard line 128, RetentionCard line 91, PaymentsFunnelCard line 46).

**Fix**: Remove these non-functional buttons since there are no contextual actions to attach.

### 10. Previous period deposit comparison uses fabricated multiplier (FAKE DATA)
`Analytics.tsx` line 757: `previousTotalDeposits={volumeData.previousGrossVolume * 0.3}` — multiplying by 0.3 is arbitrary fake data.

**Fix**: Calculate real previous deposits from `prevTransactions` data that's already fetched:
```typescript
const prevDepositsAmount = prevDeposits.reduce((sum, d) => sum + (d.amount || 0), 0);
```
Pass this real value instead of `* 0.3`.

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/panel/PanelOverview.tsx` | Add realtime subscription on `panels` table to refresh balance on deposit |
| `src/components/storefront/FastOrderSection.tsx` | Call `trackOrderComplete()` at all 3 order success points |
| `src/lib/analytics-utils.ts` | Remove fake fallback data in `buildFastOrderFunnel()` — show real zeros |
| `src/pages/panel/Analytics.tsx` | Remove tabs, show all as Overview; fix deposit previous period calc; restructure grid layout; add section headers |
| `src/components/analytics/AdsFunnelCard.tsx` | Remove fake `estimatedConversions` and `0.7` previous period multiplier |
| `src/components/analytics/InsightsCard.tsx` | Make "View all" button functional (expand to show all insights); remove non-functional MoreHorizontal |
| `src/components/analytics/PaymentsFunnelCard.tsx` | Remove fake AI prompt section; remove non-functional MoreHorizontal button |
| `src/components/analytics/RetentionCard.tsx` | Remove non-functional MoreHorizontal button |
| `src/components/analytics/CompactStatCard.tsx` | No changes needed — already functional |

