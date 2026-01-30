
# Comprehensive Fix Plan: Services Limit, OAuth Profile, Email Verification, Announcement Modes, and Fast Order Mobile

## Executive Summary

This plan addresses five key issues:
1. **Services 1000 Limit Bug** - Supabase default limit preventing 2000+ services from showing
2. **OAuth Profile Settings** - Show connected OAuth providers when enabled in Integrations
3. **Email Verification** - Make verification actually functional in profile settings
4. **Announcement Modes** - Allow header (bar) or body (popup) placement
5. **Fast Order Mobile** - Fix login/signup widget sizing on mobile

---

## Issue 1: Services Limited to 1000 Rows (CRITICAL)

### Root Cause Analysis

**Supabase has a default row limit of 1000 rows on SELECT queries** to prevent abuse and network overload. This affects:

1. **`useTenantServices`** (lines 633-664 in `useTenant.tsx`):
   - No pagination or `.range()` - hits 1000 limit
   ```typescript
   const { data, error } = await supabase
     .from('services')
     .select('*')
     .eq('panel_id', panelId)
     .eq('is_active', true)
     .order('display_order', { ascending: true })
     .order('name');
   // No .range() = DEFAULT LIMIT 1000
   ```

2. **`useUnifiedServices`** (lines 140-145 in `useUnifiedServices.tsx`):
   - Also no pagination - same 1000 limit
   ```typescript
   const { data, error } = await supabase
     .from('services')
     .select('*')
     .eq('panel_id', panelId)
     .eq('is_active', true)
     .order('display_order', { ascending: true });
   // No .range() = DEFAULT LIMIT 1000
   ```

3. **`useBuyerServices`** (lines 110-116 in `useBuyerServices.tsx`):
   - Same issue - no explicit limit bypass
   ```typescript
   let query = supabase
     .from('services')
     .select('*')
     .eq('panel_id', panelId)
     .eq('is_active', true)
     .order('display_order', { ascending: true });
   // Only adds .limit() if options.limit is provided
   ```

### Solution: Fetch All Services with Pagination Loop

Create a utility function that fetches all services by paginating through the 1000-row limit:

```typescript
const PAGINATION_SIZE = 1000;

async function fetchAllServices(panelId: string): Promise<any[]> {
  let allData: any[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('panel_id', panelId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .range(from, from + PAGINATION_SIZE - 1);

    if (error) throw error;
    
    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += PAGINATION_SIZE;
      // If we got fewer than PAGINATION_SIZE, we've reached the end
      hasMore = data.length === PAGINATION_SIZE;
    } else {
      hasMore = false;
    }
  }

  return allData;
}
```

### Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useTenant.tsx` | Update `useTenantServices` to paginate through all services |
| `src/hooks/useUnifiedServices.tsx` | Update `fetchServices` to use pagination loop up to 10,000 |
| `src/hooks/useBuyerServices.tsx` | Update fetch to bypass 1000 limit for full category display |

---

## Issue 2: OAuth Provider Display in Profile Settings

### Current State

`BuyerProfile.tsx` already shows the connected OAuth provider (lines 519-536):
- Displays Google, Telegram, VK, Discord icons
- Shows "Connected via {provider}" message
- Badge shows "Connected" status

**What's Missing:**
- No way to connect additional OAuth providers from profile
- No indication of which OAuth providers are enabled by the panel

### Enhancement

Add a section showing available OAuth providers configured by the panel owner:

