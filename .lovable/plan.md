

# Plan: Fix Tenant Auth, Temp Password System, Live Chat Panel ID, Support Tickets, Panel Owner Support & FAQ Management

## Issues Identified

1. **Auth "incorrect password"**: The forgot-password handler references undefined `normalizedEmail` (line 1105) and **overwrites `password_hash`** with the temp password hash, destroying the user's real password. Customer Management temp password likely does the same.
2. **Tenant password reset does not send email**: Returns temp password in UI only. No email integration.
3. **Tenant verify email**: Logs token but never sends email. Just UI.
4. **Missing panel ID in live chat**: Still happening per screenshot. `resolvedPanelId` uses `authPanelId || panel?.id` but both can be null if context hasn't loaded.
5. **Failed to create support ticket**: RLS policy issue - buyer tickets inserted via edge function but the function may be failing.
6. **Panel owner support tickets show "Loading..."**: `fetchPlatformTickets` queries `support_tickets` with `user_id = profile.id` which requires proper RLS.
7. **Panel owner SupportCenter default tab**: Set to "knowledge", should be "livechat".
8. **Panel owner FAQ management**: No UI for panel owners to add/edit FAQs shown to tenant users.
9. **Panel owner admin support**: Ticket creation exists for platform tab. No live chat to admin.
10. **Customer Management temp password**: Need to verify it doesn't overwrite main password; add expiry configuration.
11. **Continue with AI**: No real AI integration in live chat.

---

## 1. Fix Forgot-Password: Don't Overwrite Main Password, Fix Variable Bug

**File**: `supabase/functions/buyer-auth/index.ts`

- Line 1105: Fix `normalizedEmail` to `trimmedIdentifier`
- **Critical**: Instead of overwriting `password_hash`, store the temp password hash in `password_temp` with an expiry timestamp. The main `password_hash` stays intact.
- Login handler already checks `password_hash || password_temp` (line 605), but we need to also check `password_temp` **independently** so both the real password AND the temp password work during the temp window.

**Changes to login handler** (around line 604-648):
- Try `password_hash` first. If match, login succeeds.
- If not, try `password_temp` (if set and not expired). If match, login succeeds.
- This ensures the real password always works, and the temp password also works within its validity window.

**Changes to forgot-password handler** (around line 1119-1141):
- Store temp password in `password_temp` (not `password_hash`)
- Store expiry in a new field or encode it in the temp value (e.g., `$pbkdf2-hex$...$exp:1234567890`)
- Return `tempPassword` to UI as currently done

---

## 2. Add Temp Password Expiry in Customer Management

**File**: `supabase/functions/panel-customers/index.ts` (or wherever temp password generation happens for panel owners)

- When panel owner clicks "Generate Temp Password", prompt for duration (minutes/hours/days)
- Store hashed temp password in `password_temp` with expiry metadata
- Main `password_hash` remains unchanged

**Database**: Add `password_temp_expires_at` column to `client_users` via migration.

---

## 3. SMTP/Email Integration for Panel Owners (Basic/Pro)

Panel owners on Basic/Pro plans can configure their own SMTP settings to send password reset and verification emails to their tenant users.

**File**: `src/pages/panel/GeneralSettings.tsx`
- Add "Email Configuration" section with SMTP fields: host, port, username, password, from email, from name
- Save to `panel_settings.smtp_config`

**File**: `supabase/functions/buyer-auth/index.ts`
- In forgot-password and resend-verification handlers, check if panel has SMTP configured
- If configured, send actual email via SMTP with the temp password or verification link
- If not configured, return temp password in UI (current behavior)

---

## 4. Fix Live Chat "Missing Panel ID" - Root Cause

The screenshot shows `resolvedPanelId` is null. The issue is `authPanelId` from `useBuyerAuth()` can be null before the auth context finishes loading.

**File**: `src/pages/buyer/BuyerSupport.tsx`
- Add a loading guard: disable "New Chat" button while `!resolvedPanelId`
- Add `panelId` from localStorage as tertiary fallback: `authPanelId || panel?.id || localStorage.getItem('current_panel_id')`
- Show "Connecting..." instead of allowing chat start while panel ID resolves

---

## 5. Fix Support Ticket Creation (RLS)

The edge function `handleCreateSupportTicket` uses `supabaseAdmin` (service role), so RLS shouldn't block it. But the error in the screenshot suggests the function may be receiving incomplete data.

**File**: `src/pages/buyer/BuyerSupport.tsx`
- Ensure `panel.id` is available before allowing ticket creation (use `resolvedPanelId` instead of `panel?.id`)
- Pass `panelId: resolvedPanelId` in the edge function call

**File**: `supabase/functions/buyer-auth/index.ts`
- Add better error logging in `handleCreateSupportTicket` to surface the actual DB error

---

## 6. Fix Panel Owner Support: Default to Live Chat Tab

**File**: `src/pages/panel/SupportCenter.tsx`
- Change `useState("knowledge")` to `useState("livechat")` (line 66)

---

## 7. Panel Owner FAQ Management

**File**: `src/pages/panel/SupportCenter.tsx` or new component
- Add a "FAQ Management" section in the Knowledge tab
- CRUD interface: Add question/answer, edit existing, delete, reorder
- Save FAQs to `panels.custom_branding.faqs` (already read by tenant BuyerSupport)

---

## 8. Panel Owner Admin Support (Ticket + Live Chat for Basic/Pro)

**Current state**: Platform tab already has ticket creation for all plans.

**Enhancement**:
- For Basic/Pro plan owners, add a "Live Chat with Admin" button in the Platform tab
- This creates a chat session with `panel_id = 'admin'` or a special admin identifier
- Free plan: ticket only (already works)

---

## 9. Continue with AI in Tenant Live Chat

**File**: `src/pages/buyer/BuyerSupport.tsx`
- The "Continue with AI" button currently opens `FloatingChatWidget`
- Enhance: Instead of opening a separate widget, inject AI responses directly into the chat thread
- Use a simple pattern-matching bot (already exists in FloatingChatWidget) to respond inline when AI is activated

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/buyer-auth/index.ts` | Fix `normalizedEmail` bug; store temp password in `password_temp` not `password_hash`; check both passwords on login; add SMTP sending logic |
| `src/pages/buyer/BuyerSupport.tsx` | Fix panel ID fallback with localStorage; use `resolvedPanelId` for ticket creation; fix Continue with AI inline |
| `src/pages/panel/SupportCenter.tsx` | Default tab to "livechat"; add FAQ management UI |
| `src/pages/panel/GeneralSettings.tsx` | Add SMTP configuration section |
| Database migration | Add `password_temp_expires_at` column to `client_users` |

