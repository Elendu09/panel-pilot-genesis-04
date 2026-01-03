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

interface ThemeTwoProps {
  panel?: any;
  services?: any[];
  customization?: any;
  isPreview?: boolean;
}

// Theme Two Color Palettes - Ocean Blue (Professional/Enhanced)
const darkPalette = {
  background: '#0A1628',
  surface: '#101D2E',
  primary: '#3B82F6',
  secondary: '#0EA5E9',
  accent: '#38BDF8',
  text: '#FFFFFF',
  textMuted: '#94A3B8',
  border: 'rgba(59, 130, 246, 0.25)',
  glow: 'rgba(59, 130, 246, 0.4)',
  gradient: 'linear-gradient(135deg, #3B82F6 0%, #0EA5E9 100%)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
};

const lightPalette = {
  background: '#F0F9FF',
  surface: '#FFFFFF',
  primary: '#2563EB',
  secondary: '#0284C7',
  accent: '#0369A1',
  text: '#0C4A6E',
  textMuted: '#475569',
  border: 'rgba(37, 99, 235, 0.15)',
  glow: 'rgba(37, 99, 235, 0.12)',
  gradient: 'linear-gradient(135deg, #2563EB 0%, #0284C7 100%)',
  cardBorder: 'rgba(0, 0, 0, 0.1)',
};

export const ThemeTwo = ({ panel, services = [], customization = {} }: ThemeTwoProps) => {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  
  useEffect(() => {
    const saved = localStorage.getItem('storefront-theme-mode');
    if (saved === 'light' || saved === 'dark') {
      setThemeMode(saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setThemeMode('light');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('storefront-theme-mode', themeMode);
    // Sync with document class for shadcn/tailwind components
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(themeMode);
  }, [themeMode]);

  const palette = themeMode === 'dark' ? darkPalette : lightPalette;

  const themeTwoCustomization = {
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
      --theme-primary: ${themeTwoCustomization.primaryColor};
      --theme-secondary: ${themeTwoCustomization.secondaryColor};
      --theme-background: ${themeTwoCustomization.backgroundColor};
      --theme-surface: ${themeTwoCustomization.surfaceColor};
      --theme-text: ${themeTwoCustomization.textColor};
      --theme-text-muted: ${themeTwoCustomization.textMuted};
      --theme-border: ${themeTwoCustomization.borderColor};
      --theme-glow: ${themeTwoCustomization.glowColor};
    }
  `;

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
            customization={themeTwoCustomization} 
          />
        );
      case 'platform':
        return customization.enablePlatformFeatures !== false ? (
          <StorefrontPlatformSection key="platform" customization={themeTwoCustomization} />
        ) : null;
      case 'stats':
        return customization.enableStats !== false ? (
          <StorefrontStatsSection key="stats" panel={panel} customization={themeTwoCustomization} />
        ) : null;
      case 'features':
        return customization.enableFeatures !== false ? (
          <StorefrontFeaturesSection key="features" customization={themeTwoCustomization} />
        ) : null;
      case 'testimonials':
        return customization.enableTestimonials !== false ? (
          <StorefrontTestimonialsSection key="testimonials" customization={themeTwoCustomization} />
        ) : null;
      case 'faqs':
        return customization.enableFAQs !== false ? (
          <StorefrontFAQSection key="faqs" customization={themeTwoCustomization} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        backgroundColor: themeTwoCustomization.backgroundColor,
        color: themeTwoCustomization.textColor 
      }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <style>{themeStyles}</style>
      
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Diagonal Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `linear-gradient(45deg, ${palette.border} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Floating Wave Effect */}
        <motion.div
          className="absolute top-0 right-0 w-full h-96"
          style={{ 
            background: `linear-gradient(180deg, ${palette.glow}, transparent)`,
          }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Animated Circles */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl"
          style={{ background: palette.glow }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 left-10 w-60 h-60 rounded-full blur-3xl"
          style={{ background: `${palette.secondary}30` }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </div>

      {/* Navigation - hidden in preview inside design customization */}
      {!customization?.isPreview && (
        <StorefrontNavigation panel={panel} customization={themeTwoCustomization} />
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {layout.map((sectionId) => renderSection(sectionId))}
      </main>

      {/* Footer */}
      <StorefrontFooter 
        panelName={themeTwoCustomization.companyName || panel?.name || 'SMM Panel'}
        footerAbout={themeTwoCustomization.footerAbout}
        footerText={themeTwoCustomization.footerText}
        socialPlatforms={themeTwoCustomization.socialPlatforms}
        primaryColor={themeTwoCustomization.primaryColor}
        variant={themeMode === 'dark' ? 'dark' : 'light'}
      />
    </motion.div>
  );
};

export default ThemeTwo;
