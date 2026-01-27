
# Plan: Fix Integration Icons, Customer Management, Blog Navigation, Transaction Errors & Mobile Preview

## Issues Identified

### Issue 1: OAuth Integration Icons Not Showing White Fill
**Location:** `src/pages/panel/Integrations.tsx` lines 680-731
**Problem:** The OAuth section (Telegram, VK, Discord) icons are rendered directly without the `fill="white"` cloneElement treatment applied to other sections (Chat, Analytics, Notifications already have this fix).
**Solution:** Apply the same `React.cloneElement(icon, { fill: "white" })` pattern to OAuth icons.

---

### Issue 2: Customer Management Statistics Layout
**Location:** `src/pages/panel/CustomerManagement.tsx` lines 765-788
**Current:** Statistics cards use `grid-cols-2 lg:grid-cols-4` (2 columns on mobile, 4 on desktop)
**Problem:** With 6 stats cards, mobile shows 3 rows of 2 cards, pushing search below fold
**Solution:** 
1. Arrange statistics in horizontal scrollable row on mobile
2. Compact the 3 analytics sections (CustomerStatusTabs, CustomerOverview, SearchTable) into a unified view
3. Move search bar to header area for visibility without scrolling

---

### Issue 3: Blog Not Showing in Tenant Storefront Navigation
**Location:** Multiple theme homepages + `Storefront.tsx`
**Problem:** When `blog_enabled` is true in `panels` table, it should show Blog in navigation. The issue is:
- Buyer themes (TGRef, AliPanel, FlySMM, SMMStay, SMMVisit) use `customization.showBlogInMenu`
- The `fullCustomization` object in Storefront.tsx doesn't pass `showBlogInMenu` from the panel's `blog_enabled` field

**Solution:** In `Storefront.tsx`, add `showBlogInMenu: customBranding?.showBlogInMenu ?? panel?.blog_enabled ?? false` to the `fullCustomization` object.

---

### Issue 4: Transaction Error in Billing Deposit
**Location:** `src/pages/panel/Billing.tsx` and `src/components/billing/QuickDeposit.tsx`
**Problem:** The deposit flow calls `process-payment` edge function with panel owner's profile.id as `buyerId`, but transactions table expects proper handling for panel-owner deposits vs buyer deposits.
**Root Cause Analysis:** The `process-payment` function creates transactions with `panel_id` set but needs to ensure proper transaction record creation for panel owner balance deposits.
**Solution:** 
1. Ensure `handleDeposit` passes correct metadata for panel owner deposits
2. Add transaction type `panel_deposit` to metadata
3. Verify transaction record is created with correct fields

---

### Issue 5: Website Preview Not Loading on Mobile
**Location:** `src/components/design/LiveStorefrontPreview.tsx`
**Problem:** The iframe doesn't load on mobile because the component has `hidden md:block` or similar responsive hiding, OR the fixed widths make it invisible on small screens.
**Analysis:** Looking at lines 174-183, the preview uses fixed device widths (`desktop: 100%`, `tablet: 768px`, `mobile: 375px`) inside a container. On actual mobile devices, the parent container may be smaller than 375px width.
**Solution:**
1. Make the preview responsive on mobile - use `max-width: 100%` instead of fixed widths
2. Ensure the preview container itself isn't hidden on mobile devices
3. Consider showing a simplified mobile preview or "Open in new tab" option for small screens

---

## Implementation Details

### Part 1: Fix OAuth Integration Icons (White Fill)

**File:** `src/pages/panel/Integrations.tsx`
**Lines:** 695-698

**Current code:**
```tsx
<div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", provider.color)}>
  {provider.icon}
</div>
```

**Fixed code:**
```tsx
<div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl", provider.color)}>
  {React.isValidElement(provider.icon) 
    ? React.cloneElement(provider.icon as React.ReactElement<any>, { fill: "white", className: "w-5 h-5" })
    : provider.icon}
</div>
```

