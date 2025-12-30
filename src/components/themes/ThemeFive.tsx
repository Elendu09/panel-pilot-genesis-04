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

interface ThemeFiveProps {
  panel?: any;
  services?: any[];
  customization?: any;
  isPreview?: boolean;
}

// Theme Five - Tech Futuristic (TGREF-inspired)
const darkPalette = {
  background: '#0F1419',
  surface: '#1A2027',
  card: '#1E252D',
  primary: '#00D4FF',
  secondary: '#7C3AED',
  accent: '#00D4FF',
  text: '#FFFFFF',
  textMuted: '#8B949E',
  border: 'rgba(0, 212, 255, 0.2)',
  glow: 'rgba(0, 212, 255, 0.4)',
  gradient: 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
};

const lightPalette = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  primary: '#0891B2',
  secondary: '#7C3AED',
  accent: '#0891B2',
  text: '#0F172A',
  textMuted: '#64748B',
  border: 'rgba(8, 145, 178, 0.15)',
  glow: 'rgba(8, 145, 178, 0.12)',
  gradient: 'linear-gradient(135deg, #0891B2 0%, #7C3AED 100%)',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
};

export const ThemeFive = ({ panel, services = [], customization = {}, isPreview = false }: ThemeFiveProps) => {
  const passedThemeMode = customization?.themeMode;
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
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(internalThemeMode);
  }, [internalThemeMode, passedThemeMode]);

  const palette = themeMode === 'dark' ? darkPalette : lightPalette;

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
    // Theme Five specific variants
    heroVariant: 'tech_futuristic',
    navVariant: 'floating_glass',
    faqVariant: 'glass_cards',
    footerVariant: 'tech_modern',
  } as any;

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
      
      {/* Tech-inspired Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `
              linear-gradient(${palette.border} 1px, transparent 1px),
              linear-gradient(90deg, ${palette.border} 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            opacity: themeMode === 'dark' ? 0.3 : 0.5
          }}
        />
        
        {/* Animated Cyan Glow - Top Right */}
        <motion.div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ 
            background: `radial-gradient(circle, ${palette.primary}40, transparent 70%)`,
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Purple Accent Glow - Left Side */}
        <motion.div
          className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ 
            background: `radial-gradient(circle, ${palette.secondary}30, transparent 70%)`,
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        
        {/* Bottom Cyan Accent */}
        <motion.div
          className="absolute bottom-0 left-1/3 w-[600px] h-[300px] rounded-full blur-[80px]"
          style={{ 
            background: `radial-gradient(ellipse, ${palette.primary}20, transparent 70%)`,
          }}
          animate={{
            x: [0, -30, 0],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />

        {/* Scan Lines Effect (Subtle) */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${palette.text} 2px,
              ${palette.text} 4px
            )`
          }}
        />
      </div>

      {/* Navigation */}
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

export default ThemeFive;
