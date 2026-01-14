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

interface ThemeFourProps {
  panel?: any;
  services?: any[];
  customization?: any;
  isPreview?: boolean;
}

// Theme Four Color Palettes - Forest Earth (Natural/Enhanced)
const darkPalette = {
  background: '#0B1610',
  surface: '#111F16',
  primary: '#22C55E',
  secondary: '#84CC16',
  accent: '#4ADE80',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  border: 'rgba(34, 197, 94, 0.25)',
  glow: 'rgba(34, 197, 94, 0.4)',
  gradient: 'linear-gradient(135deg, #22C55E 0%, #84CC16 100%)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
};

const lightPalette = {
  background: '#F0FDF4',
  surface: '#FFFFFF',
  primary: '#16A34A',
  secondary: '#65A30D',
  accent: '#15803D',
  text: '#14532D',
  textMuted: '#4B5563',
  border: 'rgba(22, 163, 74, 0.15)',
  glow: 'rgba(22, 163, 74, 0.12)',
  gradient: 'linear-gradient(135deg, #16A34A 0%, #65A30D 100%)',
  cardBorder: 'rgba(0, 0, 0, 0.1)',
};

export const ThemeFour = ({ panel, services = [], customization = {}, isPreview = false }: ThemeFourProps) => {
  const passedThemeMode = customization?.themeMode as 'dark' | 'light' | undefined;
  const [internalThemeMode, setInternalThemeMode] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (passedThemeMode) return;
    const saved = localStorage.getItem('storefront-theme-mode');
    if (saved === 'light' || saved === 'dark') {
      setInternalThemeMode(saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setInternalThemeMode('light');
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

  const themeFourCustomization = {
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
    showBlogInMenu: customization.showBlogInMenu ?? panel?.blog_enabled,
  };

  const themeStyles = `
    :root {
      --theme-primary: ${themeFourCustomization.primaryColor};
      --theme-secondary: ${themeFourCustomization.secondaryColor};
      --theme-background: ${themeFourCustomization.backgroundColor};
      --theme-surface: ${themeFourCustomization.surfaceColor};
      --theme-text: ${themeFourCustomization.textColor};
      --theme-text-muted: ${themeFourCustomization.textMuted};
      --theme-border: ${themeFourCustomization.borderColor};
      --theme-glow: ${themeFourCustomization.glowColor};
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
            customization={themeFourCustomization}
          />
        );
      case 'platform':
        return customization.enablePlatformFeatures !== false ? (
          <StorefrontPlatformSection key="platform" customization={themeFourCustomization} />
        ) : null;
      case 'stats':
        return customization.enableStats !== false ? (
          <StorefrontStatsSection key="stats" panel={panel} customization={themeFourCustomization} />
        ) : null;
      case 'features':
        return customization.enableFeatures !== false ? (
          <StorefrontFeaturesSection key="features" customization={themeFourCustomization} />
        ) : null;
      case 'testimonials':
        return customization.enableTestimonials !== false ? (
          <StorefrontTestimonialsSection key="testimonials" customization={themeFourCustomization} />
        ) : null;
      case 'faqs':
        return customization.enableFAQs !== false ? (
          <StorefrontFAQSection key="faqs" customization={themeFourCustomization} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: themeFourCustomization.backgroundColor,
        color: themeFourCustomization.textColor,
      }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <style>{themeStyles}</style>

      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Nature-inspired Gradients */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1/2"
          style={{
            background: `linear-gradient(180deg, ${palette.glow}, transparent)`,
          }}
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Organic Blob Shapes */}
        <motion.div
          className="absolute top-1/4 right-10 w-80 h-80 rounded-full blur-3xl"
          style={{ background: palette.glow }}
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-64 h-64 rounded-full blur-3xl"
          style={{ background: `${palette.secondary}30` }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* Leaf-like Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(135deg, ${palette.border} 25%, transparent 25%), 
                              linear-gradient(225deg, ${palette.border} 25%, transparent 25%)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Navigation */}
      {!isPreview && <StorefrontNavigation panel={panel} customization={themeFourCustomization} />}

      {/* Main Content */}
      <main className="relative z-10">{layout.map((sectionId) => renderSection(sectionId))}</main>

      {/* Footer */}
      <StorefrontFooter
        panelName={themeFourCustomization.companyName || panel?.name || 'SMM Panel'}
        footerAbout={themeFourCustomization.footerAbout}
        footerText={themeFourCustomization.footerText}
        socialPlatforms={themeFourCustomization.socialPlatforms}
        primaryColor={themeFourCustomization.primaryColor}
        variant={themeMode === 'dark' ? 'dark' : 'light'}
      />
    </motion.div>
  );
};

export default ThemeFour;
