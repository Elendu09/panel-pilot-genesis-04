
## Objectives (what will be fixed)
1) Design Customization (mobile/tablet): preview + controls must switch cleanly between Dark and Light without “removing” either mode.
2) Announcement: must actually render on tenant storefront when enabled; also support a “second” announcement + richer fields (title/description/style).
3) Tenant Services (/services): must show the same full category breadth (70+ where applicable) as New Order/Fast Order, using the unified services logic.
4) Tenant About Us: improve content per-panel and improve translations so it doesn’t show raw keys / missing strings.
5) Payment Management clarity: clearly separate “Buyer Payment Methods” vs “Panel Owner Billing/Subscription”, and explain where subscription lives.
6) Fast Order payment methods: manual payments enabled in Payment Methods must appear in Fast Order (manual_transfer/manual_*), not just deposits page.

---

## Key findings (root causes)
### A) Announcement not rendering
- `Storefront.tsx` tries to read `integrations` from `panel_settings` via `panel.panel_settings[0]`.
- But `useTenant.tsx` currently selects `panel_settings (seo_title, seo_description, ... blog_enabled)` and **does not include `integrations`**, so `panelSettingsData.integrations` is always undefined.
- Fallback `(panel?.settings as any)?.integrations` also won’t work because Integrations page saves to the **panel_settings table**, not `panels.settings`.
Result: `announcementConfig` becomes `{}` → `enabled` is falsy → bar never shows.

### B) Mobile/tablet “light mode not affecting controls”
- `MobileDesignSlider.tsx` changes its own container colors, but the sections rendered via `renderSection()` are mostly built with shadcn tokens (`bg-card`, `text-foreground`, `glass-card`, etc.).
- Those tokens only switch properly if the subtree is wrapped with `.light` / `.dark` class (your `src/index.css` defines these).
- Currently, only the **preview iframe area** gets `.dark`/`.light`, but the **controls content area** does not consistently apply the theme wrapper class → many cards and texts remain in dark styling even when previewThemeMode is “light”.

### C) Tenant “Services page” mismatch
- TenantRouter route `/services` points to `BuyerPublicServices` (guest catalog).
- `BuyerPublicServices.tsx` **does not use `useUnifiedServices`** and builds categories directly from raw services query, which can show fewer categories and inconsistent grouping vs New Order.
- Meanwhile, New Order + BuyerServices are already unified.

### D) Fast Order payment methods missing manual transfer
- `FastOrderSection.tsx` loads payment methods only from `panel.settings.payments.enabledMethods` and doesn’t merge in `payments.manualPayments`.
- BuyerDeposit has special manual logic; FastOrder does not.
- Best fix is to reuse the existing `useAvailablePaymentGateways` hook (already merges enabledMethods + manualPayments and applies “configured enough” filtering).

### E) Design Customization preview CSS isn’t mode-aware
- In `DesignCustomization.tsx`, `previewCSS = generateBuyerThemeCSS({ backgroundColor: customization.backgroundColor, ... })` always uses the “base” colors, not `lightModeColors`/`darkModeColors` based on `previewThemeMode`.
- So toggling preview mode may not flip the actual theme variables the preview uses.

---

## Implementation plan (what will be changed)

### 1) Design Customization: restore true Dark+Light behavior on mobile/tablet and make controls fully respond
**Goal:** Dark stays dark; Light becomes fully light, including controls cards, backgrounds, and text readability.

**Changes**
1. `src/pages/panel/DesignCustomization.tsx`
   - Make `previewCSS` mode-aware:
     - When `previewThemeMode === 'light'`, feed `generateBuyerThemeCSS` with `customization.lightModeColors` (background/surface/card/text/muted/border) merged with primary/secondary/accent.
     - When `previewThemeMode === 'dark'`, feed it with `customization.darkModeColors`.
   - Ensure `LivePreviewRenderer` receives `customization={{ ...customization, themeMode: previewThemeMode }}` (already done) AND that the color fields used by preview components come from the chosen mode set during preview (so backgrounds don’t remain dark in light mode).

2. `src/components/design/MobileDesignSlider.tsx`
   - Keep the existing `isLight` styling (already present).
   - Add a **theme scope wrapper** so the controls rendering uses the same token system:
     - Wrap the entire slider (or at least the controls subtree + section content) with `className={cn(isLight ? 'light' : 'dark')}`.
     - Ensure the controls “section content” (`renderSection(...)`) is inside that `.light`/`.dark` wrapper so shadcn cards/text/background swap fully.

**Acceptance checks**
- Mobile/tablet Design Customization:
  - Toggle to Light: background becomes light, all cards become white/light, text turns dark and readable, borders become light.
  - Toggle back to Dark: everything returns to the original dark design.
