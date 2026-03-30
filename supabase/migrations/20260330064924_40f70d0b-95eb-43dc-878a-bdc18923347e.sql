-- =============================================================
-- FIX 1: support_tickets - Broken RLS policy allowing cross-tenant reads
-- =============================================================

DROP POLICY IF EXISTS "Buyers can view their tickets" ON public.support_tickets;

CREATE POLICY "Buyers can view their tickets"
ON public.support_tickets
FOR SELECT
USING (
  ticket_type = 'user_to_panel'
  AND user_id IN (
    SELECT client_users.id FROM client_users
    WHERE (client_users.id)::text = (
      (current_setting('request.jwt.claims'::text, true))::json ->> 'buyer_id'
    )
  )
);

-- =============================================================
-- FIX 2: services table - Provider costs publicly visible
-- Create safe view excluding cost columns for buyers
-- =============================================================

DROP VIEW IF EXISTS public.buyer_visible_services;

CREATE OR REPLACE VIEW public.buyer_visible_services
WITH (security_invoker = false)
AS
SELECT
  s.id,
  s.panel_id,
  s.name,
  s.description,
  s.category,
  s.price,
  s.min_quantity,
  s.max_quantity,
  s.is_active,
  s.display_order,
  s.sort_order,
  s.image_url,
  s.service_type,
  s.dripfeed_available,
  s.refill_available,
  s.cancel_available,
  s.estimated_time,
  s.average_time,
  s.category_id,
  s.created_at,
  s.updated_at
FROM public.services s
WHERE s.is_active = true AND s.is_hidden = false;

GRANT SELECT ON public.buyer_visible_services TO anon, authenticated;

-- Remove public SELECT on services base table
DROP POLICY IF EXISTS "Active services are publicly visible" ON public.services;
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;

-- Only panel owners and admins can query services directly
CREATE POLICY "Panel owners can view their services"
ON public.services
FOR SELECT
TO authenticated
USING (
  public.is_panel_owner(panel_id) OR public.is_any_admin(auth.uid())
);

-- =============================================================
-- FIX 3: payment-proofs bucket - Make private
-- =============================================================

UPDATE storage.buckets
SET public = false
WHERE id = 'payment-proofs';

DROP POLICY IF EXISTS "Public can view payment proofs" ON storage.objects;

CREATE POLICY "Panel owners can view payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
);

-- =============================================================
-- FIX 4: buyer_notifications - Remove public INSERT with true
-- =============================================================

DROP POLICY IF EXISTS "System can insert notifications" ON public.buyer_notifications;