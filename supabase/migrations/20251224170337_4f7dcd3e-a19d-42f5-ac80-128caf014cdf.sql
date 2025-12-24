-- Add hosting_provider column to panels table
ALTER TABLE panels ADD COLUMN IF NOT EXISTS hosting_provider TEXT DEFAULT 'lovable';

-- Add columns to panel_domains for multi-provider verification
ALTER TABLE panel_domains ADD COLUMN IF NOT EXISTS hosting_provider TEXT DEFAULT 'lovable';
ALTER TABLE panel_domains ADD COLUMN IF NOT EXISTS expected_target TEXT;
ALTER TABLE panel_domains ADD COLUMN IF NOT EXISTS txt_verification_record TEXT;
ALTER TABLE panel_domains ADD COLUMN IF NOT EXISTS txt_verified_at TIMESTAMPTZ;