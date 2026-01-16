import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/plain',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const panelId = url.searchParams.get('panel_id');
    const subdomain = url.searchParams.get('subdomain');
    const customDomain = url.searchParams.get('domain');
    const type = url.searchParams.get('type') || 'tenant'; // 'tenant' or 'platform'

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Platform robots.txt - for main homeofsmm.com
    if (type === 'platform') {
      const platformRobots = `# Sitemap
Sitemap: https://homeofsmm.com/sitemap.xml

# Allow all major crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: *
Allow: /

# Disallow admin and panel areas from indexing
Disallow: /panel/
Disallow: /admin/
Disallow: /auth
Disallow: /api/

# Allow important pages explicitly
Allow: /blog
Allow: /features
Allow: /pricing
Allow: /about
Allow: /contact
Allow: /services
Allow: /support
Allow: /terms
Allow: /privacy

# Crawl-delay for politeness
Crawl-delay: 1`;

      return new Response(platformRobots, { headers: corsHeaders });
    }

    // Tenant robots.txt - for panel subdomains/custom domains
    if (!panelId && !subdomain && !customDomain) {
      return new Response('Missing panel identifier', { status: 400, headers: corsHeaders });
    }

    // Find panel
    let panel;
    if (panelId) {
      const { data } = await supabase.from('panels').select('*').eq('id', panelId).single();
      panel = data;
    } else if (subdomain) {
      const { data } = await supabase.from('panels').select('*').eq('subdomain', subdomain).single();
      panel = data;
    } else if (customDomain) {
      // First check panel_domains table
      const { data: domainData } = await supabase
        .from('panel_domains')
        .select('panel_id')
        .eq('domain', customDomain)
        .eq('verification_status', 'verified')
        .single();
      
      if (domainData?.panel_id) {
        const { data: panelData } = await supabase.from('panels').select('*').eq('id', domainData.panel_id).single();
        panel = panelData;
      } else {
        // Fallback: check custom_domain column
        const { data: panelData } = await supabase.from('panels').select('*').eq('custom_domain', customDomain).single();
        panel = panelData;
      }
    }

    if (!panel) {
      return new Response('Panel not found', { status: 404, headers: corsHeaders });
    }

    // Determine base URL for sitemap reference
    let baseUrl: string;
    if (customDomain) {
      baseUrl = `https://${customDomain}`;
    } else if (panel.custom_domain) {
      baseUrl = `https://${panel.custom_domain}`;
    } else {
      baseUrl = `https://${panel.subdomain}.homeofsmm.com`;
    }

    // Generate tenant-specific robots.txt
    const tenantRobots = `# ${panel.name} - robots.txt
# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Allow all major search engine crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: *
Allow: /

# Allow public pages
Allow: /
Allow: /services
Allow: /blog
Allow: /contact
Allow: /terms
Allow: /privacy
Allow: /api
Allow: /fast-order
Allow: /track-order

# Disallow private/protected areas
Disallow: /dashboard
Disallow: /profile
Disallow: /orders
Disallow: /deposit
Disallow: /favorites
Disallow: /support
Disallow: /bulk-order
Disallow: /new-order
Disallow: /team-login
Disallow: /team-dashboard

# Crawl-delay for politeness
Crawl-delay: 1`;

    console.log(`[generate-robots] Generated robots.txt for panel: ${panel.subdomain}`);

    return new Response(tenantRobots, { headers: corsHeaders });

  } catch (error) {
    console.error('[generate-robots] Error:', error);
    return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
});
