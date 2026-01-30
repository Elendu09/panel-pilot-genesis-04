import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTenant, useTenantServices } from '@/hooks/useTenant';
import { TenantHead } from '@/components/tenant/TenantHead';
import { ThemeOne } from '@/components/themes/ThemeOne';
import { ThemeTwo } from '@/components/themes/ThemeTwo';
import { ThemeThree } from '@/components/themes/ThemeThree';
import { ThemeFour } from '@/components/themes/ThemeFour';
import { ThemeFive } from '@/components/themes/ThemeFive';
import { ThemeTGRef } from '@/components/themes/ThemeTGRef';
import { ThemeAliPanel } from '@/components/themes/ThemeAliPanel';
import { 
  TGRefHomepage, 
  AliPanelHomepage, 
  FlySMMHomepage, 
  SMMStayHomepage, 
  SMMVisitHomepage,
  BuyerThemeTGRef,
  BuyerThemeAliPanel,
  BuyerThemeFlySMM,
  BuyerThemeSMMStay,
  BuyerThemeSMMVisit,
} from '@/components/buyer-themes';
import { FloatingChatWidget } from '@/components/storefront/FloatingChatWidget';
import { AnnouncementBar } from '@/components/storefront/AnnouncementBar';
import { FreeTierBanner } from '@/components/storefront/FreeTierBanner';
import { BuyerHomepageSchemas, FAQPageSchema } from '@/components/seo/JsonLdSchema';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateBuyerThemeCSS } from '@/lib/color-utils';
import { useBuyerThemeMode } from '@/contexts/BuyerThemeContext';

