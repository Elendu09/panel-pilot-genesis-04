-- Fix function search path issues for security
CREATE OR REPLACE FUNCTION generate_subdomain(panel_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_subdomain text;
    final_subdomain text;
    counter integer := 0;
BEGIN
    -- Clean panel name to create a subdomain
    base_subdomain := lower(regexp_replace(panel_name, '[^a-zA-Z0-9]', '', 'g'));
    final_subdomain := base_subdomain;
    
    -- Check if subdomain exists and append number if needed
    WHILE EXISTS (SELECT 1 FROM panels WHERE subdomain = final_subdomain) LOOP
        counter := counter + 1;
        final_subdomain := base_subdomain || counter::text;
    END LOOP;
    
    RETURN final_subdomain;
END;
$$;

-- Fix update function search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Add missing RLS policies for support_tickets table
CREATE POLICY "Users can view their own tickets" 
ON support_tickets 
FOR SELECT 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own tickets" 
ON support_tickets 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own tickets" 
ON support_tickets 
FOR UPDATE 
USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add missing RLS policies for providers table  
CREATE POLICY "Panel owners can manage their providers"
ON providers
FOR ALL
USING (panel_id IN (
  SELECT id FROM panels 
  WHERE owner_id IN (
    SELECT id FROM profiles 
    WHERE user_id = auth.uid()
  )
));