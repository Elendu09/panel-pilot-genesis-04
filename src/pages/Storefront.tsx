import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTenant, useTenantServices } from '@/hooks/useTenant';
import { ThemeOne } from '@/components/themes/ThemeOne';
import { ThemeTwo } from '@/components/themes/ThemeTwo';
import { ThemeThree } from '@/components/themes/ThemeThree';
import { ThemeFour } from '@/components/themes/ThemeFour';
import { ThemeFive } from '@/components/themes/ThemeFive';
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
  const [isGuest, setIsGuest] = useState(true);

  // Immediately update document title when panel loads (before React Helmet)
  useEffect(() => {
    if (panel) {
      const panelSettings = panel.settings as any;
      const seoTitle = panelSettings?.seo_title || `${panel.name} - Best SMM Panel | Buy Instagram Followers, YouTube Views & More`;
      document.title = seoTitle;
    }
  }, [panel]);

  // Check if user is logged in (guest check)
  useEffect(() => {
    const checkAuth = async () => {
      // Check buyer session from localStorage
      const buyerSession = localStorage.getItem(`buyer_session_${panel?.id}`);
      setIsGuest(!buyerSession);
    };
    if (panel?.id) {
      checkAuth();
    }
  }, [panel?.id]);

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
              alt="Loading SMM Panel" 
              className="w-20 h-20 rounded-2xl opacity-80"
              width="80"
              height="80"
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
  const panelSettings = panel.settings as any;
  
  // SEO values with proper fallbacks
  const seoTitle = panelSettings?.seo_title || `${panel.name} - Best SMM Panel | Buy Instagram Followers, YouTube Views & More`;
  const seoDescription = panelSettings?.seo_description || `${panel.name} offers premium SMM services. Buy Instagram followers, YouTube views, TikTok likes, and more. Fast delivery, secure payments, 24/7 support. Best prices guaranteed.`;
  const seoKeywords = panelSettings?.seo_keywords || `${panel.name}, SMM panel, instagram followers, youtube views, tiktok likes, social media marketing, buy followers, SMM services`;

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

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="icon" type="image/png" href={faviconUrl} />
        <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIconUrl} />
        <link rel="apple-touch-icon" sizes="152x152" href={appleTouchIconUrl} />
        <link rel="apple-touch-icon" sizes="120x120" href={appleTouchIconUrl} />
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
      {/* Removed promotional banner as per user request */}
      {renderTheme()}
      {/* Floating Chat Widget - Consolidated chat with AI, WhatsApp, Telegram, etc. */}
      <FloatingChatWidget panelId={panel?.id} panelName={panel?.name} />
    </>
  );
};

export default Storefront;