import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { getIconByKey } from "@/components/icons/SocialIcons";
import { IconPickerWithSearch } from "./IconPickerWithSearch";
import { IconUploadDialog } from "./IconUploadDialog";
import {
  Settings,
  DollarSign,
  Users,
  Search,
  Sparkles,
  Loader2,
  Save,
  AlertCircle,
  Hash,
  Percent,
  Image,
  Link,
  Package,
  TrendingUp,
  Upload,
} from "lucide-react";

interface ServiceEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: {
    id: string;
    name: string;
    category: string;
    provider?: string;
    provider_id?: string;
    price: number;
    originalPrice?: number;
    minQty?: number;
    min_quantity?: number;
    maxQty?: number;
    max_quantity?: number;
    description?: string;
    imageUrl?: string;
    image_url?: string;
  } | null;
  providerName?: string;
  onSave: (data: any) => void;
}

interface Provider {
  id: string;
  name: string;
}

const categories = [
  { id: "instagram", name: "Instagram", icon: "📸" },
  { id: "facebook", name: "Facebook", icon: "👤" },
  { id: "twitter", name: "Twitter/X", icon: "🐦" },
  { id: "youtube", name: "YouTube", icon: "🎬" },
  { id: "tiktok", name: "TikTok", icon: "🎵" },
  { id: "linkedin", name: "LinkedIn", icon: "💼" },
  { id: "telegram", name: "Telegram", icon: "✈️" },
  { id: "spotify", name: "Spotify", icon: "🎧" },
  { id: "soundcloud", name: "SoundCloud", icon: "🎵" },
  { id: "audiomack", name: "Audiomack", icon: "🎧" },
  { id: "twitch", name: "Twitch", icon: "📺" },
  { id: "discord", name: "Discord", icon: "🎮" },
  { id: "pinterest", name: "Pinterest", icon: "📌" },
  { id: "snapchat", name: "Snapchat", icon: "👻" },
  { id: "threads", name: "Threads", icon: "🧵" },
  { id: "other", name: "Other", icon: "🌐" },
];

