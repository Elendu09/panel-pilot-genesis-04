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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { SOCIAL_ICONS_MAP, getIconByKey } from "@/components/icons/SocialIcons";
import {
  Settings,
  DollarSign,
  Users,
  Search,
  Sparkles,
  Loader2,
  Save,
  AlertCircle,
  Eye,
  Hash,
  Percent,
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
  { id: "discord", name: "Discord", icon: "🎮" },
  { id: "twitch", name: "Twitch", icon: "📺" },
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
      setFormData({
        name: service.name || "",
        description: service.description || "",
        category: service.category || "",
        provider_id: service.provider_id || "",
        min_quantity: service.min_quantity || service.minQty || 100,
        max_quantity: service.max_quantity || service.maxQty || 10000,
        image_url: service.image_url || service.imageUrl || "",
      });
      setFixedPrice(service.price || 0);
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
    if (!formData.image_url) return null;
    if (formData.image_url.startsWith("icon:")) {
      const iconKey = formData.image_url.replace("icon:", "");
      const iconData = getIconByKey(iconKey);
      const IconComponent = iconData.icon;
      return (
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            iconData.bgColor
          )}
        >
          <IconComponent className="text-white" size={24} />
        </div>
      );
    }
    return (
      <img
        src={formData.image_url}
        alt="Preview"
        className="w-12 h-12 rounded-xl object-cover"
      />
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0">
        {!service?.id ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading service...</p>
            </div>
          </div>
        ) : (
          <>
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            {renderIconPreview()}
            <div>
              <SheetTitle className="text-lg">
                {formData.name || "Edit Service"}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Hash className="w-3 h-3 mr-0.5" />
                  {service.id.slice(0, 8)}
                </Badge>
                {providerName && (
                  <Badge variant="secondary" className="text-xs">
                    {providerName}
                  </Badge>
                )}
              </SheetDescription>
            </div>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-warning/10 rounded-lg text-warning text-sm">
              <AlertCircle className="w-4 h-4" />
              You have unsaved changes
            </div>
          )}
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-4 mx-6 mt-4 bg-muted/50">
            <TabsTrigger value="general" className="text-xs gap-1">
              <Settings className="w-3.5 h-3.5" />
              General
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs gap-1">
              <Users className="w-3.5 h-3.5" />
              Custom
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs gap-1">
              <Search className="w-3.5 h-3.5" />
              SEO
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-6">
            {/* General Tab */}
            <TabsContent value="general" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select
                    value={formData.provider_id}
                    onValueChange={(v) => handleChange("provider_id", v)}
                  >
                    <SelectTrigger>
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
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => handleChange("category", v)}
                  >
                    <SelectTrigger>
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
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service Icon</Label>
                <div className="grid grid-cols-8 gap-2 p-3 bg-muted/30 rounded-lg border max-h-32 overflow-y-auto">
                  {Object.entries(SOCIAL_ICONS_MAP)
                    .slice(0, 24)
                    .map(([key, { icon: IconComponent, label, bgColor }]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleChange("image_url", `icon:${key}`)}
                        className={cn(
                          "p-1.5 rounded-lg transition-all hover:scale-105",
                          formData.image_url === `icon:${key}`
                            ? "ring-2 ring-primary bg-primary/10"
                            : "hover:bg-muted/50"
                        )}
                        title={label}
                      >
                        <div
                          className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center",
                            bgColor
                          )}
                        >
                          <IconComponent className="text-white" size={14} />
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Instagram Followers - Premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Quantity</Label>
                  <Input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) =>
                      handleChange("min_quantity", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Quantity</Label>
                  <Input
                    type="number"
                    value={formData.max_quantity}
                    onChange={(e) =>
                      handleChange("max_quantity", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Description</Label>
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
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe your service..."
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="m-0 space-y-4">
              <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Provider Price</p>
                      <p className="text-2xl font-bold">
                        ${providerPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Your Price</p>
                      <p className="text-2xl font-bold text-primary">
                        ${calculatedPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge className="bg-emerald-500/20 text-emerald-500">
                      <Percent className="w-3 h-3 mr-1" />
                      Profit: ${profit.toFixed(2)} (+{markupPercent}%)
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Use Fixed Price</Label>
                  <Switch
                    checked={useFixedPrice}
                    onCheckedChange={setUseFixedPrice}
                  />
                </div>

                {useFixedPrice ? (
                  <div className="space-y-2">
                    <Label>Fixed Price (per 1k)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={fixedPrice}
                      onChange={(e) => {
                        setFixedPrice(parseFloat(e.target.value) || 0);
                        setHasChanges(true);
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Markup Percentage</Label>
                      <Badge variant="outline">{markupPercent}%</Badge>
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
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>100%</span>
                      <span>200%</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Custom Prices Tab */}
            <TabsContent value="custom" className="m-0 space-y-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Custom pricing per customer</p>
                  <p className="text-xs mt-1">
                    Coming soon - Set special prices for VIP customers
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="m-0 space-y-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-center text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Service SEO Settings</p>
                  <p className="text-xs mt-1">
                    Configure meta tags and search visibility
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <SheetFooter className="p-4 border-t bg-muted/30">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
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
    </Sheet>
  );
};

export default ServiceEditSheet;
