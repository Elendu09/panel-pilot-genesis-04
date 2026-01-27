
# Plan: API Dynamic Detection, Integration Icons, Customer Management & Settings Enhancement

## Issues Identified & Solutions

### Issue 1: API Base URL for Tenant Not Detecting Current Domain

**Current Problem (BuyerAPI.tsx lines 27-31):**
```typescript
const apiBaseUrl = panel?.custom_domain 
  ? `https://${panel.custom_domain}/api/v2`
  : panel?.subdomain 
    ? `https://${panel.subdomain}.homeofsmm.com/api/v2`
    : "https://yourpanel.homeofsmm.com/api/v2";
```

The code hardcodes `homeofsmm.com` instead of detecting the current platform domain.

**Solution:** Add dynamic domain detection similar to what was done in APIManagement.tsx:

```typescript
// Detect current platform domain dynamically
const getPlatformDomain = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join('.');
      if (['homeofsmm.com', 'smmpilot.online'].includes(rootDomain)) {
        return rootDomain;
      }
    }
    if (hostname.includes('localhost') || hostname.includes('lovable.app')) {
      return 'smmpilot.online';
    }
  }
  return 'smmpilot.online';
};

const platformDomain = getPlatformDomain();
const apiBaseUrl = panel?.custom_domain 
  ? `https://${panel.custom_domain}/api/v2`
  : panel?.subdomain 
    ? `https://${panel.subdomain}.${platformDomain}/api/v2`
    : `https://yourpanel.${platformDomain}/api/v2`;
