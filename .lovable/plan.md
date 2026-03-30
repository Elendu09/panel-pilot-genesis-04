

# Plan: Fix SupportCenter Tab Order, Tenant Chat Panel ID, Ticket Creation, and Bulk Action Mobile Responsiveness

## Issues Identified

1. **SupportCenter tab order wrong**: "Knowledge" is first tab (line 649), but "Live Chat" should be first. The `activeTab` defaults to `"livechat"` (line 70) but the visual order puts Knowledge first.
2. **Tenant live chat "Missing Panel ID"**: When user sends a message without an existing session, `handleStartChat` checks `resolvedPanelId` (line 348). The triple fallback (`authPanelId || panel?.id || localStorage`) should work, but `authPanelId` comes from the `BuyerAuthProvider` prop which is always set. The real issue is the toast says "Please log in to start a chat" — need to investigate if `buyer` is null at that point or if `resolvedPanelId` is actually null. Will add better error messaging and ensure `localStorage.setItem('current_panel_id', panelId)` is set during auth.
3. **Tenant ticket creation error**: The edge function `handleCreateSupportTicket` uses `supabaseAdmin` so RLS shouldn't block it. The error likely comes from the function itself failing — possibly `resolvedPanelId` being null when the ticket is submitted. Will add the same panel ID persistence fix.
4. **BulkActionToolbar not mobile responsive**: At 420px viewport, all icon buttons overflow horizontally since there are 9+ buttons in a single row with `max-w-fit`. Need to wrap into a compact grid or scrollable row on mobile.
5. **OrdersManagement bulk bar**: Already has better layout (`flex-col sm:flex-row`) but the outer container at 420px viewport may still overflow. Already uses `max-w-lg` which helps.

---

## 1. Fix SupportCenter Tab Order — Live Chat First

**File**: `src/pages/panel/SupportCenter.tsx` (lines 648-665)

Reorder the `TabsTrigger` elements so Live Chat comes first:
1. Move "Live Chat" trigger before "Knowledge"
2. Keep the tab content order matching

---

## 2. Fix Tenant Chat & Ticket "Missing Panel ID"

**File**: `src/contexts/BuyerAuthContext.tsx`
- After successful login, persist `panelId` to `localStorage.setItem('current_panel_id', panelId)` so the triple fallback in BuyerSupport works reliably.

**File**: `src/pages/buyer/BuyerSupport.tsx`
- In `handleStartChat` (line 348): if `resolvedPanelId` is still null, show a more specific error ("Unable to connect — please refresh the page") instead of "Please log in to start a chat"
- Disable the "New" chat button and send button while `!resolvedPanelId` (loading state)
- Same guard for `handleCreateTicket` — it already checks `resolvedPanelId` (line 261) but the error message could be clearer

---

## 3. Fix BulkActionToolbar Mobile Responsiveness

**File**: `src/components/customers/BulkActionToolbar.tsx`

The toolbar shows ~9 icon buttons horizontally which overflows on 420px screens. Fix:
- Add `overflow-x-auto` to the inner flex container so buttons scroll horizontally on mobile
- Or restructure to use a compact dropdown/popover for actions on mobile
- Best approach: make the container horizontally scrollable with `overflow-x-auto` and `scrollbar-hide`, keeping the fixed positioning

---

## 4. Verify OrdersManagement Bulk Bar

**File**: `src/pages/panel/OrdersManagement.tsx` (lines 658-706)

The orders bulk bar already uses `flex-col sm:flex-row` which is better. Verify the `max-w-lg` container doesn't cause issues at 420px. The `w-[calc(100vw-1.5rem)]` ensures it fits — this should already work. Minor tweak: ensure the select + button row doesn't overflow.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/SupportCenter.tsx` | Reorder tabs: Live Chat first, then Knowledge, Customers, Platform |
| `src/pages/buyer/BuyerSupport.tsx` | Better error messages for null panelId; disable chat/ticket when panelId not ready |
| `src/contexts/BuyerAuthContext.tsx` | Persist panelId to localStorage on login |
| `src/components/customers/BulkActionToolbar.tsx` | Add horizontal scroll or compact layout for mobile |
| `src/pages/panel/OrdersManagement.tsx` | Minor mobile overflow fix if needed |

