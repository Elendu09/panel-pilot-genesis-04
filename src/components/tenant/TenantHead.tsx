import { useEffect, useLayoutEffect } from 'react';
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
  
  // Favicon URLs - prioritize .ico for Google compatibility, then custom, then defaults
  const faviconIcoUrl = customBranding?.faviconIcoUrl || '/default-tenant-favicon.ico';
  const faviconPngUrl = customBranding?.faviconUrl || '/default-panel-favicon.png';
  const appleTouchIconUrl = customBranding?.appleTouchIconUrl || '/default-panel-apple-touch-icon.png';
  const ogImage = customBranding?.ogImageUrl || panel?.logo_url;
  
  // Generate proper SEO title/description from panel settings (set during onboarding)
  const panelName = panel?.name || 'Panel';
  
  // Priority: 1. Page-specific props, 2. Panel SEO settings, 3. Auto-generated
  const seoTitle = panelSettings?.seo_title || `${panelName} - Social Media Marketing Services`;
  const seoDescription = panelSettings?.seo_description || `Professional social media marketing services from ${panelName}. Buy followers, likes, and views.`;
  const seoKeywords = panelSettings?.seo_keywords || `${panelName}, social media marketing, smm services, instagram followers, youtube views`;
  
  // Final values (page-specific title/description overrides panel defaults)
  const pageTitle = title || seoTitle;
  const pageDescription = description || seoDescription;
  
  // Canonical URL based on actual domain
  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // CRITICAL: Set document title immediately using useLayoutEffect
  // This runs synchronously before paint, preventing "HOME OF SMM" flash
  useLayoutEffect(() => {
    if (panel?.name) {
      document.title = pageTitle;
    }
  }, [panel?.name, pageTitle]);
  
  // Force favicon update via DOM manipulation (overrides index.html)
  // Prioritize .ico format for Google crawler compatibility
  useEffect(() => {
    // Remove all existing favicon links
    document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
    
    // Add primary .ico favicon (best for Google)
    const faviconIco = document.createElement('link');
    faviconIco.rel = 'icon';
    faviconIco.type = 'image/x-icon';
    faviconIco.href = faviconIcoUrl;
    document.head.appendChild(faviconIco);
    
    // Add shortcut icon (legacy browser support)
    const shortcutIcon = document.createElement('link');
    shortcutIcon.rel = 'shortcut icon';
    shortcutIcon.type = 'image/x-icon';
    shortcutIcon.href = faviconIcoUrl;
    document.head.appendChild(shortcutIcon);
    
    // Add PNG favicon for other sizes
    const faviconPng32 = document.createElement('link');
    faviconPng32.rel = 'icon';
    faviconPng32.type = 'image/png';
    faviconPng32.sizes = '32x32';
    faviconPng32.href = faviconPngUrl;
    document.head.appendChild(faviconPng32);
    
    // Add apple touch icon
    const appleIcon = document.createElement('link');
    appleIcon.rel = 'apple-touch-icon';
    appleIcon.sizes = '180x180';
    appleIcon.href = appleTouchIconUrl;
    document.head.appendChild(appleIcon);
  }, [faviconIcoUrl, faviconPngUrl, appleTouchIconUrl]);
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content={panelName} />
      
      {/* Viewport and Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={panelName} />
      
      {/* Robots and Crawling */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl.split('?')[0]} />
      
      {/* Robots.txt */}
      <link rel="robots" href={`${canonicalUrl}/robots.txt`} />
      
      {/* Sitemap */}
      <link rel="sitemap" type="application/xml" href={`${canonicalUrl}/sitemap.xml`} />
      
      {/* Favicon and Icons - .ico format for Google compatibility */}
      <link rel="icon" type="image/x-icon" href={faviconIcoUrl} />
      <link rel="shortcut icon" type="image/x-icon" href={faviconIcoUrl} />
      <link rel="icon" type="image/png" sizes="32x32" href={faviconPngUrl} />
      <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIconUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:site_name" content={panelName} />
      <meta property="og:locale" content="en_US" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:alt" content={`${panelName} logo`} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Theme Color */}
      <meta name="theme-color" content={customBranding?.primaryColor || '#6366F1'} />
      <meta name="msapplication-TileColor" content={customBranding?.primaryColor || '#6366F1'} />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* JSON-LD Structured Data for Organization/WebSite */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": panelName,
          "url": canonicalUrl,
          "description": pageDescription,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${canonicalUrl}/services?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": panelName,
          "url": canonicalUrl,
          ...(ogImage ? { "logo": ogImage } : {}),
          "sameAs": []
        })}
      </script>
      {/* Local Business schema for SMM Panel services */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": panelName,
          "url": canonicalUrl,
          "description": pageDescription,
          ...(ogImage ? { "image": ogImage } : {}),
          "priceRange": "$$",
          "openingHours": "Mo-Su 00:00-24:00",
          "@id": canonicalUrl
        })}
      </script>
    </Helmet>
  );
};
