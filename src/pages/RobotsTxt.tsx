import { useEffect, useState, useLayoutEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

/**
 * Dynamic robots.txt Page Component
 * This component fetches and renders robots.txt content for both platform and tenant domains
 * Renders as clean text directly - no blob URLs
 */
const RobotsTxt = () => {
  const [robotsContent, setRobotsContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { panel, isPlatformDomain, isTenantDomain } = useTenant();

  // Set document styling for text display immediately
  useLayoutEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#1e1e1e';
    
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  useEffect(() => {
    const generateRobots = async () => {
      try {
        const hostname = window.location.hostname.toLowerCase();
        const hostnameWithoutWww = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
        
        // Platform detection - must be EXACT match to root domain, not subdomains
        const isPlatformRoot = hostnameWithoutWww === 'homeofsmm.com' || 
                               hostnameWithoutWww === 'smmpilot.online' ||
                               hostname.includes('lovableproject.com') ||
                               hostname.includes('lovable.app') ||
                               hostname === 'localhost';
        
        // For platform domains, use static robots.txt content
        if (isPlatformRoot) {
          const response = await supabase.functions.invoke('generate-robots', {
            body: { type: 'platform' }
          });
          
          if (response.error) throw new Error(response.error.message);
          setRobotsContent(response.data || '');
          return;
        }

        // For tenant domains, generate dynamic robots.txt
        if (isTenantDomain && panel) {
          // Determine if this is a custom domain or subdomain
          const isCustomDomain = !hostname.endsWith('.homeofsmm.com') && 
                                  !hostname.endsWith('.smmpilot.online');
          
          const params: Record<string, string> = {};
          
          if (isCustomDomain) {
            params.domain = hostname;
          } else {
            params.subdomain = panel.subdomain;
          }
          
          const response = await supabase.functions.invoke('generate-robots', {
            body: params
          });
          
          if (response.error) throw new Error(response.error.message);
          setRobotsContent(response.data || '');
          return;
        }

        // Fallback: generate based on hostname detection
        const isSubdomain = hostname.includes('.homeofsmm.com') || hostname.includes('.smmpilot.online');
        
        if (isSubdomain) {
          const subdomain = hostname.split('.')[0];
          const response = await supabase.functions.invoke('generate-robots', {
            body: { subdomain }
          });
          
          if (response.error) throw new Error(response.error.message);
          setRobotsContent(response.data || '');
        } else {
          // Custom domain without panel loaded yet
          const response = await supabase.functions.invoke('generate-robots', {
            body: { domain: hostname }
          });
          
          if (response.error) throw new Error(response.error.message);
          setRobotsContent(response.data || '');
        }
      } catch (err: any) {
        console.error('[RobotsTxt] Error:', err);
        setError(err.message);
        
        // Fallback robots.txt
        const baseUrl = `https://${window.location.hostname}`;
        setRobotsContent(`# robots.txt for ${window.location.hostname}
# Generated fallback

User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

Crawl-delay: 1`);
      } finally {
        setLoading(false);
      }
    };

    generateRobots();
  }, [panel, isPlatformDomain, isTenantDomain]);

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
          <p style={{ fontFamily: 'monospace', fontSize: '14px' }}>Generating robots.txt...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Render robots.txt directly as preformatted text
  return (
    <pre style={{
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      fontSize: '13px',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      margin: 0,
      padding: '16px',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      minHeight: '100vh',
      overflowX: 'auto'
    }}>
      {robotsContent.split('\n').map((line, i) => {
        // Simple syntax highlighting for robots.txt
        let color = '#d4d4d4'; // default
        if (line.startsWith('#')) {
          color = '#6a9955'; // comments in green
        } else if (line.startsWith('User-agent:') || line.startsWith('Sitemap:')) {
          color = '#4ec9b0'; // directives in teal
        } else if (line.startsWith('Allow:') || line.startsWith('Disallow:')) {
          color = '#569cd6'; // rules in blue
        } else if (line.startsWith('Crawl-delay:')) {
          color = '#dcdcaa'; // crawl delay in yellow
        } else if (line.includes('http://') || line.includes('https://')) {
          color = '#ce9178'; // URLs in orange
        }
        
        return (
          <div key={i} style={{ color, minHeight: '20px' }}>
            {line || ' '}
          </div>
        );
      })}
    </pre>
  );
};

export default RobotsTxt;
