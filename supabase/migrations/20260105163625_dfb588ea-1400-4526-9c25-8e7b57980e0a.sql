-- =====================================================
-- PROFESSIONAL SMM PANEL SERVICE IMPORT ARCHITECTURE
-- Fixed: Handle existing provider_service_id TEXT column
-- =====================================================

-- 1. provider_services: Raw provider data store (never expose to buyers)
CREATE TABLE IF NOT EXISTS public.provider_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  external_service_id TEXT NOT NULL,
  raw_name TEXT NOT NULL,
  raw_category TEXT,
  raw_type TEXT,
  provider_rate NUMERIC(10,4) NOT NULL DEFAULT 0,
  min_quantity INTEGER DEFAULT 10,
  max_quantity INTEGER DEFAULT 1000000,
  raw_description TEXT,
  refill_available BOOLEAN DEFAULT false,
  cancel_available BOOLEAN DEFAULT false,
  dripfeed_available BOOLEAN DEFAULT false,
  average_time TEXT,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'inactive', 'discontinued', 'error')),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(panel_id, provider_id, external_service_id)
);

-- 2. normalized_services: AI-cleaned metadata layer
CREATE TABLE IF NOT EXISTS public.normalized_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_service_id UUID NOT NULL REFERENCES provider_services(id) ON DELETE CASCADE,
  detected_platform TEXT NOT NULL,
  detected_service_type TEXT,
  detected_delivery_type TEXT,
  normalized_name TEXT NOT NULL,
  buyer_friendly_category TEXT,
  platform_icon TEXT,
  service_icon TEXT,
  confidence_score NUMERIC(3,2) DEFAULT 0.5,
  admin_override_platform TEXT,
  admin_override_name TEXT,
  admin_override_category TEXT,
  is_ai_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider_service_id)
);

-- 3. pricing_rules: Admin-defined pricing engine
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('fixed_markup', 'percentage', 'tiered', 'category_based', 'provider_based')),
  config JSONB NOT NULL DEFAULT '{}',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  applies_to_categories TEXT[],
  applies_to_providers UUID[],
  min_provider_rate NUMERIC(10,4),
  max_provider_rate NUMERIC(10,4),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Add new columns to services table (keeping existing provider_service_id as TEXT for external IDs)
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS provider_service_ref UUID REFERENCES provider_services(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS provider_cost NUMERIC(10,4),
ADD COLUMN IF NOT EXISTS pricing_rule_id UUID REFERENCES pricing_rules(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_price_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_price_sync_at TIMESTAMPTZ;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_services_panel_provider ON provider_services(panel_id, provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_sync_status ON provider_services(sync_status);
CREATE INDEX IF NOT EXISTS idx_provider_services_external_id ON provider_services(external_service_id);
CREATE INDEX IF NOT EXISTS idx_normalized_services_platform ON normalized_services(detected_platform);
CREATE INDEX IF NOT EXISTS idx_normalized_services_confidence ON normalized_services(confidence_score);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_panel ON pricing_rules(panel_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_provider_service_ref ON services(provider_service_ref);

-- 6. Enable RLS
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.normalized_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for provider_services
CREATE POLICY "Panel owners can view their provider services"
  ON public.provider_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE p.id = provider_services.panel_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Panel owners can insert provider services"
  ON public.provider_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE p.id = panel_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Panel owners can update their provider services"
  ON public.provider_services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE p.id = provider_services.panel_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Panel owners can delete their provider services"
  ON public.provider_services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE p.id = provider_services.panel_id AND pr.user_id = auth.uid()
    )
  );

-- 8. RLS Policies for normalized_services
CREATE POLICY "Panel owners can view normalized services"
  ON public.normalized_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_services ps
      JOIN panels p ON ps.panel_id = p.id
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE ps.id = normalized_services.provider_service_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Panel owners can insert normalized services"
  ON public.normalized_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM provider_services ps
      JOIN panels p ON ps.panel_id = p.id
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE ps.id = provider_service_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Panel owners can update normalized services"
  ON public.normalized_services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM provider_services ps
      JOIN panels p ON ps.panel_id = p.id
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE ps.id = normalized_services.provider_service_id AND pr.user_id = auth.uid()
    )
  );

