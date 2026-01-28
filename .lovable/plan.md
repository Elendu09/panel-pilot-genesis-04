
# Plan: Fix Integration Icons, Customer Stats Filtering, API Key Sync, Blog Navigation & Mobile Preview

## Issues Identified & Solutions

### Issue 1: Analytics & Notification Widget Icons Still Need Enhancement

**Current Problem:** Looking at lines 819-825 (Analytics) and 873-878 (Notifications), the icon rendering uses `React.cloneElement` with `fill="white"` but specifically excludes multi-color icons like Google Analytics, GTM, Yandex, and OneSignal. However, the icons are still not rendering correctly on their colored backgrounds because:

1. The background colors match the icon's default fill colors (e.g., Google Analytics yellow on yellow background)
2. The exclusion list is correct, but the icons need to be rendered with white fills for visibility

**Root Cause Analysis:**
- `GoogleAnalyticsIcon` has paths with fills `#F9AB00` and `#E37400` - on `bg-[#F9AB00]` background, these become invisible
- `GoogleTagManagerIcon` has multi-color paths that don't work with simple fill override
- `YandexMetrikaIcon` uses `#FC3F1D` on `bg-[#FC3F1D]` - invisible
- `OneSignalIcon` uses gradient fills

**Solution:** For these multi-color icons on matching colored backgrounds, we need to render simplified white versions instead. Update the IntegrationIcons to support a `forceFill` prop that overrides all paths.

**Files to modify:**
- `src/components/icons/IntegrationIcons.tsx` - Add white-only variants for Analytics and Notification icons
- `src/pages/panel/Integrations.tsx` - Update rendering to use white fills for all icons on colored backgrounds

---

### Issue 2: Customer Management Statistics - Clickable Filter Cards

**Current Problem:** Looking at the reference image and current implementation (lines 766-790), user wants:
1. Remove the `CustomerStatusTabs` component duplication (currently showing at line 807-815)
2. Make the stat cards clickable to filter customers (like `CustomerStatusTabs` does)
3. Keep the 2-column, 3-row colored grid layout

**Reference Image Analysis:**
- Shows 3 colored cards: "All Customers" (blue), "Online Now" (green), "Banned" (red)
- Cards have rounded corners, icons, and prominent numbers
- Cards are clickable to filter

**Solution:** 
1. Remove the duplicate `CustomerStatusTabs` component at lines 807-815
2. Convert stat cards into clickable filter buttons that set `statusFilter`
3. Add visual selection state (border/ring) to indicate active filter
4. Expand filter options: All, Online, Active, Suspended, Banned, VIP

**Files to modify:**
- `src/pages/panel/CustomerManagement.tsx` - Make stats clickable, remove duplicate tabs

---

### Issue 3: API Key Generation Must Work with Buyer API

**Current Problem:** Looking at:
- `BuyerProfile.tsx` lines 162-184: Generates key and saves to `client_users.api_key`
- `supabase/functions/buyer-api/index.ts` lines 95-100: Validates key against `panel_api_keys` table

**Root Cause:** The buyer API key is being saved to `client_users.api_key` but the API function checks `panel_api_keys.api_key`. These are different tables!

**Solution:**
The buyer-api function needs to also check `client_users.api_key` for buyer-level API keys, or the profile should save to `panel_api_keys`. Based on the architecture:
- Panel owners use `panel_api_keys` (panel-level API)
- Buyers use `client_users.api_key` (buyer-level API)

Update `buyer-api/index.ts` to:
1. First check `panel_api_keys` for panel-level keys
2. If not found, check `client_users.api_key` for buyer-level keys
3. Return appropriate panel_id and buyer_id based on which key was found

**Files to modify:**
- `supabase/functions/buyer-api/index.ts` - Add client_users.api_key validation

---

### Issue 4: Blog Not Showing in Tenant Storefront Navigation

**Current State Analysis:**
- `Storefront.tsx` line 168: Correctly passes `showBlogInMenu: customBranding?.showBlogInMenu ?? (panel as any)?.blog_enabled ?? false`
- `TGRefHomepage.tsx` line 87: Uses `const showBlogInMenu = customization.showBlogInMenu ?? false;` - This is correct
- `ThemeNavigation.tsx` line 78: Uses `showBlogInMenu` in defaultLinks array - This is correct

**Root Cause Investigation:**
Looking at the flow:
1. Panel owner enables blog in Blog Management → sets `panels.blog_enabled = true`
2. Storefront reads this and passes to `fullCustomization`
3. Theme homepage reads `customization.showBlogInMenu`
4. ThemeNavigation renders Blog link if `showBlogInMenu = true`

**Potential Issues:**
1. The `panel` object might not include `blog_enabled` in the SELECT query
2. The type casting `(panel as any)?.blog_enabled` suggests the field isn't in the type definition

**Solution:** Check the panel fetch query in Storefront.tsx and ensure `blog_enabled` is selected.

**Files to check/modify:**
- `src/pages/Storefront.tsx` - Verify panel query includes blog_enabled
- `src/hooks/useTenant.tsx` - Check if blog_enabled is fetched

---

### Issue 5: Website Preview Not Loading on Mobile

**Current Analysis:** Looking at `LiveStorefrontPreview.tsx`:
- Lines 32-40: Mobile viewport detection exists
- Lines 52-61: Uses `100%` width on mobile
- Lines 208-217: Sets `minHeight: 300px` on mobile

**Potential Issues:**
1. The parent container might have `overflow: hidden` cutting off the iframe
2. The `height: min(400px, 60vh)` might be too restrictive
3. The flex container might not have proper height on mobile

