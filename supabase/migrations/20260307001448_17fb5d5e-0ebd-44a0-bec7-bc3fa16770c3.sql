DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all profiles' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_any_admin(auth.uid()));
  END IF;
END $$;