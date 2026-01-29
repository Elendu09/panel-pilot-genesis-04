
## Goals (what will be fixed)
1. Rewrite the tenant “About Us” page to a simple, consistent page (header + footer + short content) like other tenant pages.
2. Restructure **Payment Management** into a clean **2-tab** page that clearly separates:
   - **Buyer/Tenant Payment Methods** (what your buyers use)
   - **Panel Owner Billing & Deposits** (what you as panel owner use for subscription/deposits + approvals/analytics)
3. Remove “Live Orders” tab from Analytics (you requested it removed).
4. Enhance Customer Management visuals (clearer UI, better actions visibility, fewer “busy” sections).
5. Make Design Customization preview/background clearly change on Light mode (white/light background, not dark-looking).
6. Fix tenant API 404 on `/api/v2` (root cause: wrong base URL path) and ensure the API key works with the correct endpoint.
7. Fix remaining TGRef + SMMVisit translation key leaks (e.g. `buyer.cta.execute`, `buyer.testimonials.userReviews`, `buyer.home.scrollMore`, etc.) across all 10 languages.

---

## 1) Rewrite tenant “About Us” (simple page)
### Problem
Tenant About page currently is a large, “feature-heavy” page (BuyerAbout.tsx) and doesn’t match your “simple page with header/footer” request.

### Approach
- Replace the content structure in `src/pages/buyer/BuyerAbout.tsx` with:
  - A simple hero (title + 2-3 line description)
  - 3 small “why us” bullets (optional)
  - A short “Contact us” CTA button
  - Use tenant styling via `BuyerLayout` (so it automatically has consistent sidebar/header/footer behavior for tenant).
- Keep SEO title/description via `Helmet`.
- Keep using `panel.custom_branding.footerAbout/description` if present, but don’t force large sections.

### Files
- Edit: `src/pages/buyer/BuyerAbout.tsx`

### Acceptance checks
- Visiting `https://TENANT_DOMAIN/about` shows a simple page, consistent with other tenant pages, no redirect to auth unless your routing intentionally requires auth (it currently does not for /about in TenantRouter).

---

## 2) Payment Management: rebuild into a 2-tab layout (as you requested)
### Problem
Your PaymentMethods page currently mixes:
- Buyer gateway configuration
- Deposit approvals / transaction analytics
…and it’s easy to think “buyer payments = panel owner billing payments”, which you’ve said must be separated.

### Target UX (2 tabs)
In `Payment Methods` (panel owner dashboard):
- Tab A: **Buyer Payment Methods**
  - Configure gateways your buyers can use on storefront deposit page (panel settings)
  - Manual payment methods config
  - Platform-enabled providers filtering stays (admin controls what is allowed)
  - Clear explanation banner: “This tab controls what buyers see on /deposit”
- Tab B: **Panel Owner Billing & Deposits**
  - Show **admin-managed billing gateways** (platform_payment_providers) (read-only + “contact admin” note if needed)
  - Show **UnifiedTransactionManager** for deposit approvals + analytics (this is panel operational finance)
  - Move “Top depositors / payment method usage / recent transactions” into this tab only (because that is deposit/transaction analytics)

### Important tech correction
Currently, `src/pages/panel/PaymentMethods.tsx` imports `useAvailablePaymentGateways` (buyer-focused).  
For the Billing tab, we will use the already-created `useAdminPaymentGateways` hook (admin billing gateways).

### Files
- Edit: `src/pages/panel/PaymentMethods.tsx`
- Likely edit (if needed for clarity): `src/components/billing/UnifiedTransactionManager.tsx` (e.g., add quick filters for pending verification/manual, and clearer status legend)

### Acceptance checks
- Buyer payment methods displayed/configurable in Tab A only
- Panel owner billing gateways shown in Tab B only
- Clear separation messaging visible in UI

---

## 3) Remove “Live Orders” tab from Analytics (fully)
### Problem
`src/pages/panel/Analytics.tsx` shows “Live Orders” TabTrigger even though the content says removed; this is inconsistent.

### Fix
- Remove the `TabsTrigger` for “Live Orders”
- Ensure the `TabsContent` for it is removed (it appears already commented/removed, but we’ll confirm the render tree)

### Files
- Edit: `src/pages/panel/Analytics.tsx`

### Acceptance checks
- No “Live Orders” tab in Analytics

---

## 4) Customer Management visual enhancements (UI polish + clarity)
### Current state
CustomerManagement is feature-rich but visually dense.

### Enhancements (non-breaking)
- Improve header hierarchy and spacing (reduce “wall of controls”)
- Make primary actions more obvious (Add Customer, Export, Bulk Actions)
- Improve table readability:
  - stronger zebra/hover states
  - better status badges + VIP marker
- Keep your existing Supabase-persisted overview toggle (it’s already correct: `panels.settings.ui.customerOverviewVisible`)

### Files
- Edit: `src/pages/panel/CustomerManagement.tsx`
- Potentially edit a reusable component if needed:
  - `src/components/customers/CustomerMobileCard.tsx`
  - `src/components/customers/CustomerOverview.tsx`

### Acceptance checks
- Page feels cleaner, key actions are visible
- No loss of existing features

---

## 5) Integrations: “Announcements” and other integrations not visibly doing anything
### Root cause (from code)
- `Integrations.tsx` stores “announcements” config into `panel_settings.integrations`.
- `TenantHead.tsx` injects many integrations (GA, GTM, Crisp, etc.), but **does not implement an announcements UI bar**.
So enabling “Announcements” currently won’t show anything on storefront.

### Fix
- Implement a small storefront-visible **AnnouncementBar** that:
  - Reads `panel_settings.integrations.announcements`
  - If enabled: shows a top banner with text + optional link
  - Is dismissible per-session (sessionStorage)