Special case for Google (which needs multi-color, not white):
```tsx
{provider.id === 'google' 
  ? provider.icon 
  : React.isValidElement(provider.icon) 
    ? React.cloneElement(provider.icon as React.ReactElement<any>, { fill: "white", className: "w-5 h-5" })
    : provider.icon}
```

---

### Part 2: Customer Management Statistics - Horizontal Layout

**File:** `src/pages/panel/CustomerManagement.tsx`
**Lines:** 765-788

**Changes:**
1. Use horizontal scrollable container on mobile for stats
2. Reduce stat card padding for compactness
3. Move search into header area

**New layout structure:**
```tsx
{/* Header with Search integrated */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
  <div className="flex-1">
    <h1 className="text-2xl md:text-3xl font-bold">Customer Management</h1>
    <p className="text-muted-foreground text-sm md:text-base">Manage your panel's customers</p>
  </div>
  {/* Mobile: Search inline with title */}
  <div className="flex flex-col sm:flex-row gap-2">
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="icon" onClick={fetchCustomers}><RefreshCw className="w-4 h-4" /></Button>
      <Button variant="outline" size="icon" onClick={() => setShowExportDialog(true)}><Download className="w-4 h-4" /></Button>
      <Button size="icon" onClick={() => setShowAddCustomerDialog(true)}><UserPlus className="w-4 h-4" /></Button>
    </div>
  </div>
</div>

{/* Stats - Horizontal Scroll on Mobile */}
<div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
  <div className="flex gap-3 min-w-max sm:grid sm:grid-cols-3 lg:grid-cols-6">
    {statsArr.map((stat, index) => (
      <Card key={index} className="bg-card/60 min-w-[140px] sm:min-w-0">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
          <p className="text-xl font-bold">{stat.value.toLocaleString()}</p>
        </CardContent>
      </Card>
    ))}
  </div>
</div>
```

---

### Part 3: Blog Navigation in All Themes

**File:** `src/pages/Storefront.tsx`
**Lines:** 157-167 (fullCustomization object)

**Current:**
```tsx
const fullCustomization = {
  ...design,
  logoUrl: customBranding?.logoUrl || panel?.logo_url,
  faviconUrl: customBranding?.faviconUrl || panel?.logo_url,
  companyName: customBranding?.companyName || panel?.name,
  primaryColor: customBranding?.primaryColor || panel?.primary_color || '#6366F1',
  secondaryColor: customBranding?.secondaryColor || panel?.secondary_color || '#8B5CF6',
  themeMode,
  setThemeMode,
};
```

**Fixed (add showBlogInMenu):**
```tsx
const fullCustomization = {
  ...design,
  logoUrl: customBranding?.logoUrl || panel?.logo_url,
  faviconUrl: customBranding?.faviconUrl || panel?.logo_url,
  companyName: customBranding?.companyName || panel?.name,
  primaryColor: customBranding?.primaryColor || panel?.primary_color || '#6366F1',
  secondaryColor: customBranding?.secondaryColor || panel?.secondary_color || '#8B5CF6',
  themeMode,
  setThemeMode,
  // Pass blog menu visibility from panel or customization
  showBlogInMenu: customBranding?.showBlogInMenu ?? panel?.blog_enabled ?? false,
};
```

---

### Part 4: Fix Transaction Error in Billing

**File:** `src/pages/panel/Billing.tsx`
**Lines:** 278-318 (handleDeposit function)

**Analysis:** The current implementation looks correct. The issue is likely in the edge function response handling or transaction creation.

