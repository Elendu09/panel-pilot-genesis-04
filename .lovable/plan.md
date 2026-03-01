

# Plan: Panel Number Fix, Real 2FA Implementation, API Verification

## Issue 1: Panel Number Badge Shows Total Count Instead of Current Panel Number

**Problem**: In `PanelSwitcher.tsx` line 63-64, the badge on the avatar shows `allPanels.length` (e.g., "2" for 2 panels). The user expects it to show the **current panel's number** (e.g., "1" for AiSoc which was created first).

**Fix in `src/components/panel/PanelSwitcher.tsx`** (line 63-64):
- Change `{allPanels.length}` to `{getPanelNumber(panel?.id || '')}` so it shows the active panel's position number (1 for oldest, 2 for second, etc.)

## Issue 2: Real 2FA (TOTP) Implementation

**Problem**: The "Require Two-Factor (2FA)" toggle in SecuritySettings is purely a UI toggle that saves a boolean to panel settings. It doesn't connect to actual authentication — no TOTP enrollment, no QR code, no verification on login.

**Approach**: Since the installed `@supabase/supabase-js@2.56.0` does **not** include the MFA API (`auth.mfa.enroll/challenge/verify` are absent), we implement TOTP via a custom edge function using a TOTP library (`otpauth`).

### Changes:

**New edge function `supabase/functions/mfa-setup/index.ts`**:
- `action: 'enroll'` — Generates a TOTP secret, returns the secret + otpauth URI (for QR code) + backup codes. Stores the secret encrypted in `profiles.mfa_secret` (new column).
- `action: 'verify'` — Verifies a 6-digit TOTP code against the stored secret. On success, sets `profiles.mfa_verified = true`.
- `action: 'validate'` — Called on login to validate a TOTP code (for the post-login 2FA challenge).
- `action: 'disable'` — Disables MFA, clears `mfa_secret` and `mfa_verified`.
- `action: 'use_backup'` — Validates a backup code, marks it as used.

**New migration**: Add `mfa_secret text`, `mfa_verified boolean default false`, `mfa_backup_codes jsonb` columns to `profiles` table.

**New component `src/components/auth/TwoFactorSetup.tsx`**:
- Shows QR code (using a simple SVG/URL-based QR generator or inline canvas)
- 6-digit OTP input for verification
- Displays backup codes after successful enrollment
- Called from SecuritySettings when user enables 2FA for their own account

**New component `src/components/auth/TwoFactorChallenge.tsx`**:
- Post-login TOTP challenge dialog
- 6-digit input + "Use backup code" link
- Blocks access until verified

**Modified `src/contexts/AuthContext.tsx`**:
- After successful `signIn`, check if user has `mfa_verified = true` in profile
- If yes, set a `needsMfaChallenge` state instead of completing login
- Render `TwoFactorChallenge` overlay until MFA is verified

**Modified `src/pages/panel/SecuritySettings.tsx`**:
- The "Require Two-Factor (2FA)" toggle remains for tenant enforcement
- Add a separate "Enable 2FA for Your Account" section in the Recovery tab
- This section uses `TwoFactorSetup` component to enroll the panel owner
- Backup codes can only be generated when 2FA is enabled (linked together)

## Issue 3: API Verification

**Status**: Both `buyer-api` and `panel-api` edge functions are deployed and responding correctly. The buyer-api properly:
- Returns `{"error": "Invalid API key"}` for bad keys
- Has balance check/deduction before order creation
- Surfaces provider errors in responses
- Returns proper error messages for all actions

No code changes needed for API — already functional.

## Files to Change

| File | Change |
|------|--------|
| `src/components/panel/PanelSwitcher.tsx` | Line 64: Show current panel number instead of total count |
| `supabase/functions/mfa-setup/index.ts` | New edge function for TOTP enroll/verify/validate/disable |
| New migration | Add `mfa_secret`, `mfa_verified`, `mfa_backup_codes` to `profiles` |
| `src/components/auth/TwoFactorSetup.tsx` | New: QR code + OTP enrollment UI |
| `src/components/auth/TwoFactorChallenge.tsx` | New: Post-login 2FA challenge dialog |
| `src/contexts/AuthContext.tsx` | Check MFA status after login, gate access with challenge |
| `src/pages/panel/SecuritySettings.tsx` | Add "Enable 2FA for Your Account" section; link backup codes to 2FA status |
| `src/integrations/supabase/types.ts` | Update profiles type with new columns |

