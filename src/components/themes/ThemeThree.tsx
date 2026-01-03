import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  isPreview?: boolean;
}

// Theme Three Color Palettes - Sunset Orange (Vibrant/Enhanced)
const darkPalette = {
  background: '#18120E',
  surface: '#231A14',
  primary: '#F97316',
  secondary: '#FBBF24',
  accent: '#FB923C',
  text: '#FFFFFF',
  textMuted: '#A8A29E',
  border: 'rgba(249, 115, 22, 0.3)',
  glow: 'rgba(249, 115, 22, 0.45)',
  gradient: 'linear-gradient(135deg, #F97316 0%, #FBBF24 100%)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
};

const lightPalette = {
  background: '#FFFCF5',
  surface: '#FFFFFF',
  primary: '#EA580C',
  secondary: '#D97706',
  accent: '#C2410C',
  text: '#431407',
  textMuted: '#57534E',
  border: 'rgba(234, 88, 12, 0.15)',
  glow: 'rgba(234, 88, 12, 0.15)',
  gradient: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
  cardBorder: 'rgba(0, 0, 0, 0.1)',
};

export const ThemeThree = ({ panel, services = [], customization = {}, isPreview = false }: ThemeThreeProps) => {
  const passedThemeMode = customization?.themeMode as 'dark' | 'light' | undefined;
  const [internalThemeMode, setInternalThemeMode] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    if (passedThemeMode) return;
    const saved = localStorage.getItem('storefront-theme-mode');
    if (saved === 'light' || saved === 'dark') {
      setInternalThemeMode(saved);
    }
  }, [passedThemeMode]);

  const themeMode = passedThemeMode || internalThemeMode;
  const setThemeMode = passedThemeMode ? undefined : setInternalThemeMode;

  useEffect(() => {
    if (passedThemeMode) return;
    localStorage.setItem('storefront-theme-mode', internalThemeMode);
    // Sync with document class for shadcn/tailwind components
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(internalThemeMode);
  }, [internalThemeMode, passedThemeMode]);

  const palette = themeMode === 'dark' ? darkPalette : lightPalette;

  const themeThreeCustomization = {
    ...customization,
    companyName: customization.companyName || panel?.name,
    logoUrl: customization.logoUrl || panel?.logo_url,
    primaryColor: customization.primaryColor || panel?.primary_color || palette.primary,
    secondaryColor: customization.secondaryColor || palette.secondary,
    backgroundColor: palette.background,
    surfaceColor: palette.surface,
    textColor: palette.text,
    textMuted: palette.textMuted,
    borderColor: palette.border,
    glowColor: palette.glow,
    themeMode,
    setThemeMode,
  };

  const themeStyles = `
    :root {
      --theme-primary: ${themeThreeCustomization.primaryColor};
      --theme-secondary: ${themeThreeCustomization.secondaryColor};
      --theme-background: ${themeThreeCustomization.backgroundColor};
      --theme-surface: ${themeThreeCustomization.surfaceColor};
      --theme-text: ${themeThreeCustomization.textColor};
      --theme-text-muted: ${themeThreeCustomization.textMuted};
      --theme-border: ${themeThreeCustomization.borderColor};
      --theme-glow: ${themeThreeCustomization.glowColor};
    }
  `;

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const layout = (customization?.homepageLayout && customization.homepageLayout.length
    ? customization.homepageLayout
    : ['hero', 'platform', 'stats', 'features', 'testimonials', 'faqs']);

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return (
          <StorefrontHeroSection
            key="hero"
            panel={panel}
            services={services}
            customization={themeThreeCustomization}
          />
        );
      case 'platform':
        return customization.enablePlatformFeatures !== false ? (
          <StorefrontPlatformSection key="platform" customization={themeThreeCustomization} />
        ) : null;
      case 'stats':
        return customization.enableStats !== false ? (
          <StorefrontStatsSection key="stats" panel={panel} customization={themeThreeCustomization} />
        ) : null;
      case 'features':
        return customization.enableFeatures !== false ? (
          <StorefrontFeaturesSection key="features" customization={themeThreeCustomization} />
        ) : null;
      case 'testimonials':
        return customization.enableTestimonials !== false ? (
          <StorefrontTestimonialsSection key="testimonials" customization={themeThreeCustomization} />
        ) : null;
      case 'faqs':
        return customization.enableFAQs !== false ? (
          <StorefrontFAQSection key="faqs" customization={themeThreeCustomization} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: themeThreeCustomization.backgroundColor,
        color: themeThreeCustomization.textColor,
      }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <style>{themeStyles}</style>

      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Warm Radial Gradients */}
        <motion.div
          className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${palette.glow}, transparent 60%)` }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${palette.secondary}25, transparent 60%)` }}
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Subtle Dots Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, ${palette.primary} 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      {/* Navigation */}
      {!isPreview && <StorefrontNavigation panel={panel} customization={themeThreeCustomization} />}

      {/* Main Content */}
      <main className="relative z-10">{layout.map((sectionId) => renderSection(sectionId))}</main>

      {/* Footer */}
      <StorefrontFooter
        panelName={themeThreeCustomization.companyName || panel?.name || 'SMM Panel'}
        footerAbout={themeThreeCustomization.footerAbout}
        footerText={themeThreeCustomization.footerText}
        socialPlatforms={themeThreeCustomization.socialPlatforms}
        primaryColor={themeThreeCustomization.primaryColor}
        variant={themeMode === 'dark' ? 'dark' : 'light'}
      />
    </motion.div>
  );
};

export default ThemeThree;
