

# Plan: Ads Tracking, Chat Inbox Ads Redesign, Skeleton-to-Shimmer

## 1. Impression & Click Tracking for Ads

### Problem
- `RecommendedProviderWidget` has a broken impression tracker (uses `(ads[0] as any).impressions + 1` but `impressions` isn't selected)
- Marketplace (`ProviderManagement`) and Chat Inbox have zero impression/click tracking
- No click tracking anywhere

### Changes

**`src/components/dashboard/RecommendedProviderWidget.tsx`**
- Fix impression tracking: use `.rpc` or raw increment instead of reading stale value. Use SQL increment: `impressions: supabase.rpc` or simply fetch impressions first, or use a raw update with `impressions + 1` via a simple approach — select `impressions` in the initial query then increment correctly

**`src/pages/panel/ProviderManagement.tsx`**
- After marketplace loads sponsored/top/best providers, batch-increment `impressions` on their `provider_ads` rows (debounced, once on mount)
- On "Enable" or "Visit" click for an ad-bearing provider, increment `clicks` on that provider's active ad

**`src/pages/panel/ChatInbox.tsx`**
- When sponsored promotion cards render, increment `impressions` for those ads
- When "Visit" is clicked on a promotion card, increment `clicks`

**`src/components/chat/SponsoredPromotionCard.tsx`**
- Add `onImpression` and `onClick` callback props to track events

## 2. Chat Inbox Ads Redesign

### Which ad types show in Chat Inbox?
Currently: `sponsored` and `featured`. Per the placement map, only **`featured`** should show in Chat Inbox. Sponsored belongs to Marketplace/Dashboard. Update the query to filter `ad_type = 'featured'` only.

### Replace email with panel name
- In the session list, the `SponsoredPromotionCard` currently shows email-related text "Check out their services". Replace with the actual **panel name** prominently displayed and a short auto-generated description like "{panelName} — {serviceCount} services available"

### Sponsored chat engagement concept
- When a `featured` ad promotion card appears in Chat Inbox, add a "Chat with Provider" button instead of just "Visit"
- Clicking "Chat with Provider" creates a special chat session between the two panel owners (using `chat_sessions` with a marker like `visitor_id = panel_owner_id` and a `is_ad_chat` flag or metadata)
- When the ad expires (`expires_at < now()`), the chat session auto-archives and messages are disabled
- Add logic: when rendering ad chat sessions, check if the linked ad is still active. If expired, show "Ad expired — chat archived" banner and disable the input

### Implementation
**`src/components/chat/SponsoredPromotionCard.tsx`**
- Replace "Check out their services" with `{panelName} — {serviceCount} services`
- Show panel name prominently, remove email reference
- Add "Chat" button alongside "Visit"
- Add `onChat` callback prop
- Add `serviceCount` to the interface

**`src/pages/panel/ChatInbox.tsx`**
- Change ad query from `in('ad_type', ['sponsored', 'featured'])` to `eq('ad_type', 'featured')`
- Fetch `service_count` for each promoted panel
- Handle "Chat with Provider" — create a chat session tagged as ad-sourced
- When loading sessions, detect ad-sourced sessions and check if the ad is still active
- For expired ad chats: move to archived, show "Ad expired" indicator, disable message input

## 3. Ad Expiry Auto-Close

### Problem
When ads expire, they remain `is_active = true` in the DB. Currently only the UI checks `expires_at > now()`.

### Changes
- In `ProviderAds.tsx` fetch (line 202), after loading ads, auto-deactivate expired ones: for any ad where `expires_at < now()` and `is_active = true`, update `is_active = false`
- In `RecommendedProviderWidget` and `ProviderManagement`, the queries already filter `gt('expires_at', now)` — this is correct
- Add a cleanup effect in `ProviderAds.tsx` that runs on mount to deactivate expired ads for the current panel

## 4. Replace Skeleton with Shimmer Loading in /panel

### Current state
- Only 2 panel pages use `Skeleton`: `BlogManagement.tsx` and `Analytics.tsx` (via `AnalyticsSkeleton`)
- `AnalyticsSkeleton` already uses shimmer overlay pattern with `themed` style
- `BlogManagement.tsx` uses plain `Skeleton` without shimmer

### Changes
**`src/pages/panel/BlogManagement.tsx`**
- Replace plain `<Skeleton>` with `<Skeleton themed />` to use the primary-color shimmer variant (the `themed` prop already exists in `skeleton.tsx`)

**`src/components/ui/skeleton.tsx`**
- Add a CSS shimmer animation overlay when `themed` is true — actually the AnalyticsSkeleton already has a `ShimmerOverlay` component. Export it or add the shimmer effect directly to the `themed` variant

Actually, a simpler approach: update all `Skeleton` usage in `/panel` pages to pass `themed` prop. The skeleton component already supports it. But the shimmer animation (the moving gradient) isn't part of the `Skeleton` component — it's only in `AnalyticsSkeleton`. 

**Better approach**: Add a shimmer animation to the `Skeleton` component's `themed` variant directly, so all themed skeletons get the moving shimmer effect without needing a separate overlay.

**`src/components/ui/skeleton.tsx`**
- When `themed = true`, add `relative overflow-hidden` and include an `::after` pseudo-element shimmer via a Tailwind animation class (add `animate-shimmer` to tailwind config) or use inline approach with a child div

**`src/pages/panel/BlogManagement.tsx`**
- Change `<Skeleton className="...">` to `<Skeleton themed className="...">`

## Files to Change

| File | Change |
|------|--------|
| `src/components/ui/skeleton.tsx` | Add shimmer animation to themed variant |
| `tailwind.config.ts` | Add `shimmer` keyframe animation |
| `src/pages/panel/BlogManagement.tsx` | Use `themed` prop on all Skeletons |
| `src/components/chat/SponsoredPromotionCard.tsx` | Redesign: show panel name, service count, add Chat button, add tracking callbacks |
| `src/pages/panel/ChatInbox.tsx` | Filter `featured` only, add service counts, handle ad-chat sessions, auto-archive expired ad chats, add impression/click tracking |
| `src/components/dashboard/RecommendedProviderWidget.tsx` | Fix impression tracking (select impressions in query), add click tracking |
| `src/pages/panel/ProviderManagement.tsx` | Add impression tracking on mount for displayed ad providers, click tracking on enable/visit |
| `src/pages/panel/ProviderAds.tsx` | Auto-deactivate expired ads on mount |

