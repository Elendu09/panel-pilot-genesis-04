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
}

// Theme One Color Palettes - Cosmic Purple
const darkPalette = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  primary: '#8B5CF6',
  secondary: '#EC4899',
  text: '#FFFFFF',
  textMuted: '#A1A1AA',
  border: 'rgba(139, 92, 246, 0.2)',
  glow: 'rgba(139, 92, 246, 0.4)',
};

const lightPalette = {
  background: '#FAF8FF',
  surface: '#FFFFFF',
  primary: '#7C3AED',
  secondary: '#DB2777',
  text: '#1E1B4B',
  textMuted: '#6B7280',
  border: 'rgba(124, 58, 237, 0.15)',
  glow: 'rgba(124, 58, 237, 0.2)',
};

export const ThemeOne = ({ panel, services = [], customization = {} }: ThemeOneProps) => {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  
  // Detect system preference or use saved preference
  useEffect(() => {
    const saved = localStorage.getItem('storefront-theme-mode');
    if (saved === 'light' || saved === 'dark') {
      setThemeMode(saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setThemeMode('light');
    }
  }, []);

  // Save preference when changed
  useEffect(() => {
    localStorage.setItem('storefront-theme-mode', themeMode);
  }, [themeMode]);

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
    textColor: palette.text,
    textMuted: palette.textMuted,
    borderColor: palette.border,
    glowColor: palette.glow,
    themeMode,
    setThemeMode,
  };

  // Inject CSS variables for the theme
  const themeStyles = `
    :root {
      --theme-primary: ${mergedCustomization.primaryColor};
      --theme-secondary: ${mergedCustomization.secondaryColor};
      --theme-background: ${mergedCustomization.backgroundColor};
      --theme-surface: ${mergedCustomization.surfaceColor};
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
          className="absolute inset-0 bg-grid-pattern opacity-30"
          style={{ 
            backgroundImage: `linear-gradient(${palette.border} 1px, transparent 1px), linear-gradient(90deg, ${palette.border} 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${palette.glow}, transparent 70%)` }}
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${mergedCustomization.secondaryColor}30, transparent 70%)` }}
          animate={{
            x: [0, 30, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${palette.primary}20, transparent 70%)` }}
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      {/* Navigation */}
      <StorefrontNavigation panel={panel} customization={mergedCustomization} />

      {/* Main Content */}
      <main className="relative z-10">
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
        variant={themeMode === 'dark' ? 'dark' : 'light'}
      />
    </motion.div>
  );
};

export default ThemeOne;
