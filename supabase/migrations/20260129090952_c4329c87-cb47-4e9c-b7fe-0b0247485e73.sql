-- Add api_key column to client_users for tenant API key storage
ALTER TABLE public.client_users ADD COLUMN IF NOT EXISTS api_key TEXT;

-- Add unique constraint to prevent duplicate API keys across the system
ALTER TABLE public.client_users ADD CONSTRAINT client_users_api_key_unique UNIQUE (api_key);

-- Create partial index for fast API key lookups (only index non-null values)
CREATE INDEX IF NOT EXISTS idx_client_users_api_key ON public.client_users(api_key) WHERE api_key IS NOT NULL;