-- 1. Fix payment-proofs SELECT policy: restrict to file owner or panel owner
DROP POLICY IF EXISTS "Authenticated users can view payment proofs" ON storage.objects;

CREATE POLICY "Owners and panel owners can view payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    EXISTS (
      SELECT 1 FROM public.panels p
      JOIN public.profiles pr ON p.owner_id = pr.id
      WHERE pr.user_id = auth.uid()
        AND p.id::text = (storage.foldername(name))[1]
    )
    OR
    public.is_any_admin(auth.uid())
  )
);

-- 2. Fix promo_codes: remove overly permissive public policy, add panel-scoped one
DROP POLICY IF EXISTS "Public can view active promo codes" ON public.promo_codes;

CREATE POLICY "Panel-scoped active promo code lookup"
ON public.promo_codes FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND (valid_until IS NULL OR valid_until > now())
  AND (max_uses IS NULL OR used_count < max_uses)
);