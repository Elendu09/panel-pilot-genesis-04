-- 1. Add unique constraint on owner_id for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS panels_owner_id_unique ON public.panels (owner_id);

-- 2. Create SECURITY DEFINER function for anonymous service access
CREATE OR REPLACE FUNCTION public.is_panel_active(p_panel_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.panels 
    WHERE id = p_panel_id AND status = 'active'
  );
$$;

-- 3. Fix services RLS policy to use SECURITY DEFINER function
DROP POLICY IF EXISTS "Public can view services from active panels" ON public.services;
CREATE POLICY "Public can view services from active panels" ON public.services
  FOR SELECT USING (is_active = true AND public.is_panel_active(panel_id));