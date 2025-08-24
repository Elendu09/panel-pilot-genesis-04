
-- Update user roles to include more granular permissions
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'reseller';

-- Add new columns to panels table for enhanced functionality
ALTER TABLE public.panels 
ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1e40af',
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{"api_access": true, "custom_branding": true, "analytics": true}';

-- Create panel_domains table for multiple domain support
CREATE TABLE IF NOT EXISTS public.panel_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  ssl_status TEXT DEFAULT 'pending',
  dns_configured BOOLEAN DEFAULT false,
  verification_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(panel_id, domain)
);

-- Create panel_templates table for theme customization
CREATE TABLE IF NOT EXISTS public.panel_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create panel_analytics table for tracking
CREATE TABLE IF NOT EXISTS public.panel_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0.00,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(panel_id, date)
);

-- Create panel_notifications table
CREATE TABLE IF NOT EXISTS public.panel_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.panel_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panel_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for panel_domains
CREATE POLICY "Panel owners can manage their domains" ON public.panel_domains
  FOR ALL USING (panel_id IN (SELECT id FROM public.panels WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Create RLS policies for panel_templates
CREATE POLICY "Panel owners can manage their templates" ON public.panel_templates
  FOR ALL USING (panel_id IN (SELECT id FROM public.panels WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Create RLS policies for panel_analytics
CREATE POLICY "Panel owners can view their analytics" ON public.panel_analytics
  FOR SELECT USING (panel_id IN (SELECT id FROM public.panels WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Create RLS policies for panel_notifications
CREATE POLICY "Users can view their notifications" ON public.panel_notifications
  FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to generate subdomain
CREATE OR REPLACE FUNCTION generate_subdomain(panel_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_subdomain TEXT;
  final_subdomain TEXT;
  counter INTEGER := 0;
BEGIN
  -- Clean and format the panel name
  base_subdomain := lower(regexp_replace(panel_name, '[^a-zA-Z0-9]', '', 'g'));
  base_subdomain := substring(base_subdomain from 1 for 20);
  
  -- Ensure minimum length
  IF length(base_subdomain) < 3 THEN
    base_subdomain := base_subdomain || 'panel';
  END IF;
  
  final_subdomain := base_subdomain;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.panels WHERE subdomain = final_subdomain) LOOP
    counter := counter + 1;
    final_subdomain := base_subdomain || counter::TEXT;
  END LOOP;
  
  RETURN final_subdomain;
END;
$$ LANGUAGE plpgsql;

-- Update existing panels to have subdomains
UPDATE public.panels 
SET subdomain = generate_subdomain(name)
WHERE subdomain IS NULL;

-- Create triggers for updated_at
CREATE TRIGGER update_panel_domains_updated_at
  BEFORE UPDATE ON public.panel_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panel_templates_updated_at
  BEFORE UPDATE ON public.panel_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle panel approval
CREATE OR REPLACE FUNCTION public.approve_panel(panel_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.panels 
  SET status = 'active', is_approved = true
  WHERE id = panel_id;
  
  -- Create default template
  INSERT INTO public.panel_templates (panel_id, name, template_data, is_active)
  VALUES (
    panel_id, 
    'Default Theme', 
    '{"theme": "dark_gradient", "colors": {"primary": "#3b82f6", "secondary": "#1e40af"}}',
    true
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
