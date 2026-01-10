import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
}

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
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

    // Platform sitemap - for main homeofsmm.com
    if (type === 'platform') {
      const platformUrls: SitemapUrl[] = [
        { loc: 'https://homeofsmm.com/', changefreq: 'daily', priority: '1.0' },
        { loc: 'https://homeofsmm.com/features', changefreq: 'weekly', priority: '0.9' },
        { loc: 'https://homeofsmm.com/pricing', changefreq: 'weekly', priority: '0.9' },
        { loc: 'https://homeofsmm.com/services', changefreq: 'daily', priority: '0.8' },
        { loc: 'https://homeofsmm.com/docs', changefreq: 'weekly', priority: '0.7' },
        { loc: 'https://homeofsmm.com/blog', changefreq: 'daily', priority: '0.8' },
        { loc: 'https://homeofsmm.com/contact', changefreq: 'monthly', priority: '0.6' },
        { loc: 'https://homeofsmm.com/auth', changefreq: 'monthly', priority: '0.5' },
        { loc: 'https://homeofsmm.com/terms', changefreq: 'yearly', priority: '0.3' },
        { loc: 'https://homeofsmm.com/privacy', changefreq: 'yearly', priority: '0.3' },
        { loc: 'https://homeofsmm.com/tutorial', changefreq: 'monthly', priority: '0.6' },
      ];

      const xml = generateSitemapXML(platformUrls);
      return new Response(xml, { headers: corsHeaders });
    }

    // Tenant sitemap - for panel subdomains/custom domains
    if (!panelId && !subdomain && !customDomain) {
      return new Response('Missing panel identifier', { status: 400, headers: { 'Content-Type': 'text/plain' } });
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
      const { data } = await supabase.from('panel_domains').select('panel_id').eq('domain', customDomain).eq('verification_status', 'verified').single();
      if (data?.panel_id) {
        const { data: panelData } = await supabase.from('panels').select('*').eq('id', data.panel_id).single();
        panel = panelData;
      }
    }

    if (!panel) {
      return new Response('Panel not found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
    }

    // Determine base URL
    let baseUrl: string;
    if (customDomain) {
      baseUrl = `https://${customDomain}`;
    } else if (panel.custom_domain) {
      baseUrl = `https://${panel.custom_domain}`;
    } else {
      baseUrl = `https://${panel.subdomain}.homeofsmm.com`;
    }

    // Build sitemap URLs
    const sitemapUrls: SitemapUrl[] = [
      { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0', lastmod: panel.updated_at },
      { loc: `${baseUrl}/services`, changefreq: 'daily', priority: '0.9' },
      { loc: `${baseUrl}/auth`, changefreq: 'monthly', priority: '0.7' },
      { loc: `${baseUrl}/fast-order`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${baseUrl}/track-order`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: '0.5' },
      { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: '0.3' },
      { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: '0.3' },
      { loc: `${baseUrl}/api`, changefreq: 'monthly', priority: '0.5' },
    ];

    // Add blog page if enabled
    if (panel.blog_enabled) {
      sitemapUrls.push({ loc: `${baseUrl}/blog`, changefreq: 'daily', priority: '0.8' });
      
      // Fetch blog posts for this panel
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at, published_at')
        .eq('panel_id', panel.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(100);

      if (blogPosts) {
        for (const post of blogPosts) {
          sitemapUrls.push({
            loc: `${baseUrl}/blog/${post.slug}`,
            lastmod: post.updated_at || post.published_at,
            changefreq: 'weekly',
            priority: '0.7'
          });
        }
      }
    }

    // Fetch visible services (public) and add categories
    const { data: services } = await supabase
      .from('services')
      .select('category, updated_at')
      .eq('panel_id', panel.id)
      .eq('is_active', true)
      .eq('is_visible_to_buyers', true)
      .limit(500);

    if (services && services.length > 0) {
      // Get unique categories
      const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
      const latestServiceUpdate = services.reduce((latest, s) => {
        const date = new Date(s.updated_at);
        return date > latest ? date : latest;
      }, new Date(0));

      // Add service category pages (if your site supports them)
      // For now, just ensure services page is up to date
      const servicesIndex = sitemapUrls.findIndex(u => u.loc === `${baseUrl}/services`);
      if (servicesIndex >= 0) {
        sitemapUrls[servicesIndex].lastmod = latestServiceUpdate.toISOString();
      }
    }

    const xml = generateSitemapXML(sitemapUrls);
    
    console.log(`[generate-sitemap] Generated sitemap for panel: ${panel.subdomain} with ${sitemapUrls.length} URLs`);
    
    return new Response(xml, { headers: corsHeaders });

  } catch (error) {
    console.error('[generate-sitemap] Error:', error);
    return new Response(`Error: ${error.message}`, { status: 500, headers: { 'Content-Type': 'text/plain' } });
  }
});

function generateSitemapXML(urls: SitemapUrl[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    if (url.lastmod) {
      const date = new Date(url.lastmod);
      xml += `    <lastmod>${date.toISOString().split('T')[0]}</lastmod>\n`;
    }
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  xml += '</urlset>';
  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