**Enhanced error handling:**
```tsx
const handleDeposit = async (amount: number, method: string) => {
  if (!panel?.id || !profile?.id) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Panel or user session not available. Please refresh the page.'
    });
    return;
  }

  if (!method) {
    toast({
      variant: 'destructive',
      title: 'No payment method selected',
      description: 'Please select a payment method to continue.'
    });
    return;
  }

  setDepositLoading(true);
  try {
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: {
        gateway: method,
        amount,
        panelId: panel.id,
        userId: profile.id, // Changed from buyerId for panel owner context
        isOwnerDeposit: true, // Flag to indicate this is a panel owner deposit
        returnUrl: `${window.location.origin}/panel/billing?deposit=success`,
        cancelUrl: `${window.location.origin}/panel/billing?deposit=cancelled`,
        metadata: {
          type: 'panel_deposit',
          panelId: panel.id,
          panelName: panel.name
        }
      }
    });

    if (error) throw error;

    if (data?.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else if (data?.success) {
      toast({ title: 'Success', description: `Deposit of $${amount.toFixed(2)} initiated!` });
      fetchBillingData();
    } else {
      throw new Error(data?.error || 'Payment initialization failed');
    }
  } catch (error: any) {
    console.error('Error adding funds:', error);
    toast({ 
      variant: 'destructive', 
      title: 'Deposit Failed', 
      description: error.message || 'Failed to initiate deposit. Please check your payment gateway configuration.' 
    });
  } finally {
    setDepositLoading(false);
  }
};
```

---

### Part 5: Fix Website Preview on Mobile

**File:** `src/components/design/LiveStorefrontPreview.tsx`
**Lines:** 99-220

**Problem:** The preview component works on desktop but not mobile because:
1. The device sizes use fixed widths that may overflow small screens
2. No responsive fallback for very small viewports

**Solution - Add mobile-responsive preview:**
```tsx
// Add state for detecting actual mobile viewport
const [isMobileViewport, setIsMobileViewport] = useState(false);

useEffect(() => {
  const checkViewport = () => {
    setIsMobileViewport(window.innerWidth < 768);
  };
  checkViewport();
  window.addEventListener('resize', checkViewport);
  return () => window.removeEventListener('resize', checkViewport);
}, []);

// Update deviceSizes to be responsive
const getDeviceWidth = () => {
  if (isMobileViewport) {
    // On actual mobile, use percentage-based widths
    switch (device) {
      case "mobile": return "100%";
      case "tablet": return "100%";
      case "desktop": return "100%";
    }
  }
  // On desktop, use fixed preview widths
  return deviceSizes[device].width;
};
```

**Also show simplified message on mobile:**
```tsx
{/* Mobile viewport notice */}
{isMobileViewport && (
  <div className="p-4 bg-muted/30 border-b text-center">
    <p className="text-xs text-muted-foreground">
      Preview shown at {device === 'mobile' ? '100%' : 'scaled'} width. 
      <Button variant="link" className="px-1 text-xs" onClick={() => window.open(storefrontUrl, '_blank')}>
        Open full preview
      </Button>
    </p>
  </div>
)}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/Integrations.tsx` | Add white fill to OAuth icons (Google exception) |
| `src/pages/panel/CustomerManagement.tsx` | Horizontal scrollable stats, compact layout, search in header |
| `src/pages/Storefront.tsx` | Add `showBlogInMenu` to fullCustomization object |
| `src/pages/panel/Billing.tsx` | Enhanced error handling for deposits, better validation |
| `src/components/design/LiveStorefrontPreview.tsx` | Mobile viewport detection, responsive preview widths |

---

## Technical Summary

1. **OAuth Icons:** Apply `React.cloneElement(icon, { fill: "white" })` to Telegram, VK, Discord icons (skip Google to preserve multi-color)

2. **Customer Management:** 
   - Stats in horizontal scroll container with `overflow-x-auto` on mobile
   - Search moved to header for instant visibility
   - Reduced padding/margin for compact mobile view

3. **Blog Navigation:** Pass `showBlogInMenu: panel?.blog_enabled` in fullCustomization so all buyer themes receive it

4. **Transaction Error:** Add validation checks, better error messages, correct metadata for panel owner deposits

5. **Mobile Preview:** Detect viewport size, use percentage widths on mobile, show "open in new tab" option for small screens