**Solution:** 
1. Ensure parent has proper height
2. Use `min-h-[400px]` instead of CSS calc
3. Add explicit height to the preview container
4. Consider using a simpler layout on mobile

**Files to modify:**
- `src/components/design/LiveStorefrontPreview.tsx` - Fix mobile height/overflow issues

---

## Implementation Details

### Part 1: Fix Analytics & Notification Icons

Add a helper function to render icons with conditional white fills:

```typescript
const renderIconWithFill = (service: ServiceIntegration, forceWhite: boolean = true) => {
  // Multi-color icons that need special handling - render a simple white version
  const multiColorIcons = ['google_analytics', 'google_tag_manager', 'yandex_metrika', 'onesignal', 'jivochat', 'getbutton'];
  
  if (multiColorIcons.includes(service.id)) {
    // For multi-color icons on colored backgrounds, use a generic white icon
    return <BarChart3 className="w-5 h-5 text-white" />; // For analytics
    // or <Bell className="w-5 h-5 text-white" />; // For notifications
  }
  
  // For single-color icons, apply white fill
  if (React.isValidElement(service.icon)) {
    return React.cloneElement(service.icon as React.ReactElement<any>, { 
      fill: forceWhite ? "white" : undefined, 
      className: "w-5 h-5" 
    });
  }
  
  return service.icon;
};
```

### Part 2: Customer Stats Clickable Filtering

```typescript
// Updated stats array with filter values
const statsArr = [
  { title: "All Customers", value: customers.length, icon: Users, filter: "all", bgColor: "bg-blue-100", ... },
  { title: "Online Now", value: onlineCount, icon: Circle, filter: "online", bgColor: "bg-emerald-100", ... },
  { title: "Active", value: activeCount, icon: UserCheck, filter: "active", bgColor: "bg-green-100", ... },
  { title: "Suspended", value: suspendedCount, icon: UserX, filter: "suspended", bgColor: "bg-amber-100", ... },
  { title: "Banned", value: bannedCount, icon: Ban, filter: "banned", bgColor: "bg-red-100", ... },
  { title: "VIP Members", value: vipCount, icon: Crown, filter: "vip", bgColor: "bg-purple-100", ... },
];

// In render - make cards clickable
<Card 
  className={cn(
    "border-0 shadow-sm h-full cursor-pointer transition-all",
    stat.bgColor,
    statusFilter === stat.filter && "ring-2 ring-offset-2 ring-primary"
  )}
  onClick={() => setStatusFilter(stat.filter)}
>
```

### Part 3: Buyer API Key Authentication

```typescript
// In buyer-api/index.ts - add client_users check
// First try panel_api_keys
const { data: panelKeyData } = await supabase
  .from('panel_api_keys')
  .select('panel_id, is_active')
  .eq('api_key', key)
  .eq('is_active', true)
  .maybeSingle();

if (panelKeyData) {
  // Panel-level key found
  panelId = panelKeyData.panel_id;
} else {
  // Try client_users for buyer-level key
  const { data: buyerKeyData } = await supabase
    .from('client_users')
    .select('id, panel_id')
    .eq('api_key', key)
    .maybeSingle();
  
  if (!buyerKeyData) {
    return errorResponse("Invalid API key");
  }
  
  panelId = buyerKeyData.panel_id;
  buyerId = buyerKeyData.id;
}
```

### Part 4: Blog Navigation Fix

Check Storefront panel query and ensure blog_enabled is included:

```typescript
// In Storefront.tsx or useTenant hook
const { data: panel } = await supabase
  .from('panels')
  .select('*, blog_enabled') // Ensure blog_enabled is selected
  .eq('subdomain', subdomain)
  .single();
```

### Part 5: Mobile Preview Fix

```typescript
// In LiveStorefrontPreview.tsx - update the preview container
<div 
  className={cn(
    "flex-1 p-2 md:p-4 overflow-auto flex items-start justify-center bg-[#1a1a2e]",
    isMobileViewport ? "min-h-[350px]" : "min-h-[500px]"
  )}
>
  <motion.div
    layout
    className="bg-background rounded-lg overflow-hidden shadow-2xl transition-all duration-300 w-full h-full"
    style={{
      width: "100%",
      maxWidth: isMobileViewport ? "100%" : getDeviceWidth(),
      minHeight: isMobileViewport ? "320px" : "500px",
    }}
  >
```

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/pages/panel/Integrations.tsx` | Fix icon rendering for analytics/notifications using generic white icons for multi-color brands |
| `src/pages/panel/CustomerManagement.tsx` | Make stats clickable with filter state, remove duplicate CustomerStatusTabs, add selection ring |
| `supabase/functions/buyer-api/index.ts` | Add client_users.api_key validation for buyer-level API keys |
| `src/pages/Storefront.tsx` or `src/hooks/useTenant.tsx` | Ensure blog_enabled is in panel query |
| `src/components/design/LiveStorefrontPreview.tsx` | Fix mobile height with explicit min-height and proper flex layout |

---

## Technical Notes

### API Key Flow
1. Buyer generates key in profile → saves to `client_users.api_key`
2. API request comes in with key → check `panel_api_keys` first, then `client_users`
3. If buyer key, associate requests with that specific buyer_id

### Stats Filter Mapping
- "all" → show all customers
- "online" → show customers where last_active within 5 minutes
- "active" → show customers where status = "active" AND is_banned = false
- "suspended" → show customers where status = "suspended" AND is_banned = false
- "banned" → show customers where is_banned = true
- "vip" → show customers where segment = "vip"

### Icon Approach
For multi-color branded icons on matching colored backgrounds, use Lucide fallback icons (BarChart3 for analytics, Bell for notifications) with white color to ensure visibility.
