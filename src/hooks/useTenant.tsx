import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { analyzeDomain, PLATFORM_DOMAIN, type TenantDomainConfig } from '@/lib/tenant-domain-config';

export interface DesignCustomization {
  // Primary Colors
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  
  // Background Colors
  backgroundColor?: string;
  surfaceColor?: string;
  cardColor?: string;
  
  // Text & UI Colors
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  
  // Status Colors
  successColor?: string;
  warningColor?: string;
  infoColor?: string;
  errorColor?: string;
  
  // Legacy/UI
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
  buyer_theme?: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  status: string;
  custom_branding?: DesignCustomization;
  default_currency?: string;
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
  domainConfig: TenantDomainConfig | null;
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

// Cache for tenant data to avoid refetching on navigation
const tenantCache = new Map<string, { panel: TenantPanel | null; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

// localStorage cache helpers for instant first-paint
const LS_TENANT_KEY_PREFIX = 'tenant_cache_';

function writeTenantToStorage(hostname: string, panel: TenantPanel | null) {
  try {
    if (panel) {
      localStorage.setItem(LS_TENANT_KEY_PREFIX + hostname, JSON.stringify(panel));
    }
  } catch { /* quota exceeded or private mode */ }
}

function readTenantFromStorage(hostname: string): TenantPanel | null {
  try {
    const raw = localStorage.getItem(LS_TENANT_KEY_PREFIX + hostname);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Retry function with exponential backoff
async function fetchWithRetry<T>(
  fn: () => Promise<T>, 
  maxRetries = 3,
  signal?: AbortSignal
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    if (signal?.aborted) throw new Error('Request aborted');
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 500));
      }
    }
  }
  throw lastError;
}

