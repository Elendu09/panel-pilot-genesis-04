import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

const RobotsTxt = () => {
  const [robotsContent, setRobotsContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { panel, isPlatformDomain, isTenantDomain } = useTenant();

  useEffect(() => {
    const generateRobots = async () => {
      try {
        const hostname = window.location.hostname.toLowerCase();
        
        // For platform domains, use static robots.txt content
        if (isPlatformDomain) {
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
        const parts = hostname.split('.');
        if (parts.length > 2) {
          const subdomain = parts[0];
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
        setRobotsContent(`User-agent: *
Allow: /
Crawl-delay: 1`);
      } finally {
        setLoading(false);
      }
    };

    generateRobots();
  }, [panel, isPlatformDomain, isTenantDomain]);

  // Redirect to blob URL with correct content type
  useEffect(() => {
    if (robotsContent && !loading) {
      const blob = new Blob([robotsContent], { type: 'text/plain' });
      const blobUrl = URL.createObjectURL(blob);
      window.location.replace(blobUrl);
    }
  }, [robotsContent, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-400">Generating robots.txt...</div>
      </div>
    );
  }

  if (error) {
    return (
      <pre className="font-mono text-sm whitespace-pre-wrap p-4">
        {robotsContent}
      </pre>
    );
  }

  // Fallback render while redirect happens
  return (
    <pre className="font-mono text-sm whitespace-pre-wrap p-4">
      {robotsContent}
    </pre>
  );
};

export default RobotsTxt;
