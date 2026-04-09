

# Plan: Homepage Boost Social Button, Auth Tab-Return Loading Fix, Analytics Mobile Responsiveness, Live Activity Filter, and Forgot Password Fix

## 1. Rename "Service Tools" to "Boost Social" with Green Active Dots

**Current**: The hero CTA button uses `t('home.cta.tools')` ("Service Tools") and links to `/services` via React Router `<Link>`.

**Fix**:
- In `src/components/sections/HeroSection.tsx` (line 164-169): Replace the `<Link to="/services">` with an `<a href="https://soc.smmpilot.online" target="_blank" rel="noopener noreferrer">` so it opens in a new tab
- Change the button text to "Boost Social" with two green pulsing dots between the words: `Boost` `●` `●` `Social` using small `<span>` elements with `bg-emerald-500 rounded-full w-1.5 h-1.5 animate-pulse`
- Update all 10 language translations in `src/lib/platform-translations.ts` for `home.cta.tools` to their localized equivalent of "Boost Social"

**Files**: `src/components/sections/HeroSection.tsx`, `src/lib/platform-translations.ts`

## 2. Fix Auth Tab-Return Loading/Blank Screen Issue

**Root Cause**: The console logs reveal the core problem: Supabase's lock mechanism (`lock:sb-*-auth-token`) is timing out (5000ms), then being forcefully acquired with the `steal` option. This breaks the in-flight `fetchProfile` call with an `AbortError: Lock broken by another request with the 'steal' option`. The profile fetch fails, leaving `profile` as `null`, which causes the `ProtectedRoute` to show an infinite loading spinner (`loading || (user && !profile)`).

Additionally, `onAuthStateChange` and `getSession()` race each other on tab return. Both can fire `TOKEN_REFRESHED` / `INITIAL_SESSION`, causing duplicate profile fetches that compound the lock contention.

**Fix in `src/contexts/AuthContext.tsx`**:
- Wrap `fetchProfile` with error resilience: if the fetch fails with an AbortError, do NOT clear the existing profile -- keep the stale profile data so the UI remains functional
- Add a `profileRef` to cache the last successful profile. On AbortError, fall back to the cached profile instead of leaving it `null`
- In `onAuthStateChange`, skip processing if `initializedRef.current` is true AND event is `INITIAL_SESSION` (prevents duplicate processing on tab return)
- Add a debounce/guard: if a profile fetch is already in-flight, don't start another one (use an `isFetchingRef`)
- For `TOKEN_REFRESHED`: already handled correctly (silent refresh), but add the same AbortError guard

**Fix in `src/components/auth/ProtectedRoute.tsx`**:
- Add a timeout fallback: if `user` exists but `profile` is `null` for more than 5 seconds, attempt to re-fetch the profile once, and if that also fails, proceed with a minimal profile object rather than showing infinite loading

**Files**: `src/contexts/AuthContext.tsx`, `src/components/auth/ProtectedRoute.tsx`

## 3. Make Order Pipeline Kanban Mobile Responsive

**Current**: Uses `grid-cols-2 lg:grid-cols-4` which works on tablets but on small mobile screens (< 640px), the 2-column layout makes each card too narrow.

**Fix in `src/components/analytics/OrderPipelineKanban.tsx`**:
- Change grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` so on mobile phones each column stacks vertically
- Add horizontal scroll wrapper as an alternative: on mobile, display columns in a horizontal scrollable container with `flex overflow-x-auto snap-x` so users can swipe between pipeline stages
- Reduce padding and font sizes slightly on mobile with responsive classes

**File**: `src/components/analytics/OrderPipelineKanban.tsx`

## 4. Filter Cancelled Orders from Live Activity Feed

**Current**: `LiveActivityFeed` maps ALL orders including cancelled ones into the feed.

**Fix in `src/components/analytics/LiveActivityFeed.tsx`**:
- Add `.filter(o => o.status !== 'cancelled')` before the `.slice(0, 50)` in the `allItems` computation (line 31)
- Remove the `'cancelled'` type from the `ActivityItem` type union and `typeConfig` since cancelled orders won't appear

**File**: `src/components/analytics/LiveActivityFeed.tsx`

## 5. Fix Forgot Password Issues and Email Restrictions

**Forgot Password**: The current implementation (line 170-181) looks correct -- it calls `supabase.auth.resetPasswordForEmail`. Potential issues:
- The `redirectTo` uses `window.location.origin + '/auth?type=recovery'` which is correct
- If emails aren't arriving for non-Gmail addresses, this is a Supabase auth email delivery issue, not a code issue

**Email Restrictions**: Supabase by default allows all email domains for sign-up. The "some emails are not allowed" error likely comes from:
1. Supabase's built-in email validation rejecting malformed or disposable email domains
2. The `resetPasswordForEmail` returning an error for emails not in the system

**Fix**:
- In `handleForgotPassword`: improve error messaging to differentiate between "email not found" vs "email service error"
- Add a client-side email validation that accepts all standard email formats (not just common providers)
- Check if the Input `type="email"` is rejecting valid email formats -- the HTML5 email validation can be overly strict for some TLDs. Add a `pattern` attribute or switch to `type="text"` with custom validation
- In the sign-up form, ensure the email input doesn't have implicit restrictions

**Files**: `src/pages/Auth.tsx`

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/sections/HeroSection.tsx` | Replace Link with external `<a>` tag to `https://soc.smmpilot.online`; add green active dots |
| `src/lib/platform-translations.ts` | Update `home.cta.tools` in all 10 languages to "Boost Social" equivalents |
| `src/contexts/AuthContext.tsx` | Add `profileRef` for caching; guard against AbortError; prevent duplicate fetches with `isFetchingRef`; skip duplicate INITIAL_SESSION |
| `src/components/auth/ProtectedRoute.tsx` | Add timeout fallback for stuck `user && !profile` state |
| `src/components/analytics/OrderPipelineKanban.tsx` | Change to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` for mobile responsiveness |
| `src/components/analytics/LiveActivityFeed.tsx` | Filter out cancelled orders from the feed |
| `src/pages/Auth.tsx` | Improve forgot password error handling; ensure email input accepts all valid emails |

