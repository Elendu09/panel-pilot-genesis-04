import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTenant, useTenantServices } from '@/hooks/useTenant';
import { ThemeOne } from '@/components/themes/ThemeOne';
import { ThemeTwo } from '@/components/themes/ThemeTwo';
import { ThemeThree } from '@/components/themes/ThemeThree';

const Storefront = () => {
  const { panel, loading: tenantLoading, error: tenantError } = useTenant();
  const { services, loading: servicesLoading } = useTenantServices(panel?.id);

  const design = panel?.custom_branding || {};
  const themeType = panel?.theme_type || 'dark_gradient';

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

  // Render appropriate theme based on panel.theme_type
  const renderTheme = () => {
    const themeProps = {
      panel,
      services,
      customization: design
    };

    switch (themeType) {
      case 'dark_gradient':
        return <ThemeOne {...themeProps} />;
      case 'professional':
        return <ThemeTwo {...themeProps} />;
      case 'vibrant':
        return <ThemeThree {...themeProps} />;
      default:
        return <ThemeOne {...themeProps} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>{panel.settings?.seo_title || `${panel.name} - SMM Panel`}</title>
        <meta name="description" content={panel.settings?.seo_description || `Professional social media marketing services from ${panel.name}`} />
        <meta name="keywords" content={panel.settings?.seo_keywords || 'social media marketing, instagram followers, youtube views'} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={panel.settings?.seo_title || `${panel.name} - SMM Panel`} />
        <meta property="og:description" content={panel.settings?.seo_description || `Professional social media marketing services`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        {panel.logo_url && <meta property="og:image" content={panel.logo_url} />}
      </Helmet>
      {renderTheme()}
    </>
  );
};

export default Storefront;
