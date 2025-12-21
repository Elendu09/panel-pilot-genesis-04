-- Add ticket_type column to support_tickets table
ALTER TABLE support_tickets 
ADD COLUMN ticket_type text NOT NULL DEFAULT 'user_to_panel';

-- Add constraint for valid ticket types
ALTER TABLE support_tickets 
ADD CONSTRAINT valid_ticket_type 
CHECK (ticket_type IN ('user_to_panel', 'panel_to_admin'));

-- Create policy for admins to view panel-to-admin tickets
CREATE POLICY "Admins can view panel to admin tickets"
  ON support_tickets FOR SELECT
  USING (
    ticket_type = 'panel_to_admin' 
    AND is_any_admin(auth.uid())
  );

-- Create policy for admins to update panel-to-admin tickets
CREATE POLICY "Admins can update panel to admin tickets"
  ON support_tickets FOR UPDATE
  USING (
    ticket_type = 'panel_to_admin' 
    AND is_any_admin(auth.uid())
  );

-- Create policy for panel owners to create platform support tickets
CREATE POLICY "Panel owners can create platform tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (
    ticket_type = 'panel_to_admin' 
    AND user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Create policy for users to view their platform tickets
CREATE POLICY "Users can view their platform tickets"
  ON support_tickets FOR SELECT
  USING (
    ticket_type = 'panel_to_admin'
    AND user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );