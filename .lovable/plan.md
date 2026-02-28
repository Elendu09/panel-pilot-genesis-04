

# Plan: Remove FAQ Tracking, Improve Balance Card UI, Fix Panel Name on Tenant Storefront

## 3 Changes

### 1. Remove FAQ click tracking (revert unwanted feature)

**Files:**
- `src/components/storefront/StorefrontFAQSection.tsx`: Remove `useAnalyticsTracking` import and `trackFaqClick` call from the onClick handler (lines 7, 56, 226-228). Keep the accordion functionality intact.
- `src/hooks/use-analytics-tracking.tsx`: Remove `trackFaqClick` method (lines 91-93) and its export (line 102).
- `src/components/themes/ThemeOne.tsx` through `ThemeFive.tsx`: Remove `panelId` prop being passed to `StorefrontFAQSection` (revert what was added in last build).

### 2. Improve Panel Balance card UI in PanelOverview header

Current balance display (lines 601-608) is a small inline element that's easy to miss. Enhance it:
- Make it a proper mini-card with larger font size for the amount
- Add a subtle animated pulse dot to indicate real-time connection
- Increase padding and make the balance amount more prominent (text-lg font-bold)
- Add a "Live" indicator to show it auto-updates

### 3. Fix panel name not updating on tenant storefront (CRITICAL)

**Root cause**: `useTenant` hook fetches panel data once and caches it with a 30-second TTL in a module-level `Map`. When the panel owner changes the name in GeneralSettings, the storefront's cached `panel.name` and `custom_branding.companyName` are stale. There's no realtime subscription or cache invalidation.

**Fix** in `src/hooks/useTenant.tsx`:
- After initial panel detection succeeds, set up a Supabase realtime subscription on `panels_public` (or `panels` table) filtered by `id=eq.${panel.id}` listening for UPDATE events
- On UPDATE, refresh the panel state with `payload.new` data (name, logo_url, custom_branding, etc.)
- Also clear the `tenantCache` entry for the current hostname so navigation doesn't revert to stale data
- This ensures when panel owner saves a new name, the storefront header/footer updates within seconds

**Files:**
| File | Change |
|------|--------|
| `src/hooks/useTenant.tsx` | Add realtime subscription on panels table after panel detection; update panel state and clear cache on UPDATE |
| `src/components/storefront/StorefrontFAQSection.tsx` | Remove analytics tracking import and trackFaqClick call |
| `src/hooks/use-analytics-tracking.tsx` | Remove trackFaqClick method |
| `src/components/themes/ThemeOne.tsx` | Remove panelId prop to FAQ section |
| `src/components/themes/ThemeTwo.tsx` | Remove panelId prop to FAQ section |
| `src/components/themes/ThemeThree.tsx` | Remove panelId prop to FAQ section |
| `src/components/themes/ThemeFour.tsx` | Remove panelId prop to FAQ section |
| `src/components/themes/ThemeFive.tsx` | Remove panelId prop to FAQ section |
| `src/pages/panel/PanelOverview.tsx` | Enhance balance card UI with larger display, live indicator |

