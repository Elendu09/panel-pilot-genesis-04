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

interface ThemeOneProps {
  panel?: any;
  services?: any[];
  customization?: any;
  isPreview?: boolean;
}

// Theme One Color Palettes - Cosmic Purple (Enhanced for better contrast)
const darkPalette = {
  background: '#0A0A12',
  surface: '#12121F',
  card: '#1A1A2E',
  primary: '#8B5CF6',
  secondary: '#EC4899',
  accent: '#A855F7',
  text: '#FFFFFF',
  textMuted: '#A1A1AA',
  border: 'rgba(139, 92, 246, 0.25)',
  glow: 'rgba(139, 92, 246, 0.5)',
  gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
};

const lightPalette = {
  background: '#F8F7FF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  primary: '#7C3AED',
  secondary: '#DB2777',
  accent: '#9333EA',
  text: '#1F2937',
  textMuted: '#4B5563',
  border: 'rgba(124, 58, 237, 0.15)',
  glow: 'rgba(124, 58, 237, 0.12)',
  gradient: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
  cardBorder: 'rgba(0, 0, 0, 0.1)',
};

export const ThemeOne = ({ panel, services = [], customization = {}, isPreview = false }: ThemeOneProps) => {
  // Use passed themeMode if in preview mode, otherwise use internal state
  const passedThemeMode = customization?.themeMode;
  const [internalThemeMode, setInternalThemeMode] = useState<'dark' | 'light'>('dark');
  
  // Detect system preference or use saved preference (only for non-preview)
  useEffect(() => {
    if (passedThemeMode) return; // Skip if preview mode controls theme
    const saved = localStorage.getItem('storefront-theme-mode');
    if (saved === 'light' || saved === 'dark') {
      setInternalThemeMode(saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setInternalThemeMode('light');
    }
  }, [passedThemeMode]);

  // Use passed theme mode (preview) or internal state (live)
  const themeMode = passedThemeMode || internalThemeMode;
  const setThemeMode = passedThemeMode ? undefined : setInternalThemeMode;

  // Save preference when changed + sync with document class (only for non-preview)
  useEffect(() => {
    if (passedThemeMode) return; // Don't save or sync classes in preview mode
    localStorage.setItem('storefront-theme-mode', internalThemeMode);
    // Sync with document class for shadcn/tailwind components
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(internalThemeMode);
  }, [internalThemeMode, passedThemeMode]);

  const palette = themeMode === 'dark' ? darkPalette : lightPalette;

  // Merge panel data with customization
  const mergedCustomization = {
    ...customization,
    companyName: customization.companyName || panel?.name,
    logoUrl: customization.logoUrl || panel?.logo_url,
    primaryColor: customization.primaryColor || panel?.primary_color || palette.primary,
    secondaryColor: customization.secondaryColor || panel?.secondary_color || palette.secondary,
    backgroundColor: palette.background,
    surfaceColor: palette.surface,
    cardColor: palette.card,
    textColor: palette.text,
    textMuted: palette.textMuted,
    borderColor: palette.border,
    glowColor: palette.glow,
    themeMode,
    setThemeMode,
  } as any;

  // Ensure layout variants are always available
  mergedCustomization.heroVariant = mergedCustomization.heroVariant || customization.heroVariant || 'ali_panel';
  mergedCustomization.faqVariant = mergedCustomization.faqVariant || customization.faqVariant || 'glass_cards';
  mergedCustomization.navVariant = mergedCustomization.navVariant || customization.navVariant || 'floating_glass';
  mergedCustomization.footerVariant = mergedCustomization.footerVariant || customization.footerVariant || 'classic_columns';
  // Inject CSS variables for the theme
  const themeStyles = `
    :root {
      --theme-primary: ${mergedCustomization.primaryColor};
      --theme-secondary: ${mergedCustomization.secondaryColor};
      --theme-background: ${mergedCustomization.backgroundColor};
      --theme-surface: ${mergedCustomization.surfaceColor};
      --theme-card: ${mergedCustomization.cardColor};
      --theme-text: ${mergedCustomization.textColor};
      --theme-text-muted: ${mergedCustomization.textMuted};
      --theme-border: ${mergedCustomization.borderColor};
      --theme-glow: ${mergedCustomization.glowColor};
    }
  `;

  // Animation variants for page transition
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
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
            customization={mergedCustomization} 
          />
        );
      case 'platform':
        return customization.enablePlatformFeatures !== false ? (
          <StorefrontPlatformSection key="platform" customization={mergedCustomization} />
        ) : null;
      case 'stats':
        return customization.enableStats !== false ? (
          <StorefrontStatsSection key="stats" panel={panel} customization={mergedCustomization} />
        ) : null;
      case 'features':
        return customization.enableFeatures !== false ? (
          <StorefrontFeaturesSection key="features" customization={mergedCustomization} />
        ) : null;
      case 'testimonials':
        return customization.enableTestimonials !== false ? (
          <StorefrontTestimonialsSection key="testimonials" customization={mergedCustomization} />
        ) : null;
      case 'faqs':
        return customization.enableFAQs !== false ? (
          <StorefrontFAQSection key="faqs" customization={mergedCustomization} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        backgroundColor: mergedCustomization.backgroundColor,
        color: mergedCustomization.textColor 
      }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <style>{themeStyles}</style>
      
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 bg-grid-pattern"
          style={{ 
            backgroundImage: `linear-gradient(${palette.border} 1px, transparent 1px), linear-gradient(90deg, ${palette.border} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            opacity: themeMode === 'dark' ? 0.3 : 0.5
          }}
        />
        
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{ 
            background: `radial-gradient(circle, ${palette.glow}, transparent 70%)`,
            opacity: themeMode === 'dark' ? 1 : 0.6
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ 
            background: `radial-gradient(circle, ${mergedCustomization.secondaryColor}30, transparent 70%)`,
            opacity: themeMode === 'dark' ? 1 : 0.5
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ 
            background: `radial-gradient(circle, ${palette.primary}20, transparent 70%)`,
            opacity: themeMode === 'dark' ? 1 : 0.4
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      {/* Navigation - Hidden in preview mode */}
      {!isPreview && <StorefrontNavigation panel={panel} customization={mergedCustomization} />}

      {/* Main Content */}
      <main className="relative z-10">
        {layout.map((sectionId) => renderSection(sectionId))}
      </main>

      {/* Footer */}
      <StorefrontFooter 
        panelName={mergedCustomization.companyName || panel?.name || 'SMM Panel'}
        footerAbout={mergedCustomization.footerAbout}
        footerText={mergedCustomization.footerText}
        socialPlatforms={mergedCustomization.socialPlatforms}
        primaryColor={mergedCustomization.primaryColor}
        variant={themeMode === 'dark' ? 'dark' : 'light'}
      />
    </motion.div>
  );
};

export default ThemeOne;