// Error Boundary Component
const ErrorFallback = ({ error, panelName }: { error: string; panelName?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="text-center max-w-md mx-auto p-6">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-white mb-4">
        {panelName || 'Panel'} - Error Loading
      </h1>
      <p className="text-slate-400 mb-6">
        We encountered an issue loading this page. Please try refreshing.
      </p>
      <p className="text-xs text-slate-500 bg-slate-800 p-3 rounded-lg font-mono">
        {error}
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

const Storefront = () => {
  const navigate = useNavigate();
  const { panel, loading: tenantLoading, error: tenantError } = useTenant();
  const { services } = useTenantServices(panel?.id);
  const [renderError, setRenderError] = useState<string | null>(null);
  
  // Free tier banner state - persists for session
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return sessionStorage.getItem('freeTierBannerDismissed') === 'true';
  });
  
  // Use the buyer theme context for light/dark mode (allows buyers to toggle)
  const { themeMode, setThemeMode } = useBuyerThemeMode();

  // Immediately update document title when panel loads (before React Helmet)
  useEffect(() => {
    if (panel) {
      const seoTitle = (panel.settings as any)?.seo_title || `${panel.name} - Social Media Marketing Services`;
      document.title = seoTitle;
    }
  }, [panel]);

  // Debug logging
  useEffect(() => {
    console.log('Storefront render state:', {
      tenantLoading,
      tenantError,
      hasPanel: !!panel,
      panelId: panel?.id,
      panelName: panel?.name,
      themeType: panel?.theme_type,
      themeMode,
      servicesCount: services?.length
    });
  }, [tenantLoading, tenantError, panel, services, themeMode]);

  const design = panel?.custom_branding || {};
  const customBranding = panel?.custom_branding as any;
  // Theme priority: custom_branding.selectedTheme > buyer_theme > theme_type > fallback
  const selectedTheme = customBranding?.selectedTheme || panel?.buyer_theme || panel?.theme_type || 'default';

  // Generate CSS variables for design preset colors - ensures colors sync across storefront
  const storefrontColorStyles = useMemo(() => {
    if (!customBranding) return '';
    return generateBuyerThemeCSS({
      primaryColor: customBranding?.primaryColor || panel?.primary_color || '#3b82f6',
      secondaryColor: customBranding?.secondaryColor || panel?.secondary_color || '#8B5CF6',
      accentColor: customBranding?.accentColor || '#EC4899',
      backgroundColor: customBranding?.backgroundColor || '#0F172A',
      surfaceColor: customBranding?.surfaceColor || '#1E293B',
      cardColor: customBranding?.cardColor || customBranding?.surfaceColor || '#1E293B',
      textColor: customBranding?.textColor || '#FFFFFF',
      mutedColor: customBranding?.mutedColor || '#94A3B8',
      borderColor: customBranding?.borderColor || '#334155',
      successColor: customBranding?.successColor || '#22C55E',
      warningColor: customBranding?.warningColor || '#F59E0B',
      infoColor: customBranding?.infoColor || '#3B82F6',
      errorColor: customBranding?.errorColor || '#EF4444',
    });
  }, [customBranding, panel]);

  // Show centered logo loading with shimmer while tenant loads - prevents blank screen
  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          {/* Centered favicon with shimmer overlay - uses panel logo if available */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <img 
              src={panel?.logo_url || "/default-panel-favicon.png"} 
              alt="Loading" 
              className="w-20 h-20 rounded-2xl opacity-80 object-cover"
            />
            {/* Shimmer overlay animation */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
          {/* Shimmer text placeholder for panel name */}
          <div className="h-6 w-40 mx-auto bg-slate-800 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (tenantError || !panel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Panel Not Found</h1>
          <p className="text-slate-400">
            {tenantError || 'This panel is not available or has been deactivated.'}
          </p>
        </div>
      </div>
    );
  }

  if (renderError) {
    return <ErrorFallback error={renderError} panelName={panel?.name} />;
  }

  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Extract panel_settings - it comes as an array from the query, so get the first item
  const panelSettingsData = Array.isArray((panel as any)?.panel_settings) 
    ? (panel as any)?.panel_settings[0] 
    : (panel as any)?.panel_settings;

  // Get announcements config from panel_settings.integrations
  const integrations = panelSettingsData?.integrations || (panel?.settings as any)?.integrations || {};
  const announcementConfig = integrations?.announcements || {};

  // Full customization object with all design settings - include setThemeMode for toggle
  const fullCustomization = {
    ...design,
    logoUrl: customBranding?.logoUrl || panel?.logo_url,
    faviconUrl: customBranding?.faviconUrl || panel?.logo_url,
    companyName: customBranding?.companyName || panel?.name,
    primaryColor: customBranding?.primaryColor || panel?.primary_color || '#6366F1',
    secondaryColor: customBranding?.secondaryColor || panel?.secondary_color || '#8B5CF6',
    themeMode, // Pass current theme mode
    setThemeMode, // Pass setter so components can toggle
    // Pass blog menu visibility from panel_settings.blog_enabled (priority) or custom_branding
    showBlogInMenu: panelSettingsData?.blog_enabled ?? customBranding?.showBlogInMenu ?? (panel?.settings as any)?.blog_enabled ?? false,
  };

  const themeProps = {
    panel,
    services,
    customization: fullCustomization
  };

  // Homepage props for buyer theme components
  const homepageProps = {
    panelName: customBranding?.companyName || panel?.name,
    services,
    stats: {
      totalOrders: (panel as any)?.total_orders || 0,
      totalUsers: 0,
      servicesCount: services?.length || 0,
    },
    customization: fullCustomization,
    logoUrl: customBranding?.logoUrl || panel?.logo_url,
  };

  console.log('Rendering theme:', selectedTheme, 'mode:', themeMode, 'with props:', { panelName: panel?.name, servicesCount: services?.length });

  // Render appropriate theme based on selectedTheme value with proper wrappers
  const renderThemeContent = () => {
    try {
      // Theme selection based on selectedTheme value
      switch (selectedTheme) {
        case 'theme_two':
        case 'professional':
        case 'light_minimal':
        case 'corporate':
        case 'ocean_blue':
          return { content: <ThemeTwo {...themeProps} />, wrapper: null };
        case 'theme_three':
        case 'vibrant':
        case 'neon_glow':
        case 'sunset_orange':
        case 'royal_purple':
          return { content: <ThemeThree {...themeProps} />, wrapper: null };
        case 'theme_four':
        case 'grace':
        case 'grace_cometh':
        case 'forest_earth':
          return { content: <ThemeFour {...themeProps} />, wrapper: null };
        case 'theme_five':
        case 'tech_futuristic':
          return { content: <ThemeFive {...themeProps} />, wrapper: null };
        // TGRef theme - terminal/tech aesthetic
        case 'theme_tgref':
        case 'tgref':
          return { content: <TGRefHomepage {...homepageProps} />, wrapper: BuyerThemeTGRef };
        // AliPanel theme - pink-orange gradients, floating icons
        case 'theme_alipanel':
        case 'alipanel':
          return { content: <AliPanelHomepage {...homepageProps} />, wrapper: BuyerThemeAliPanel };
        // FlySMM theme - light, friendly, blue accents
        case 'theme_flysmm':
        case 'flysmm':
          return { content: <FlySMMHomepage {...homepageProps} />, wrapper: BuyerThemeFlySMM };
        // SMMStay theme - dark neon pink
        case 'theme_smmstay':
        case 'smmstay':
          return { content: <SMMStayHomepage {...homepageProps} />, wrapper: BuyerThemeSMMStay };
        // SMMVisit theme - light gray, yellow/gold
        case 'theme_smmvisit':
        case 'smmvisit':
          return { content: <SMMVisitHomepage {...homepageProps} />, wrapper: BuyerThemeSMMVisit };
        // ThemeOne is the default for all other cases (default, theme_one, dark_gradient, etc.)
        case 'default':
        case 'theme_one':
        case 'dark_gradient':
        case 'cosmic_purple':
        default:
          return { content: <ThemeOne {...themeProps} />, wrapper: null };
      }
    } catch (err: any) {
      console.error('Theme render error:', err);
      setRenderError(err.message || 'Failed to render theme');
      return { content: null, wrapper: null };
    }
  };

  const { content: themeContent, wrapper: ThemeWrapper } = renderThemeContent();

  // Check if Fast Order is enabled
  const enableFastOrder = (design as any)?.enableFastOrder !== false;

  // Check if panel is on free tier (no subscription or 'free' tier)
  const isFreeTier = !(panel as any)?.subscription_tier || (panel as any)?.subscription_tier === 'free';
  const showFreeBanner = isFreeTier && !bannerDismissed;

  // Get favicon URL - use panel's custom favicon -> logo -> default
  const faviconUrl = customBranding?.faviconUrl || panel.logo_url || '/default-panel-favicon.png';
  const appleTouchIconUrl = customBranding?.appleTouchIconUrl || faviconUrl;

  // Generate proper SEO title - never use hardcoded "SMM Panel" for tenants
  const seoTitle = (panel.settings as any)?.seo_title || `${panel.name} - Social Media Marketing Services`;
  const seoDescription = (panel.settings as any)?.seo_description || `Professional social media marketing services from ${panel.name}. Buy Instagram followers, YouTube views, TikTok likes and more.`;
  const seoKeywords = (panel.settings as any)?.seo_keywords || `${panel.name}, social media marketing, instagram followers, youtube views, tiktok likes, smm services`;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" type="image/png" href={faviconUrl} />
        <link rel="apple-touch-icon" href={appleTouchIconUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={panel.name} />
        {panel.logo_url && <meta property="og:image" content={panel.logo_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {/* Additional SEO meta tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="format-detection" content="telephone=no" />
        {/* Robots.txt and Sitemap links for SEO */}
        <link rel="sitemap" type="application/xml" href={`${canonicalUrl}/sitemap.xml`} />
        <link rel="robots" href={`${canonicalUrl}/robots.txt`} />
      </Helmet>
      {/* JSON-LD Structured Data for rich search results */}
      <BuyerHomepageSchemas
        panelName={panel.name}
        panelUrl={canonicalUrl}
        logoUrl={panel.logo_url || undefined}
        description={seoDescription}
      />
      {/* Inject TenantHead for service integrations (GA, GTM, Crisp, custom code, etc.) */}
      <TenantHead />
      {/* Inject design preset colors as CSS variables */}
      {storefrontColorStyles && <style>{storefrontColorStyles}</style>}
      {/* Announcement Bar - reads from panel_settings.integrations.announcements */}
      <AnnouncementBar 
        enabled={announcementConfig.enabled}
        title={announcementConfig.title}
        text={announcementConfig.text}
        linkText={announcementConfig.linkText}
        linkUrl={announcementConfig.linkUrl}
        backgroundColor={announcementConfig.backgroundColor || customBranding?.primaryColor || '#6366F1'}
        textColor={announcementConfig.textColor || '#FFFFFF'}
      />
      {/* Theme mode wrapper - uses BuyerTheme* wrapper for buyer themes (enables CSS light/dark selectors) */}
      {ThemeWrapper ? (
        <ThemeWrapper themeMode={themeMode}>
          {themeContent}
          <FloatingChatWidget panelId={panel?.id} panelName={panel?.name} />
          {showFreeBanner && (
            <FreeTierBanner 
              onDismiss={() => {
                sessionStorage.setItem('freeTierBannerDismissed', 'true');
                setBannerDismissed(true);
              }}
            />
          )}
        </ThemeWrapper>
      ) : (
        <div className={`buyer-theme-wrapper ${themeMode}`}>
          {themeContent}
          <FloatingChatWidget panelId={panel?.id} panelName={panel?.name} />
          {showFreeBanner && (
            <FreeTierBanner 
              onDismiss={() => {
                sessionStorage.setItem('freeTierBannerDismissed', 'true');
                setBannerDismissed(true);
              }}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Storefront;
