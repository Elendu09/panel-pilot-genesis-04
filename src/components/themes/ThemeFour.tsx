import { StorefrontNavigation } from "@/components/storefront/StorefrontNavigation";
import { StorefrontHeroSection } from "@/components/storefront/StorefrontHeroSection";
import { StorefrontPlatformSection } from "@/components/storefront/StorefrontPlatformSection";
import { StorefrontStatsSection } from "@/components/storefront/StorefrontStatsSection";
import { StorefrontFeaturesSection } from "@/components/storefront/StorefrontFeaturesSection";
import { StorefrontTestimonialsSection } from "@/components/storefront/StorefrontTestimonialsSection";
import { StorefrontFAQSection } from "@/components/storefront/StorefrontFAQSection";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";

interface ThemeFourProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

export const ThemeFour = ({ panel, services = [], customization = {} }: ThemeFourProps) => {
  // Theme Four specific styling: Brown/amber warm earthy theme
  const themeFourCustomization = {
    ...customization,
    companyName: customization.companyName || panel?.name,
    logoUrl: customization.logoUrl || panel?.logo_url,
    // Brown/amber earthy color scheme
    primaryColor: customization.primaryColor || panel?.primary_color || '#6B4226',
    secondaryColor: customization.secondaryColor || '#F59E0B',
    backgroundColor: customization.backgroundColor || '#5D3A1A',
    surfaceColor: customization.surfaceColor || '#4A2E15',
    textColor: customization.textColor || '#FFFFFF',
  };

  // Inject CSS variables for the theme
  const themeStyles = `
    :root {
      --theme-primary: ${themeFourCustomization.primaryColor};
      --theme-secondary: ${themeFourCustomization.secondaryColor};
      --theme-background: ${themeFourCustomization.backgroundColor};
      --theme-text: ${themeFourCustomization.textColor};
    }
  `;

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        backgroundColor: themeFourCustomization.backgroundColor,
        color: themeFourCustomization.textColor 
      }}
    >
      <style>{themeStyles}</style>
      {/* Navigation */}
      <StorefrontNavigation panel={panel} customization={themeFourCustomization} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <StorefrontHeroSection 
          panel={panel} 
          services={services} 
          customization={themeFourCustomization} 
        />

        {/* Platform Features Section */}
        {customization.enablePlatformFeatures !== false && (
          <StorefrontPlatformSection customization={themeFourCustomization} />
        )}

        {/* Stats Section */}
        {customization.enableStats !== false && (
          <StorefrontStatsSection panel={panel} customization={themeFourCustomization} />
        )}

        {/* Features Section */}
        {customization.enableFeatures !== false && (
          <StorefrontFeaturesSection customization={themeFourCustomization} />
        )}

        {/* Testimonials Section */}
        {customization.enableTestimonials !== false && (
          <StorefrontTestimonialsSection customization={themeFourCustomization} />
        )}

        {/* FAQ Section */}
        {customization.enableFAQs !== false && (
          <StorefrontFAQSection customization={themeFourCustomization} />
        )}
      </main>

      {/* Footer */}
      <StorefrontFooter 
        panelName={themeFourCustomization.companyName || panel?.name || 'SMM Panel'}
        footerAbout={themeFourCustomization.footerAbout}
        footerText={themeFourCustomization.footerText}
        socialPlatforms={themeFourCustomization.socialPlatforms}
        primaryColor={themeFourCustomization.primaryColor}
        variant="dark"
      />
    </div>
  );
};

export default ThemeFour;
