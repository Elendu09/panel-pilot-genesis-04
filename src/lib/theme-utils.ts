// Theme utility functions for generating dynamic styles from customization
import { ThemeCustomization, ModeColorPalette } from '@/types/theme-customization';
import { 
  Zap, Shield, Users, Star, Clock, Globe, Award, TrendingUp, 
  CheckCircle, Heart, DollarSign, BarChart3, Sparkles, Rocket,
  Instagram, Youtube, Twitter, Facebook, MessageCircle, Music, Video, Camera,
  Terminal, Flame, ThumbsUp, Eye, UserPlus, Cpu, Play, Headphones,
  ShoppingCart, CreditCard, Linkedin, Send
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Icon name to component mapping
const iconMap: Record<string, LucideIcon> = {
  Zap, Shield, Users, Star, Clock, Globe, Award, TrendingUp,
  CheckCircle, Heart, DollarSign, BarChart3, Sparkles, Rocket,
  Instagram, Youtube, Twitter, Facebook, MessageCircle, Music, Video, Camera,
  Terminal, Flame, ThumbsUp, Eye, UserPlus, Cpu, Play, Headphones,
  ShoppingCart, CreditCard, Linkedin, Send
};

// Get Lucide icon component by name
export const getLucideIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Star;
};

// Generate animation variants for framer-motion based on settings
export const getAnimationVariants = (customization: ThemeCustomization) => {
  const duration = (customization.animationDuration || 500) / 1000;
  const style = customization.animationStyle || 'fade';
  
  if (!customization.enableAnimations || style === 'none') {
    return {
      initial: {},
      animate: {},
      exit: {},
    };
  }

  switch (style) {
    case 'slide':
      return {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0, transition: { duration } },
        exit: { opacity: 0, y: -30, transition: { duration: duration * 0.5 } },
      };
    case 'scale':
      return {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1, transition: { duration } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: duration * 0.5 } },
      };
    case 'fade':
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration } },
        exit: { opacity: 0, transition: { duration: duration * 0.5 } },
      };
  }
};

// Generate container animation variants with stagger
export const getContainerVariants = (customization: ThemeCustomization) => {
  const duration = (customization.animationDuration || 500) / 1000;
  
  if (!customization.enableAnimations) {
    return {
      hidden: {},
      visible: {},
    };
  }

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: duration * 0.2,
      },
    },
  };
};

// Generate item animation variants for staggered children
export const getItemVariants = (customization: ThemeCustomization) => {
  const duration = (customization.animationDuration || 500) / 1000;
  const style = customization.animationStyle || 'fade';
  
  if (!customization.enableAnimations || style === 'none') {
    return {
      hidden: {},
      visible: {},
    };
  }

  switch (style) {
    case 'slide':
      return {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration } },
      };
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration } },
      };
    case 'fade':
    default:
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration } },
      };
  }
};

// Generate button styles based on customization
export const getButtonStyles = (customization: ThemeCustomization, variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  const primary = customization.primaryColor || '#6366F1';
  const secondary = customization.secondaryColor || '#8B5CF6';
  const radius = customization.buttonRadius || 12;
  const style = customization.buttonStyle || 'gradient';
  const shadow = customization.buttonShadow !== false;
  const hoverEffect = customization.buttonHoverEffect || 'glow';

  const baseBorderRadius = `${radius}px`;
  
  let baseStyles: React.CSSProperties = {
    borderRadius: baseBorderRadius,
  };

  if (variant === 'primary') {
    if (style === 'gradient') {
      baseStyles.background = `linear-gradient(to right, ${primary}, ${secondary})`;
      baseStyles.color = '#FFFFFF';
      baseStyles.border = 'none';
    } else if (style === 'solid') {
      baseStyles.backgroundColor = primary;
      baseStyles.color = '#FFFFFF';
      baseStyles.border = 'none';
    } else if (style === 'outline') {
      baseStyles.backgroundColor = 'transparent';
      baseStyles.color = primary;
      baseStyles.border = `2px solid ${primary}`;
    }

    if (shadow && hoverEffect === 'glow') {
      baseStyles.boxShadow = `0 10px 30px -5px ${primary}4d`;
    }
  } else if (variant === 'outline') {
    baseStyles.backgroundColor = 'transparent';
    baseStyles.color = primary;
    baseStyles.border = `2px solid ${primary}4d`;
  }

  return baseStyles;
};

// Generate background styles based on customization
export const getBackgroundStyles = (customization: ThemeCustomization) => {
  const bgColor = customization.backgroundColor || '#0F172A';
  const pattern = customization.backgroundPattern || 'none';
  const patternOpacity = customization.patternOpacity || 0.03;
  const patternColor = customization.patternColor || customization.primaryColor || '#6366F1';
  const gradientAngle = customization.gradientAngle || 180;

  let backgroundImage = 'none';
  
  if (pattern === 'grid') {
    backgroundImage = `
      linear-gradient(${patternColor}${Math.round(patternOpacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px),
      linear-gradient(90deg, ${patternColor}${Math.round(patternOpacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px)
    `;
  } else if (pattern === 'dots') {
    backgroundImage = `radial-gradient(${patternColor}${Math.round(patternOpacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px)`;
  } else if (pattern === 'radial') {
    backgroundImage = `radial-gradient(circle at center, ${patternColor}26 0%, transparent 50%)`;
  }

  return {
    backgroundColor: bgColor,
    backgroundImage,
    backgroundSize: pattern === 'grid' ? '50px 50px' : pattern === 'dots' ? '20px 20px' : 'cover',
  };
};

