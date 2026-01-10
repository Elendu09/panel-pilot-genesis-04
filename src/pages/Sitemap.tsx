import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Dynamic Sitemap Page Component
 * This component fetches and renders sitemap.xml content for both platform and tenant domains
 */
const Sitemap = () => {
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        const hostname = window.location.hostname.toLowerCase();
        const isPlatform = ['homeofsmm.com', 'www.homeofsmm.com', 'smmpilot.online'].includes(hostname) ||
          hostname.includes('lovableproject.com') || hostname === 'localhost';

        if (isPlatform) {
          // Generate platform sitemap client-side (faster, no API call needed)
          const platformUrls = [
            { path: '/', priority: '1.0', changefreq: 'daily' },
            { path: '/features', priority: '0.9', changefreq: 'weekly' },
            { path: '/pricing', priority: '0.9', changefreq: 'weekly' },
            { path: '/services', priority: '0.8', changefreq: 'daily' },
            { path: '/docs', priority: '0.7', changefreq: 'weekly' },
            { path: '/blog', priority: '0.8', changefreq: 'daily' },
            { path: '/contact', priority: '0.6', changefreq: 'monthly' },
            { path: '/auth', priority: '0.5', changefreq: 'monthly' },
            { path: '/terms', priority: '0.3', changefreq: 'yearly' },
            { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
            { path: '/tutorial', priority: '0.6', changefreq: 'monthly' },
          ];

          const baseUrl = 'https://homeofsmm.com';
          let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
          xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
          
          platformUrls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${url.path}</loc>\n`;
            xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
            xml += `    <priority>${url.priority}</priority>\n`;
            xml += '  </url>\n';
          });
          
          xml += '</urlset>';
          setSitemapXml(xml);
        } else {
          // Tenant sitemap - call edge function
          const subdomain = hostname.split('.')[0];
          
          const { data, error: fnError } = await supabase.functions.invoke('generate-sitemap', {
            body: { subdomain }
          });

          if (fnError) throw fnError;
          setSitemapXml(data);
        }
      } catch (err: any) {
        console.error('Sitemap generation error:', err);
        setError(err.message || 'Failed to generate sitemap');
      } finally {
        setLoading(false);
      }
    };

    generateSitemap();
  }, []);

  // Set proper content type for XML
  useEffect(() => {
    if (sitemapXml && !loading) {
      // Create a blob and redirect to it for proper XML rendering
      const blob = new Blob([sitemapXml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      window.location.replace(url);
    }
  }, [sitemapXml, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Generating sitemap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Fallback display if blob redirect doesn't work
  return (
    <pre className="p-4 bg-slate-900 text-green-400 text-sm overflow-auto min-h-screen">
      {sitemapXml}
    </pre>
  );
};

export default Sitemap;
