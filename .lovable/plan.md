

# Plan: Auth Tab-Return Fix, Order Expanded UI, Email Sign-Up Fix, Service Stats Expansion, MFA Deploy

## 1. Auth Tab-Return Fix (Critical)

**Root Cause**: `onAuthStateChange` callback on lines 250-260 of `AuthContext.tsx` uses `await fetchProfile()` and `await enforceMfaIfEnabled()` inside the callback. This blocks the auth event loop, causing deadlocks when Supabase's lock manager fires `TOKEN_REFRESHED` on tab return. The lock times out (5s), steals the lock, and the in-flight fetch gets an `AbortError`, leaving the app stuck.

**Fix in `src/contexts/AuthContext.tsx`**:
- Remove all `await` calls inside `onAuthStateChange` -- replace with fire-and-forget (`.then()/.catch()`) for both `fetchProfile` and `enforceMfaIfEnabled` on SIGNED_IN and initial load events
- Keep the `isInitialLoad` / `setLoading` logic but move it inside the `.then()` chain so loading state still resolves properly
- This follows the Supabase best practice: "Never await operations inside onAuthStateChange callbacks"

**Fix in `src/components/auth/ProtectedRoute.tsx`**:
- Already has a 5s timeout fallback -- this is fine, just needs the root cause fixed above

## 2. Order Management Expanded Row UI (Image 1)

**Current state**: Clicking the chevron `(^)` on an order row sets `expandedOrder` state but renders nothing below the row.

**Fix in `src/pages/panel/OrdersManagement.tsx`**:
- After the `</motion.tr>` (line 1013), add a conditional expanded row `{isExpanded && (...)}` that renders a new `<tr>` with a `<td colSpan>` containing:
  - Top section with grid: PLATFORM (with social icon based on service category), LINK (target_url), PROVIDER (provider name), API ORDER ID (provider_order_id), CREATED (created_at formatted), UPDATED (updated_at formatted)
  - Bottom action buttons row: "View Details", "Refill", "Copy ID", "Open Link", "Cancel" (red) -- matching the screenshot exactly
- Style with dark glass background matching the existing UI theme

## 3. Sign-Up Email Error Fix (Image 2)

**Issue**: "Error sending confirmation email" when signing up with non-Gmail emails like `@wnbaldwy.com`. This is a Supabase email delivery issue -- Supabase's built-in SMTP may reject or fail to deliver to certain domains.

**Fix in `src/contexts/AuthContext.tsx` (signUp function)**:
- Improve the error message handling: when Supabase returns "Error sending confirmation email", show a friendlier message suggesting the user try a different email provider or contact support
- Add a specific catch for this error pattern

**Fix in `src/pages/Auth.tsx`**:
- Add a user-friendly error handler in `handleSignUp` that catches "Error sending confirmation email" and provides actionable guidance

## 4. Service Management: Replace "0" Orders Column with Expandable Stats (Images 3 & 4)

**Current**: Column shows `service.orders` count (often "0") in `DraggableServiceItem.tsx` (line 336-338) and `VirtualizedServiceList.tsx`.

**Fix in `src/components/services/DraggableServiceItem.tsx`**:
- Replace the "Orders" `<td>` with a `>` chevron button
- When clicked, expand a stats panel below the service row showing:
  - Order Range (min_qty — max_qty)
  - Total Revenue (calculated from orders or stored)
  - Rating (from service_reviews average)
  - 7 Day Trend (small sparkline chart)
- Add state management for `expandedServiceId`

**Fix in `src/components/services/VirtualizedServiceList.tsx`**:
- Same pattern: replace the "0" column with a chevron expander
- Note: virtualized lists make inline expansion tricky -- use a variable row height or overlay approach

## 5. Deploy mfa-setup Edge Function

**Current**: The edge function code is already correct (uses JWT decoding + profile verification). It just needs to be redeployed to ensure the latest version is live.

**Action**: Deploy the `mfa-setup` edge function.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/AuthContext.tsx` | Remove `await` from `onAuthStateChange`; fire-and-forget pattern |
| `src/pages/panel/OrdersManagement.tsx` | Add expanded row with platform info, links, dates, and action buttons |
| `src/pages/Auth.tsx` | Better error handling for "Error sending confirmation email" |
| `src/contexts/AuthContext.tsx` | Friendly error for email sending failures in signUp |
| `src/components/services/DraggableServiceItem.tsx` | Replace "0" orders column with `>` expandable stats row |
| `src/components/services/VirtualizedServiceList.tsx` | Same expandable stats pattern |
| `supabase/functions/mfa-setup/index.ts` | Redeploy (no code changes needed) |

