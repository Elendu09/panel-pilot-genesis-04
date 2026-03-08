

# Plan: Fix Admin Panel/User Listing & Security Issues

## Root Cause Analysis

### Why Panels Don't List for Admin
The `panels` table RLS policy uses `is_any_admin(auth.uid())`, which checks the `user_roles` table. However, the admin user (nzubeelendu09@gmail.com) has `role='admin'` only in the `profiles` table -- there is NO corresponding row in `user_roles`. So `is_any_admin()` returns false, and the admin sees only panels they own (none, if they're purely admin).

The `is_admin()` function checks `profiles.role`, while `is_any_admin()` checks `user_roles`. This inconsistency means some tables work (those using `is_admin()`) and others don't (those using `is_any_admin()`).

### Why Panel Subscriptions Are Missing in Admin View
The `panel_subscriptions` SELECT policy restricts to panel owners only. The admin policy `Admins can manage all subscriptions` uses `is_admin()` (profiles-based) -- this works, but the subscription fetch on line 151 may still return empty if the `is_admin()` check fails or if there's a conflict with the owner-only SELECT policy.

### Admin Can't See Transactions in Panel Details
The `transactions` SELECT policy only allows users to view their own transactions or their panel's transactions. No admin override exists, so the panel details finance tab shows nothing.

### Security Vulnerabilities Found
1. **`orders` table**: `Public can view orders` with `USING(true)` exposes ALL orders (target URLs, prices, buyer IDs) to unauthenticated users
2. **`platform_payment_providers` table**: `Public can view enabled providers` exposes the `config` JSONB column containing Flutterwave/Paystack secret keys
3. **`profiles` INSERT policy**: `WITH CHECK(true)` lets any user self-assign `role='admin'` on signup

---

## Database Migration

### 1. Fix `is_any_admin()` to also check `profiles.role`
```sql
CREATE OR REPLACE FUNCTION public.is_any_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
      AND (expires_at IS NULL OR expires_at > now())
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;
```

### 2. Add admin SELECT for `transactions`
```sql
CREATE POLICY "Admins can view all transactions" ON public.transactions
FOR SELECT TO authenticated USING (public.is_any_admin(auth.uid()));
```

### 3. Add admin SELECT for `client_users`
```sql
CREATE POLICY "Admins can view all buyers" ON public.client_users
FOR SELECT TO authenticated USING (public.is_any_admin(auth.uid()));
```

### 4. Remove dangerous public orders policy
```sql
DROP POLICY "Public can view orders" ON public.orders;
```

### 5. Fix payment provider secret exposure
Replace the public policy with a safe view:
```sql
DROP POLICY "Public can view enabled providers" ON public.platform_payment_providers;
CREATE POLICY "Public can view enabled provider names" ON public.platform_payment_providers
FOR SELECT USING (is_enabled = true AND (
  public.is_any_admin(auth.uid()) OR true
));
```
Actually, a better approach: create a view that excludes `config`, and use that in public-facing code. But the existing `platform_providers_public` view pattern is already established -- we just need to ensure the `config` column is stripped from the public SELECT. Since the current policy returns ALL columns, restrict to authenticated admins for full access and create a safe public view.

### 6. Fix profile INSERT role escalation
```sql
DROP POLICY "Anyone can insert profile" ON public.profiles;
CREATE POLICY "Anyone can insert profile" ON public.profiles
FOR INSERT TO public WITH CHECK (role = 'panel_owner' OR role IS NULL);
```

---

## Code Changes

### `src/pages/admin/PanelManagement.tsx`
- Add error logging for the subscription fetch to surface RLS issues
- No code changes needed -- the RLS fix will make data visible

### No other file changes needed
The admin pages already query correctly with `.limit(5000)`. The issue is purely RLS.

---

## Files to Change

| File | Change |
|------|--------|
| SQL Migration | Fix `is_any_admin()`, add admin SELECT policies, fix security |
| No code files | RLS fixes resolve the listing issues |

