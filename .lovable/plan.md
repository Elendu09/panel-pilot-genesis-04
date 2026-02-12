

# Fix Plan: SEO, Auth, Skeleton, Headings, and Payment Gateway

---

## Issue 1: Remove Loading Skeleton from Homepage

**File:** `src/pages/Index.tsx`

The `SectionSkeleton` component shows a spinning loader while lazy-loaded sections load. Replace with `null` fallback so sections appear seamlessly without spinners.

Change all `<Suspense fallback={<SectionSkeleton />}>` to `<Suspense fallback={null}>` (lines 121-135). Also remove the unused `SectionSkeleton` component definition (lines 19-24).

---

## Issue 2: Fix SEO Title and Meta Description

**File:** `src/pages/Index.tsx`

Update line 45-46 to the exact values provided:

- **Title:** `HOME OF SMM – Create & Manage Your Own SMM Panel`
- **Description:** `Launch your own SMM panel with Home of SMM. Get custom branding, automated orders, multiple payment gateways, and real-time analytics to grow revenue.`

(Note: removing "your SMM business fast." and using "revenue." as specified)

---

## Issue 3: Improve Heading Structure for SEO/AEO/GEO Indexing

The homepage H1 currently renders "Create Your Own" + "SMM Panel" which is correct. The issue is that section headings need proper semantic structure and `aria-labelledby` connections for crawlers.

### Changes needed:

**File:** `src/components/sections/HeroSection.tsx`
- The H1 is fine as-is (line 125). But add a visually hidden subtitle `<p>` below it for search engines describing the page purpose.

**File:** `src/components/sections/PlatformFeaturesSection.tsx`
- The section uses `<h2>` (line 47) but lacks `id` and `aria-labelledby`. Add `id="platform-features-heading"` and `aria-labelledby` on the section tag.

**File:** `src/components/sections/StatsSection.tsx`
- Already has `id="stats-heading"` and `aria-labelledby="stats-heading"` (line 63, 78). Good.

**File:** `src/components/sections/FeaturesSection.tsx`
- Already has `id="features-heading"` and `aria-labelledby="features-heading"` (line 65, 86). Good.

**File:** `src/components/sections/TestimonialsSection.tsx`
- Already has `id="testimonials-heading"` and `aria-labelledby="testimonials-heading"` (line 57, 86). Good.

**File:** `src/components/sections/FAQSection.tsx`
- Already has `id="faq-heading"` and `aria-labelledby="faq-heading"` (line 85, 114). Good.

**File:** `src/lib/platform-translations.ts`
- Revert `home.title.line1` back to `'Create Your Own'` and `home.title.line2` to `'SMM Panel'` (lowercase "your" is fine -- the user wants it noticeable, not fully uppercased).

Primary fix: Add `id` and `aria-labelledby` to PlatformFeaturesSection, and add a hidden SEO paragraph under the H1.

---

## Issue 4: Fix Username Sign-In (CRITICAL ROOT CAUSE)

**Root Cause:** The `profiles` table RLS SELECT policy is:
```sql
user_id = auth.uid()
```

When a user tries to sign in with a username, `AuthContext.signIn()` queries `profiles` by username BEFORE the user is authenticated. Since `auth.uid()` is null at that point, the RLS policy blocks ALL rows, so the username lookup returns nothing.

**Fix:** Add a new RLS policy that allows anyone to look up a profile by username (only exposing the email column via the query, which is safe since the sign-in form already accepts email):

```sql
CREATE POLICY "Allow username lookup for auth" ON profiles
FOR SELECT USING (true);
```

However, this would expose all profile data. A safer approach is to use a **database function** with `SECURITY DEFINER` that bypasses RLS:

```sql
CREATE OR REPLACE FUNCTION public.lookup_email_by_username(p_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM profiles
  WHERE LOWER(username) = LOWER(p_username)
  LIMIT 1;
  RETURN v_email;
END;
$$;
```

Then in `src/contexts/AuthContext.tsx`, replace the `.ilike('username', ...)` query with an RPC call:

