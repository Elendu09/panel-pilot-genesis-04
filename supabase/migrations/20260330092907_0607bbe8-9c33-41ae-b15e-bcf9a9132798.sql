-- Fix 1: Payment proofs - restrict DELETE to file owner or panel owner
DROP POLICY IF EXISTS "Authenticated can delete payment proofs" ON storage.objects;

CREATE POLICY "Users can delete own payment proofs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (
    -- File owner (uploader) can delete
    auth.uid()::text = (storage.foldername(name))[1]
    -- Or panel owner can delete
    OR EXISTS (
      SELECT 1 FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE pr.user_id = auth.uid()
    )
  )
);

-- Fix 2: Chat messages - add visitor-scoped SELECT policy
-- Visitors identify by session's visitor_id stored in their context
-- Use service_role for inserts (already done), add a policy so visitors
-- can read messages from their own sessions via a visitor_id match

CREATE POLICY "Visitors can read their own chat messages"
ON public.chat_messages
FOR SELECT
TO anon, authenticated
USING (
  session_id IN (
    SELECT id FROM chat_sessions
    WHERE visitor_id = coalesce(
      current_setting('request.headers', true)::json->>'x-visitor-id',
      ''
    )
  )
);