// Generate typography styles
export const getTypographyStyles = (customization: ThemeCustomization) => {
  return {
    fontFamily: customization.fontFamily || 'Inter',
    headingFont: customization.headingFont || customization.fontFamily || 'Inter',
    baseFontSize: customization.baseFontSize || 16,
    headingWeight: customization.headingWeight || '700',
    bodyWeight: customization.bodyWeight || '400',
    lineHeight: customization.lineHeight || 1.6,
    letterSpacing: customization.letterSpacing || 0,
  };
};

// Generate spacing styles as CSS variables
export const getSpacingStyles = (customization: ThemeCustomization) => {
  return {
    '--section-padding': `${customization.sectionPaddingY || 80}px`,
    '--container-max-width': `${customization.containerMaxWidth || 1280}px`,
    '--card-spacing': `${customization.cardSpacing || 24}px`,
    '--element-gap': `${customization.elementGap || 16}px`,
  } as React.CSSProperties;
};

// Generate card styles
export const getCardStyles = (customization: ThemeCustomization) => {
  const surfaceColor = customization.surfaceColor || customization.cardColor || '#1E293B';
  const borderColor = customization.borderColor || '#334155';
  const radius = customization.cardRadius || 16;
  const hasBorder = customization.cardBorder !== false;
  const shadowIntensity = customization.shadowIntensity || 'medium';

  let boxShadow = 'none';
  if (shadowIntensity === 'light') {
    boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  } else if (shadowIntensity === 'medium') {
    boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  } else if (shadowIntensity === 'strong') {
    boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  }

  return {
    backgroundColor: surfaceColor,
    borderRadius: `${radius}px`,
    border: hasBorder ? `1px solid ${borderColor}` : 'none',
    boxShadow,
  };
};

// Get hover scale value
export const getHoverScale = (customization: ThemeCustomization) => {
  if (!customization.enableAnimations) return 1;
  return customization.hoverScale || 1.02;
};

// Generate glow effect for elements
export const getGlowEffect = (customization: ThemeCustomization, color?: string) => {
  if (!customization.glowEffects) return {};
  const glowColor = color || customization.primaryColor || '#6366F1';
  return {
    boxShadow: `0 0 40px ${glowColor}33`,
  };
};

// Get font class based on font family
export const getFontClass = (fontFamily: string): string => {
  const fontMap: Record<string, string> = {
    'Inter': 'font-sans',
    'Poppins': 'font-poppins',
    'Montserrat': 'font-montserrat',
    'Nunito': 'font-nunito',
    'Roboto': 'font-sans',
    'Open Sans': 'font-sans',
    'mono': 'font-mono',
  };
  return fontMap[fontFamily] || 'font-sans';
};

// Default content arrays for themes
export const getDefaultStats = () => [
  { icon: 'Users', value: '10K+', label: 'Happy Customers', gradient: 'linear-gradient(to right, #6366F1, #8B5CF6)' },
  { icon: 'CheckCircle', value: '50K+', label: 'Orders Completed', gradient: 'linear-gradient(to right, #22C55E, #10B981)' },
  { icon: 'Zap', value: '500+', label: 'Services Available', gradient: 'linear-gradient(to right, #F59E0B, #EAB308)' },
  { icon: 'Globe', value: '150+', label: 'Countries Served', gradient: 'linear-gradient(to right, #3B82F6, #06B6D4)' },
];

export const getDefaultFeatures = () => [
  { title: 'Instant Delivery', description: 'Orders start within seconds', icon: 'Zap', color: '#F59E0B' },
  { title: 'Premium Quality', description: 'Real and active accounts', icon: 'Star', color: '#8B5CF6' },
  { title: 'Auto Refill', description: 'Drop protection included', icon: 'Shield', color: '#22C55E' },
  { title: '24/7 Support', description: 'Always here to help', icon: 'Users', color: '#3B82F6' },
];

export const getDefaultTestimonials = () => [
  { name: 'Sarah M.', text: 'Amazing service! Got my followers within minutes.', rating: 5, color: '#6366F1' },
  { name: 'John D.', text: 'Best SMM panel I have ever used. Highly recommend!', rating: 5, color: '#8B5CF6' },
  { name: 'Emily R.', text: 'Great prices and even better customer support.', rating: 5, color: '#EC4899' },
];

export const getDefaultFAQs = () => [
  { question: 'How fast will my order start?', answer: 'Most orders start within 0-5 minutes of being placed. Some services may take up to 24 hours depending on demand.' },
  { question: 'Are the followers real?', answer: 'We provide high-quality services from real accounts. Quality varies by service tier - premium services offer the highest quality.' },
  { question: 'Is there a refill guarantee?', answer: 'Yes! Most of our services come with a refill guarantee. If you experience any drops, we will refill them for free.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, cryptocurrency, and various local payment methods.' },
];