```typescript
// In BuyerProfile.tsx - Security section
{/* Available OAuth Providers */}
{!buyer?.oauth_provider && panelOAuthProviders.length > 0 && (
  <div className="p-4 rounded-xl bg-muted/30 space-y-3">
    <p className="text-sm font-medium">Connect Social Account</p>
    <div className="flex gap-2 flex-wrap">
      {panelOAuthProviders.map(provider => (
        <Button 
          key={provider.id}
          variant="outline" 
          size="sm"
          onClick={() => handleOAuthConnect(provider.id)}
        >
          {OAuthProviderIcons[provider.id]}
          <span className="ml-2 capitalize">{provider.id}</span>
        </Button>
      ))}
    </div>
  </div>
)}
```

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/buyer/BuyerProfile.tsx` | Fetch panel OAuth settings and show connect buttons |
| `src/hooks/useTenant.tsx` | Include OAuth provider configuration in tenant data |

---

## Issue 3: Email Verification Functionality

### Current State

`BuyerProfile.tsx` (lines 627-652) shows email verification status but the "Resend" button only shows a toast - it doesn't actually send anything.

### Solution

Implement actual email verification via the `buyer-auth` edge function:

```typescript
// In BuyerProfile.tsx
const handleResendVerification = async () => {
  setResendingVerification(true);
  try {
    const { data, error } = await supabase.functions.invoke('buyer-auth', {
      body: { 
        panelId: buyer.panel_id,
        buyerId: buyer.id,
        token: getToken(),
        action: 'resend-verification'
      }
    });
    
    if (error || data?.error) {
      throw new Error(data?.error || 'Failed to send verification');
    }
    
    toast({ 
      title: "Verification email sent!", 
      description: "Please check your inbox and spam folder." 
    });
  } catch (e) {
    toast({ 
      title: "Failed to send", 
      description: "Please try again later.",
      variant: "destructive" 
    });
  } finally {
    setResendingVerification(false);
  }
};
```

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/buyer/BuyerProfile.tsx` | Call edge function for email verification |
| `supabase/functions/buyer-auth/index.ts` | Add `resend-verification` action handler |

---

## Issue 4: Announcement Display Mode (Header vs Popup)

### Current State

Announcements only display as a top bar in the header via `AnnouncementBar.tsx`. User wants option to show as popup in body.

### Enhancement

Add a `displayMode` field to announcement configuration:

**Integrations.tsx - Add display mode field:**
```typescript
{
  id: 'announcements',
  name: 'Announcements',
  fields: [
    { type: 'input', name: 'title', label: 'Title', ... },
    { type: 'input', name: 'text', label: 'Description', ... },
    { 
      type: 'select', 
      name: 'displayMode', 
      label: 'Display Mode',
      options: [
        { value: 'header', label: 'Header Bar (top of page)' },
        { value: 'popup', label: 'Popup Dialog (center modal)' }
      ],
      default: 'header'
    },
    // ... other fields
  ]
}
```

**Create AnnouncementPopup component:**
```typescript
// src/components/storefront/AnnouncementPopup.tsx
const AnnouncementPopup = ({ id, title, text, linkText, linkUrl, ... }) => {
  const [dismissed, setDismissed] = useState(false);
  const storageKey = `announcementPopup_${id}_dismissed`;

  useEffect(() => {
    setDismissed(sessionStorage.getItem(storageKey) === 'true');
  }, []);

  if (!text || dismissed) return null;

  return (
    <Dialog open={!dismissed} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">{text}</p>
        {linkUrl && (
          <Button asChild>
            <a href={linkUrl} target="_blank">{linkText || 'Learn More'}</a>
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

**Storefront.tsx - Conditional rendering:**
```typescript
{announcementConfig.displayMode === 'popup' ? (
  <AnnouncementPopup {...announcementConfig} />
) : (
  <AnnouncementBar {...announcementConfig} />
)}
```

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/panel/Integrations.tsx` | Add `displayMode` select field to announcements |
| `src/components/storefront/AnnouncementPopup.tsx` | NEW: Create popup dialog component |
| `src/pages/Storefront.tsx` | Conditionally render bar or popup based on mode |

---

## Issue 5: Fast Order Mobile Login Widget Sizing

### Current State

The guest signup modal in `FastOrderSection.tsx` (line 1586) uses:
```typescript
<DialogContent className="max-w-[92vw] sm:max-w-md w-full overflow-hidden p-3 sm:p-6 mx-2 sm:mx-auto">
```

This should be responsive, but the internal content may overflow or appear cramped on small screens.

### Issues Identified

1. Modal step indicators are small but OK (lines 1588-1627)
2. Credential display boxes use `break-all` which is good
3. Some buttons use fixed heights that may not work on very small screens
4. Input fields have proper responsive sizing

### Enhancements

1. Add `max-h-[90vh] overflow-y-auto` to ensure modal doesn't overflow viewport
2. Reduce padding on extra-small screens
3. Ensure all buttons are properly sized for touch targets

