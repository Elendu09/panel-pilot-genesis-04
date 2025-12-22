-- Create storage bucket for panel assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('panel-assets', 'panel-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their panel folder
CREATE POLICY "Panel owners can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'panel-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

-- Allow public read access to panel assets
CREATE POLICY "Public can view panel assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'panel-assets');

-- Allow panel owners to update their assets
CREATE POLICY "Panel owners can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'panel-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

-- Allow panel owners to delete their assets
CREATE POLICY "Panel owners can delete assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'panel-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);