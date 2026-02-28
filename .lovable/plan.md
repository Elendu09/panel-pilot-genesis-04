

# Plan: Customer List View Redesign + Grid View Toggle + Ads Maximization Strategy

## 1. Customer List — Redesign Table View + Add Grid/Card View Toggle

**Current issues with the customer table view (lines 946-1101 in CustomerManagement.tsx):**
- Plain table with no visual hierarchy
- No view toggle — only table on desktop, cards only on mobile
- The existing `CustomerOverview` (kanban) is hidden behind a toggle and is a separate concept, not a switchable view

**Changes:**

### A. Add a View Toggle to `CustomerManagement.tsx`
- Add a `viewMode` state: `'table' | 'grid'`
- Place a toggle (Table/Grid icons) next to the search bar in the card header (line ~918)
- Table view = improved version of current table
- Grid view = responsive card grid (2-col on tablet, 3-col on desktop) using a new `CustomerGridCard` component

### B. Improve the Table View
- Add avatar online indicator dot (already on mobile cards, missing from table)
- Add "Orders" column (currently missing from table but data exists as `totalOrders`)
- Add "Joined" column with relative time (e.g. "2 months ago")
- Alternating row colors already exist, keep them

### C. Create `CustomerGridCard` component
- New file: `src/components/customers/CustomerGridCard.tsx`
- Each card shows: avatar with online dot, name, email, VIP badge, status badge, balance, total spent, orders count, last active, and a "..." dropdown menu for actions
- More visual than table — gradient border for VIP, subtle hover effects

### Files:
| File | Change |
|------|--------|
| `src/pages/panel/CustomerManagement.tsx` | Add `viewMode` state + toggle UI in card header; render grid view when `viewMode === 'grid'` with responsive grid of `CustomerGridCard` |
| `src/components/customers/CustomerGridCard.tsx` | **New file** — desktop card component with avatar, stats, status, actions dropdown |

---

## 2. Ads Maximization — Current State & Improvements

**Current ads system already has:**
- 4 ad types: `sponsored`, `top`, `best`, `featured` (stored in `provider_ads` table)
- Placement in marketplace ProviderManagement page (sponsored slider, top grid, best list)
- Placement in ChatInbox (sponsored promotion cards every 5 sessions)
- Purchase flow with balance deduction, duration selection (daily/weekly/monthly)
- "My Ads" tab with live countdown timers and performance metrics (impressions, clicks, CTR, spent)
- Preview dialog showing how ad appears in marketplace

**What's missing / can be improved:**

### A. Ad Reach Visibility — Show WHERE ads appear
- In the "My Ads" tab, add a "Reach" section below each ad's metrics showing which placements are active for that ad type (e.g. "Marketplace Providers tab", "Chat Inbox recommendations", "Storefront widget")
- This is informational — no DB changes needed, just map ad_type to known placement locations

### B. Ad Statistics Enhancement
- Add a mini sparkline or daily breakdown showing impressions/clicks over the ad's lifetime (data already in `provider_ads` table — impressions/clicks are aggregated totals but we can show daily rate)
- Add "Cost per Click" (CPC) metric: `total_spent / clicks`
- Add "Cost per 1000 Views" (CPM): `(total_spent / impressions) * 1000`

### C. Cross-Panel Reach Indicator
- In the Purchase tab, show "Active across X panels" to indicate the ad reaches all panels in the marketplace, not just yours
- Fetch count of active panels to display this number

### Files:
| File | Change |
|------|--------|
| `src/pages/panel/ProviderAds.tsx` | Add reach placement info per ad type in "My Ads" cards; add CPC/CPM metrics; add "reaches X panels" count in purchase tab |

