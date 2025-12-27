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
}

// Theme Two Color Palettes - Ocean Blue (Professional)
const darkPalette = {
  background: '#0C1929',
  surface: '#152238',
  primary: '#3B82F6',
  secondary: '#06B6D4',
  text: '#FFFFFF',
  textMuted: '#94A3B8',
  border: 'rgba(59, 130, 246, 0.2)',
  glow: 'rgba(59, 130, 246, 0.3)',
};

const lightPalette = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  primary: '#2563EB',
  secondary: '#0891B2',
  text: '#1E3A5F',
  textMuted: '#64748B',
  border: 'rgba(37, 99, 235, 0.12)',
  glow: 'rgba(37, 99, 235, 0.15)',
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

      {/* Navigation */}
      <StorefrontNavigation panel={panel} customization={themeTwoCustomization} />

      {/* Main Content */}
      <main className="relative z-10">
        <StorefrontHeroSection 
          panel={panel} 
          services={services} 
          customization={themeTwoCustomization} 
        />

        {customization.enablePlatformFeatures !== false && (
          <StorefrontPlatformSection customization={themeTwoCustomization} />
        )}

        {customization.enableStats !== false && (
          <StorefrontStatsSection panel={panel} customization={themeTwoCustomization} />
        )}

        {customization.enableFeatures !== false && (
          <StorefrontFeaturesSection customization={themeTwoCustomization} />
        )}

        {customization.enableTestimonials !== false && (
          <StorefrontTestimonialsSection customization={themeTwoCustomization} />
        )}

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
        variant={themeMode === 'dark' ? 'dark' : 'light'}
      />
    </motion.div>
  );
};

export default ThemeTwo;
