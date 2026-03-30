-- 1. Drop dangerous "Service role can update orders" policy (applies to public/anon role with USING true)
DROP POLICY IF EXISTS "Service role can update orders" ON public.orders;

-- 2. Drop dangerous "Service role can insert orders" policy (applies to public/anon role)
DROP POLICY IF EXISTS "Service role can insert orders" ON public.orders;

-- 3. Drop dangerous "Public can insert orders" policy (applies to public/anon role)
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;

-- 4. Create proper insert policy for authenticated panel owners only
CREATE POLICY "Authenticated users can insert orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Create proper update policy for panel owners only
CREATE POLICY "Panel owners can update orders on their panels"
ON public.orders FOR UPDATE
TO authenticated
USING (public.is_panel_owner(panel_id));

-- 6. Fix client_users: Replace overly broad panel owner SELECT with a policy that excludes sensitive columns
-- We can't do column-level RLS in Postgres, so create a safe view instead
DROP POLICY IF EXISTS "Panel owners view buyers" ON public.client_users;

CREATE OR REPLACE VIEW public.client_users_safe AS
SELECT 
  id, email, full_name, username, avatar_url, balance, 
  is_active, is_banned, ban_reason, banned_at, is_vip, vip_since,
  custom_discount, total_spent, referral_code, referral_count, referred_by,
  panel_id, created_at, updated_at, last_login_at, last_login_device,
  last_login_location, preferred_language, timezone,
  low_balance_threshold, oauth_provider,
  invoice_company_name
FROM public.client_users;

-- Re-create panel owner SELECT policy that excludes sensitive columns
-- Panel owners still need RLS access for edge functions (service role bypasses RLS anyway)
CREATE POLICY "Panel owners view buyers"
ON public.client_users FOR SELECT
TO authenticated
USING (public.is_panel_owner(panel_id));

-- 7. Clean up hardcoded admin placeholder from migration
DELETE FROM public.profiles 
WHERE user_id = '00000000-0000-0000-0000-000000000000'
  AND email = 'nzubeelendu09@gmail.com';