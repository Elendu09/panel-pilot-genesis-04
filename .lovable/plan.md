

# Plan: Design Customization Rendering, Domain TXT Verification, Announcement Dropdowns, Multi-Panel Architecture

## 1. Design Customization — Ensure All Settings Render on Storefront

**Problem**: The design customization UI for typography, layout/spacing, animations, backgrounds, and buttons all correctly save values to `custom_branding`, and `getButtonStyles` in `theme-utils.ts` correctly reads `buttonRadius`, `buttonStyle`, `buttonShadow`, and `buttonHoverEffect`. However:
- **Background patterns**: `getBackgroundStyles` exists in `theme-utils.ts` but is **never imported or used** by any buyer theme. Patterns configured in the UI have zero effect.
- **Typography**: Themes read `fontFamily` but only apply it as a CSS class (`font-inter`), not as an inline style. The `baseFontSize` slider is read but not applied as a root font size in most themes. `headingWeight`, `bodyWeight`, `lineHeight`, `letterSpacing` are saved but ignored by themes.
- **Spacing**: `sectionPaddingY` and `containerMaxWidth` are read by some themes but `cardSpacing` and `elementGap` are not used anywhere.
- **Animations**: `animationStyle` and `animationDuration` are saved but themes use hardcoded framer-motion variants, not the configurable values.

**Fix approach**: Rather than rewriting all 5+ themes, create a shared CSS variable injection in `Storefront.tsx` (where all themes render) that converts design customization into CSS custom properties. Themes already render inside this wrapper.

**Files**:
- **`src/pages/Storefront.tsx`**: Add a `<style>` block that injects CSS custom properties from `customization`:
  - `--font-family`, `--heading-font`, `--base-font-size`, `--heading-weight`, `--body-weight`, `--line-height`, `--letter-spacing`
  - `--section-padding-y`, `--container-max-width`, `--card-spacing`, `--card-radius`, `--element-gap`
  - `--button-radius`, `--animation-duration`
  - Background pattern via `getBackgroundStyles()` applied to the main wrapper
- **`src/lib/theme-utils.ts`**: Add a new `generateDesignCSSVariables(customization)` function that returns a CSS string with all the variables
- **`src/components/buyer-themes/shared/ThemeNavigation.tsx`** and each theme's `<main>` tag: Add `style={{ fontFamily: 'var(--font-family, Inter)' }}` so typography propagates. Apply `fontSize: 'var(--base-font-size, 16px)'` to the root element.

This ensures ALL saved settings actually render without rewriting each theme individually.

## 2. Domain Configuration — Strict TXT Verification Before DNS

**Problem**: Currently, when a user clicks "Add Domain", the domain is immediately added to `panel_domains` with `verification_status: 'pending'` and `custom_domain` is set on the panel. DNS records (A, CNAME) are shown. There's no TXT verification step — the user could configure DNS without proving ownership.

**Fix**: Implement a 2-step flow:
1. **Step 1 — TXT Verification**: After entering domain, show ONLY the TXT record (`_lovable TXT lovable_verify={token}`). The domain is inserted with `verification_status: 'txt_pending'`. The panel's `custom_domain` is NOT set yet.
2. **Step 2 — DNS Configuration**: Only after TXT is verified (via `domain-health-check` edge function checking TXT record), show A and CNAME records. Update status to `pending` (DNS pending). Set `custom_domain` on panel only after DNS is also verified.

**Files**:
- **`src/pages/panel/DomainSettings.tsx`**:
  - `handleAddDomain`: Insert with `verification_status: 'txt_pending'`, do NOT update `panels.custom_domain` yet
  - Add a new `verifyTxtRecord` function that calls the edge function to check only TXT
  - In the domain card UI: when `verification_status === 'txt_pending'`, show ONLY the TXT record with a "Verify TXT" button. Hide A/CNAME records
  - When `verification_status === 'pending'` (TXT verified, DNS pending), show A/CNAME records and the "Verify DNS" button
  - Only set `panels.custom_domain` when full verification (`verified`) succeeds
  - Update `getStatusBadge` to handle `txt_pending` status
  - In `handleAddDomain`, use `activePlan` instead of `panel?.subscription_tier` for the tier check (line 198)

## 3. Announcement Integration — Replace Text Inputs with Dropdowns

**Problem**: The announcement configuration dialog uses plain text inputs for `icon` and `displayMode` fields, requiring users to type values like "megaphone" or "header" manually.

**Fix**: Add a `select` field type to the dynamic field renderer.

**Files**:
- **`src/pages/panel/Integrations.tsx`**:
  - Change the `icon` field definition (line 391) from `type: 'input'` to `type: 'select'` with options array: `[{value: 'megaphone', label: 'Megaphone'}, {value: 'sparkles', label: 'Sparkles'}, {value: 'gift', label: 'Gift'}, {value: 'bell', label: 'Bell'}, {value: 'info', label: 'Info'}, {value: 'star', label: 'Star'}, {value: 'zap', label: 'Zap'}, {value: 'alert', label: 'Alert'}]`
  - Change the `displayMode` field (line 392) from `type: 'input'` to `type: 'select'` with options: `[{value: 'header', label: 'Header Bar (top)'}, {value: 'popup', label: 'Popup (modal dialog)'}]`
  - Change the `backgroundColor` field to `type: 'color'`
  - Change the `textColor` field to `type: 'color'`
  - Update the `ServiceIntegration` field type to include `'select' | 'color'`
  - Add `options?: {value: string; label: string}[]` to the field interface
  - In the dynamic fields renderer (line 1121-1143), add handlers for `select` (render a `<select>`) and `color` (render a color picker with hex input)

## 4. Multi-Panel Architecture — Planning Only

This is a significant architectural change. The current system assumes 1 profile = 1 panel (enforced by `owner_id` single panel queries). Multi-panel requires:

```text
Current:  User → Profile → 1 Panel
Proposed: User → Profile → N Panels (gated by plan)
          Free: 1 panel
          Basic: 2 panels (1 registered + 1 free)
          Pro: 5 panels (1 registered + 4 free, 1 of which gets Basic plan)
```

**Key changes needed** (for future implementation):
1. Panel switcher UI in sidebar (like Facebook page switching)
2. Remove `.single()` from all panel queries, add `active_panel_id` to profiles
3. "Create New Panel" flow that reuses onboarding but skips billing
4. Panel creation gating based on subscription tier count limits
5. Auto-assign plans to bonus panels (Pro gets 1 Basic + 3 Free)

**This will NOT be implemented now** — it requires database schema changes and careful migration. This plan item is documented for future reference.

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Storefront.tsx` | Inject CSS variables for all design customization settings |
| `src/lib/theme-utils.ts` | Add `generateDesignCSSVariables()` function |
| `src/pages/panel/DomainSettings.tsx` | Implement 2-step TXT→DNS verification flow; use `activePlan` for tier check |
| `src/pages/panel/Integrations.tsx` | Add `select` and `color` field types; convert announcement icon/displayMode to dropdowns |

