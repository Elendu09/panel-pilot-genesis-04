import { StorefrontNavigation } from "@/components/storefront/StorefrontNavigation";
import { StorefrontHeroSection } from "@/components/storefront/StorefrontHeroSection";
import { StorefrontPlatformSection } from "@/components/storefront/StorefrontPlatformSection";
import { StorefrontStatsSection } from "@/components/storefront/StorefrontStatsSection";
import { StorefrontFeaturesSection } from "@/components/storefront/StorefrontFeaturesSection";
import { StorefrontTestimonialsSection } from "@/components/storefront/StorefrontTestimonialsSection";
import { StorefrontFAQSection } from "@/components/storefront/StorefrontFAQSection";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";

interface ThemeThreeProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

export const ThemeThree = ({ panel, services = [], customization = {} }: ThemeThreeProps) => {
  // Theme Three specific styling: Light orange/amber warm theme
  const themeThreeCustomization = {
    ...customization,
    companyName: customization.companyName || panel?.name,
    logoUrl: customization.logoUrl || panel?.logo_url,
    // Light orange/amber color scheme
    primaryColor: customization.primaryColor || panel?.primary_color || '#F97316',
    secondaryColor: customization.secondaryColor || '#F59E0B',
    backgroundColor: customization.backgroundColor || '#FFF7ED',
    surfaceColor: customization.surfaceColor || '#FFFFFF',
    textColor: customization.textColor || '#1F2937',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeThreeCustomization.backgroundColor }}>
      {/* Navigation */}
      <StorefrontNavigation panel={panel} customization={themeThreeCustomization} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <StorefrontHeroSection 
          panel={panel} 
          services={services} 
          customization={themeThreeCustomization} 
        />

        {/* Platform Features Section */}
        {customization.enablePlatformFeatures !== false && (
          <StorefrontPlatformSection customization={themeThreeCustomization} />
        )}

        {/* Stats Section */}
        {customization.enableStats !== false && (
          <StorefrontStatsSection panel={panel} customization={themeThreeCustomization} />
        )}

        {/* Features Section */}
        {customization.enableFeatures !== false && (
          <StorefrontFeaturesSection customization={themeThreeCustomization} />
        )}

        {/* Testimonials Section */}
        {customization.enableTestimonials !== false && (
          <StorefrontTestimonialsSection customization={themeThreeCustomization} />
        )}

        {/* FAQ Section */}
        {customization.enableFAQs !== false && (
          <StorefrontFAQSection customization={themeThreeCustomization} />
        )}
      </main>

      {/* Footer */}
      <StorefrontFooter 
        panelName={themeThreeCustomization.companyName || panel?.name || 'SMM Panel'}
        footerAbout={themeThreeCustomization.footerAbout}
        footerText={themeThreeCustomization.footerText}
        socialPlatforms={themeThreeCustomization.socialPlatforms}
        primaryColor={themeThreeCustomization.primaryColor}
        variant="light"
      />
    </div>
  );
};

export default ThemeThree;
