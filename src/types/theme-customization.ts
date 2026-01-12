// Comprehensive theme customization interface for all homepage themes
// This interface allows full design system integration with all buyer themes

// Mode-specific color palettes for light and dark modes
export interface ModeColorPalette {
  backgroundColor?: string;
  surfaceColor?: string;
  cardColor?: string;
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
}

export interface ThemeCustomization {
  // Branding
  logoUrl?: string;
  faviconUrl?: string;
  companyName?: string;
  tagline?: string;
  
  // Full Color Palette (shared/legacy - used as fallback)
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  cardColor?: string;
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  successColor?: string;
  warningColor?: string;
  infoColor?: string;
  errorColor?: string;
  
  // Mode-specific color palettes (NEW)
  lightModeColors?: ModeColorPalette;
  darkModeColors?: ModeColorPalette;
  
  // Typography
  fontFamily?: string;
  headingFont?: string;
  baseFontSize?: number;
  headingWeight?: string;
  bodyWeight?: string;
  lineHeight?: number;
  letterSpacing?: number;
  borderRadius?: string;
  
  // Spacing & Layout
  sectionPaddingY?: number;
  containerMaxWidth?: number;
  cardSpacing?: number;
  elementGap?: number;
  
  // Animations
  enableAnimations?: boolean;
  animationStyle?: 'fade' | 'slide' | 'scale' | 'none';
  animationDuration?: number;
  enableParallax?: boolean;
  hoverScale?: number;
  scrollReveal?: boolean;
  
  // Background
  backgroundPattern?: string;
  patternOpacity?: number;
  patternColor?: string;
  gradientAngle?: number;
  backgroundImageUrl?: string;
  backgroundOverlayOpacity?: number;
  enableBackgroundBlur?: boolean;
  
  // Button Styles
  buttonRadius?: number;
  buttonSize?: 'sm' | 'md' | 'lg';
  buttonHoverEffect?: 'glow' | 'scale' | 'slide' | 'none';
  buttonStyle?: 'solid' | 'outline' | 'ghost' | 'gradient';
  buttonShadow?: boolean;
  
  // Shadows & Effects
  shadowIntensity?: 'none' | 'light' | 'medium' | 'strong';
  cardRadius?: number;
  cardBorder?: boolean;
  glowEffects?: boolean;
  
  // Hero Section
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadgeText?: string;
  heroCTAText?: string;
  heroSecondaryCTAText?: string;
  heroAnimatedTexts?: string[];
  enableFastOrder?: boolean;
  
  // Section Toggles
  enablePlatformFeatures?: boolean;
  enableStats?: boolean;
  enableFeatures?: boolean;
  enableTestimonials?: boolean;
  enableFAQs?: boolean;
  
  // Section Content
  platformFeatures?: PlatformFeature[];
  stats?: StatItem[];
  featureCards?: FeatureCard[];
  testimonials?: Testimonial[];
  faqs?: FAQ[];
  
  // Footer
  enableFooter?: boolean;
  footerAbout?: string;
  footerText?: string;
  socialLinks?: SocialLinks;
  
  // Theme mode
  themeMode?: 'light' | 'dark';
  
  // Homepage layout order
  homepageLayout?: string[];
  showBlogInMenu?: boolean;
}

export interface PlatformFeature {
  title: string;
  description: string;
  icon: string;
  gradient?: string;
  color?: string;
}

export interface StatItem {
  icon?: string;
  value: string;
  label: string;
  gradient?: string;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: string;
  color?: string;
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
  avatar?: string;
  color?: string;
}

export interface FAQ {
  question: string;
  answer: string;
  icon?: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  telegram?: string;
  discord?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  whatsapp?: string;
}

// Default theme values for fallback
export const defaultThemeCustomization: Partial<ThemeCustomization> = {
  primaryColor: '#6366F1',
  secondaryColor: '#8B5CF6',
  accentColor: '#EC4899',
  backgroundColor: '#0F172A',
  surfaceColor: '#1E293B',
  cardColor: '#1E293B',
  textColor: '#FFFFFF',
  mutedColor: '#94A3B8',
  borderColor: '#334155',
  fontFamily: 'Inter',
  headingFont: 'Inter',
  baseFontSize: 16,
  headingWeight: '700',
  bodyWeight: '400',
  lineHeight: 1.6,
  letterSpacing: 0,
  borderRadius: '12',
  sectionPaddingY: 80,
  containerMaxWidth: 1280,
  cardSpacing: 24,
  elementGap: 16,
  enableAnimations: true,
  animationStyle: 'fade',
  animationDuration: 500,
  buttonRadius: 12,
  buttonSize: 'md',
  buttonHoverEffect: 'glow',
  buttonStyle: 'gradient',
  buttonShadow: true,
  shadowIntensity: 'medium',
  cardRadius: 16,
  glowEffects: true,
  enablePlatformFeatures: true,
  enableStats: true,
  enableFeatures: true,
  enableTestimonials: true,
  enableFAQs: true,
  // Mode-specific color defaults
  darkModeColors: {
    backgroundColor: '#0F172A',
    surfaceColor: '#1E293B',
    cardColor: '#1E293B',
    textColor: '#FFFFFF',
    mutedColor: '#94A3B8',
    borderColor: '#334155',
  },
  lightModeColors: {
    backgroundColor: '#FAFBFC',
    surfaceColor: '#FFFFFF',
    cardColor: '#FFFFFF',
    textColor: '#1F2937',
    mutedColor: '#6B7280',
    borderColor: '#E5E7EB',
  },
};
