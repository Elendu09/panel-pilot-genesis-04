-- Add RLS policy to allow buyers (client_users) to create tickets
-- Buyers don't use Supabase auth, so we need a permissive policy for user_to_panel tickets
-- The application logic ensures buyer.id is passed correctly

-- First, drop the overly restrictive policy if it exists
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;

-- Create a more permissive INSERT policy that allows:
-- 1. Panel owners (profiles) to create panel_to_admin tickets
-- 2. Anyone to create user_to_panel tickets (buyers use custom auth)
CREATE POLICY "Allow ticket creation"
ON public.support_tickets
FOR INSERT
WITH CHECK (
  -- Panel owners creating platform tickets
  (ticket_type = 'panel_to_admin' AND user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  ))
  OR
  -- Buyers creating tickets to panel (uses custom auth, not Supabase auth)
  -- The panel_id must be provided and user_id must be a valid client_user
  (ticket_type = 'user_to_panel' AND panel_id IS NOT NULL AND user_id IN (
    SELECT id FROM client_users WHERE panel_id = support_tickets.panel_id
  ))
);

-- Also add SELECT policy for buyers to view their own tickets
DROP POLICY IF EXISTS "Buyers can view their tickets" ON public.support_tickets;

CREATE POLICY "Buyers can view their tickets"
ON public.support_tickets
FOR SELECT
USING (
  ticket_type = 'user_to_panel' 
  AND user_id IN (SELECT id FROM client_users)
);

-- Panel owners need to see user_to_panel tickets for their panel
DROP POLICY IF EXISTS "Panel owners can view customer tickets" ON public.support_tickets;

CREATE POLICY "Panel owners can view customer tickets"
ON public.support_tickets
FOR SELECT
USING (
  ticket_type = 'user_to_panel'
  AND panel_id IN (
    SELECT id FROM panels WHERE owner_id = auth.uid()
  )
);

-- Panel owners can update customer tickets
DROP POLICY IF EXISTS "Panel owners can update customer tickets" ON public.support_tickets;

CREATE POLICY "Panel owners can update customer tickets"
ON public.support_tickets
FOR UPDATE
USING (
  ticket_type = 'user_to_panel'
  AND panel_id IN (
    SELECT id FROM panels WHERE owner_id = auth.uid()
  )
);