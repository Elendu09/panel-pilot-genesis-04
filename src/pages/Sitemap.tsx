import { useEffect, useState, useLayoutEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Dynamic Sitemap Page Component
 * This component fetches and renders sitemap.xml content for both platform and tenant domains
 * Renders as clean XML text directly - no blob URLs
 */
const Sitemap = () => {
  const [sitemapXml, setSitemapXml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set document styling for XML display immediately
  useLayoutEffect(() => {
    // Apply XML-friendly styling to body
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#1e1e1e';
    
    return () => {
      // Cleanup on unmount
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

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
          // Detect if this is a subdomain or custom domain
          const isSubdomain = hostname.endsWith('.homeofsmm.com') || hostname.endsWith('.smmpilot.online');
          
          const params: Record<string, string> = {};
          if (isSubdomain) {
            params.subdomain = hostname.split('.')[0];
          } else {
            // Custom domain
            params.domain = hostname;
          }
          
          const { data, error: fnError } = await supabase.functions.invoke('generate-sitemap', {
            body: params
          });

          if (fnError) throw fnError;
          setSitemapXml(data);
        }
      } catch (err: any) {
        console.error('Sitemap generation error:', err);
        setError(err.message || 'Failed to generate sitemap');
        
        // Generate fallback sitemap
        const baseUrl = `https://${window.location.hostname}`;
        const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/auth</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
        setSitemapXml(fallbackXml);
      } finally {
        setLoading(false);
      }
    };

    generateSitemap();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e1e1e',
        color: '#888'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #444',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontFamily: 'monospace', fontSize: '14px' }}>Generating sitemap.xml...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Render XML directly as preformatted text
  // This is cleaner and more reliable than blob URLs
  return (
    <pre style={{
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      fontSize: '13px',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      margin: 0,
      padding: '16px',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      minHeight: '100vh',
      overflowX: 'auto'
    }}>
      {sitemapXml.split('\n').map((line, i) => {
        // Simple syntax highlighting for XML
        const highlightedLine = line
          .replace(/(<\?.*?\?>)/g, '<span style="color:#569cd6">$1</span>')
          .replace(/(<\/?[a-zA-Z][^>]*>)/g, '<span style="color:#4ec9b0">$1</span>')
          .replace(/(https?:\/\/[^\s<]+)/g, '<span style="color:#ce9178">$1</span>');
        
        return (
          <div 
            key={i} 
            dangerouslySetInnerHTML={{ __html: highlightedLine }}
            style={{ minHeight: '20px' }}
          />
        );
      })}
    </pre>
  );
};

export default Sitemap;
