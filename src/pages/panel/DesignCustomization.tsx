import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ImageUpload } from "@/components/panel/ImageUpload";
import { ThemePreviewCard } from "@/components/design/ThemePreviewCard";
import { SocialIconSelector } from "@/components/design/SocialIconSelector";
import { AccessibilitySettings } from "@/components/design/AccessibilitySettings";
import { 
  Palette, 
  Eye, 
  Sparkles, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Code, 
  Layout, 
  Image,
  RotateCcw,
  ExternalLink,
  Lock,
  Check,
  Loader2,
  RefreshCw,
  Wand2,
  Type,
  PaintBucket,
  AlertCircle,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  CheckCircle,
  Accessibility,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Hash
} from "lucide-react";
import { LiveStorefrontPreview } from "@/components/design/LiveStorefrontPreview";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const DesignCustomization = () => {
  const { toast } = useToast();
  const [panelId, setPanelId] = useState<string | null>(null);
  const [panelSubdomain, setPanelSubdomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("dark_gradient");
  const [activeTab, setActiveTab] = useState("themes");
  const [previewMode, setPreviewMode] = useState<"local" | "live">("local");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isPro] = useState(true); // Simulated pro status

  const [customization, setCustomization] = useState({
    primaryColor: "#8B5CF6",
    secondaryColor: "#06B6D4",
    accentColor: "#F59E0B",
    backgroundColor: "#0F172A",
    surfaceColor: "#1E293B",
    textColor: "#F8FAFC",
    mutedColor: "#94A3B8",
    borderRadius: "12",
    fontFamily: "Inter, system-ui, sans-serif",
    logoUrl: "",
    faviconUrl: "",
    heroImage: "",
    companyName: "MyAwesome Panel",
    tagline: "The best SMM panel for your business",
    customCSS: "",
    customJS: "",
    headerTitle: "MyAwesome Panel",
    footerText: "© 2024 MyAwesome Panel. All rights reserved.",
    headerStyle: "sticky",
    navStyle: "sidebar",
    showHero: true,
    showFeatures: true,
    showStats: true,
    showTestimonials: true,
    showFaqs: true,
    // Editable content
    heroTitle: "Grow Your Social Media Presence",
    heroSubtitle: "The #1 SMM Panel for Instagram, TikTok, YouTube and more. Start growing today!",
    heroCta: "Get Started",
    features: [
      { icon: "Zap", title: "Lightning Fast", description: "Orders start within seconds" },
      { icon: "Shield", title: "100% Safe", description: "Secure payment & delivery" },
      { icon: "Clock", title: "24/7 Support", description: "We're always here to help" },
      { icon: "TrendingUp", title: "Real Results", description: "Genuine engagement growth" },
    ],
    stats: [
      { value: "10K+", label: "Happy Customers" },
      { value: "50K+", label: "Orders Completed" },
      { value: "99.9%", label: "Uptime" },
    ],
    faqs: [
      { question: "How fast are orders delivered?", answer: "Most orders start within 0-15 minutes and complete within 24 hours depending on the service." },
      { question: "Is it safe for my account?", answer: "Yes! We use safe delivery methods that comply with platform guidelines to protect your account." },
      { question: "What payment methods do you accept?", answer: "We accept all major payment methods including PayPal, credit cards, and cryptocurrency." },
      { question: "Can I get a refund?", answer: "Yes, we offer refunds for undelivered orders. Contact our support team for assistance." },
    ],
    footerAbout: "Your trusted SMM partner since 2020. We help businesses and influencers grow their social media presence.",
    footerContact: "support@example.com",
  });

  const themes = [
    {
      id: "dark_gradient",
      name: "Dark Gradient",
      colors: { primary: "#8B5CF6", secondary: "#06B6D4", bg: "#0F172A", surface: "#1E293B" },
      preview: "bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900",
      description: "Modern dark theme with gradient accents"
    },
    {
      id: "light_minimal",
      name: "Light Minimal",
      colors: { primary: "#3B82F6", secondary: "#10B981", bg: "#FFFFFF", surface: "#F8FAFC" },
      preview: "bg-gradient-to-br from-gray-50 to-white border border-gray-200",
      description: "Clean and professional light theme"
    },
    {
      id: "neon_glow",
      name: "Neon Glow",
      colors: { primary: "#00FF88", secondary: "#FF00FF", bg: "#0A0A0A", surface: "#1A1A2E" },
      preview: "bg-gradient-to-br from-purple-950 via-black to-cyan-950",
      description: "Vibrant neon colors with dark base"
    },
    {
      id: "ocean_blue",
      name: "Ocean Blue",
      colors: { primary: "#0EA5E9", secondary: "#06B6D4", bg: "#0C1929", surface: "#132F4C" },
      preview: "bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950",
      description: "Deep ocean inspired palette"
    },
    {
      id: "forest_green",
      name: "Forest Green",
      colors: { primary: "#22C55E", secondary: "#84CC16", bg: "#0D1F12", surface: "#1A2F1C" },
      preview: "bg-gradient-to-br from-green-950 via-slate-900 to-emerald-950",
      description: "Natural green tones"
    },
    {
      id: "sunset_orange",
      name: "Sunset Orange",
      colors: { primary: "#F97316", secondary: "#EF4444", bg: "#1C1410", surface: "#2D1F1A" },
      preview: "bg-gradient-to-br from-orange-950 via-slate-900 to-red-950",
      description: "Warm sunset vibes"
    },
    {
      id: "royal_purple",
      name: "Royal Purple",
      colors: { primary: "#A855F7", secondary: "#EC4899", bg: "#1A0F1C", surface: "#2D1B30" },
      preview: "bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950",
      description: "Luxurious purple palette"
    },
    {
      id: "corporate",
      name: "Corporate Clean",
      colors: { primary: "#2563EB", secondary: "#64748B", bg: "#F8FAFC", surface: "#FFFFFF" },
      preview: "bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200",
      description: "Professional business look"
    },
    {
      id: "grace_cometh",
      name: "Grace Cometh",
      colors: { primary: "#8B6914", secondary: "#D4A84B", bg: "#0A0A0A", surface: "#1A1410" },
      preview: "bg-gradient-to-br from-amber-950 via-slate-950 to-yellow-950",
      description: "Warm golden tones with elegant dark base"
    },
  ];

  // Load customization from database on mount
  useEffect(() => {
    const loadDesignSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;

        const { data: panel, error } = await supabase
          .from('panels')
          .select('id, subdomain, custom_branding, theme_type, primary_color, secondary_color, name')
          .eq('owner_id', profile.id)
          .single();

        if (error) throw error;
        if (!panel) return;

        setPanelId(panel.id);
        setPanelSubdomain(panel.subdomain);

        // Load saved customization from custom_branding
        if (panel.custom_branding && typeof panel.custom_branding === 'object') {
          const saved = panel.custom_branding as Record<string, any>;
          setCustomization(prev => ({
            ...prev,
            ...saved,
            companyName: saved.companyName || panel.name || prev.companyName,
            primaryColor: saved.primaryColor || panel.primary_color || prev.primaryColor,
            secondaryColor: saved.secondaryColor || panel.secondary_color || prev.secondaryColor,
          }));
          if (saved.selectedTheme) {
            setSelectedTheme(saved.selectedTheme);
          }
        } else {
          // Use panel defaults
          setCustomization(prev => ({
            ...prev,
            companyName: panel.name || prev.companyName,
            primaryColor: panel.primary_color || prev.primaryColor,
            secondaryColor: panel.secondary_color || prev.secondaryColor,
          }));
        }
      } catch (err) {
        console.error('Error loading design settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDesignSettings();
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setSelectedTheme(themeId);
      setCustomization(prev => ({
        ...prev,
        primaryColor: theme.colors.primary,
        secondaryColor: theme.colors.secondary,
        backgroundColor: theme.colors.bg,
        surfaceColor: theme.colors.surface,
      }));
      toast({
        title: "Theme applied",
        description: `${theme.name} theme has been applied.`,
      });
    }
  };

  const generateAITheme = async () => {
    if (!aiPrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please describe the theme you want to generate.",
      });
      return;
    }

    setIsGeneratingTheme(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-theme', {
        body: { prompt: aiPrompt }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const colors = data.colors;
      
      setCustomization(prev => ({
        ...prev,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        accentColor: colors.accent,
        backgroundColor: colors.background,
        surfaceColor: colors.surface,
        textColor: colors.text,
      }));
      
      toast({
        title: "AI Theme Generated",
        description: "Your custom theme has been created based on your prompt.",
      });
    } catch (error) {
      console.error("Failed to generate theme:", error);
      toast({
        variant: "destructive",
        title: "Failed to generate theme",
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  const handleSave = async () => {
    if (!panelId) {
      toast({ variant: "destructive", title: "No panel found" });
      return;
    }

    setSaving(true);
    try {
      // Save all customization to custom_branding jsonb field
      const brandingData = {
        ...customization,
        selectedTheme,
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('panels')
        .update({
          custom_branding: brandingData,
          primary_color: customization.primaryColor,
          secondary_color: customization.secondaryColor,
          theme_type: selectedTheme as any,
        })
        .eq('id', panelId);

      if (error) throw error;

      toast({
        title: "Design saved!",
        description: "Your panel design is now live on your storefront.",
      });
    } catch (err) {
      console.error('Error saving design:', err);
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const generatePreviewUrl = () => {
    const previewId = crypto.randomUUID().slice(0, 12);
    const previewData = {
      ...customization,
      expiresAt: Date.now() + 30 * 60 * 1000 // 30 min expiry
    };
    
    // Store preview data in localStorage
    localStorage.setItem(`preview_${previewId}`, JSON.stringify(previewData));
    
    // Generate URL using main domain
    return `/preview/${previewId}`;
  };

  const handlePreviewNewTab = () => {
    const previewUrl = generatePreviewUrl();
    window.open(previewUrl, '_blank');
    toast({
      title: "Preview opened",
      description: "Preview link is valid for 30 minutes.",
    });
  };

  const resetColors = () => {
    const theme = themes.find(t => t.id === selectedTheme);
    if (theme) {
      setCustomization(prev => ({
        ...prev,
        primaryColor: theme.colors.primary,
        secondaryColor: theme.colors.secondary,
        backgroundColor: theme.colors.bg,
        surfaceColor: theme.colors.surface,
      }));
      toast({ title: "Colors reset to theme defaults" });
    }
  };

  const deviceSizes = {
    desktop: { width: "100%", maxWidth: "100%" },
    tablet: { width: "768px", maxWidth: "768px" },
    mobile: { width: "375px", maxWidth: "375px" },
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
      {/* Left Panel - Settings */}
      <div className="lg:w-[55%] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Design Customization</h1>
            <p className="text-muted-foreground text-sm">Customize your panel's appearance</p>
          </div>
          <Button onClick={handleSave} disabled={saving || loading} className="bg-gradient-to-r from-primary to-primary/80">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 p-1 mb-4 min-w-max">
              <TabsTrigger value="themes" className="gap-2">
                <Palette className="w-4 h-4" />
                Themes
              </TabsTrigger>
              <TabsTrigger value="colors" className="gap-2">
                <PaintBucket className="w-4 h-4" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="content" className="gap-2">
                <Type className="w-4 h-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="branding" className="gap-2">
                <Image className="w-4 h-4" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-2">
                <Share2 className="w-4 h-4" />
                Social
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="gap-2">
                <Accessibility className="w-4 h-4" />
                A11y
              </TabsTrigger>
              <TabsTrigger value="layout" className="gap-2">
                <Layout className="w-4 h-4" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code className="w-4 h-4" />
                Code
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {/* Themes Tab */}
            <TabsContent value="themes" className="m-0 space-y-4">
              {/* AI Theme Generator */}
              <Card className="bg-gradient-to-br from-primary/10 via-card to-secondary/10 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Theme Generator
                    {!isPro && (
                      <Badge variant="secondary" className="ml-2 gap-1">
                        <Lock className="w-3 h-3" /> PRO
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Describe your ideal theme and let AI create it for you
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Modern dark tech theme with blue accents"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      disabled={!isPro || isGeneratingTheme}
                      className="bg-background/50"
                    />
                    <Button 
                      onClick={generateAITheme} 
                      disabled={!isPro || isGeneratingTheme}
                      className="gap-2 min-w-[140px]"
                    >
                      {isGeneratingTheme ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Dark minimal", "Vibrant gaming", "Corporate blue", "Nature green"].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setAiPrompt(suggestion)}
                        disabled={!isPro}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Theme Gallery */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Theme Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map((theme) => (
                      <motion.div
                        key={theme.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative p-3 border rounded-xl cursor-pointer transition-all",
                          selectedTheme === theme.id 
                            ? "border-primary ring-2 ring-primary/20" 
                            : "border-border/50 hover:border-primary/50"
                        )}
                        onClick={() => applyTheme(theme.id)}
                      >
                        <div className={cn("w-full h-16 rounded-lg mb-2", theme.preview)} />
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">{theme.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{theme.description}</p>
                          </div>
                          {selectedTheme === theme.id && (
                            <div className="bg-primary rounded-full p-1">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        {/* Color dots */}
                        <div className="flex gap-1 mt-2">
                          <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: theme.colors.primary }} />
                          <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: theme.colors.secondary }} />
                          <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: theme.colors.bg }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="m-0 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Color Scheme</CardTitle>
                  <Button variant="outline" size="sm" onClick={resetColors} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "primaryColor", label: "Primary" },
                      { key: "secondaryColor", label: "Secondary" },
                      { key: "accentColor", label: "Accent" },
                      { key: "backgroundColor", label: "Background" },
                      { key: "surfaceColor", label: "Surface" },
                      { key: "textColor", label: "Text" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <Label className="text-sm">{label}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={(customization as any)[key]}
                            onChange={(e) => setCustomization({...customization, [key]: e.target.value})}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={(customization as any)[key]}
                            onChange={(e) => setCustomization({...customization, [key]: e.target.value})}
                            className="flex-1 font-mono text-sm bg-background/50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Font Family Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Font Family</Label>
                    <Select
                      value={customization.fontFamily}
                      onValueChange={(value) => setCustomization({...customization, fontFamily: value})}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                        <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                        <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                        <SelectItem value="'Space Grotesk', sans-serif">Space Grotesk</SelectItem>
                        <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                        <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                        <SelectItem value="Nunito, sans-serif">Nunito</SelectItem>
                        <SelectItem value="Raleway, sans-serif">Raleway</SelectItem>
                        <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Choose a Google Font for your storefront</p>
                  </div>

                  {/* Border Radius Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Border Radius</Label>
                      <Badge variant="outline" className="font-mono">{customization.borderRadius}px</Badge>
                    </div>
                    <Slider
                      value={[parseInt(customization.borderRadius)]}
                      onValueChange={(v) => setCustomization({...customization, borderRadius: v[0].toString()})}
                      min={0}
                      max={24}
                      step={2}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Square (0px)</span>
                      <span>Rounded (12px)</span>
                      <span>Pill (24px)</span>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="p-4 border border-border/50" style={{ backgroundColor: customization.backgroundColor, borderRadius: `${customization.borderRadius}px`, fontFamily: customization.fontFamily }}>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <div className="px-4 py-2 text-sm font-medium" style={{ backgroundColor: customization.primaryColor, color: "#fff", borderRadius: `${customization.borderRadius}px` }}>
                        Primary
                      </div>
                      <div className="px-4 py-2 text-sm font-medium" style={{ backgroundColor: customization.secondaryColor, color: "#fff", borderRadius: `${customization.borderRadius}px` }}>
                        Secondary
                      </div>
                      <div className="px-4 py-2 text-sm font-medium" style={{ backgroundColor: customization.accentColor, color: "#fff", borderRadius: `${customization.borderRadius}px` }}>
                        Accent
                      </div>
                    </div>
                    <div className="p-3" style={{ backgroundColor: customization.surfaceColor, borderRadius: `${customization.borderRadius}px` }}>
                      <p style={{ color: customization.textColor }} className="text-sm">Sample text on surface</p>
                      <p style={{ color: customization.mutedColor }} className="text-xs">Muted text example</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab - Edit homepage text */}
            <TabsContent value="content" className="m-0 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Hero Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hero Title</Label>
                    <Input
                      value={customization.heroTitle}
                      onChange={(e) => setCustomization({...customization, heroTitle: e.target.value})}
                      placeholder="Main headline for your homepage"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Subtitle</Label>
                    <Textarea
                      value={customization.heroSubtitle}
                      onChange={(e) => setCustomization({...customization, heroSubtitle: e.target.value})}
                      placeholder="Supporting text under the headline"
                      className="bg-background/50"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input
                      value={customization.heroCta}
                      onChange={(e) => setCustomization({...customization, heroCta: e.target.value})}
                      placeholder="Get Started"
                      className="bg-background/50"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Features Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customization.features.map((feature, index) => (
                    <div key={index} className="p-3 rounded-lg bg-background/50 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">Feature {index + 1}</Badge>
                      </div>
                      <Input
                        value={feature.title}
                        onChange={(e) => {
                          const newFeatures = [...customization.features];
                          newFeatures[index].title = e.target.value;
                          setCustomization({...customization, features: newFeatures});
                        }}
                        placeholder="Feature title"
                        className="bg-background/80"
                      />
                      <Input
                        value={feature.description}
                        onChange={(e) => {
                          const newFeatures = [...customization.features];
                          newFeatures[index].description = e.target.value;
                          setCustomization({...customization, features: newFeatures});
                        }}
                        placeholder="Feature description"
                        className="bg-background/80"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    FAQs Section
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customization.faqs.map((faq, index) => (
                    <div key={index} className="p-3 rounded-lg bg-background/50 space-y-2">
                      <Input
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...customization.faqs];
                          newFaqs[index].question = e.target.value;
                          setCustomization({...customization, faqs: newFaqs});
                        }}
                        placeholder="Question"
                        className="bg-background/80 font-medium"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...customization.faqs];
                          newFaqs[index].answer = e.target.value;
                          setCustomization({...customization, faqs: newFaqs});
                        }}
                        placeholder="Answer"
                        className="bg-background/80"
                        rows={2}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Footer Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>About Text</Label>
                    <Textarea
                      value={customization.footerAbout}
                      onChange={(e) => setCustomization({...customization, footerAbout: e.target.value})}
                      placeholder="Short description about your company"
                      className="bg-background/50"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input
                      value={customization.footerContact}
                      onChange={(e) => setCustomization({...customization, footerContact: e.target.value})}
                      placeholder="support@example.com"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Copyright Text</Label>
                    <Input
                      value={customization.footerText}
                      onChange={(e) => setCustomization({...customization, footerText: e.target.value})}
                      placeholder="© 2024 Company Name"
                      className="bg-background/50"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="branding" className="m-0 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Logo & Favicon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {panelId && (
                      <>
                        <ImageUpload
                          label="Logo"
                          value={customization.logoUrl}
                          onChange={(url) => setCustomization({...customization, logoUrl: url})}
                          panelId={panelId}
                          folder="logos"
                          placeholder="Upload your panel logo"
                          aspectRatio="wide"
                          maxSizeMB={2}
                        />
                        <ImageUpload
                          label="Favicon"
                          value={customization.faviconUrl}
                          onChange={(url) => setCustomization({...customization, faviconUrl: url})}
                          panelId={panelId}
                          folder="favicon"
                          placeholder="32x32 or 64x64 icon"
                          aspectRatio="square"
                          maxSizeMB={1}
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Hero Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {panelId && (
                    <ImageUpload
                      label="Hero Background Image"
                      value={customization.heroImage}
                      onChange={(url) => setCustomization({...customization, heroImage: url})}
                      panelId={panelId}
                      folder="hero"
                      placeholder="Upload a hero banner image (1920x1080 recommended)"
                      aspectRatio="wide"
                      maxSizeMB={5}
                    />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Brand Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={customization.companyName}
                      onChange={(e) => setCustomization({...customization, companyName: e.target.value})}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                      value={customization.tagline}
                      onChange={(e) => setCustomization({...customization, tagline: e.target.value})}
                      placeholder="Your catchy tagline"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Footer Text</Label>
                    <Input
                      value={customization.footerText}
                      onChange={(e) => setCustomization({...customization, footerText: e.target.value})}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Border Radius (px)</Label>
                    <Input
                      type="number"
                      value={customization.borderRadius}
                      onChange={(e) => setCustomization({...customization, borderRadius: e.target.value})}
                      className="bg-background/50 w-32"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Social Icons Tab */}
            <TabsContent value="social" className="m-0 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Social Media Icons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SocialIconSelector
                    platforms={[
                      { id: 'instagram', name: 'Instagram', icon: 'instagram', color: 'text-pink-500', bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400', enabled: true },
                      { id: 'facebook', name: 'Facebook', icon: 'facebook', color: 'text-blue-600', bgColor: 'bg-blue-600', enabled: true },
                      { id: 'twitter', name: 'Twitter/X', icon: 'twitter', color: 'text-sky-500', bgColor: 'bg-slate-900', enabled: true },
                      { id: 'youtube', name: 'YouTube', icon: 'youtube', color: 'text-red-500', bgColor: 'bg-red-500', enabled: true },
                      { id: 'tiktok', name: 'TikTok', icon: 'tiktok', color: 'text-foreground', bgColor: 'bg-gradient-to-br from-cyan-400 via-slate-900 to-pink-500', enabled: false },
                      { id: 'telegram', name: 'Telegram', icon: 'telegram', color: 'text-sky-400', bgColor: 'bg-sky-500', enabled: false },
                    ]}
                    onChange={(platforms) => {
                      setCustomization(prev => ({ ...prev, socialPlatforms: platforms } as any));
                    }}
                    showUrls={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="m-0 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Accessibility className="w-5 h-5" />
                    Accessibility Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AccessibilitySettings
                    settings={{
                      highContrast: false,
                      largeText: false,
                      reduceMotion: false,
                      fontSize: 16,
                      focusIndicators: false,
                      screenReaderOptimized: false
                    }}
                    onChange={(settings) => {
                      setCustomization(prev => ({ ...prev, accessibilitySettings: settings } as any));
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="m-0 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Header & Navigation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Header Style</Label>
                      <Select value={customization.headerStyle} onValueChange={(v) => setCustomization({...customization, headerStyle: v})}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed</SelectItem>
                          <SelectItem value="sticky">Sticky</SelectItem>
                          <SelectItem value="static">Static</SelectItem>
                          <SelectItem value="hidden">Hide on Scroll</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Navigation Style</Label>
                      <Select value={customization.navStyle} onValueChange={(v) => setCustomization({...customization, navStyle: v})}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sidebar">Sidebar</SelectItem>
                          <SelectItem value="topnav">Top Navigation</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Homepage Sections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { key: "showHero", label: "Hero Section", desc: "Main banner with CTA" },
                    { key: "showFeatures", label: "Features Section", desc: "Highlight your services" },
                    { key: "showStats", label: "Stats Section", desc: "Show key metrics" },
                    { key: "showFaqs", label: "FAQs Section", desc: "Common questions" },
                    { key: "showTestimonials", label: "Testimonials", desc: "Customer reviews" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                      <div>
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={(customization as any)[key]}
                        onCheckedChange={(v) => setCustomization({...customization, [key]: v})}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="m-0 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Custom CSS</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={`/* Add your custom CSS here */
.custom-button {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}`}
                    value={customization.customCSS}
                    onChange={(e) => setCustomization({...customization, customCSS: e.target.value})}
                    rows={10}
                    className="font-mono text-sm bg-slate-950 text-green-400 border-border/50"
                  />
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Custom JavaScript
                    <Badge variant="outline" className="text-xs">Advanced</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={`// Add your custom JavaScript here
// Be careful with custom scripts`}
                    value={customization.customJS}
                    onChange={(e) => setCustomization({...customization, customJS: e.target.value})}
                    rows={6}
                    className="font-mono text-sm bg-slate-950 text-yellow-400 border-border/50"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    ⚠️ Custom JavaScript runs on your storefront. Use with caution.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="lg:w-[45%] flex flex-col bg-card/30 rounded-2xl border border-border/50 overflow-hidden">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50 bg-card/50">
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-3 text-xs gap-1.5",
                  previewMode === "local" && "bg-background shadow-sm"
                )}
                onClick={() => setPreviewMode("local")}
              >
                <Eye className="w-3 h-3" />
                Local
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-3 text-xs gap-1.5",
                  previewMode === "live" && "bg-background shadow-sm"
                )}
                onClick={() => setPreviewMode("live")}
              >
                <Globe className="w-3 h-3" />
                Live
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {previewMode === "local" && (
              <div className="flex bg-muted rounded-lg p-1">
                {[
                  { device: "desktop" as const, icon: Monitor },
                  { device: "tablet" as const, icon: Tablet },
                  { device: "mobile" as const, icon: Smartphone },
                ].map(({ device, icon: Icon }) => (
                  <Button
                    key={device}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      previewDevice === device && "bg-background shadow-sm"
                    )}
                    onClick={() => setPreviewDevice(device)}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handlePreviewNewTab} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Open
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        {previewMode === "live" ? (
          <LiveStorefrontPreview subdomain={panelSubdomain || undefined} />
        ) : (
          <div className="flex-1 p-4 overflow-auto flex items-start justify-center bg-[#1a1a2e]">
            <motion.div
              layout
              className="bg-background rounded-lg overflow-hidden shadow-2xl transition-all duration-300"
              style={{
                width: deviceSizes[previewDevice].width,
                maxWidth: deviceSizes[previewDevice].maxWidth,
                minHeight: "400px",
              }}
            >
            {/* Full Storefront Preview */}
            <div 
              className="min-h-[400px] overflow-y-auto"
              style={{ 
                backgroundColor: customization.backgroundColor,
                borderRadius: `${customization.borderRadius}px`,
              }}
            >
              {/* Header */}
              <div 
                className="p-4 flex items-center justify-between sticky top-0 z-10"
                style={{ backgroundColor: customization.surfaceColor }}
              >
                <div className="flex items-center gap-2">
                  {customization.logoUrl ? (
                    <img src={customization.logoUrl} alt="Logo" className="h-6" />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: customization.primaryColor }}
                    >
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span 
                    className="font-bold text-sm"
                    style={{ color: customization.textColor }}
                  >
                    {customization.companyName}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div 
                    className="px-3 py-1.5 rounded text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: customization.primaryColor,
                      color: "#fff",
                      borderRadius: `${customization.borderRadius}px`,
                    }}
                  >
                    Login
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              {customization.showHero && (
                <div className="px-6 py-10 text-center">
                  <h1 
                    className="text-2xl font-bold mb-3"
                    style={{ color: customization.textColor }}
                  >
                    {customization.heroTitle}
                  </h1>
                  <p 
                    className="text-sm mb-6 max-w-md mx-auto"
                    style={{ color: customization.mutedColor }}
                  >
                    {customization.heroSubtitle}
                  </p>
                  <div 
                    className="inline-block px-6 py-3 rounded text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ 
                      backgroundColor: customization.primaryColor,
                      color: "#fff",
                      borderRadius: `${customization.borderRadius}px`,
                    }}
                  >
                    {customization.heroCta}
                  </div>
                </div>
              )}

              {/* Features Section */}
              {customization.showFeatures && (
                <div className="p-4">
                  <h2 
                    className="text-center text-lg font-bold mb-4"
                    style={{ color: customization.textColor }}
                  >
                    Why Choose Us?
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {customization.features.map((feature, i) => {
                      const iconMap: Record<string, any> = { Zap, Shield, Clock, TrendingUp };
                      const IconComponent = iconMap[feature.icon] || Zap;
                      return (
                        <div 
                          key={i}
                          className="p-3 rounded-lg"
                          style={{ 
                            backgroundColor: customization.surfaceColor,
                            borderRadius: `${customization.borderRadius}px`,
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                            style={{ backgroundColor: `${customization.secondaryColor}30` }}
                          >
                            <IconComponent className="w-4 h-4" style={{ color: customization.secondaryColor }} />
                          </div>
                          <h3 
                            className="font-semibold text-sm mb-1"
                            style={{ color: customization.textColor }}
                          >
                            {feature.title}
                          </h3>
                          <p 
                            className="text-xs"
                            style={{ color: customization.mutedColor }}
                          >
                            {feature.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats Section */}
              {customization.showStats && (
                <div className="p-6 flex justify-around" style={{ backgroundColor: `${customization.primaryColor}15` }}>
                  {customization.stats.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div 
                        className="text-2xl font-bold"
                        style={{ color: customization.primaryColor }}
                      >
                        {stat.value}
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: customization.mutedColor }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FAQs Section */}
              {customization.showFaqs && (
                <div className="p-4">
                  <h2 
                    className="text-center text-lg font-bold mb-4"
                    style={{ color: customization.textColor }}
                  >
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-2">
                    {customization.faqs.slice(0, 3).map((faq, i) => (
                      <div 
                        key={i}
                        className="p-3 rounded-lg"
                        style={{ 
                          backgroundColor: customization.surfaceColor,
                          borderRadius: `${customization.borderRadius}px`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <h3 
                            className="font-medium text-sm"
                            style={{ color: customization.textColor }}
                          >
                            {faq.question}
                          </h3>
                          <ChevronDown className="w-4 h-4" style={{ color: customization.mutedColor }} />
                        </div>
                        <p 
                          className="text-xs mt-2"
                          style={{ color: customization.mutedColor }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div 
                className="p-4 mt-4"
                style={{ backgroundColor: customization.surfaceColor }}
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 
                      className="font-semibold text-xs mb-2"
                      style={{ color: customization.textColor }}
                    >
                      About
                    </h4>
                    <p 
                      className="text-xs line-clamp-3"
                      style={{ color: customization.mutedColor }}
                    >
                      {customization.footerAbout}
                    </p>
                  </div>
                  <div>
                    <h4 
                      className="font-semibold text-xs mb-2"
                      style={{ color: customization.textColor }}
                    >
                      Contact
                    </h4>
                    <p 
                      className="text-xs"
                      style={{ color: customization.mutedColor }}
                    >
                      {customization.footerContact}
                    </p>
                  </div>
                </div>
                <div 
                  className="text-center pt-3 border-t"
                  style={{ borderColor: `${customization.mutedColor}30` }}
                >
                  <p 
                    className="text-xs"
                    style={{ color: customization.mutedColor }}
                  >
                    {customization.footerText}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </div>
  );
};

export default DesignCustomization;
