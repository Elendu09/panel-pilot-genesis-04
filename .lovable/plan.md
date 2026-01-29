
# Comprehensive Fix Plan: Storefront Bugs, API Keys, Navigation, Loading, and Fast Order

---

## Overview

This plan addresses 12 critical issues reported:

1. **About Us page redirecting to Auth** - Incorrect route handling
2. **Footer showing `{companyName}` instead of tenant name** - Variable interpolation not working
3. **Blog not in storefront header** - Using wrong setting source
4. **API key generation showing "API Generated" but no key** - Need to read `api_key` from buyer
5. **Default CTA buttons wrong** - Need "Get Started" + "Fast Order" as defaults
6. **enableFastOrder toggle changing CTAs** - Need proper routing logic
7. **Services categorization/arrangement in Fast Order** - Sync with New Order page
8. **Auto-categorization losing categories** - Not an issue in current code flow
9. **Theme loading flicker** - Improve localStorage caching
10. **Navigation for public visitors** - Show public-only header with Services, Blog, FAQ links
11. **Get Started should be login-aware** - Go to dashboard if logged in, otherwise signup
12. **WhatsApp icon visibility** - Already fixed to white

---

## Issue 1: About Us Page Redirecting to Auth

### Root Cause
The `BuyerAbout` page uses `BuyerLayout` which requires authentication. But `/about` should be a PUBLIC route (not protected).

### Solution
The route is already defined as public in `TenantRouter.tsx` (line 359). The issue is that `BuyerAbout.tsx` wraps content in `BuyerLayout` which checks for buyer auth.

**Fix:** Remove `BuyerLayout` wrapper from `BuyerAbout.tsx` and use a standalone layout that doesn't require auth.

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/buyer/BuyerAbout.tsx` | Remove BuyerLayout, use standalone public layout with themed styling |

---

## Issue 2: Footer Showing `{companyName}` Literal Text

### Root Cause
In `StorefrontFooter.tsx` line 136, the `footerText` prop contains literal string `© 2025 {companyName}. All rights reserved.` from `DesignCustomization.tsx` defaults (line 264).

The `{companyName}` placeholder is NOT being interpolated - it's displayed as-is.

### Solution
Replace the placeholder `{companyName}` with actual panel name at render time.

**Fix:** In `StorefrontFooter.tsx`, replace `{companyName}` in `footerText` with the actual `panelName` prop.

### Files to Modify
| File | Change |
|------|--------|
| `src/components/storefront/StorefrontFooter.tsx` | Interpolate `{companyName}` placeholder with actual `panelName` |
| All theme homepages | Ensure `footerText` placeholder is replaced at render |

---

## Issue 3: Blog Not Showing in Storefront Header Navigation

### Root Cause
User confirmed the blog visibility should come from `panel_settings.blog_enabled`, but the themes only check `customization.showBlogInMenu`.

Looking at `Storefront.tsx` line 174:
```tsx
showBlogInMenu: customBranding?.showBlogInMenu ?? (panel as any)?.panel_settings?.blog_enabled ?? (panel?.settings as any)?.blog_enabled ?? false,
```

This is correct, but `panel_settings` is only fetched if it's in the panels query. Checking `useTenant.tsx` - it does select `panel_settings` with `blog_enabled`.

The issue: The `panel_settings` object is an array `[{...}]`, not a single object. Need to access `[0].blog_enabled`.

### Solution
Fix the `panel_settings` access in `Storefront.tsx` to handle array format.

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/Storefront.tsx` | Fix panel_settings access: `(panel as any)?.panel_settings?.[0]?.blog_enabled` |

---

## Issue 4: API Key Generation - Shows "Generated" but No Key Visible

### Root Cause
In `BuyerProfile.tsx`, after generating the key, it calls `refreshBuyer()`. However, the `BuyerAuthContext` fetch action doesn't return `api_key` from the edge function.

Looking at `buyer-auth/index.ts` line 439:
```typescript
const { password_hash, password_temp, ...safeUser } = user;
```

This DOES include `api_key` in safeUser. But the `BuyerUser` interface in `BuyerAuthContext.tsx` doesn't have `api_key`.

The `buyer-api/index.ts` edge function validates API keys but that's a different flow.

### Solution
1. Add `api_key` to `BuyerUser` interface in `BuyerAuthContext.tsx`
2. Ensure `BuyerProfile.tsx` correctly displays the key after generation
3. The key is being cast with `(buyer as any)?.api_key` which should work if the data is returned

Check if the issue is that the `api_key` column exists in the database. The migration was approved, so it should be there.