// Social link helper - handles both old format (string) and new format ({ enabled, url })
export interface SocialLinkData {
  id: string;
  url: string;
  enabled: boolean;
}

export const getSocialLinks = (socialLinks: Record<string, any> | undefined): SocialLinkData[] => {
  if (!socialLinks) return [];
  
  const platforms = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'telegram', 'discord', 'linkedin', 'whatsapp'];
  
  return platforms
    .map(id => {
      const value = socialLinks[id];
      if (!value) return null;
      
      // Handle new format: { enabled: boolean, url: string }
      if (typeof value === 'object' && value !== null) {
        return {
          id,
          url: value.url || '',
          enabled: value.enabled !== false
        };
      }
      
      // Handle old format: string (URL directly)
      return {
        id,
        url: value as string,
        enabled: true
      };
    })
    .filter((link): link is SocialLinkData => link !== null && link.enabled && !!link.url);
};

// Get mode-specific colors based on current theme mode
export interface ModeColors {
  backgroundColor: string;
  surfaceColor: string;
  cardColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
}

export const getModeColors = (
  customization: ThemeCustomization,
  isLightMode: boolean,
  themeDefaults: {
    lightBg: string;
    darkBg: string;
    lightSurface: string;
    darkSurface: string;
    lightText: string;
    darkText: string;
    lightMuted: string;
    darkMuted: string;
    lightBorder: string;
    darkBorder: string;
  }
): ModeColors => {
  // First check mode-specific palettes from customization
  const modePalette = isLightMode ? customization.lightModeColors : customization.darkModeColors;
  
  if (modePalette) {
    return {
      backgroundColor: modePalette.backgroundColor || (isLightMode ? themeDefaults.lightBg : themeDefaults.darkBg),
      surfaceColor: modePalette.surfaceColor || (isLightMode ? themeDefaults.lightSurface : themeDefaults.darkSurface),
      cardColor: modePalette.cardColor || modePalette.surfaceColor || (isLightMode ? themeDefaults.lightSurface : themeDefaults.darkSurface),
      textColor: modePalette.textColor || (isLightMode ? themeDefaults.lightText : themeDefaults.darkText),
      mutedColor: modePalette.mutedColor || (isLightMode ? themeDefaults.lightMuted : themeDefaults.darkMuted),
      borderColor: modePalette.borderColor || (isLightMode ? themeDefaults.lightBorder : themeDefaults.darkBorder),
    };
  }
  
  // Fall back to shared/legacy colors or theme defaults
  return {
    backgroundColor: customization.backgroundColor || (isLightMode ? themeDefaults.lightBg : themeDefaults.darkBg),
    surfaceColor: customization.surfaceColor || (isLightMode ? themeDefaults.lightSurface : themeDefaults.darkSurface),
    cardColor: customization.cardColor || customization.surfaceColor || (isLightMode ? themeDefaults.lightSurface : themeDefaults.darkSurface),
    textColor: customization.textColor || (isLightMode ? themeDefaults.lightText : themeDefaults.darkText),
    mutedColor: customization.mutedColor || (isLightMode ? themeDefaults.lightMuted : themeDefaults.darkMuted),
    borderColor: customization.borderColor || (isLightMode ? themeDefaults.lightBorder : themeDefaults.darkBorder),
  };
};

// Get glow box style for animated text
export const getGlowBoxStyle = (
  customization: ThemeCustomization,
  primaryColor: string
): React.CSSProperties => {
  const style = customization.heroAnimatedTextStyle || 'plain';
  
  if (style === 'glow-box') {
    return {
      display: 'inline-block',
      padding: '0.25rem 1rem',
      border: `2px solid ${primaryColor}`,
      borderRadius: '8px',
      boxShadow: `0 0 20px ${primaryColor}50, inset 0 0 20px ${primaryColor}20`,
      background: `${primaryColor}15`,
    };
  } else if (style === 'underline') {
    return {
      display: 'inline-block',
      borderBottom: `3px solid ${primaryColor}`,
      paddingBottom: '0.25rem',
    };
  } else if (style === 'highlight') {
    return {
      display: 'inline-block',
      background: `linear-gradient(transparent 60%, ${primaryColor}40 60%)`,
    };
  }
  
  return {};
};

// Helper to extract last word from hero title for glow-box styling
export const getLastWordFromTitle = (title: string): { prefix: string; lastWord: string } => {
  const words = title.trim().split(' ');
  if (words.length <= 1) {
    return { prefix: '', lastWord: title };
  }
  const lastWord = words.pop() || '';
  return { prefix: words.join(' '), lastWord };
};

// Complete icon map for social links in all themes
export const getSocialIconMap = (): Record<string, LucideIcon> => {
  return {
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    facebook: Facebook,
    telegram: Send,
    discord: MessageCircle,
    linkedin: Linkedin,
    whatsapp: MessageCircle,
    tiktok: Music,
  };
};
