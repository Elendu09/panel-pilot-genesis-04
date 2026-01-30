

# Comprehensive Fix Plan: Light Mode, Announcements, and Services Improvements

## Executive Summary

This plan addresses three major areas:
1. **Design Customization Light Mode** - Fix for mobile/tablet preview backgrounds, cards, and text visibility
2. **Announcements Integration** - Enhanced configuration with visual diagram of how it renders
3. **Services Management & Tenant Display** - Fix categorization issues and ensure all 70+ categories render correctly

---

## Issue 1: Design Customization Light Mode Not Working on Mobile/Tablet

### Current Problem
When light mode is toggled in Design Customization:
- On mobile/tablet view (via MobileDesignSlider), the preview background stays dark
- Card backgrounds remain dark
- Text contrast is poor in light mode
- Only a few elements change color

### Root Cause Analysis
1. **MobileDesignSlider.tsx (line 128, 275-288)**: Uses hardcoded `bg-slate-950`, `bg-slate-900`, `bg-slate-800` classes regardless of `previewThemeMode`
2. **Preview container** (line 276-278): Only adds a ring/shadow style based on theme mode but doesn't change the actual background color class sufficiently
3. **Controls area** (line 320, 331, 353): All use hardcoded dark backgrounds (`bg-slate-900`, `bg-slate-800`)

### Solution

Update `src/components/design/MobileDesignSlider.tsx` to conditionally apply light or dark styling:

```text
Lines to change:
- Line 128: Container background
- Lines 130-155: Top bar and toggle buttons
- Lines 204-211: Section info bar
- Lines 275-292: Preview container
- Lines 310-393: Controls mode section (navigation, dots, content area)
```

Key changes:
- Add `previewThemeMode` condition checks throughout the component
- Change backgrounds to `bg-white` or `bg-slate-50` when light mode
- Change text colors from `text-slate-*` to `text-slate-700` (dark on light) when light mode
- Change borders from `border-slate-700` to `border-slate-200` when light mode

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/design/MobileDesignSlider.tsx` | Add comprehensive light/dark mode conditional styling throughout the component |

---

## Issue 2: Announcements Integration Enhancement

### Current State
The announcements integration in `Integrations.tsx` has these fields:
- text (Announcement Text)
- linkText (Link Text)
- linkUrl (Link URL)
- backgroundColor
- textColor

But it's missing a clear `enabled` flag being saved, and there's no visual title field.

### Announcement Rendering Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        ANNOUNCEMENT BAR RENDERING FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

Panel Owner Dashboard                    Database                     Tenant Storefront
─────────────────────                    ────────                     ─────────────────

┌────────────────────┐
│  Integrations.tsx  │
│  ─────────────────  │
│  Panel owner fills │
│  announcement form │
│  fields:           │
│  • Title           │◄─────────NEW
│  • Description     │◄─────────NEW  
│  • Link Text       │
│  • Link URL        │
│  • Background Color│
│  • Text Color      │
│  • Icon selection  │◄─────────NEW
└────────┬───────────┘
         │
         │ saveServiceConfig()
         │ Sets enabled: true when saved
         │
         ▼
┌────────────────────┐
│   panel_settings   │
│   ───────────────  │
│   {                │
│     integrations: {│
│       announcements│
│       : {          │
│         enabled,   │
│         title,     │◄───NEW
│         text,      │
│         linkText,  │
│         linkUrl,   │
│         bgColor,   │
│         textColor, │
│         icon       │◄───NEW
│       }            │
│     }              │
│   }                │
└────────┬───────────┘
         │
         │ Supabase query
         │
         ▼
┌────────────────────┐
│   Storefront.tsx   │
│   ──────────────── │
│   Lines 164-171:   │
│   Extracts config  │
│   from panel_      │
│   settings.        │
│   integrations.    │
│   announcements    │
└────────┬───────────┘
         │
         │ Pass props
         │
         ▼
┌─────────────────────────────────────┐
│        AnnouncementBar.tsx          │
│        ────────────────────         │
│ Props received:                      │
│   • enabled (boolean)               │
│   • title (NEW)                     │
│   • text (description)              │
│   • linkText                        │
│   • linkUrl                         │
│   • backgroundColor                 │
│   • textColor                       │
│   • icon (NEW)                      │
│                                      │
│ Render logic:                        │
│   1. Check enabled && text exists   │
│   2. Check sessionStorage dismiss   │
│   3. If both pass → render bar      │
│                                      │
│ ┌─────────────────────────────────┐ │
│ │  [Icon] TITLE: Description      │ │
│ │        [Link Text] →    [X]     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Enhancement Details

**New Fields to Add in Integrations.tsx:**
1. `title` - Short headline (e.g., "New Feature")
2. `description` (rename from `text`) - Longer description text
3. `icon` - Icon selector (megaphone, star, gift, bell, info, etc.)
4. Keep existing: linkText, linkUrl, backgroundColor, textColor

**Update AnnouncementBar.tsx:**
1. Accept new `title` and `icon` props
2. Render icon + title prominently
3. Render description text
4. Add visual polish (gradient backgrounds, icon styling)

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/panel/Integrations.tsx` | Add title, icon fields to announcements definition; update save logic |
| `src/components/storefront/AnnouncementBar.tsx` | Accept title/icon props, improve visual design |
| `src/pages/Storefront.tsx` | Pass new props to AnnouncementBar |

