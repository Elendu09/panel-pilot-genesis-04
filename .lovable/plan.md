

# Analytics Dashboard Enhancement Plan - Zentra-Style UI

## Overview

Transform the current Analytics page into a modern, decision-focused dashboard inspired by the Zentra reference design. The goal is to help panel owners quickly identify drop-offs, conversion rates, and successful transactions with contextual insights instead of raw numbers.

---

## Current State vs Target State

| Current | Target (Zentra-Style) |
|---------|----------------------|
| 4 basic stat cards | Funnel visualization + contextual cards |
| Separate tabs for Overview/Payments/Customers | Unified dashboard with modular sections |
| Raw numbers only | Numbers with insights and comparisons |
| Standard date picker | Dual date range with "compared to" option |
| No funnel/drop-off visualization | Payment funnel with drop-off rates |
| Basic line/bar charts | Mini sparklines + retention graphs |

---

## New Dashboard Layout

### Header Section
- **Title**: "Overview" with edit icon (like Zentra)
- **Dual Date Range Selector**: "Jan 01 - Jul 31" compared to "Aug 01 - Dec 31"
- **Quick filters**: Daily / Custom + "Add widget" button

---

### Section 1: Payments Funnel Card (NEW)

A horizontal funnel visualization showing order flow:

```
┌────────────────────────────────────────────────────────────────────┐
│ Payments                                                    [···]  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│   Initiated    Authorized    Successful    Requires    Completed   │
│     Orders       Orders      Payments     Attention   Transactions │
│                                                                    │
│     65.2k        54.8k        48.6k        38.3k        32.9k      │
│     ████         ███         ███          ██           ██          │
│     █████████████████████████████████████████████████████████████  │
│                                                                    │
│     48.6k Transactions | Conversion: 89% | Drop-off: -11%          │
│                                                                    │
│  💬 What would you like to explore next?                           │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ I want to know what caused the drop-off from authorized    │    │
│  │ to [successful payments].                                  │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
```

**Data source**: Orders grouped by status (pending, processing, completed, cancelled, partial)

---

### Section 2: Gross Volume Card (Enhanced Revenue)

Replace current revenue card with breakdown:

```
┌────────────────────────────────────────┐
│ Gross Volume                    [···]  │
├────────────────────────────────────────┤
│                                        │
│   $41,540                    +15%      │
│                              ↑         │
│                                        │
│   ────────────────────────────────     │
│   Order Payments         $26,800       │
│   Deposits               $10,400       │
│   Refunds                -$4,340       │
│   ────────────────────────────────     │
│   Net Revenue            $32,860       │
└────────────────────────────────────────┘
```

---

### Section 3: Retention Graph (NEW)

```
┌────────────────────────────────────────┐
│ Retention                  42%  [···]  │
├────────────────────────────────────────┤
│   ▲                                    │
│   │    ╱╲                              │
│   │   ╱  ╲     ╱╲                      │
│   │  ╱    ╲   ╱  ╲                     │
│   │ ╱      ╲ ╱    ╲__                  │
│   └────────────────────────────────►   │
│    Jan  Feb  Mar  Apr  May  Jun  Jul   │
└────────────────────────────────────────┘
```

**Calculation**: % of customers who made repeat orders within 30 days

---

### Section 4: Transactions Summary Card (Enhanced)

```
┌────────────────────────────────────────┐
│ Transactions               Peak: Wed   │
├────────────────────────────────────────┤
│                                        │
│   106k                      ▄ ▅ █ ▃ ▂  │
│                            (sparkline) │
│   +34,002 vs last period               │
└────────────────────────────────────────┘
```

Mini sparkline showing daily transaction volume with peak day indicator.

---

### Section 5: Customers Growth Card (Enhanced)

```
┌────────────────────────────────────────┐
│ Customers            Highest: Thu      │
├────────────────────────────────────────┤
│                                        │
│   1,284                    ╱╲ ╱╲       │
│                           ╱  ╲╱        │
│   +320 vs last period                  │
└────────────────────────────────────────┘
```

---

### Section 6: Insights Card (NEW - Key Feature)

Large contextual insight with auto-generated recommendations:

