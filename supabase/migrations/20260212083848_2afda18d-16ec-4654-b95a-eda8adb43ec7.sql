
-- ============================================
-- Security Fix: Restrict sensitive data exposure
-- ============================================

-- 1. PLATFORM PROVIDERS: Remove policy that exposes API keys to all panel owners
-- Only super_admins should see platform provider details including API keys
DROP POLICY IF EXISTS "Panel owners can view active platform providers" ON public.platform_providers;

-- Create a safe view for panel owners (no API keys, no api_endpoint)
CREATE OR REPLACE VIEW public.platform_providers_public
WITH (security_barrier=true) AS
SELECT id, name, is_active, commission_percentage, description, logo_url, 
       balance, last_sync_at, sync_status, created_at, updated_at
FROM public.platform_providers
WHERE is_active = true;

GRANT SELECT ON public.platform_providers_public TO authenticated;
GRANT SELECT ON public.platform_providers_public TO anon;

-- 2. PANELS: Create public view excluding sensitive financial/internal data
-- Excludes: balance, monthly_revenue, total_orders, commission_rate,
--   owner_id, stripe_customer_id, stripe_subscription_id, subscription_status,
--   subscription_tier, trial_ends_at, domain_verification_token, onboarding_*,
--   is_approved, max_services, hosting_provider, dns_records, ssl_status
CREATE OR REPLACE VIEW public.panels_public
WITH (security_barrier=true) AS
SELECT id, name, description, subdomain, custom_domain, logo_url,
       primary_color, secondary_color, theme_type, custom_branding,
       status, settings, blog_enabled, buyer_theme, default_currency,
       features, domain, created_at, updated_at
FROM public.panels
WHERE status IN ('active', 'pending');

-- Drop the overly permissive public SELECT policy on base table
DROP POLICY IF EXISTS "Anyone can view active panels" ON public.panels;

GRANT SELECT ON public.panels_public TO authenticated;
GRANT SELECT ON public.panels_public TO anon;

-- 3. PANEL SETTINGS: Create public view excluding OAuth secrets
-- Includes client_ids (needed for OAuth login buttons) but excludes client_secrets
CREATE OR REPLACE VIEW public.panel_settings_public
WITH (security_barrier=true) AS
SELECT ps.id, ps.panel_id, ps.blog_enabled, ps.contact_info, ps.custom_css,
       ps.floating_chat_custom_label, ps.floating_chat_custom_url, ps.floating_chat_discord,
       ps.floating_chat_enabled, ps.floating_chat_message, ps.floating_chat_messenger,
       ps.floating_chat_position, ps.floating_chat_telegram, ps.floating_chat_whatsapp,
       ps.integrations, ps.live_chat_enabled, ps.low_balance_alert_enabled, ps.low_balance_threshold,
       ps.maintenance_message, ps.maintenance_mode,
       ps.oauth_discord_enabled, ps.oauth_discord_client_id,
       ps.oauth_google_enabled, ps.oauth_google_client_id,
       ps.oauth_telegram_enabled, ps.oauth_telegram_client_id,
       ps.oauth_vk_enabled, ps.oauth_vk_client_id,
       ps.privacy_policy, ps.seo_description, ps.seo_keywords, ps.seo_title,
       ps.social_links, ps.terms_of_service, ps.created_at, ps.updated_at
FROM public.panel_settings ps
WHERE ps.panel_id IN (SELECT p.id FROM public.panels p WHERE p.status IN ('active', 'pending'));

-- Drop the overly permissive public SELECT policy on base table
DROP POLICY IF EXISTS "Public can view settings for active panels" ON public.panel_settings;

GRANT SELECT ON public.panel_settings_public TO authenticated;
GRANT SELECT ON public.panel_settings_public TO anon;
