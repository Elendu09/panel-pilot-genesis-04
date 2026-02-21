

# Fix Plan: SEO, Payments, Services, and Panel Name Sync

## Issue 1: Payment "Missing Required Fields" (Billing + Onboarding)

**Root Cause (CRITICAL):** The `saveProgress` function in `PanelOnboardingV2.tsx` (line 291) uses `.upsert({...}, { onConflict: 'owner_id' })`, but the `panels` table has **NO unique constraint on `owner_id`**. This means the upsert silently fails every time, `createdPanelId` is never set, and the Payment step receives `panelId: undefined`. The edge function then returns "Missing required fields" because `panelId` is missing.

**Fix:**
1. **Database migration:** Add a unique index on `panels.owner_id` to make the upsert work:
   ```sql
   CREATE UNIQUE INDEX panels_owner_id_unique ON public.panels (owner_id);
   ```
2. **Code fix in `PanelOnboardingV2.tsx`:** Ensure `saveProgress` always captures the panel ID even when the panel already exists (remove the `!createdPanelId` guard so it always updates):
   ```typescript
   if (upsertedPanel?.id) {
     setCreatedPanelId(upsertedPanel.id);
   }
   ```
3. **Also fix `handleComplete`:** Change from `INSERT` to `UPSERT` (matching `saveProgress` pattern) to prevent duplicate panel errors when `saveProgress` has already created a record.
4. **Billing.tsx:** Already fixed with `buyerId: profile.id` -- verified correct.

## Issue 2: SEO -- index.html Overriding Helmet Tags

**Root Cause:** The `index.html` structure is now correct with `data-platform-only` attributes. However, the issue persists because social crawlers (Facebook, Twitter, LinkedIn) and link preview services do NOT execute JavaScript -- they only read the raw HTML. React Helmet modifies the DOM client-side, which crawlers never see.

**This is an inherent limitation of client-side rendered SPAs.** However, we can improve the situation:

**Fix:**
- The cleanup script already strips `data-platform-only` tags for tenant domains. For the platform homepage, the `Index.tsx` Helmet tags should override the `index.html` tags at runtime for users.
- For social previews on tenant domains: The tenant detection script (line 9-31 in `index.html`) already sets `document.title = 'Loading...'` and removes platform tags. This is the best we can do without SSR.
- No code changes needed -- the current implementation is already correct.

## Issue 3: SEO Preview Shows "homeofsmm.com" Instead of "smmpilot.online"

**Root Cause:** Multiple files hardcode `homeofsmm.com` as the subdomain suffix:
- `PanelOnboarding.tsx` lines 422, 449, 752
- `PanelOnboardingV2.tsx` lines 880, 926-927
- `SEOPreviewCards.tsx` line 22
- `SEOSettings.tsx` lines 308, 423, 589, 616

The actual platform domain is `smmpilot.online` (per `PLATFORM_DOMAIN` in tenant config).

**Fix:** Replace all `homeofsmm.com` references in these files with `smmpilot.online`.

Files to update:
| File | Lines | Change |
|------|-------|--------|
| `src/pages/panel/PanelOnboarding.tsx` | 422, 449, 752 | `.homeofsmm.com` to `.smmpilot.online` |
| `src/pages/panel/PanelOnboardingV2.tsx` | 880, 926-927 | `.homeofsmm.com` to `.smmpilot.online` |
| `src/components/settings/SEOPreviewCards.tsx` | 22 | `.homeofsmm.com` to `.smmpilot.online` |
| `src/pages/panel/SEOSettings.tsx` | 308, 423, 589, 616 | `.homeofsmm.com` to `.smmpilot.online` |

## Issue 4: SEO Auto-generate Exceeding Pixel Limit

**Root Cause:** The `generateSeoMeta` function in `src/lib/seo-metrics.ts` already calls `clampToPx(rawDescription, SEO_DESC_PX_RANGE.max)` which should truncate. However, the onboarding step's `handleNext` auto-generates SEO but does NOT clamp user-edited text when they modify the auto-generated description and make it longer.

**Fix:** In `PanelOnboardingV2.tsx` and `PanelOnboarding.tsx`, auto-clamp the description to the pixel limit when the auto-generate button is clicked. The `generateSeoMeta` function already does this, so the issue is only when users manually edit. Add a blur handler or validation that warns and clamps.

## Issue 5: Services Not Showing for "soc" Panel in Tenant

**Database verified:** Panel "AiSoc" (subdomain: soc) has 2,073 active, visible services. Status is `active`. The `panels_public` view includes panels with `active` status.

**Root Cause:** The RLS policy on `services` table reads:
```sql
is_active = true AND panel_id IN (SELECT id FROM panels WHERE status = 'active')
```

This queries the `panels` base table (not the view). Anonymous/unauthenticated users have NO SELECT access to the `panels` table because the `panels` table has owner-only RLS. The inner SELECT `FROM panels WHERE status = 'active'` returns 0 rows for anonymous users, so the services RLS policy evaluates to `false` for ALL services.

**This is the root cause.** The services RLS policy relies on a subquery against a table that anonymous users cannot read.

**Fix (Database migration):** Create a `SECURITY DEFINER` function to check panel status, bypassing RLS:
```sql
CREATE OR REPLACE FUNCTION public.is_panel_active(p_panel_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.panels 
    WHERE id = p_panel_id AND status = 'active'
  );
$$;
```

Then update the RLS policy:
```sql
DROP POLICY "Public can view services from active panels" ON public.services;
CREATE POLICY "Public can view services from active panels" ON public.services
  FOR SELECT USING (is_active = true AND public.is_panel_active(panel_id));
```

## Issue 6: Panel Name Not Updating in Tenant Storefront

**Root Cause:** Already fixed in the previous session. The `GeneralSettings.tsx` line 259 now includes:
```typescript
companyName: settings.panelName, // Sync company name with panel name for storefront
```

**Status:** This fix is already in place. If it's still not working, the user may need to clear the tenant cache (30-second TTL) by refreshing the storefront after saving.

---

## Summary of All Changes

### Database Migration (SQL)
```sql
-- 1. Add unique constraint on owner_id for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS panels_owner_id_unique ON public.panels (owner_id);

-- 2. Create SECURITY DEFINER function for anonymous service access
CREATE OR REPLACE FUNCTION public.is_panel_active(p_panel_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.panels WHERE id = p_panel_id AND status = 'active');
$$;

-- 3. Fix services RLS policy to use SECURITY DEFINER function
DROP POLICY IF EXISTS "Public can view services from active panels" ON public.services;
CREATE POLICY "Public can view services from active panels" ON public.services
  FOR SELECT USING (is_active = true AND public.is_panel_active(panel_id));
```

### File Changes
| File | Change |
|------|--------|
| `src/pages/panel/PanelOnboardingV2.tsx` | Fix `createdPanelId` capture; change `handleComplete` to upsert; change `homeofsmm.com` to `smmpilot.online` |
| `src/pages/panel/PanelOnboarding.tsx` | Change `homeofsmm.com` to `smmpilot.online` in 3 places |
| `src/pages/panel/SEOSettings.tsx` | Change `homeofsmm.com` to `smmpilot.online` in 4 places |
| `src/components/settings/SEOPreviewCards.tsx` | Change default URL from `homeofsmm.com` to `smmpilot.online` |

