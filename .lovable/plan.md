

# Plan: Fix MFA Auth Bypass, Order Pending Count, Fast Order Service ID, and Ticket Foreign Key Error

## Issues Found

### 1. MFA Can Be Bypassed by Navigation
**Problem**: When MFA is enabled and `needsMfaChallenge` is set to `true`, the `user`/`session`/`profile` are already populated in AuthContext. The app's route guards only check `if (user)` to render protected routes, so the user can navigate to `/panel` and access the dashboard despite the MFA dialog being open. The MFA dialog also has a close X button (from `DialogContent`), allowing users to dismiss it.

**Fix**:
- In `AuthContext.tsx`, expose `needsMfaChallenge` in the context value
- Block children rendering when `needsMfaChallenge` is true (render only the MFA challenge, not the app content)
- In `TwoFactorChallenge.tsx`, add `hideClose` class to `DialogContent` to suppress the X button using `[&>button:last-child]:hidden` or pass a custom variant

### 2. MFA Dialog Has Close (X) Button
**Problem**: `DialogContent` in `dialog.tsx` always renders a `DialogPrimitive.Close` X button. The MFA challenge should NOT be dismissible.

**Fix**: Add an optional `hideClose` prop to `DialogContent` that conditionally renders the X button. Use it in `TwoFactorChallenge`.

### 3. Order Management "Pending" Count Only Shows `status === 'pending'`
**Problem**: Line 152 counts only `status === 'pending'`, but orders can also be `'awaiting_payment'` or `'processing'` — states that users consider "pending."

**Fix**: Update `pendingOrders` to count all non-terminal statuses: `pending`, `processing`, `awaiting_payment`, `in_progress`.

### 4. Fast Order Shows "ID: —" Instead of Service ID
**Problem**: Line 1198 in `FastOrderSection.tsx` uses `service.display_order || service.displayOrder || '—'`. When `display_order` is `0` (first service), `|| '—'` evaluates to `'—'` because `0` is falsy.

**Fix**: Use nullish coalescing: `service.display_order ?? service.displayOrder ?? '—'`. Also add `display_order` to the `UnifiedService` interface for type safety.

### 5. Tenant Ticket Creation Fails with Foreign Key Error
**Root cause** (from edge function logs):
```
Key (user_id)=(75a3fda1-...) is not present in table "profiles".
insert or update on table "support_tickets" violates foreign key constraint "support_tickets_user_id_fkey"
```
The `support_tickets.user_id` column has a foreign key to `profiles.id`, but tenant buyer IDs come from `client_users.id` — a completely different table. The edge function passes `buyerId` (a `client_users.id`) as `user_id`, which violates the FK constraint.

**Fix**: In the `handleCreateSupportTicket` function in `buyer-auth/index.ts`, set `user_id: null` (since the buyer isn't a Supabase auth user) and store the `buyerId` in the ticket's `messages` metadata instead. Or better: add a `buyer_id` column to `support_tickets` via migration that references `client_users.id`, and use that for tenant tickets while keeping `user_id` for panel-to-admin tickets.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/dialog.tsx` | Add optional `hideClose` prop to `DialogContent` |
| `src/components/auth/TwoFactorChallenge.tsx` | Use `hideClose` on `DialogContent`; remove "Sign out" link label (keep as only option via backup) |
| `src/contexts/AuthContext.tsx` | Block children rendering while `needsMfaChallenge` is true — show only the MFA overlay |
| `src/pages/OrderManagement.tsx` | Update `pendingOrders` to include `pending`, `processing`, `awaiting_payment`, `in_progress` |
| `src/components/storefront/FastOrderSection.tsx` | Fix `display_order` falsy check from `||` to `??` |
| `src/hooks/useUnifiedServices.tsx` | Add `display_order` to `UnifiedService` interface |
| `supabase/migrations/` | Add `buyer_id uuid REFERENCES client_users(id)` column to `support_tickets`; make `user_id` nullable FK optional |
| `supabase/functions/buyer-auth/index.ts` | In `handleCreateSupportTicket`, use `buyer_id` column instead of `user_id` for tenant tickets; also pass through the `priority` field from the request body |

