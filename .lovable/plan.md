
# Fix Plan: Vercel 404, Payment Transaction, Username Auth, Step Counter, and Build Errors

## Issue 1: Vercel 404 Error on Routes like `/auth?verified=true`

**Root Cause:** The `vercel.json` rewrites use `/(.)` (matches single character) instead of `/(.*)` (matches any path). The diff shows the wildcard `*` was lost during a manual edit.

**Fix in `vercel.json`:**
- Line 9: `"source": "/(.)"` must become `"source": "/(.*)"` 
- Line 13: `"source": "/(.)"` must become `"source": "/(.*)"` 
- Line 25: `"source": "/assets/(.)"` must become `"source": "/assets/(.*)"` 
- Line 37: `"source": "/(.).png"` must become `"source": "/(.*).png"` 

All regex patterns need the `*` quantifier restored.

---

## Issue 2: "Failed to create transaction record" Payment Error

**Root Cause:** The `process-payment` edge function tries to insert `metadata` and later update `external_id` on the `transactions` table, but **neither column exists**. The database only has: `id, user_id, order_id, amount, type, status, payment_method, payment_id, description, created_at, panel_id, buyer_id`.

The transaction INSERT at line 167-180 includes `metadata` (for orderId), and the UPDATE at line 1227 uses `external_id`. Both fail silently or cause errors.

**Fix:**

**Database migration** to add the missing columns:
```sql
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS external_id text DEFAULT NULL;
```

Also fix the `transactionIdToUse` type issue causing build errors. Since `txId` can be `string | undefined` when `transactionId` is optional and the insert may fail, we need to ensure it's always `string` after the transaction is created:
```typescript
const transactionIdToUse: string = txId!;
```

Additionally, when `panel` is null (owner deposit without panelId), the gateway cases reference `panel.name` which would crash. Add a fallback:
```typescript
const panelName = panel?.name || 'Platform';
```
Then replace all `panel.name` references in gateway cases with `panelName`.

---

## Issue 3: Username Sign-In "Username not found" Error

**Root Cause:** The `lookup_email_by_username` RPC function works correctly. However, the `signUp` function in `AuthContext.tsx` updates the profile username AFTER signup (line 144-147), but by that time the user might not be confirmed yet. The `handle_new_user` trigger creates the profile with no username. Then the update at line 144 might fail because the user isn't fully authenticated yet.

The real issue: During signup, Supabase creates the auth user and fires the `handle_new_user` trigger which creates a profile WITHOUT a username. Then `signUp` tries to update the profile, but the user hasn't verified their email yet, so RLS blocks the update (the user isn't authenticated).

**Fix in `AuthContext.tsx`:**
- Pass username in `raw_user_meta_data` during signup (already done at line 129)
- Update `handle_new_user` trigger to extract username from metadata:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, avatar_url, username)
  VALUES (
    NEW.id, NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url',''),
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$;
```

**Username validation in `Auth.tsx` signup form:**
- Add min length (3) and max length (20) validation
- Add a uniqueness check before submitting
- Add visual feedback for username constraints

---

## Issue 4: Step Counter Shows "Step 1 of 6" Instead of Correct Number

**Root Cause:** When the user resumes onboarding at the payment step (step id=2), `visibleSteps.findIndex(s => s.id === currentStep)` returns the index within the filtered visible steps array. The `Math.max(0, ...)` guard was added but the issue persists because:

1. When `selectedPlan` is `pro`, the payment step IS visible (7 steps total: 0-6)
2. The payment step has `id: 2`, so `findIndex` should find it at index 2 (0-indexed), showing "Step 3 of 7"
3. But the screenshot shows "Step 1 of 6" -- this means `visibleStepIndex` is 0

This happens because on resume, `selectedPlan` defaults to `'free'` initially (line 61), and the saved data restoration happens asynchronously. So `shouldShowPaymentStep` evaluates to `false` (since `selectedPlan` starts as `'free'`), removing the payment step from `visibleSteps`. Then `findIndex` for step id=2 returns -1, `Math.max(0, -1)` = 0, showing "Step 1 of 6".

**Fix:** The `selectedPlan` must be restored BEFORE `visibleSteps` is computed. The issue is that state restoration is async (in `useEffect`), so there's a render cycle where the old default values are used. 

Add a `restoringState` flag that prevents rendering until state is fully restored:
```typescript
const [restoringState, setRestoringState] = useState(true);
```
Set it to `false` after all saved data is restored. Show a loader while restoring.

---

## Issue 5: Build Errors (TypeScript)

**Root Cause:** Multiple edge functions use `error.message` on `unknown` type errors, and `process-payment` has `transactionIdToUse` typed as `string | undefined`.

**Fix for `process-payment/index.ts`:**
- Line 194: Cast `txId` properly: `const transactionIdToUse = txId as string;`
- All `panel.name` references when panel could be null: use `panelName` fallback variable

**Fix for other edge functions:** Each `catch (error)` block needs `(error as Error).message`. This affects ~30 files but is a straightforward pattern replacement.

---

## Summary of All Changes

### Database Migration
```sql
-- Add missing columns to transactions table
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS external_id text DEFAULT NULL;

-- Fix handle_new_user to capture username from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, avatar_url, username)
  VALUES (
    NEW.id, NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url',''),
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$;
```

### File Changes

| File | Change |
|------|--------|
| `vercel.json` | Restore `(.*)` wildcard patterns in all rewrite/header source rules |
| `supabase/functions/process-payment/index.ts` | Fix `transactionIdToUse` type; add `panelName` fallback for null panel; cast error types |
| `src/pages/Auth.tsx` | Add username validation (3-20 chars, uniqueness check) in signup form |
| `src/pages/panel/PanelOnboardingV2.tsx` | Add `restoringState` flag to prevent step counter flash; don't render until saved state is loaded |
| ~30 edge function files | Replace `error.message` with `(error as Error).message` in catch blocks |

### Edge Function Build Error Fixes (all same pattern)

Files needing `(error as Error).message`:
- `add-vercel-domain/index.ts`
- `admin-panel-ops/index.ts`
- `auto-verify-domains/index.ts`
- `categorize-others/index.ts`
- `currency-convert/index.ts`
- `dns-lookup/index.ts` (2 places)
- `dns-namecheap/index.ts`
- `enhance-seo-text/index.ts`
- `generate-robots/index.ts`
- `generate-service-description/index.ts`
- `generate-sitemap/index.ts`
- `import-provider-services/index.ts`
- `normalize-services/index.ts`
- `panel-customers/index.ts`
- `payment-webhook/index.ts`
- `process-referral-reward/index.ts`
- `provider-balance/index.ts`
- `provider-services/index.ts`
- `save-platform-config/index.ts`
- `send-notification/index.ts`
- `team-auth/index.ts`
- `update-security-settings/index.ts`
- `validate-payment-gateway/index.ts` (7 places)
- `verify-domain-dns/index.ts`
- `verify-domain-txt/index.ts`

Additional specific fixes:
- `domain-health-check/index.ts` line 127: cast TXT records type
- `serve-favicon/index.ts` lines 100-101: add `.single()` or type assertion for panel query
- `webhook-notify/index.ts` lines 191, 232: fix null URL and `.rpc` condition
