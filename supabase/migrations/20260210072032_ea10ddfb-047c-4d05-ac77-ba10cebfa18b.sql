
-- Fix transaction RLS policies to allow panel owners to view/insert by panel_id
DROP POLICY IF EXISTS "Users can view their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;

-- SELECT: Allow viewing by user_id OR panel ownership
CREATE POLICY "Users can view their transactions" ON public.transactions FOR SELECT
USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR
  panel_id IN (SELECT id FROM panels WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

-- INSERT: Allow inserting when user owns the profile or the panel
CREATE POLICY "Users can create transactions" ON public.transactions FOR INSERT
WITH CHECK (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR
  panel_id IN (SELECT id FROM panels WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
