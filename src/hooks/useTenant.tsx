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
  socialPlatforms?: any[];
  accessibilitySettings?: {
    highContrast?: boolean;
    largeText?: boolean;
    reduceMotion?: boolean;
    fontSize?: number;
    enhancedFocus?: boolean;
    screenReaderOptimized?: boolean;
  };
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
    hosting_provider?: string;
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
    isExternalHosting: boolean;
    isDevPreview: boolean;
    searchAttempts: string[];
  };
}

// Known external hosting patterns - panels can be hosted on these platforms
const EXTERNAL_HOSTING_PATTERNS = [
  /\.netlify\.app$/,
  /\.vercel\.app$/,
  /\.pages\.dev$/,  // Cloudflare Pages
  /\.onrender\.com$/,
  /\.railway\.app$/,
  /\.fly\.dev$/,
  /\.herokuapp\.com$/,
];

// Development/preview domains - these should show the platform app
const DEV_PREVIEW_PATTERNS = [
  /lovableproject\.com$/,      // All Lovable preview domains (including subdomains)
  /\.lovable\.app$/,           // Lovable staging domains
  /lovable\.app$/,             // Lovable staging root
  /^localhost$/,
  /^127\.0\.0\.1$/,
  /\.local$/,
];

function isExternalHostingDomain(hostname: string): boolean {
  return EXTERNAL_HOSTING_PATTERNS.some(pattern => pattern.test(hostname));
}

