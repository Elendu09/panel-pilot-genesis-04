import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useDesignHistory } from '@/hooks/use-design-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Save, ExternalLink, Smartphone, Tablet, Monitor, ChevronDown, Palette, Image, Layout, Zap, BarChart3, HelpCircle, MessageSquare, Loader2, Sparkles, Settings, Users, Star, Plus, Trash2, GripVertical, Shield, Headphones, Award, Clock, ShoppingCart, TrendingUp, CheckCircle, Heart, ThumbsUp, Undo2, Redo2, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  
  // Typography
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: '12',
  
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
};

const themes = [
  { id: 'dark_gradient', name: 'Dark Gradient', colors: ['#0F172A', '#6366F1', '#8B5CF6'] },
  { id: 'ocean_blue', name: 'Ocean Blue', colors: ['#0C4A6E', '#0EA5E9', '#38BDF8'] },
  { id: 'forest_green', name: 'Forest Green', colors: ['#14532D', '#22C55E', '#4ADE80'] },
  { id: 'professional', name: 'Professional', colors: ['#FFFFFF', '#3B82F6', '#1E40AF'] },
  { id: 'vibrant', name: 'Vibrant', colors: ['#FFF7ED', '#F97316', '#F59E0B'] },
  { id: 'midnight', name: 'Midnight', colors: ['#020617', '#7C3AED', '#A855F7'] },
];

// Design Presets - One-click beautiful designs
const designPresets = [
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
      selectedTheme: 'midnight_aurora',
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
      selectedTheme: 'ocean_breeze',
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
      selectedTheme: 'sunset_glow',
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
      selectedTheme: 'forest_premium',
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
      selectedTheme: 'royal_purple',
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
      selectedTheme: 'minimal_light',
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
      selectedTheme: 'neon_dreams',
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
      selectedTheme: 'professional_dark',
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

export default function DesignCustomization() {
  const [panelId, setPanelId] = useState<string | null>(null);
  const [panelSubdomain, setPanelSubdomain] = useState<string>('');
  const [panelCustomDomain, setPanelCustomDomain] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ presets: true, themes: false });
  const { toast } = useToast();

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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
        if (!profile) return;
        const { data: panel } = await supabase.from('panels').select('id, name, custom_branding, theme_type, subdomain, custom_domain').eq('owner_id', profile.id).single();
        if (panel) {
          setPanelId(panel.id);
          setPanelSubdomain(panel.subdomain || '');
          setPanelCustomDomain(panel.custom_domain || '');
          const branding = panel.custom_branding as any || {};
          const loadedCustomization = { 
            ...defaultCustomization, 
            companyName: panel.name || '', 
            selectedTheme: branding.selectedTheme || panel.theme_type || 'dark_gradient', 
            ...branding 
          };
          resetHistory(loadedCustomization);
        }
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const updateCustomization = (key: string, value: any) => { 
    setCustomization(prev => ({ ...prev, [key]: value })); 
    setHasUnsavedChanges(true); 
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
      setCustomization(prev => ({ 
        ...prev, 
        selectedTheme: themeId, 
        backgroundColor: theme.colors[0], 
        primaryColor: theme.colors[1], 
        secondaryColor: theme.colors[2] 
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

  const handleSave = async () => {
    if (!panelId) return;
    setSaving(true);
    try {
      await supabase.from('panels').update({ 
        custom_branding: customization as unknown as Json, 
        theme_type: customization.selectedTheme as any 
      }).eq('id', panelId);
      toast({ title: 'Design saved!' }); 
      setHasUnsavedChanges(false);
    } catch (error: any) { 
      toast({ title: 'Error', description: error.message, variant: 'destructive' }); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const sections = [
    { id: 'presets', title: 'Design Presets', icon: Wand2 },
    { id: 'themes', title: 'Theme Gallery', icon: Palette },
    { id: 'branding', title: 'Branding', icon: Image },
    { id: 'colors', title: 'Colors', icon: Sparkles },
    { id: 'hero', title: 'Hero Section', icon: Layout },
    { id: 'platform', title: 'Platform Features', icon: Zap },
    { id: 'stats', title: 'Statistics', icon: BarChart3 },
    { id: 'features', title: 'Features Grid', icon: Settings },
    { id: 'testimonials', title: 'Testimonials', icon: Users },
    { id: 'faqs', title: 'FAQ Section', icon: HelpCircle },
    { id: 'footer', title: 'Footer', icon: MessageSquare },
  ];

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

            <div className="w-px h-6 bg-border mx-1" />
            
            <Button variant="outline" size="sm" onClick={() => window.open('/storefront-preview', '_blank')}>
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
                          resetHistory(defaultCustomization);
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

                  {/* Hero Section */}
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
          <div className="flex-1 flex flex-col bg-[#0a0a12]">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-3 border-b border-border/30 bg-card/30">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="px-4 py-1.5 bg-background/50 rounded-lg border border-border/30 flex items-center gap-2 min-w-[300px]">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <ExternalLink className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono truncate">
                    {customization.companyName?.toLowerCase().replace(/\s+/g, '') || 'yourpanel'}.smmpilot.online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Device Toggle */}
                <div className="flex bg-background/50 rounded-lg p-1 border border-border/30">
                  {(['desktop', 'tablet', 'mobile'] as const).map(device => (
                    <Button 
                      key={device} 
                      variant="ghost"
                      size="sm" 
                      className={`h-8 w-8 p-0 ${previewDevice === device ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      onClick={() => setPreviewDevice(device)}
                    >
                      {device === 'desktop' ? <Monitor className="w-4 h-4" /> : 
                       device === 'tablet' ? <Tablet className="w-4 h-4" /> : 
                       <Smartphone className="w-4 h-4" />}
                    </Button>
                  ))}
                </div>
                
                <Button variant="outline" size="sm" onClick={() => window.open('/storefront-preview', '_blank')} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>
              </div>
            </div>
            
            {/* Live Preview Container */}
            <div className="flex-1 overflow-hidden p-4 flex items-start justify-center">
              <div 
                className={`transition-all duration-500 ease-out origin-top rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 ${
                  previewDevice === 'mobile' ? 'w-[375px]' : 
                  previewDevice === 'tablet' ? 'w-[768px]' : 'w-full max-w-[1200px]'
                }`}
                style={{ 
                  height: previewDevice === 'mobile' ? '667px' : previewDevice === 'tablet' ? '100%' : '100%',
                }}
              >
                <div 
                  className="w-full h-full overflow-auto"
                  style={{
                    transform: previewDevice === 'desktop' ? 'scale(0.7)' : previewDevice === 'tablet' ? 'scale(0.85)' : 'scale(1)',
                    transformOrigin: 'top center',
                    width: previewDevice === 'desktop' ? '142.85%' : previewDevice === 'tablet' ? '117.65%' : '100%',
                    height: previewDevice === 'desktop' ? '142.85%' : previewDevice === 'tablet' ? '117.65%' : '100%',
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

// Live Preview Renderer using ThemeOne
import { ThemeOne } from "@/components/themes/ThemeOne";

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
