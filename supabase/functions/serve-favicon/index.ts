import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform domains that use main favicon
const PLATFORM_DOMAINS = ['homeofsmm.com', 'www.homeofsmm.com', 'smmpilot.online', 'www.smmpilot.online'];

// Default favicons served from Supabase storage or fallback to platform files
const DEFAULT_TENANT_FAVICON = 'default-tenant-favicon.ico';
const PLATFORM_FAVICON = 'favicon.ico';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the requesting domain from headers or query params
    const url = new URL(req.url);
    const requestDomain = url.searchParams.get('domain') || 
                          req.headers.get('x-forwarded-host') || 
                          req.headers.get('host') || '';
    
    const hostname = requestDomain.toLowerCase().replace(/^www\./, '').split(':')[0];
    
    console.log('[serve-favicon] Requested for domain:', hostname);
    
    // Check if this is a platform domain
    const isPlatformDomain = PLATFORM_DOMAINS.some(d => 
      hostname === d || hostname === d.replace('www.', '')
    );
    
    // Check if development domain
    const isDevDomain = hostname.includes('lovable.app') || 
                        hostname.includes('lovableproject.com') || 
                        hostname === 'localhost' ||
                        hostname.startsWith('127.0.0.1');
    
    if (isPlatformDomain || isDevDomain) {
      console.log('[serve-favicon] Platform/dev domain, redirecting to main favicon');
      // Redirect to platform favicon
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': `https://homeofsmm.com/${PLATFORM_FAVICON}`,
          'Cache-Control': 'public, max-age=86400', // Cache for 1 day
        },
      });
    }
    
    // This is a tenant domain - check for custom favicon
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to find the panel for this domain
    let panel = null;
    
    // Check if it's a subdomain of platform domains
    const isSubdomain = PLATFORM_DOMAINS.some(d => hostname.endsWith(`.${d.replace('www.', '')}`));
    
    if (isSubdomain) {
      // Extract subdomain
      const parts = hostname.split('.');
      const subdomain = parts[0];
      
      console.log('[serve-favicon] Looking up subdomain:', subdomain);
      
      const { data } = await supabase
        .from('panels')
        .select('id, subdomain, custom_branding')
        .eq('subdomain', subdomain)
        .eq('is_active', true)
        .single();
      
      panel = data;
    } else {
      // Check custom domain in panel_domains table
      console.log('[serve-favicon] Looking up custom domain:', hostname);
      
      const { data: domainData } = await supabase
        .from('panel_domains')
        .select('panel_id, panels:panel_id(id, custom_branding)')
        .eq('domain', hostname)
        .eq('verification_status', 'verified')
        .single();
      
      if (domainData?.panels) {
        panel = domainData.panels;
      }
    }
    
    // Check if panel has custom favicon
    const panelObj = Array.isArray(panel) ? panel[0] : panel;
    if (panelObj?.custom_branding) {
      const branding = panelObj.custom_branding as any;
      const customFaviconUrl = branding?.faviconIcoUrl || branding?.faviconUrl;
      
      if (customFaviconUrl && customFaviconUrl.startsWith('http')) {
        console.log('[serve-favicon] Redirecting to custom favicon:', customFaviconUrl);
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            'Location': customFaviconUrl,
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          },
        });
      }
    }
    
    // Default: Return default tenant favicon
    console.log('[serve-favicon] Using default tenant favicon');
    
    // Redirect to default tenant favicon on the platform
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `https://homeofsmm.com/${DEFAULT_TENANT_FAVICON}`,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
    
  } catch (error) {
    console.error('[serve-favicon] Error:', error);
    
    // On error, return default tenant favicon
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `https://homeofsmm.com/${DEFAULT_TENANT_FAVICON}`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
});