export const ServiceEditSheet = ({
  open,
  onOpenChange,
  service,
  providerName,
  onSave,
}: ServiceEditSheetProps) => {
  const { panel } = usePanel();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [isIconUploadOpen, setIsIconUploadOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    provider_id: "",
    min_quantity: 100,
    max_quantity: 10000,
    image_url: "",
  });

  const [markupPercent, setMarkupPercent] = useState(25);
  const [useFixedPrice, setUseFixedPrice] = useState(false);
  const [fixedPrice, setFixedPrice] = useState(0);

  useEffect(() => {
    if (open && panel?.id) {
      fetchProviders();
    }
  }, [open, panel?.id]);

  useEffect(() => {
    if (service) {
      const imageUrl = service.image_url || service.imageUrl || "";
      setFormData({
        name: service.name || "",
        description: service.description || "",
        category: service.category || "",
        provider_id: service.provider_id || "",
        min_quantity: service.min_quantity || service.minQty || 100,
        max_quantity: service.max_quantity || service.maxQty || 10000,
        image_url: imageUrl,
      });
      setFixedPrice(service.price || 0);
      setUseCustomUrl(!imageUrl.startsWith('icon:') && imageUrl.length > 0);
      setHasChanges(false);
    }
  }, [service]);

  const fetchProviders = async () => {
    if (!panel?.id) return;
    const { data } = await supabase
      .from("providers")
      .select("id, name")
      .eq("panel_id", panel.id)
      .eq("is_active", true);
    setProviders(data || []);
  };

  const providerPrice = service?.originalPrice || service?.price || 2.0;
  const calculatedPrice = useFixedPrice
    ? fixedPrice
    : providerPrice * (1 + markupPercent / 100);
  const profit = calculatedPrice - providerPrice;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!service?.id || !panel?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("services")
        .update({
          name: formData.name,
          description: formData.description,
          category: formData.category as any,
          provider_id: formData.provider_id || null,
          min_quantity: formData.min_quantity,
          max_quantity: formData.max_quantity,
          price: calculatedPrice,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service.id);

      if (error) throw error;
      onSave({ ...formData, price: calculatedPrice });
      toast({ title: "Service Updated" });
      setHasChanges(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving:", error);
      toast({ variant: "destructive", title: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const generateAIDescription = async () => {
    if (!formData.name) return;
    setGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-service-description",
        {
          body: { serviceName: formData.name, category: formData.category },
        }
      );
      if (data?.description) {
        handleChange("description", data.description);
        toast({ title: "Description generated!" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to generate" });
    } finally {
      setGeneratingDescription(false);
    }
  };

  const renderIconPreview = () => {
    if (!formData.image_url) {
      return (
        <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center">
          <Package className="w-6 h-6 text-muted-foreground" />
        </div>
      );
    }
    if (formData.image_url.startsWith("icon:")) {
      const iconKey = formData.image_url.replace("icon:", "");
      const iconData = getIconByKey(iconKey);
      const IconComponent = iconData.icon;
      return (
        <div
          className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg",
            iconData.bgColor
          )}
        >
          <IconComponent className="text-white" size={28} />
        </div>
      );
    }
    return (
      <img
        src={formData.image_url}
        alt="Preview"
        className="w-14 h-14 rounded-xl object-cover shadow-lg"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 overflow-hidden">
        {!service?.id ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading service...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header with Service Info Card */}
            <SheetHeader className="p-6 pb-4 border-b bg-gradient-to-br from-muted/30 to-muted/10">
              <div className="flex items-start gap-4">
                {renderIconPreview()}
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-xl truncate">
                    {formData.name || "Edit Service"}
                  </SheetTitle>
                  <SheetDescription className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      <Hash className="w-3 h-3 mr-0.5" />
                      {service.id.slice(0, 8)}
                    </Badge>
                    {providerName && (
                      <Badge variant="secondary" className="text-xs">
                        {providerName}
                      </Badge>
                    )}
                    <Badge className="text-xs capitalize bg-primary/20 text-primary border-primary/30">
                      {formData.category}
                    </Badge>
                  </SheetDescription>
                </div>
                
                {/* Mini Price Card */}
                <Card className="hidden sm:block bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Your Price</p>
                    <p className="text-xl font-bold text-primary">
                      ${calculatedPrice.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {hasChanges && (
                <div className="flex items-center gap-2 mt-4 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 dark:text-amber-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>You have unsaved changes</span>
                </div>
              )}
            </SheetHeader>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="grid grid-cols-4 mx-6 mt-4 bg-muted/50">
                <TabsTrigger value="general" className="text-xs gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pricing</span>
                </TabsTrigger>
                <TabsTrigger value="custom" className="text-xs gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Custom</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SEO</span>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 p-6">
                {/* General Tab - Kanban Card Layout */}
                <TabsContent value="general" className="m-0 space-y-4">
                  {/* Provider & Category Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          Provider
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Select
                          value={formData.provider_id}
                          onValueChange={(v) => handleChange("provider_id", v)}
                        >
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Provider</SelectItem>
                            {providers.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          Category
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Select
                          value={formData.category}
                          onValueChange={(v) => handleChange("category", v)}
                        >
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.icon} {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Service Icon Card */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Image className="w-4 h-4 text-muted-foreground" />
                          Service Icon
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="edit-custom-url" className="text-xs text-muted-foreground">
                            <Link className="w-3 h-3 inline mr-1" />
                            Custom URL
                          </Label>
                          <Switch
                            id="edit-custom-url"
                            checked={useCustomUrl}
                            onCheckedChange={(checked) => {
                              setUseCustomUrl(checked);
                              if (!checked) {
                                handleChange("image_url", "icon:instagram");
                              } else {
                                handleChange("image_url", "");
                              }
                            }}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      {!useCustomUrl ? (
                        <IconPickerWithSearch
                          selectedIcon={formData.image_url}
                          onSelectIcon={(iconKey) => handleChange("image_url", iconKey)}
                          maxHeight="180px"
                          showUploadButton={true}
                          onUploadClick={() => setIsIconUploadOpen(true)}
                        />
                      ) : (
                        <div className="space-y-3">
                          <Input
                            placeholder="Enter custom image URL (https://...)"
                            value={formData.image_url}
                            onChange={(e) => handleChange("image_url", e.target.value)}
                            className="bg-background/50"
                          />
                          {formData.image_url && (
                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                              <img
                                src={formData.image_url}
                                alt="Preview"
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                              <span className="text-sm text-muted-foreground">Image preview</span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Service Name Card */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Service Name</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="e.g., Instagram Followers - Premium"
                        className="bg-background/50"
                      />
                    </CardContent>
                  </Card>

                  {/* Quantity Range Card */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">Quantity Range</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Min Quantity</Label>
                          <Input
                            type="number"
                            value={formData.min_quantity}
                            onChange={(e) =>
                              handleChange("min_quantity", parseInt(e.target.value) || 0)
                            }
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Max Quantity</Label>
                          <Input
                            type="number"
                            value={formData.max_quantity}
                            onChange={(e) =>
                              handleChange("max_quantity", parseInt(e.target.value) || 0)
                            }
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description Card */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Description</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={generateAIDescription}
                          disabled={generatingDescription}
                          className="text-xs h-7"
                        >
                          {generatingDescription ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <Sparkles className="w-3 h-3 mr-1" />
                          )}
                          AI Generate
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Describe your service..."
                        rows={4}
                        className="bg-background/50"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent value="pricing" className="m-0 space-y-4">
                  {/* Price Summary Card */}
                  <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                    <CardContent className="p-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-xl bg-background/50">
                          <p className="text-xs text-muted-foreground mb-1">Provider Price</p>
                          <p className="text-2xl font-bold">
                            ${providerPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-primary/10">
                          <p className="text-xs text-muted-foreground mb-1">Your Price</p>
                          <p className="text-2xl font-bold text-primary">
                            ${calculatedPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center mt-4">
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                          <Percent className="w-3 h-3 mr-1" />
                          Profit: ${profit.toFixed(2)} (+{markupPercent}%)
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pricing Mode Card */}
                  <Card className="bg-card/50 border-border/50">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">Pricing Mode</CardTitle>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Use Fixed Price</Label>
                          <Switch
                            checked={useFixedPrice}
                            onCheckedChange={setUseFixedPrice}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      {useFixedPrice ? (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Fixed Price (per 1k)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={fixedPrice}
                            onChange={(e) => {
                              setFixedPrice(parseFloat(e.target.value) || 0);
                              setHasChanges(true);
                            }}
                            className="bg-background/50"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Markup Percentage</Label>
                            <Badge variant="outline" className="font-mono">{markupPercent}%</Badge>
                          </div>
                          <Slider
                            value={[markupPercent]}
                            onValueChange={(v) => {
                              setMarkupPercent(v[0]);
                              setHasChanges(true);
                            }}
                            min={0}
                            max={200}
                            step={5}
                            className="py-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>100%</span>
                            <span>200%</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Custom Prices Tab */}
                <TabsContent value="custom" className="m-0 space-y-4">
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="p-8 text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium mb-2">Custom Pricing per Customer</p>
                      <p className="text-sm text-muted-foreground">
                        Coming soon - Set special prices for VIP customers
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* SEO Tab */}
                <TabsContent value="seo" className="m-0 space-y-4">
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="p-8 text-center">
                      <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium mb-2">Service SEO Settings</p>
                      <p className="text-sm text-muted-foreground">
                        Configure meta tags and search visibility
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            {/* Sticky Footer */}
            <SheetFooter className="p-4 border-t bg-background/95 backdrop-blur-sm">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>

      {/* Icon Upload Dialog */}
      {panel?.id && (
        <IconUploadDialog
          open={isIconUploadOpen}
          onOpenChange={setIsIconUploadOpen}
          panelId={panel.id}
          onIconUploaded={(url) => {
            handleChange("image_url", url);
            setUseCustomUrl(true);
          }}
        />
      )}
    </Sheet>
  );
};

export default ServiceEditSheet;