```
┌────────────────────────────────────────────────────────────────────┐
│  ✨ Insights                                                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│        ┌─────────────┐                                             │
│        │             │                                             │
│        │     75%     │     Authorization rate increased            │
│        │             │     by 4% compared to last week.            │
│        └─────────────┘                                             │
│                            This improvement reduced failed         │
│                            transactions by 950 and is projected    │
│                            to recover $12,400.                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Auto-generated insights based on**:
- Revenue trend (up/down > 10%)
- Order success rate changes
- Customer churn/growth patterns
- Peak activity patterns

---

## Implementation Details

### New Components to Create

1. **PaymentsFunnelCard** - Horizontal funnel with step-by-step visualization
2. **GrossVolumeCard** - Revenue breakdown with net calculation
3. **RetentionChart** - Mini area chart with percentage overlay
4. **TransactionsSummaryCard** - Compact card with sparkline
5. **CustomersSummaryCard** - Compact card with trend line
6. **InsightsCard** - AI-like contextual recommendations
7. **ComparisonDatePicker** - Dual date range selector

### New Analytics Calculations

Add to `analytics-utils.ts`:

```typescript
// Retention rate: repeat customers / total customers
export function calculateRetentionRate(orders, customers)

// Order success rate: completed / total
export function calculateSuccessRate(orders)

// Drop-off rate between stages
export function calculateDropOffRate(stage1Count, stage2Count)

// Generate contextual insights
export function generateInsights(stats, prevStats)

// Format compact numbers (1.2K, 34M)
export function formatCompactNumber(num)
```

### Layout Grid (Zentra-style)

```
┌─────────────────────────────────────┬─────────────────────┐
│                                     │                     │
│        Payments Funnel Card         │   Gross Volume      │
│        (spans 2 columns)            │                     │
│                                     │                     │
├─────────────┬───────────────────────┼─────────────────────┤
│             │                       │                     │
│  Retention  │    Transactions       │     Insights        │
│    42%      │       106k            │       75%           │
│             │                       │                     │
├─────────────┼───────────────────────┤                     │
│             │                       │                     │
│  Customers  │   (existing charts    │                     │
│   1,284     │    below the fold)    │                     │
│             │                       │                     │
└─────────────┴───────────────────────┴─────────────────────┘
```

---

## Mobile-Responsive Considerations

- Cards stack vertically on mobile
- Funnel becomes vertical on mobile (steps stacked)
- Sparklines remain visible but smaller
- Swipeable sections for quick access
- Bottom sheet for date picker on mobile

---

## Data Sources (Using Existing Supabase Data)

| Metric | Source |
|--------|--------|
| Initiated Orders | `orders` where status = 'pending' |
| Authorized Orders | `orders` where status = 'processing' |
| Successful Payments | `orders` where status = 'completed' |
| Requires Attention | `orders` where status = 'partial' |
| Gross Volume | Sum of `orders.price` |
| Deposits | `transactions` where type = 'deposit' |
| Refunds | `orders` where status = 'refunded' OR `transactions` type = 'refund' |
| Retention | Customers with 2+ orders / total customers |
| Transaction Volume | `transactions` count |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/Analytics.tsx` | Complete UI overhaul with new layout |
| `src/lib/analytics-utils.ts` | Add retention, drop-off, insights functions |

### New Components to Create

| Component | Purpose |
|-----------|---------|
| `src/components/analytics/PaymentsFunnelCard.tsx` | Order flow funnel |
| `src/components/analytics/GrossVolumeCard.tsx` | Revenue breakdown |
| `src/components/analytics/InsightsCard.tsx` | Contextual recommendations |
| `src/components/analytics/MiniSparkline.tsx` | Inline sparkline chart |
| `src/components/analytics/RetentionCard.tsx` | Retention trend |
| `src/components/analytics/CompactStatCard.tsx` | Transactions/Customers cards |

---

## Color Scheme (Matching Reference)

- Funnel bars: Blue gradient (light to dark)
- Gross Volume: Green for positive, red for refunds
- Retention line: Pink/coral color
- Insights card: Green gradient border/glow
- Background: Light mode friendly with subtle shadows

---

## Comparison Feature

Add "compared to" date picker:
- Default: Compare current period to previous period
- Shows +/- delta for each metric
- Visual indicators (green up, red down)

---

## Implementation Priority

1. **Phase 1**: Layout restructure + Payments Funnel Card
2. **Phase 2**: Gross Volume + Compact stat cards (Transactions, Customers)
3. **Phase 3**: Insights Card with auto-generated recommendations
4. **Phase 4**: Retention chart + Comparison date picker
5. **Phase 5**: Mobile optimization + polish

---

## Expected Outcome

After implementation, panel owners will:
- See order funnel drop-offs at a glance
- Understand net revenue vs gross (accounting for refunds)
- Get AI-like contextual insights (e.g., "Authorization up 4%")
- Compare periods easily
- Identify peak days and patterns
- Make faster decisions with less data interpretation

