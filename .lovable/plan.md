

# Plan: Fix Tenant Auth Theme, Live Chat/Ticket Errors, Dashboard Stats, SEO, Service ID, Mass Order, Price Mismatch, and Social Icon Colors

## Issues Identified

### 1. Forgot Password & Ticket Dialog Don't Use Tenant Theme
**Problem**: `BuyerAuth.tsx` wraps content in `BuyerThemeWrapper` but the forgot password dialog and ticket dialog in `BuyerSupport.tsx` render inside the standard shadcn dialog which inherits the admin/system theme, not the tenant's configured theme.
**Fix**: Ensure `BuyerSupport.tsx` new ticket dialog inherits tenant theme context properly. The dialogs render inside `BuyerLayout` which should already be themed — the issue is likely the dialog portal rendering outside the themed container. Add explicit theme class to dialog content.

### 2. Tenant Live Chat "Missing Panel ID" Error
**Problem**: Screenshot shows "Missing panel ID" error when sending chat messages. The `handleSendChatMessage` function (line 330) sends `sessionId` and `buyerId` but the edge function `buyer-auth` at line 1559 validates these exist. The issue is `handleStartChat` at line 351 — if `resolvedPanelId` is null (panel not loaded yet), the chat session creation fails. The chat message send itself doesn't need panelId (it uses sessionId), but creating a new session does. The error shown in the screenshot suggests `resolvedPanelId` is still null when the user tries to chat.
**Fix**: 
- Add loading guard: disable chat input and show loading state while `resolvedPanelId` is being resolved
- Persist `panelId` more aggressively in localStorage during BuyerAuth login
- In `handleSendChatMessage`, if no session exists yet, create one first (already done in `handleQuickReply` but not in direct send)

### 3. Failed to Create Ticket Error
**Problem**: Screenshot shows "Failed to create support ticket" when creating a ticket. The `handleCreateSupportTicket` edge function inserts into `support_tickets` with `user_id: buyerId`. The RLS policy on `support_tickets` likely requires JWT claims matching `buyer_id`, but the edge function uses `supabaseAdmin` (service role) which should bypass RLS. The error is likely from the notification insert at line 288-291 which uses the anon client `supabase.from('panel_notifications').insert(...)` — this would fail if the anon user doesn't have INSERT permission on `panel_notifications`.
**Fix**: Move notification insert to edge function or wrap in try/catch (already wrapped). The real issue may be the `support_tickets` insert failing due to a column constraint. Need to check if `priority` is being passed — the edge function hardcodes 'medium' but the dialog has a priority selector. Pass priority from the dialog.

### 4. Tenant Dashboard "Temporarily Unavailable" Error
**Problem**: Screenshot shows "Dashboard temporarily unavailable" on the tenant dashboard. The `fetchBuyerData` function (line 103-151) calls `buyer-api` edge function with `action: 'orders'`. If this fails, it sets `error` state which triggers the error UI. The issue is that `buyer.panel_id` might be undefined and `localStorage.getItem('current_panel_id')` might also be null, causing the edge function to reject the request.
**Fix**: 
- Ensure `panelId` is always available by using `panel?.id` from `useTenant()` as primary source (already available at line 55)
- Change line 110 to: `const panelId = panel?.id || buyer.panel_id || localStorage.getItem('current_panel_id') || '';`
- Add retry logic with better error messaging

### 5. Tenant SEO Not Showing When Tested on External Websites
**Problem**: External SEO test tools (like opengraph.xyz, metatags.io) fetch the raw HTML before JavaScript runs. Since this is a React SPA, the `<head>` meta tags from `index.html` show "HOME OF SMM" (the platform brand), not the tenant's configured SEO. React Helmet only works after JS execution. Social crawlers (Facebook, Twitter) may or may not execute JS.
**Fix**: This is a fundamental SPA limitation. The `TenantRouter.tsx` already tries to clean up platform meta tags (line 76-80). For proper SSR-like SEO, the `generate-sitemap` and `generate-robots` edge functions exist but the actual meta tag injection needs to happen at the server/CDN level. For now: ensure `index.html` has generic/empty meta tags that don't say "HOME OF SMM", and the `TenantHead` component aggressively updates meta tags on mount. Also check if `TenantHead` is being rendered on all tenant pages.