```

**Files to modify:**
- `src/pages/buyer/BuyerAPI.tsx` - Add dynamic domain detection

---

### Issue 2: Integration Icons Not Showing Branded Icons

**Current Problem:** Icons are rendered inside colored containers (`service.color` class like `bg-[#26A5E4]`), but the SVG icons also have their own fill colors. When placed on a same-colored background, they become invisible.

**Root Cause (Integrations.tsx lines 764-766):**
```tsx
<div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-sm", service.color)}>
  {service.icon}
</div>
```

The icon has its own fill color (e.g., Telegram #26A5E4) matching the background (#26A5E4), making it invisible.

**Solution:** Pass `fill="white"` to icons when on colored backgrounds:

```tsx
<div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", service.color)}>
  {React.cloneElement(service.icon as React.ReactElement, { fill: "white" })}
</div>
```

**Files to modify:**
- `src/pages/panel/Integrations.tsx` - Update icon rendering in all 4 sections (OAuth, Chat, Analytics, Notifications, Other) to pass `fill="white"`

---

### Issue 3: Customer Management Statistics Missing Suspended Count

**Current Problem (CustomerManagement.tsx line 284):**
```typescript
const bannedCount = customers.filter(c => c.status === "suspended").length;
```

The code conflates "suspended" with "banned". Need separate counts:
- Suspended: `is_active = false` AND `is_banned = false`
- Banned: `is_banned = true`

**Solution:** Add separate suspended and banned statistics:

```typescript
const suspendedCount = customers.filter(c => c.status === "suspended" && !c.isBanned).length;
const bannedCount = customers.filter(c => c.isBanned === true).length;

const statsArr = [
  { title: "Total Customers", value: customers.length, ... },
  { title: "Online Now", value: onlineCount, ... },
  { title: "Active Users", value: customers.filter(c => c.status === "active" && !c.isBanned).length, ... },
  { title: "Suspended", value: suspendedCount, icon: UserX, color: "amber" },
  { title: "Banned", value: bannedCount, icon: Ban, color: "red" },
  { title: "VIP Members", value: customers.filter(c => c.segment === "vip").length, ... },
];
```

**Files to modify:**
- `src/pages/panel/CustomerManagement.tsx` - Add suspended/banned statistics separately

---

### Issue 4: Unsuspend/Activate Button Not Visible

**Root Cause Analysis:** Looking at `CustomerDetailPage.tsx` lines 122-128, the account status is determined correctly:

```typescript
const status = customer.isBanned 
  ? 'banned' 
  : customer.status === 'active' 
    ? 'active' 
    : 'suspended';
```

However, the issue is the radio button group allows changing from suspended to active (which unsuspends). The problem is when a user is suspended, the "Active" radio option should function as "Unsuspend".

**Solution:** Improve the UI labels in the account status section to make it clear:

```tsx
<RadioGroup value={accountStatus} onValueChange={handleStatusChange}>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="active" id="active" />
    <Label htmlFor="active" className="flex items-center gap-2">
      <UserCheck className="w-4 h-4 text-green-500" />
      Active {customer.status === 'suspended' && !customer.isBanned && '(Unsuspend)'}
    </Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="suspended" id="suspended" />
    <Label htmlFor="suspended" className="flex items-center gap-2">
      <UserX className="w-4 h-4 text-amber-500" />
      Suspended (Temporary)
    </Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="banned" id="banned" />
    <Label htmlFor="banned" className="flex items-center gap-2">
      <Ban className="w-4 h-4 text-red-500" />
      Banned (Permanent)
    </Label>
  </div>
</RadioGroup>
```

**Files to modify:**
- `src/components/customers/CustomerDetailPage.tsx` - Update radio labels to show "Unsuspend" when applicable

---

### Issue 5: Panel Dashboard - Rename "Add Service" to "Integrations"

**Current (PanelOverview.tsx lines 408-415):**
```typescript
const quickActions = [
  { title: "Add Service", icon: Plus, href: "/panel/services", ... },
  ...
];
```

**Solution:** Change to:
```typescript
const quickActions = [
  { title: "Integrations", icon: Plug, href: "/panel/integrations", ... },
  ...
];
```

**Files to modify:**
- `src/pages/panel/PanelOverview.tsx` - Update quick actions

---

### Issue 6: Billing Page - Remove Payment Methods Section

**Current Problem:** `PaymentMethodsQuickAccess` component is being rendered in the billing page (line 483), but user wants it removed as it's unnecessary.

**Solution:** Remove the `<PaymentMethodsQuickAccess />` component from the sidebar.

**Files to modify:**
- `src/pages/panel/Billing.tsx` - Remove PaymentMethodsQuickAccess component

---

### Issue 7: Transaction History Error

**Current Problem:** TransactionHistory component fetches transactions without proper panel_id filtering if not passed.

**Root Cause (TransactionHistory.tsx lines 104-107):**
```typescript
if (panelId) {
  query = query.eq('panel_id', panelId);
}
```

This means if `panelId` is undefined, ALL transactions are fetched (potential security/performance issue). Need to ensure panelId is always passed from Billing.tsx.

**Solution:** Update Billing.tsx to pass panel?.id to TransactionHistory:

```tsx
<TransactionHistory panelId={panel?.id} />
```

**Files to modify:**
- `src/pages/panel/Billing.tsx` - Ensure panelId is passed to TransactionHistory

---

### Issue 8: Settings Page Enhancement

**Current State:** GeneralSettings.tsx uses an Accordion layout with multiple sections (Panel Info, Panel Status, SEO, Ads, Legal). The UI is functional but could be more visually appealing.

**Enhancement Plan:**

1. **Add visual section icons with gradients**
2. **Improve spacing and card styling**
3. **Add a quick summary dashboard at top**
4. **Better organization of settings into clear categories**
5. **Add confirmation for maintenance mode toggle**

**New Structure:**
```text
┌─────────────────────────────────────────────┐
│ General Settings                    [Save]  │
├─────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│ │ SEO Score │ │ Status    │ │ Features  │   │
│ │    75%    │ │  Active   │ │   5/7     │   │
│ └───────────┘ └───────────┘ └───────────┘   │
│                                             │
│ ▼ Panel Information                         │
│   [Panel Name] [Support Email]              │
│   [Description]                             │
│                                             │
│ ▼ Panel Status                              │
│   [Maintenance Mode Toggle]                 │
│   [Registration Toggle]                     │
│                                             │
│ ▼ SEO & Meta Tags                           │
│   [Title] [Description] [Keywords]          │
│                                             │
│ ▼ Branding & Images                         │
│   [Logo] [Favicon] [OG Image]               │
│                                             │
│ ▼ Order Settings                            │
│   [Currency] [Min/Max Order]                │
│                                             │
│ ▼ Legal Pages                               │
│   [Terms of Service] [Privacy Policy]       │
└─────────────────────────────────────────────┘
```

**Files to modify:**
- `src/pages/panel/GeneralSettings.tsx` - Enhanced UI with better structure

---

## Files to Create/Modify Summary

| File | Action | Changes |
|------|--------|---------|
| `src/pages/buyer/BuyerAPI.tsx` | Modify | Add dynamic platform domain detection |
| `src/pages/panel/Integrations.tsx` | Modify | Pass `fill="white"` to icons on colored backgrounds |
| `src/pages/panel/CustomerManagement.tsx` | Modify | Add separate suspended/banned statistics |
| `src/components/customers/CustomerDetailPage.tsx` | Modify | Update radio labels to show "(Unsuspend)" when applicable |
| `src/pages/panel/PanelOverview.tsx` | Modify | Change "Add Service" to "Integrations" with route change |
| `src/pages/panel/Billing.tsx` | Modify | Remove PaymentMethodsQuickAccess, ensure panelId passed to TransactionHistory |
| `src/pages/panel/GeneralSettings.tsx` | Modify | Enhanced UI with visual improvements and better organization |

---

## Technical Details

### Domain Detection Function
```typescript
const getPlatformDomain = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join('.');
      if (['homeofsmm.com', 'smmpilot.online'].includes(rootDomain)) {
        return rootDomain;
      }
    }
    if (hostname.includes('localhost') || hostname.includes('lovable.app')) {
      return 'smmpilot.online';
    }
  }
  return 'smmpilot.online';
};
```

### Icon Fix Pattern
```tsx
// Before (invisible on colored background)
<div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", service.color)}>
  {service.icon}
</div>

// After (white icon on colored background)
<div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", service.color)}>
  {React.isValidElement(service.icon) 
    ? React.cloneElement(service.icon as React.ReactElement<any>, { fill: "white" })
    : service.icon}
</div>
```

### Stats Array Update
```typescript
const statsArr = [
  { title: "Total Customers", value: customers.length, change: statsChanges.total.value, trend: statsChanges.total.trend, icon: Users },
  { title: "Online Now", value: onlineCount, change: statsChanges.online.value, trend: "neutral", icon: Circle },
  { title: "Active", value: customers.filter(c => c.status === "active" && !c.isBanned).length, change: statsChanges.active.value, trend: statsChanges.active.trend, icon: UserCheck },
  { title: "Suspended", value: customers.filter(c => c.status === "suspended" && !c.isBanned).length, change: "+0", trend: "neutral", icon: UserX },
  { title: "Banned", value: customers.filter(c => c.isBanned === true).length, change: "+0", trend: "neutral", icon: Ban },
  { title: "VIP Members", value: customers.filter(c => c.segment === "vip").length, change: statsChanges.vip.value, trend: statsChanges.vip.trend, icon: Crown },
];
```

---

## Summary

This plan addresses:
1. **Dynamic API URL detection** - Detects platform domain automatically
2. **Integration icons visibility** - White icons on colored backgrounds
3. **Customer stats** - Separate suspended vs banned counts
4. **Unsuspend visibility** - Clear labeling when activating suspended users
5. **Dashboard quick actions** - Renamed to Integrations
6. **Billing cleanup** - Removed duplicate payment methods section
7. **Settings enhancement** - Improved visual organization and UX
