import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTenant, useTenantServices } from '@/hooks/useTenant';
import { ThemeOne } from '@/components/themes/ThemeOne';
import { ThemeTwo } from '@/components/themes/ThemeTwo';
import { ThemeThree } from '@/components/themes/ThemeThree';
import { ThemeFour } from '@/components/themes/ThemeFour';
import { FloatingChatWidget } from '@/components/storefront/FloatingChatWidget';
import { LiveChatWidget } from '@/components/support/LiveChatWidget';
import { FastOrderSection } from '@/components/storefront/FastOrderSection';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';

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
  const { panel, loading: tenantLoading, error: tenantError } = useTenant();
  const { services } = useTenantServices(panel?.id);
  const [liveChatEnabled, setLiveChatEnabled] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Check if live chat is enabled for this panel
  useEffect(() => {
    const checkLiveChat = async () => {
      if (!panel?.id) return;
      
      try {
        const { data } = await supabase
          .from('panel_settings')
          .select('floating_chat_enabled')
          .eq('panel_id', panel.id)
          .single();
        
        setLiveChatEnabled(true);
      } catch (err) {
        console.log('Live chat check failed:', err);
      }
    };

    checkLiveChat();
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

  // Skip loading state - render immediately with defaults if still loading
  if (tenantLoading) {
    return null; // Let the theme render with defaults
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

      // ThemeOne is the default and recommended theme
      switch (selectedTheme) {
        case 'professional':
        case 'light_minimal':
        case 'corporate':
        case 'ocean_blue':
          return <ThemeTwo {...themeProps} />;
        case 'vibrant':
        case 'neon_glow':
        case 'sunset_orange':
        case 'royal_purple':
          return <ThemeThree {...themeProps} />;
        case 'grace':
        case 'grace_cometh':
        case 'forest_earth':
          return <ThemeFour {...themeProps} />;
        // ThemeOne is the default for all other cases
        case 'dark_gradient':
        case 'cosmic_purple':
        default:
          // ThemeOne is always the fallback/default theme
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

  return (
    <>
      <Helmet>
        <title>{(panel.settings as any)?.seo_title || `${panel.name} - SMM Panel`}</title>
        <meta name="description" content={(panel.settings as any)?.seo_description || `Professional social media marketing services from ${panel.name}`} />
        <meta name="keywords" content={(panel.settings as any)?.seo_keywords || 'social media marketing, instagram followers, youtube views'} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={(panel.settings as any)?.seo_title || `${panel.name} - SMM Panel`} />
        <meta property="og:description" content={(panel.settings as any)?.seo_description || `Professional social media marketing services`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        {panel.logo_url && <meta property="og:image" content={panel.logo_url} />}
      </Helmet>
      {renderTheme()}
      {/* Floating Chat Widget (WhatsApp/Telegram) */}
      <FloatingChatWidget panelId={panel?.id} />
      {/* Live Chat Widget */}
      {liveChatEnabled && panel?.id && (
        <LiveChatWidget 
          panelId={panel.id} 
          panelName={panel.name}
        />
      )}
    </>
  );
};

export default Storefront;
