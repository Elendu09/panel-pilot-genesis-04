

# Plan: Fix Service ID Consistency, Drag-Drop Persistence, Live Chat Issues, Contact Us RLS, and Auth

## 1. Fix Service ID (display_order) Duplication Across Providers

**Problem**: When services are imported from multiple providers, `display_order` is set as `activeCount + idx + 1` per import batch. If Provider A has 100 services (1-100) and then Provider B imports 50 services but `activeCount` fetches stale data, IDs can overlap. Additionally, the fast order page falls back to `index + 1` when `display_order` is missing.

**Fix**:
- In `ServicesManagement.tsx` import logic (line 1787): Before importing, query the current MAX `display_order` for the panel, then assign `maxDisplayOrder + idx + 1` for new inserts only (not updates).
- In `FastOrderSection.tsx` (line 1183) and `BuyerNewOrder.tsx` (line 606): Remove the `(index + 1)` fallback — only show actual `display_order` value. If missing, show nothing or the UUID prefix.
- In `useUnifiedServices.tsx`: Ensure `displayOrder` is always populated from DB `display_order`.

## 2. Fix Drag-Drop: Use `sort_order` Instead of `display_order`

**Problem**: The `sort_order` column already exists in the DB but is never used. Drag-and-drop in `ServicesManagement.tsx` (line 831-835) overwrites `display_order` which serves as the stable service ID for tenants.

**Fix**:
- Change drag-and-drop handler (line 830-835) to update `sort_order` instead of `display_order`.
- Change the default ordering query (line 619) from `order('display_order')` to `order('sort_order')`, with fallback to `display_order`.
- In `useUnifiedServices.tsx`: Change service fetch ordering from `display_order` to `sort_order` (line 134).
- Save `sort_order` updates to Supabase immediately after drag-drop (the `pendingOrderUpdates` mechanism already exists, just change the column).

## 3. Fix Live Chat — Missing Panel ID and New Chat Button

**Problem**: The `handleStartChat` function requires `panel?.id` but the chat tab doesn't provide a "New Chat" button — users must type and send to auto-create. Also the `panelId` check at line 443 blocks all actions if `panelId` is missing from body.

**Fix**:
- Add a "+ New Chat" button in the chat header area when `selectedChat` exists (to start a fresh conversation).
- Add "Continue with AI" button that opens the FloatingChatWidget in AI mode when support is inactive.
- Add "Archived" section/filter for chat sessions with `status = 'closed'` or `'archived'`.
- Remove the `+ New Ticket` button from the mobile support header — live chat is the primary interface.

## 4. Fix Contact Us RLS Error on `support_tickets`

**Problem**: The INSERT RLS policy for `user_to_panel` tickets requires `user_id IN (SELECT client_users.id FROM client_users WHERE client_users.panel_id = support_tickets.panel_id)`. But buyers use custom auth (not Supabase `auth.uid()`), so this self-referencing check fails — Supabase RLS can't verify the insert because the row doesn't exist yet and the buyer has no Supabase session.

**Fix**: Route the contact form submission through the `buyer-auth` edge function (new action: `create-support-ticket`) which uses the service role to bypass RLS, similar to how chat sessions work.

## 5. Remove Hardcoded `support@homeofsmm.com` from Contact Page

**Problem**: `BuyerContact.tsx` line 143 hardcodes `const defaultEmail = 'support@homeofsmm.com'`.

**Fix**: Remove the hardcoded email. Only show email if `contactInfo.email` is configured by the panel owner. If no email is configured, don't show the email contact method.

## 6. Fix Old User "Incorrect Password" in Tenant Auth

**Problem**: Old users whose passwords were hashed with the original `btoa`/`atob` PBKDF2 method (`$pbkdf2$` prefix) may have encoding inconsistencies. The legacy verification (lines 358-404) re-encodes using `btoa(String.fromCharCode(...))` which can fail with certain byte sequences.

**Fix**: Improve the legacy base64 PBKDF2 verification by using a chunked approach that handles large Uint8Arrays properly, and also add a hex-based re-verification fallback. If both PBKDF2 formats fail, try plaintext as last resort (for very old accounts), then re-hash on success.

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/ServicesManagement.tsx` | Drag-drop: update `sort_order` not `display_order`; import: use MAX display_order |
| `src/hooks/useUnifiedServices.tsx` | Order by `sort_order` instead of `display_order` |
| `src/components/storefront/FastOrderSection.tsx` | Remove `(index + 1)` fallback for service ID display |
| `src/pages/buyer/BuyerNewOrder.tsx` | Remove UUID fallback for service ID display |
| `src/pages/buyer/BuyerSupport.tsx` | Add New Chat button, Continue with AI, Archived filter, remove New Ticket from mobile |
| `src/pages/buyer/BuyerContact.tsx` | Route submission through edge function; remove hardcoded email |
| `supabase/functions/buyer-auth/index.ts` | Add `create-support-ticket` action; improve legacy password verification |

