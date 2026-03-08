
-- 1. Fix is_any_admin() to also check profiles.role
CREATE OR REPLACE FUNCTION public.is_any_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
      AND (expires_at IS NULL OR expires_at > now())
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- 2. Add admin SELECT for transactions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all transactions' AND tablename = 'transactions'
  ) THEN
    CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT TO authenticated USING (public.is_any_admin(auth.uid()));
  END IF;
END $$;

-- 3. Add admin SELECT for client_users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all buyers' AND tablename = 'client_users'
  ) THEN
    CREATE POLICY "Admins can view all buyers" ON public.client_users
    FOR SELECT TO authenticated USING (public.is_any_admin(auth.uid()));
  END IF;
END $$;

-- 4. Remove dangerous public orders policy
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;

-- 5. Fix payment provider secret exposure
DROP POLICY IF EXISTS "Public can view enabled providers" ON public.platform_payment_providers;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all providers' AND tablename = 'platform_payment_providers'
  ) THEN
    CREATE POLICY "Admins can view all providers" ON public.platform_payment_providers
    FOR SELECT TO authenticated USING (public.is_any_admin(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated can view enabled providers' AND tablename = 'platform_payment_providers'
  ) THEN
    CREATE POLICY "Authenticated can view enabled providers" ON public.platform_payment_providers
    FOR SELECT TO authenticated USING (is_enabled = true);
  END IF;
END $$;

-- 6. Fix profile INSERT role escalation
DROP POLICY IF EXISTS "Anyone can insert profile" ON public.profiles;
CREATE POLICY "Anyone can insert profile" ON public.profiles
FOR INSERT TO public WITH CHECK (role IS NULL OR role = 'panel_owner');
