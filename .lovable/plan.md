
# Plan: Fix Auth Page, Panel Settings Ad Display, Blog Navigation, WhatsApp Icon & Mobile Issues

## Executive Summary
This plan addresses 7 distinct issues across authentication, panel settings, theme navigation, mobile viewport, and storefront styling. The core problems are:
1. "Back to Storefront" link on Auth Page needs removal
2. TGRef theme mobile language selector breaks page layout
3. Panel Settings Ad Display causes theme/payment method resets (must be removed)
4. New "Free subdomain banner" feature for free tier users needed
5. Blog navigation not appearing in all storefront themes
6. WhatsApp icon color should be white on dark backgrounds
7. Comprehensive panel settings audit for similar bugs

---

## Issue 1: Remove "Back to Storefront" from Auth Page

**Problem:** The Auth Page (`src/pages/buyer/BuyerAuth.tsx`) has a "Back to Storefront" button at lines 270-287 that should be removed.

**File:** `src/pages/buyer/BuyerAuth.tsx`
**Lines:** 270-287

**Solution:** Remove the entire `motion.div` block containing the "Back to Storefront" link:

```tsx
// DELETE lines 270-287:
{/* Back to Storefront Link */}
<motion.div 
  className="absolute top-6 left-6 z-10"
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.2 }}
>
  <Button 
    variant="ghost" 
    asChild 
    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
  >
    <Link to="/">
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Storefront
    </Link>
  </Button>
</motion.div>
```

---

## Issue 2: TGRef Theme Mobile Language Selector Breaking Page

**Problem:** In TGRef theme, clicking the language selector on mobile causes the page to shrink/break. The issue is that the language dropdown menu position conflicts with the fixed/absolute positioning on mobile.

**Root Cause:** The LanguageSelector dropdown in `ThemeNavigation.tsx` (lines 248-252) is within a flex container that may clip when the dropdown opens due to `overflow` issues.

**File:** `src/components/buyer-themes/shared/ThemeNavigation.tsx`
**Lines:** 248-251

**Solution:** Already partially fixed per memory, but ensure the mobile container has proper `overflow-visible` and the dropdown has correct positioning:

The container at line 248 already has `overflow-visible`:
```tsx
<div className="flex md:hidden items-center gap-2 overflow-visible">
```

The issue may be with the LanguageSelector itself. Looking at `src/components/buyer/LanguageSelector.tsx` line 78-79, the dropdown uses `side="bottom"` and `sideOffset={8}`.

**Additional Fix:** Ensure the parent Auth page container doesn't constrain the dropdown. The Auth page uses `absolute` positioning which conflicts with dropdown overlays. Since we're removing the "Back to Storefront" button anyway, this should help.

---

## Issue 3: Remove Ad Display HTML Code Section from Panel Settings

**Problem:** The Ad Display section in GeneralSettings (lines 1044-1155) allows panel owners to insert arbitrary HTML which:
1. Can clash with theme rendering causing reset to Default theme
2. May reset payment method configurations
3. Creates security concerns with `dangerouslySetInnerHTML`

**Root Cause Analysis:** Looking at `handleSave` (lines 242-291), when saving, it COMPLETELY OVERWRITES the `panels.settings` JSONB column with a new object containing only `general`, `seo`, and `ads` keys. This destroys any other settings stored there (like payment methods, buyer_theme, etc.).

**Critical Bug in handleSave (lines 256-290):**
```tsx
settings: {
  general: { ... },
  seo: { ... },
  ads: {
    enabled: settings.adsEnabled,
    html: settings.adHtml,
    position: settings.adPosition,
  },
},
```

This replaces ALL settings, losing any previously stored data like `buyer_theme`, payment configurations, etc.

**Files to Modify:**
- `src/pages/panel/GeneralSettings.tsx`

**Solution - Two Parts:**

### Part A: Fix the handleSave to MERGE settings instead of REPLACE

```tsx
// First, fetch existing settings to merge
const { data: existingPanel } = await supabase
  .from('panels')
  .select('settings, custom_branding')
  .eq('id', panelId)
  .single();

const existingSettings = existingPanel?.settings || {};
const existingBranding = existingPanel?.custom_branding || {};

// Then update with merged settings
const { error: panelError } = await supabase
  .from('panels')
  .update({
    name: settings.panelName,
    description: settings.description,
    logo_url: settings.logoUrl,
    custom_branding: {
      ...existingBranding,  // PRESERVE existing branding
      faviconUrl: settings.faviconUrl,
      appleTouchIconUrl: settings.appleTouchIconUrl,
      ogImageUrl: settings.ogImageUrl,
      logoUrl: settings.logoUrl,
      heroImageUrl: settings.heroImageUrl,
    },
    settings: {
      ...existingSettings,  // PRESERVE existing settings
      general: { ... },
      seo: { ... },
      // Remove ads section entirely
    },
  })
  .eq('id', panelId);
```