### Files to Modify
| File | Change |
|------|--------|
| `src/contexts/BuyerAuthContext.tsx` | Add `api_key?: string;` to `BuyerUser` interface |
| `src/pages/buyer/BuyerProfile.tsx` | Clean up type casting, use proper `buyer.api_key` access |

---

## Issue 5 & 6: Default CTA Buttons and enableFastOrder Logic

### Requirements
- **Default state** (enableFastOrder OFF): Primary = "Get Started", Secondary = "Fast Order"
- **enableFastOrder ON**: Primary = "Fast Order", Secondary = "View Services"
- **Get Started** should go to `/dashboard` if logged in, or `/auth?tab=signup` if not
- **Fast Order** should go to `/fast-order`

### Current Code Analysis
Looking at `AliPanelHomepage.tsx` lines 275-304:
- When `enableFastOrder=true`: Shows "Fast Order" + "View Services" buttons
- When `enableFastOrder=false`: Shows "Get Started" + "View Services" buttons

This is backwards from what user wants:
- **Default (OFF)**: "Get Started" + "Fast Order" (both as CTAs)
- **When ON**: "Fast Order" + "View Services" (Fast Order becomes primary)

### Solution
Update all theme homepages to:
1. Default (enableFastOrder=false): Show "Get Started" (login-aware) + "Fast Order" buttons
2. When enableFastOrder=true: Show "Fast Order" + "View Services" buttons (current behavior)

Also make "Get Started" button login-aware.

### Files to Modify
| File | Change |
|------|--------|
| `src/components/buyer-themes/tgref/TGRefHomepage.tsx` | Update CTA logic |
| `src/components/buyer-themes/alipanel/AliPanelHomepage.tsx` | Update CTA logic |
| `src/components/buyer-themes/flysmm/FlySMMHomepage.tsx` | Update CTA logic |
| `src/components/buyer-themes/smmstay/SMMStayHomepage.tsx` | Update CTA logic |
| `src/components/buyer-themes/smmvisit/SMMVisitHomepage.tsx` | Update CTA logic |
| `src/pages/panel/DesignCustomization.tsx` | Update default `heroSecondaryCTAText` to "Fast Order" |

---

## Issue 7: Fast Order Service Categorization/Arrangement

### Requirements
Services in Fast Order page should have the same category structure and order as the New Order page.

### Current Implementation
Both pages use `useUnifiedServices` hook which provides consistent data. The categorization in `FastOrderSection.tsx` uses `detectServiceType` from `lib/service-icon-detection.ts`.

The category ordering in Fast Order (lines 318-336 of FastOrder.tsx) is already consistent with BuyerNewOrder. No changes needed unless specific ordering issues are identified.

### Files to Check (Read-only)
- Fast Order page already uses unified services
- No changes needed

---

## Issue 8: Theme Loading Flicker (Panel Name Shows "panel")

### Root Cause
When tenant pages load, the initial render shows "Panel" before the actual panel name loads. This is because:
1. `useTenant` hook fetches data asynchronously
2. The fallback `panel?.name || 'Panel'` shows during loading

### Solution
Already partially addressed with:
1. localStorage caching in `useTenant.tsx`
2. Skeleton loaders in `TenantRouter.tsx`

Improve by:
1. Cache panel name in localStorage separately for instant title render
2. Use themed skeleton that matches panel colors

### Files to Modify
| File | Change |
|------|--------|
| `src/hooks/useTenant.tsx` | Cache panel name immediately to localStorage on fetch |
| `src/pages/buyer/BuyerLayout.tsx` | Read cached panel name on initial render |

---

## Issue 9: Public Navigation for Visitors

### Requirements
For non-logged-in visitors, show:
- Services link
- Blog link (if enabled)
- FAQ link (scroll anchor)
- Get Started button (login-aware)
- Fast Order button

Currently, `ThemeNavigation.tsx` shows "Login" and "Sign Up" buttons for non-authenticated users.

### Solution
Update navigation to show public-friendly links for visitors:
1. Keep Services/Support links
2. Add Blog link when `showBlogInMenu=true`
3. Change "Login" to "Get Started" (login-aware)
4. Keep "Sign Up"/"Register" button

### Files to Modify
| File | Change |
|------|--------|
| `src/components/buyer-themes/shared/ThemeNavigation.tsx` | Update non-auth button labels and routes |

---

## Technical Implementation Details

