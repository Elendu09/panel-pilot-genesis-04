import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useDesignHistory } from '@/hooks/use-design-history';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Save, ExternalLink, Smartphone, Tablet, Monitor, ChevronDown, Palette, Image, Layout, Zap, BarChart3, HelpCircle, MessageSquare, Loader2, Sparkles, Settings, Users, Star, Plus, Trash2, GripVertical, Shield, Headphones, Award, Clock, ShoppingCart, TrendingUp, CheckCircle, Heart, ThumbsUp, Undo2, Redo2, Wand2, Type, Maximize, Layers, MousePointer, Code, ChevronRight, Info, Sun, Moon, RotateCcw } from 'lucide-react';
import { ImageUpload } from '@/components/panel/ImageUpload';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MobileDesignSlider } from '@/components/design/MobileDesignSlider';
import { ThemeMiniPreview } from '@/components/design/ThemeMiniPreview';
import { ThemeOne } from '@/components/themes/ThemeOne';
import { ThemeTwo } from '@/components/themes/ThemeTwo';
import { ThemeThree } from '@/components/themes/ThemeThree';
import { ThemeFour } from '@/components/themes/ThemeFour';
import { ThemeFive } from '@/components/themes/ThemeFive';
import {
  TGRefHomepage,
  AliPanelHomepage,
  FlySMMHomepage,
  SMMStayHomepage,
  SMMVisitHomepage,
} from '@/components/buyer-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateBuyerThemeCSS } from '@/lib/color-utils';

// Memoized preset button for performance
const PresetButton = memo(({ preset, onApply }: { preset: any; onApply: (p: any) => void }) => (
  <button 
    onClick={() => onApply(preset)} 
    className="p-3 rounded-xl border-2 border-border hover:border-primary/50 transition-all text-left group"
  >
    <div className="flex gap-1 mb-2">
      {preset.preview.map((c: string, i: number) => (
        <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
      ))}
    </div>
    <p className="text-sm font-medium">{preset.name}</p>
    <p className="text-xs text-muted-foreground">{preset.description}</p>
  </button>
));
PresetButton.displayName = 'PresetButton';

