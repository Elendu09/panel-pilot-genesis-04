-- Fix RLS policies for buyer tables
-- Since buyers use custom auth (not Supabase Auth), we need to restrict these tables
-- to service role access only and handle access through edge functions

-- ================================================
-- BUYER_CART - Fix overly permissive policies
-- ================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Buyers can view their own cart items" ON public.buyer_cart;
DROP POLICY IF EXISTS "Buyers can add items to their cart" ON public.buyer_cart;
DROP POLICY IF EXISTS "Buyers can update their cart items" ON public.buyer_cart;
DROP POLICY IF EXISTS "Buyers can delete their cart items" ON public.buyer_cart;

-- Create restrictive policies - only allow service role (via edge functions)
-- No direct client access - all operations go through buyer-api edge function
CREATE POLICY "Service role can manage buyer cart"
ON public.buyer_cart
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Panel owners can view their customers' carts for admin purposes
CREATE POLICY "Panel owners can view cart items"
ON public.buyer_cart
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.panels p
    JOIN public.profiles pr ON p.owner_id = pr.id
    WHERE p.id = buyer_cart.panel_id AND pr.user_id = auth.uid()
  )
);

-- ================================================
-- BUYER_FAVORITES - Fix overly permissive policies
-- ================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Buyers can view their own favorites" ON public.buyer_favorites;
DROP POLICY IF EXISTS "Buyers can manage their own favorites" ON public.buyer_favorites;

-- Create restrictive policies
CREATE POLICY "Service role can manage buyer favorites"
ON public.buyer_favorites
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Panel owners can view their customers' favorites
CREATE POLICY "Panel owners can view favorites"
ON public.buyer_favorites
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.panels p
    JOIN public.profiles pr ON p.owner_id = pr.id
    WHERE p.id = buyer_favorites.panel_id AND pr.user_id = auth.uid()
  )
);

-- ================================================
-- BUYER_NOTIFICATIONS - Fix overly permissive policies
-- ================================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Buyers can view their own notifications" ON public.buyer_notifications;
DROP POLICY IF EXISTS "Buyers can update their own notifications" ON public.buyer_notifications;

-- Create restrictive policies
CREATE POLICY "Service role can manage buyer notifications"
ON public.buyer_notifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Panel owners can manage notifications for their panel
CREATE POLICY "Panel owners can manage notifications"
ON public.buyer_notifications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.panels p
    JOIN public.profiles pr ON p.owner_id = pr.id
    WHERE p.id = buyer_notifications.panel_id AND pr.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.panels p
    JOIN public.profiles pr ON p.owner_id = pr.id
    WHERE p.id = buyer_notifications.panel_id AND pr.user_id = auth.uid()
  )
);

-- ================================================
-- Fix search_path on functions without it
-- ================================================

-- Fix get_service_avg_rating function
CREATE OR REPLACE FUNCTION public.get_service_avg_rating(p_service_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0)
  FROM public.service_reviews
  WHERE service_id = p_service_id AND is_visible = true;
$$;