### Part B: Remove the Ad Display AccordionItem entirely

Remove lines 1044-1155 (the entire Ad Display AccordionItem).

Also remove from state initialization (lines 108-112):
```tsx
// Remove these lines:
// Ad Settings (NEW)
adsEnabled: false,
adHtml: "",
adPosition: "sidebar" as "header" | "sidebar" | "footer",
```

---

## Issue 4: Implement Free Subdomain Banner (Like Lovable)

**Requirement:** Create a dismissable banner for free tier users on subdomains, similar to Lovable's "Edit in Lovable" banner.

**Design:**
- Small, non-intrusive banner at top or bottom of page
- Shows "Powered by [Platform]" or "Create your own panel at smmpilot.online"
- Dismissable (closes for session)
- Controlled by admin settings (enable/disable per panel)

**Files to Create/Modify:**
1. Create new component: `src/components/storefront/FreeTierBanner.tsx`
2. Modify `src/pages/Storefront.tsx` to render banner for free panels
3. Add `is_free_tier` or `subscription_tier` check logic

**Component Structure:**
```tsx
// src/components/storefront/FreeTierBanner.tsx
interface FreeTierBannerProps {
  onDismiss: () => void;
  platformUrl?: string;
}

const FreeTierBanner = ({ onDismiss, platformUrl = 'https://smmpilot.online' }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-white py-2 px-4 flex items-center justify-center gap-4 text-sm">
      <span>Powered by <a href={platformUrl} className="underline font-semibold">SMM Pilot</a></span>
      <span>•</span>
      <a href={platformUrl} className="underline hover:opacity-80">Create your own panel for free</a>
      <button onClick={onDismiss} className="ml-4 p-1 hover:bg-white/20 rounded">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
```

**Integration in Storefront.tsx:**
```tsx
const [bannerDismissed, setBannerDismissed] = useState(() => {
  return sessionStorage.getItem('freeTierBannerDismissed') === 'true';
});

const isFreeTier = !panel?.subscription_tier || panel?.subscription_tier === 'free';
const showFreeBanner = isFreeTier && !bannerDismissed;

// In render:
{showFreeBanner && (
  <FreeTierBanner 
    onDismiss={() => {
      sessionStorage.setItem('freeTierBannerDismissed', 'true');
      setBannerDismissed(true);
    }}
  />
)}
```

---

## Issue 5: Blog Not Showing in All Storefront Theme Navigations

**Problem:** Blog menu item only appears in Default theme navigation, not in other themes.

**Root Cause Analysis:**
Looking at `Storefront.tsx` line 168:
```tsx
showBlogInMenu: customBranding?.showBlogInMenu ?? (panel?.settings as any)?.blog_enabled ?? (panel as any)?.blog_enabled ?? false,
```

The problem is `blog_enabled` is in `panel_settings` table but NOT being fetched consistently. Looking at `useTenant.tsx` lines 309-313, some queries include `blog_enabled` in `panel_settings`:
```tsx
panel_settings (seo_title, seo_description, seo_keywords, maintenance_mode, maintenance_message, contact_info, social_links, blog_enabled)
```

But other queries (lines 320-329, 366-394, etc.) do NOT include `blog_enabled`. This inconsistency means the field may be missing depending on which query path is taken.

**Files to Modify:**
- `src/hooks/useTenant.tsx` - Ensure ALL panel_settings queries include `blog_enabled`
- `src/pages/Storefront.tsx` - Access `blog_enabled` from the correct location

**Solution:**

### Part A: Update ALL panel_settings queries in useTenant.tsx

Update every `panel_settings (...)` selection to include `blog_enabled`:

Lines 320-328 (P0 custom domain query) - Add `blog_enabled`:
```tsx
panel_settings (seo_title, seo_description, seo_keywords, maintenance_mode, maintenance_message, contact_info, social_links, blog_enabled)
```

Lines 374-391 (P2 custom domain query) - Add `blog_enabled`:
```tsx
panel_settings (seo_title, seo_description, seo_keywords, maintenance_mode, maintenance_message, contact_info, social_links, blog_enabled)
```

Lines 436-449 (P3 panel_domains linked panel) - Add `blog_enabled`:
```tsx
panel_settings (seo_title, seo_description, seo_keywords, maintenance_mode, maintenance_message, contact_info, social_links, blog_enabled)
```

Lines 471-487 (P4 subdomain fallback) - Add `blog_enabled`:
```tsx
panel_settings (seo_title, seo_description, seo_keywords, maintenance_mode, maintenance_message, contact_info, social_links, blog_enabled)
```

Lines 510-530 (Extracted subdomain fallback) - Add `blog_enabled`:
```tsx
panel_settings (seo_title, seo_description, seo_keywords, maintenance_mode, maintenance_message, contact_info, social_links, blog_enabled)
```