export function useTenant(): TenantDetectionResult {
  // Synchronous domain detection for immediate routing
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const initialConfig = useMemo(() => analyzeDomain(hostname), [hostname]);
  
  // Determine domain type synchronously
  const initialIsPlatform = initialConfig.type === 'platform' || initialConfig.type === 'development';
  const initialIsTenant = initialConfig.type === 'subdomain' || initialConfig.type === 'custom' || initialConfig.type === 'external';
  
  // Initialize from localStorage for instant first paint on tenant domains
  const [panel, setPanel] = useState<TenantPanel | null>(() => {
    if (initialIsTenant) return readTenantFromStorage(hostname);
    return null;
  });
  const [loading, setLoading] = useState(!initialIsPlatform); // Only load if tenant domain
  const [error, setError] = useState<string | null>(null);
  const [isTenantDomain, setIsTenantDomain] = useState(initialIsTenant);
  const [isPlatformDomain, setIsPlatformDomain] = useState(initialIsPlatform);
  const [domainConfig, setDomainConfig] = useState<TenantDomainConfig | null>(initialConfig);
  const [debugInfo, setDebugInfo] = useState<TenantDetectionResult['debugInfo']>();
  const [refreshKey, setRefreshKey] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Listen for design updates to invalidate cache and refresh
  useEffect(() => {
    const onDesignUpdated = () => {
      try {
        tenantCache.delete(hostname);
      } catch {
        // ignore
      }
      setRefreshKey((k) => k + 1);
    };

    window.addEventListener('panelDesignUpdated', onDesignUpdated);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'panelDesignUpdatedAt') onDesignUpdated();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('panelDesignUpdated', onDesignUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [hostname]);

  useEffect(() => {
    let isMounted = true;
    
    // Cancel previous request if running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    const detectTenant = async () => {
      const searchAttempts: string[] = [];
      
      // If platform domain, skip async detection
      if (initialIsPlatform) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }
      
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        const hostname = window.location.hostname.toLowerCase();
        
        // Use centralized domain analysis
        const config = analyzeDomain(hostname);
        if (isMounted) setDomainConfig(config);
        
        const isExternalHosting = config.type === 'external';
        const isDevPreview = config.type === 'development';
        
        console.log('[useTenant] ===== TENANT DETECTION START =====');
        console.log('[useTenant] Hostname:', hostname);
        console.log('[useTenant] Domain config:', JSON.stringify(config, null, 2));
        
        // Check cache first
        const cached = tenantCache.get(hostname);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          console.log('[useTenant] Using cached tenant data:', cached.panel?.name);
          if (isMounted) {
            setPanel(cached.panel);
            setIsPlatformDomain(config.type === 'platform' || config.type === 'development');
            setIsTenantDomain(config.type === 'subdomain' || config.type === 'custom' || config.type === 'external');
            setLoading(false);
          }
          return;
        }
        
        // Development/preview domains should always show platform app
        if (isDevPreview) {
          console.log('[useTenant] Detected as dev preview domain - showing platform app');
          if (isMounted) {
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
          }
          return;
        }

        // Platform root domains (main website) - use PLATFORM_DOMAIN constant
        const isPlatformRoot = 
          hostname === PLATFORM_DOMAIN || 
          hostname === `www.${PLATFORM_DOMAIN}`;

        // Check if it's a subdomain of the platform (tenant subdomain)
        const isSubdomainOfPlatform = 
          hostname.endsWith(`.${PLATFORM_DOMAIN}`) && 
          hostname !== PLATFORM_DOMAIN && 
          hostname !== `www.${PLATFORM_DOMAIN}`;

        console.log('[useTenant] Domain analysis:', {
          isPlatformRoot,
          isSubdomainOfPlatform,
          isExternalHosting,
          hostname,
          PLATFORM_DOMAIN
        });

        // If it's the platform root domain, show the main app
        if (isPlatformRoot) {
          console.log('[useTenant] Detected as platform root domain');
          if (isMounted) {
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
          }
          return;
        }

        // This is a tenant domain - try to find the panel
        console.log('[useTenant] ===== TENANT DOMAIN DETECTED =====');
        if (isMounted) {
          setIsPlatformDomain(false);
          setIsTenantDomain(true);
        }

        let subdomain: string | null = null;
        let panelData: any = null;
        let panelError: any = null;
        
        // Extract subdomain from platform subdomains
        if (isSubdomainOfPlatform) {
          subdomain = hostname.replace(`.${PLATFORM_DOMAIN}`, '');
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
        
        // Panel query selection - uses panels_public view (excludes sensitive financial data)
        const panelFields = `
          id, name, subdomain, custom_domain, theme_type, primary_color,
          secondary_color, logo_url, status, custom_branding, settings
        `;

        // PRIORITY 0: Try full hostname as custom_domain first (for any custom domain)
        if (!isSubdomainOfPlatform) {
          searchAttempts.push(`custom_domain=${hostname} (priority 0)`);
          console.log('[useTenant] P0: Searching custom_domain for:', hostname);
          
          const { data: customPanel, error: customError } = await (supabase as any)
            .from('panels_public')
            .select(panelFields)
            .eq('custom_domain', hostname)
            .maybeSingle();

          console.log('[useTenant] P0 result:', { found: !!customPanel, error: customError?.message });
          
          if (customPanel) {
            panelData = customPanel;
            panelError = customError;
          }
        }

        // PRIORITY 1: For platform subdomains, search by subdomain
        if (!panelData && isSubdomainOfPlatform && subdomain) {
          searchAttempts.push(`subdomain=${subdomain} (priority 1)`);
          console.log('[useTenant] P1: Searching subdomain:', subdomain);
          
          const result = await fetchWithRetry(
            async () => (supabase as any)
              .from('panels_public')
              .select(panelFields)
              .eq('subdomain', subdomain)
              .maybeSingle(),
            3,
            signal
          );
          
          const { data: subdomainPanel, error: subdomainError } = result;

          console.log('[useTenant] P1 result:', { found: !!subdomainPanel, error: subdomainError?.message });
          
          if (subdomainPanel) {
            panelData = subdomainPanel;
            panelError = subdomainError;
          }
        }

        // PRIORITY 2: Try custom domain in panels table (for custom domains)
        if (!panelData) {
          searchAttempts.push(`panels.custom_domain=${hostname}`);
          const { data: customDomainPanel, error: customDomainError } = await (supabase as any)
            .from('panels_public')
            .select(panelFields)
            .or(`custom_domain.eq.${hostname}`)
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
            const { data: linkedPanel, error: linkedError } = await (supabase as any)
              .from('panels_public')
              .select(panelFields)
              .eq('id', domainData.panel_id)
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
            const { data: subdomainPanel, error: subdomainError } = await (supabase as any)
            .from('panels_public')
            .select(panelFields)
            .eq('subdomain', subdomain)
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
            
            const { data: fallbackPanel, error: fallbackError } = await (supabase as any)
              .from('panels_public')
              .select(panelFields)
              .eq('subdomain', extractedSubdomain)
              .maybeSingle();

            console.log('[useTenant] Fallback search result:', { fallbackPanel, fallbackError });
            panelData = fallbackPanel;
            panelError = fallbackError;
          }
        }

        if (isMounted) {
          setDebugInfo({
            hostname,
            detectedSubdomain: subdomain,
            isSubdomainOfPlatform,
            isPlatformMatch: isPlatformRoot,
            isExternalHosting,
            isDevPreview: false,
            searchAttempts
          });
        }

        if (panelError && panelError.code !== 'PGRST116') {
          console.error('[useTenant] Database error:', panelError);
          throw panelError;
        }

        if (panelData) {
          // Block storefront for unlaunched panels (pending status)
          if (panelData.status === 'pending') {
            console.log('[useTenant] Panel found but status is pending — blocking storefront');
            tenantCache.set(hostname, { panel: null, timestamp: Date.now() });
            if (isMounted) {
              setPanel(null);
              setError('panel_pending');
            }
          } else {
          console.log('[useTenant] Panel found:', panelData.name, panelData.status);
          const branding = panelData.custom_branding;
          const settings = panelData.settings;
          
          // Fetch panel_settings separately from secure view (excludes OAuth secrets)
          let panelSettings: any = {};
          try {
            const { data: psData } = await (supabase as any)
              .from('panel_settings_public')
              .select('seo_title, seo_description, seo_keywords, maintenance_mode, maintenance_message, contact_info, social_links, blog_enabled, integrations')
              .eq('panel_id', panelData.id)
              .maybeSingle();
            panelSettings = psData || {};
          } catch (e) {
            console.warn('[useTenant] Failed to fetch panel settings:', e);
          }
          
          // Merge panel_settings with settings from panels table
          const mergedSettings = {
            ...panelSettings,
            ...(typeof settings === 'object' ? settings : {})
          };

          // Sync companyName with panel name on initial load
          const syncedBranding = branding && typeof branding === 'object'
            ? { ...(branding as any), companyName: panelData.name } as DesignCustomization
            : undefined;

          const resolvedPanel = {
            ...panelData,
            custom_branding: syncedBranding,
            settings: mergedSettings
          };

          // Cache the result
          tenantCache.set(hostname, { panel: resolvedPanel, timestamp: Date.now() });
          
          if (isMounted) {
            setPanel(resolvedPanel);
          }
          }
        } else {
          console.warn('[useTenant] No panel found for:', { hostname, subdomain, searchAttempts });
          tenantCache.set(hostname, { panel: null, timestamp: Date.now() });
          if (isMounted) {
            setError(`Panel not found. Searched: ${searchAttempts.join(', ')}`);
          }
        }

      } catch (err) {
        console.error('[useTenant] Detection error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to detect tenant');
        }
      } finally {
        if (isMounted) {
          console.log('[useTenant] ===== DETECTION COMPLETE =====');
          setLoading(false);
        }
      }
    };

    detectTenant();
    
    return () => {
      isMounted = false;
      // Cleanup abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [initialIsPlatform, refreshKey]);

  // Realtime subscription: listen for panel updates so name/branding changes reflect instantly
  useEffect(() => {
    if (!panel?.id) return;

    const channel = supabase
      .channel(`tenant-panel-${panel.id}`)
      .on(
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'panels',
          filter: `id=eq.${panel.id}`,
        },
        (payload: any) => {
          console.log('[useTenant] Realtime panel update received:', payload.new?.name);
          const updated = payload.new;
          if (!updated) return;

          // Clear cache so next navigation also gets fresh data
          tenantCache.delete(hostname);

          setPanel((prev) => {
            if (!prev) return prev;
            const newName = updated.name ?? prev.name;
            const baseBranding = updated.custom_branding && typeof updated.custom_branding === 'object'
              ? updated.custom_branding as DesignCustomization
              : prev.custom_branding;
            // Always sync companyName with panel name for storefront consistency
            const syncedBranding = baseBranding
              ? { ...baseBranding, companyName: newName } as DesignCustomization
              : prev.custom_branding;
            return {
              ...prev,
              name: newName,
              logo_url: updated.logo_url ?? prev.logo_url,
              custom_branding: syncedBranding,
              primary_color: updated.primary_color ?? prev.primary_color,
              secondary_color: updated.secondary_color ?? prev.secondary_color,
              theme_type: updated.theme_type ?? prev.theme_type,
              status: updated.status ?? prev.status,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panel?.id, hostname]);

  return {
    panel,
    loading,
    error,
    isTenantDomain,
    isPlatformDomain,
    domainConfig,
    debugInfo
  };
}

export function useTenantServices(panelId?: string) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!panelId) return;

    const fetchAllServices = async () => {
      setLoading(true);
      try {
        // Paginate through Supabase's 1000-row limit to fetch ALL services (up to 10,000)
        const PAGE_SIZE = 1000;
        const MAX_SERVICES = 10000;
        let allData: any[] = [];
        let from = 0;
        let hasMore = true;

        console.log(`[useTenantServices] Starting paginated fetch for panel: ${panelId}`);

        while (hasMore && allData.length < MAX_SERVICES) {
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('panel_id', panelId)
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('name')
            .range(from, from + PAGE_SIZE - 1);

          if (error) throw error;

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            console.log(`[useTenantServices] Page ${Math.floor(from / PAGE_SIZE) + 1}: ${data.length} services (total: ${allData.length})`);
            from += PAGE_SIZE;
            hasMore = data.length === PAGE_SIZE;
          } else {
            hasMore = false;
          }
        }

        console.log(`[useTenantServices] Complete: ${allData.length} total services`);
        setServices(allData.slice(0, MAX_SERVICES));
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllServices();
  }, [panelId]);

  return { services, loading };
}
