

# Plan: Enhance Ads Analytics with Per-Ad-Type Performance Tracking

## Current State (What Already Works)

Ad placements ARE implemented and functional:
- **Sponsored** → Auto-rotating slider in Marketplace (ProviderManagement.tsx)
- **Top** → Grid section in Marketplace with gold badges
- **Best** → List section in Marketplace with blue badges
- **Featured** → Chat Inbox promotion cards + Dashboard RecommendedProviderWidget
- Impression/click tracking exists via `ad-tracking.ts` (debounced batching)
- Per-ad metrics shown in "My Ads" tab (impressions, clicks, CTR, CPC, CPM)

## What's Missing / Needs Enhancement

1. **AdsFunnelCard** shows only aggregate totals — no breakdown by ad type
2. **No per-type analytics tab** in the ProviderAds page — users can't compare Sponsored vs Top vs Best vs Featured performance
3. **Sparkline data is randomly generated** (line 762-765 of ProviderAds.tsx) — not real historical data
4. **No conversion tracking** — "Leads" always shows 0 because provider enables (the actual conversion) are never recorded back to `provider_ads`
5. **No daily snapshots** — impression/click data is cumulative only, no time-series breakdown possible

## Implementation Plan

### 1. Add `ad_analytics_daily` table for time-series data
- Create migration with columns: `id`, `panel_id`, `ad_id`, `ad_type`, `date`, `impressions`, `clicks`, `conversions`
- This enables real sparklines and period-over-period comparisons
- RLS: panel owners can read their own data

### 2. Update `ad-tracking.ts` to record daily snapshots
- In `flushImpressions`, also upsert into `ad_analytics_daily` for today's date
- In `trackAdClick`, also increment daily click count
- Add `trackAdConversion(panelId, adType)` — called when a panel owner enables a provider via the Marketplace

### 3. Track conversions in ProviderManagement.tsx
- When `handleEnableDirectProvider` succeeds for an ad-bearing provider, call `trackAdConversion(provider.id, provider.ad_type)`
- This populates the "Leads" metric in the funnel

### 4. Enhance AdsFunnelCard with per-type breakdown
- Fetch `provider_ads` grouped by `ad_type`
- Below the aggregate funnel, show a 4-column breakdown grid: one mini-card per ad type showing impressions/clicks/CTR/spent
- Use real per-type data instead of aggregate totals

### 5. Add "Analytics" tab to ProviderAds.tsx
- Add third tab: "Analytics" alongside "Purchase Ads" and "My Ads"
- Content: per-ad-type performance cards with real sparklines from `ad_analytics_daily`
- Metrics per type: Impressions, Clicks, CTR, CPC, CPM, Spent, Conversions
- Time range selector (7d / 30d / All time)
- Comparison view: side-by-side bar chart or table showing all 4 ad types

### 6. Replace fake sparkline data with real data
- In "My Ads" tab, query `ad_analytics_daily` for the ad's date range
- Pass real daily impression counts to `MiniSparkline`

## Files to Change

| File | Change |
|------|--------|
| New migration | Create `ad_analytics_daily` table with RLS |
| `src/integrations/supabase/types.ts` | Add `ad_analytics_daily` type |
| `src/lib/ad-tracking.ts` | Add daily upsert logic + `trackAdConversion` |
| `src/pages/panel/ProviderManagement.tsx` | Call `trackAdConversion` on provider enable |
| `src/pages/panel/ProviderAds.tsx` | Add "Analytics" tab with per-type breakdown; replace fake sparklines |
| `src/components/analytics/AdsFunnelCard.tsx` | Add per-ad-type breakdown section below aggregate funnel |

