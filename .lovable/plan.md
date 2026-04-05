

# Plan: Fix Shopping Cart Mass Order/Repeat Layout, Ticket Visibility, Quick Repeat Logic, and SEO Meta Bleed

## Issues

### 1. Mass Order and Repeat Content Pushed Below Viewport in Shopping Cart
**Problem**: The `TabsContent` for "bulk" and "repeat" tabs uses `className="flex-1 m-0 p-6 pt-4 overflow-auto"` but the `SheetContent` layout with the cart tab's flex structure causes these tabs to render below the visible area. The cart tab uses `flex-1 flex flex-col` correctly, but the bulk/repeat tabs don't scroll from top because the parent `Tabs` container's flex layout pushes them down.

**Fix**: Wrap the bulk and repeat `TabsContent` in a `ScrollArea` with explicit `h-0 flex-1` to force them to fill available space and scroll from the top. Also ensure `data-[state=active]:flex` is set like the cart tab.

### 2. Quick Repeat Order Allows Duplicate URLs for Unfinished Orders
**Problem**: The Quick Repeat feature lets users submit the same service + URL combo without checking if there's already an active (pending/processing) order. Many SMM providers reject duplicate URL orders.

**Fix**: Add a warning note in the Quick Repeat UI that duplicate URL orders for the same service may be rejected by providers. Optionally, check existing cart items for duplicates before adding.

### 3. Tenant Tickets Not Showing in Panel Owner Customer Tickets
**Problem**: Panel owner's `SupportCenter.tsx` fetches customer tickets with `supabase.from('support_tickets').select('*').eq('panel_id', panel.id).eq('ticket_type', 'user_to_panel')`. The ticket creation in `buyer-auth` sets `panel_id: panelId` from the request body. The issue is the `panel_id` being sent from the tenant side may be the wrong value or format. Also, the panel owner queries using `panel.id` which comes from `profiles.id` (the owner's profile ID), NOT the `panels.id` UUID — need to verify these match.

Actually, looking more carefully: the panel owner's `panel.id` comes from the `usePanel()` hook which returns the `panels` table row, so `panel.id` IS `panels.id`. The tenant's `panelId` from `useTenant()` should also be `panels.id`. The ticket creation stores this correctly. The real issue is likely the `buyer_id` column — older tickets created before the migration may have `buyer_id = null` and `user_id` set to a `client_users` UUID (which would have failed with FK error). New tickets should work if the migration ran successfully. Let me verify the query doesn't filter by `buyer_id` — it doesn't, so all `user_to_panel` tickets for the panel should appear. The issue may be that the ticket creation itself is silently failing. Need to add better error surfacing.

**Fix**: 
- Add error logging in tenant ticket creation response handling
- Ensure `panel_id` is correctly passed from tenant context
- Add a `reply-ticket` action to `buyer-auth` for panel owner replies that bypasses RLS

### 4. Ticket Structure Enhancement
**Current**: Tickets have statuses `open`, `in_progress`, `resolved`, `closed` but transitions aren't well-defined. Panel owner replies are stored in the `messages` JSONB array but there's no dedicated `reply-ticket` action for panel owners (they use direct Supabase updates which work with RLS for authenticated panel owners).

**Fix**: 
- Add status filter tabs (All, Open, In Progress, Resolved, Closed) in both tenant and panel owner views
- Improve the reply UI in panel owner's ticket detail with a proper message input
- Add timestamp display for each message
- Add ability for panel owner to change ticket status inline
- Ensure tenant can see replies and respond back

### 5. SEO Meta Description Showing Same on All Pages
**Problem**: From the screenshot, Google search results show "Launch your own SMM panel with Home of SMM..." on all pages including Privacy Policy. This is the `index.html` default `<meta name="description">`. Even though `data-platform-only` marks it for tenant cleanup, the issue is for the platform itself — Google is crawling the static HTML before React/Helmet hydrates page-specific descriptions.

**Fix**: 
- For platform pages: each page component already uses `<Helmet>` with page-specific descriptions, but Google's crawler (which may not execute JS) falls back to `index.html`. The SSR-less SPA limitation means we must ensure `index.html` has the most generic possible description
- The current `index.html` description IS the platform homepage description — that's correct for the homepage. The issue is Google may cache or propagate it. Each page's `<Helmet>` should set unique descriptions
- Check that pages like Privacy Policy, Blog, etc. actually set their own `<meta name="description">` via Helmet — if they don't, add them

---

## Implementation Details

### Shopping Cart Layout Fix (`ShoppingCart.tsx`)
- Change bulk/repeat `TabsContent` to use `flex-1 flex flex-col m-0 data-[state=active]:flex overflow-hidden`
- Wrap content in `ScrollArea` with `className="flex-1"`
- Add inner padding via a wrapper div

### Quick Repeat Enhancement (`QuickRepeatOrder.tsx`)
- Add an info banner warning about duplicate URL restrictions
- Add visual indicator if a URL already exists in the current cart for the same service

### Ticket Visibility Fix
- Verify and add console logging to ticket creation response in `BuyerSupport.tsx`
- Add `reply-ticket` action to `buyer-auth` edge function for tenant reply-back capability
- In `SupportCenter.tsx`, add a proper reply input for panel owner to respond to customer tickets (currently may only have status update buttons)

### Ticket UX Enhancement
- Add status filter tabs in both `BuyerSupport.tsx` (ticket list) and `SupportCenter.tsx` (customer tickets)
- Add message bubbles with timestamps in ticket detail dialog
- Panel owner: inline status change dropdown in ticket detail
- Tenant: ability to reply to tickets and close/reopen them

### SEO Fix
- Audit all public pages for missing `<Helmet>` descriptions
- Ensure Privacy Policy, Terms, Blog pages have unique meta descriptions
- The `index.html` description is correct for homepage — no change needed there

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/buyer/ShoppingCart.tsx` | Fix bulk/repeat tab layout — wrap in ScrollArea, add proper flex classes |
| `src/components/buyer/QuickRepeatOrder.tsx` | Add duplicate URL warning; add info about provider restrictions |
| `src/pages/buyer/BuyerSupport.tsx` | Add ticket status filter tabs; improve ticket reply UI; add error handling for ticket creation; add reply-back capability |
| `src/pages/panel/SupportCenter.tsx` | Add status filter tabs for customer tickets; improve reply UI with message input; add inline status change |
| `supabase/functions/buyer-auth/index.ts` | Add `reply-ticket` action for tenant ticket replies |
| `src/pages/PrivacyPolicy.tsx` | Add unique Helmet meta description |
| `src/pages/TermsOfService.tsx` | Add unique Helmet meta description |
| Other public pages | Audit and add missing Helmet descriptions |

