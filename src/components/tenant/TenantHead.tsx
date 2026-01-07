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
  
  // Favicon URLs with fallbacks: custom favicon -> default (NOT logo_url as that's the brand logo)
  const faviconUrl = customBranding?.faviconUrl || '/default-panel-favicon.png';
  const appleTouchIconUrl = customBranding?.appleTouchIconUrl || faviconUrl;
  const ogImage = customBranding?.ogImageUrl || panel?.logo_url;
  
  // Force favicon update via DOM manipulation (overrides index.html)
  // Always apply default favicon for tenant domains, even if panel is loading
  useEffect(() => {
    // Remove all existing favicon links
    document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
    
    // Add new favicon (defaults to default-panel-favicon.png if no custom favicon)
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
  }, [faviconUrl, appleTouchIconUrl]);
  
  // Generate proper SEO title - use panel name, never hardcoded "SMM Panel"
  const panelName = panel?.name || 'Panel';
  const seoSettings = panel?.settings as any;
  const pageTitle = title || seoSettings?.seo_title || `${panelName} - Social Media Marketing Services`;
  const pageDescription = description || seoSettings?.seo_description || `Professional social media marketing services from ${panelName}. Buy followers, likes, and views.`;
  const seoKeywords = seoSettings?.seo_keywords || `${panelName}, social media marketing, smm services`;
  
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={seoKeywords} />
      <link rel="icon" type="image/png" href={faviconUrl} />
      <link rel="apple-touch-icon" href={appleTouchIconUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content={panelName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
    </Helmet>
  );
};
