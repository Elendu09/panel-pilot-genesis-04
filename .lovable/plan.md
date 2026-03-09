

# Phase-by-Phase Plan: Working Team Management + Full Ad System

This is a large scope. I'll break it into **two phases**, each independently deployable.

---

## Phase 1: Make Team Dashboard Functional

### Current State
- Team auth (login, password change, JWT tokens) works via edge function
- `TeamDashboard.tsx` shows placeholder text in every tab ("Orders list will load here", "Services list will load here", etc.)
- Team members authenticate separately from Supabase Auth (custom JWT stored in localStorage)
- Role permissions are defined but not enforced — agents see "View Only" text but there's no actual data

### Problem
Team members log in but can't do anything. The dashboard is an empty shell.

### Plan

**A. Create a `team-data` edge function** that team members call (with their custom JWT) to fetch panel data. This is needed because team members don't have Supabase Auth sessions — they use custom JWTs, so RLS won't help them. The edge function will:
- Verify the team JWT from the request
- Extract `panelId` and `role` from the token
- Use the service role client to query data scoped to that panel
- Return only data the role is allowed to see

Actions supported:
| Action | Roles | Data returned |
|--------|-------|---------------|
| `list-orders` | all | Orders for panel, with filters (status, date range, search) |
| `list-services` | panel_admin, manager | Active services with category/platform |
| `list-customers` | panel_admin | Client users for panel (no password_hash) |
| `list-support` | all | Chat sessions with last message |
| `get-analytics` | panel_admin | panel_analytics rows for date range |
| `update-order-status` | panel_admin, manager | Update order status (e.g., cancel) |
| `reply-support` | all | Insert chat message into session |

**B. Build real tab content in `TeamDashboard.tsx`**:
- **Orders tab**: Table with order_number, service, buyer, quantity, status, date. Search + status filter. Agents: view-only. Managers/admins: can update status.
- **Services tab**: Table with name, platform, price, min/max qty, active toggle. Managers can edit prices. 
- **Customers tab** (admin only): Table with email, name, balance, status, last login.
- **Support tab**: List of chat sessions. Click to view messages. Reply input. Mark as read.
- **Analytics tab** (admin only): Revenue, orders, users charts from `panel_analytics`.

**C. Add a `useTeamData` hook** that wraps calls to the `team-data` edge function, automatically attaching the JWT from localStorage.

### Files to create/modify
| File | Action |
|------|--------|
| `supabase/functions/team-data/index.ts` | **Create** — new edge function for team data access |
| `src/hooks/useTeamData.ts` | **Create** — hook for team API calls |
| `src/pages/panel/TeamDashboard.tsx` | **Modify** — replace placeholders with real data tables |
| `src/components/team/TeamOrdersTab.tsx` | **Create** — orders table component |
| `src/components/team/TeamServicesTab.tsx` | **Create** — services table component |
| `src/components/team/TeamCustomersTab.tsx` | **Create** — customers table component |
| `src/components/team/TeamSupportTab.tsx` | **Create** — support/chat component |
| `src/components/team/TeamAnalyticsTab.tsx` | **Create** — analytics charts component |

---

## Phase 2: Make Ads Visible Across All Panels

### Current State
- Panel owners can purchase 4 ad types: **Sponsored**, **Top**, **Best**, **Featured**
- RLS allows anyone to read active ads (`Anyone can view active ads for marketplace`)
- Ad display components exist: `SponsoredProviderBanner` (slider), `InterstitialAdCard` (inline), `RecommendedProviderWidget`, Chat Inbox featured cards
- **BUT** these components are only rendered on buyer-facing pages (`BuyerDashboard`, `BuyerServices`, `ChatInbox`)
- If Panel A buys an ad, Panel B's **buyers** see it — but only if they visit the storefront. Panel owners in their **own dashboard Marketplace** see ads ranked but not as proper ad cards.

### Problem
Ads are purchased but barely visible. The "reach" described in `adReachMap` (Chat Inbox promotion, Dashboard widget, Marketplace slider) is partially implemented. Specifically:
- **Chat Inbox featured cards**: Works, but only for the panel owner's own chat inbox, not visible to other panel owners
- **Marketplace slider**: `SponsoredProviderBanner` only appears on `BuyerDashboard`, not on the panel-owner `ProviderManagement` marketplace
- **Dashboard widget**: `RecommendedProviderWidget` exists but needs to verify it's actually rendered

### Plan

**A. Add ad components to panel-owner-facing pages**:
- Add `SponsoredProviderBanner` to `ProviderManagement.tsx` (the panel owner marketplace) at the top
- Verify `RecommendedProviderWidget` is rendered in the panel owner dashboard overview
- Add `InterstitialAdCard` between provider listings in the marketplace

**B. Fix cross-panel ad visibility in Chat Inbox**:
- The featured ad cards in `ChatInbox.tsx` already query across all panels and exclude self (`neq('id', panelId)`) — this should work. Verify it renders the promotional card UI between chat sessions.

**C. Add impression/click tracking consistency**:
- Ensure every ad render calls `trackAdImpression` and every click calls `trackAdClick`
- The buyer-side components already do this; replicate in the panel-owner-side placements

**D. Real ad card rendering in Marketplace**:
- In `ProviderManagement.tsx`, panels with active ads should show visual ad badges (Sponsored crown, Top trophy, Best star, Featured sparkle) — this partially exists via `ad_type` field but needs proper badge rendering in the provider cards

### Files to modify
| File | Change |
|------|--------|
| `src/pages/panel/ProviderManagement.tsx` | Add `SponsoredProviderBanner` at top, add ad badges to provider cards, add `InterstitialAdCard` between listings |
| `src/pages/PanelOwnerDashboard.tsx` | Verify `RecommendedProviderWidget` is rendered on overview |
| `src/pages/panel/ChatInbox.tsx` | Verify featured ad cards render between sessions properly |
| `src/components/buyer/SponsoredProviderBanner.tsx` | Minor: ensure it works both in buyer and panel-owner contexts |

---

## Implementation Order

I recommend **Phase 1 first** (team management) since it's fully broken, then **Phase 2** (ads). Each phase is a separate implementation message.

Phase 1 is larger and will create ~6 new files. Phase 2 is mostly wiring existing components into new locations.

