ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_secret text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_backup_codes jsonb DEFAULT '[]'::jsonb;