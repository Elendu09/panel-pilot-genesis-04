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
  debugInfo?: {
    hostname: string;
    detectedSubdomain: string | null;
    isSubdomainOfPlatform: boolean;
    isPlatformMatch: boolean;
    searchAttempts: string[];
  };
}

export function useTenant(): TenantDetectionResult {
  const [panel, setPanel] = useState<TenantPanel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTenantDomain, setIsTenantDomain] = useState(false);
  const [isPlatformDomain, setIsPlatformDomain] = useState(true);
  const [debugInfo, setDebugInfo] = useState<TenantDetectionResult['debugInfo']>();

  useEffect(() => {
    const detectTenant = async () => {
      const searchAttempts: string[] = [];
      
      try {
        setLoading(true);
        setError(null);

        const hostname = window.location.hostname;
        
        console.log('[useTenant] Starting detection for hostname:', hostname);
        
        // Platform domains (admin/management interface)
        const platformDomains = [
          'localhost',
          'lovable.app',
          'smmpilot.online',
        ];

        // Check if this is a platform domain
        const isPlatformMatch = platformDomains.some(domain => 
          hostname === domain || 
          hostname.endsWith('.lovable.app') ||
          hostname === 'smmpilot.online' ||
          hostname === 'www.smmpilot.online'
        );

        // Check if it's a subdomain of smmpilot.online
        const isSubdomainOfPlatform = hostname.endsWith('.smmpilot.online') && 
          hostname !== 'smmpilot.online' && 
          hostname !== 'www.smmpilot.online';

        console.log('[useTenant] Detection results:', {
          isPlatformMatch,
          isSubdomainOfPlatform,
          hostname
        });

        // If it's a platform domain and NOT a subdomain, show the main app
        if (isPlatformMatch && !isSubdomainOfPlatform) {
          console.log('[useTenant] Detected as platform domain');
          setIsPlatformDomain(true);
          setIsTenantDomain(false);
          setPanel(null);
          setDebugInfo({
            hostname,
            detectedSubdomain: null,
            isSubdomainOfPlatform,
            isPlatformMatch,
            searchAttempts
          });
          setLoading(false);
          return;
        }

        // This is a tenant domain - try to find the panel
        console.log('[useTenant] Detected as tenant domain, searching for panel...');
        setIsPlatformDomain(false);
        setIsTenantDomain(true);

        let subdomain: string | null = null;
        
        // Extract subdomain from hostname
        if (isSubdomainOfPlatform) {
          subdomain = hostname.replace('.smmpilot.online', '');
          console.log('[useTenant] Extracted subdomain:', subdomain);
        }

        // First, try to find by custom domain
        searchAttempts.push(`custom_domain=${hostname}`);
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
          .in('status', ['active', 'pending'])
          .maybeSingle();

        console.log('[useTenant] Custom domain search result:', { panelData, panelError });

        // If not found by custom domain, try by subdomain
        if (!panelData && subdomain) {
          searchAttempts.push(`subdomain=${subdomain}`);
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
            .in('status', ['active', 'pending'])
            .maybeSingle();

          console.log('[useTenant] Subdomain search result:', { subdomainPanel, subdomainError });
          panelData = subdomainPanel;
          panelError = subdomainError;
        }

        // Also try just the first part of hostname as subdomain
        if (!panelData) {
          const extractedSubdomain = hostname.split('.')[0];
          searchAttempts.push(`extracted_subdomain=${extractedSubdomain}`);
          
          console.log('[useTenant] Trying extracted subdomain:', extractedSubdomain);
          
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

          console.log('[useTenant] Fallback search result:', { fallbackPanel, fallbackError });
          panelData = fallbackPanel;
          panelError = fallbackError;
        }

        setDebugInfo({
          hostname,
          detectedSubdomain: subdomain,
          isSubdomainOfPlatform,
          isPlatformMatch,
          searchAttempts
        });

        if (panelError && panelError.code !== 'PGRST116') {
          console.error('[useTenant] Database error:', panelError);
          throw panelError;
        }

        if (panelData) {
          console.log('[useTenant] Panel found:', panelData.name, panelData.status);
          const settings = panelData.panel_settings;
          const branding = panelData.custom_branding;
          setPanel({
            ...panelData,
            custom_branding: branding && typeof branding === 'object' ? branding as DesignCustomization : undefined,
            settings: Array.isArray(settings) ? settings[0] : settings || {}
          });
        } else {
          console.warn('[useTenant] No panel found for:', { hostname, subdomain, searchAttempts });
          setError(`Panel not found. Searched: ${searchAttempts.join(', ')}`);
        }

      } catch (err) {
        console.error('[useTenant] Detection error:', err);
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
    isPlatformDomain,
    debugInfo
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
