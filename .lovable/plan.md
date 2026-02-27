

# Plan: Verify Payment Flow, Update Dashboard Stats Cards

## Analysis

### Balance Update & Payment Flow
The webhook (`payment-webhook/index.ts`) and metadata fix (`process-payment/index.ts`) are already in place from prior edits. The critical chain is:
1. `process-payment` creates transaction with `metadata: { type: 'panel_deposit', ... }` -- **fixed in last edit**
2. Webhook receives callback, finds transaction, updates status to `completed`
3. Webhook checks `txMetadata.type` -- for deposits, credits `panels.balance` for owner, `client_users.balance` for buyers
4. Webhook checks `txMetadata.type === 'subscription'` -- updates `panels.subscription_tier` and `panel_subscriptions`

This flow is correctly implemented. If it's still not working, the issue is likely that the **webhook URL is not configured in the payment gateway dashboard** (e.g., Flutterwave, Paystack). The gateway needs to POST to:
```
https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/payment-webhook?gateway=flutterwave
```
This is a gateway-side configuration, not a code issue.

### Domain Configuration on Plan Upgrade
Already handled: `DomainSettings.tsx` shows `UpgradePrompt` when `panel.subscription_tier === 'free'`. When a subscription payment succeeds, the webhook updates `panels.subscription_tier` to `basic` or `pro`, which removes the upgrade prompt. No code changes needed.

### Dashboard Stats Cards (from screenshot)
The user's screenshot shows: **Total Revenue, Total Orders, Active Users, Conversion Rate** with colored icons. Current code shows: Total Revenue, Total Orders, **Active Services**, **Total Customers**. Need to update to match the screenshot.

## Changes

### 1. Update PanelOverview stats to match screenshot

**File: `src/pages/panel/PanelOverview.tsx`**

- Change `activeServices` stat card to **"Active Users"** (use `totalCustomers` count, which already queries `client_users`)
- Change `totalCustomers` stat card to **"Conversion Rate"** (calculated as `completedOrders / totalOrders * 100`)
- Update icons: Active Users gets `Users` icon with green gradient, Conversion Rate gets `Percent` icon with orange/amber gradient
- Keep the data sources the same (already querying real data)

Specific changes to `statsData` array (around line 364):
```typescript
const completedOrders = liveOrders.filter(o => o.status === 'completed').length;
const conversionRate = stats.totalOrders > 0 
  ? ((completedOrders / stats.totalOrders) * 100) 
  : 0;

const statsData = [
  {
    title: "Total Revenue",
    value: `$${stats.totalRevenue.toFixed(2)}`,
    change: changes.revenue.value,
    trend: changes.revenue.trend,
    icon: DollarSign,
    gradient: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500",
    href: "/panel/analytics"
  },
  {
    title: "Total Orders",
    value: stats.totalOrders.toLocaleString(),
    change: changes.orders.value,
    trend: changes.orders.trend,
    icon: ShoppingCart,
    gradient: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-500/10",
    textColor: "text-pink-500",
    href: "/panel/orders"
  },
  {
    title: "Active Users",
    value: stats.totalCustomers.toLocaleString(),
    change: changes.customers.value,
    trend: changes.customers.trend,
    icon: Users,
    gradient: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-500",
    href: "/panel/customers"
  },
  {
    title: "Conversion Rate",
    value: `${conversionRate.toFixed(0)}%`,
    change: changes.orders.value,
    trend: changes.orders.trend,
    icon: Percent,
    gradient: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-500",
    href: "/panel/analytics"
  },
];
```

Also add `Percent` to the imports from `lucide-react`.

### 2. Add `Percent` icon import

**File: `src/pages/panel/PanelOverview.tsx`** -- Add `Percent` to the lucide-react import line.

## Summary

| File | Change |
|------|--------|
| `src/pages/panel/PanelOverview.tsx` | Update stats cards to show Total Revenue, Total Orders, Active Users, Conversion Rate with matching icons/colors from screenshot |

**No webhook or edge function changes needed** -- the payment flow code is already correct. If balance still doesn't update after a successful gateway payment, the webhook URL must be configured in the payment provider's dashboard settings.

