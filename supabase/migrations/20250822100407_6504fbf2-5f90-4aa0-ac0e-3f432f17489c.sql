-- Create function to generate unique subdomains
CREATE OR REPLACE FUNCTION generate_subdomain(panel_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    base_subdomain text;
    final_subdomain text;
    counter integer := 0;
BEGIN
    -- Clean panel name to create a subdomain
    base_subdomain := lower(regexp_replace(panel_name, '[^a-zA-Z0-9]', '', 'g'));
    final_subdomain := base_subdomain;
    
    -- Check if subdomain exists and append number if needed
    WHILE EXISTS (SELECT 1 FROM panels WHERE subdomain = final_subdomain) LOOP
        counter := counter + 1;
        final_subdomain := base_subdomain || counter::text;
    END LOOP;
    
    RETURN final_subdomain;
END;
$$;

-- Update panel_domains table structure
ALTER TABLE panel_domains ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';
ALTER TABLE panel_domains ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;
ALTER TABLE panel_domains ALTER COLUMN ssl_status SET DEFAULT 'pending';

-- Create index for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_panel_domains_domain ON panel_domains(domain);
CREATE INDEX IF NOT EXISTS idx_panel_domains_panel_id ON panel_domains(panel_id);

-- Update panels table with better subdomain handling
ALTER TABLE panels ALTER COLUMN subdomain SET NOT NULL;
UPDATE panels SET subdomain = generate_subdomain(name) WHERE subdomain IS NULL;

-- Create index for faster panel lookups by subdomain
CREATE INDEX IF NOT EXISTS idx_panels_subdomain ON panels(subdomain);
CREATE INDEX IF NOT EXISTS idx_panels_status ON panels(status);

-- Add RLS policies for panel_domains
CREATE POLICY "Public can view active panel domains" 
ON panel_domains 
FOR SELECT 
USING (panel_id IN (SELECT id FROM panels WHERE status = 'active'));

-- Update services table RLS to allow public viewing with panel context
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
CREATE POLICY "Public can view services from active panels"
ON services
FOR SELECT
USING (
  is_active = true 
  AND panel_id IN (SELECT id FROM panels WHERE status = 'active')
);

-- Create panel settings table for tenant-specific configurations
CREATE TABLE IF NOT EXISTS panel_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id uuid REFERENCES panels(id) ON DELETE CASCADE,
    seo_title text,
    seo_description text,
    seo_keywords text,
    custom_css text,
    maintenance_mode boolean DEFAULT false,
    maintenance_message text,
    contact_info jsonb DEFAULT '{}',
    social_links jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(panel_id)
);

-- Enable RLS on panel_settings
ALTER TABLE panel_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for panel_settings
CREATE POLICY "Panel owners can manage their settings"
ON panel_settings
FOR ALL
USING (panel_id IN (
  SELECT id FROM panels 
  WHERE owner_id IN (
    SELECT id FROM profiles 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Public can view settings for active panels"
ON panel_settings
FOR SELECT
USING (panel_id IN (SELECT id FROM panels WHERE status = 'active'));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_panel_settings_updated_at
    BEFORE UPDATE ON panel_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings for existing panels
INSERT INTO panel_settings (panel_id, seo_title, seo_description)
SELECT id, name || ' - SMM Panel', 'Professional social media marketing services'
FROM panels
WHERE id NOT IN (SELECT panel_id FROM panel_settings WHERE panel_id IS NOT NULL);