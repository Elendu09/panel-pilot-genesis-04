import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DesignCustomization {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  mutedColor?: string;
  borderRadius?: string;
  logoUrl?: string;
  companyName?: string;
  tagline?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCta?: string;
  showHero?: boolean;
  showFeatures?: boolean;
  showStats?: boolean;
  showFaqs?: boolean;
  showTestimonials?: boolean;
  features?: Array<{ icon: string; title: string; description: string }>;
  stats?: Array<{ value: string; label: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  footerText?: string;
  footerAbout?: string;
  footerContact?: string;
}

interface TenantPanel {
  id: string;
  name: string;
  subdomain: string;
  custom_domain?: string;
  theme_type: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  status: string;
  custom_branding?: DesignCustomization;
  settings?: {
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    maintenance_mode?: boolean;
    maintenance_message?: string;
    contact_info?: any;
    social_links?: any;
  };
}

interface TenantDetectionResult {
  panel: TenantPanel | null;
  loading: boolean;
  error: string | null;
  isTenantDomain: boolean;
  isPlatformDomain: boolean;
}

export function useTenant(): TenantDetectionResult {
  const [panel, setPanel] = useState<TenantPanel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTenantDomain, setIsTenantDomain] = useState(false);
  const [isPlatformDomain, setIsPlatformDomain] = useState(true);

  useEffect(() => {
    const detectTenant = async () => {
      try {
        setLoading(true);
        setError(null);

        const hostname = window.location.hostname;
        
        // Platform domains (admin/management interface)
        // The main platform domain is smmpilot.online (without subdomain)
        const platformDomains = [
          'localhost',
          'lovable.app',
          'smmpilot.online', // Main platform domain
        ];

        // Check if this is a platform domain (exact match or lovable.app subdomain for preview)
        const isPlatform = platformDomains.some(domain => 
          hostname === domain || 
          hostname.endsWith('.lovable.app') || // Preview domains
          (domain === 'smmpilot.online' && hostname === 'smmpilot.online') ||
          (domain === 'smmpilot.online' && hostname === 'www.smmpilot.online')
        );

        // Check if it's a subdomain of smmpilot.online (tenant domain)
        const isSubdomainOfPlatform = hostname.endsWith('.smmpilot.online') && 
          hostname !== 'smmpilot.online' && 
          hostname !== 'www.smmpilot.online';

        if (isPlatform && !isSubdomainOfPlatform) {
          setIsPlatformDomain(true);
          setIsTenantDomain(false);
          setPanel(null);
          setLoading(false);
          return;
        }

        // This is a tenant domain - try to find the panel
        setIsPlatformDomain(false);
        setIsTenantDomain(true);

        let subdomain: string | null = null;
        
        // Extract subdomain from hostname
        if (isSubdomainOfPlatform) {
          // For *.smmpilot.online, extract the subdomain
          subdomain = hostname.replace('.smmpilot.online', '');
        } else {
          // For custom domains, we'll try to match by custom_domain first
          subdomain = null;
        }

        // First, try to find by custom domain
        let { data: panelData, error: panelError } = await supabase
          .from('panels')
          .select(`
            id,
            name,
            subdomain,
            custom_domain,
            theme_type,
            primary_color,
            secondary_color,
            logo_url,
            status,
            custom_branding,
            panel_settings (
              seo_title,
              seo_description,
              seo_keywords,
              maintenance_mode,
              maintenance_message,
              contact_info,
              social_links
            )
          `)
          .or(`custom_domain.eq.${hostname}`)
          .in('status', ['active', 'pending']) // Allow pending panels to load immediately
          .maybeSingle();

        // If not found by custom domain, try by subdomain
        if (!panelData && subdomain) {
          const { data: subdomainPanel, error: subdomainError } = await supabase
            .from('panels')
            .select(`
              id,
              name,
              subdomain,
              custom_domain,
              theme_type,
              primary_color,
              secondary_color,
              logo_url,
              status,
              custom_branding,
              panel_settings (
                seo_title,
                seo_description,
                seo_keywords,
                maintenance_mode,
                maintenance_message,
                contact_info,
                social_links
              )
            `)
            .eq('subdomain', subdomain)
            .in('status', ['active', 'pending']) // Allow pending panels to load immediately
            .maybeSingle();

          panelData = subdomainPanel;
          panelError = subdomainError;
        }

        // Also try just the subdomain from hostname if not found
        if (!panelData) {
          const extractedSubdomain = hostname.split('.')[0];
          
          const { data: fallbackPanel, error: fallbackError } = await supabase
            .from('panels')
            .select(`
              id,
              name,
              subdomain,
              custom_domain,
              theme_type,
              primary_color,
              secondary_color,
              logo_url,
              status,
              custom_branding,
              panel_settings (
                seo_title,
                seo_description,
                seo_keywords,
                maintenance_mode,
                maintenance_message,
                contact_info,
                social_links
              )
            `)
            .eq('subdomain', extractedSubdomain)
            .in('status', ['active', 'pending'])
            .maybeSingle();

          panelData = fallbackPanel;
          panelError = fallbackError;
        }

        if (panelError && panelError.code !== 'PGRST116') {
          throw panelError;
        }

        if (panelData) {
          const settings = panelData.panel_settings;
          const branding = panelData.custom_branding;
          setPanel({
            ...panelData,
            custom_branding: branding && typeof branding === 'object' ? branding as DesignCustomization : undefined,
            settings: Array.isArray(settings) ? settings[0] : settings || {}
          });
        } else {
          setError('Panel not found or inactive');
        }

      } catch (err) {
        console.error('Tenant detection error:', err);
        setError(err instanceof Error ? err.message : 'Failed to detect tenant');
      } finally {
        setLoading(false);
      }
    };

    detectTenant();
  }, []);

  return {
    panel,
    loading,
    error,
    isTenantDomain,
    isPlatformDomain
  };
}

export function useTenantServices(panelId?: string) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!panelId) return;

    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('panel_id', panelId)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [panelId]);

  return { services, loading };
}