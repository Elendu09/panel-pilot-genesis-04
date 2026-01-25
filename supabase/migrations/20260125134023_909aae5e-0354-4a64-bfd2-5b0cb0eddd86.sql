-- Add integrations JSONB column to panel_settings for storing service integration configs
ALTER TABLE panel_settings 
ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the integrations column structure
COMMENT ON COLUMN panel_settings.integrations IS 'Stores service integration configurations like analytics, chat widgets, OAuth. Structure: {"google_analytics": {"enabled": true, "code": "..."}, "telegram_bot": {...}}';

-- Add OAuth configuration columns
ALTER TABLE panel_settings 
ADD COLUMN IF NOT EXISTS oauth_google_client_id TEXT,
ADD COLUMN IF NOT EXISTS oauth_google_client_secret TEXT,
ADD COLUMN IF NOT EXISTS oauth_google_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS oauth_telegram_client_id TEXT,
ADD COLUMN IF NOT EXISTS oauth_telegram_client_secret TEXT,
ADD COLUMN IF NOT EXISTS oauth_telegram_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS oauth_vk_client_id TEXT,
ADD COLUMN IF NOT EXISTS oauth_vk_client_secret TEXT,
ADD COLUMN IF NOT EXISTS oauth_vk_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS oauth_discord_client_id TEXT,
ADD COLUMN IF NOT EXISTS oauth_discord_client_secret TEXT,
ADD COLUMN IF NOT EXISTS oauth_discord_enabled BOOLEAN DEFAULT FALSE;