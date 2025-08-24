-- Fix remaining function search path issues
CREATE OR REPLACE FUNCTION public.approve_panel(panel_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE panels 
  SET status = 'active', is_approved = true
  WHERE id = panel_id;
  
  -- Create default template
  INSERT INTO panel_templates (panel_id, name, template_data, is_active)
  VALUES (
    panel_id, 
    'Default Theme', 
    '{"theme": "dark_gradient", "colors": {"primary": "#3b82f6", "secondary": "#1e40af"}}',
    true
  );
  
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_num TEXT;
BEGIN
  order_num := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
  RETURN order_num;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;