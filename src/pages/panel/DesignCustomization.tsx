import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useDesignHistory } from '@/hooks/use-design-history';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Save, ExternalLink, Smartphone, Tablet, Monitor, ChevronDown, Palette, Image, Layout, Zap, BarChart3, HelpCircle, MessageSquare, Loader2, Sparkles, Settings, Users, Star, Plus, Trash2, GripVertical, Shield, Headphones, Award, Clock, ShoppingCart, TrendingUp, CheckCircle, Heart, ThumbsUp, Undo2, Redo2, Wand2, Type, Maximize, Layers, MousePointer, Code, ChevronRight, Info } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MobileDesignEditor } from '@/components/design/MobileDesignEditor';
import { ThemeOne } from '@/components/themes/ThemeOne';

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
  
  // Colors
  primaryColor: '#6366F1',
  secondaryColor: '#8B5CF6',
  accentColor: '#EC4899',
  backgroundColor: '#0F172A',
  surfaceColor: '#1E293B',
  textColor: '#FFFFFF',
  
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

  // Platform Features
  platformFeatures: [
    { title: 'Lightning Fast', description: 'Orders start within seconds', icon: 'Zap', gradient: 'from-yellow-500 to-orange-500' },
    { title: 'Secure Payments', description: 'Multiple payment methods', icon: 'Shield', gradient: 'from-green-500 to-emerald-500' },
    { title: '24/7 Support', description: 'Always here to help', icon: 'Headphones', gradient: 'from-blue-500 to-cyan-500' },
    { title: 'High Quality', description: 'Real engagement only', icon: 'Award', gradient: 'from-purple-500 to-pink-500' },
  ] as PlatformFeature[],
  
  // Stats
  stats: [
    { icon: 'Users', value: '50K+', label: 'Active Users', gradient: 'from-blue-500 to-cyan-500' },
    { icon: 'ShoppingCart', value: '2M+', label: 'Orders Completed', gradient: 'from-green-500 to-emerald-500' },
    { icon: 'Clock', value: '0-1hr', label: 'Average Delivery', gradient: 'from-purple-500 to-pink-500' },
    { icon: 'Star', value: '99.9%', label: 'Success Rate', gradient: 'from-yellow-500 to-orange-500' },
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

const themes = [
  { 
    id: 'dark_gradient', 
    name: 'Dark Gradient', 
    colors: ['#0F172A', '#6366F1', '#8B5CF6'],
    sections: {
      enablePlatformFeatures: true,
      enableStats: true,
      enableFeatures: true,
      enableTestimonials: true,
      enableFAQs: true,
    },
  },
  { 
    id: 'ocean_blue', 
    name: 'Ocean Blue', 
    colors: ['#0C4A6E', '#0EA5E9', '#38BDF8'],
    sections: {
      enablePlatformFeatures: true,
      enableStats: true,
      enableFeatures: true,
      enableTestimonials: true,
      enableFAQs: true,
    },
  },
  { 
    id: 'forest_green', 
    name: 'Forest Green', 
    colors: ['#14532D', '#22C55E', '#4ADE80'],
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
    colors: ['#FFFFFF', '#3B82F6', '#1E40AF'],
    sections: {
      enablePlatformFeatures: true,
      enableStats: true,
      enableFeatures: true,
      enableTestimonials: false,
      enableFAQs: false,
    },
  },
  { 
    id: 'vibrant', 
    name: 'Vibrant', 
    colors: ['#FFF7ED', '#F97316', '#F59E0B'],
    sections: {
      enablePlatformFeatures: true,
      enableStats: false,
      enableFeatures: true,
      enableTestimonials: true,
      enableFAQs: true,
    },
  },
  { 
    id: 'midnight', 
    name: 'Midnight', 
    colors: ['#020617', '#7C3AED', '#A855F7'],
    sections: {
      enablePlatformFeatures: true,
      enableStats: true,
      enableFeatures: true,
      enableTestimonials: true,
      enableFAQs: true,
    },
  },
];

// Design Presets - One-click beautiful designs
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
      textColor: defaultCustomization.textColor,
      surfaceColor: defaultCustomization.surfaceColor,
      selectedTheme: 'dark_gradient',
      heroVariant: 'ali_panel',
      faqVariant: 'glass_cards',
      navVariant: 'floating_glass',
      footerVariant: 'classic_columns',
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
      textColor: '#FFFFFF',
      surfaceColor: '#1E293B',
      selectedTheme: 'dark_gradient',
      heroVariant: 'ali_panel',
      faqVariant: 'glass_cards',
      navVariant: 'floating_glass',
      footerVariant: 'classic_columns',
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
      textColor: '#FFFFFF',
      surfaceColor: '#0e5a82',
      selectedTheme: 'ocean_blue',
      heroVariant: 'professional_quick_order',
      faqVariant: 'simple_accordion',
      navVariant: 'solid',
      footerVariant: 'compact_columns',
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
      textColor: '#FFFFFF',
      surfaceColor: '#2A1F1A',
      selectedTheme: 'vibrant',
      heroVariant: 'promo_cards',
      faqVariant: 'cards',
      navVariant: 'floating_solid',
      footerVariant: 'promo_columns',
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
      textColor: '#FFFFFF',
      surfaceColor: '#162419',
      selectedTheme: 'forest_green',
      heroVariant: 'forest_split',
      faqVariant: 'bordered_cards',
      navVariant: 'solid_transparent',
      footerVariant: 'earthy_columns',
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
      textColor: '#FFFFFF',
      surfaceColor: '#1E293B',
      selectedTheme: 'theme_one',
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
      textColor: '#FFFFFF',
      surfaceColor: '#0e5a82',
      selectedTheme: 'theme_two',
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
      textColor: '#FFFFFF',
      surfaceColor: '#2A1F1A',
      selectedTheme: 'theme_three',
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
      textColor: '#FFFFFF',
      surfaceColor: '#162419',
      selectedTheme: 'theme_four',
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
      textColor: '#FFFFFF',
      surfaceColor: '#1a1a2e',
      selectedTheme: 'theme_one',
    }
  },
  {
    id: 'ocean_breeze',
    name: 'Ocean Breeze',
    description: 'Cool blues with cyan highlights',
    preview: ['#0C4A6E', '#0EA5E9', '#38BDF8'],
    customization: {
      backgroundColor: '#0C4A6E',
      primaryColor: '#0EA5E9',
      secondaryColor: '#38BDF8',
      textColor: '#FFFFFF',
      surfaceColor: '#0e5a82',
      selectedTheme: 'theme_two',
    }
  },
  {
    id: 'sunset_glow',
    name: 'Sunset Glow',
    description: 'Warm oranges with light background',
    preview: ['#FFF7ED', '#F97316', '#EF4444'],
    customization: {
      backgroundColor: '#FFF7ED',
      primaryColor: '#F97316',
      secondaryColor: '#EF4444',
      textColor: '#1F2937',
      surfaceColor: '#FFFFFF',
      selectedTheme: 'theme_three',
    }
  },
  {
    id: 'forest_premium',
    name: 'Forest Premium',
    description: 'Natural greens with earthy tones',
    preview: ['#14532D', '#22C55E', '#4ADE80'],
    customization: {
      backgroundColor: '#14532D',
      primaryColor: '#22C55E',
      secondaryColor: '#4ADE80',
      textColor: '#FFFFFF',
      surfaceColor: '#166534',
      selectedTheme: 'theme_four',
    }
  },
  {
    id: 'royal_purple',
    name: 'Royal Purple',
    description: 'Elegant purple with violet accents',
    preview: ['#1E1B4B', '#7C3AED', '#A855F7'],
    customization: {
      backgroundColor: '#1E1B4B',
      primaryColor: '#7C3AED',
      secondaryColor: '#A855F7',
      textColor: '#FFFFFF',
      surfaceColor: '#312e81',
      selectedTheme: 'theme_one',
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
      textColor: '#1F2937',
      surfaceColor: '#F8FAFC',
      selectedTheme: 'theme_two',
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
      textColor: '#FFFFFF',
      surfaceColor: '#27272a',
      selectedTheme: 'theme_three',
    }
  },
  {
    id: 'professional_dark',
    name: 'Professional Dark',
    description: 'Sleek dark with blue highlights',
    preview: ['#1F2937', '#3B82F6', '#60A5FA'],
    customization: {
      backgroundColor: '#1F2937',
      primaryColor: '#3B82F6',
      secondaryColor: '#60A5FA',
      textColor: '#FFFFFF',
      surfaceColor: '#374151',
      selectedTheme: 'theme_two',
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
      textColor: '#E5E7EB',
      surfaceColor: '#020617',
      selectedTheme: 'theme_two',
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
      textColor: '#F9FAFB',
      surfaceColor: '#020617',
      selectedTheme: 'theme_one',
    }
  },
  {
    id: 'smm_clean_light',
    name: 'SMM Clean Light',
    description: 'Clean light layout with subtle gray sections',
    preview: ['#F9FAFB', '#0F172A', '#6366F1'],
    customization: {
      backgroundColor: '#F9FAFB',
      primaryColor: '#6366F1',
      secondaryColor: '#0F172A',
      textColor: '#0F172A',
      surfaceColor: '#FFFFFF',
      selectedTheme: 'theme_two',
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

// Live Preview Renderer using ThemeOne
function LivePreviewRenderer({ customization }: { customization: any }) {
  const mockPanel = {
    name: customization.companyName || 'Your Panel',
    logo_url: customization.logoUrl,
    primary_color: customization.primaryColor,
    secondary_color: customization.secondaryColor,
  };

  return (
    <ThemeOne
      panel={mockPanel}
      services={[]}
      customization={customization}
    />
  );
}

export default function DesignCustomization() {
  const [panelId, setPanelId] = useState<string | null>(null);
  const [panelSubdomain, setPanelSubdomain] = useState<string>('');
  const [panelCustomDomain, setPanelCustomDomain] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ presets: true, themes: true });
  const [showAllPresets, setShowAllPresets] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
        .select('id, name, custom_branding, theme_type, subdomain, custom_domain')
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
        selectedTheme: branding.selectedTheme || panelData.theme_type || 'dark_gradient', 
        ...branding 
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
      const { error } = await supabase.from('panels').update({ 
        custom_branding: customization as unknown as Json, 
        theme_type: customization.selectedTheme as any 
      }).eq('id', panelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel-design-settings'] });
      queryClient.invalidateQueries({ queryKey: ['panel-customization', panelId] });
      toast({ title: 'Design saved!' }); 
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
        return (
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
        return (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Current Theme</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: customization.backgroundColor }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: customization.primaryColor }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: customization.secondaryColor }} />
                </div>
                <span className="text-xs">{customization.selectedTheme || 'Custom'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {themes.map(theme => (
                <button 
                  key={theme.id} 
                  onClick={() => applyTheme(theme.id)} 
                  className={`p-3 rounded-xl border-2 transition-all ${customization.selectedTheme === theme.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                >
                  <div className="flex gap-1 mb-2">
                    {theme.colors.map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-left">{theme.name}</p>
                  {customization.selectedTheme === theme.id && (
                    <Badge variant="secondary" className="mt-1 text-[10px]">Active</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case 'branding':
        return (
          <div className="space-y-4">
            <div>
              <Label>Logo URL</Label>
              <Input value={customization.logoUrl} onChange={(e) => updateCustomization('logoUrl', e.target.value)} placeholder="https://..." />
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
      default:
        return <p className="text-sm text-muted-foreground">Configure {sectionId} settings</p>;
    }
  };

  const sections = [
    { id: 'presets', title: 'Design Presets', icon: Wand2 },
    { id: 'themes', title: 'Theme Gallery', icon: Palette },
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

  // Mobile view uses the MobileDesignEditor component
  if (isMobile) {
    return (
      <MobileDesignEditor
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving}
        onSave={handleSave}
        renderSection={renderSectionContent}
        currentTheme={customization.selectedTheme}
        primaryColor={customization.primaryColor}
        secondaryColor={customization.secondaryColor}
      >
        <LivePreviewRenderer customization={customization} />
      </MobileDesignEditor>
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
                  onClick={() => setOpenSections(prev => ({ ...prev, themes: true, presets: true }))}
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
                    <p className="text-xs text-muted-foreground">Click here or scroll to "Theme Gallery" in the left panel to pick a new theme or preset.</p>
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
                        ? `https://${panelSubdomain}.smmpilot.online`
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
                    ? `Opens ${panelSubdomain}.smmpilot.online in new tab`
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
                          const defaultPreset = designPresets.find(p => p.id === 'my_default_theme') || designPresets[0];
                          const merged = {
                            ...defaultCustomization,
                            ...(defaultPreset?.customization || {}),
                          };
                          resetHistory(merged);
                          setHasUnsavedChanges(true);
                          toast({ title: 'Reset to defaults' });
                        }}
                      >
                        Reset to Default
                      </Button>
                    </div>
                  )}

                  {/* Themes Section */}
                  {section.id === 'themes' && (
                    <div className="grid grid-cols-2 gap-3">
                      {themes.map(theme => (
                        <button 
                          key={theme.id} 
                          onClick={() => applyTheme(theme.id)} 
                          className={`p-3 rounded-xl border-2 transition-all ${customization.selectedTheme === theme.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                        >
                          <div className="flex gap-1 mb-2">
                            {theme.colors.map((c, i) => (
                              <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <p className="text-xs font-medium text-left">{theme.name}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Branding Section */}
                  {section.id === 'branding' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Logo URL</Label>
                        <Input value={customization.logoUrl} onChange={(e) => updateCustomization('logoUrl', e.target.value)} placeholder="https://..." />
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
                    {customization.companyName?.toLowerCase().replace(/\s+/g, '') || 'yourpanel'}.smmpilot.online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
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
                  <LivePreviewRenderer customization={customization} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

