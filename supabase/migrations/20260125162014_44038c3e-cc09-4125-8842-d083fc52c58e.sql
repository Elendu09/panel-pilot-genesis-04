-- Add OAuth-related columns to client_users for social login
ALTER TABLE client_users
ADD COLUMN IF NOT EXISTS oauth_provider TEXT,
ADD COLUMN IF NOT EXISTS oauth_provider_id TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for faster OAuth lookups
CREATE INDEX IF NOT EXISTS idx_client_users_oauth 
ON client_users(panel_id, oauth_provider, oauth_provider_id);

-- Create composite unique constraint for OAuth provider per panel
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_users_oauth_unique 
ON client_users(panel_id, oauth_provider, oauth_provider_id) 
WHERE oauth_provider IS NOT NULL AND oauth_provider_id IS NOT NULL;