### Part B: Fix Storefront.tsx to correctly read blog_enabled

Update line 168 to properly access the nested settings:
```tsx
// Current (problematic):
showBlogInMenu: customBranding?.showBlogInMenu ?? (panel?.settings as any)?.blog_enabled ?? (panel as any)?.blog_enabled ?? false,

// Fixed (access panel_settings correctly):
showBlogInMenu: customBranding?.showBlogInMenu ?? (panel as any)?.panel_settings?.blog_enabled ?? (panel?.settings as any)?.blog_enabled ?? false,
```

---

## Issue 6: WhatsApp Icon Should Be White

**Problem:** The WhatsApp icon in `FloatingChatWidget.tsx` appears black instead of white on dark backgrounds.

**File:** `src/components/storefront/FloatingChatWidget.tsx`
**Lines:** 123-127 (WhatsAppIcon component)

**Current Code:**
```tsx
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
    <path d="M17.472 14.382c-.297..."/>
  </svg>
);
```

The `fill-current` class means it inherits the text color. The button at lines 459-467 has `className="text-white"` but the icon might not be inheriting correctly.

**Solution:** Explicitly set fill color to white in the SVG or ensure proper color inheritance:

```tsx
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
    <path d="M17.472 14.382c-.297..."/>
  </svg>
);
```

Or more robustly, use currentColor with explicit text color:
```tsx
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
    <path d="M17.472 14.382c-.297..."/>
  </svg>
);
```

---

## Issue 7: Panel Settings Audit for Similar Bugs

**Critical Bug Pattern Identified:** The `handleSave` function in GeneralSettings completely replaces the `panels.settings` and `panels.custom_branding` JSONB columns instead of merging. This pattern likely exists in other settings pages.

**Files to Audit:**
1. `src/pages/panel/GeneralSettings.tsx` - **CONFIRMED BUG** (fixes above)
2. `src/pages/panel/SEOSettings.tsx` - Check for same pattern
3. `src/pages/panel/PaymentMethods.tsx` - Check for same pattern
4. `src/pages/panel/DesignCustomization.tsx` - Check for same pattern
5. `src/pages/panel/SecuritySettings.tsx` - Check for same pattern
6. `src/pages/panel/Integrations.tsx` - Check for same pattern

**Recommended Fix Pattern:**
All panel settings update functions should:
1. First fetch existing data
2. Merge new data with existing
3. Then save

```tsx
// Safe update pattern
const updatePanelSettings = async (panelId: string, updates: Partial<Settings>) => {
  // 1. Fetch existing
  const { data: existing } = await supabase
    .from('panels')
    .select('settings, custom_branding')
    .eq('id', panelId)
    .single();
  
  // 2. Deep merge
  const mergedSettings = {
    ...existing?.settings,
    ...updates
  };
  
  // 3. Save merged result
  await supabase
    .from('panels')
    .update({ settings: mergedSettings })
    .eq('id', panelId);
};
```

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/pages/buyer/BuyerAuth.tsx` | Remove "Back to Storefront" button (lines 270-287) |
| `src/pages/panel/GeneralSettings.tsx` | 1. Fix handleSave to merge settings instead of replace. 2. Remove Ad Display section entirely (lines 1044-1155). 3. Remove ad-related state (lines 108-112) |
| `src/hooks/useTenant.tsx` | Add `blog_enabled` to ALL panel_settings queries (5 locations) |
| `src/pages/Storefront.tsx` | Fix blog_enabled access path to check panel_settings correctly |
| `src/components/storefront/FloatingChatWidget.tsx` | Update WhatsAppIcon SVG fill to white |
| `src/components/storefront/FreeTierBanner.tsx` | **NEW FILE** - Create free tier banner component |

---

## Technical Implementation Order

1. **Fix GeneralSettings handleSave** (CRITICAL - prevents further data loss)
2. **Remove Ad Display section** from GeneralSettings
3. **Fix useTenant.tsx queries** for blog_enabled
4. **Fix Storefront.tsx** blog_enabled access
5. **Remove "Back to Storefront"** from BuyerAuth
6. **Fix WhatsApp icon** color
7. **Create FreeTierBanner** component
8. **Integrate FreeTierBanner** in Storefront

---

## Testing Checklist

After implementation:
- [ ] Save settings in GeneralSettings, verify theme doesn't reset
- [ ] Save settings in GeneralSettings, verify payment methods intact
- [ ] Enable blog in Blog Management, verify it appears in ALL theme navigations
- [ ] Test WhatsApp button visibility on light and dark backgrounds
- [ ] Test Auth page mobile view - language selector shouldn't break layout
- [ ] Verify free tier banner appears for panels without paid subscription
- [ ] Verify banner dismisses and stays dismissed for session