-- 9. RLS Policies for pricing_rules
CREATE POLICY "Panel owners can manage their pricing rules"
  ON public.pricing_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM panels p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE p.id = pricing_rules.panel_id AND pr.user_id = auth.uid()
    )
  );

-- 10. Updated_at triggers
CREATE TRIGGER update_provider_services_updated_at
  BEFORE UPDATE ON provider_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_normalized_services_updated_at
  BEFORE UPDATE ON normalized_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Function to calculate buyer price
CREATE OR REPLACE FUNCTION calculate_buyer_price(
  p_provider_rate NUMERIC,
  p_panel_id UUID,
  p_category TEXT DEFAULT NULL,
  p_provider_id UUID DEFAULT NULL
) RETURNS NUMERIC
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  v_price NUMERIC;
  v_rule RECORD;
  v_markup NUMERIC;
BEGIN
  v_price := p_provider_rate;
  
  -- Find applicable pricing rule (highest priority first)
  FOR v_rule IN (
    SELECT * FROM pricing_rules
    WHERE panel_id = p_panel_id
      AND is_active = true
      AND (applies_to_categories IS NULL OR p_category = ANY(applies_to_categories))
      AND (applies_to_providers IS NULL OR p_provider_id = ANY(applies_to_providers))
      AND (min_provider_rate IS NULL OR p_provider_rate >= min_provider_rate)
      AND (max_provider_rate IS NULL OR p_provider_rate <= max_provider_rate)
    ORDER BY priority DESC
    LIMIT 1
  ) LOOP
    CASE v_rule.rule_type
      WHEN 'percentage' THEN
        v_markup := COALESCE((v_rule.config->>'markup_percent')::NUMERIC, 20);
        v_price := p_provider_rate * (1 + v_markup / 100);
      WHEN 'fixed_markup' THEN
        v_markup := COALESCE((v_rule.config->>'fixed_amount')::NUMERIC, 0.1);
        v_price := p_provider_rate + v_markup;
      WHEN 'tiered' THEN
        v_price := p_provider_rate * (1 + COALESCE((v_rule.config->>'default_percent')::NUMERIC, 20) / 100);
      ELSE
        v_price := p_provider_rate * 1.2;
    END CASE;
  END LOOP;
  
  -- If no rule found, apply default 20% markup
  IF v_price = p_provider_rate THEN
    v_price := p_provider_rate * 1.2;
  END IF;
  
  RETURN ROUND(v_price, 4);
END;
$$;

-- 12. View for buyer-visible services with computed pricing
CREATE OR REPLACE VIEW buyer_visible_services AS
SELECT 
  s.id,
  s.panel_id,
  s.name,
  COALESCE(ns.normalized_name, s.name) as display_name,
  COALESCE(ns.admin_override_platform, ns.detected_platform, s.category::TEXT) as platform,
  COALESCE(ns.detected_service_type, s.service_type) as service_type,
  COALESCE(ns.detected_delivery_type, 'default') as delivery_type,
  s.provider_cost,
  CASE 
    WHEN s.is_price_locked THEN s.price
    ELSE calculate_buyer_price(COALESCE(s.provider_cost, ps.provider_rate, s.price), s.panel_id, s.category::TEXT, ps.provider_id)
  END as buyer_price,
  s.min_quantity,
  s.max_quantity,
  s.description,
  COALESCE(ns.platform_icon, s.image_url) as icon,
  s.is_active,
  s.display_order,
  ns.confidence_score,
  ps.refill_available,
  ps.cancel_available,
  ps.dripfeed_available,
  ps.average_time
FROM services s
LEFT JOIN provider_services ps ON s.provider_service_ref = ps.id
LEFT JOIN normalized_services ns ON ps.id = ns.provider_service_id
WHERE s.is_active = true;