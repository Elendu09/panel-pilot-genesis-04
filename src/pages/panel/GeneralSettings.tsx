import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/panel/ImageUpload";
import { LegalContentEditor } from "@/components/settings/LegalContentEditor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Save,
  Settings,
  Shield,
  DollarSign,
  FileText,
  Search,
  Image,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Check,
  Megaphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomMetaTag {
  id: string;
  name: string;
  content: string;
  placement: "head" | "body";
}

interface UploadedImage {
  key: string;
  label: string;
  url: string;
}

const GeneralSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panelId, setPanelId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState("");

  const [settings, setSettings] = useState({
    // Panel Information
    panelName: "",
    description: "",
    supportEmail: "",
    
    // Panel Status
    maintenanceMode: false,
    maintenanceMessage: "",
    allowRegistration: true,
    requireEmailVerification: false,
    
    // Order Settings
    defaultCurrency: "USD",
    minOrderAmount: "1.00",
    maxOrderAmount: "100000.00",
    
    // Legal Pages
    termsOfService: "",
    privacyPolicy: "",
    
    // SEO & Meta Tags
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    
    // Verification Meta Tags
    googleVerification: "",
    bingVerification: "",
    yandexVerification: "",
    pinterestVerification: "",
    facebookVerification: "",
    
    // Branding Images
    faviconUrl: "",
    appleTouchIconUrl: "",
    ogImageUrl: "",
    logoUrl: "",
    heroImageUrl: "",
    
    // Advertising
    showFreeTierBanner: true,
  });

  const [customMetaTags, setCustomMetaTags] = useState<CustomMetaTag[]>([]);

  // Calculate SEO score
  const calculateSEOScore = () => {
    let score = 0;
    if (settings.seoTitle && settings.seoTitle.length >= 30 && settings.seoTitle.length <= 60) score += 20;
    else if (settings.seoTitle) score += 10;
    
    if (settings.seoDescription && settings.seoDescription.length >= 120 && settings.seoDescription.length <= 160) score += 20;
    else if (settings.seoDescription) score += 10;
    
    if (settings.seoKeywords) score += 15;
    if (settings.ogImageUrl) score += 20;
    if (settings.faviconUrl) score += 10;
    if (settings.canonicalUrl) score += 15;
    
    return Math.min(score, 100);
  };

  const seoScore = calculateSEOScore();

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;

        const { data: panel, error: panelError } = await supabase
          .from('panels')
          .select('id, name, description, subdomain, logo_url, settings, custom_branding')
          .eq('owner_id', profile.id)
          .single();

        if (panelError) throw panelError;
        if (!panel) return;

        setPanelId(panel.id);
        setSubdomain(panel.subdomain || "");

        const { data: panelSettings } = await supabase
          .from('panel_settings')
          .select('*')
          .eq('panel_id', panel.id)
          .single();

        const panelSettingsData = panel.settings as Record<string, any> || {};
        const generalSettings = panelSettingsData.general || {};
        const seoSettings = panelSettingsData.seo || {};
        
        const contactInfo = panelSettings?.contact_info as Record<string, any> || {};
        const customBranding = panel.custom_branding as Record<string, any> || {};

        const advertisingSettings = panelSettingsData.advertising || {};

        setSettings({
          panelName: panel.name || "",
          description: panel.description || "",
          maintenanceMode: panelSettings?.maintenance_mode ?? false,
          maintenanceMessage: panelSettings?.maintenance_message || "",
          allowRegistration: generalSettings.allowRegistration ?? true,
          requireEmailVerification: generalSettings.requireEmailVerification ?? false,
          defaultCurrency: generalSettings.defaultCurrency || "USD",
          minOrderAmount: generalSettings.minOrderAmount || "1.00",
          maxOrderAmount: generalSettings.maxOrderAmount || "100000.00",
          supportEmail: contactInfo.email || "",
          termsOfService: panelSettings?.terms_of_service || generalSettings.termsOfService || "",
          privacyPolicy: panelSettings?.privacy_policy || generalSettings.privacyPolicy || "",
          
          // SEO Settings
          seoTitle: panelSettings?.seo_title || seoSettings.title || "",
          seoDescription: panelSettings?.seo_description || seoSettings.description || "",
          seoKeywords: panelSettings?.seo_keywords || seoSettings.keywords || "",
          canonicalUrl: seoSettings.canonicalUrl || "",
          
          // Verification tags
          googleVerification: seoSettings.googleVerification || "",
          bingVerification: seoSettings.bingVerification || "",
          yandexVerification: seoSettings.yandexVerification || "",
          pinterestVerification: seoSettings.pinterestVerification || "",
          facebookVerification: seoSettings.facebookVerification || "",
          
          // Branding
          faviconUrl: customBranding.faviconUrl || "",
          appleTouchIconUrl: customBranding.appleTouchIconUrl || "",
          ogImageUrl: customBranding.ogImageUrl || seoSettings.ogImage || "",
          logoUrl: panel.logo_url || customBranding.logoUrl || "",
          heroImageUrl: customBranding.heroImageUrl || "",
          
          // Advertising
          showFreeTierBanner: advertisingSettings.showFreeTierBanner ?? true,
        });

        // Load custom meta tags
        if (seoSettings.customMetaTags) {
          setCustomMetaTags(seoSettings.customMetaTags);
        }

      } catch (err) {
        console.error('Error loading settings:', err);
        toast({
          variant: "destructive",
          title: "Failed to load settings",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSave = async () => {
    if (!panelId) {
      toast({ variant: "destructive", title: "No panel found" });
      return;
    }

    setSaving(true);
    try {
      // CRITICAL: First fetch existing data to preserve unrelated settings
      const { data: existingPanel } = await supabase
        .from('panels')
        .select('settings, custom_branding')
        .eq('id', panelId)
        .single();

      const existingSettings = (existingPanel?.settings as Record<string, any>) || {};
      const existingBranding = (existingPanel?.custom_branding as Record<string, any>) || {};

      // Update panel with MERGED settings (preserves theme, payment methods, etc.)
      const { error: panelError } = await supabase
        .from('panels')
        .update({
          name: settings.panelName,
          description: settings.description,
          logo_url: settings.logoUrl,
          custom_branding: {
            ...existingBranding,  // PRESERVE existing branding (selectedTheme, colors, etc.)
            faviconUrl: settings.faviconUrl,
            appleTouchIconUrl: settings.appleTouchIconUrl,
            ogImageUrl: settings.ogImageUrl,
            logoUrl: settings.logoUrl,
            heroImageUrl: settings.heroImageUrl,
          },
          settings: {
            ...existingSettings,  // PRESERVE existing settings (buyer_theme, payment configs, etc.)
            general: {
              allowRegistration: settings.allowRegistration,
              requireEmailVerification: settings.requireEmailVerification,
              defaultCurrency: settings.defaultCurrency,
              minOrderAmount: settings.minOrderAmount,
              maxOrderAmount: settings.maxOrderAmount,
              termsOfService: settings.termsOfService,
              privacyPolicy: settings.privacyPolicy,
              updatedAt: new Date().toISOString(),
            },
            seo: {
              title: settings.seoTitle,
              description: settings.seoDescription,
              keywords: settings.seoKeywords,
              canonicalUrl: settings.canonicalUrl,
              ogImage: settings.ogImageUrl,
              googleVerification: settings.googleVerification,
              bingVerification: settings.bingVerification,
              yandexVerification: settings.yandexVerification,
              pinterestVerification: settings.pinterestVerification,
              facebookVerification: settings.facebookVerification,
              customMetaTags: customMetaTags.map((tag) => ({
                id: tag.id,
                name: tag.name,
                content: tag.content,
                placement: tag.placement,
              })),
            },
            advertising: {
              showFreeTierBanner: settings.showFreeTierBanner,
              updatedAt: new Date().toISOString(),
            },
          },
        })
        .eq('id', panelId);

      if (panelError) throw panelError;

      // Upsert panel_settings
      const { error: settingsError } = await supabase
        .from('panel_settings')
        .upsert({
          panel_id: panelId,
          maintenance_mode: settings.maintenanceMode,
          maintenance_message: settings.maintenanceMessage,
          contact_info: { email: settings.supportEmail },
          seo_title: settings.seoTitle,
          seo_description: settings.seoDescription,
          seo_keywords: settings.seoKeywords,
          privacy_policy: settings.privacyPolicy,
          terms_of_service: settings.termsOfService,
        }, {
          onConflict: 'panel_id',
        });

      if (settingsError) throw settingsError;

      toast({
        title: "Settings saved",
        description: "All settings have been updated successfully.",
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const addCustomMetaTag = () => {
    setCustomMetaTags([
      ...customMetaTags,
      { id: Date.now().toString(), name: "", content: "", placement: "head" },
    ]);
  };

  const removeCustomMetaTag = (id: string) => {
    setCustomMetaTags(customMetaTags.filter((tag) => tag.id !== id));
  };

  const updateCustomMetaTag = (id: string, field: keyof CustomMetaTag, value: string) => {
    setCustomMetaTags(
      customMetaTags.map((tag) =>
        tag.id === id ? { ...tag, [field]: value } : tag
      )
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  // Get all uploaded images for gallery
  const uploadedImages: UploadedImage[] = [
    { key: "logoUrl", label: "Logo", url: settings.logoUrl },
    { key: "faviconUrl", label: "Favicon", url: settings.faviconUrl },
    { key: "appleTouchIconUrl", label: "Apple Touch Icon", url: settings.appleTouchIconUrl },
    { key: "ogImageUrl", label: "OG Image", url: settings.ogImageUrl },
    { key: "heroImageUrl", label: "Hero Image", url: settings.heroImageUrl },
  ].filter((img) => img.url);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-card via-card/95 to-card rounded-xl border border-border/50 shadow-lg">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            General Settings
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Configure your panel's settings, SEO, branding, and advertising
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all gap-2"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      {/* SEO Score Card */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">SEO Score</h3>
                <p className="text-sm text-muted-foreground">
                  {seoScore >= 80
                    ? "Excellent! Your SEO is well optimized"
                    : seoScore >= 50
                    ? "Good progress, but there's room for improvement"
                    : "Add more SEO elements to improve visibility"}
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold text-primary">{seoScore}%</div>
          </div>
          <Progress value={seoScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Accordion Sections */}
      <Accordion
        type="multiple"
        defaultValue={["panel-info"]}
        className="space-y-4"
      >
        {/* Panel Information */}
        <AccordionItem
          value="panel-info"
          className="border border-border rounded-xl bg-gradient-card overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Panel Information</h3>
                <p className="text-sm text-muted-foreground">
                  Basic panel details and contact info
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="panelName">Panel Name</Label>
                  <Input
                    id="panelName"
                    value={settings.panelName}
                    onChange={(e) =>
                      setSettings({ ...settings, panelName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, supportEmail: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Panel Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) =>
                    setSettings({ ...settings, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Panel Status */}
        <AccordionItem
          value="panel-status"
          className="border border-border rounded-xl bg-gradient-card overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-warning" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Panel Status</h3>
                <p className="text-sm text-muted-foreground">
                  Maintenance mode and registration settings
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable panel access
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>
              {settings.maintenanceMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={settings.maintenanceMessage}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenanceMessage: e.target.value,
                      })
                    }
                    placeholder="We're currently performing scheduled maintenance..."
                    rows={2}
                  />
                </motion.div>
              )}
              <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Allow Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register
                  </p>
                </div>
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowRegistration: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify email before ordering
                  </p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      requireEmailVerification: checked,
                    })
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Order Settings */}
        <AccordionItem
          value="order-settings"
          className="border border-border rounded-xl bg-gradient-card overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Order Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Currency and order limits
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Input
                  id="defaultCurrency"
                  value={settings.defaultCurrency}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultCurrency: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Min Order Amount</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  step="0.01"
                  value={settings.minOrderAmount}
                  onChange={(e) =>
                    setSettings({ ...settings, minOrderAmount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOrderAmount">Max Order Amount</Label>
                <Input
                  id="maxOrderAmount"
                  type="number"
                  step="0.01"
                  value={settings.maxOrderAmount}
                  onChange={(e) =>
                    setSettings({ ...settings, maxOrderAmount: e.target.value })
                  }
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* SEO & Meta Tags */}
        <AccordionItem
          value="seo-settings"
          className="border border-border rounded-xl bg-gradient-card overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-info" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">SEO & Meta Tags</h3>
                <p className="text-sm text-muted-foreground">
                  Search engine optimization and verification
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6 pt-2">
              {/* Basic SEO */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Basic SEO
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seoTitle">Page Title</Label>
                    <span
                      className={`text-xs ${
                        settings.seoTitle.length > 60
                          ? "text-destructive"
                          : settings.seoTitle.length >= 30
                          ? "text-success"
                          : "text-muted-foreground"
                      }`}
                    >
                      {settings.seoTitle.length}/60 characters
                    </span>
                  </div>
                  <Input
                    id="seoTitle"
                    value={settings.seoTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, seoTitle: e.target.value })
                    }
                    placeholder="Your Panel Name - Best SMM Services"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seoDescription">Meta Description</Label>
                    <span
                      className={`text-xs ${
                        settings.seoDescription.length > 160
                          ? "text-destructive"
                          : settings.seoDescription.length >= 120
                          ? "text-success"
                          : "text-muted-foreground"
                      }`}
                    >
                      {settings.seoDescription.length}/160 characters
                    </span>
                  </div>
                  <Textarea
                    id="seoDescription"
                    value={settings.seoDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="Get the best SMM services for Instagram, TikTok, YouTube and more..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">Keywords</Label>
                  <Input
                    id="seoKeywords"
                    value={settings.seoKeywords}
                    onChange={(e) =>
                      setSettings({ ...settings, seoKeywords: e.target.value })
                    }
                    placeholder="smm panel, social media marketing, buy followers"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {settings.seoKeywords
                      .split(",")
                      .filter((k) => k.trim())
                      .map((keyword, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs"
                        >
                          {keyword.trim()}
                        </Badge>
                      ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    value={settings.canonicalUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, canonicalUrl: e.target.value })
                    }
                    placeholder={`https://${subdomain}.smmpilot.online`}
                  />
                </div>
              </div>

              {/* Verification Tags */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  Verification Meta Tags
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Google Search Console
                    </Label>
                    <Input
                      value={settings.googleVerification}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          googleVerification: e.target.value,
                        })
                      }
                      placeholder="google-site-verification content value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Bing Webmaster
                    </Label>
                    <Input
                      value={settings.bingVerification}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          bingVerification: e.target.value,
                        })
                      }
                      placeholder="msvalidate.01 content value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Yandex
                    </Label>
                    <Input
                      value={settings.yandexVerification}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          yandexVerification: e.target.value,
                        })
                      }
                      placeholder="yandex-verification content value"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Pinterest
                    </Label>
                    <Input
                      value={settings.pinterestVerification}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pinterestVerification: e.target.value,
                        })
                      }
                      placeholder="p:domain_verify content value"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Facebook Domain Verification
                    </Label>
                    <Input
                      value={settings.facebookVerification}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          facebookVerification: e.target.value,
                        })
                      }
                      placeholder="facebook-domain-verification content value"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Meta Tags */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Custom Meta Tags
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addCustomMetaTag}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Tag
                  </Button>
                </div>
                <AnimatePresence>
                  {customMetaTags.map((tag) => (
                    <motion.div
                      key={tag.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-accent/20 rounded-lg"
                    >
                      <Input
                        placeholder="name (e.g., author)"
                        value={tag.name}
                        onChange={(e) =>
                          updateCustomMetaTag(tag.id, "name", e.target.value)
                        }
                      />
                      <Input
                        placeholder="content"
                        value={tag.content}
                        onChange={(e) =>
                          updateCustomMetaTag(tag.id, "content", e.target.value)
                        }
                        className="md:col-span-2"
                      />
                      <div className="flex gap-2">
                        <Select
                          value={tag.placement}
                          onValueChange={(v) =>
                            updateCustomMetaTag(
                              tag.id,
                              "placement",
                              v as "head" | "body"
                            )
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="head">&lt;head&gt;</SelectItem>
                            <SelectItem value="body">&lt;body&gt;</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeCustomMetaTag(tag.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Branding & Images */}
        <AccordionItem
          value="branding"
          className="border border-border rounded-xl bg-gradient-card overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Image className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Branding & Images</h3>
                <p className="text-sm text-muted-foreground">
                  Favicon, icons, and image gallery
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6 pt-2">
              {/* Image Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {panelId && (
                  <>
                    <ImageUpload
                      label="Favicon (32x32 or 64x64)"
                      value={settings.faviconUrl}
                      onChange={(url) =>
                        setSettings({ ...settings, faviconUrl: url })
                      }
                      panelId={panelId}
                      folder="favicon"
                      aspectRatio="square"
                      placeholder="Upload favicon (.ico, .png)"
                    />
                    <ImageUpload
                      label="Apple Touch Icon (180x180)"
                      value={settings.appleTouchIconUrl}
                      onChange={(url) =>
                        setSettings({ ...settings, appleTouchIconUrl: url })
                      }
                      panelId={panelId}
                      folder="favicon"
                      aspectRatio="square"
                      placeholder="Upload Apple Touch Icon"
                    />
                    <ImageUpload
                      label="Open Graph Image (1200x630)"
                      value={settings.ogImageUrl}
                      onChange={(url) =>
                        setSettings({ ...settings, ogImageUrl: url })
                      }
                      panelId={panelId}
                      folder="og"
                      aspectRatio="wide"
                      placeholder="Image for social sharing"
                    />
                    <ImageUpload
                      label="Logo"
                      value={settings.logoUrl}
                      onChange={(url) =>
                        setSettings({ ...settings, logoUrl: url })
                      }
                      panelId={panelId}
                      folder="logos"
                      aspectRatio="auto"
                      placeholder="Your panel logo"
                    />
                    <ImageUpload
                      label="Hero Image"
                      value={settings.heroImageUrl}
                      onChange={(url) =>
                        setSettings({ ...settings, heroImageUrl: url })
                      }
                      panelId={panelId}
                      folder="hero"
                      aspectRatio="wide"
                      placeholder="Main banner image"
                    />
                  </>
                )}
              </div>

              {/* Image Gallery */}
              {uploadedImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                    Uploaded Images Gallery
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {uploadedImages.map((img) => (
                      <div
                        key={img.key}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-accent/20"
                      >
                        <img
                          src={img.url}
                          alt={img.label}
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <p className="text-xs text-white font-medium">
                            {img.label}
                          </p>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-white hover:bg-white/20"
                              onClick={() => window.open(img.url, "_blank")}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-white hover:bg-white/20"
                              onClick={() => copyToClipboard(img.url)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Advertising Settings */}
        <AccordionItem
          value="advertising"
          className="border border-border rounded-xl bg-gradient-card overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Advertising</h3>
                <p className="text-sm text-muted-foreground">
                  Control promotional banners on your storefront
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    Free Tier Banner
                    <Badge variant="outline" className="text-xs">Platform</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show promotional banner to buyers on subdomain storefronts
                  </p>
                </div>
                <Switch
                  checked={settings.showFreeTierBanner}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showFreeTierBanner: checked })
                  }
                />
              </div>
              
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  When enabled, a promotional banner will be displayed on your 
                  storefront for buyers using subdomain URLs. Custom domain 
                  storefronts do not display this banner.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Legal Pages */}
        <AccordionItem
          value="legal"
          className="border border-border rounded-xl bg-gradient-card overflow-hidden"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Legal Pages</h3>
                <p className="text-sm text-muted-foreground">
                  Terms of service and privacy policy
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                <p className="text-sm text-info">
                  These pages are displayed to your customers. Use clear, professional language. 
                  Click "Use Template" to load compliant default content that you can customize.
                </p>
              </div>
              <LegalContentEditor
                termsOfService={settings.termsOfService}
                privacyPolicy={settings.privacyPolicy}
                panelName={settings.panelName || 'Your Panel'}
                supportEmail={settings.supportEmail}
                onTermsChange={(value) => setSettings({ ...settings, termsOfService: value })}
                onPrivacyChange={(value) => setSettings({ ...settings, privacyPolicy: value })}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default GeneralSettings;