---

## Issue 3: Services Management & Tenant Display - Category Issues

### Current Problems Identified

1. **Services not showing all categories on tenant storefront**
   - `BuyerServices.tsx` uses `useUnifiedServices` hook which fetches from `service_categories` table
   - If categories aren't created in that table, they won't show
   - Fallback (line 244-267 in useUnifiedServices.tsx) builds categories from services but may not work correctly

2. **Auto-fix operations slow or buggy**
   - `autoAssignIconsAndCategories` function processes services one-by-one
   - Large batches (1000+ services) can timeout or freeze

3. **New Order page may show different categories than Services page**
   - Different category extraction logic in different components

### Root Cause Analysis

**Category Display Flow:**
1. Services are imported with `category` field (string like "instagram", "facebook")
2. `useUnifiedServices` first tries to fetch from `service_categories` table
3. If empty, it falls back to building categories from services
4. The fallback logic (lines 244-267) doesn't always populate correctly

**The Issue:**
- `service_categories` table may be empty for a panel
- Fallback relies on services having correct `category` field
- Icon detection may mismatch the category string

### Solution: Multi-Part Fix

**Part A: Improve Category Sync**

Update `useUnifiedServices.tsx` to:
1. Always build categories from services when `service_categories` table is empty
2. Auto-sync categories to database when first loaded
3. Ensure all 70+ platforms in `SOCIAL_ICONS_MAP` can be matched

**Part B: Fix Services Management Auto-Fix**

Update `src/pages/panel/ServicesManagement.tsx`:
1. Add batch processing with progress for large service lists
2. Fix the auto-categorization to handle edge cases
3. Add proper error handling and retry logic

**Part C: Sync Buyer Services Display**

Ensure `BuyerServices.tsx` and `BuyerNewOrder.tsx` both use:
1. Same category source (useUnifiedServices)
2. Same icon detection logic
3. Same sorting/grouping approach

**Part D: Add "Sync Categories" Button**

Add a visible button in Services Management to manually trigger category sync:
- Calls `syncCategoriesFromServices()` from the hook
- Shows progress indicator
- Creates missing categories in `service_categories` table

### Implementation Details

