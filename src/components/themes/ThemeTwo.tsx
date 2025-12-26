import { StorefrontNavigation } from "@/components/storefront/StorefrontNavigation";
import { StorefrontHeroSection } from "@/components/storefront/StorefrontHeroSection";
import { StorefrontPlatformSection } from "@/components/storefront/StorefrontPlatformSection";
import { StorefrontStatsSection } from "@/components/storefront/StorefrontStatsSection";
import { StorefrontFeaturesSection } from "@/components/storefront/StorefrontFeaturesSection";
import { StorefrontTestimonialsSection } from "@/components/storefront/StorefrontTestimonialsSection";
import { StorefrontFAQSection } from "@/components/storefront/StorefrontFAQSection";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";

interface ThemeTwoProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

export const ThemeTwo = ({ panel, services = [], customization = {} }: ThemeTwoProps) => {
  // Theme Two specific styling: Dark indigo/purple gradient theme
  const themeTwoCustomization = {
    ...customization,
    companyName: customization.companyName || panel?.name,
    logoUrl: customization.logoUrl || panel?.logo_url,
    // Dark indigo/purple color scheme
    primaryColor: customization.primaryColor || panel?.primary_color || '#6366F1',
    secondaryColor: customization.secondaryColor || '#A855F7',
    backgroundColor: customization.backgroundColor || '#0c0c1d',
    surfaceColor: customization.surfaceColor || '#1a1a2e',
    textColor: customization.textColor || '#FFFFFF',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeTwoCustomization.backgroundColor }}>
      {/* Navigation */}
      <StorefrontNavigation panel={panel} customization={themeTwoCustomization} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <StorefrontHeroSection 
          panel={panel} 
          services={services} 
          customization={themeTwoCustomization} 
        />

        {/* Platform Features Section */}
        {customization.enablePlatformFeatures !== false && (
          <StorefrontPlatformSection customization={themeTwoCustomization} />
        )}

        {/* Stats Section */}
        {customization.enableStats !== false && (
          <StorefrontStatsSection panel={panel} customization={themeTwoCustomization} />
        )}

        {/* Features Section */}
        {customization.enableFeatures !== false && (
          <StorefrontFeaturesSection customization={themeTwoCustomization} />
        )}

        {/* Testimonials Section */}
        {customization.enableTestimonials !== false && (
          <StorefrontTestimonialsSection customization={themeTwoCustomization} />
        )}

        {/* FAQ Section */}
        {customization.enableFAQs !== false && (
          <StorefrontFAQSection customization={themeTwoCustomization} />
        )}
      </main>

      {/* Footer */}
      <StorefrontFooter 
        panelName={themeTwoCustomization.companyName || panel?.name || 'SMM Panel'}
        footerAbout={themeTwoCustomization.footerAbout}
        footerText={themeTwoCustomization.footerText}
        socialPlatforms={themeTwoCustomization.socialPlatforms}
        primaryColor={themeTwoCustomization.primaryColor}
        variant="dark"
      />
    </div>
  );
};

export default ThemeTwo;
