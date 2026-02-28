

# Plan: Ads Placement Strategy — Panel-Owner-Only, Priority-Based, No Storefront Leakage

## Critical Fix: Remove Storefront from Ad Placements

The current `adReachMap` in `ProviderAds.tsx` incorrectly lists "Storefront Widget — Featured" and "Homepage Carousel" as placements for the `featured` ad type. This is wrong — **panel owner ads must NEVER appear on another panel's storefront**. Storefronts are buyer-facing. Ads are panel-owner-to-panel-owner promotions only.

## Where Each Ad Type Actually Appears (Panel-Owner-Only Contexts)

```text
┌─────────────┬──────────────────────────────────────────────────────┬───────────┐
│ Ad Type     │ Placement (all panel-owner-only screens)            │ Priority  │
├─────────────┼──────────────────────────────────────────────────────┼───────────┤
│ Sponsored   │ 1. Marketplace — Premium Slider (auto-rotating)     │ Highest   │
│ ($$$)       │ 2. Provider Search — Pinned top results             │           │
│             │ 3. Dashboard Overview — "Recommended Provider" card │           │
├─────────────┼──────────────────────────────────────────────────────┼───────────┤
│ Top         │ 1. Marketplace — "Top Providers" grid section       │ High      │
│ ($$)        │ 2. Provider Rankings — Blue highlight badge         │           │
├─────────────┼──────────────────────────────────────────────────────┼───────────┤
│ Best        │ 1. Marketplace — "Best Choice" list section         │ Medium    │
│ ($)         │ 2. Provider Details — "Editor's Pick" badge         │           │
├─────────────┼──────────────────────────────────────────────────────┼───────────┤
│ Featured    │ 1. Chat Inbox — Promotion cards every 5 sessions    │ Standard  │
│ ($)         │ 2. Dashboard Overview — "Featured Provider" widget  │           │
└─────────────┴──────────────────────────────────────────────────────┴───────────┘
```

## How "Top Price Wins" Works

When multiple panels buy the same ad type, they compete for position. The ranking within each tier uses this priority formula:

1. **Higher `total_spent`** = better position (the panel that paid more gets slot #1)
2. **Tie-breaker**: longer remaining duration (`expires_at - now()`) wins
3. The existing `position` column in `provider_ads` is currently unused — we will populate it based on this ranking

In the Marketplace query (`ProviderManagement.tsx`), instead of using a simple `Map` (which only keeps ONE ad per panel), fetch `total_spent` and sort within each ad type group by `total_spent DESC`.

## Implementation Changes

### 1. Fix `adReachMap` in `ProviderAds.tsx`
- Remove "Storefront Widget — Featured" and "Homepage Carousel" from `featured` placements
- Replace with "Dashboard Overview — Featured Widget" and "Chat Inbox — Promotion Cards"
- Update `sponsored` to add "Dashboard Overview — Recommended Provider"
- These are informational-only labels, no DB changes needed

### 2. Fix Marketplace ranking to use `total_spent` for priority (`ProviderManagement.tsx`)
- Change the ads query from `select('panel_id, ad_type')` to `select('panel_id, ad_type, total_spent')`
- When multiple ads exist for same type, sort by `total_spent DESC` so highest spender gets position #1 in slider/grid
- Fix the `adMap` to handle multiple ads per panel (currently a simple Map that overwrites)

### 3. Add "Recommended Provider" widget to Dashboard Overview (`PanelOverview.tsx`)
- Small card in the overview showing a single `sponsored` or `featured` provider
- Fetches one active ad (highest `total_spent`) from `provider_ads` where `ad_type = 'sponsored'` and `panel_id != current panel`
- Shows panel name, logo, service count, "Sponsored" badge, and "Connect" CTA
- Tracks impression increment on render

### 4. Update ChatInbox sponsored query to also rank by `total_spent` (`ChatInbox.tsx`)
- Current query fetches sponsored/featured ads but doesn't sort by spend
- Add `.order('total_spent', { ascending: false })` so higher-paying ads appear first in rotation

### 5. Track impressions properly
- When a promoted panel renders in Marketplace slider/grid/list, increment `impressions` on `provider_ads`
- When clicked (user clicks to view/connect), increment `clicks`
- Use a debounced approach: batch increment on component unmount or after 3-second visibility

## Files to Change

| File | Change |
|------|--------|
| `src/pages/panel/ProviderAds.tsx` | Fix `adReachMap` — remove storefront placements, add dashboard placements |
| `src/pages/panel/ProviderManagement.tsx` | Fetch `total_spent` in ads query; sort within ad type groups by spend; fix `adMap` for multi-ad support |
| `src/pages/panel/PanelOverview.tsx` | Add "Recommended Provider" card widget fetching top sponsored ad |
| `src/pages/panel/ChatInbox.tsx` | Add `total_spent` ordering to sponsored panels query |

