-- Add UPDATE RLS policy for panel owners to approve/reject transactions
CREATE POLICY "Panel owners can update their buyer transactions"
  ON public.transactions FOR UPDATE
  USING (
    panel_id IN (
      SELECT panels.id FROM panels
      JOIN profiles ON panels.owner_id = profiles.id
      WHERE profiles.user_id = auth.uid()
    )
  );
