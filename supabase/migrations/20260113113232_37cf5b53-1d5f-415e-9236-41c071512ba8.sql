-- Add onboarding progress persistence columns to panels table
ALTER TABLE panels ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE panels ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';
ALTER TABLE panels ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'USD';

-- Create platform_config table for secure settings (Vercel token, etc.)
CREATE TABLE IF NOT EXISTS platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  encrypted_value JSONB,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

-- Only super admins can access platform config (via service role in edge functions)
CREATE POLICY "Platform config is only accessible via service role" 
ON platform_config 
FOR ALL 
USING (false);

-- Insert default Vercel config placeholders
INSERT INTO platform_config (key, description, is_sensitive) VALUES 
  ('vercel_token', 'Vercel API Bearer Token for domain management', true),
  ('vercel_project_id', 'Vercel Project ID for domain configuration', false),
  ('vercel_team_id', 'Vercel Team ID (optional, for team projects)', false)
ON CONFLICT (key) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_platform_config_updated_at
BEFORE UPDATE ON platform_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();