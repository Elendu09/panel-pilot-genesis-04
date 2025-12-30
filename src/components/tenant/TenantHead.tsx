import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTenant } from '@/hooks/useTenant';

interface TenantHeadProps {
  title?: string;
  description?: string;
}

export const TenantHead = ({ title, description }: TenantHeadProps) => {
  const { panel } = useTenant();
  const customBranding = panel?.custom_branding as any;
  
  // Favicon URLs with fallbacks: custom favicon -> logo -> default
  const faviconUrl = customBranding?.faviconUrl || panel?.logo_url || '/default-panel-favicon.png';
  const appleTouchIconUrl = customBranding?.appleTouchIconUrl || faviconUrl;
  const ogImage = customBranding?.ogImageUrl || panel?.logo_url;
  
  // Force favicon update via DOM manipulation (overrides index.html)
  useEffect(() => {
    if (!panel) return;
    
    // Remove all existing favicon links
    document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
    
    // Add new favicon
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = faviconUrl.endsWith('.ico') ? 'image/x-icon' : 'image/png';
    favicon.href = faviconUrl;
    document.head.appendChild(favicon);
    
    // Add apple touch icon
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.href = appleTouchIconUrl;
    document.head.appendChild(appleIcon);
  }, [panel?.id, faviconUrl, appleTouchIconUrl]);
  
  const pageTitle = title || (panel?.settings as any)?.seo_title || `${panel?.name || 'Panel'} - SMM Panel`;
  const pageDescription = description || (panel?.settings as any)?.seo_description || `Professional SMM services from ${panel?.name}`;
  
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="icon" type="image/png" href={faviconUrl} />
      <link rel="apple-touch-icon" href={appleTouchIconUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
    </Helmet>
  );
};
