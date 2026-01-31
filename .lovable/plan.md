
# Comprehensive Enhancement Plan: Analytics, Payment Management, and General Settings

## Issues Identified

### Issue 1: FAQ Tooltips Not Showing Information
**Current State**: The tooltips have been added with correct syntax but they are using `TooltipProvider` which requires a single child. In some cases, the Tooltip might not be rendering content properly.

**Root Cause**: Reviewing the code, the tooltips ARE correctly implemented with `TooltipProvider`, `Tooltip`, `TooltipTrigger`, and `TooltipContent`. The issue may be that:
- The tooltip content is too small/short to notice
- Hover detection isn't working on touch devices
- The `asChild` prop on `TooltipTrigger` might be causing issues with the small Info icons

**Fix**: Ensure all tooltips have visible content with proper hover states and increase touch target area.

---

### Issue 2: DepositStatusBanner Uses All Transactions (Not Panel-Specific)
**Current State** (Lines 43-47 of DepositStatusBanner.tsx):
```typescript
const { data: transactions, error } = await supabase
  .from('transactions')
  .select('amount, status, type')
  .eq('type', 'deposit');
// NO panel_id filter!
```

**Problem**: This fetches ALL deposits from the platform instead of just deposits for the specific tenant/panel.

**Fix**: Add proper tenant filtering using the `buyer_id` → `client_users` → `panel_id` relationship, or filter via `panel_id` if available on transactions.

---

### Issue 3: Analytics/Payment Analytics Don't Update When Balance Adjusted via Customer Management
**Current State**: Customer Management directly updates `client_users.balance` but there's no real-time subscription to trigger analytics refresh.

**Fix**: 
1. Add Supabase real-time subscription in DepositStatusBanner that also listens to `client_users` balance changes
2. Ensure transactions created during balance adjustment include proper `panel_id` for filtering
3. Add refetch callback that can be triggered from Customer Management

---

### Issue 4: Payment Methods Tab Needs Enhanced Kanban Listview Style
**Current State**: Uses `PaymentMethodRow` component with simple list styling.

**User Request**: Wants a more enhanced "Kanban Listview Style" similar to what's shown in the reference images - cleaner, with category sections visible.

**Fix**: Enhance the payment methods list with:
- Visual category dividers with icons
- Hoverable cards instead of plain rows
- Status indicators with animation
- Better spacing and hierarchy

---

### Issue 5: Ad Display Missing from Panel Owner Settings
**Current State**: According to the memory `constraints/no-custom-ad-html`, custom HTML ad insertion was removed. However, the user wants a simple enable/disable toggle for tenant ads (platform-controlled), not custom HTML.

**Fix**: Add an "Advertising" accordion section in GeneralSettings with:
- Toggle to enable/disable Free Tier Banner display in tenant storefront
- Simple on/off control (no custom HTML)

---

### Issue 6: Overall UI Enhancement for GeneralSettings Page
**Current State**: The page is functional but could use:
- Better visual hierarchy
- More modern accordion styling
- Enhanced save button feedback
- Better mobile responsiveness
- Status indicators for each section

---

## Implementation Plan

### Part 1: Fix FAQ Tooltips

**Files to Modify**:
- `src/components/analytics/TopStatCard.tsx`
- `src/components/analytics/GrossVolumeCard.tsx`
- `src/components/analytics/InsightsCard.tsx`
- `src/components/analytics/CompactStatCard.tsx`
- `src/components/analytics/RetentionCard.tsx`

**Changes**:
1. Wrap each card component in a single `TooltipProvider` at the component level
2. Remove `asChild` from small Info icons and use direct children
3. Add explicit `delayDuration={0}` for instant tooltip display
4. Increase Info icon size slightly for better touch targets
5. Add `sideOffset` for better positioning