- Render it in the tenant storefront entry:
  - `src/pages/Storefront.tsx` (best place so it applies regardless of theme)

### Files
- Create: `src/components/storefront/AnnouncementBar.tsx`
- Edit: `src/pages/Storefront.tsx`

### Acceptance checks
- Enable Announcements in panel Integrations
- Tenant storefront shows announcement banner immediately

---

## 6) Design Customization: light mode must look truly light (white background)
### What’s happening
- You have `themeMode` and even `lightModeColors`, but the preview CSS generation and theme variable generation often still use the “dark” background color values.
- Also the editor shell uses `from-background` which is controlled by the app theme (default is dark), not by your preview mode.

### Fix (two parts)
1) **Preview correctness**
- When `customization.themeMode === 'light'`, generate CSS vars using `customization.lightModeColors` (background/surface/text/border) rather than the dark ones.
- Ensure SMMVisit preview remains consistent (it’s light-mode only already in BuyerLayout).

2) **Editor shell clarity**
- In `DesignCustomization.tsx`, change the preview container background to follow `previewThemeMode`:
  - Light mode = white/very light background
  - Dark mode = dark gradient background
This makes the difference obvious while editing.

### Files
- Edit: `src/pages/panel/DesignCustomization.tsx`
- Possibly edit: `src/lib/color-utils.ts` (if `generateBuyerThemeCSS` should accept themeMode and mode color maps cleanly)

### Acceptance checks
- Clicking Light mode in design customization produces a clearly white/light preview background

---

## 7) Tenant API base URL returns 404 (and provider marketplace can’t work)
### Most likely cause (based on your current code)
Your Buyer API UI uses:
- `apiBaseUrl = https://TENANT_DOMAIN/api/v2`
…but your rewrite is:
- `/api/v2/:path*` → `.../functions/v1/:path*`

So calling `/api/v2` (no path) will rewrite to `/functions/v1/` and return **404**.

### Correct endpoint
It should be:
- `https://TENANT_DOMAIN/api/v2/buyer-api`

Because the edge function is named `buyer-api`.

### Fix plan
- Update Buyer API docs/UI to use:
  - `.../api/v2/buyer-api`
- Search for any other place in panel owner provider import/validation that uses `/api/v2` without function name and correct it.

### Files
- Edit: `src/pages/buyer/BuyerAPI.tsx`
- Search + fix any other `/api/v2` usage across panel owner provider flows.

### Acceptance checks
- Calling the tenant API with`POST https://TENANT_DOMAIN/api/v2/buyer-api` works
- `/api/v2` alone is no longer shown as the base URL in docs

---

## 8) Translation key leaks in TGRef + SMMVisit (and “many more”)
### Root cause
`LanguageContext.t()` returns the key if missing. Your themes call keys like:
- `buyer.cta.execute`
- `buyer.testimonials.userReviews`
- `buyer.home.scrollMore`
and these are missing in `platform-translations.ts` for many languages (and some keys aren’t present at all).

### Fix
- Add missing keys to `src/lib/platform-translations.ts` under **all 10 languages**:
  - `buyer.cta.execute`
  - `buyer.testimonials.userReviews`
  - `buyer.home.scrollMore`
- Then run a quick scan on buyer themes for `t('buyer.` keys and ensure every key exists in platform translations (or at least has EN + falls back gracefully).
  - The minimum viable fix: add the keys we found + any other keys that currently leak in TGRef/SMMVisit.
  - We’ll use `buyer.*` consistent naming and keep semantics stable.

### Files
- Edit: `src/lib/platform-translations.ts`

### Acceptance checks
- No visible raw keys like `buyer.cta.execute` anywhere in TGRef/SMMVisit across supported languages

---

## Execution order (fastest to highest impact)
1) Fix tenant API base URL (`BuyerAPI.tsx`) to stop 404 confusion immediately
2) Remove Live Orders tab (Analytics)
3) Rewrite Buyer About page to simple page
4) Add AnnouncementBar and wire to Storefront
5) PaymentMethods 2-tab restructure
6) DesignCustomization light-mode background/preview correction
7) CustomerManagement visual polish
8) Translation audit additions (TGRef/SMMVisit + global missing keys)

---

## Testing checklist (end-to-end)
- Tenant:
  - Open tenant `/about` and verify it is simple + loads without auth
  - Open tenant `/api` and verify base URL shows `/api/v2/buyer-api`
  - Execute a real “services” API request using the shown curl example and confirm 200 response
- Panel owner:
  - Payment Methods page: verify tabs separate buyer methods vs billing
  - Analytics: verify Live Orders tab is gone
  - Integrations: enable Announcements → verify storefront banner appears on tenant homepage
- Design customization:
  - Toggle light mode → preview background becomes clearly white/light
- Languages:
  - Switch to affected languages and confirm no `buyer.*` keys show raw in TGRef/SMMVisit

---

## Notes on “API key works to get all data”
- Your edge function `buyer-api` validates:
  - panel owner keys from `panel_api_keys` OR
  - buyer keys from `client_users.api_key`
So keys should work, but only if you call the correct endpoint: `/api/v2/buyer-api` (and the request is POST with action/key).

---

## Files expected to change
- `src/pages/buyer/BuyerAbout.tsx`
- `src/pages/panel/PaymentMethods.tsx`
- `src/pages/panel/Analytics.tsx`
- `src/pages/panel/CustomerManagement.tsx`
- `src/pages/panel/DesignCustomization.tsx`
- `src/pages/buyer/BuyerAPI.tsx`
- `src/pages/Storefront.tsx`
- `src/components/storefront/AnnouncementBar.tsx` (new)
- `src/lib/platform-translations.ts`
- (Optional) `src/lib/color-utils.ts` (if needed to properly support mode-based variables)
