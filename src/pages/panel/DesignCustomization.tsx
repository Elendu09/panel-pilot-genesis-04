import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  Loader2,
  Wand2,
  Type,
  PaintBucket,
  ChevronDown,
  ChevronRight,
  Globe,
  Share2,
  Accessibility,
  Save,
  Check,
  Zap,
  Settings,
  Layers,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Section {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isOpen: boolean;
}

const DesignCustomization = () => {
  const { toast } = useToast();
  const [panelId, setPanelId] = useState<string | null>(null);
  const [panelSubdomain, setPanelSubdomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("dark_gradient");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isPro] = useState(true);

  const [sections, setSections] = useState<Section[]>([
    { id: "themes", title: "Theme Gallery", icon: Palette, isOpen: true },
    { id: "branding", title: "Branding", icon: Image, isOpen: false },
    { id: "colors", title: "Colors", icon: PaintBucket, isOpen: false },
    { id: "hero", title: "Hero Section", icon: Layers, isOpen: false },
    { id: "content", title: "Content", icon: Type, isOpen: false },
    { id: "layout", title: "Layout Options", icon: Layout, isOpen: false },
    { id: "social", title: "Social Links", icon: Share2, isOpen: false },
    { id: "advanced", title: "Advanced", icon: Code, isOpen: false },
  ]);

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
    heroTitle: "Grow Your Social Media Presence",
    heroSubtitle: "The #1 SMM Panel for Instagram, TikTok, YouTube and more.",
    heroCta: "Get Started",
    footerAbout: "Your trusted SMM partner since 2020.",
    footerContact: "support@example.com",
    socialInstagram: "",
    socialFacebook: "",
    socialTwitter: "",
    socialTelegram: "",
    socialDiscord: "",
  });

  const themes = [
    {
      id: "dark_gradient",
      name: "Dark Gradient",
      colors: { primary: "#8B5CF6", secondary: "#06B6D4", bg: "#0F172A", surface: "#1E293B", text: "#F8FAFC" },
      preview: "bg-gradient-to-br from-purple-900 via-slate-900 to-blue-900",
    },
    {
      id: "light_minimal",
      name: "Light Minimal",
      colors: { primary: "#3B82F6", secondary: "#10B981", bg: "#FFFFFF", surface: "#F8FAFC", text: "#0F172A" },
      preview: "bg-gradient-to-br from-gray-50 to-white border border-border",
    },
    {
      id: "neon_glow",
      name: "Neon Glow",
      colors: { primary: "#00FF88", secondary: "#FF00FF", bg: "#0A0A0A", surface: "#1A1A2E", text: "#FFFFFF" },
      preview: "bg-gradient-to-br from-purple-950 via-black to-cyan-950",
    },
    {
      id: "ocean_blue",
      name: "Ocean Blue",
      colors: { primary: "#0EA5E9", secondary: "#06B6D4", bg: "#0C1929", surface: "#132F4C", text: "#E0F2FE" },
      preview: "bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950",
    },
    {
      id: "forest_green",
      name: "Forest Green",
      colors: { primary: "#22C55E", secondary: "#84CC16", bg: "#0D1F12", surface: "#1A2F1C", text: "#DCFCE7" },
      preview: "bg-gradient-to-br from-green-950 via-slate-900 to-emerald-950",
    },
    {
      id: "sunset_orange",
      name: "Sunset Orange",
      colors: { primary: "#F97316", secondary: "#EF4444", bg: "#1C1410", surface: "#2D1F1A", text: "#FED7AA" },
      preview: "bg-gradient-to-br from-orange-950 via-slate-900 to-red-950",
    },
    {
      id: "royal_purple",
      name: "Royal Purple",
      colors: { primary: "#A855F7", secondary: "#EC4899", bg: "#1A0F1C", surface: "#2D1B30", text: "#F5D0FE" },
      preview: "bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950",
    },
    {
      id: "corporate",
      name: "Corporate",
      colors: { primary: "#2563EB", secondary: "#64748B", bg: "#F8FAFC", surface: "#FFFFFF", text: "#1E293B" },
      preview: "bg-gradient-to-br from-slate-50 to-blue-50 border border-border",
    },
  ];

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

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, isOpen: !s.isOpen } : s
    ));
  };

  const updateCustomization = (key: string, value: any) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

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
        textColor: theme.colors.text,
      }));
      setHasChanges(true);
      toast({ title: "Theme applied", description: `${theme.name} theme has been applied.` });
    }
  };

  const generateAITheme = async () => {
    if (!aiPrompt.trim()) {
      toast({ variant: "destructive", title: "Prompt required", description: "Please describe the theme you want." });
      return;
    }

    setIsGeneratingTheme(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-theme', {
        body: { prompt: aiPrompt }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setCustomization(prev => ({
        ...prev,
        primaryColor: data.colors.primary,
        secondaryColor: data.colors.secondary,
        accentColor: data.colors.accent,
        backgroundColor: data.colors.background,
        surfaceColor: data.colors.surface,
        textColor: data.colors.text,
      }));
      setHasChanges(true);
      toast({ title: "AI Theme Generated", description: "Your custom theme has been created!" });
    } catch (error) {
      console.error("Failed to generate theme:", error);
      toast({ variant: "destructive", title: "Failed to generate", description: error instanceof Error ? error.message : "Please try again." });
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

      setHasChanges(false);
      toast({ title: "Design saved!", description: "Your changes are now live." });
    } catch (err) {
      console.error('Error saving design:', err);
      toast({ variant: "destructive", title: "Failed to save", description: "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewNewTab = () => {
    if (panelSubdomain) {
      window.open(`/storefront-preview/${panelSubdomain}`, '_blank');
    }
    toast({ title: "Preview opened" });
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
        textColor: theme.colors.text,
      }));
      setHasChanges(true);
      toast({ title: "Colors reset to theme defaults" });
    }
  };

  const deviceConfig = {
    desktop: { width: "100%", icon: Monitor },
    tablet: { width: "768px", icon: Tablet },
    mobile: { width: "375px", icon: Smartphone },
  };

  const currentTheme = themes.find(t => t.id === selectedTheme);

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading design settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Design Studio
          </h1>
          <p className="text-muted-foreground text-sm">Customize your storefront appearance</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={handlePreviewNewTab} className="gap-2">
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !hasChanges} 
            className="bg-gradient-to-r from-primary to-primary/80 gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel - Controls */}
        <div className="w-full lg:w-[400px] xl:w-[450px] flex flex-col overflow-hidden bg-card/30 backdrop-blur-xl rounded-xl border border-border/50">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {sections.map((section) => (
              <Collapsible 
                key={section.id} 
                open={section.isOpen} 
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <section.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{section.title}</span>
                    </div>
                    {section.isOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4 space-y-4"
                  >
                    {/* Theme Gallery */}
                    {section.id === "themes" && (
                      <>
                        {/* AI Generator */}
                        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">AI Theme Generator</span>
                              {!isPro && <Badge variant="secondary" className="text-xs"><Lock className="w-3 h-3 mr-1" />PRO</Badge>}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="e.g., Modern dark tech with blue accents"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                disabled={!isPro || isGeneratingTheme}
                                className="bg-background/50 text-sm"
                              />
                              <Button 
                                size="sm"
                                onClick={generateAITheme} 
                                disabled={!isPro || isGeneratingTheme}
                              >
                                {isGeneratingTheme ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Theme Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {themes.map((theme) => (
                            <motion.div
                              key={theme.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => applyTheme(theme.id)}
                              className={cn(
                                "cursor-pointer rounded-xl overflow-hidden border-2 transition-all",
                                selectedTheme === theme.id
                                  ? "border-primary ring-2 ring-primary/30"
                                  : "border-transparent hover:border-border"
                              )}
                            >
                              <div className={cn("h-16 relative", theme.preview)}>
                                {selectedTheme === theme.id && (
                                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="w-3 h-3 text-primary-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="p-2 bg-card">
                                <p className="text-xs font-medium truncate">{theme.name}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Branding */}
                    {section.id === "branding" && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">Company Name</Label>
                          <Input
                            value={customization.companyName}
                            onChange={(e) => updateCustomization("companyName", e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Tagline</Label>
                          <Input
                            value={customization.tagline}
                            onChange={(e) => updateCustomization("tagline", e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Logo</Label>
                          <Input
                            value={customization.logoUrl}
                            onChange={(e) => updateCustomization("logoUrl", e.target.value)}
                            placeholder="Enter logo URL or upload"
                            className="mt-1.5"
                          />
                          {customization.logoUrl && (
                            <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                              <img src={customization.logoUrl} alt="Logo" className="h-10 object-contain" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm">Favicon URL</Label>
                          <Input
                            value={customization.faviconUrl}
                            onChange={(e) => updateCustomization("faviconUrl", e.target.value)}
                            placeholder="Enter favicon URL"
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                    )}

                    {/* Colors */}
                    {section.id === "colors" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Current theme: {currentTheme?.name}</span>
                          <Button variant="ghost" size="sm" onClick={resetColors}>
                            <RotateCcw className="w-3 h-3 mr-1" /> Reset
                          </Button>
                        </div>
                        {[
                          { key: "primaryColor", label: "Primary" },
                          { key: "secondaryColor", label: "Secondary" },
                          { key: "accentColor", label: "Accent" },
                          { key: "backgroundColor", label: "Background" },
                          { key: "surfaceColor", label: "Surface" },
                          { key: "textColor", label: "Text" },
                        ].map((color) => (
                          <div key={color.key} className="flex items-center justify-between">
                            <Label className="text-sm">{color.label}</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={(customization as any)[color.key]}
                                onChange={(e) => updateCustomization(color.key, e.target.value)}
                                className="w-10 h-8 p-0 border-0 cursor-pointer"
                              />
                              <Input
                                value={(customization as any)[color.key]}
                                onChange={(e) => updateCustomization(color.key, e.target.value)}
                                className="w-24 h-8 text-xs font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hero Section */}
                    {section.id === "hero" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Hero Section</Label>
                          <Switch
                            checked={customization.showHero}
                            onCheckedChange={(val) => updateCustomization("showHero", val)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Hero Title</Label>
                          <Input
                            value={customization.heroTitle}
                            onChange={(e) => updateCustomization("heroTitle", e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Hero Subtitle</Label>
                          <Textarea
                            value={customization.heroSubtitle}
                            onChange={(e) => updateCustomization("heroSubtitle", e.target.value)}
                            className="mt-1.5"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">CTA Button Text</Label>
                          <Input
                            value={customization.heroCta}
                            onChange={(e) => updateCustomization("heroCta", e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Hero Background Image URL</Label>
                          <Input
                            value={customization.heroImage}
                            onChange={(e) => updateCustomization("heroImage", e.target.value)}
                            placeholder="Enter image URL"
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    {section.id === "content" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Features</Label>
                          <Switch
                            checked={customization.showFeatures}
                            onCheckedChange={(val) => updateCustomization("showFeatures", val)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Stats</Label>
                          <Switch
                            checked={customization.showStats}
                            onCheckedChange={(val) => updateCustomization("showStats", val)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Testimonials</Label>
                          <Switch
                            checked={customization.showTestimonials}
                            onCheckedChange={(val) => updateCustomization("showTestimonials", val)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show FAQs</Label>
                          <Switch
                            checked={customization.showFaqs}
                            onCheckedChange={(val) => updateCustomization("showFaqs", val)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Footer Text</Label>
                          <Input
                            value={customization.footerText}
                            onChange={(e) => updateCustomization("footerText", e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Footer About</Label>
                          <Textarea
                            value={customization.footerAbout}
                            onChange={(e) => updateCustomization("footerAbout", e.target.value)}
                            className="mt-1.5"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}

                    {/* Layout */}
                    {section.id === "layout" && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">Header Style</Label>
                          <Select
                            value={customization.headerStyle}
                            onValueChange={(val) => updateCustomization("headerStyle", val)}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sticky">Sticky</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="static">Static</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Navigation Style</Label>
                          <Select
                            value={customization.navStyle}
                            onValueChange={(val) => updateCustomization("navStyle", val)}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sidebar">Sidebar</SelectItem>
                              <SelectItem value="topbar">Top Bar</SelectItem>
                              <SelectItem value="minimal">Minimal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Border Radius (px)</Label>
                          <Input
                            type="number"
                            value={customization.borderRadius}
                            onChange={(e) => updateCustomization("borderRadius", e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Font Family</Label>
                          <Select
                            value={customization.fontFamily}
                            onValueChange={(val) => updateCustomization("fontFamily", val)}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                              <SelectItem value="'Space Grotesk', sans-serif">Space Grotesk</SelectItem>
                              <SelectItem value="'DM Sans', sans-serif">DM Sans</SelectItem>
                              <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    {section.id === "social" && (
                      <div className="space-y-4">
                        {[
                          { key: "socialInstagram", label: "Instagram", placeholder: "https://instagram.com/..." },
                          { key: "socialFacebook", label: "Facebook", placeholder: "https://facebook.com/..." },
                          { key: "socialTwitter", label: "Twitter/X", placeholder: "https://x.com/..." },
                          { key: "socialTelegram", label: "Telegram", placeholder: "https://t.me/..." },
                          { key: "socialDiscord", label: "Discord", placeholder: "https://discord.gg/..." },
                        ].map((social) => (
                          <div key={social.key}>
                            <Label className="text-sm">{social.label}</Label>
                            <Input
                              value={(customization as any)[social.key]}
                              onChange={(e) => updateCustomization(social.key, e.target.value)}
                              placeholder={social.placeholder}
                              className="mt-1.5"
                            />
                          </div>
                        ))}
                        <div>
                          <Label className="text-sm">Contact Email</Label>
                          <Input
                            value={customization.footerContact}
                            onChange={(e) => updateCustomization("footerContact", e.target.value)}
                            placeholder="support@example.com"
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                    )}

                    {/* Advanced */}
                    {section.id === "advanced" && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">Custom CSS</Label>
                          <Textarea
                            value={customization.customCSS}
                            onChange={(e) => updateCustomization("customCSS", e.target.value)}
                            placeholder="/* Add your custom CSS here */"
                            className="mt-1.5 font-mono text-xs"
                            rows={6}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Custom JavaScript</Label>
                          <Textarea
                            value={customization.customJS}
                            onChange={(e) => updateCustomization("customJS", e.target.value)}
                            placeholder="// Add your custom JS here"
                            className="mt-1.5 font-mono text-xs"
                            rows={6}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="hidden lg:flex flex-1 flex-col min-h-0">
          {/* Device Switcher */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
              {Object.entries(deviceConfig).map(([device, config]) => (
                <Button
                  key={device}
                  variant={previewDevice === device ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewDevice(device as any)}
                  className="h-8 w-8 p-0"
                >
                  <config.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                Live Preview
              </Badge>
            </div>
          </div>

          {/* Preview Frame */}
          <div className="flex-1 bg-muted/30 rounded-xl border border-border/50 overflow-hidden flex items-start justify-center p-4">
            <div 
              className="bg-background rounded-lg shadow-2xl overflow-hidden transition-all duration-300 h-full"
              style={{ 
                width: deviceConfig[previewDevice].width,
                maxWidth: "100%"
              }}
            >
              {/* Browser Chrome */}
              <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b border-border/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background/50 rounded-full px-4 py-1 text-xs text-muted-foreground flex items-center gap-2 max-w-xs">
                    <Globe className="w-3 h-3" />
                    <span className="truncate">{panelSubdomain}.lovable.app</span>
                  </div>
                </div>
              </div>
              
              {/* Preview Content */}
              <div 
                className="h-[calc(100%-40px)] overflow-auto"
                style={{ 
                  backgroundColor: customization.backgroundColor,
                  color: customization.textColor
                }}
              >
                {/* Mini Hero Preview */}
                {customization.showHero && (
                  <div 
                    className="p-8 text-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${customization.primaryColor}20, ${customization.secondaryColor}20)` 
                    }}
                  >
                    {customization.logoUrl && (
                      <img src={customization.logoUrl} alt="Logo" className="h-10 mx-auto mb-4 object-contain" />
                    )}
                    <h1 
                      className="text-2xl font-bold mb-2"
                      style={{ color: customization.textColor }}
                    >
                      {customization.heroTitle || customization.companyName}
                    </h1>
                    <p 
                      className="text-sm opacity-70 mb-4"
                      style={{ color: customization.mutedColor }}
                    >
                      {customization.heroSubtitle || customization.tagline}
                    </p>
                    <button
                      className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-all"
                      style={{ 
                        backgroundColor: customization.primaryColor,
                        borderRadius: `${customization.borderRadius}px`
                      }}
                    >
                      {customization.heroCta}
                    </button>
                  </div>
                )}
                
                {/* Features Preview */}
                {customization.showFeatures && (
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Zap, title: "Lightning Fast" },
                        { icon: Settings, title: "Easy Setup" },
                        { icon: MessageSquare, title: "24/7 Support" },
                        { icon: Layers, title: "Real Results" },
                      ].map((feature, i) => (
                        <div 
                          key={i}
                          className="p-3 rounded-lg"
                          style={{ 
                            backgroundColor: customization.surfaceColor,
                            borderRadius: `${customization.borderRadius}px`
                          }}
                        >
                          <feature.icon 
                            className="w-5 h-5 mb-2" 
                            style={{ color: customization.primaryColor }}
                          />
                          <p className="text-xs font-medium" style={{ color: customization.textColor }}>
                            {feature.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Preview */}
                {customization.showStats && (
                  <div 
                    className="p-6 flex justify-around"
                    style={{ backgroundColor: customization.surfaceColor }}
                  >
                    {[
                      { value: "10K+", label: "Customers" },
                      { value: "50K+", label: "Orders" },
                      { value: "99.9%", label: "Uptime" },
                    ].map((stat, i) => (
                      <div key={i} className="text-center">
                        <p 
                          className="text-xl font-bold"
                          style={{ color: customization.primaryColor }}
                        >
                          {stat.value}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: customization.mutedColor }}
                        >
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Preview */}
                <div 
                  className="p-4 text-center mt-auto"
                  style={{ backgroundColor: customization.surfaceColor }}
                >
                  <p className="text-xs" style={{ color: customization.mutedColor }}>
                    {customization.footerText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignCustomization;