- Desktop preview should continue to work (no regression).

---

### 2) Announcement: ensure it loads from DB and renders; add “second announcement” + richer editing
**Goal:** When enabled in Integrations, storefront shows the announcement reliably. Also support a second announcement + title/description and styling.

**Changes**
1. `src/hooks/useTenant.tsx`
   - Update the `panelFields` selection so `panel_settings` includes `integrations` (and any other needed columns).
   - This makes Storefront reliably receive the stored announcements config.

2. `src/pages/Storefront.tsx`
   - Keep current rendering but adjust it to support either:
     - `integrations.announcements` as a single object (backward compatible), OR
     - `integrations.announcements.items` as an array (new).
   - Render behavior:
     - If multiple items exist and are enabled, show up to 2 stacked bars (or a single bar with rotation if we choose that approach).
     - Ensure a per-item dismiss key in sessionStorage (so dismissing bar #1 doesn’t hide bar #2).

3. `src/pages/panel/Integrations.tsx`
   - Enhance the Announcements integration fields:
     - Announcement 1: title, text/description, icon, linkText, linkUrl, backgroundColor, textColor, enabled
     - Announcement 2: same fields + enabled toggle
   - Save schema to DB under:
     - `integrations.announcements = { enabled: true, items: [ ... ] }`
   - Preserve backward compatibility:
     - If existing config uses `text`/`link`, migrate it into `items[0]` on save (in-memory normalization).

4. `src/components/storefront/AnnouncementBar.tsx`
   - Extend props to support:
     - `id` (unique for sessionStorage dismiss key)
     - `title`, `text`, `icon`, `linkText`, `linkUrl`, colors
   - Add a slightly richer layout (title over description, optional icon pill, improved spacing) while staying lightweight.

**Diagram (how it will work after fix)**

```text
Panel Owner (Dashboard)
┌──────────────────────────┐
│ /panel/integrations      │
│  - Announcements form    │
│  - Save                 ─┼──────────────┐
└──────────────────────────┘              │
                                           ▼
Database (Supabase)
┌──────────────────────────┐
│ panel_settings            │
│ integrations:             │
│  announcements:           │
│   { items:[{...},{...}] } │
└──────────────────────────┘
                                           │
                                           ▼
Tenant Storefront (Public)
┌──────────────────────────┐
│ useTenant() fetch panel   │
│ includes panel_settings   │
│ (integrations included)   │
└──────────────┬───────────┘
               │
               ▼
┌──────────────────────────┐
│ Storefront.tsx            │
│ extracts integrations     │
│ renders AnnouncementBar(s)│
└──────────────┬───────────┘
               │
               ▼
┌──────────────────────────┐
│ AnnouncementBar.tsx       │
│ - checks enabled          │
│ - checks dismiss key      │
│ - renders if allowed      │
└──────────────────────────┘
```

**Acceptance checks**
- After saving an announcement in Integrations, storefront `/` shows the bar immediately.
- Second announcement (if enabled) also appears (stacked or rotated).
- Dismiss works per announcement item.

---

### 3) Tenant Services (/services): make it use unified logic and show all categories consistently
**Goal:** Public services listing matches category breadth and arrangement logic from unified hook so buyers see “all platforms”.

**Changes**
1. `src/pages/buyer/BuyerPublicServices.tsx`
   - Replace raw `services` query usage with `useUnifiedServices({ panelId })`.
   - Build categories from `categoriesWithServices` (already computed reliably from services).
   - Keep guest UX (prompt to sign up), but categories/grouping must match unified logic.
   - Optional improvement: render sub-groups (followers/likes/views) using `detectServiceType` for better structure.

2. `src/pages/TenantRouter.tsx`
   - Keep the route mapping as-is, but now `/services` will be powered by unified services logic via the updated BuyerPublicServices.

**Acceptance checks**
- Tenant `/services` displays categories close to New Order / Fast Order.
- If services contain many platforms, they appear (not capped to ~10).

---

### 4) About Us page: enhance content per panel + add missing translations
**Goal:** About Us should feel professional, per-tenant branded, and not show untranslated keys.

**Changes**
1. `src/pages/buyer/BuyerAbout.tsx`
   - Expand content slightly (still simple) using panel branding:
     - Title: “About {panel.name}”
     - 2–3 paragraphs:
       - Mission/what we do
       - What buyers can expect (delivery/support/security)
     - A small “Why choose us” bullet list (3 bullets)
     - CTA button to Contact
   - Use `panel.custom_branding.footerAbout` / `description` as source-of-truth; if missing, use translation defaults.

2. `src/lib/platform-translations.ts`
   - Add keys for About page in all supported languages (at least the same 10 currently present):
     - `buyer.about.title`
     - `buyer.about.subtitle`
     - `buyer.about.missionTitle`
     - `buyer.about.missionBody`
     - `buyer.about.whyTitle`
     - `buyer.about.bullet1/2/3`
     - `buyer.about.contactCta`
     - Keep existing `buyer.about.defaultDescription` but ensure consistency.

**Acceptance checks**
- `/about` shows good English text by default.
- Switching languages does not show raw keys.

---

### 5) Payment Management clarification + upgrade/subscription separation
**Goal:** “Payment management” should not be confused with “subscription billing”, and the UI should direct users correctly.

**Changes**
1. `src/pages/panel/PaymentMethods.tsx`
   - Enhance the Billing & Deposits tab with explicit sections:
     - “Buyer Deposits & Approvals” (UnifiedTransactionManager)
     - “Subscription & Plan” (read current plan from `panel_subscriptions` and link to `/panel/billing` for upgrades)
     - “Platform Billing Gateways” (admin-controlled)
   - Update the explanatory alert text to clearly differentiate:
     - Buyer payment methods = what your customers use on tenant
     - Billing/subscription = what you (panel owner) use to pay the platform; managed in `/panel/billing`

2. (Optional) Keep `src/pages/panel/Billing.tsx` as the canonical subscription management page; PaymentMethods will link there rather than duplicating flows.

**Acceptance checks**
- PaymentMethods page clearly explains subscription vs buyer payment configuration and includes a link to subscription management.

---

### 6) Fast Order: show manual payments (and any enabled buyer methods) exactly like Deposit does
**Goal:** If you enable manual transfer/manual methods, they appear in Fast Order payment selection.

**Changes**
1. `src/components/storefront/FastOrderSection.tsx`
   - Replace its custom “enabledMethods parsing” with `useAvailablePaymentGateways` (or reuse the same filtering logic) so it merges:
     - `payments.enabledMethods` AND `payments.manualPayments`
   - Map returned `gateways` into the payment UI’s `PaymentMethod` cards.
   - For manual methods:
     - If multiple manual methods exist, show a “Bank Transfer” card that triggers a selector (same behavior as BuyerDeposit’s `manual_selector` pattern).
     - If single manual method, show it directly.
   - Ensure the selected gateway id passed to `process-payment` matches the manual id (e.g., `manual_xxx`) or `manual_transfer`.

**Acceptance checks**
- Enable manual method in panel Payment Methods → it appears in tenant Fast Order.
- Multiple manual methods → selector behavior works.
- Non-manual configured gateways still appear only when configured enough.

---

## Scope note (what I will not start in this pass)
- Deep refactors of service import provider workflows beyond improving tenant category display and fixing the unified logic usage in the public services page.
- Any new “provider marketplace/ads” feature (out of scope for the listed issues).

---

## Testing plan (must be done end-to-end)
1) Design Customization:
   - Mobile + Tablet views: toggle Dark/Light and confirm background + cards + text flip fully.