### CTA Button Logic Update (All Themes)
```tsx
// Default (enableFastOrder = false) - Show both CTA options
{!enableFastOrder ? (
  <>
    <Button 
      size="lg" 
      onClick={() => {
        // Login-aware: go to dashboard if logged in, signup if not
        if (buyer) {
          navigate('/dashboard');
        } else {
          navigate('/auth?tab=signup');
        }
      }}
      className="..." 
      style={primaryButtonStyle}
    >
      {heroCTA || 'Get Started'} <ArrowRight className="w-5 h-5 ml-2" />
    </Button>
    <Button size="lg" variant="outline" asChild className="..." style={outlineButtonStyle}>
      <Link to="/fast-order">
        <Zap className="w-5 h-5 mr-2" />
        {t('buyer.fastOrder.title') || 'Fast Order'}
      </Link>
    </Button>
  </>
) : (
  // enableFastOrder = true - Fast Order becomes primary
  <>
    <Button 
      size="lg" 
      onClick={() => navigate('/fast-order')}
      className="..." 
      style={primaryButtonStyle}
    >
      <Zap className="w-5 h-5 mr-2" />
      {t('buyer.fastOrder.title') || 'Fast Order'}
    </Button>
    <Button size="lg" variant="outline" asChild className="..." style={outlineButtonStyle}>
      <Link to="/services">{t('buyer.services.viewAll') || 'View Services'}</Link>
    </Button>
  </>
)}
```

### Footer Text Interpolation
```tsx
// In StorefrontFooter.tsx
const interpolatedFooterText = footerText
  ? footerText.replace(/\{companyName\}/g, panelName || 'SMM Panel')
  : `© ${currentYear} ${panelName || 'SMM Panel'}. All rights reserved.`;
```

### Blog Visibility Fix in Storefront.tsx
```tsx
// Fix panel_settings access (it's an array)
const panelSettingsData = Array.isArray((panel as any)?.panel_settings) 
  ? (panel as any)?.panel_settings[0] 
  : (panel as any)?.panel_settings;

showBlogInMenu: customBranding?.showBlogInMenu ?? panelSettingsData?.blog_enabled ?? (panel?.settings as any)?.blog_enabled ?? false,
```

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/pages/buyer/BuyerAbout.tsx` | Make public (remove auth requirement), add own navigation/footer |
| `src/components/storefront/StorefrontFooter.tsx` | Interpolate `{companyName}` placeholder with actual panelName |
| `src/pages/Storefront.tsx` | Fix `panel_settings` array access for `blog_enabled` |
| `src/contexts/BuyerAuthContext.tsx` | Add `api_key?: string` to BuyerUser interface |
| `src/pages/buyer/BuyerProfile.tsx` | Clean up api_key access, ensure key displays after generation |
| `src/components/buyer-themes/tgref/TGRefHomepage.tsx` | Update CTA logic, add buyer context check |
| `src/components/buyer-themes/alipanel/AliPanelHomepage.tsx` | Update CTA logic, add buyer context check |
| `src/components/buyer-themes/flysmm/FlySMMHomepage.tsx` | Update CTA logic, add buyer context check |
| `src/components/buyer-themes/smmstay/SMMStayHomepage.tsx` | Update CTA logic, add buyer context check |
| `src/components/buyer-themes/smmvisit/SMMVisitHomepage.tsx` | Update CTA logic, add buyer context check |
| `src/pages/panel/DesignCustomization.tsx` | Update heroSecondaryCTAText default to "Fast Order" |
| `src/hooks/useTenant.tsx` | Cache panel name for faster initial render |
| `src/components/buyer-themes/shared/ThemeNavigation.tsx` | Update Get Started route to be login-aware |

---

## Implementation Order

1. **Fix About page auth** - Make it public
2. **Fix footer {companyName} interpolation**
3. **Fix blog visibility** - Access panel_settings correctly
4. **Fix API key display** - Add to BuyerUser interface
5. **Update CTA buttons** - All 5 themes + defaults
6. **Improve loading** - Cache panel name
7. **Update navigation** - Login-aware Get Started button

---

## Testing Checklist

After implementation:
- [ ] Navigate to /about on tenant - should NOT redirect to auth
- [ ] Footer shows actual panel name (not {companyName})
- [ ] Enable Blog in panel settings - Blog appears in header navigation
- [ ] Generate API key in profile - key is visible and copyable
- [ ] Default storefront shows "Get Started" + "Fast Order" buttons
- [ ] Click Get Started while logged in - goes to dashboard
- [ ] Click Get Started while logged out - goes to signup
- [ ] Enable Fast Order toggle - buttons change to "Fast Order" + "View Services"
- [ ] Theme loads without showing "panel" placeholder
- [ ] All themes display correctly with proper colors
