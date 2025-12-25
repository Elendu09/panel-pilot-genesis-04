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

const Storefront = () => {
  const { panel, loading: tenantLoading, error: tenantError } = useTenant();
  const { services } = useTenantServices(panel?.id);
  const [liveChatEnabled, setLiveChatEnabled] = useState(false);

  // Check if live chat is enabled for this panel
  useEffect(() => {
    const checkLiveChat = async () => {
      if (!panel?.id) return;
      
      const { data } = await supabase
        .from('panel_settings')
        .select('floating_chat_enabled')
        .eq('panel_id', panel.id)
        .single();
      
      // If floating chat is NOT enabled (for WhatsApp/Telegram), enable live chat
      // This is a simple heuristic - in production you might have a separate setting
      setLiveChatEnabled(true); // Always enable live chat for now
    };

    checkLiveChat();
  }, [panel?.id]);

  const design = panel?.custom_branding || {};
  const themeType = panel?.theme_type || 'dark_gradient';
  const customBranding = panel?.custom_branding as any;
  const selectedTheme = customBranding?.selectedTheme || themeType;

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading panel...</p>
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

  const canonicalUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Render appropriate theme based on panel.theme_type or custom_branding.selectedTheme
  const renderTheme = () => {
    const themeProps = {
      panel,
      services,
      customization: design
    };

    switch (selectedTheme) {
      case 'dark_gradient':
      case 'ocean_blue':
      case 'forest_green':
        return <ThemeOne {...themeProps} />;
      case 'professional':
      case 'light_minimal':
      case 'corporate':
        return <ThemeTwo {...themeProps} />;
      case 'vibrant':
      case 'neon_glow':
      case 'sunset_orange':
      case 'royal_purple':
        return <ThemeThree {...themeProps} />;
      case 'grace':
      case 'grace_cometh':
        return <ThemeFour {...themeProps} />;
      default:
        return <ThemeOne {...themeProps} />;
    }
  };

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
      {/* Fast Order Section */}
      {services.length > 0 && panel && (
        <FastOrderSection 
          services={services} 
          panelId={panel.id} 
          panelName={panel.name} 
        />
      )}
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