**useUnifiedServices.tsx Changes:**
```typescript
// Enhanced categoriesWithServices that ALWAYS works
const categoriesWithServices = useMemo(() => {
  // Build from services directly (reliable)
  const catMap = new Map<string, ServiceCategory & { services: UnifiedService[] }>();
  
  // First, add all services to their categories
  services.forEach(svc => {
    const slug = (svc.category || 'other').toLowerCase();
    const iconData = SOCIAL_ICONS_MAP[slug] || SOCIAL_ICONS_MAP.other;
    
    if (!catMap.has(slug)) {
      catMap.set(slug, {
        id: slug,
        panelId: panelId || '',
        name: iconData.label || slug.charAt(0).toUpperCase() + slug.slice(1),
        slug,
        iconKey: slug,
        color: iconData.color || '#6B7280',
        position: catMap.size,
        isActive: true,
        serviceCount: 0,
        services: [],
      });
    }
    catMap.get(slug)!.services.push(svc);
    catMap.get(slug)!.serviceCount++;
  });

  // Sort by service count (most popular first)
  return Array.from(catMap.values()).sort((a, b) => b.serviceCount - a.serviceCount);
}, [services, panelId]);
```

**ServicesManagement.tsx - Add Sync Button:**
```typescript
// In the toolbar area
<Button 
  variant="outline" 
  size="sm"
  onClick={handleSyncCategories}
  disabled={isSyncingCategories}
>
  {isSyncingCategories ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
  Sync Categories
</Button>
```

### Files to Modify
| File | Changes |
|------|---------|
| `src/hooks/useUnifiedServices.tsx` | Improve category building from services, always-reliable fallback |
| `src/pages/panel/ServicesManagement.tsx` | Add sync categories button, improve auto-fix reliability |
| `src/pages/buyer/BuyerServices.tsx` | Ensure consistent category display |
| `src/pages/buyer/BuyerNewOrder.tsx` | Sync category logic with BuyerServices |

---

## Summary of All Files to Change

| Priority | File | Changes |
|----------|------|---------|
| HIGH | `src/components/design/MobileDesignSlider.tsx` | Full light mode support for mobile/tablet preview |
| HIGH | `src/hooks/useUnifiedServices.tsx` | Reliable category building from services |
| MEDIUM | `src/pages/panel/Integrations.tsx` | Enhanced announcement fields (title, icon) |
| MEDIUM | `src/components/storefront/AnnouncementBar.tsx` | Support title/icon, improved visuals |
| MEDIUM | `src/pages/Storefront.tsx` | Pass new announcement props |
| MEDIUM | `src/pages/panel/ServicesManagement.tsx` | Add sync categories button, improve auto-fix |
| LOW | `src/pages/buyer/BuyerServices.tsx` | Consistent category display |
| LOW | `src/pages/buyer/BuyerNewOrder.tsx` | Sync category logic |

---

## Technical Implementation Notes

### Light Mode Color Mapping

| Dark Mode | Light Mode |
|-----------|------------|
| `bg-slate-950` | `bg-white` |
| `bg-slate-900` | `bg-slate-50` |
| `bg-slate-800` | `bg-slate-100` |
| `bg-slate-700` | `bg-slate-200` |
| `text-slate-200` | `text-slate-800` |
| `text-slate-400` | `text-slate-600` |
| `border-slate-700` | `border-slate-200` |
| `ring-white/10` | `ring-black/10` |

### Category Sync Database Function

The `sync_panel_categories` RPC function creates missing categories. If it doesn't exist, we'll create categories via direct inserts:

```typescript
const syncCategoriesFromServices = async () => {
  // Get unique categories from services
  const uniqueCats = [...new Set(services.map(s => s.category))];
  
  for (const cat of uniqueCats) {
    const iconData = SOCIAL_ICONS_MAP[cat] || SOCIAL_ICONS_MAP.other;
    
    // Upsert category
    await supabase.from('service_categories').upsert({
      panel_id: panelId,
      name: iconData.label,
      slug: cat,
      icon_key: cat,
      color: iconData.color,
      is_active: true,
    }, { onConflict: 'panel_id,slug' });
  }
};
```

---

## Testing Checklist

After implementation:
- [ ] Mobile Design Customization: Toggle light mode → all backgrounds, cards, text should be light
- [ ] Tablet Design Customization: Same as mobile
- [ ] Integrations: Configure announcement with title → verify it shows on tenant storefront
- [ ] Services Management: Click "Sync Categories" → verify all categories appear
- [ ] Tenant /services: Verify all 70+ categories show with correct icons
- [ ] Tenant New Order: Verify same categories as /services page

