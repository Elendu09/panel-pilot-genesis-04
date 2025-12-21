import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Palette, 
  Upload, 
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
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const DesignCustomization = () => {
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState("dark_gradient");
  const [activeTab, setActiveTab] = useState("themes");
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
    borderRadius: "8",
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
  ];

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

  const handleSave = () => {
    toast({
      title: "Design saved",
      description: "Your panel design has been updated successfully.",
    });
  };

  const handlePreviewNewTab = () => {
    toast({
      title: "Preview opened",
      description: "Opening preview in new tab...",
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
          <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-primary/80">
            Save Changes
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 p-1 mb-4">
            <TabsTrigger value="themes" className="gap-2">
              <Palette className="w-4 h-4" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="colors" className="gap-2">
              <PaintBucket className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Image className="w-4 h-4" />
              Branding
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

                  {/* Color Preview */}
                  <div className="p-4 rounded-xl border border-border/50" style={{ backgroundColor: customization.backgroundColor }}>
                    <div className="flex gap-2 mb-3">
                      <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: customization.primaryColor, color: "#fff" }}>
                        Primary
                      </div>
                      <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: customization.secondaryColor, color: "#fff" }}>
                        Secondary
                      </div>
                      <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: customization.accentColor, color: "#fff" }}>
                        Accent
                      </div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: customization.surfaceColor }}>
                      <p style={{ color: customization.textColor }} className="text-sm">Sample text on surface</p>
                      <p style={{ color: customization.mutedColor }} className="text-xs">Muted text example</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding" className="m-0 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Logo & Favicon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Logo</Label>
                      <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        {customization.logoUrl ? (
                          <img src={customization.logoUrl} alt="Logo" className="max-h-16 mx-auto" />
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Click to upload</p>
                          </div>
                        )}
                      </div>
                      <Input
                        placeholder="Or paste logo URL"
                        value={customization.logoUrl}
                        onChange={(e) => setCustomization({...customization, logoUrl: e.target.value})}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Favicon</Label>
                      <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        {customization.faviconUrl ? (
                          <img src={customization.faviconUrl} alt="Favicon" className="w-8 h-8 mx-auto" />
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">32x32 or 64x64</p>
                          </div>
                        )}
                      </div>
                      <Input
                        placeholder="Or paste favicon URL"
                        value={customization.faviconUrl}
                        onChange={(e) => setCustomization({...customization, faviconUrl: e.target.value})}
                        className="bg-background/50"
                      />
                    </div>
                  </div>
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
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">Live Preview</span>
          </div>
          <div className="flex items-center gap-2">
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
            <Button variant="outline" size="sm" onClick={handlePreviewNewTab} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Open
            </Button>
          </div>
        </div>

        {/* Preview Content */}
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
            {/* Mock Storefront Preview */}
            <div 
              className="min-h-[400px]"
              style={{ 
                backgroundColor: customization.backgroundColor,
                borderRadius: `${customization.borderRadius}px`,
              }}
            >
              {/* Mock Header */}
              <div 
                className="p-4 flex items-center justify-between"
                style={{ backgroundColor: customization.surfaceColor }}
              >
                <div className="flex items-center gap-2">
                  {customization.logoUrl ? (
                    <img src={customization.logoUrl} alt="Logo" className="h-6" />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: customization.primaryColor }}
                    />
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
                    className="px-3 py-1.5 rounded text-xs font-medium"
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

              {/* Mock Hero */}
              {customization.showHero && (
                <div className="p-6 text-center">
                  <h1 
                    className="text-xl font-bold mb-2"
                    style={{ color: customization.textColor }}
                  >
                    {customization.companyName}
                  </h1>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: customization.mutedColor }}
                  >
                    {customization.tagline}
                  </p>
                  <div 
                    className="inline-block px-4 py-2 rounded text-sm font-medium"
                    style={{ 
                      backgroundColor: customization.primaryColor,
                      color: "#fff",
                      borderRadius: `${customization.borderRadius}px`,
                    }}
                  >
                    Get Started
                  </div>
                </div>
              )}

              {/* Mock Features */}
              {customization.showFeatures && (
                <div className="p-4 grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-lg"
                      style={{ 
                        backgroundColor: customization.surfaceColor,
                        borderRadius: `${customization.borderRadius}px`,
                      }}
                    >
                      <div 
                        className="w-6 h-6 rounded mb-2"
                        style={{ backgroundColor: customization.secondaryColor }}
                      />
                      <div 
                        className="h-2 w-16 rounded mb-1"
                        style={{ backgroundColor: customization.textColor, opacity: 0.8 }}
                      />
                      <div 
                        className="h-2 w-12 rounded"
                        style={{ backgroundColor: customization.mutedColor }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Mock Stats */}
              {customization.showStats && (
                <div className="p-4 flex justify-around">
                  {[
                    { value: "10K+", label: "Users" },
                    { value: "50K+", label: "Orders" },
                    { value: "99%", label: "Uptime" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div 
                        className="text-lg font-bold"
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

              {/* Mock Footer */}
              <div 
                className="p-3 text-center mt-4"
                style={{ backgroundColor: customization.surfaceColor }}
              >
                <p 
                  className="text-xs"
                  style={{ color: customization.mutedColor }}
                >
                  {customization.footerText}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DesignCustomization;
