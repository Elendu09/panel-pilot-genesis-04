-- Fix the overly permissive invoice insert policy
DROP POLICY IF EXISTS "System can insert invoices" ON invoices;

-- Create a more secure policy for system-generated invoices
CREATE POLICY "Service role can insert invoices" ON invoices
  FOR INSERT WITH CHECK (auth.role() = 'service_role');