```typescript
if (!identifier.includes('@')) {
  const { data: email, error: lookupError } = await supabase
    .rpc('lookup_email_by_username', { p_username: identifier.trim() });
  
  if (lookupError || !email) {
    toast({ variant: "destructive", title: "Sign In Error", description: "Username not found." });
    return { error: { message: 'Username not found' } };
  }
  loginEmail = email;
}
```

Additionally, the `signUp` function saves username AFTER signup (line 143-147), but the `handle_new_user` trigger doesn't save username. The update query may also fail due to RLS (the user just signed up but may not be authenticated yet if email verification is required). Fix: Save the username via the `raw_user_meta_data` in the trigger, or use a SECURITY DEFINER function for the signup username save too.

---

## Issue 5: Fix Payment Gateway in Panel Onboarding

**Root Cause:** The `platform_payment_providers` table has ALL providers set to `is_enabled: false`. The `OnboardingPaymentStep` queries with `.eq('is_enabled', true)`, so it gets 0 results and shows "No payment providers configured."

**Fixes needed:**

1. **Admin must enable at least one provider** -- but since none are enabled, the onboarding payment step should gracefully handle this by showing a clear message and allowing the user to skip to Free plan.

2. The current `OnboardingPaymentStep.tsx` already handles this case (lines 117-133) -- it shows "No payment providers configured" with a "Continue with Free Plan" button. This is correct behavior.

3. However, the `onSkip` prop may not be passed from `PanelOnboardingV2.tsx`. Need to verify and ensure the skip button actually works and transitions to the next step with `subscription_tier: 'free'`.

**File:** `src/pages/panel/PanelOnboardingV2.tsx` -- ensure that when the OnboardingPaymentStep is rendered, the `onSkip` prop is passed and sets the plan to free.

**File:** `src/components/onboarding/OnboardingPaymentStep.tsx` -- the current implementation is already correct (no fake payment simulation). Just ensure the skip flow works.

---

## Issue 6: Subdomain FAQ Text Fix

**File:** `src/components/sections/FAQSection.tsx` (line 72)

Change `yourpanel.homeofsmm.com` to `yourpanel.smmpilot.online` to match the actual platform domain.

---

## Database Migration Required

```sql
-- 1. Create secure username lookup function (bypasses RLS)
CREATE OR REPLACE FUNCTION public.lookup_email_by_username(p_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM profiles
  WHERE LOWER(username) = LOWER(p_username)
  LIMIT 1;
  RETURN v_email;
END;
$$;
```

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Update SEO title/description, remove SectionSkeleton |
| `src/lib/platform-translations.ts` | Ensure H1 translations are correct |
| `src/components/sections/PlatformFeaturesSection.tsx` | Add `id` and `aria-labelledby` for heading |
| `src/components/sections/HeroSection.tsx` | Add hidden SEO paragraph under H1 |
| `src/components/sections/FAQSection.tsx` | Fix subdomain text to .smmpilot.online |
| `src/contexts/AuthContext.tsx` | Use RPC `lookup_email_by_username` instead of direct query |
| `src/pages/panel/PanelOnboardingV2.tsx` | Ensure onSkip is passed to payment step |
| **Database migration** | Create `lookup_email_by_username` function |

---

## Technical Notes

### Why Username Login Was Broken
The profiles table RLS policy (`user_id = auth.uid()`) blocks ALL queries from unauthenticated users. Since username lookup happens BEFORE authentication, the query always returns empty. The fix creates a SECURITY DEFINER function that bypasses RLS safely, only returning the email address (no sensitive data exposed).

### Payment Gateway Status
All `platform_payment_providers` have `is_enabled: false`. This is an admin configuration issue -- the platform administrator needs to enable at least one provider (e.g., Stripe, PayPal) in the admin dashboard. The code correctly handles this by showing "Continue with Free Plan". No code bug here -- just admin setup needed.

### Heading Hierarchy for SEO
```
H1: "Create Your Own SMM Panel" (Hero - one per page)
H2: "Enter the World of..." (Platform Features)
H2: "Trusted by Thousands" (Stats)  
H2: "Powerful Features" (Features)
H2: "What Our Users Say" (Testimonials)
H2: "Your Questions, Answered" (FAQ)
```
All sections already use H2 tags. Adding proper `id` and `aria-labelledby` attributes improves accessibility and crawler parsing.