function isDevPreviewDomain(hostname: string): boolean {
  // Direct check for lovableproject.com domains (covers all variations)
  if (hostname.includes('lovableproject.com') || hostname.includes('lovable.app')) {
    return true;
  }
  return DEV_PREVIEW_PATTERNS.some(pattern => pattern.test(hostname));
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

        const hostname = window.location.hostname.toLowerCase();
        const isExternalHosting = isExternalHostingDomain(hostname);
        const isDevPreview = isDevPreviewDomain(hostname);
        
        console.log('[useTenant] ===== TENANT DETECTION START =====');
        console.log('[useTenant] Hostname:', hostname);
        console.log('[useTenant] Is external hosting:', isExternalHosting);
        console.log('[useTenant] Is dev preview:', isDevPreview);
        
        // Development/preview domains should always show platform app
        if (isDevPreview) {
          console.log('[useTenant] Detected as dev preview domain - showing platform app');
          setIsPlatformDomain(true);
          setIsTenantDomain(false);
          setPanel(null);
          setDebugInfo({
            hostname,
            detectedSubdomain: null,
            isSubdomainOfPlatform: false,
            isPlatformMatch: true,
            isExternalHosting: false,
            isDevPreview: true,
            searchAttempts
          });
          setLoading(false);
          return;
        }

        // Platform root domains (main website)
        const isPlatformRoot = 
          hostname === 'smmpilot.online' || 
          hostname === 'www.smmpilot.online';

        // Check if it's a subdomain of smmpilot.online (tenant subdomain)
        const isSubdomainOfPlatform = 
          hostname.endsWith('.smmpilot.online') && 
          hostname !== 'smmpilot.online' && 
          hostname !== 'www.smmpilot.online';

        console.log('[useTenant] Domain analysis:', {
          isPlatformRoot,
          isSubdomainOfPlatform,
          isExternalHosting,
          hostname
        });

        // If it's the platform root domain, show the main app
        if (isPlatformRoot) {
          console.log('[useTenant] Detected as platform root domain');
          setIsPlatformDomain(true);
          setIsTenantDomain(false);
          setPanel(null);
          setDebugInfo({
            hostname,
            detectedSubdomain: null,
            isSubdomainOfPlatform,
            isPlatformMatch: true,
            isExternalHosting,
            isDevPreview: false,
            searchAttempts
          });
          setLoading(false);
          return;
        }

        // This is a tenant domain - try to find the panel
        console.log('[useTenant] ===== TENANT DOMAIN DETECTED =====');
        setIsPlatformDomain(false);
        setIsTenantDomain(true);

        let subdomain: string | null = null;
        let panelData: any = null;
        let panelError: any = null;
        
        // Extract subdomain from smmpilot.online subdomains
        if (isSubdomainOfPlatform) {
          subdomain = hostname.replace('.smmpilot.online', '');
          console.log('[useTenant] Extracted subdomain:', subdomain);
        }

        // For external hosting domains, extract the subdomain part
        if (isExternalHosting) {
          const parts = hostname.split('.');
          if (parts.length >= 3) {
            subdomain = parts[0];
            console.log('[useTenant] Extracted from external host:', subdomain);
          }
        }

        // PRIORITY 0: Try full hostname as custom_domain first (for any custom domain)
        if (!isSubdomainOfPlatform) {
          searchAttempts.push(`custom_domain=${hostname} (priority 0)`);
          console.log('[useTenant] P0: Searching custom_domain for:', hostname);
          
          const { data: customPanel, error: customError } = await supabase
            .from('panels')
            .select(`
              id, name, subdomain, custom_domain, theme_type, primary_color,
              secondary_color, logo_url, status, custom_branding, settings,
              panel_settings (seo_title, seo_description, seo_keywords, maintenance_mode, maintenance_message, contact_info, social_links)
            `)
            .eq('custom_domain', hostname)
            .in('status', ['active', 'pending'])
            .maybeSingle();

          console.log('[useTenant] P0 result:', { found: !!customPanel, error: customError?.message });
          
          if (customPanel) {
            panelData = customPanel;
            panelError = customError;
          }
        }

        // PRIORITY 1: For smmpilot.online subdomains, search by subdomain
        if (!panelData && isSubdomainOfPlatform && subdomain) {
          searchAttempts.push(`subdomain=${subdomain} (priority 1)`);
          console.log('[useTenant] P1: Searching subdomain:', subdomain);
          
          const { data: subdomainPanel, error: subdomainError } = await supabase
            .from('panels')
            .select(`
              id, name, subdomain, custom_domain, theme_type, primary_color,
              secondary_color, logo_url, status, custom_branding, settings,
              panel_settings (seo_title, seo_description, seo_keywords, maintenance_mode, maintenance_message, contact_info, social_links)
            `)
            .eq('subdomain', subdomain)
            .in('status', ['active', 'pending'])
            .maybeSingle();

          console.log('[useTenant] P1 result:', { found: !!subdomainPanel, error: subdomainError?.message });
          
          if (subdomainPanel) {
            panelData = subdomainPanel;
            panelError = subdomainError;
          }
        }

        // PRIORITY 2: Try custom domain in panels table (for custom domains)
        if (!panelData) {
          searchAttempts.push(`panels.custom_domain=${hostname}`);
          const { data: customDomainPanel, error: customDomainError } = await supabase
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
              settings,
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

          console.log('[useTenant] Custom domain (panels) search result:', { customDomainPanel, customDomainError });
          
          if (customDomainPanel) {
            panelData = customDomainPanel;
            panelError = customDomainError;
          }
        }

        // PRIORITY 3: Check panel_domains table
        if (!panelData) {
          searchAttempts.push(`panel_domains.domain=${hostname}`);
          console.log('[useTenant] Searching in panel_domains table for:', hostname);
          
          const { data: domainData, error: domainError } = await supabase
            .from('panel_domains')
            .select(`
              panel_id,
              domain,
              verification_status,
              ssl_status
            `)
            .eq('domain', hostname)
            .eq('verification_status', 'verified')
            .maybeSingle();

          console.log('[useTenant] Panel domains search result:', { domainData, domainError });

          if (domainData?.panel_id) {
            // Found in panel_domains, now fetch the panel
            const { data: linkedPanel, error: linkedError } = await supabase
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
                settings,
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
              .eq('id', domainData.panel_id)
              .in('status', ['active', 'pending'])
              .maybeSingle();

            console.log('[useTenant] Linked panel result:', { linkedPanel, linkedError });
            
            if (linkedPanel) {
              panelData = linkedPanel;
            }
          }
        }

        // PRIORITY 4: Fallback subdomain search for non-smmpilot domains
        if (!panelData && subdomain && !isSubdomainOfPlatform) {
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
              settings,
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

        // Also try just the first part of hostname as subdomain (for custom domains)
        if (!panelData && !isSubdomainOfPlatform) {
          const extractedSubdomain = hostname.split('.')[0];
          
          // Avoid searching for common prefixes
          if (!['www', 'api', 'admin', 'mail', 'smtp', 'ftp'].includes(extractedSubdomain)) {
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
                settings,
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
        }

        setDebugInfo({
          hostname,
          detectedSubdomain: subdomain,
          isSubdomainOfPlatform,
          isPlatformMatch: isPlatformRoot,
          isExternalHosting,
          isDevPreview: false,
          searchAttempts
        });

        if (panelError && panelError.code !== 'PGRST116') {
          console.error('[useTenant] Database error:', panelError);
          throw panelError;
        }

        if (panelData) {
          console.log('[useTenant] Panel found:', panelData.name, panelData.status);
          const panelSettings = panelData.panel_settings;
          const branding = panelData.custom_branding;
          const settings = panelData.settings;
          
          // Merge panel_settings with settings from panels table
          const mergedSettings = {
            ...(Array.isArray(panelSettings) ? panelSettings[0] : panelSettings || {}),
            ...(typeof settings === 'object' ? settings : {})
          };

          setPanel({
            ...panelData,
            custom_branding: branding && typeof branding === 'object' ? branding as DesignCustomization : undefined,
            settings: mergedSettings
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
          .order('display_order', { ascending: true })
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
