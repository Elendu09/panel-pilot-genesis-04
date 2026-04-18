ALTER TABLE public.client_users
  ADD COLUMN IF NOT EXISTS verification_token TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_client_users_verification_token
  ON public.client_users (panel_id, verification_token)
  WHERE verification_token IS NOT NULL;
