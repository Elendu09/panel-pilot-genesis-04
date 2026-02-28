

# Plan: Design Customization Rendering, Domain TXT Verification, Announcement Dropdowns, Multi-Panel Architecture

## Status: ✅ Implemented (Items 1-3), 📋 Documented (Item 4)

## 1. ✅ Design Customization — CSS Variable Injection
- Added `generateDesignCSSVariables()` to `theme-utils.ts`
- Injected in `Storefront.tsx` — all typography, spacing, button, animation settings now render as CSS variables
- Variables cascade to all themes via `.buyer-theme-wrapper` selector

## 2. ✅ Domain Configuration — Strict 2-Step TXT→DNS Flow
- Step 1: TXT record shown first, status `txt_pending`, panel `custom_domain` NOT set
- Step 2: After TXT verified → DNS records shown, status `pending`
- Only after DNS verified → `custom_domain` set on panel, status `verified`
- Uses `activePlan` from `panel_subscriptions` for tier check

## 3. ✅ Announcement Integration — Dropdowns & Color Pickers
- `icon` field → `select` dropdown with emoji-labeled options
- `displayMode` field → `select` dropdown (Header/Popup)
- `backgroundColor`/`textColor` → native color picker + hex input

## 4. 📋 Multi-Panel Architecture — Future Implementation

```text
Current:  User → Profile → 1 Panel
Proposed: User → Profile → N Panels (gated by plan)
          Free: 1 panel
          Basic: 2 panels (1 registered + 1 free)
          Pro: 5 panels (1 registered + 4 free, 1 of the 4 gets Basic plan)
```

**Key changes needed** (for future implementation):
1. Panel switcher UI in sidebar (like Facebook page switching)
2. Remove `.single()` from all panel queries, add `active_panel_id` to profiles
3. "Create New Panel" flow that reuses onboarding but skips billing
4. Panel creation gating based on subscription tier count limits
5. Auto-assign plans to bonus panels (Pro gets 1 Basic + 3 Free)

**This will NOT be implemented now** — requires database schema changes and careful migration.