```typescript
// Updated tooltip pattern:
<TooltipProvider delayDuration={0}>
  <Tooltip>
    <TooltipTrigger>
      <Info className="w-4 h-4 text-muted-foreground/60 cursor-help hover:text-muted-foreground transition-colors" />
    </TooltipTrigger>
    <TooltipContent side="top" sideOffset={4}>
      <p className="text-xs max-w-[220px]">{tooltip}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

### Part 2: Fix DepositStatusBanner to Use Tenant Data

**File**: `src/components/analytics/DepositStatusBanner.tsx`

**Changes**:
1. Fetch transactions by joining with `client_users` to get only panel-specific deposits
2. Add `panel_id` filter to the query
3. Update subscription to filter by relevant buyer IDs

```typescript
const fetchStats = async () => {
  if (!panelId) return;
  
  try {
    // Get buyers for this panel first
    const { data: panelBuyers } = await supabase
      .from('client_users')
      .select('id')
      .eq('panel_id', panelId);
    
    const buyerIds = panelBuyers?.map(b => b.id) || [];
    
    if (buyerIds.length === 0) {
      // No buyers = no deposits for this panel
      setStats({ completedCount: 0, completedAmount: 0, ... });
      return;
    }
    
    // Fetch deposits only for this panel's buyers
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, status, type, buyer_id')
      .eq('type', 'deposit')
      .in('buyer_id', buyerIds);
    
    // ... rest of processing
  }
};
```

---

### Part 3: Add Real-time Sync for Balance Adjustments

**Files to Modify**:
- `src/components/analytics/DepositStatusBanner.tsx`
- `src/pages/panel/Analytics.tsx`

**Changes**:

1. **DepositStatusBanner**: Subscribe to `client_users` table changes as well:
```typescript
useEffect(() => {
  fetchStats();

  // Listen to both transactions AND balance changes
  const channel = supabase
    .channel('deposit-analytics-sync')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'transactions',
    }, fetchStats)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'client_users',
    }, fetchStats)
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [panelId]);
```

2. **Analytics.tsx**: Add real-time subscription to refetch analytics when transactions or balances change.

---

### Part 4: Enhanced Kanban Listview for Payment Methods

**Files to Modify**:
- `src/pages/panel/PaymentMethods.tsx`
- `src/components/billing/PaymentMethodRow.tsx`

**Changes**:

1. **PaymentMethodRow.tsx** - Enhance with Kanban card styling:
```typescript
<button className={cn(
  "w-full flex items-center gap-4 p-4 rounded-xl",
  "bg-card/50 backdrop-blur-sm border border-border/30",
  "hover:bg-card/80 hover:shadow-lg hover:-translate-y-0.5",
  "transition-all duration-300 text-left group"
)}>
  <div className={cn(
    "w-12 h-12 flex items-center justify-center rounded-xl",
    "bg-gradient-to-br from-muted/80 to-muted/40",
    "group-hover:scale-110 transition-transform shadow-sm"
  )}>
    {icon}
  </div>
  <div className="flex-1 min-w-0">
    <span className="font-semibold text-foreground block">{name}</span>
    {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
  </div>
  <div className="flex items-center gap-3">
    {enabled !== undefined && (
      <div className={cn(
        "w-3 h-3 rounded-full shadow-sm transition-all",
        enabled 
          ? "bg-emerald-500 ring-4 ring-emerald-500/20" 
          : "bg-muted-foreground/30"
      )} />
    )}
    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
  </div>
</button>
```

2. **PaymentMethods.tsx** - Add category icons and visual dividers:
```typescript
{/* Manual Methods Section */}
<div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
    <Banknote className="w-4 h-4 text-emerald-500" />
  </div>
  <span className="text-sm font-medium text-foreground">Manual Methods</span>
  <Badge variant="outline" className="ml-auto">{manualPayments.length}</Badge>
</div>

{/* Payment Gateways Section */}
<div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 mt-4">
  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
    <CreditCard className="w-4 h-4 text-primary" />
  </div>
  <span className="text-sm font-medium text-foreground">Payment Gateways</span>
  <Badge variant="outline" className="ml-auto">{filteredGateways.length}</Badge>
</div>
```

---

### Part 5: Add Advertising Section to GeneralSettings

**File**: `src/pages/panel/GeneralSettings.tsx`

**Changes**:

1. Add `showFreeTierBanner` to settings state:
```typescript
const [settings, setSettings] = useState({
  // ... existing settings
  showFreeTierBanner: true, // NEW: Enable/disable free tier ad banner
});
```

2. Add new Accordion section for "Advertising":
```typescript
{/* Advertising Settings - NEW */}
<AccordionItem
  value="advertising"
  className="border border-border rounded-xl bg-gradient-card overflow-hidden"
>
  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/30">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
        <Megaphone className="w-5 h-5 text-amber-500" />
      </div>
      <div className="text-left">
        <h3 className="font-semibold">Advertising</h3>
        <p className="text-sm text-muted-foreground">
          Control promotional banners on your storefront
        </p>
      </div>
    </div>
  </AccordionTrigger>
  <AccordionContent className="px-6 pb-6">
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
        <div className="space-y-0.5">
          <Label className="flex items-center gap-2">
            Free Tier Banner
            <Badge variant="outline" className="text-xs">Platform</Badge>
          </Label>
          <p className="text-sm text-muted-foreground">
            Show promotional banner to buyers on subdomain storefronts
          </p>
        </div>
        <Switch
          checked={settings.showFreeTierBanner}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, showFreeTierBanner: checked })
          }
        />
      </div>
      
      <div className="p-4 rounded-lg bg-info/10 border border-info/20">
        <p className="text-sm text-info">
          <strong>Note:</strong> The Free Tier Banner is controlled by the platform and 
          displays on subdomain storefronts. Custom domains do not show this banner.
          Custom HTML ads are not supported for security reasons.
        </p>
      </div>
    </div>
  </AccordionContent>