### 6. Fast Order Using `provider_service_id` Instead of `display_order`
**Problem**: Line 1198 in `FastOrderSection.tsx`: `ID: {service.provider_service_id || service.display_order || service.displayOrder || service.id?.slice(0,6)}`. The priority is WRONG — it shows `provider_service_id` first. In `BuyerNewOrder.tsx` line 628, it correctly shows `display_order` first.
**Fix**: Change fast order line 1198 to match new order: `ID: {service.display_order || service.displayOrder || '—'}` — never show `provider_service_id` to tenants.

### 7. Mass Order Layout Needs Rewrite
**Problem**: The current `BulkAddForm.tsx` shows a card-per-row layout (service selector + quantity + URL per card). Real SMM panels use a text-area based mass order: one line per order, format `service_id|quantity|link`. This is the standard mass order format across all SMM panels.
**Fix**: Rewrite `BulkAddForm.tsx` to use a textarea-based input where each line is `service_id|quantity|link`. Add format guide, validation per line, and a summary of parsed orders before submission.

### 8. Order Failed — Price Mismatch with Promo Code
**Problem**: The `buyer-order` edge function (line 203-211) calculates `serverPrice = (service.price * quantity) / 1000` and rejects if `price < serverPrice * 0.99`. When a promo code gives 15% off, the client sends `totalPrice = baseTotal - promoDiscount` which is LOWER than `serverPrice`. The edge function does NOT account for promo codes at all.
**Fix**: In the edge function, if `promoCode` is provided, look up the promo code in `promo_codes` table, validate it (active, not expired, not exceeded usage), calculate the discount server-side, and adjust `serverPrice` accordingly. This is the correct approach — server-side promo validation prevents abuse.

### 9. Social Icon Black Background in Light Mode
**Problem**: The `SOCIAL_ICONS_MAP` uses `bg-black` for platforms like Twitter/X, TikTok, Threads, BeReal, Medium, Douyin, etc. In light mode, the black circle backgrounds look heavy and out of place.
**Fix**: Replace `bg-black` with `bg-gray-900 dark:bg-black` or use a theme-aware approach. For light mode, use `bg-gray-800` which is softer. Better: use the platform's actual brand color where possible (Twitter/X is now just dark, TikTok uses gradient).

### 10. Failed to Add to Cart
**Problem**: This likely fails because `useBuyerCart` tries to interact with Supabase (cart table) but the buyer's custom auth doesn't give Supabase session tokens, so RLS blocks the insert. Need to verify the cart implementation.
**Fix**: Route cart operations through edge function or ensure cart table has appropriate RLS for anon access with panel_id filtering.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/buyer/BuyerDashboard.tsx` | Use `panel?.id` as primary panelId source (line 110); add retry with better error handling |
| `src/pages/buyer/BuyerSupport.tsx` | Fix ticket creation to pass priority; add panelId loading guard for chat; ensure dialog uses tenant theme |
| `src/components/storefront/FastOrderSection.tsx` | Change service ID display to use `display_order` first, never `provider_service_id` (line 1198) |
| `src/components/buyer/BulkAddForm.tsx` | Rewrite to textarea-based mass order format: `serviceID\|quantity\|link` per line |
| `supabase/functions/buyer-order/index.ts` | Add server-side promo code validation; adjust price check to account for valid promo discounts |
| `src/components/icons/SocialIcons.tsx` | Replace `bg-black` with theme-aware classes (`bg-gray-800 dark:bg-gray-900`) for affected platforms |
| `src/components/tenant/TenantHead.tsx` | Ensure aggressive meta tag cleanup and injection on all tenant pages |
| `src/pages/buyer/BuyerAuth.tsx` | Persist panelId to localStorage on successful auth |
| `src/hooks/use-buyer-cart.tsx` | Verify cart operations work with custom auth; route through edge function if RLS blocks |
| `index.html` | Ensure default meta tags are generic (not "HOME OF SMM" branded) for tenant domains |

