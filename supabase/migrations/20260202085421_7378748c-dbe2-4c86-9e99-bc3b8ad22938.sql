-- Provider Ads System Tables

-- Table for ad pricing tiers (admin-controlled)
CREATE TABLE public.provider_ad_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_type TEXT NOT NULL UNIQUE CHECK (ad_type IN ('sponsored', 'top', 'best', 'featured')),
  daily_rate NUMERIC NOT NULL DEFAULT 5.00,
  weekly_rate NUMERIC NOT NULL DEFAULT 30.00,
  monthly_rate NUMERIC NOT NULL DEFAULT 100.00,
  max_slots INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default pricing
INSERT INTO public.provider_ad_pricing (ad_type, daily_rate, weekly_rate, monthly_rate, max_slots, description) VALUES
  ('sponsored', 5.00, 30.00, 100.00, 3, 'Premium placement at top of marketplace with gold badge'),
  ('top', 3.00, 18.00, 60.00, 10, 'Highlighted in Top Providers section'),
  ('best', 2.00, 12.00, 40.00, 10, 'Editor''s Pick style badge'),
  ('featured', 4.00, 24.00, 80.00, 5, 'Homepage carousel inclusion');

-- Table for active provider advertisements
CREATE TABLE public.provider_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('sponsored', 'top', 'best', 'featured')),
  position INTEGER DEFAULT 0,
  daily_fee NUMERIC NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for direct provider connections (HomeOfSMM panels as providers)
CREATE TABLE public.direct_provider_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  target_panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  client_user_id UUID REFERENCES public.client_users(id) ON DELETE SET NULL,
  api_key TEXT,
  balance_transferred NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_panel_id, target_panel_id)
);

-- Add columns to providers table for direct provider support
ALTER TABLE public.providers 
  ADD COLUMN IF NOT EXISTS is_direct BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS source_panel_id UUID REFERENCES public.panels(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS direct_connection_id UUID REFERENCES public.direct_provider_connections(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.provider_ad_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_provider_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_ad_pricing (admin managed, public read)
CREATE POLICY "Anyone can view ad pricing" ON public.provider_ad_pricing FOR SELECT USING (true);
CREATE POLICY "Admin can manage ad pricing" ON public.provider_ad_pricing FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- RLS Policies for provider_ads
CREATE POLICY "Panel owners can view their own ads" ON public.provider_ads FOR SELECT USING (
  panel_id IN (SELECT id FROM panels WHERE owner_id = auth.uid())
);
CREATE POLICY "Panel owners can create ads for their panel" ON public.provider_ads FOR INSERT WITH CHECK (
  panel_id IN (SELECT id FROM panels WHERE owner_id = auth.uid())
);
CREATE POLICY "Panel owners can update their own ads" ON public.provider_ads FOR UPDATE USING (
  panel_id IN (SELECT id FROM panels WHERE owner_id = auth.uid())
);
CREATE POLICY "Admin can manage all ads" ON public.provider_ads FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Anyone can view active ads for marketplace" ON public.provider_ads FOR SELECT USING (
  is_active = true AND expires_at > now()
);

-- RLS Policies for direct_provider_connections
CREATE POLICY "Panel owners can view their connections" ON public.direct_provider_connections FOR SELECT USING (
  source_panel_id IN (SELECT id FROM panels WHERE owner_id = auth.uid()) OR
  target_panel_id IN (SELECT id FROM panels WHERE owner_id = auth.uid())
);
CREATE POLICY "Panel owners can create connections from their panel" ON public.direct_provider_connections FOR INSERT WITH CHECK (
  source_panel_id IN (SELECT id FROM panels WHERE owner_id = auth.uid())
);
CREATE POLICY "Panel owners can update their connections" ON public.direct_provider_connections FOR UPDATE USING (
  source_panel_id IN (SELECT id FROM panels WHERE owner_id = auth.uid())
);

-- Create indexes for better performance
CREATE INDEX idx_provider_ads_panel_id ON public.provider_ads(panel_id);
CREATE INDEX idx_provider_ads_active ON public.provider_ads(is_active, expires_at);
CREATE INDEX idx_provider_ads_type ON public.provider_ads(ad_type);
CREATE INDEX idx_direct_connections_source ON public.direct_provider_connections(source_panel_id);
CREATE INDEX idx_direct_connections_target ON public.direct_provider_connections(target_panel_id);
CREATE INDEX idx_providers_is_direct ON public.providers(is_direct) WHERE is_direct = true;