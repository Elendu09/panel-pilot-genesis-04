

# Plan: Onboarding Edit, Domain Sync, 2FA Backup Fix, Password Reset, Order Creation Fix

## 1. Order Creation Fix — ROOT CAUSE FOUND (Critical)

The `order_status` database enum only contains: `pending`, `in_progress`, `completed`, `cancelled`, `partial`.

The `buyer-order` edge function uses two statuses that **don't exist in the enum**:
- Line 190: `status: 'awaiting_payment'` — fails the INSERT, causing "Failed to create order"
- Line 79: `status: 'processing'` — fails the UPDATE after provider forwarding

This affects both **New Order** and **Fast Order** for tenants.

**Fix:**
- Add `processing` and `awaiting_payment` to the `order_status` enum via migration
- Also update CORS headers in `buyer-order` to match the platform standard

**Files:** Database migration, `supabase/functions/buyer-order/index.ts` (CORS headers)

---

## 2. Forgot Password — Missing Reset Page

The `resetPasswordForEmail` redirects to `/auth?type=recovery`, but `Auth.tsx` has **no code to handle `type=recovery`**. When Supabase redirects back with recovery tokens, the Auth page just auto-logs the user in without showing a "set new password" form.

**Fix:**
- In `Auth.tsx`, detect `type=recovery` from search params
- Show a "Set New Password" form with a password input and confirm
- Call `supabase.auth.updateUser({ password })` to actually update the password
- Show this form instead of the normal login/signup tabs

**Files:** `src/pages/Auth.tsx`

---

## 3. Onboarding Last Step — Add Edit/Review Buttons

The "Ready to Launch" step shows a configuration summary (Panel Name, Plan, Domain, Theme, Currency, SEO) but has no way to go back and edit individual items.

**Fix:**
- Add a small "Edit" button/icon on each summary card item
- Clicking it navigates back to the corresponding step (e.g., clicking Edit on "Domain" goes to step 3)
- The step stepper already supports `setCurrentStep()` so this is straightforward

**Files:** `src/pages/panel/PanelOnboardingV2.tsx` (lines 1039-1110)

---

## 4. Onboarding Domain → Domain Management Sync

When a user sets up a custom domain during onboarding and DNS is verified, the domain is NOT synced to `panel_domains`. The `handleComplete` function only saves `custom_domain` on the `panels` table but never creates a `panel_domains` record.

**Fix:**
- In `handleComplete` (line 573), after panel creation/update, if `domainType === 'custom'` and `customDomain` is set, insert a record into `panel_domains` with the domain, verification token, and status
- Add a unique constraint on `panel_domains.domain` (currently unique is only on `panel_id + domain`) to prevent the same domain from being added to multiple panels

**Two TXT records issue (`_homeofsmm` and `_smmpilot`):**
- `_homeofsmm` comes from `VercelIntegrationSettings.tsx` (admin Vercel config, legacy reference)
- `_smmpilot` is the correct platform TXT record used in `DomainSettings.tsx` and `OnboardingDomainStep.tsx`
- The `_homeofsmm` reference in admin settings is a leftover from a previous project name and should be updated to `_smmpilot` for consistency

**Files:** `src/pages/panel/PanelOnboardingV2.tsx`, `src/components/admin/VercelIntegrationSettings.tsx`, database migration for unique domain constraint

---

## 5. 2FA Backup Codes — Gate Behind 2FA Enablement

Currently, the "Panel Backup Codes" section in SecuritySettings Recovery tab lets users generate codes regardless of 2FA status.

**Fix:**
- In SecuritySettings Recovery tab, disable/hide the "Generate Backup Codes" button if `enforce2FA` is false AND MFA is not active on the user's account
- Show a message: "Enable 2FA first to generate backup codes"
- The backup codes in `TwoFactorSetup.tsx` are already properly gated (only shown after MFA enrollment) — this is correct
- Fix mobile width issue: the backup code grid (`grid grid-cols-2`) overflows on small screens. Add `overflow-x-auto` and `min-w-0` to the container, and use `break-all` or `text-xs` on the code text

**Files:** `src/pages/panel/SecuritySettings.tsx` (lines 1457-1533), `src/components/auth/TwoFactorSetup.tsx`

---

## Summary of Files to Change

| File | Change |
|------|--------|
| Database migration | Add `processing`, `awaiting_payment` to `order_status` enum; add unique index on `panel_domains.domain` |
| `supabase/functions/buyer-order/index.ts` | Update CORS headers |
| `src/pages/Auth.tsx` | Add password recovery form when `type=recovery` |
| `src/pages/panel/PanelOnboardingV2.tsx` | Add Edit buttons on summary step; sync domain to `panel_domains` on complete |
| `src/pages/panel/SecuritySettings.tsx` | Gate backup codes behind 2FA; fix mobile width overflow |
| `src/components/auth/TwoFactorSetup.tsx` | Fix mobile backup code grid overflow |
| `src/components/admin/VercelIntegrationSettings.tsx` | Change `_homeofsmm` to `_smmpilot` |