</AccordionItem>
```

3. Save the setting to panel settings and load on page mount.

---

### Part 6: Overall UI Enhancement for GeneralSettings

**File**: `src/pages/panel/GeneralSettings.tsx`

**Changes**:

1. **Enhanced Header Section**:
```typescript
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-card via-card/95 to-card rounded-xl border border-border/50 shadow-lg">
  <div>
    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
      General Settings
    </h1>
    <p className="text-muted-foreground text-sm md:text-base mt-1">
      Configure your panel's settings, SEO, branding, and advertising
    </p>
  </div>
  <Button
    onClick={handleSave}
    disabled={saving}
    size="lg"
    className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all gap-2"
  >
    {saving ? (
      <RefreshCw className="w-4 h-4 animate-spin" />
    ) : (
      <Save className="w-4 h-4" />
    )}
    {saving ? 'Saving...' : 'Save All Settings'}
  </Button>
</div>
```

2. **Add section completion indicators** to accordion headers:
```typescript
// In each AccordionTrigger, add completion badge
<Badge 
  variant="outline" 
  className={cn(
    "ml-auto text-xs",
    isSectionComplete ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted"
  )}
>
  {isSectionComplete ? '✓ Complete' : 'Incomplete'}
</Badge>
```

3. **Improve accordion visual hierarchy** with better hover states and transitions

4. **Add floating save indicator** that appears when changes are unsaved

---

## Files to Create

None required.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/analytics/TopStatCard.tsx` | Fix tooltip rendering with proper TooltipProvider setup |
| `src/components/analytics/GrossVolumeCard.tsx` | Fix tooltip, add instant display |
| `src/components/analytics/InsightsCard.tsx` | Fix tooltip |
| `src/components/analytics/CompactStatCard.tsx` | Fix tooltip |
| `src/components/analytics/RetentionCard.tsx` | Fix tooltip |
| `src/components/analytics/DepositStatusBanner.tsx` | Add panel_id filter for tenant-specific data, add client_users subscription |
| `src/pages/panel/Analytics.tsx` | Add real-time subscription for balance changes |
| `src/pages/panel/PaymentMethods.tsx` | Enhance payment methods list with Kanban-style cards and category headers |
| `src/components/billing/PaymentMethodRow.tsx` | Upgrade to glassmorphic Kanban card styling |
| `src/pages/panel/GeneralSettings.tsx` | Add Advertising section with toggle, enhance overall UI, add section indicators |

---

## Technical Notes

### Tenant Data Filtering
The key issue with DepositStatusBanner is that transactions don't have a direct `panel_id` column. The relationship is:
- `transactions.buyer_id` → `client_users.id`
- `client_users.panel_id` → panel

So we need to:
1. First fetch `client_users` IDs for the panel
2. Then filter transactions by those buyer IDs

### Real-time Sync Strategy
To ensure analytics update when Customer Management adjusts balances:
1. Subscribe to `client_users` UPDATE events
2. Also subscribe to `transactions` INSERT/UPDATE events
3. Debounce refetch calls to prevent excessive queries

### Advertising Toggle Logic
The `showFreeTierBanner` setting will be stored in `panels.settings.advertising.showFreeTierBanner` and read by the buyer-facing storefront components to conditionally render the FreeTierBanner.
