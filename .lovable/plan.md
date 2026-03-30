

# Plan: Payment Gateway Validation, SMTP Email Templates, Design Theme Mode Fix, and Hero Section Image Upload

## Issues Identified

### 1. Utrust → xPortal Rebranding
**Problem**: "Utrust" rebranded to "xPortal" (MultiversX ecosystem). The gateway entry still shows old name `utrust` with old docs URL `https://docs.utrust.com` (likely dead). Icon uses generic "UT" letters.
**Fix**: Rename to "xPortal" (id remains `utrust` for backward compat), update `docsUrl` to `https://xportal.com`, update icon text from "UT" to "XP" with xPortal green (#23F7DD), update display name in `gatewayFieldLabels` and `gatewaySetupSteps`.

### 2. Payment Gateway Configuration Completeness
**Problem**: Many gateways have field labels and setup steps but the `process-payment` edge function only handles ~10 gateways (Stripe, PayPal, Paystack, Flutterwave, Razorpay, Korapay, Coinbase, Cryptomus, Heleket). The remaining 190+ gateways have config UI but no actual payment URL redirect logic — when a panel owner sets them up and a tenant tries to pay, nothing happens.
**Fix**: This is a known architectural limitation — most gateways need individual API integration in the edge function. For this plan: add a "redirect-based" generic handler for gateways that support simple hosted checkout (like Paddle, Mollie, PayU, etc.) where the API pattern is: POST to create a payment → get redirect URL → return to client. Add documentation notes on each gateway card showing "Fully integrated" vs "Configuration only — webhook listener required" status.

### 3. OAuth Tokens Security Check
**Finding**: The `panel_settings_public` view (migration `20260212`) correctly uses `security_barrier=true` and only exposes `client_id` columns (not `client_secret`). OAuth secrets are NOT exposed to anonymous users. **No fix needed.**

### 4. SMTP Email Templates for Reset & Verify
**Problem**: The SMTP config section in `GeneralSettings.tsx` (lines 508-574) only collects host/port/credentials/from fields. There is NO template editor for password reset or email verification emails. When SMTP sends emails, it uses a hardcoded plain text format in the edge function. Panel owners should be able to customize the email subject and body template.
**Fix**: Add two template editors below the SMTP config section:
- "Password Reset Email" template (subject + HTML body with `{temp_password}`, `{username}`, `{panel_name}` variables)
- "Email Verification" template (subject + HTML body with `{verify_link}`, `{username}`, `{panel_name}` variables)
- Include default templates and a "Reset to default" button
- Store templates in `panel_settings` as `smtp_reset_template` and `smtp_verify_template` JSON fields

### 5. Design Customization Theme Mode Bug
**Problem**: The design customization page's `themeMode` toggle (line 1714-1716) updates `customization.themeMode` which gets saved to `custom_branding.themeMode` in the database. This `themeMode` value is the **panel owner's intended default theme** for the tenant storefront. However, the issue is that the panel owner's own admin dashboard runs inside a `ThemeProvider` that dispatches `theme-change` CustomEvents. The `BuyerThemeContext` (line 82-91) listens for these events and syncs — meaning when the admin toggles their own dashboard to light mode, it can leak into the saved buyer theme context via localStorage.

The core bug: `BuyerThemeContext` listens to `theme-change` events globally (line 82-91). When the panel owner toggles their own dashboard theme (via `ThemeToggle`), this event fires, and if any `BuyerThemeProvider` instance exists in memory, it picks it up and saves to `buyer-theme-{panelId}` localStorage. Later when a tenant visits, their localStorage override takes precedence over the DB-saved `themeMode`.

**Fix**: 
- In `BuyerThemeContext`, filter `theme-change` events by checking `source` — only sync when `source === 'buyer'`, not when the admin panel theme changes
- Ensure `DesignCustomization.tsx` does NOT dispatch `theme-change` events to the global window when toggling the preview theme (it currently doesn't, but the admin ThemeToggle does)
- The `themeMode` saved in `custom_branding` should be the single source of truth for tenant default; buyer localStorage should only override when the tenant buyer explicitly toggles

### 6. Hero Section Image Upload
**Problem**: No hero image upload exists in design customization. The user wants panel owners to upload an image that appears beside hero text on desktop (and optionally mobile).
**Fix**: 
- Add `heroImageUrl` and `enableHeroImage` fields to `defaultCustomization`
- Add an "Hero Image" section in the Hero design panel with: enable toggle, `ImageUpload` component, and a position selector (left/right of text)
- Update all theme components (`ThemeOne` through `ThemeFive` and premium themes) to render the hero image in a 2-column layout on desktop when enabled: text on one side, image on the other
- On mobile: stack image below or above the text, scaled to fit
- The image should be contained (not cropped) with `object-contain` and max-height constraints

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/PaymentMethods.tsx` | Rename Utrust → xPortal; update docsUrl, field labels, setup steps |
| `src/components/payment/PaymentIconsExtended.tsx` | Update UtrustIcon to "XP" with xPortal brand color |
| `src/pages/panel/GeneralSettings.tsx` | Add SMTP email template editors (reset + verify) with variable placeholders |
| `src/contexts/BuyerThemeContext.tsx` | Filter `theme-change` events to only sync when `source === 'buyer'`, ignore admin dashboard theme changes |
| `src/pages/panel/DesignCustomization.tsx` | Add `heroImageUrl`, `enableHeroImage`, `heroImagePosition` to defaultCustomization; add Hero Image upload section in Hero settings |
| `src/components/themes/ThemeOne.tsx` | Render hero image in 2-column layout when `enableHeroImage` is true |
| `src/components/themes/ThemeTwo.tsx` | Same hero image rendering |
| `src/components/themes/ThemeThree.tsx` | Same hero image rendering |
| `src/components/themes/ThemeFour.tsx` | Same hero image rendering |
| `src/components/themes/ThemeFive.tsx` | Same hero image rendering |
| Premium buyer themes (TGRef, AliPanel, FlySMM, SMMStay, SMMVisit) | Same hero image rendering |
| Database migration | Add `smtp_reset_template`, `smtp_verify_template` JSONB columns to `panel_settings` |

