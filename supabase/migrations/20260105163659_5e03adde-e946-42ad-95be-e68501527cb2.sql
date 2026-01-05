-- Fix security issues from linter

-- 1. Drop the security definer view and recreate as regular view
DROP VIEW IF EXISTS buyer_visible_services;

-- Recreate as a regular SQL view (not security definer)
CREATE VIEW buyer_visible_services AS
SELECT 
  s.id,
  s.panel_id,
  s.name,
  COALESCE(ns.normalized_name, s.name) as display_name,
  COALESCE(ns.admin_override_platform, ns.detected_platform, s.category::TEXT) as platform,
  COALESCE(ns.detected_service_type, s.service_type) as service_type,
  COALESCE(ns.detected_delivery_type, 'default') as delivery_type,
  s.provider_cost,
  s.price as buyer_price,
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

-- 2. Fix calculate_buyer_price function with proper search_path
DROP FUNCTION IF EXISTS calculate_buyer_price(NUMERIC, UUID, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.calculate_buyer_price(
  p_provider_rate NUMERIC,
  p_panel_id UUID,
  p_category TEXT DEFAULT NULL,
  p_provider_id UUID DEFAULT NULL
) RETURNS NUMERIC
LANGUAGE plpgsql 
STABLE 
SECURITY INVOKER
SET search_path = public
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