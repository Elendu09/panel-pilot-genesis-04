import { StorefrontNavigation } from "@/components/storefront/StorefrontNavigation";
import { StorefrontHeroSection } from "@/components/storefront/StorefrontHeroSection";
import { StorefrontPlatformSection } from "@/components/storefront/StorefrontPlatformSection";
import { StorefrontStatsSection } from "@/components/storefront/StorefrontStatsSection";
import { StorefrontFeaturesSection } from "@/components/storefront/StorefrontFeaturesSection";
import { StorefrontTestimonialsSection } from "@/components/storefront/StorefrontTestimonialsSection";
import { StorefrontFAQSection } from "@/components/storefront/StorefrontFAQSection";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";

interface ThemeOneProps {
  panel?: any;
  services?: any[];
  customization?: any;
}

export const ThemeOne = ({ panel, services = [], customization = {} }: ThemeOneProps) => {
  // Merge panel data with customization
  const mergedCustomization = {
    ...customization,
    companyName: customization.companyName || panel?.name,
    logoUrl: customization.logoUrl || panel?.logo_url,
    primaryColor: customization.primaryColor || panel?.primary_color || '#8B5CF6',
    secondaryColor: customization.secondaryColor || panel?.secondary_color || '#EC4899',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <StorefrontNavigation panel={panel} customization={mergedCustomization} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <StorefrontHeroSection 
          panel={panel} 
          services={services} 
          customization={mergedCustomization} 
        />

        {/* Platform Features Section */}
        {customization.enablePlatformFeatures !== false && (
          <StorefrontPlatformSection customization={mergedCustomization} />
        )}

        {/* Stats Section */}
        {customization.enableStats !== false && (
          <StorefrontStatsSection panel={panel} customization={mergedCustomization} />
        )}

        {/* Features Section */}
        {customization.enableFeatures !== false && (
          <StorefrontFeaturesSection customization={mergedCustomization} />
        )}

        {/* Testimonials Section */}
        {customization.enableTestimonials !== false && (
          <StorefrontTestimonialsSection customization={mergedCustomization} />
        )}

      {/* FAQ Section */}
      {customization.enableFAQs !== false && (
        <StorefrontFAQSection customization={mergedCustomization} />
      )}
    </main>

    {/* Footer */}
    <StorefrontFooter 
      panelName={mergedCustomization.companyName || panel?.name || 'SMM Panel'}
      footerAbout={mergedCustomization.footerAbout}
      footerText={mergedCustomization.footerText}
      socialPlatforms={mergedCustomization.socialPlatforms}
      primaryColor={mergedCustomization.primaryColor}
      variant="dark"
    />
    </div>
  );
};

export default ThemeOne;
