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
  const panelSettings = panel?.settings as any;
  
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
    
    // Add apple touch icons with multiple sizes for iOS
    const sizes = ['180x180', '152x152', '120x120'];
    sizes.forEach(size => {
      const appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.setAttribute('sizes', size);
      appleIcon.href = appleTouchIconUrl;
      document.head.appendChild(appleIcon);
    });
  }, [faviconUrl, appleTouchIconUrl]);
  
  // SEO title fallback chain: custom title -> panel settings seo_title -> panel name
  const pageTitle = title || panelSettings?.seo_title || `${panel?.name || 'Panel'} - Best SMM Panel | Social Media Marketing Services`;
  const pageDescription = description || panelSettings?.seo_description || `${panel?.name || 'Our panel'} offers premium SMM services including Instagram followers, YouTube views, TikTok likes and more. Fast delivery, 24/7 support, secure payments.`;
  const pageKeywords = panelSettings?.seo_keywords || `${panel?.name}, SMM panel, instagram followers, youtube views, tiktok likes, social media marketing`;
  
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="robots" content="index, follow" />
      <link rel="icon" type="image/png" href={faviconUrl} />
      <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIconUrl} />
      <link rel="apple-touch-icon" sizes="152x152" href={appleTouchIconUrl} />
      <link rel="apple-touch-icon" sizes="120x120" href={appleTouchIconUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
    </Helmet>
  );
};