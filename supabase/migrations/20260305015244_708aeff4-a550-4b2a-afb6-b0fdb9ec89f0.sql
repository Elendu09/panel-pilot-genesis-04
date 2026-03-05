-- Create storage bucket for payment proof uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can upload payment proofs (buyers use anon key)
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  (storage.extension(name) IN ('png', 'jpg', 'jpeg', 'gif', 'webp'))
);

-- Public read access for viewing proofs
CREATE POLICY "Public can view payment proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-proofs');

-- Authenticated can delete payment proofs (panel owners managing)
CREATE POLICY "Authenticated can delete payment proofs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-proofs');