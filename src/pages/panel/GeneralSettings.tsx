import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/panel/ImageUpload";
import { LegalContentEditor } from "@/components/settings/LegalContentEditor";
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
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState({
    panelName: "",
    description: "",
    supportEmail: "",
    supportPhone: "",
    supportAddress: "",
    supportWebsite: "",
    maintenanceMode: false,
    maintenanceMessage: "",
    allowRegistration: true,
    requireEmailVerification: false,
    defaultCurrency: "USD",
    minOrderAmount: "1.00",
    maxOrderAmount: "100000.00",
    termsOfService: "",
    privacyPolicy: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    googleVerification: "",
    bingVerification: "",
    yandexVerification: "",
    pinterestVerification: "",
    facebookVerification: "",
    faviconUrl: "",
    appleTouchIconUrl: "",
    ogImageUrl: "",
    logoUrl: "",
    heroImageUrl: "",
    showFreeTierBanner: true,
  });

  const [customMetaTags, setCustomMetaTags] = useState<CustomMetaTag[]>([]);

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
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/panel/settings` : '';

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

        const { data: profileFull } = await supabase
          .from('profiles')
          .select('active_panel_id')
          .eq('id', profile.id)
          .maybeSingle();

        let panelQuery = supabase
          .from('panels')
          .select('id, name, description, subdomain, logo_url, settings, custom_branding')
          .eq('owner_id', profile.id);
        
        if (profileFull?.active_panel_id) {
          panelQuery = panelQuery.eq('id', profileFull.active_panel_id);
        }

        const { data: panels, error: panelError } = await panelQuery
          .order('created_at', { ascending: true })
          .limit(1);

        if (panelError) throw panelError;
        const panel = panels?.[0];
        if (!panel) return;

        setPanelId(panel.id);
        setSubdomain(panel.subdomain || "");

        const { data: panelSettings } = await supabase
          .from('panel_settings')
          .select('*')
          .eq('panel_id', panel.id)
          .maybeSingle();

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
          supportPhone: contactInfo.phone || "",
          supportAddress: contactInfo.address || "",
          supportWebsite: contactInfo.website || "",
          termsOfService: panelSettings?.terms_of_service || generalSettings.termsOfService || "",
          privacyPolicy: panelSettings?.privacy_policy || generalSettings.privacyPolicy || "",
          seoTitle: panelSettings?.seo_title || seoSettings.title || "",
          seoDescription: panelSettings?.seo_description || seoSettings.description || "",
          seoKeywords: panelSettings?.seo_keywords || seoSettings.keywords || "",
          canonicalUrl: seoSettings.canonicalUrl || "",
          googleVerification: seoSettings.googleVerification || "",
          bingVerification: seoSettings.bingVerification || "",
          yandexVerification: seoSettings.yandexVerification || "",
          pinterestVerification: seoSettings.pinterestVerification || "",
          facebookVerification: seoSettings.facebookVerification || "",
          faviconUrl: customBranding.faviconUrl || "",
          appleTouchIconUrl: customBranding.appleTouchIconUrl || "",
          ogImageUrl: customBranding.ogImageUrl || seoSettings.ogImage || "",
          logoUrl: panel.logo_url || customBranding.logoUrl || "",
          heroImageUrl: customBranding.heroImageUrl || "",
          showFreeTierBanner: advertisingSettings.showFreeTierBanner ?? true,
        });

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
      const { data: existingPanel } = await supabase
        .from('panels')
        .select('settings, custom_branding')
        .eq('id', panelId)
        .single();

      const existingSettings = (existingPanel?.settings as Record<string, any>) || {};
      const existingBranding = (existingPanel?.custom_branding as Record<string, any>) || {};

      const { error: panelError } = await supabase
        .from('panels')
        .update({
          name: settings.panelName,
          description: settings.description,
          logo_url: settings.logoUrl,
          custom_branding: {
            ...existingBranding,
            companyName: settings.panelName,
            faviconUrl: settings.faviconUrl,
            appleTouchIconUrl: settings.appleTouchIconUrl,
            ogImageUrl: settings.ogImageUrl,
            logoUrl: settings.logoUrl,
            heroImageUrl: settings.heroImageUrl,
          },
          settings: {
            ...existingSettings,
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

      const { error: settingsError } = await supabase
        .from('panel_settings')
        .upsert({
          panel_id: panelId,
          maintenance_mode: settings.maintenanceMode,
          maintenance_message: settings.maintenanceMessage,
          contact_info: { email: settings.supportEmail, phone: settings.supportPhone, address: settings.supportAddress, website: settings.supportWebsite },
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
      <Helmet>
        <title>Panel Settings | Home of SMM</title>
        <meta name="description" content="Configure your panel settings, SEO, branding, and order preferences." />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Panel Settings
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Configure your panel's settings, SEO, branding, and more
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all gap-2"
          data-testid="button-save-settings"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </motion.header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
          <TabsTrigger value="general" className="gap-2" data-testid="tab-general">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2" data-testid="tab-seo">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">SEO</span>
            {seoScore < 50 && (
              <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                {seoScore}%
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2" data-testid="tab-branding">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2" data-testid="tab-orders">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-2" data-testid="tab-legal">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Legal</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Panel Information
                </CardTitle>
                <CardDescription>Basic panel details and contact info</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="panelName">Panel Name</Label>
                  <Input
                    id="panelName"
                    value={settings.panelName}
                    onChange={(e) => setSettings({ ...settings, panelName: e.target.value })}
                    data-testid="input-panel-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    placeholder="support@yourpanel.com"
                    data-testid="input-support-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    type="tel"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportAddress">Business Address</Label>
                  <Input
                    id="supportAddress"
                    value={settings.supportAddress}
                    onChange={(e) => setSettings({ ...settings, supportAddress: e.target.value })}
                    placeholder="123 Main St, City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportWebsite">Website URL</Label>
                  <Input
                    id="supportWebsite"
                    type="url"
                    value={settings.supportWebsite}
                    onChange={(e) => setSettings({ ...settings, supportWebsite: e.target.value })}
                    placeholder="https://yourpanel.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Panel Description</Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    rows={3}
                    data-testid="input-description"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Panel Status
                </CardTitle>
                <CardDescription>Control access and registration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div>
                    <Label className="font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable buyer access</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                    data-testid="switch-maintenance"
                  />
                </div>
                <AnimatePresence>
                  {settings.maintenanceMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                      <Textarea
                        id="maintenanceMessage"
                        value={settings.maintenanceMessage}
                        onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                        placeholder="We're currently performing scheduled maintenance..."
                        rows={2}
                        data-testid="input-maintenance-message"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div>
                    <Label className="font-medium">Allow Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new buyers to sign up</p>
                  </div>
                  <Switch
                    checked={settings.allowRegistration}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
                    data-testid="switch-registration"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div>
                    <Label className="font-medium">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Users must verify email before ordering</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                    data-testid="switch-email-verification"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                Advertising
              </CardTitle>
              <CardDescription>Control promotional banners on your storefront</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div>
                  <Label className="font-medium flex items-center gap-2">
                    Free Tier Banner
                    <Badge variant="outline" className="text-xs">Platform</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show promotional banner on subdomain storefronts (not on custom domains)
                  </p>
                </div>
                <Switch
                  checked={settings.showFreeTierBanner}
                  onCheckedChange={(checked) => setSettings({ ...settings, showFreeTierBanner: checked })}
                  data-testid="switch-free-tier-banner"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Search className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">SEO Score</h3>
                      <p className="text-sm text-muted-foreground">
                        {seoScore >= 80 ? "Excellent! Well optimized" : seoScore >= 50 ? "Good, room for improvement" : "Add more SEO elements"}
                      </p>
                    </div>
                  </div>
                  <div className={cn("text-3xl font-bold", seoScore >= 80 ? "text-green-500" : seoScore >= 50 ? "text-yellow-500" : "text-red-500")}>
                    {seoScore}%
                  </div>
                </div>
                <Progress value={seoScore} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Google Search Preview */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Google Search Preview
              </CardTitle>
              <CardDescription>How your panel appears in search results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-border/30">
                <div className="max-w-xl">
                  <p className="text-sm text-green-700 dark:text-green-400 font-mono mb-1 truncate" data-testid="text-preview-url">
                    {settings.canonicalUrl || `https://${subdomain}.smmpilot.online`}
                  </p>
                  <h3 className="text-lg font-medium text-blue-700 dark:text-blue-400 mb-1 line-clamp-1 hover:underline cursor-default" data-testid="text-preview-title">
                    {settings.seoTitle || `${settings.panelName || 'Your Panel'} - Social Media Marketing`}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" data-testid="text-preview-description">
                    {settings.seoDescription || `Professional social media marketing services from ${settings.panelName || 'your panel'}. Buy followers, likes, and views.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Basic SEO
                </CardTitle>
                <CardDescription>Title, description, and keywords</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seoTitle">Page Title</Label>
                    <span className={cn("text-xs", settings.seoTitle.length > 60 ? "text-destructive" : settings.seoTitle.length >= 30 ? "text-green-500" : "text-muted-foreground")}>
                      {settings.seoTitle.length}/60
                    </span>
                  </div>
                  <Input
                    id="seoTitle"
                    value={settings.seoTitle}
                    onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                    placeholder="Your Panel Name - Best SMM Services"
                    data-testid="input-seo-title"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seoDescription">Meta Description</Label>
                    <span className={cn("text-xs", settings.seoDescription.length > 160 ? "text-destructive" : settings.seoDescription.length >= 120 ? "text-green-500" : "text-muted-foreground")}>
                      {settings.seoDescription.length}/160
                    </span>
                  </div>
                  <Textarea
                    id="seoDescription"
                    value={settings.seoDescription}
                    onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                    placeholder="Get the best SMM services for Instagram, TikTok, YouTube and more..."
                    rows={3}
                    data-testid="input-seo-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">Keywords</Label>
                  <Input
                    id="seoKeywords"
                    value={settings.seoKeywords}
                    onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
                    placeholder="smm panel, social media marketing, buy followers"
                    data-testid="input-seo-keywords"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {settings.seoKeywords.split(",").filter((k) => k.trim()).map((keyword, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{keyword.trim()}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    value={settings.canonicalUrl}
                    onChange={(e) => setSettings({ ...settings, canonicalUrl: e.target.value })}
                    placeholder={`https://${subdomain}.smmpilot.online`}
                    data-testid="input-canonical-url"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  Verification Tags
                </CardTitle>
                <CardDescription>Search engine and social platform verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Google Search Console
                  </Label>
                  <Input
                    value={settings.googleVerification}
                    onChange={(e) => setSettings({ ...settings, googleVerification: e.target.value })}
                    placeholder="google-site-verification content"
                    data-testid="input-google-verification"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Bing Webmaster
                  </Label>
                  <Input
                    value={settings.bingVerification}
                    onChange={(e) => setSettings({ ...settings, bingVerification: e.target.value })}
                    placeholder="msvalidate.01 content"
                    data-testid="input-bing-verification"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Yandex
                  </Label>
                  <Input
                    value={settings.yandexVerification}
                    onChange={(e) => setSettings({ ...settings, yandexVerification: e.target.value })}
                    placeholder="yandex-verification content"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Pinterest
                  </Label>
                  <Input
                    value={settings.pinterestVerification}
                    onChange={(e) => setSettings({ ...settings, pinterestVerification: e.target.value })}
                    placeholder="p:domain_verify content"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Facebook Domain
                  </Label>
                  <Input
                    value={settings.facebookVerification}
                    onChange={(e) => setSettings({ ...settings, facebookVerification: e.target.value })}
                    placeholder="facebook-domain-verification content"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    Custom Meta Tags
                  </CardTitle>
                  <CardDescription>Add custom meta tags to your storefront</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={addCustomMetaTag} data-testid="button-add-meta-tag">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Tag
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customMetaTags.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No custom meta tags added yet</p>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {customMetaTags.map((tag) => (
                      <motion.div
                        key={tag.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-xl border border-border/50"
                      >
                        <Input placeholder="name (e.g., author)" value={tag.name} onChange={(e) => updateCustomMetaTag(tag.id, "name", e.target.value)} />
                        <Input placeholder="content" value={tag.content} onChange={(e) => updateCustomMetaTag(tag.id, "content", e.target.value)} className="md:col-span-2" />
                        <div className="flex gap-2">
                          <Select value={tag.placement} onValueChange={(v) => updateCustomMetaTag(tag.id, "placement", v as "head" | "body")}>
                            <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="head">&lt;head&gt;</SelectItem>
                              <SelectItem value="body">&lt;body&gt;</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => removeCustomMetaTag(tag.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Panel Images
              </CardTitle>
              <CardDescription>Upload your panel's favicon, logo, and images</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {panelId && (
                  <>
                    <ImageUpload
                      label="Favicon (32x32 or 64x64)"
                      value={settings.faviconUrl}
                      onChange={(url) => setSettings({ ...settings, faviconUrl: url })}
                      panelId={panelId}
                      folder="favicon"
                      aspectRatio="square"
                      placeholder="Upload favicon (.ico, .png)"
                    />
                    <ImageUpload
                      label="Apple Touch Icon (180x180)"
                      value={settings.appleTouchIconUrl}
                      onChange={(url) => setSettings({ ...settings, appleTouchIconUrl: url })}
                      panelId={panelId}
                      folder="favicon"
                      aspectRatio="square"
                      placeholder="Upload Apple Touch Icon"
                    />
                    <ImageUpload
                      label="Open Graph Image (1200x630)"
                      value={settings.ogImageUrl}
                      onChange={(url) => setSettings({ ...settings, ogImageUrl: url })}
                      panelId={panelId}
                      folder="og"
                      aspectRatio="wide"
                      placeholder="Image for social sharing"
                    />
                    <ImageUpload
                      label="Logo"
                      value={settings.logoUrl}
                      onChange={(url) => setSettings({ ...settings, logoUrl: url })}
                      panelId={panelId}
                      folder="logos"
                      aspectRatio="auto"
                      placeholder="Your panel logo"
                    />
                    <ImageUpload
                      label="Hero Image"
                      value={settings.heroImageUrl}
                      onChange={(url) => setSettings({ ...settings, heroImageUrl: url })}
                      panelId={panelId}
                      folder="hero"
                      aspectRatio="wide"
                      placeholder="Main banner image"
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {uploadedImages.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Image Gallery
                </CardTitle>
                <CardDescription>Preview of all uploaded images</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {uploadedImages.map((img) => (
                    <div
                      key={img.key}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/20"
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <p className="text-xs text-white font-medium">{img.label}</p>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => window.open(img.url, "_blank")}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => copyToClipboard(img.url)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Order Settings
              </CardTitle>
              <CardDescription>Configure currency and order limits for your panel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Default Currency</Label>
                  <Input
                    id="defaultCurrency"
                    value={settings.defaultCurrency}
                    onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                    data-testid="input-currency"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    step="0.01"
                    value={settings.minOrderAmount}
                    onChange={(e) => setSettings({ ...settings, minOrderAmount: e.target.value })}
                    data-testid="input-min-order"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOrderAmount">Maximum Order Amount</Label>
                  <Input
                    id="maxOrderAmount"
                    type="number"
                    step="0.01"
                    value={settings.maxOrderAmount}
                    onChange={(e) => setSettings({ ...settings, maxOrderAmount: e.target.value })}
                    data-testid="input-max-order"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Legal Pages
              </CardTitle>
              <CardDescription>Terms of service and privacy policy for your buyers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeneralSettings;