```typescript
<DialogContent className="max-w-[95vw] sm:max-w-md w-full overflow-hidden p-2 xs:p-3 sm:p-6 mx-1 sm:mx-auto max-h-[90vh] overflow-y-auto">
```

### Files to Modify

| File | Change |
|------|--------|
| `src/components/storefront/FastOrderSection.tsx` | Improve modal sizing and add vertical scroll |

---

## Implementation Priority

| Priority | Issue | Impact |
|----------|-------|--------|
| **CRITICAL** | Services 1000 limit | All tenant storefronts affected |
| HIGH | Announcement modes | User requested feature |
| MEDIUM | Fast Order mobile sizing | UX improvement |
| MEDIUM | Email verification | Complete existing feature |
| LOW | OAuth profile display | Enhancement |

---

## Technical Implementation Details

### Pagination Helper Function

Add to `src/lib/supabase-utils.ts`:

```typescript
const SUPABASE_PAGE_SIZE = 1000;
const MAX_SERVICES = 10000;

export async function fetchAllPaginated<T>(
  queryBuilder: () => any,
  maxRows = MAX_SERVICES
): Promise<T[]> {
  let allData: T[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore && allData.length < maxRows) {
    const { data, error } = await queryBuilder()
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    if (error) throw error;
    
    if (data && data.length > 0) {
      allData = [...allData, ...data];
      from += SUPABASE_PAGE_SIZE;
      hasMore = data.length === SUPABASE_PAGE_SIZE;
    } else {
      hasMore = false;
    }
  }

  // Enforce maximum service limit
  return allData.slice(0, maxRows);
}
```

### Service Count Flow After Fix

```text
┌──────────────────────────────────────────────────────────────────┐
│                    SERVICES FETCH FLOW (AFTER FIX)                │
└──────────────────────────────────────────────────────────────────┘

Panel has 2,500 services in database
                │
                ▼
┌──────────────────────────────────────────────────────────────────┐
│  useUnifiedServices / useTenantServices                          │
│  Calls fetchAllPaginated() helper                                 │
└──────────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────┐
│  Page 1: .range(0, 999)                                          │
│  → Returns 1,000 services                                        │
│  → allData = 1,000                                               │
│  → hasMore = true (got 1000 = PAGE_SIZE)                         │
└──────────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────┐
│  Page 2: .range(1000, 1999)                                      │
│  → Returns 1,000 services                                        │
│  → allData = 2,000                                               │
│  → hasMore = true                                                │
└──────────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────┐
│  Page 3: .range(2000, 2999)                                      │
│  → Returns 500 services (only 2,500 total)                       │
│  → allData = 2,500                                               │
│  → hasMore = false (got 500 < 1000)                              │
└──────────────────────────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────────┐
│  Result: All 2,500 services returned                             │
│  → categoriesWithServices built correctly                        │
│  → All platforms shown in tenant storefront                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/supabase-utils.ts` | CREATE | Pagination helper for large datasets |
| `src/hooks/useUnifiedServices.tsx` | MODIFY | Use pagination to fetch all services |
| `src/hooks/useTenant.tsx` | MODIFY | Update useTenantServices with pagination |
| `src/hooks/useBuyerServices.tsx` | MODIFY | Add pagination support |
| `src/pages/panel/Integrations.tsx` | MODIFY | Add displayMode to announcements |
| `src/components/storefront/AnnouncementPopup.tsx` | CREATE | New popup component for announcements |
| `src/pages/Storefront.tsx` | MODIFY | Render bar or popup based on mode |
| `src/pages/buyer/BuyerProfile.tsx` | MODIFY | Real email verification, OAuth display |
| `src/components/storefront/FastOrderSection.tsx` | MODIFY | Improve mobile modal sizing |
| `supabase/functions/buyer-auth/index.ts` | MODIFY | Add resend-verification action |

---

## Testing Checklist

After implementation:
- [ ] Panel with 2,000+ services shows all services in tenant /services
- [ ] Fast Order shows all platforms/categories
- [ ] New Order shows all platforms/categories
- [ ] Announcement set to "popup" shows as modal dialog
- [ ] Announcement set to "header" shows as top bar
- [ ] Email verification "Resend" button sends actual email
- [ ] OAuth providers display in profile when enabled
- [ ] Fast Order login modal works on small mobile screens (320px width)
- [ ] Maximum 10,000 service limit is enforced