2) Announcements:
   - Save Announcement 1 in Integrations → confirm on storefront `/`.
   - Add Announcement 2 → confirm it also renders (stacked or rotated).
   - Dismiss one → ensure the other is still visible.
3) Services:
   - Compare categories count between `/new-order`, `/fast-order`, `/services` (guest) for the same tenant.
4) Payments:
   - Enable a manual payment method in panel Payment Methods.
   - Visit tenant Fast Order payment step → confirm manual method appears.
5) About:
   - Visit `/about` in multiple languages, confirm no raw translation keys.

---

## Files expected to change
- `src/hooks/useTenant.tsx` (include `integrations` in panel_settings select)
- `src/pages/Storefront.tsx` (read new announcements schema, render multiple)
- `src/components/storefront/AnnouncementBar.tsx` (support item ids + richer layout)
- `src/pages/panel/Integrations.tsx` (announcement editor: title/desc/icon + second announcement + schema)
- `src/pages/buyer/BuyerPublicServices.tsx` (useUnifiedServices + categoriesWithServices)
- `src/pages/buyer/BuyerAbout.tsx` (enhanced content)
- `src/lib/platform-translations.ts` (buyer.about.* keys for all supported languages)
- `src/pages/panel/DesignCustomization.tsx` (mode-aware previewCSS using lightModeColors/darkModeColors)
- `src/components/design/MobileDesignSlider.tsx` (add `.light/.dark` wrapper so controls also fully switch)
- `src/components/storefront/FastOrderSection.tsx` (useAvailablePaymentGateways / include manualPayments)

