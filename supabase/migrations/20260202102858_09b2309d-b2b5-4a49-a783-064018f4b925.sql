-- Fix provider_ads INSERT policy for authenticated users using proper auth context
DROP POLICY IF EXISTS "Panel owners can create ads for their panel" ON public.provider_ads;

CREATE POLICY "Panel owners can create ads for their panel" 
ON public.provider_ads 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM panels 
    JOIN profiles ON panels.owner_id = profiles.id
    WHERE panels.id = panel_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Also update SELECT/UPDATE/DELETE policies to use proper auth
DROP POLICY IF EXISTS "Panel owners can view their ads" ON public.provider_ads;
CREATE POLICY "Panel owners can view their ads" 
ON public.provider_ads 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM panels 
    JOIN profiles ON panels.owner_id = profiles.id
    WHERE panels.id = panel_id 
    AND profiles.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Panel owners can update their ads" ON public.provider_ads;
CREATE POLICY "Panel owners can update their ads" 
ON public.provider_ads 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM panels 
    JOIN profiles ON panels.owner_id = profiles.id
    WHERE panels.id = panel_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Allow admins to view all ads
DROP POLICY IF EXISTS "Admins can view all ads" ON public.provider_ads;
CREATE POLICY "Admins can view all ads" 
ON public.provider_ads 
FOR SELECT 
TO authenticated
USING (public.is_admin());