
-- 1. Allow buyers (public/anon) to read orders
CREATE POLICY "Public can view orders" ON orders FOR SELECT TO public USING (true);

-- 2. Allow public to insert orders (for buyer-order edge function using service role, but also for anon inserts)
CREATE POLICY "Public can insert orders" ON orders FOR INSERT TO public WITH CHECK (true);

-- 3. Allow admins to see and manage all panels
DROP POLICY IF EXISTS "Panel owners can manage their panels" ON panels;
CREATE POLICY "Panel owners and admins can manage panels" ON panels FOR ALL TO authenticated 
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_any_admin(auth.uid()))
  WITH CHECK (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_any_admin(auth.uid()));
