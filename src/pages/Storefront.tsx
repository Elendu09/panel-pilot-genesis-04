import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTenant, useTenantServices } from '@/hooks/useTenant';
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
  SMMVisitHomepage 
} from '@/components/buyer-themes';
import { FloatingChatWidget } from '@/components/storefront/FloatingChatWidget';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      servicesCount: services?.length
    });
  }, [tenantLoading, tenantError, panel, services]);

  const design = panel?.custom_branding || {};
  const themeType = panel?.theme_type || 'dark_gradient';
  const customBranding = panel?.custom_branding as any;
  const selectedTheme = customBranding?.selectedTheme || themeType;

  // Show centered logo loading with shimmer while tenant loads - prevents blank screen
  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          {/* Centered favicon with shimmer overlay */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <img 
              src="/default-panel-favicon.png" 
              alt="Loading" 
              className="w-20 h-20 rounded-2xl opacity-80"
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

  // Render appropriate theme based on panel.theme_type or custom_branding.selectedTheme
  // ThemeOne is ALWAYS the default - it's the primary/recommended theme
  const renderTheme = () => {
    try {
      const themeProps = {
        panel,
        services,
        customization: design
      };

      console.log('Rendering theme:', selectedTheme, 'with props:', { panelName: panel?.name, servicesCount: services?.length });

      // Prepare homepage props with customization
      const homepageProps = {
        panelName: panel?.name,
        services,
        stats: {
          totalOrders: (panel as any)?.total_orders || 0,
          totalUsers: 0,
          servicesCount: services?.length || 0,
        },
        customization: design,
        logoUrl: panel?.logo_url,
      };

      // Theme selection based on selectedTheme value
      switch (selectedTheme) {
        case 'theme_two':
        case 'professional':
        case 'light_minimal':
        case 'corporate':
        case 'ocean_blue':
          return <ThemeTwo {...themeProps} />;
        case 'theme_three':
        case 'vibrant':
        case 'neon_glow':
        case 'sunset_orange':
        case 'royal_purple':
          return <ThemeThree {...themeProps} />;
        case 'theme_four':
        case 'grace':
        case 'grace_cometh':
        case 'forest_earth':
          return <ThemeFour {...themeProps} />;
        case 'theme_five':
        case 'tech_futuristic':
          return <ThemeFive {...themeProps} />;
        // TGRef theme - terminal/tech aesthetic
        case 'theme_tgref':
        case 'tgref':
          return <TGRefHomepage {...homepageProps} />;
        // AliPanel theme - pink-orange gradients, floating icons
        case 'theme_alipanel':
        case 'alipanel':
          return <AliPanelHomepage {...homepageProps} />;
        // FlySMM theme - light, friendly, blue accents
        case 'theme_flysmm':
        case 'flysmm':
          return <FlySMMHomepage {...homepageProps} />;
        // SMMStay theme - dark neon pink
        case 'theme_smmstay':
        case 'smmstay':
          return <SMMStayHomepage {...homepageProps} />;
        // SMMVisit theme - light gray, yellow/gold
        case 'theme_smmvisit':
        case 'smmvisit':
          return <SMMVisitHomepage {...homepageProps} />;
        // ThemeOne is the default for all other cases (default, theme_one, dark_gradient, etc.)
        case 'default':
        case 'theme_one':
        case 'dark_gradient':
        case 'cosmic_purple':
        default:
          return <ThemeOne {...themeProps} />;
      }
    } catch (err: any) {
      console.error('Theme render error:', err);
      setRenderError(err.message || 'Failed to render theme');
      return null;
    }
  };

  // Check if Fast Order is enabled
  const enableFastOrder = (design as any)?.enableFastOrder !== false;

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
      </Helmet>
      {/* Removed PromotionalBanner - "Welcome bonus! Claim now" removed per SEO requirements */}
      {renderTheme()}
      {/* Floating Chat Widget - Consolidated chat with AI, WhatsApp, Telegram, etc. */}
      <FloatingChatWidget panelId={panel?.id} panelName={panel?.name} />
    </>
  );
};

export default Storefront;
