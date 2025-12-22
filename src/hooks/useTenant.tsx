import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
            panel_settings!inner (
              seo_title,
              seo_description,
              seo_keywords,
              maintenance_mode,
              maintenance_message,
              contact_info,
              social_links
            )
          `)
          .or(`custom_domain.eq.${hostname},panel_domains.domain.eq.${hostname}`)
          .eq('status', 'active')
          .single();

        // If not found by custom domain, try by subdomain
        if (!panelData) {
          // Extract subdomain (everything before first dot)
          const subdomain = hostname.split('.')[0];
          
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
              panel_settings!inner (
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
            .eq('status', 'active')
            .single();

          panelData = subdomainPanel;
          panelError = subdomainError;
        }

        if (panelError && panelError.code !== 'PGRST116') {
          throw panelError;
        }

        if (panelData) {
          setPanel({
            ...panelData,
            settings: panelData.panel_settings?.[0] || {}
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