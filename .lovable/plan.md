

# Plan: Quick Setup Section, FAQ Link Fix, Tenant Sync, Chat Widget Auth, Support Chat, and Fast Order Login

## 1. Add "Quick Setup (How It Works)" Section After Hero

Create `QuickSetupSection.tsx` with 4-6 steps showing how to launch a panel:
1. Sign Up — Create your free account
2. Name Your Panel — Choose name and subdomain
3. Add Services — Import from providers or create custom
4. Configure Payments — Set up payment methods
5. Customize Design — Brand with your colors and logo
6. Launch — Go live and start earning

Place it in `Index.tsx` between `<HeroSection />` and `<PlatformFeaturesSection />`.

## 2. Fix FAQ "Contact Us" Link

In `FAQSection.tsx` line 243, change `href="/support"` to `href="/contact"`.

## 3. Enhance Tenant Page Load Speed (Reduce Loading Spinner)

The loading spinner in the screenshot (image 2) is caused by `panelLoading || authLoading` checks showing a spinner while tenant data resolves. To reduce perceived loading:
- In `BuyerLayout.tsx`, cache the panel theme (colors, fonts, name) in `localStorage` on first load and apply them immediately on mount before the async fetch completes
- Show a skeleton layout with cached theme colors instead of a blank spinner
- This gives instant visual feedback with correct branding while data loads in the background

Files: `src/pages/buyer/BuyerLayout.tsx`, `src/hooks/useTenant.tsx` (add localStorage cache write/read)

## 4. FloatingChatWidget: Show "Already Logged In" When Authenticated

In `FloatingChatWidget.tsx` lines 948-965, the login prompt shows for non-authenticated users. Add the inverse case: when `isAuthenticated` is true, show a green "Already logged in" badge instead of the Sign In button, and make it non-clickable.

```tsx
{panelId && isAuthenticated && (
  <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
    <p className="text-sm text-center text-green-600 dark:text-green-400 font-medium">
      ✓ Already logged in
    </p>
  </div>
)}
{panelId && !isAuthenticated && (
  // existing login prompt
)}
```

## 5. Fix "Start Chat" Button in Tenant Support Page

The `handleStartChat` function (line 325) silently fails because `chat_sessions` insert likely hits an RLS policy. The function checks `if (!buyer?.id || !panel?.id) return;` — if either is null it returns silently with no feedback.

Fix:
- Add a toast error when `buyer?.id` or `panel?.id` is missing
- Add error handling for the insert: if RLS blocks it, show a user-facing error
- Verify the `chat_sessions` RLS policy allows buyers to insert rows where `visitor_id = auth.uid()` — but since buyers use custom auth (not Supabase auth), the RLS won't match. Need to use the `buyer-auth` edge function or create an edge function for chat session creation that bypasses RLS.

Create a `buyer-chat` action in the existing `buyer-auth` edge function (or a small new function) that:
- Accepts `buyerId`, `panelId`, `token` 
- Validates the buyer token
- Inserts into `chat_sessions` using the service role client
- Returns the new session

Update `BuyerSupport.tsx` `handleStartChat` to call this edge function instead of direct Supabase insert.

## 6. Fix Fast Order Login — Email Field Disabled

In `FastOrderSection.tsx` line 1860, the email `<Input>` has `disabled` attribute. This prevents users from editing their email to log in. 

The flow is: user enters email in step 1 → if account exists → shows login form with email pre-filled but locked. The issue is the user cannot correct their email from this screen.

Fix: Remove `disabled` from the email input on the login form (line 1860), so users can edit the email if needed.

## Files to Modify

| File | Change |
|------|--------|
| New: `src/components/sections/QuickSetupSection.tsx` | Create 6-step "How It Works" section |
| `src/pages/Index.tsx` | Add QuickSetupSection after HeroSection |
| `src/components/sections/FAQSection.tsx` | Change `/support` to `/contact` on line 243 |
| `src/pages/buyer/BuyerLayout.tsx` | Add localStorage theme cache for instant branding |
| `src/hooks/useTenant.tsx` | Write panel theme to localStorage on fetch, read on init |
| `src/components/storefront/FloatingChatWidget.tsx` | Show "Already logged in" when authenticated |
| `src/pages/buyer/BuyerSupport.tsx` | Fix handleStartChat to use edge function for RLS bypass |
| `supabase/functions/buyer-auth/index.ts` | Add `create-chat-session` action |
| `src/components/storefront/FastOrderSection.tsx` | Remove `disabled` from email input on login form |

