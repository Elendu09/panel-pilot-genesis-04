

# Plan: Fix Tenant Auth (Username Forgot-Password, Email Delivery, Password Issues), Service Type UI, and Live Chat Panel ID

## Summary of Issues Found

1. **Username login**: Already works (line 578 queries `email OR username`). No fix needed.
2. **Forgot password**: Only accepts email, not username. Also, no email is actually sent — the edge function generates a temp password and logs it but never delivers it.
3. **Email verification**: Same — generates a token and logs it but never sends an email.
4. **Incorrect password**: The PBKDF2 verification logic is correct. However, users with very old `password_temp` plaintext values may fail because `password_temp` is only checked after `password_hash` fails, and only as a fallback in the hash comparison. If `password_hash` is null and `password_temp` has a plaintext value, the code at line 610 reads `user.password_hash || user.password_temp` which should work. The real root cause for "incorrect password" for old users is likely that their passwords were hashed with the legacy base64 PBKDF2 format and the comparison at line 404-409 has a bug (it compares `hashHex` to itself via `storedHex` which is computed from the same `hashArray`). This needs fixing.
5. **Drip feed UI**: Exists in BuyerNewOrder but missing from FastOrderSection.
6. **Other service types (poll, subscription)**: No UI in either order flow.
7. **Missing panel ID in live chat**: `handleStartChat` checks `!panel?.id` from `useTenant()` — if the hook hasn't resolved yet, the error fires. Need to use `panelId` from `BuyerAuthContext` as fallback.
8. **Continue with AI**: The modal exists but just reopens the FloatingChatWidget AI chatbot (scripted responses). This is functional as-is — the "AI" is the built-in pattern-matching chatbot.

---

## 1. Forgot Password: Accept Username or Email

**File**: `supabase/functions/buyer-auth/index.ts` (handleForgotPassword)

- Accept an `identifier` field (not just `email`)
- If identifier is not an email format, look up via `username` (case-insensitive) to find the associated email
- Then proceed with the existing temp password generation flow

**File**: `src/pages/buyer/BuyerAuth.tsx`

- Change the forgot password dialog to accept "Email or Username" instead of just "Email"
- Send `identifier` instead of `email` to the edge function

---

## 2. Actually Send Password Reset & Verification Emails

**File**: `supabase/functions/buyer-auth/index.ts`

The forgot-password handler (line 1100-1129) generates a new temp password but never emails it. The resend-verification handler (line 1290-1373) generates a token but never sends it.

**Fix**: Instead of sending a reset link (which requires a token-based flow), the current approach generates a new temp password. We need to actually deliver it to the user. Options:

- Use the platform's transactional email system if configured
- As a pragmatic fix: **return the new temporary password in the response** and show it to the user in a dialog with instructions to log in and change it immediately. This mirrors how many SMM panels handle password resets (display temp password on screen).

**Implementation**:
- In `handleForgotPassword`: return `{ success: true, tempPassword: newPassword }` (already generates it, just needs to return it)
- In `BuyerAuth.tsx`: Show a dialog with the temp password after successful reset, with a "Copy" button and instructions
- For email verification: Since the user chose "optional reminder" — mark all new accounts as active by default (already the case), and add a banner in the dashboard reminding unverified users to verify. No blocking.

---

## 3. Fix Legacy Base64 PBKDF2 Password Comparison Bug

**File**: `supabase/functions/buyer-auth/index.ts` (line 406-409)

Current bug:
```typescript
const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
const storedHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
if (hashHex === storedHex) return true; // ALWAYS TRUE — compares same value
```

This "fallback" hex comparison always returns true because both `hashHex` and `storedHex` are derived from the same `hashArray` (the computed hash), not compared against the stored hash. This means any password matches for legacy base64 hashes after the initial b64 comparison fails.

**Fix**: Remove the broken fallback (lines 406-409). The base64 comparison above it is the correct check. If it fails, the password is wrong.

---

## 4. Add Drip Feed UI to FastOrderSection

**File**: `src/components/storefront/FastOrderSection.tsx`

- Add `dripFeedRuns` and `dripFeedInterval` state variables
- After the quantity input, conditionally show Drip Feed fields when the selected service has `dripfeed_available === true`
- Pass `runs` and `interval` params in the order submission body (same pattern as BuyerNewOrder)

---

## 5. Add Poll & Subscription Service Type Fields

**Files**: `src/pages/buyer/BuyerNewOrder.tsx`, `src/components/storefront/FastOrderSection.tsx`

For services with `service_type === 'poll'`:
- Show an "Answers" textarea (comma-separated poll options)
- Pass `answers` in order body

For services with `service_type === 'subscriptions'`:
- Show an "Expiry" date picker or duration selector
- Pass `expiry` in order body

These fields render conditionally based on `selectedService.service_type`.

---

## 6. Fix "Missing Panel ID" in Tenant Live Chat

**File**: `src/pages/buyer/BuyerSupport.tsx`

The `handleStartChat` function (line 346) checks `!panel?.id` from `useTenant()`. The `panel` may not have resolved yet when the user clicks "New Chat".

**Fix**:
- Use `panelId` from `useBuyerAuth()` as the primary source (already available and resolved before the support page renders since auth redirects unauthenticated users)
- Fallback to `panel?.id` from `useTenant()`
- Update `handleStartChat`, `handleSendChatMessage`, `handleQuickReply`, and chat session fetching to use this resolved panel ID
- Disable the "New" chat button while panel ID is still resolving

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/buyer-auth/index.ts` | Fix forgot-password to accept username; return temp password; fix legacy PBKDF2 comparison bug (remove self-comparing hex fallback) |
| `src/pages/buyer/BuyerAuth.tsx` | Update forgot password dialog to accept username or email; show temp password in dialog after reset |
| `src/pages/buyer/BuyerSupport.tsx` | Use `panelId` from `useBuyerAuth()` as primary; disable New Chat button while loading |
| `src/components/storefront/FastOrderSection.tsx` | Add drip feed UI (runs/interval) for supported services |
| `src/pages/buyer/BuyerNewOrder.tsx` | Add poll answers and subscription expiry fields |

