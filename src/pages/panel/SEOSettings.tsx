import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ImageUpload } from "@/components/panel/ImageUpload";
import { 
  Search,
  Globe,
  FileText,
  Image as ImageIcon,
  Settings2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Trash2,
  Eye,
  Loader2,
  Sparkles,
  Tag,
  Link2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonicalUrl: string;
  robotsTxt: string;
  customScripts: string;
  structuredData: string;
}

interface UploadedImage {
  url: string;
  name: string;
  type: 'logo' | 'favicon' | 'hero' | 'og';
  uploadedAt: string;
}

const SEOSettings = () => {
  const { toast } = useToast();
  const [panelId, setPanelId] = useState<string | null>(null);
  const [panelSubdomain, setPanelSubdomain] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("meta");
  
  const [seoData, setSeoData] = useState<SEOData>({
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
    canonicalUrl: "",
    robotsTxt: `User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml`,
    customScripts: "",
    structuredData: ""
  });

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // Calculate SEO score
  const calculateSEOScore = () => {
    let score = 0;
    const checks = [
      { condition: seoData.title.length >= 30 && seoData.title.length <= 60, points: 20 },
      { condition: seoData.description.length >= 120 && seoData.description.length <= 160, points: 20 },
      { condition: seoData.keywords.split(',').length >= 3, points: 15 },
      { condition: !!seoData.ogImage, points: 15 },
      { condition: !!seoData.canonicalUrl, points: 10 },
      { condition: seoData.robotsTxt.includes('Sitemap:'), points: 10 },
      { condition: !!seoData.structuredData, points: 10 }
    ];
    checks.forEach(check => { if (check.condition) score += check.points; });
    return score;
  };

  useEffect(() => {
    loadSettings();
  }, []);

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

      const { data: panel } = await supabase
        .from('panels')
        .select('id, subdomain, custom_branding')
        .eq('owner_id', profile.id)
        .single();

      if (!panel) return;

      setPanelId(panel.id);
      setPanelSubdomain(panel.subdomain);

      // Load SEO from panel_settings
      const { data: settings } = await supabase
        .from('panel_settings')
        .select('*')
        .eq('panel_id', panel.id)
        .maybeSingle();

      if (settings) {
        setSeoData(prev => ({
          ...prev,
          title: settings.seo_title || "",
          description: settings.seo_description || "",
          keywords: settings.seo_keywords || ""
        }));
      }

      // Load uploaded images from custom_branding
      if (panel.custom_branding && typeof panel.custom_branding === 'object') {
        const branding = panel.custom_branding as Record<string, any>;
        const images: UploadedImage[] = [];
        
        if (branding.logoUrl) images.push({ url: branding.logoUrl, name: 'Logo', type: 'logo', uploadedAt: 'Earlier' });
        if (branding.faviconUrl) images.push({ url: branding.faviconUrl, name: 'Favicon', type: 'favicon', uploadedAt: 'Earlier' });
        if (branding.heroImage) images.push({ url: branding.heroImage, name: 'Hero Image', type: 'hero', uploadedAt: 'Earlier' });
        if (branding.ogImage) images.push({ url: branding.ogImage, name: 'OG Image', type: 'og', uploadedAt: 'Earlier' });
        
        setUploadedImages(images);
      }
    } catch (error) {
      console.error('Error loading SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!panelId) return;
    
    setSaving(true);
    try {
      // Update panel_settings
      const { error: settingsError } = await supabase
        .from('panel_settings')
        .upsert({
          panel_id: panelId,
          seo_title: seoData.title,
          seo_description: seoData.description,
          seo_keywords: seoData.keywords
        }, { onConflict: 'panel_id' });

      if (settingsError) throw settingsError;

      // Update custom_branding with OG image
      const { data: panel } = await supabase
        .from('panels')
        .select('custom_branding')
        .eq('id', panelId)
        .single();

      const currentBranding = (panel?.custom_branding as Record<string, any>) || {};
      
      const { error: brandingError } = await supabase
        .from('panels')
        .update({
          custom_branding: {
            ...currentBranding,
            ogImage: seoData.ogImage,
            seoUpdatedAt: new Date().toISOString()
          }
        })
        .eq('id', panelId);

      if (brandingError) throw brandingError;

      toast({ title: "SEO settings saved!" });
    } catch (error) {
      console.error('Error saving SEO:', error);
      toast({ variant: "destructive", title: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const seoScore = calculateSEOScore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">SEO Settings</h1>
          <p className="text-muted-foreground">Optimize your panel for search engines</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>

      {/* SEO Score Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-card to-secondary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                seoScore >= 80 ? "bg-green-500/20 text-green-500" :
                seoScore >= 50 ? "bg-yellow-500/20 text-yellow-500" :
                "bg-red-500/20 text-red-500"
              )}>
                {seoScore}
              </div>
              <div>
                <h3 className="font-semibold">SEO Score</h3>
                <p className="text-sm text-muted-foreground">
                  {seoScore >= 80 ? "Excellent! Your SEO is well optimized." :
                   seoScore >= 50 ? "Good, but there's room for improvement." :
                   "Needs work. Complete more SEO fields."}
                </p>
              </div>
            </div>
            <Badge variant={seoScore >= 80 ? "default" : "secondary"}>
              {seoScore >= 80 ? "Optimized" : seoScore >= 50 ? "Fair" : "Needs Work"}
            </Badge>
          </div>
          <Progress value={seoScore} className="h-2" />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 border">
          <TabsTrigger value="meta" className="gap-2">
            <Tag className="w-4 h-4" />
            Meta Tags
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="technical" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Meta Tags Tab */}
        <TabsContent value="meta" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Page Title */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Page Title
                </CardTitle>
                <CardDescription>The main title shown in search results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={seoData.title}
                  onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
                  placeholder="My Awesome SMM Panel - Best Social Media Services"
                  maxLength={60}
                />
                <div className="flex justify-between text-xs">
                  <span className={cn(
                    seoData.title.length >= 30 && seoData.title.length <= 60 
                      ? "text-green-500" 
                      : "text-yellow-500"
                  )}>
                    {seoData.title.length >= 30 && seoData.title.length <= 60 ? (
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                    ) : (
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                    )}
                    {seoData.title.length}/60 characters
                  </span>
                  <span className="text-muted-foreground">Optimal: 30-60</span>
                </div>
              </CardContent>
            </Card>

            {/* Meta Description */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Meta Description
                </CardTitle>
                <CardDescription>Summary shown in search results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={seoData.description}
                  onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
                  placeholder="Get high-quality Instagram followers, YouTube views, TikTok likes and more..."
                  maxLength={160}
                  rows={3}
                />
                <div className="flex justify-between text-xs">
                  <span className={cn(
                    seoData.description.length >= 120 && seoData.description.length <= 160 
                      ? "text-green-500" 
                      : "text-yellow-500"
                  )}>
                    {seoData.description.length >= 120 && seoData.description.length <= 160 ? (
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                    ) : (
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                    )}
                    {seoData.description.length}/160 characters
                  </span>
                  <span className="text-muted-foreground">Optimal: 120-160</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Keywords */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Keywords
              </CardTitle>
              <CardDescription>Comma-separated keywords for your panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={seoData.keywords}
                onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
                placeholder="smm panel, instagram followers, youtube views, tiktok likes, social media marketing"
                rows={2}
              />
              <div className="flex flex-wrap gap-2">
                {seoData.keywords.split(',').filter(k => k.trim()).map((keyword, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {keyword.trim()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Canonical URL */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Canonical URL
              </CardTitle>
              <CardDescription>The preferred URL for this page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={seoData.canonicalUrl || `https://${panelSubdomain}.smmpilot.online`}
                  onChange={(e) => setSeoData({ ...seoData, canonicalUrl: e.target.value })}
                  placeholder="https://yourdomain.com"
                />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(seoData.canonicalUrl)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab - Kanban Style */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Image Gallery</CardTitle>
              <CardDescription>View and manage all uploaded images</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Kanban-style image grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No images uploaded yet</p>
                    <p className="text-sm">Upload images in the Branding section</p>
                  </div>
                ) : (
                  uploadedImages.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative border rounded-lg overflow-hidden bg-muted/50"
                    >
                      <div className="aspect-square">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => window.open(image.url, '_blank')}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => copyToClipboard(image.url)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-2 bg-card">
                        <Badge variant="outline" className="text-xs capitalize">
                          {image.type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{image.name}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* OG Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Open Graph Image</CardTitle>
              <CardDescription>Image shown when sharing on social media (1200x630 recommended)</CardDescription>
            </CardHeader>
            <CardContent>
              {panelId && (
                <ImageUpload
                  label="OG Image"
                  value={seoData.ogImage}
                  onChange={(url) => setSeoData({ ...seoData, ogImage: url })}
                  panelId={panelId}
                  folder="og"
                  placeholder="Upload social sharing image"
                  aspectRatio="wide"
                  maxSizeMB={2}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                robots.txt
              </CardTitle>
              <CardDescription>Control search engine crawling</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={seoData.robotsTxt}
                onChange={(e) => setSeoData({ ...seoData, robotsTxt: e.target.value })}
                rows={6}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Structured Data (JSON-LD)
              </CardTitle>
              <CardDescription>Add schema markup for rich snippets</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={seoData.structuredData}
                onChange={(e) => setSeoData({ ...seoData, structuredData: e.target.value })}
                placeholder={`{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Panel Name",
  "url": "https://yourpanel.com"
}`}
                rows={8}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custom Scripts</CardTitle>
              <CardDescription>Add tracking or analytics scripts (head section)</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={seoData.customScripts}
                onChange={(e) => setSeoData({ ...seoData, customScripts: e.target.value })}
                placeholder="<!-- Google Analytics, Facebook Pixel, etc. -->"
                rows={6}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Google Search Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-blue-600 text-xl hover:underline cursor-pointer">
                  {seoData.title || "Your Panel Title"}
                </div>
                <div className="text-green-700 text-sm">
                  {seoData.canonicalUrl || `https://${panelSubdomain}.smmpilot.online`}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {seoData.description || "Your meta description will appear here..."}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Social Media Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg max-w-md">
                {seoData.ogImage ? (
                  <img src={seoData.ogImage} alt="OG Preview" className="w-full h-40 object-cover rounded-t-lg" />
                ) : (
                  <div className="w-full h-40 bg-muted-foreground/20 rounded-t-lg flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="p-3 bg-card rounded-b-lg border-t">
                  <p className="text-xs text-muted-foreground uppercase">
                    {panelSubdomain}.smmpilot.online
                  </p>
                  <p className="font-semibold mt-1 line-clamp-1">
                    {seoData.title || "Your Panel Title"}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {seoData.description || "Your description..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOSettings;