// Memoized theme button for performance
const ThemeButton = memo(({ theme, isActive, onApply }: { theme: any; isActive: boolean; onApply: (id: string) => void }) => (
  <button 
    onClick={() => onApply(theme.id)} 
    className={`p-3 rounded-xl border-2 transition-all ${isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
  >
    <div className="flex gap-1 mb-2">
      {theme.colors.map((c: string, i: number) => (
        <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
      ))}
    </div>
    <p className="text-xs font-medium text-left">{theme.name}</p>
    {isActive && <Badge variant="secondary" className="mt-1 text-[10px]">Active</Badge>}
  </button>
));
ThemeButton.displayName = 'ThemeButton';

interface FAQ {
  question: string;
  answer: string;
  icon?: string;
}

interface Testimonial {
  name: string;
  text: string;
  rating: number;
  avatar?: string;
  color?: string;
}

interface PlatformFeature {
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

interface Stat {
  icon: string;
  value: string;
  label: string;
  gradient: string;
}

const defaultCustomization = {
  // Branding
  logoUrl: '',
  faviconUrl: '',
  companyName: '',
  tagline: 'Best SMM Services',
  
  // Primary Colors
  primaryColor: '#6366F1',
  secondaryColor: '#8B5CF6',
  accentColor: '#EC4899',
  
  // Background Colors
  backgroundColor: '#0F172A',
  surfaceColor: '#1E293B',
  cardColor: '#1E293B',
  
  // Text & UI Colors
  textColor: '#FFFFFF',
  mutedColor: '#94A3B8',
  borderColor: '#334155',
  
  // Status Colors
  successColor: '#22C55E',
  warningColor: '#F59E0B',
  infoColor: '#3B82F6',
  errorColor: '#EF4444',
  
  // Typography (NEW - Wix-like)
  fontFamily: 'Inter',
  headingFont: 'Inter',
  baseFontSize: 16,
  headingWeight: '700',
  bodyWeight: '400',
  lineHeight: 1.6,
  letterSpacing: 0,
  borderRadius: '12',
  
  // Spacing & Layout (NEW - Wix-like)
  sectionPaddingY: 80,
  containerMaxWidth: 1280,
  cardSpacing: 24,
  elementGap: 16,
  
  // Animations (NEW - Wix-like)
  enableAnimations: true,
  animationStyle: 'fade',
  animationDuration: 500,
  enableParallax: false,
  hoverScale: 1.02,
  scrollReveal: true,
  
  // Background Options (NEW - Wix-like)
  backgroundPattern: 'none',
  patternOpacity: 0.03,
  patternColor: '#6366F1',
  gradientAngle: 180,
  backgroundImageUrl: '',
  backgroundOverlayOpacity: 0.5,
  enableBackgroundBlur: false,
  
  // Button Styles (NEW - Wix-like)
  buttonRadius: 12,
  buttonSize: 'md',
  buttonHoverEffect: 'glow',
  buttonStyle: 'solid',
  buttonShadow: true,
  
  // Shadows & Effects (NEW - Wix-like)
  shadowIntensity: 'medium',
  cardRadius: 16,
  cardBorder: false,
  glowEffects: true,
  
  // Hero Section
  enableFastOrder: true,
  heroTitle: 'Boost Your Social Media Presence',
  heroSubtitle: 'Get real followers, likes, and views at the lowest prices. Trusted by over 50,000+ customers worldwide.',
  heroBadgeText: '#1 SMM Panel',
  heroCTAText: 'Get Started',
  heroSecondaryCTAText: 'View Services',
  heroAnimatedTexts: ['Instagram Growth', 'TikTok Viral', 'YouTube Success', 'Telegram Boost'],
  
  // Section Toggles
  enablePlatformFeatures: true,
  enableStats: true,
  enableFeatures: true,
  enableTestimonials: true,
  enableFAQs: true,

  // Feature Cards (editable features for features grid) - "Why Choose Our Services?"
  featureCards: [
    { title: 'Instant Delivery', description: 'Our automated system processes orders instantly. Most services start within minutes of placing your order.', icon: 'Zap' },
    { title: 'High Quality Services', description: 'We provide only premium quality services with real engagement that helps grow your social media presence.', icon: 'BarChart3' },
    { title: 'Best Prices Guaranteed', description: 'Compare our prices with any competitor. We offer the most competitive rates in the market.', icon: 'DollarSign' },
    { title: 'Global Coverage', description: 'Services available for all major social media platforms worldwide with multiple payment options.', icon: 'Globe' },
  ] as Array<{ title: string; description: string; icon: string }>,

  // Homepage layout order
  homepageLayout: ['hero', 'platform', 'stats', 'features', 'testimonials', 'faqs'],
  showBlogInMenu: false,

  // Custom design presets (saved by tenant)
  customPresets: [] as Array<{
    id: string;
    name: string;
    colors: {
      primaryColor: string;
      secondaryColor: string;
      backgroundColor: string;
      textColor: string;
      surfaceColor: string;
    };
    typography: {
      fontFamily: string;
      baseFontSize: number;
      headingWeight: string;
      bodyWeight: string;
      lineHeight: number;
      letterSpacing: number;
    };
  }>,

  // Platform Features - Subtle light cards matching the clean design
  platformFeatures: [
    { title: 'Instant Delivery', description: 'Our automated system processes orders instantly. Most services start within minutes of placing your order.', icon: 'Zap', gradient: 'from-primary/20 to-primary/5' },
    { title: 'High Quality Services', description: 'We provide only premium quality services with real engagement that helps grow your social media presence.', icon: 'BarChart3', gradient: 'from-accent/20 to-accent/5' },
    { title: 'Best Prices Guaranteed', description: 'Compare our prices with any competitor. We offer the most competitive rates in the market.', icon: 'Users', gradient: 'from-secondary/20 to-secondary/5' },
    { title: 'Global Coverage', description: 'Services available for all major social media platforms worldwide with multiple payment options.', icon: 'Globe', gradient: 'from-primary/15 to-primary/5' },
  ] as PlatformFeature[],
  
  // Stats - "Trusted by thousands of users"
  stats: [
    { icon: 'Users', value: '10K+', label: 'Happy Customers', gradient: 'from-blue-500 to-cyan-500' },
    { icon: 'ShoppingCart', value: '1M+', label: 'Orders Completed', gradient: 'from-green-500 to-emerald-500' },
    { icon: 'Zap', value: '500+', label: 'Services Available', gradient: 'from-purple-500 to-pink-500' },
    { icon: 'CreditCard', value: '50+', label: 'Payment Methods', gradient: 'from-amber-500 to-orange-500' },
  ] as Stat[],
  
  // Testimonials
  testimonials: [
    { name: 'Alex Johnson', text: 'Best SMM panel I have ever used! Fast delivery and great support.', rating: 5, color: 'from-blue-500 to-cyan-500' },
    { name: 'Sarah Miller', text: 'Amazing services! My Instagram grew 10x in just a month.', rating: 5, color: 'from-purple-500 to-pink-500' },
    { name: 'Mike Chen', text: 'The quality of followers is incredible. Real engagement!', rating: 5, color: 'from-green-500 to-emerald-500' },
  ] as Testimonial[],
  
  // FAQs
  faqs: [
    { question: 'How fast is delivery?', answer: 'Most orders start within 0-1 hour and complete within 24-48 hours depending on the service.' },
    { question: 'Is it safe to use?', answer: 'Yes! We never ask for your password. All our services are 100% safe and comply with platform guidelines.' },
    { question: 'What payment methods do you accept?', answer: 'We accept credit cards, PayPal, cryptocurrency, and various local payment methods.' },
    { question: 'Do you offer refunds?', answer: 'Yes, we offer full refunds if we cannot deliver your order. Customer satisfaction is our priority.' },
  ] as FAQ[],
  
  // Footer
  footerAbout: '',
  footerText: '',
  socialLinks: { facebook: '', twitter: '', instagram: '', telegram: '', discord: '' },
  
  // Theme
  selectedTheme: 'dark_gradient',

  // UI helpers
  newPresetName: '',
};

const fontOptions = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Poppins', label: 'Poppins (Friendly)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Open Sans', label: 'Open Sans (Classic)' },
  { value: 'Montserrat', label: 'Montserrat (Elegant)' },
  { value: 'Playfair Display', label: 'Playfair Display (Serif)' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Tech)' },
  { value: 'DM Sans', label: 'DM Sans (Geometric)' },
];

const layoutSections = [
  { id: 'hero', label: 'Hero', description: 'Top hero section with main CTA' },
  { id: 'platform', label: 'Platform Features', description: 'Feature highlight cards' },
  { id: 'stats', label: 'Stats', description: 'KPIs like orders and delivery time' },
  { id: 'features', label: 'Features Grid', description: 'Detailed feature grid' },
  { id: 'testimonials', label: 'Testimonials', description: 'Customer quotes and ratings' },
  { id: 'faqs', label: 'FAQ', description: 'Frequently asked questions' },
];

// Color themes (now merged into Design Presets - kept for backward compatibility)
const themes = [
  { 
    id: 'dark_gradient', 
    name: 'Dark Gradient', 
    colors: ['#0F172A', '#6366F1', '#8B5CF6'],
    description: 'Deep purple gradients with vibrant accents',
    sections: {
      enablePlatformFeatures: true,
      enableStats: true,
      enableFeatures: true,
      enableTestimonials: true,
      enableFAQs: true,
    },
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    colors: ['#0C4A6E', '#0EA5E9', '#38BDF8'],
    description: 'Cool blues with cyan highlights',
    sections: {
      enablePlatformFeatures: true,
      enableStats: true,
      enableFeatures: true,
      enableTestimonials: true,
      enableFAQs: true,
    },
  },
  { 
    id: 'vibrant', 
    name: 'Vibrant', 
    colors: ['#1A1310', '#F97316', '#EAB308'],
    description: 'Warm and vibrant orange tones',
    sections: {
      enablePlatformFeatures: true,
      enableStats: true,
      enableFeatures: true,
      enableTestimonials: true,
      enableFAQs: true,
    },
  },
];

// Design Presets - One-click beautiful designs with full color palettes
const designPresets = [
  {
    id: 'my_default_theme',
    name: 'My Default Theme',
    description: 'Your primary default layout & colors',
    preview: [defaultCustomization.backgroundColor, defaultCustomization.primaryColor, defaultCustomization.secondaryColor],
    customization: {
      backgroundColor: defaultCustomization.backgroundColor,
      primaryColor: defaultCustomization.primaryColor,
      secondaryColor: defaultCustomization.secondaryColor,
      accentColor: defaultCustomization.accentColor,
      textColor: defaultCustomization.textColor,
      mutedColor: defaultCustomization.mutedColor,
      surfaceColor: defaultCustomization.surfaceColor,
      cardColor: defaultCustomization.cardColor,
      borderColor: defaultCustomization.borderColor,
      successColor: defaultCustomization.successColor,
      warningColor: defaultCustomization.warningColor,
      infoColor: defaultCustomization.infoColor,
      errorColor: defaultCustomization.errorColor,
      selectedTheme: 'dark_gradient',
    }
  },
  {
    id: 'dark_gradient_preset',
    name: 'Dark Gradient',
    description: 'Deep purple gradients with vibrant accents',
    preview: ['#0F172A', '#6366F1', '#8B5CF6'],
    customization: {
      backgroundColor: '#0F172A',
      primaryColor: '#6366F1',
      secondaryColor: '#8B5CF6',
      accentColor: '#EC4899',
      textColor: '#FFFFFF',
      mutedColor: '#94A3B8',
      surfaceColor: '#1E293B',
      cardColor: '#1E293B',
      borderColor: '#334155',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      infoColor: '#3B82F6',
      errorColor: '#EF4444',
      selectedTheme: 'dark_gradient',
    }
  },
  {
    id: 'ocean_blue_preset',
    name: 'Ocean Blue',
    description: 'Cool blues with cyan highlights',
    preview: ['#0C4A6E', '#0EA5E9', '#38BDF8'],
    customization: {
      backgroundColor: '#0C4A6E',
      primaryColor: '#0EA5E9',
      secondaryColor: '#38BDF8',
      accentColor: '#14B8A6',
      textColor: '#FFFFFF',
      mutedColor: '#7DD3FC',
      surfaceColor: '#0e5a82',
      cardColor: '#0D5276',
      borderColor: '#0284C7',
      successColor: '#22C55E',
      warningColor: '#FBBF24',
      infoColor: '#38BDF8',
      errorColor: '#F43F5E',
      selectedTheme: 'professional',
    }
  },
  {
    id: 'sunset_orange_preset',
    name: 'Sunset Orange',
    description: 'Warm and vibrant orange tones',
    preview: ['#1A1310', '#F97316', '#EAB308'],
    customization: {
      backgroundColor: '#1A1310',
      primaryColor: '#F97316',
      secondaryColor: '#EAB308',
      accentColor: '#FB923C',
      textColor: '#FFFFFF',
      mutedColor: '#A8A29E',
      surfaceColor: '#2A1F1A',
      cardColor: '#292018',
      borderColor: '#44403C',
      successColor: '#84CC16',
      warningColor: '#FBBF24',
      infoColor: '#F97316',
      errorColor: '#DC2626',
      selectedTheme: 'vibrant',
    }
  },
  {
    id: 'forest_earth_preset',
    name: 'Forest Earth',
    description: 'Natural green with earthy accents',
    preview: ['#0D1912', '#22C55E', '#84CC16'],
    customization: {
      backgroundColor: '#0D1912',
      primaryColor: '#22C55E',
      secondaryColor: '#84CC16',
      accentColor: '#4ADE80',
      textColor: '#FFFFFF',
      mutedColor: '#86EFAC',
      surfaceColor: '#162419',
      cardColor: '#14291A',
      borderColor: '#166534',
      successColor: '#22C55E',
      warningColor: '#FBBF24',
      infoColor: '#4ADE80',
      errorColor: '#EF4444',
      selectedTheme: 'dark_gradient',
    }
  },
  {
    id: 'midnight_aurora',
    name: 'Midnight Aurora',
    description: 'Deep purple gradients with vibrant accents',
    preview: ['#0F0F1A', '#8B5CF6', '#EC4899'],
    customization: {
      backgroundColor: '#0F0F1A',
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      accentColor: '#14B8A6',
      textColor: '#FFFFFF',
      mutedColor: '#A1A1AA',
      surfaceColor: '#1a1a2e',
      cardColor: '#27273A',
      borderColor: '#3F3F5A',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      infoColor: '#38BDF8',
      errorColor: '#F43F5E',
      selectedTheme: 'dark_gradient',
    }
  },
  {
    id: 'minimal_light',
    name: 'Minimal Light',
    description: 'Clean white with blue accents',
    preview: ['#FFFFFF', '#3B82F6', '#1E40AF'],
    customization: {
      backgroundColor: '#FFFFFF',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#EC4899',
      textColor: '#1F2937',
      mutedColor: '#6B7280',
      surfaceColor: '#F8FAFC',
      cardColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      infoColor: '#3B82F6',
      errorColor: '#EF4444',
      selectedTheme: 'professional',
    }
  },
  {
    id: 'neon_dreams',
    name: 'Neon Dreams',
    description: 'Dark with vibrant neon colors',
    preview: ['#18181B', '#F97316', '#EC4899'],
    customization: {
      backgroundColor: '#18181B',
      primaryColor: '#F97316',
      secondaryColor: '#EC4899',
      accentColor: '#A855F7',
      textColor: '#FFFFFF',
      mutedColor: '#A1A1AA',
      surfaceColor: '#27272a',
      cardColor: '#27272A',
      borderColor: '#3F3F46',
      successColor: '#4ADE80',
      warningColor: '#FBBF24',
      infoColor: '#38BDF8',
      errorColor: '#F43F5E',
      selectedTheme: 'vibrant',
    }
  },
  {
    id: 'crypto_dark',
    name: 'Crypto Dark',
    description: 'Black with gold/amber accents',
    preview: ['#0A0A0A', '#F59E0B', '#D97706'],
    customization: {
      backgroundColor: '#0A0A0A',
      primaryColor: '#F59E0B',
      secondaryColor: '#D97706',
      accentColor: '#FBBF24',
      textColor: '#FFFFFF',
      mutedColor: '#78716C',
      surfaceColor: '#171717',
      cardColor: '#1A1A1A',
      borderColor: '#292524',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      infoColor: '#FBBF24',
      errorColor: '#DC2626',
      selectedTheme: 'dark_gradient',
    }
  },
  {
    id: 'neon_cyber',
    name: 'Neon Cyber',
    description: 'Black with electric blue/pink neon',
    preview: ['#000000', '#00D4FF', '#FF00FF'],
    customization: {
      backgroundColor: '#000000',
      primaryColor: '#00D4FF',
      secondaryColor: '#FF00FF',
      accentColor: '#00FF9F',
      textColor: '#FFFFFF',
      mutedColor: '#71717A',
      surfaceColor: '#0A0A0A',
      cardColor: '#0F0F0F',
      borderColor: '#27272A',
      successColor: '#00FF9F',
      warningColor: '#FFD600',
      infoColor: '#00D4FF',
      errorColor: '#FF0055',
      selectedTheme: 'dark_gradient',
    }
  },
  {
    id: 'clean_minimal',
    name: 'Clean Minimal',
    description: 'Pure white with single accent color',
    preview: ['#FAFAFA', '#18181B', '#6366F1'],
    customization: {
      backgroundColor: '#FAFAFA',
      primaryColor: '#18181B',
      secondaryColor: '#6366F1',
      accentColor: '#6366F1',
      textColor: '#18181B',
      mutedColor: '#71717A',
      surfaceColor: '#FFFFFF',
      cardColor: '#FFFFFF',
      borderColor: '#E4E4E7',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      infoColor: '#3B82F6',
      errorColor: '#EF4444',
      selectedTheme: 'professional',
    }
  },
  {
    id: 'warm_sunset',
    name: 'Warm Sunset',
    description: 'Warm gradients with coral/orange',
    preview: ['#1C1917', '#F97316', '#FB923C'],
    customization: {
      backgroundColor: '#1C1917',
      primaryColor: '#F97316',
      secondaryColor: '#FB923C',
      accentColor: '#FBBF24',
      textColor: '#FAFAF9',
      mutedColor: '#A8A29E',
      surfaceColor: '#292524',
      cardColor: '#28211C',
      borderColor: '#44403C',
      successColor: '#84CC16',
      warningColor: '#FBBF24',
      infoColor: '#FB923C',
      errorColor: '#DC2626',
      selectedTheme: 'vibrant',
    }
  },
  {
    id: 'arctic_ice',
    name: 'Arctic Ice',
    description: 'Cool blues and teals on light background',
    preview: ['#F0F9FF', '#0EA5E9', '#14B8A6'],
    customization: {
      backgroundColor: '#F0F9FF',
      primaryColor: '#0EA5E9',
      secondaryColor: '#14B8A6',
      accentColor: '#06B6D4',
      textColor: '#0C4A6E',
      mutedColor: '#64748B',
      surfaceColor: '#FFFFFF',
      cardColor: '#FFFFFF',
      borderColor: '#BAE6FD',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      infoColor: '#0EA5E9',
      errorColor: '#EF4444',
      selectedTheme: 'professional',
    }
  },
  {
    id: 'royal_purple',
    name: 'Royal Purple',
    description: 'Deep purple with gold accents',
    preview: ['#1E1B4B', '#A855F7', '#FBBF24'],
    customization: {
      backgroundColor: '#1E1B4B',
      primaryColor: '#A855F7',
      secondaryColor: '#FBBF24',
      accentColor: '#C084FC',
      textColor: '#FFFFFF',
      mutedColor: '#A5B4FC',
      surfaceColor: '#312E81',
      cardColor: '#2E2A6B',
      borderColor: '#4338CA',
      successColor: '#22C55E',
      warningColor: '#FBBF24',
      infoColor: '#A855F7',
      errorColor: '#F43F5E',
      selectedTheme: 'dark_gradient',
    }
  },
  {
    id: 'nature_fresh',
    name: 'Nature Fresh',
    description: 'Greens with natural earth tones',
    preview: ['#ECFDF5', '#10B981', '#059669'],
    customization: {
      backgroundColor: '#ECFDF5',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      accentColor: '#34D399',
      textColor: '#064E3B',
      mutedColor: '#6B7280',
      surfaceColor: '#FFFFFF',
      cardColor: '#FFFFFF',
      borderColor: '#A7F3D0',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      infoColor: '#10B981',
      errorColor: '#EF4444',
      selectedTheme: 'professional',
    }
  },
  {
    id: 'smm_premium_blue',
    name: 'SMM Premium Blue',
    description: 'Inspired by modern SMM panels, deep blue with cyan accents',
    preview: ['#020617', '#0EA5E9', '#22D3EE'],
    customization: {
      backgroundColor: '#020617',
      primaryColor: '#0EA5E9',
      secondaryColor: '#22D3EE',
      accentColor: '#38BDF8',
      textColor: '#E5E7EB',
      mutedColor: '#64748B',
      surfaceColor: '#0F172A',
      cardColor: '#0F172A',
      borderColor: '#1E293B',
      successColor: '#22C55E',
      warningColor: '#FBBF24',
      infoColor: '#0EA5E9',
      errorColor: '#EF4444',
      selectedTheme: 'professional',
    }
  },
  {
    id: 'smm_premium_dark',
    name: 'SMM Premium Dark',
    description: 'High contrast dark layout with glowing accents',
    preview: ['#020617', '#7C3AED', '#22C55E'],
    customization: {
      backgroundColor: '#020617',
      primaryColor: '#7C3AED',
      secondaryColor: '#22C55E',
      accentColor: '#A855F7',
      textColor: '#F9FAFB',
      mutedColor: '#6B7280',
      surfaceColor: '#0F172A',
      cardColor: '#0F172A',
      borderColor: '#1E293B',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      infoColor: '#7C3AED',
      errorColor: '#EF4444',
      selectedTheme: 'dark_gradient',
    }
  },
  {
    id: 'smm_clean_light',
    name: 'SMM Clean Light',
    description: 'Clean light layout with subtle gray sections',
    preview: ['#F9FAFB', '#6366F1', '#0F172A'],
    customization: {
      backgroundColor: '#F9FAFB',
      primaryColor: '#6366F1',
      secondaryColor: '#0F172A',
      accentColor: '#8B5CF6',
      textColor: '#0F172A',
      mutedColor: '#6B7280',
      surfaceColor: '#FFFFFF',
      cardColor: '#FFFFFF',
      borderColor: '#E5E7EB',
      successColor: '#22C55E',
      warningColor: '#F59E0B',
      infoColor: '#6366F1',
      errorColor: '#EF4444',
      selectedTheme: 'professional',
    }
  },
];

const iconOptions = ['Zap', 'Shield', 'Headphones', 'Award', 'Users', 'Star', 'Clock', 'ShoppingCart', 'TrendingUp', 'CheckCircle', 'Heart', 'ThumbsUp'];
const gradientOptions = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-orange-500',
  'from-red-500 to-rose-500',
  'from-indigo-500 to-violet-500',
];

// Theme defaults for reset functionality - now with full color palette
const getThemeDefaults = (themeType: string): Partial<typeof defaultCustomization> => {
  const baseColors = {
    successColor: '#22C55E',
    warningColor: '#F59E0B',
    infoColor: '#3B82F6',
    errorColor: '#EF4444',
  };
  
  switch (themeType) {
    case 'dark_gradient':
      return { backgroundColor: '#0F172A', primaryColor: '#6366F1', secondaryColor: '#8B5CF6', accentColor: '#EC4899', textColor: '#FFFFFF', mutedColor: '#94A3B8', surfaceColor: '#1E293B', cardColor: '#1E293B', borderColor: '#334155', ...baseColors };
    case 'professional':
      return { backgroundColor: '#0C4A6E', primaryColor: '#0EA5E9', secondaryColor: '#38BDF8', accentColor: '#14B8A6', textColor: '#FFFFFF', mutedColor: '#7DD3FC', surfaceColor: '#0e5a82', cardColor: '#0D5276', borderColor: '#0284C7', ...baseColors };
    case 'vibrant':
      return { backgroundColor: '#1A1310', primaryColor: '#F97316', secondaryColor: '#EAB308', accentColor: '#FB923C', textColor: '#FFFFFF', mutedColor: '#A8A29E', surfaceColor: '#2A1F1A', cardColor: '#292018', borderColor: '#44403C', ...baseColors };
    case 'grace':
      return { backgroundColor: '#0D1912', primaryColor: '#22C55E', secondaryColor: '#84CC16', accentColor: '#4ADE80', textColor: '#FFFFFF', mutedColor: '#86EFAC', surfaceColor: '#162419', cardColor: '#14291A', borderColor: '#166534', ...baseColors };
    case 'tech_futuristic':
      return { backgroundColor: '#0A0A0F', primaryColor: '#00D4FF', secondaryColor: '#8B5CF6', accentColor: '#00FF9F', textColor: '#FFFFFF', mutedColor: '#71717A', surfaceColor: '#101020', cardColor: '#101020', borderColor: '#27272A', ...baseColors };
    case 'tgref':
      return { backgroundColor: '#1A1B26', primaryColor: '#00D4AA', secondaryColor: '#0EA5E9', accentColor: '#22D3EE', textColor: '#E5E7EB', mutedColor: '#6B7280', surfaceColor: '#0D0E14', cardColor: '#0D0E14', borderColor: '#27272A', ...baseColors };
    case 'alipanel':
      return { backgroundColor: '#0A0A0A', primaryColor: '#FF6B6B', secondaryColor: '#FFCC70', accentColor: '#FF8E8E', textColor: '#FFFFFF', mutedColor: '#A1A1AA', surfaceColor: '#1A1A1A', cardColor: '#1A1A1A', borderColor: '#27272A', ...baseColors };
    case 'flysmm':
      return { backgroundColor: '#F8FAFC', primaryColor: '#2196F3', secondaryColor: '#00BCD4', accentColor: '#03A9F4', textColor: '#1F2937', mutedColor: '#6B7280', surfaceColor: '#FFFFFF', cardColor: '#FFFFFF', borderColor: '#E5E7EB', ...baseColors };
    case 'smmstay':
      return { backgroundColor: '#000000', primaryColor: '#FF4081', secondaryColor: '#E040FB', accentColor: '#FF80AB', textColor: '#FFFFFF', mutedColor: '#A1A1AA', surfaceColor: '#0A0A0A', cardColor: '#0A0A0A', borderColor: '#27272A', ...baseColors };
    case 'smmvisit':
      return { backgroundColor: '#F5F5F5', primaryColor: '#FFD700', secondaryColor: '#1A1A1A', accentColor: '#FFC107', textColor: '#1A1A1A', mutedColor: '#6B7280', surfaceColor: '#FFFFFF', cardColor: '#FFFFFF', borderColor: '#E5E7EB', ...baseColors };
    default:
      return { backgroundColor: '#0F172A', primaryColor: '#6366F1', secondaryColor: '#8B5CF6', accentColor: '#EC4899', textColor: '#FFFFFF', mutedColor: '#94A3B8', surfaceColor: '#1E293B', cardColor: '#1E293B', borderColor: '#334155', ...baseColors };
  }
};

// Storefront themes (for homepage layout)
// NOTE: ThemeOne-ThemeFive are represented by design presets, so the homepage theme picker
// only exposes "Default" plus the dedicated homepage layouts (TGRef/AliPanel/etc.).
const storefrontThemes = [
  { id: 'default', name: 'Default', description: 'Modern default layout (recommended)', colors: ['#0F172A', '#6366F1', '#8B5CF6'], themeType: 'dark_gradient' },
  { id: 'theme_tgref', name: 'TGRef Style', description: 'Terminal/tech aesthetic with monospace fonts', colors: ['#1A1B26', '#00D4AA', '#0EA5E9'], themeType: 'tgref' },
  { id: 'theme_alipanel', name: 'AliPanel Style', description: 'Pink-orange gradients with floating icons', colors: ['#0A0A0A', '#FF6B6B', '#FFCC70'], themeType: 'alipanel' },
  { id: 'theme_flysmm', name: 'FlySMM Style', description: 'Light friendly with blue accents and illustrations', colors: ['#F8FAFC', '#2196F3', '#00BCD4'], themeType: 'flysmm' },
  { id: 'theme_smmstay', name: 'SMMStay Style', description: 'Dark neon pink with bold uppercase typography', colors: ['#000000', '#FF4081', '#E040FB'], themeType: 'smmstay' },
  { id: 'theme_smmvisit', name: 'SMMVisit Style', description: 'Light gray with yellow/gold accents', colors: ['#F5F5F5', '#FFD700', '#1A1A1A'], themeType: 'smmvisit' },
];

// Live Preview Renderer - renders actual theme based on selectedTheme
function LivePreviewRenderer({ customization }: { customization: any }) {
  const selectedTheme = customization.selectedTheme || 'dark_gradient';
  const themeMode: 'dark' | 'light' = customization.themeMode === 'light' ? 'light' : 'dark';

  const mockPanel = {
    name: customization.companyName || 'Your Panel',
    logo_url: customization.logoUrl,
    primary_color: customization.primaryColor,
    secondary_color: customization.secondaryColor,
  };

  const themeProps = {
    panel: mockPanel,
    services: [],
    customization,
    isPreview: true,
  };

  // Homepage props for buyer theme components
  const homepageProps = {
    panelName: customization.companyName || 'Your Panel',
    services: [],
    stats: {
      totalOrders: 50000,
      totalUsers: 10000,
      servicesCount: 500,
    },
    customization,
    logoUrl: customization.logoUrl,
  };

  const previewCSS = generateBuyerThemeCSS({
    primaryColor: customization.primaryColor,
    secondaryColor: customization.secondaryColor,
    accentColor: customization.accentColor,
    backgroundColor: customization.backgroundColor,
    surfaceColor: customization.surfaceColor,
    cardColor: customization.cardColor || customization.surfaceColor,
    textColor: customization.textColor,
    mutedColor: customization.mutedColor,
    borderColor: customization.borderColor,
    successColor: customization.successColor,
    warningColor: customization.warningColor,
    infoColor: customization.infoColor,
    errorColor: customization.errorColor,
  });

  // Render appropriate theme based on selectedTheme
  let rendered: React.ReactNode;
  switch (selectedTheme) {
    case 'theme_two':
    case 'professional':
    case 'light_minimal':
    case 'corporate':
    case 'ocean_blue':
      rendered = <ThemeTwo {...themeProps} />;
      break;
    case 'theme_three':
    case 'vibrant':
    case 'neon_glow':
    case 'sunset_orange':
    case 'royal_purple':
      rendered = <ThemeThree {...themeProps} />;
      break;
    case 'theme_four':
    case 'grace':
    case 'grace_cometh':
    case 'forest_earth':
      rendered = <ThemeFour {...themeProps} />;
      break;
    case 'theme_five':
    case 'tech_futuristic':
      rendered = <ThemeFive {...themeProps} />;
      break;
    case 'theme_tgref':
    case 'tgref':
      rendered = <TGRefHomepage {...homepageProps} />;
      break;
    case 'theme_alipanel':
    case 'alipanel':
      rendered = <AliPanelHomepage {...homepageProps} />;
      break;
    case 'theme_flysmm':
    case 'flysmm':
      rendered = <FlySMMHomepage {...homepageProps} />;
      break;
    case 'theme_smmstay':
    case 'smmstay':
      rendered = <SMMStayHomepage {...homepageProps} />;
      break;
    case 'theme_smmvisit':
    case 'smmvisit':
      rendered = <SMMVisitHomepage {...homepageProps} />;
      break;
    // ThemeOne is the default for all other cases
    case 'default':
    case 'theme_one':
    case 'dark_gradient':
    case 'cosmic_purple':
    default:
      rendered = <ThemeOne {...themeProps} />;
      break;
  }

  return (
    <div className={cn('buyer-theme-wrapper min-h-full', themeMode)}>
      <style>{previewCSS}</style>
      {rendered}
    </div>
  );
}

export default function DesignCustomization() {
  const [panelId, setPanelId] = useState<string | null>(null);
  const [panelSubdomain, setPanelSubdomain] = useState<string>('');
  const [panelCustomDomain, setPanelCustomDomain] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewThemeMode, setPreviewThemeMode] = useState<'dark' | 'light'>('dark');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ presets: true, themes: true });
  const [showAllPresets, setShowAllPresets] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const useMobileLayout = isMobile || isTablet;

  const togglePreviewTheme = () => {
    setPreviewThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Use the design history hook for undo/redo
  const { 
    state: customization, 
    setState: setCustomization, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    historyLength, 
    futureLength,
    reset: resetHistory 
  } = useDesignHistory(defaultCustomization, { maxHistory: 20, debounceMs: 500 });

  // Use React Query for faster data fetching with caching
  const queryClient = useQueryClient();
  
  const { data: panelData, isLoading: panelLoading } = useQuery({
    queryKey: ['panel-design-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!profile) throw new Error('No profile');
      
      const { data: panel } = await supabase
        .from('panels')
        .select('id, name, custom_branding, theme_type, subdomain, custom_domain, buyer_theme')
        .eq('owner_id', profile.id)
        .single();
      
      return panel;
    },
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  // Initialize state from query data
  useEffect(() => {
    if (panelData) {
      setPanelId(panelData.id);
      setPanelSubdomain(panelData.subdomain || '');
      setPanelCustomDomain(panelData.custom_domain || '');
      const branding = panelData.custom_branding as any || {};
      const loadedCustomization = { 
        ...defaultCustomization,
        companyName: panelData.name || '',
        // Homepage layout key lives in custom_branding.selectedTheme; theme_type is just a safe fallback.
        selectedTheme: branding.selectedTheme || panelData.theme_type || 'dark_gradient',
        // Buyer dashboard uses design presets (colors) only.
        buyerTheme: 'default',
        ...branding,
      };
      resetHistory(loadedCustomization);
      setLoading(false);
    }
  }, [panelData]);

  const updateCustomization = (key: string, value: any) => { 
    setCustomization(prev => ({ ...prev, [key]: value })); 
    setHasUnsavedChanges(true); 
  };

  const createPreview = () => {
    const previewId = crypto.randomUUID();
    const previewData = {
      primaryColor: customization.primaryColor,
      secondaryColor: customization.secondaryColor,
      accentColor: customization.accentColor,
      backgroundColor: customization.backgroundColor,
      surfaceColor: customization.surfaceColor,
      textColor: customization.textColor,
      mutedColor: '#6B7280',
      borderRadius: String(customization.cardRadius ?? customization.borderRadius ?? 12),
      logoUrl: customization.logoUrl,
      companyName: customization.companyName || 'SMM Panel',
      tagline: customization.tagline,
      headerTitle: customization.companyName || 'SMM Panel',
      footerText: customization.footerText || '',
      showHero: true,
      showFeatures: customization.enableFeatures !== false,
      showStats: customization.enableStats !== false,
      showTestimonials: customization.enableTestimonials !== false,
      expiresAt: Date.now() + 30 * 60 * 1000,
    };

    try {
      localStorage.setItem(`preview_${previewId}`, JSON.stringify(previewData));
      window.open(`/preview/${previewId}`, '_blank');
    } catch (error) {
      console.error('Failed to create preview:', error);
      toast({
        title: 'Preview unavailable',
        description: 'Your browser blocked local preview storage. Try another browser or disable private mode.',
        variant: 'destructive',
      });
    }
  };

  const updateNestedArray = (key: string, index: number, field: string, value: any) => {
    setCustomization(prev => {
      const arr = [...(prev as any)[key]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });
    setHasUnsavedChanges(true);
  };

  const addArrayItem = (key: string, defaultItem: any) => {
    setCustomization(prev => ({
      ...prev,
      [key]: [...(prev as any)[key], defaultItem]
    }));
    setHasUnsavedChanges(true);
  };

  const removeArrayItem = (key: string, index: number) => {
    setCustomization(prev => ({
      ...prev,
      [key]: (prev as any)[key].filter((_: any, i: number) => i !== index)
    }));
    setHasUnsavedChanges(true);
  };

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) { 
      let variants: any = {};
      switch (themeId) {
        case 'dark_gradient':
        case 'midnight':
          variants = {
            heroVariant: 'ali_panel',
            faqVariant: 'glass_cards',
            navVariant: 'floating_glass',
            footerVariant: 'classic_columns',
          };
          break;
        case 'ocean_blue':
        case 'ocean_breeze':
          variants = {
            heroVariant: 'professional_quick_order',
            faqVariant: 'simple_accordion',
            navVariant: 'solid',
            footerVariant: 'compact_columns',
          };
          break;
        case 'forest_green':
          variants = {
            heroVariant: 'forest_split',
            faqVariant: 'bordered_cards',
            navVariant: 'solid_transparent',
            footerVariant: 'earthy_columns',
          };
          break;
        case 'professional':
          variants = {
            heroVariant: 'professional_quick_order',
            faqVariant: 'simple_accordion',
            navVariant: 'solid',
            footerVariant: 'compact_columns',
          };
          break;
        case 'vibrant':
          variants = {
            heroVariant: 'promo_cards',
            faqVariant: 'cards',
            navVariant: 'floating_solid',
            footerVariant: 'promo_columns',
          };
          break;
        default:
          break;
      }

      setCustomization(prev => ({ 
        ...prev, 
        selectedTheme: themeId, 
        backgroundColor: theme.colors[0], 
        primaryColor: theme.colors[1], 
        secondaryColor: theme.colors[2],
        ...(theme as any).sections,
        ...variants,
      })); 
      setHasUnsavedChanges(true); 
    }
  };

  const applyPreset = (preset: typeof designPresets[0]) => {
    setCustomization(prev => ({
      ...prev,
      ...preset.customization,
    }));
    setHasUnsavedChanges(true);
    toast({ title: `Applied "${preset.name}" preset` });
  };

  const handleUndo = () => {
    undo();
    setHasUnsavedChanges(true);
    toast({ title: 'Undone', description: `${historyLength - 1} more undo${historyLength - 1 !== 1 ? 's' : ''} available` });
  };

  const handleRedo = () => {
    redo();
    setHasUnsavedChanges(true);
    toast({ title: 'Redone', description: `${futureLength - 1} more redo${futureLength - 1 !== 1 ? 's' : ''} available` });
  };

  // Use mutation for optimistic updates
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!panelId) throw new Error('No panel ID');

      // theme_type is a Postgres enum; never store homepage-layout keys like "smmvisit" there.
      // Store the homepage layout choice in custom_branding.selectedTheme, and persist a safe enum value.
      const safeThemeTypes = new Set([
        'dark_gradient',
        'professional',
        'vibrant',
        'grace',
        'tech_futuristic',
      ]);
      const selectedTheme = String(customization.selectedTheme || 'dark_gradient');
      const themeTypeToPersist = safeThemeTypes.has(selectedTheme) ? selectedTheme : 'dark_gradient';

      const { error } = await supabase.from('panels').update({
        custom_branding: customization as unknown as Json,
        theme_type: themeTypeToPersist as any,
        // Buyer dashboard theme is driven by design preset colors (not the Ali/Fly/etc layouts)
        buyer_theme: 'default',
        // Also save colors to main columns for proper syncing
        primary_color: customization.primaryColor,
        secondary_color: customization.secondaryColor,
        logo_url: customization.logoUrl || null,
        updated_at: new Date().toISOString(),
      }).eq('id', panelId);
      if (error) throw error;

      // Tell any open buyer/storefront tabs to refresh their tenant cache.
      try {
        localStorage.setItem('panelDesignUpdatedAt', String(Date.now()));
        window.dispatchEvent(new Event('panelDesignUpdated'));
      } catch {
        // ignore
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel-design-settings'] });
      queryClient.invalidateQueries({ queryKey: ['panel-customization', panelId] });
      toast({ title: 'Design saved and applied!' });
      setHasUnsavedChanges(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleSave = useCallback(() => {
    saveMutation.mutate();
  }, [saveMutation]);
  
  const saving = saveMutation.isPending;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  // Helper function to render section content (used by both desktop and mobile)
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'presets':
        const displayedPresets = showAllPresets ? designPresets : designPresets.slice(0, 4);
        const savedStorefrontTheme = panelData?.theme_type || 'dark_gradient';
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Apply a complete design with one click, or save your own presets.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {displayedPresets.map(preset => (
                  <button 
                    key={preset.id} 
                    onClick={() => applyPreset(preset)} 
                    className="p-3 rounded-xl border-2 border-border hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="flex gap-1 mb-2">
                      {preset.preview.map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <p className="text-sm font-medium">{preset.name}</p>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </button>
                ))}
              </div>
              {designPresets.length > 4 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAllPresets(!showAllPresets)}
                >
                  {showAllPresets ? 'Show Less' : `Load More (${designPresets.length - 4} more)`}
                </Button>
              )}
            </div>

            {/* Homepage Themes with Visual Mini Previews */}
            <div className="pt-4 border-t border-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Homepage themes</p>
                <Badge variant="outline" className="text-[10px]">Storefront layout</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                These themes control your public storefront (homepage) layout and overall style. Each theme has a unique visual identity.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {storefrontThemes.map(theme => {
                  const isActive = customization.selectedTheme === theme.themeType || customization.selectedTheme === theme.id;
                  const isConfigured = savedStorefrontTheme === theme.themeType || savedStorefrontTheme === theme.id;
                  // Get default colors for this theme
                  const themeDefaults = getThemeDefaults(theme.themeType);
                  return (
                    <ThemeMiniPreview
                      key={theme.id}
                      themeId={theme.id}
                      name={theme.name}
                      description={theme.description}
                      colors={theme.colors}
                      isActive={isActive}
                      isConfigured={isConfigured}
                      hasUnsavedChanges={isActive && hasUnsavedChanges}
                      onClick={() => {
                        // Apply theme with its default colors
                        setCustomization(prev => ({
                          ...prev,
                          selectedTheme: theme.themeType,
                          ...themeDefaults,
                        }));
                        setHasUnsavedChanges(true);
                        toast({ title: `Applied "${theme.name}" theme` });
                      }}
                    />
                  );
                })}
              </div>

              {/* Reset to Theme Default Button */}
              {customization.selectedTheme && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => {
                    const currentTheme = storefrontThemes.find(
                      t => t.themeType === customization.selectedTheme || t.id === customization.selectedTheme
                    );
                    if (currentTheme) {
                      const themeDefaults = getThemeDefaults(currentTheme.themeType);
                      setCustomization(prev => ({
                        ...prev,
                        ...themeDefaults,
                      }));
                      setHasUnsavedChanges(true);
                      toast({ title: `Reset to "${currentTheme.name}" defaults` });
                    }
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Theme Default Colors
                </Button>
              )}
            </div>

            {/* Custom presets saved per tenant */}
            <div className="pt-4 border-t border-border/60 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">My presets</p>
              {customization.customPresets?.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {customization.customPresets.map((preset: any) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        updateCustomization('primaryColor', preset.colors.primaryColor);
                        updateCustomization('secondaryColor', preset.colors.secondaryColor);
                        updateCustomization('backgroundColor', preset.colors.backgroundColor);
                        updateCustomization('textColor', preset.colors.textColor);
                        updateCustomization('surfaceColor', preset.colors.surfaceColor);
                        updateCustomization('fontFamily', preset.typography.fontFamily);
                        updateCustomization('baseFontSize', preset.typography.baseFontSize);
                        updateCustomization('headingWeight', preset.typography.headingWeight);
                        updateCustomization('bodyWeight', preset.typography.bodyWeight);
                        updateCustomization('lineHeight', preset.typography.lineHeight);
                        updateCustomization('letterSpacing', preset.typography.letterSpacing);
                      }}
                      className="p-3 rounded-xl border-2 border-border hover:border-primary/60 transition-all text-left"
                    >
                      <div className="flex gap-1 mb-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.backgroundColor }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.primaryColor }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.secondaryColor }} />
                      </div>
                      <p className="text-xs font-medium truncate">{preset.name}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No custom presets yet. Create one below from your current design.</p>
              )}

              {/* Save current design as preset */}
              <div className="space-y-2">
                <Label className="text-xs">Save current colors & typography as preset</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Preset name"
                    value={customization.newPresetName || ''}
                    onChange={(e) => updateCustomization('newPresetName', e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button
                    size="sm"
                    disabled={!customization.newPresetName}
                    onClick={() => {
                      const id = crypto.randomUUID();
                      const newPreset = {
                        id,
                        name: customization.newPresetName,
                        colors: {
                          primaryColor: customization.primaryColor,
                          secondaryColor: customization.secondaryColor,
                          backgroundColor: customization.backgroundColor,
                          textColor: customization.textColor,
                          surfaceColor: customization.surfaceColor,
                        },
                        typography: {
                          fontFamily: customization.fontFamily,
                          baseFontSize: customization.baseFontSize,
                          headingWeight: customization.headingWeight,
                          bodyWeight: customization.bodyWeight,
                          lineHeight: customization.lineHeight,
                          letterSpacing: customization.letterSpacing,
                        },
                      };
                      const existing = customization.customPresets || [];
                      updateCustomization('customPresets', [...existing, newPreset]);
                      updateCustomization('newPresetName', '');
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'themes':
        // Buyer dashboard theming is driven by the design preset colors (CSS variables),
        // not by swapping full buyer layout themes.
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Buyer Dashboard Theme</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your buyer dashboard now automatically uses the same colors you set in Presets/Colors.
                (No separate buyer theme selector.)
              </p>
            </div>
          </div>
        );
      // buyer-themes section has been merged into 'themes' section above
      case 'branding':
        return (
          <div className="space-y-5">
            {/* Favicon Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <span>Favicon</span>
                  <Badge variant="outline" className="text-[10px]">32x32</Badge>
                </Label>
              </div>
              
              {/* Favicon Preview Card */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
                <div className="flex flex-col gap-4">
                  {/* Browser Tab Preview */}
                  <div className="flex-shrink-0">
                    <p className="text-xs text-muted-foreground mb-2">Browser tab preview</p>
                    <div className="w-full max-w-[220px] bg-slate-800 rounded-t-lg p-1.5">
                      <div className="flex items-center gap-2 bg-slate-700 rounded px-2 py-1.5">
                        <img 
                          src={customization.faviconUrl || '/default-panel-favicon.png'} 
                          alt="Favicon" 
                          className="w-4 h-4 object-contain"
                        />
                        <span className="text-xs text-white/70 truncate">
                          {customization.companyName || 'Your Panel'}
                        </span>
                        <div className="ml-auto w-3 h-3 rounded-full bg-slate-600" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Current favicon preview */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-background border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                      <img 
                        src={customization.faviconUrl || '/default-panel-favicon.png'} 
                        alt="Current favicon"
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {customization.faviconUrl ? 'Custom Favicon' : 'Default Favicon'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG or ICO, 32x32px recommended
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Upload Component */}
              <ImageUpload
                label="Upload Custom Favicon"
                value={customization.faviconUrl}
                onChange={(url) => updateCustomization('faviconUrl', url)}
                panelId={panelId || ''}
                folder="favicon"
                placeholder="Upload favicon (PNG, ICO, 32x32 recommended)"
                aspectRatio="square"
                maxSizeMB={1}
              />
              
              {/* Reset to default button */}
              {customization.faviconUrl && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => updateCustomization('faviconUrl', '')}
                  className="w-full gap-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Default Favicon
                </Button>
              )}
            </div>
            
            {/* Divider */}
            <div className="border-t border-border/50" />
            
            {/* Logo Upload */}
            <ImageUpload
              label="Logo"
              value={customization.logoUrl}
              onChange={(url) => updateCustomization('logoUrl', url)}
              panelId={panelId || ''}
              folder="logos"
              placeholder="Upload your panel logo"
              aspectRatio="wide"
            />
            
            {/* Company Name */}
            <div>
              <Label>Company Name</Label>
              <Input value={customization.companyName} onChange={(e) => updateCustomization('companyName', e.target.value)} />
            </div>
            
            {/* Tagline */}
            <div>
              <Label>Tagline</Label>
              <Input value={customization.tagline} onChange={(e) => updateCustomization('tagline', e.target.value)} />
            </div>
          </div>
        );
      case 'colors':
        return (
          <div className="space-y-3">
            {['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor'].map(key => (
              <div key={key} className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={(customization as any)[key]} 
                  onChange={(e) => updateCustomization(key, e.target.value)} 
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                />
                <div className="flex-1">
                  <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  <Input 
                    value={(customization as any)[key]} 
                    onChange={(e) => updateCustomization(key, e.target.value)} 
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">
              These colors update the live preview on the right instantly. Save them as a preset from the "Design Presets" section.
            </p>
          </div>
        );
      case 'typography':
        return (
          <div className="space-y-4">
            <div>
              <Label>Font Family</Label>
              <select 
                value={customization.fontFamily}
                onChange={(e) => updateCustomization('fontFamily', e.target.value)}
                className="w-full h-10 px-3 rounded-md border bg-background"
              >
                {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Base Font Size: {customization.baseFontSize}px</Label>
              <Slider 
                value={[customization.baseFontSize]} 
                onValueChange={([v]) => updateCustomization('baseFontSize', v)} 
                min={12} 
                max={24} 
                step={1} 
              />
            </div>
          </div>
        );
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <Label>Hero Title</Label>
              <Input value={customization.heroTitle} onChange={(e) => updateCustomization('heroTitle', e.target.value)} />
            </div>
            <div>
              <Label>Hero Subtitle</Label>
              <Textarea value={customization.heroSubtitle} onChange={(e) => updateCustomization('heroSubtitle', e.target.value)} rows={3} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Enable Fast Order</span>
              <Switch checked={customization.enableFastOrder} onCheckedChange={(c) => updateCustomization('enableFastOrder', c)} />
            </div>
          </div>
        );
      
      case 'spacing':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <Label>Section Padding Y</Label>
                <span className="text-sm text-muted-foreground">{customization.sectionPaddingY}px</span>
              </div>
              <Slider value={[customization.sectionPaddingY]} onValueChange={([v]) => updateCustomization('sectionPaddingY', v)} min={40} max={160} step={8} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Container Max Width</Label>
                <span className="text-sm text-muted-foreground">{customization.containerMaxWidth}px</span>
              </div>
              <Slider value={[customization.containerMaxWidth]} onValueChange={([v]) => updateCustomization('containerMaxWidth', v)} min={960} max={1536} step={64} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Card Spacing</Label>
                <span className="text-sm text-muted-foreground">{customization.cardSpacing}px</span>
              </div>
              <Slider value={[customization.cardSpacing]} onValueChange={([v]) => updateCustomization('cardSpacing', v)} min={8} max={48} step={4} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Card Radius</Label>
                <span className="text-sm text-muted-foreground">{customization.cardRadius}px</span>
              </div>
              <Slider value={[customization.cardRadius]} onValueChange={([v]) => updateCustomization('cardRadius', v)} min={0} max={32} step={2} />
            </div>
          </div>
        );

      case 'animations':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Enable Animations</span>
              <Switch checked={customization.enableAnimations} onCheckedChange={(c) => updateCustomization('enableAnimations', c)} />
            </div>
            <div>
              <Label>Animation Style</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 mt-1" value={customization.animationStyle} onChange={(e) => updateCustomization('animationStyle', e.target.value)}>
                <option value="fade">Fade In</option>
                <option value="slide">Slide Up</option>
                <option value="zoom">Zoom In</option>
                <option value="bounce">Bounce</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Animation Duration</Label>
                <span className="text-sm text-muted-foreground">{customization.animationDuration}ms</span>
              </div>
              <Slider value={[customization.animationDuration]} onValueChange={([v]) => updateCustomization('animationDuration', v)} min={200} max={1000} step={50} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Scroll Reveal</span>
              <Switch checked={customization.scrollReveal} onCheckedChange={(c) => updateCustomization('scrollReveal', c)} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Parallax Effects</span>
              <Switch checked={customization.enableParallax} onCheckedChange={(c) => updateCustomization('enableParallax', c)} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Glow Effects</span>
              <Switch checked={customization.glowEffects} onCheckedChange={(c) => updateCustomization('glowEffects', c)} />
            </div>
          </div>
        );

      case 'backgrounds':
        return (
          <div className="space-y-4">
            <div>
              <Label>Background Pattern</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 mt-1" value={customization.backgroundPattern} onChange={(e) => updateCustomization('backgroundPattern', e.target.value)}>
                <option value="none">None</option>
                <option value="grid">Grid Lines</option>
                <option value="dots">Dots</option>
                <option value="diagonal">Diagonal Lines</option>
                <option value="waves">Waves</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Pattern Opacity</Label>
                <span className="text-sm text-muted-foreground">{Math.round(customization.patternOpacity * 100)}%</span>
              </div>
              <Slider value={[customization.patternOpacity * 100]} onValueChange={([v]) => updateCustomization('patternOpacity', v / 100)} min={1} max={20} step={1} />
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={customization.patternColor} onChange={(e) => updateCustomization('patternColor', e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
              <div className="flex-1">
                <Label className="text-xs">Pattern Color</Label>
                <Input value={customization.patternColor} onChange={(e) => updateCustomization('patternColor', e.target.value)} className="h-8 text-xs font-mono" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Gradient Angle</Label>
                <span className="text-sm text-muted-foreground">{customization.gradientAngle}°</span>
              </div>
              <Slider value={[customization.gradientAngle]} onValueChange={([v]) => updateCustomization('gradientAngle', v)} min={0} max={360} step={15} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Background Blur</span>
              <Switch checked={customization.enableBackgroundBlur} onCheckedChange={(c) => updateCustomization('enableBackgroundBlur', c)} />
            </div>
          </div>
        );

      case 'buttons':
        return (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Button Style</Label>
              <div className="grid grid-cols-3 gap-2">
                {['solid', 'outline', 'ghost'].map(style => (
                  <button key={style} onClick={() => updateCustomization('buttonStyle', style)} className={`p-3 rounded-lg border-2 text-sm capitalize transition-all ${customization.buttonStyle === style ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Button Size</Label>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'sm', label: 'Small' }, { id: 'md', label: 'Medium' }, { id: 'lg', label: 'Large' }].map(size => (
                  <button key={size.id} onClick={() => updateCustomization('buttonSize', size.id)} className={`p-3 rounded-lg border-2 text-sm transition-all ${customization.buttonSize === size.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <Label>Border Radius</Label>
                <span className="text-sm text-muted-foreground">{customization.buttonRadius}px</span>
              </div>
              <Slider value={[customization.buttonRadius]} onValueChange={([v]) => updateCustomization('buttonRadius', v)} min={0} max={50} step={2} />
            </div>
            <div>
              <Label>Hover Effect</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 mt-1" value={customization.buttonHoverEffect} onChange={(e) => updateCustomization('buttonHoverEffect', e.target.value)}>
                <option value="glow">Glow</option>
                <option value="scale">Scale Up</option>
                <option value="slide">Background Slide</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Button Shadow</span>
              <Switch checked={customization.buttonShadow} onCheckedChange={(c) => updateCustomization('buttonShadow', c)} />
            </div>
          </div>
        );

      case 'platform':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Show Platform Features</span>
              <Switch checked={customization.enablePlatformFeatures} onCheckedChange={(c) => updateCustomization('enablePlatformFeatures', c)} />
            </div>
            {customization.platformFeatures.map((feature: PlatformFeature, index: number) => (
              <Card key={index} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Feature {index + 1}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeArrayItem('platformFeatures', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input placeholder="Title" value={feature.title} onChange={(e) => updateNestedArray('platformFeatures', index, 'title', e.target.value)} />
                <Input placeholder="Description" value={feature.description} onChange={(e) => updateNestedArray('platformFeatures', index, 'description', e.target.value)} />
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={() => addArrayItem('platformFeatures', { title: 'New Feature', description: 'Description', icon: 'Star', gradient: 'from-blue-500 to-cyan-500' })}>
              <Plus className="w-4 h-4 mr-2" /> Add Feature
            </Button>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Show Statistics</span>
              <Switch checked={customization.enableStats} onCheckedChange={(c) => updateCustomization('enableStats', c)} />
            </div>
            {customization.stats.map((stat: Stat, index: number) => (
              <Card key={index} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stat {index + 1}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeArrayItem('stats', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Value" value={stat.value} onChange={(e) => updateNestedArray('stats', index, 'value', e.target.value)} />
                  <Input placeholder="Label" value={stat.label} onChange={(e) => updateNestedArray('stats', index, 'label', e.target.value)} />
                </div>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={() => addArrayItem('stats', { icon: 'Star', value: '100+', label: 'New Stat', gradient: 'from-blue-500 to-cyan-500' })}>
              <Plus className="w-4 h-4 mr-2" /> Add Stat
            </Button>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Show Features Grid</span>
              <Switch checked={customization.enableFeatures} onCheckedChange={(c) => updateCustomization('enableFeatures', c)} />
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Manage the feature cards shown on your storefront.
            </p>
            {(customization.featureCards || []).map((feature: any, index: number) => (
              <Card key={index} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Feature {index + 1}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeArrayItem('featureCards', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input placeholder="Title" value={feature.title} onChange={(e) => updateNestedArray('featureCards', index, 'title', e.target.value)} />
                <Textarea placeholder="Description" value={feature.description} onChange={(e) => updateNestedArray('featureCards', index, 'description', e.target.value)} rows={2} />
                <select 
                  className="w-full h-10 rounded-md border bg-background px-3"
                  value={feature.icon}
                  onChange={(e) => updateNestedArray('featureCards', index, 'icon', e.target.value)}
                >
                  {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={() => addArrayItem('featureCards', { title: 'New Feature', description: 'Feature description', icon: 'Star' })}>
              <Plus className="w-4 h-4 mr-2" /> Add Feature
            </Button>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Show Testimonials</span>
              <Switch checked={customization.enableTestimonials} onCheckedChange={(c) => updateCustomization('enableTestimonials', c)} />
            </div>
            {customization.testimonials.map((testimonial: Testimonial, index: number) => (
              <Card key={index} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Review {index + 1}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeArrayItem('testimonials', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input placeholder="Customer Name" value={testimonial.name} onChange={(e) => updateNestedArray('testimonials', index, 'name', e.target.value)} />
                <Textarea placeholder="Review text" value={testimonial.text} onChange={(e) => updateNestedArray('testimonials', index, 'text', e.target.value)} rows={2} />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => updateNestedArray('testimonials', index, 'rating', star)} className={`p-1 ${testimonial.rating >= star ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={() => addArrayItem('testimonials', { name: 'Customer', text: 'Great service!', rating: 5 })}>
              <Plus className="w-4 h-4 mr-2" /> Add Review
            </Button>
          </div>
        );

      case 'faqs':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Show FAQ Section</span>
              <Switch checked={customization.enableFAQs} onCheckedChange={(c) => updateCustomization('enableFAQs', c)} />
            </div>
            {customization.faqs.map((faq: FAQ, index: number) => (
              <Card key={index} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">FAQ {index + 1}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeArrayItem('faqs', index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input placeholder="Question" value={faq.question} onChange={(e) => updateNestedArray('faqs', index, 'question', e.target.value)} />
                <Textarea placeholder="Answer" value={faq.answer} onChange={(e) => updateNestedArray('faqs', index, 'answer', e.target.value)} rows={2} />
              </Card>
            ))}
            <Button variant="outline" className="w-full" onClick={() => addArrayItem('faqs', { question: 'New Question?', answer: 'Answer here...' })}>
              <Plus className="w-4 h-4 mr-2" /> Add FAQ
            </Button>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-4">
            <div>
              <Label>Footer About Text</Label>
              <Textarea value={customization.footerAbout} onChange={(e) => updateCustomization('footerAbout', e.target.value)} rows={2} placeholder="Brief description of your panel..." />
            </div>
            <div>
              <Label>Copyright Text</Label>
              <Input value={customization.footerText} onChange={(e) => updateCustomization('footerText', e.target.value)} placeholder="© 2024 Your Panel. All rights reserved." />
            </div>
            <div className="space-y-2">
              <Label>Social Links</Label>
              {['facebook', 'twitter', 'instagram', 'telegram', 'discord'].map(social => (
                <Input 
                  key={social} 
                  placeholder={`${social.charAt(0).toUpperCase() + social.slice(1)} URL`} 
                  value={(customization.socialLinks as any)?.[social] || ''} 
                  onChange={(e) => updateCustomization('socialLinks', { ...customization.socialLinks, [social]: e.target.value })} 
                />
              ))}
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-4">
            <div>
              <Label>Shadow Intensity</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 mt-1" value={customization.shadowIntensity} onChange={(e) => updateCustomization('shadowIntensity', e.target.value)}>
                <option value="none">None</option>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
              <span className="font-medium">Card Borders</span>
              <Switch checked={customization.cardBorder} onCheckedChange={(c) => updateCustomization('cardBorder', c)} />
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-200">
                These advanced settings affect the overall look and feel of your storefront.
              </p>
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-muted-foreground">Configure {sectionId} settings</p>;
    }
  };

  const sections = [
    { id: 'presets', title: 'Design Presets', icon: Wand2 },
    { id: 'themes', title: 'Theme Gallery', icon: Palette }, // Now contains buyer layout themes (FlySMM, SMMStay, etc.)
    { id: 'branding', title: 'Branding', icon: Image },
    { id: 'colors', title: 'Colors', icon: Sparkles },
    { id: 'typography', title: 'Typography', icon: Type },
    { id: 'spacing', title: 'Spacing & Layout', icon: Maximize },
    { id: 'animations', title: 'Animations', icon: Sparkles },
    { id: 'backgrounds', title: 'Background', icon: Layers },
    { id: 'buttons', title: 'Button Styles', icon: MousePointer },
    { id: 'hero', title: 'Hero Section', icon: Layout },
    { id: 'platform', title: 'Platform Features', icon: Zap },
    { id: 'stats', title: 'Statistics', icon: BarChart3 },
    { id: 'features', title: 'Features Grid', icon: Settings },
    { id: 'testimonials', title: 'Testimonials', icon: Users },
    { id: 'faqs', title: 'FAQ Section', icon: HelpCircle },
    { id: 'footer', title: 'Footer', icon: MessageSquare },
    { id: 'advanced', title: 'Advanced', icon: Code },
  ];

  // Mobile and tablet views use the MobileDesignSlider component
  if (useMobileLayout) {
    return (
      <MobileDesignSlider
        previewDevice={previewDevice}
        setPreviewDevice={(device) => {
          // On phone, never allow switching to tablet/desktop previews
          if (isMobile && !isTablet) {
            setPreviewDevice('mobile');
            return;
          }
          setPreviewDevice(device);
        }}
        deviceMode={isMobile && !isTablet ? 'mobileOnly' : 'all'}
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        onSave={handleSave}
        renderSection={renderSectionContent}
        currentTheme={customization.selectedTheme}
        primaryColor={customization.primaryColor}
        secondaryColor={customization.secondaryColor}
        previewThemeMode={previewThemeMode}
        onTogglePreviewTheme={togglePreviewTheme}
      >
        <LivePreviewRenderer customization={{ ...customization, themeMode: previewThemeMode }} />
      </MobileDesignSlider>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Design Editor</h1>
              <p className="text-sm text-muted-foreground">Customize your storefront</p>
            </div>
          </div>
          
          {/* Current Theme Indicator + Change Theme Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50">
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: customization.backgroundColor }} />
                <div className="w-3 h-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: customization.primaryColor }} />
                <div className="w-3 h-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: customization.secondaryColor }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground capitalize">
                {customization.selectedTheme?.replace(/_/g, ' ') || 'Custom'}
              </span>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Open Theme Gallery section and scroll to it
                    setOpenSections(prev => ({ ...prev, themes: true, presets: true }));
                    setTimeout(() => {
                      document.querySelector('[data-section-id="themes"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border-primary/30"
                >
                  <Palette className="w-4 h-4" />
                  Change Theme
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">Where to change theme?</p>
                    <p className="text-xs text-muted-foreground">Click here or scroll to "Theme Gallery" in the left panel to pick homepage layout themes.</p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Undo/Redo Buttons */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleUndo} 
                  disabled={!canUndo}
                  className="relative"
                >
                  <Undo2 className="w-4 h-4" />
                  {canUndo && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                      {historyLength}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRedo} 
                  disabled={!canRedo}
                  className="relative"
                >
                  <Redo2 className="w-4 h-4" />
                  {canRedo && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                      {futureLength}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
            </Tooltip>

            <Button variant="outline" size="sm" onClick={createPreview}>
              <ExternalLink className="w-4 h-4 mr-2" />Preview
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const storefrontUrl = panelCustomDomain 
                      ? `https://${panelCustomDomain}`
                      : panelSubdomain 
                        ? `https://${panelSubdomain}.homeofsmm.com`
                        : null;
                    if (storefrontUrl) {
                      window.open(storefrontUrl, '_blank');
                    } else {
                      toast({ title: 'No domain configured', description: 'Please set up your subdomain first.', variant: 'destructive' });
                    }
                  }}
                  disabled={!panelSubdomain && !panelCustomDomain}
                  className="bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border-primary/30"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Preview as Buyer
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {panelCustomDomain 
                  ? `Opens ${panelCustomDomain} in new tab` 
                  : panelSubdomain 
                    ? `Opens ${panelSubdomain}.homeofsmm.com in new tab`
                    : 'Configure your subdomain first'}
              </TooltipContent>
            </Tooltip>
            <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges} className="relative">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {hasUnsavedChanges ? 'Save' : 'Saved'}
              {hasUnsavedChanges && <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />}
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Panel - Settings */}
          <div className="w-[420px] border-r border-border/50 overflow-y-auto bg-card/30 p-4 space-y-2">
            {sections.map((section) => (
              <Collapsible 
                key={section.id} 
                open={openSections[section.id]} 
                onOpenChange={() => setOpenSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                data-section-id={section.id}
              >
                <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <section.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{section.title}</span>
                    {section.id === 'presets' && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSections[section.id] ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="p-4 space-y-4">
                  {/* Design Presets Section */}
                  {section.id === 'presets' && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Apply a complete design with one click. Your content will be preserved.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {designPresets.map(preset => (
                          <button 
                            key={preset.id} 
                            onClick={() => applyPreset(preset)} 
                            className="p-3 rounded-xl border-2 border-border hover:border-primary/50 transition-all text-left group hover:shadow-lg"
                          >
                            <div className="flex gap-1 mb-2">
                              {preset.preview.map((c, i) => (
                                <div 
                                  key={i} 
                                  className="w-6 h-6 rounded-full ring-2 ring-white/20 shadow-sm" 
                                  style={{ backgroundColor: c }} 
                                />
                              ))}
                            </div>
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">{preset.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{preset.description}</p>
                          </button>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => {
                          // Use defaultCustomization directly (not merged with preset)
                          resetHistory({
                            ...defaultCustomization,
                            companyName: panelData?.name || '',
                          });
                          setHasUnsavedChanges(true);
                          toast({ title: 'Reset to defaults', description: 'Design restored to original settings' });
                        }}
                      >
                        Reset to Default
                      </Button>
                    </div>
                  )}

                  {/* Themes Section - uses renderSectionContent for tabbed Theme Gallery */}
                  {section.id === 'themes' && renderSectionContent('themes')}

                  {/* Branding Section - Full branding controls including logo/favicon */}
                  {section.id === 'branding' && (
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Logo URL
                        </Label>
                        <Input value={customization.logoUrl} onChange={(e) => updateCustomization('logoUrl', e.target.value)} placeholder="https://your-logo.png" />
                        <p className="text-xs text-muted-foreground mt-1">Recommended: 200x50px or similar aspect ratio</p>
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          Favicon URL
                        </Label>
                        <Input value={customization.faviconUrl} onChange={(e) => updateCustomization('faviconUrl', e.target.value)} placeholder="https://your-favicon.ico" />
                        <p className="text-xs text-muted-foreground mt-1">Recommended: 32x32px or 64x64px square icon</p>
                      </div>
                      <div>
                        <Label>Company Name</Label>
                        <Input value={customization.companyName} onChange={(e) => updateCustomization('companyName', e.target.value)} />
                      </div>
                      <div>
                        <Label>Tagline</Label>
                        <Input value={customization.tagline} onChange={(e) => updateCustomization('tagline', e.target.value)} />
                      </div>
                    </div>
                  )}

                  {/* Colors Section */}
                  {section.id === 'colors' && (
                    <div className="space-y-3">
                      {['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor'].map(key => (
                        <div key={key} className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={(customization as any)[key]} 
                            onChange={(e) => updateCustomization(key, e.target.value)} 
                            className="w-10 h-10 rounded-lg cursor-pointer border-0" 
                          />
                          <div className="flex-1">
                            <Label className="text-sm capitalize">{key.replace('Color', ' Color')}</Label>
                            <Input 
                              value={(customization as any)[key]} 
                              onChange={(e) => updateCustomization(key, e.target.value)} 
                              className="h-8 text-xs font-mono" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Typography Section - NEW Wix-like */}
                  {section.id === 'typography' && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Primary Font</Label>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                          value={customization.fontFamily}
                          onChange={(e) => updateCustomization('fontFamily', e.target.value)}
                        >
                          {fontOptions.map(font => (
                            <option key={font.value} value={font.value}>{font.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Heading Font</Label>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                          value={customization.headingFont}
                          onChange={(e) => updateCustomization('headingFont', e.target.value)}
                        >
                          {fontOptions.map(font => (
                            <option key={font.value} value={font.value}>{font.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Heading Weight</Label>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                          value={customization.headingWeight}
                          onChange={(e) => updateCustomization('headingWeight', e.target.value)}
                        >
                          <option value="400">Regular (400)</option>
                          <option value="500">Medium (500)</option>
                          <option value="600">Semi Bold (600)</option>
                          <option value="700">Bold (700)</option>
                          <option value="800">Extra Bold (800)</option>
                        </select>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm font-medium">Base Font Size</Label>
                          <span className="text-sm text-muted-foreground">{customization.baseFontSize}px</span>
                        </div>
                        <Slider
                          value={[customization.baseFontSize]}
                          onValueChange={(v) => updateCustomization('baseFontSize', v[0])}
                          min={12}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm font-medium">Line Height</Label>
                          <span className="text-sm text-muted-foreground">{customization.lineHeight}</span>
                        </div>
                        <Slider
                          value={[customization.lineHeight * 10]}
                          onValueChange={(v) => updateCustomization('lineHeight', v[0] / 10)}
                          min={12}
                          max={24}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm font-medium">Letter Spacing</Label>
                          <span className="text-sm text-muted-foreground">{customization.letterSpacing}px</span>
                        </div>
                        <Slider
                          value={[customization.letterSpacing + 2]}
                          onValueChange={(v) => updateCustomization('letterSpacing', v[0] - 2)}
                          min={0}
                          max={4}
                          step={0.5}
                          className="w-full"
                        />
                      </div>
                      
                      {/* Live Preview */}
                      <div className="p-4 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs text-muted-foreground mb-2">Preview</p>
                        <h3 
                          className="text-xl mb-1" 
                          style={{ 
                            fontFamily: customization.headingFont, 
                            fontWeight: customization.headingWeight,
                            letterSpacing: `${customization.letterSpacing}px`
                          }}
                        >
                          Heading Preview
                        </h3>
                        <p 
                          style={{ 
                            fontFamily: customization.fontFamily, 
                            fontSize: `${customization.baseFontSize}px`,
                            lineHeight: customization.lineHeight,
                            fontWeight: customization.bodyWeight
                          }}
                        >
                          Body text preview with your selected typography settings.
                        </p>
                      </div>
                    </div>
                  )}

                  {section.id === 'spacing' && (
                    <div className="space-y-4">
                      {renderSectionContent('spacing')}
                    </div>
                  )}

                  {/* Animations Section - NEW Wix-like */}
                  {section.id === 'animations' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Enable Animations</span>
                        <Switch 
                          checked={customization.enableAnimations} 
                          onCheckedChange={(c) => updateCustomization('enableAnimations', c)} 
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Animation Style</Label>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                          value={customization.animationStyle}
                          onChange={(e) => updateCustomization('animationStyle', e.target.value)}
                        >
                          <option value="fade">Fade In</option>
                          <option value="slide">Slide Up</option>
                          <option value="zoom">Zoom In</option>
                          <option value="bounce">Bounce</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm font-medium">Animation Duration</Label>
                          <span className="text-sm text-muted-foreground">{customization.animationDuration}ms</span>
                        </div>
                        <Slider
                          value={[customization.animationDuration]}
                          onValueChange={(v) => updateCustomization('animationDuration', v[0])}
                          min={200}
                          max={1000}
                          step={50}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Scroll Reveal</span>
                        <Switch 
                          checked={customization.scrollReveal} 
                          onCheckedChange={(c) => updateCustomization('scrollReveal', c)} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Parallax Effects</span>
                        <Switch 
                          checked={customization.enableParallax} 
                          onCheckedChange={(c) => updateCustomization('enableParallax', c)} 
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm font-medium">Hover Scale</Label>
                          <span className="text-sm text-muted-foreground">{customization.hoverScale}x</span>
                        </div>
                        <Slider
                          value={[customization.hoverScale * 100]}
                          onValueChange={(v) => updateCustomization('hoverScale', v[0] / 100)}
                          min={100}
                          max={115}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Glow Effects</span>
                        <Switch 
                          checked={customization.glowEffects} 
                          onCheckedChange={(c) => updateCustomization('glowEffects', c)} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Background Section - NEW Wix-like */}
                  {section.id === 'backgrounds' && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Background Pattern</Label>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                          value={customization.backgroundPattern}
                          onChange={(e) => updateCustomization('backgroundPattern', e.target.value)}
                        >
                          <option value="none">None</option>
                          <option value="grid">Grid Lines</option>
                          <option value="dots">Dots</option>
                          <option value="diagonal">Diagonal Lines</option>
                          <option value="waves">Waves</option>
                        </select>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm font-medium">Pattern Opacity</Label>
                          <span className="text-sm text-muted-foreground">{Math.round(customization.patternOpacity * 100)}%</span>
                        </div>
                        <Slider
                          value={[customization.patternOpacity * 100]}
                          onValueChange={(v) => updateCustomization('patternOpacity', v[0] / 100)}
                          min={1}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={customization.patternColor} 
                          onChange={(e) => updateCustomization('patternColor', e.target.value)} 
                          className="w-10 h-10 rounded-lg cursor-pointer border-0" 
                        />
                        <div className="flex-1">
                          <Label className="text-sm">Pattern Color</Label>
                          <Input 
                            value={customization.patternColor} 
                            onChange={(e) => updateCustomization('patternColor', e.target.value)} 
                            className="h-8 text-xs font-mono" 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm font-medium">Gradient Angle</Label>
                          <span className="text-sm text-muted-foreground">{customization.gradientAngle}°</span>
                        </div>
                        <Slider
                          value={[customization.gradientAngle]}
                          onValueChange={(v) => updateCustomization('gradientAngle', v[0])}
                          min={0}
                          max={360}
                          step={15}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Background Image URL</Label>
                        <Input 
                          value={customization.backgroundImageUrl} 
                          onChange={(e) => updateCustomization('backgroundImageUrl', e.target.value)} 
                          placeholder="https://..." 
                          className="mt-1"
                        />
                      </div>
                      
                      {customization.backgroundImageUrl && (
                        <div>
                          <div className="flex justify-between mb-2">
                            <Label className="text-sm font-medium">Overlay Opacity</Label>
                            <span className="text-sm text-muted-foreground">{Math.round(customization.backgroundOverlayOpacity * 100)}%</span>
                          </div>
                          <Slider
                            value={[customization.backgroundOverlayOpacity * 100]}
                            onValueChange={(v) => updateCustomization('backgroundOverlayOpacity', v[0] / 100)}
                            min={0}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Background Blur</span>
                        <Switch 
                          checked={customization.enableBackgroundBlur} 
                          onCheckedChange={(c) => updateCustomization('enableBackgroundBlur', c)} 
                        />
                      </div>
                      
                      {/* Pattern Preview */}
                      <div 
                        className="h-32 rounded-lg border border-border relative overflow-hidden"
                        style={{ backgroundColor: customization.backgroundColor }}
                      >
                        {customization.backgroundPattern !== 'none' && (
                          <div 
                            className="absolute inset-0"
                            style={{
                              backgroundImage: customization.backgroundPattern === 'grid' 
                                ? `linear-gradient(${customization.patternColor}${Math.round(customization.patternOpacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px), linear-gradient(90deg, ${customization.patternColor}${Math.round(customization.patternOpacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px)`
                                : customization.backgroundPattern === 'dots'
                                ? `radial-gradient(circle, ${customization.patternColor}${Math.round(customization.patternOpacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px)`
                                : customization.backgroundPattern === 'diagonal'
                                ? `repeating-linear-gradient(45deg, ${customization.patternColor}${Math.round(customization.patternOpacity * 255).toString(16).padStart(2, '0')}, ${customization.patternColor}${Math.round(customization.patternOpacity * 255).toString(16).padStart(2, '0')} 1px, transparent 1px, transparent 10px)`
                                : 'none',
                              backgroundSize: customization.backgroundPattern === 'dots' ? '20px 20px' : '40px 40px',
                            }}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">Pattern Preview</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Button Styles Section - NEW Wix-like */}
                  {section.id === 'buttons' && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Button Style</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {['solid', 'outline', 'ghost'].map(style => (
                            <button
                              key={style}
                              onClick={() => updateCustomization('buttonStyle', style)}
                              className={`p-3 rounded-lg border-2 text-sm capitalize transition-all ${
                                customization.buttonStyle === style 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Button Size</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'sm', label: 'Small' },
                            { id: 'md', label: 'Medium' },
                            { id: 'lg', label: 'Large' }
                          ].map(size => (
                            <button
                              key={size.id}
                              onClick={() => updateCustomization('buttonSize', size.id)}
                              className={`p-3 rounded-lg border-2 text-sm transition-all ${
                                customization.buttonSize === size.id 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {size.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm font-medium">Border Radius</Label>
                          <span className="text-sm text-muted-foreground">{customization.buttonRadius}px</span>
                        </div>
                        <Slider
                          value={[customization.buttonRadius]}
                          onValueChange={(v) => updateCustomization('buttonRadius', v[0])}
                          min={0}
                          max={50}
                          step={2}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Hover Effect</Label>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                          value={customization.buttonHoverEffect}
                          onChange={(e) => updateCustomization('buttonHoverEffect', e.target.value)}
                        >
                          <option value="glow">Glow</option>
                          <option value="scale">Scale Up</option>
                          <option value="slide">Background Slide</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Button Shadow</span>
                        <Switch 
                          checked={customization.buttonShadow} 
                          onCheckedChange={(c) => updateCustomization('buttonShadow', c)} 
                        />
                      </div>
                      
                      {/* Live Button Preview */}
                      <div className="p-6 rounded-lg bg-muted/30 border border-border flex flex-col items-center gap-4">
                        <p className="text-xs text-muted-foreground">Button Preview</p>
                        <button 
                          className="font-medium transition-all"
                          style={{
                            backgroundColor: customization.buttonStyle === 'solid' ? customization.primaryColor : 'transparent',
                            color: customization.buttonStyle === 'solid' ? '#fff' : customization.primaryColor,
                            border: customization.buttonStyle === 'outline' ? `2px solid ${customization.primaryColor}` : customization.buttonStyle === 'ghost' ? 'none' : 'none',
                            borderRadius: `${customization.buttonRadius}px`,
                            padding: customization.buttonSize === 'sm' ? '8px 16px' : customization.buttonSize === 'lg' ? '16px 32px' : '12px 24px',
                            fontSize: customization.buttonSize === 'sm' ? '14px' : customization.buttonSize === 'lg' ? '18px' : '16px',
                            boxShadow: customization.buttonShadow && customization.buttonStyle === 'solid' ? `0 4px 14px ${customization.primaryColor}40` : 'none',
                          }}
                        >
                          Preview Button
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Advanced Section - NEW Wix-like */}
                  {section.id === 'advanced' && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Shadow Intensity</Label>
                        <select 
                          className="w-full h-10 rounded-md border border-input bg-background px-3 mt-1"
                          value={customization.shadowIntensity}
                          onChange={(e) => updateCustomization('shadowIntensity', e.target.value)}
                        >
                          <option value="none">None</option>
                          <option value="light">Light</option>
                          <option value="medium">Medium</option>
                          <option value="heavy">Heavy</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Card Borders</span>
                        <Switch 
                          checked={customization.cardBorder} 
                          onCheckedChange={(c) => updateCustomization('cardBorder', c)} 
                        />
                      </div>
                      
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-yellow-200">
                          💡 <strong>Pro Tip:</strong> These advanced settings affect the overall look and feel of your storefront. Use shadow intensity sparingly for a cleaner design.
                        </p>
                      </div>
                    </div>
                  )}


                  {section.id === 'hero' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">Enable Fast Order</span>
                        </div>
                        <Switch 
                          checked={customization.enableFastOrder} 
                          onCheckedChange={(checked) => updateCustomization('enableFastOrder', checked)} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {customization.enableFastOrder ? '⚡ Fast Order button in hero' : '🚀 Get Started + Services buttons'}
                      </p>
                      <div>
                        <Label>Badge Text</Label>
                        <Input value={customization.heroBadgeText} onChange={(e) => updateCustomization('heroBadgeText', e.target.value)} />
                      </div>
                      <div>
                        <Label>Hero Title</Label>
                        <Textarea value={customization.heroTitle} onChange={(e) => updateCustomization('heroTitle', e.target.value)} rows={2} />
                      </div>
                      <div>
                        <Label>Hero Subtitle</Label>
                        <Textarea value={customization.heroSubtitle} onChange={(e) => updateCustomization('heroSubtitle', e.target.value)} rows={3} />
                      </div>
                      <div>
                        <Label>Animated Text Phrases (comma separated)</Label>
                        <Textarea 
                          value={customization.heroAnimatedTexts?.join(', ')} 
                          onChange={(e) => updateCustomization('heroAnimatedTexts', e.target.value.split(',').map(s => s.trim()))} 
                          rows={2}
                          placeholder="Instagram Growth, TikTok Viral, YouTube Success"
                        />
                      </div>
                    </div>
                  )}

                  {/* Platform Features Section */}
                  {section.id === 'platform' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Show Platform Features</span>
                        <Switch 
                          checked={customization.enablePlatformFeatures} 
                          onCheckedChange={(c) => updateCustomization('enablePlatformFeatures', c)} 
                        />
                      </div>
                      
                      {customization.platformFeatures.map((feature, index) => (
                        <Card key={index} className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Feature {index + 1}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeArrayItem('platformFeatures', index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input 
                            placeholder="Title" 
                            value={feature.title} 
                            onChange={(e) => updateNestedArray('platformFeatures', index, 'title', e.target.value)} 
                          />
                          <Input 
                            placeholder="Description" 
                            value={feature.description} 
                            onChange={(e) => updateNestedArray('platformFeatures', index, 'description', e.target.value)} 
                          />
                          <div className="flex gap-2">
                            <select 
                              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                              value={feature.icon}
                              onChange={(e) => updateNestedArray('platformFeatures', index, 'icon', e.target.value)}
                            >
                              {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                            </select>
                            <select 
                              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                              value={feature.gradient}
                              onChange={(e) => updateNestedArray('platformFeatures', index, 'gradient', e.target.value)}
                            >
                              {gradientOptions.map(g => <option key={g} value={g}>{g.replace('from-', '').replace(' to-', ' → ')}</option>)}
                            </select>
                          </div>
                        </Card>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => addArrayItem('platformFeatures', { title: 'New Feature', description: 'Description', icon: 'Star', gradient: 'from-blue-500 to-cyan-500' })}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Feature
                      </Button>
                    </div>
                  )}

                  {/* Stats Section */}
                  {section.id === 'stats' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Show Statistics</span>
                        <Switch 
                          checked={customization.enableStats} 
                          onCheckedChange={(c) => updateCustomization('enableStats', c)} 
                        />
                      </div>
                      
                      {customization.stats.map((stat, index) => (
                        <Card key={index} className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Stat {index + 1}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeArrayItem('stats', index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input 
                              placeholder="Value" 
                              value={stat.value} 
                              onChange={(e) => updateNestedArray('stats', index, 'value', e.target.value)} 
                            />
                            <Input 
                              placeholder="Label" 
                              value={stat.label} 
                              onChange={(e) => updateNestedArray('stats', index, 'label', e.target.value)} 
                            />
                          </div>
                          <div className="flex gap-2">
                            <select 
                              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                              value={stat.icon}
                              onChange={(e) => updateNestedArray('stats', index, 'icon', e.target.value)}
                            >
                              {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                            </select>
                            <select 
                              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                              value={stat.gradient}
                              onChange={(e) => updateNestedArray('stats', index, 'gradient', e.target.value)}
                            >
                              {gradientOptions.map(g => <option key={g} value={g}>{g.replace('from-', '').replace(' to-', ' → ')}</option>)}
                            </select>
                          </div>
                        </Card>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => addArrayItem('stats', { icon: 'Star', value: '100+', label: 'New Stat', gradient: 'from-blue-500 to-cyan-500' })}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Stat
                      </Button>
                    </div>
                  )}

                  {/* Features Grid Section */}
                  {section.id === 'features' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Show Features Grid</span>
                        <Switch 
                          checked={customization.enableFeatures} 
                          onCheckedChange={(c) => updateCustomization('enableFeatures', c)} 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The features grid shows payment methods, dashboard preview, platforms, discounts, support, and other features.
                      </p>
                    </div>
                  )}

                  {/* Testimonials Section */}
                  {section.id === 'testimonials' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Show Testimonials</span>
                        <Switch 
                          checked={customization.enableTestimonials} 
                          onCheckedChange={(c) => updateCustomization('enableTestimonials', c)} 
                        />
                      </div>
                      
                      {customization.testimonials.map((testimonial, index) => (
                        <Card key={index} className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium">Testimonial {index + 1}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeArrayItem('testimonials', index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input 
                            placeholder="Customer Name" 
                            value={testimonial.name} 
                            onChange={(e) => updateNestedArray('testimonials', index, 'name', e.target.value)} 
                          />
                          <Textarea 
                            placeholder="Testimonial text" 
                            value={testimonial.text} 
                            onChange={(e) => updateNestedArray('testimonials', index, 'text', e.target.value)} 
                            rows={2}
                          />
                          <div className="flex gap-2 items-center">
                            <Label className="text-xs">Rating:</Label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => updateNestedArray('testimonials', index, 'rating', star)}
                                  className={`p-1 ${testimonial.rating >= star ? 'text-yellow-500' : 'text-muted-foreground'}`}
                                >
                                  <Star className="w-4 h-4 fill-current" />
                                </button>
                              ))}
                            </div>
                            <select 
                              className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                              value={testimonial.color || 'from-blue-500 to-cyan-500'}
                              onChange={(e) => updateNestedArray('testimonials', index, 'color', e.target.value)}
                            >
                              {gradientOptions.map(g => <option key={g} value={g}>{g.replace('from-', '').replace(' to-', ' → ')}</option>)}
                            </select>
                          </div>
                        </Card>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => addArrayItem('testimonials', { name: 'Customer Name', text: 'Great service!', rating: 5, color: 'from-blue-500 to-cyan-500' })}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Testimonial
                      </Button>
                    </div>
                  )}

                  {/* FAQ Section */}
                  {section.id === 'faqs' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                        <span className="font-medium">Show FAQ Section</span>
                        <Switch 
                          checked={customization.enableFAQs} 
                          onCheckedChange={(c) => updateCustomization('enableFAQs', c)} 
                        />
                      </div>
                      
                      {customization.faqs.map((faq, index) => (
                        <Card key={index} className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">FAQ {index + 1}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeArrayItem('faqs', index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Input 
                            placeholder="Question" 
                            value={faq.question} 
                            onChange={(e) => updateNestedArray('faqs', index, 'question', e.target.value)} 
                          />
                          <Textarea 
                            placeholder="Answer" 
                            value={faq.answer} 
                            onChange={(e) => updateNestedArray('faqs', index, 'answer', e.target.value)} 
                            rows={3}
                          />
                        </Card>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => addArrayItem('faqs', { question: 'New Question?', answer: 'Answer here...' })}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add FAQ
                      </Button>
                    </div>
                  )}

                  {/* Footer Section */}
                  {section.id === 'footer' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Footer About Text</Label>
                        <Textarea 
                          value={customization.footerAbout} 
                          onChange={(e) => updateCustomization('footerAbout', e.target.value)} 
                          rows={2}
                          placeholder="Brief description of your panel..."
                        />
                      </div>
                      <div>
                        <Label>Copyright Text</Label>
                        <Input 
                          value={customization.footerText} 
                          onChange={(e) => updateCustomization('footerText', e.target.value)} 
                          placeholder="© 2024 Your Panel. All rights reserved."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Social Links</Label>
                        {['facebook', 'twitter', 'instagram', 'telegram', 'discord'].map(social => (
                          <Input
                            key={social}
                            placeholder={`${social.charAt(0).toUpperCase() + social.slice(1)} URL`}
                            value={(customization.socialLinks as any)?.[social] || ''}
                            onChange={(e) => updateCustomization('socialLinks', { ...customization.socialLinks, [social]: e.target.value })}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {/* Right Panel - Live Preview */}
          <div className="flex-1 flex flex-col bg-[#0a0a12] min-h-[50vh] lg:min-h-0">
            {/* Preview Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 sm:p-3 border-b border-border/30 bg-card/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="px-2 sm:px-4 py-1 sm:py-1.5 bg-background/50 rounded-lg border border-border/30 flex items-center gap-2 max-w-[200px] sm:min-w-[300px]">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-primary" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-mono truncate">
                    {customization.companyName?.toLowerCase().replace(/\s+/g, '') || 'yourpanel'}.homeofsmm.com
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {/* Light/Dark Mode Toggle - Desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 p-0 transition-colors",
                    previewThemeMode === 'dark' 
                      ? "bg-slate-800 hover:bg-slate-700" 
                      : "bg-amber-100 hover:bg-amber-200"
                  )}
                  onClick={togglePreviewTheme}
                  title={previewThemeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {previewThemeMode === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                  )}
                </Button>

                {/* Device Toggle */}
                <div className="flex bg-background/50 rounded-lg p-0.5 sm:p-1 border border-border/30">
                  {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                    <Button
                      key={device}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-7 w-7 sm:h-8 sm:w-8 p-0',
                        previewDevice === device
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                      onClick={() => setPreviewDevice(device)}
                    >
                      {device === 'desktop' ? (
                        <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : device === 'tablet' ? (
                        <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={createPreview}
                  className="gap-1.5 sm:gap-2 h-7 sm:h-8 text-xs sm:text-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Open</span>
                </Button>
              </div>
            </div>

            {/* Live Preview Container - Fully Responsive */}
            <div className="flex-1 overflow-hidden p-2 sm:p-4 flex items-start justify-center bg-gradient-to-b from-[#0a0a12] to-[#0f0f1a]">
              <div
                className={cn(
                  'transition-all duration-500 ease-out origin-top rounded-lg sm:rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 w-full',
                  previewDevice === 'mobile' && 'max-w-[400px]',
                  previewDevice === 'tablet' && 'max-w-[900px]',
                  previewDevice === 'desktop' && 'max-w-[1200px]'
                )}
              >
                <div
                  className="w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-primary/20 bg-background"
                  style={{
                    height: 'calc(100vh - 180px)',
                    maxHeight: 'calc(100vh - 160px)',
                  }}
                >
                  <LivePreviewRenderer customization={{ ...customization, themeMode: previewThemeMode }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

