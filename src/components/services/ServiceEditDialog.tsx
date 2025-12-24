import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { SOCIAL_ICONS_MAP, getIconByKey } from "@/components/icons/SocialIcons";
import { ServiceSEOTab } from "@/components/services/ServiceSEOTab";
import {
  Settings,
  DollarSign,
  BarChart3,
  Search,
  Users,
  Percent,
  RefreshCw,
  XCircle,
  ArrowDownUp,
  Hand,
  Info,
  TrendingUp,
  ShoppingCart,
  Sparkles,
  Loader2,
  ArrowLeft,
  Trash2,
  Copy,
  Hash
} from "lucide-react";

interface ServiceEditDialogProps {
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
    orders?: number;
  } | null;
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

const serviceTypes = [
  "Followers", "Likes", "Views", "Comments", "Shares", 
  "Subscribers", "Members", "Plays", "Saves", "Other"
];

export const ServiceEditDialog = ({
  open,
  onOpenChange,
  service,
  onSave,
}: ServiceEditDialogProps) => {
  const { panel } = usePanel();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    serviceType: "Followers",
    provider_id: "",
    min_quantity: 100,
    max_quantity: 10000,
    image_url: "",
  });

  // Price state
  const [markupPercent, setMarkupPercent] = useState(25);
  const [useFixedPrice, setUseFixedPrice] = useState(false);
  const [fixedPrice, setFixedPrice] = useState(0);

  // Options state
  const [options, setOptions] = useState({
    minMaxParsed: true,
    cancelEnabled: true,
    refillEnabled: true,
    overflowEnabled: false,
    oneOrderPerHand: false,
  });

  // SEO state
  const [seoData, setSeoData] = useState({
    indexStatus: "index" as "index" | "noindex",
    slug: "",
    canonicalUrl: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    customHtmlEnabled: false,
    customHtml: "",
    internalLinkingEnabled: true,
  });

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
        serviceType: "Followers",
        provider_id: service.provider_id || "",
        min_quantity: service.min_quantity || service.minQty || 100,
        max_quantity: service.max_quantity || service.maxQty || 10000,
        image_url: service.image_url || service.imageUrl || "",
      });
      setFixedPrice(service.price || 0);
      setSeoData(prev => ({
        ...prev,
        slug: service.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || "",
        metaTitle: service.name || "",
      }));
    }
  }, [service]);

  const fetchProviders = async () => {
    if (!panel?.id) return;
    setLoadingProviders(true);
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('id, name')
        .eq('panel_id', panel.id)
        .eq('is_active', true);
      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const providerPrice = service?.originalPrice || service?.price || 2.00;
  const calculatedPrice = useFixedPrice 
    ? fixedPrice 
    : providerPrice * (1 + markupPercent / 100);
  const profit = calculatedPrice - providerPrice;
  const profitPercent = providerPrice > 0 ? ((profit / providerPrice) * 100).toFixed(1) : "0";

  const handleSave = async () => {
    if (!service?.id || !panel?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('services')
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
        .eq('id', service.id);

      if (error) throw error;
      onSave({ ...formData, price: calculatedPrice, options, seoData });
      toast({ title: "Service Updated", description: "Changes saved successfully." });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = () => {
    const cat = categories.find(c => c.id === formData.category);
    return cat?.icon || "🌐";
  };

  const renderIconPreview = () => {
    if (!formData.image_url) return null;
    
    if (formData.image_url.startsWith('icon:')) {
      const iconKey = formData.image_url.replace('icon:', '');
      const iconData = getIconByKey(iconKey);
      const IconComponent = iconData.icon;
      return (
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconData.bgColor)}>
          <IconComponent className="text-white" size={20} />
        </div>
      );
    }
    return (
      <img src={formData.image_url} alt="Preview" className="w-10 h-10 rounded-xl object-cover" 
        onError={(e) => e.currentTarget.style.display = 'none'} />
    );
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Enhanced Header */}
        <DialogHeader className="p-4 pb-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon()}</span>
                {renderIconPreview()}
              </div>
              <div>
                <DialogTitle className="text-base">{formData.name || "Edit Service"}</DialogTitle>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[10px]">
                    <Hash className="w-2.5 h-2.5 mr-0.5" />
                    {service.id.slice(0, 8)}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("seo")} className="text-xs gap-1.5">
              <Search className="w-3.5 h-3.5" />
              SEO
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 mx-4 mt-3 bg-muted/50">
            <TabsTrigger value="general" className="text-xs gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              General
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="custom-prices" className="text-xs gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Custom
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs gap-1.5">
              <Search className="w-3.5 h-3.5" />
              SEO
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* General Tab */}
            <TabsContent value="general" className="m-0 space-y-4">
              {/* Provider & Service ID Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select value={formData.provider_id} onValueChange={(v) => setFormData({...formData, provider_id: v})} disabled={loadingProviders}>
                    <SelectTrigger className="bg-background/50">
                      {loadingProviders ? <Loader2 className="w-4 h-4 animate-spin" /> : <SelectValue placeholder="Select provider" />}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Provider</SelectItem>
                      {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Service ID</Label>
                  <div className="flex gap-2">
                    <Input value={service.id.slice(0, 12) + "..."} disabled className="bg-muted/50 font-mono text-xs" />
                    <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(service.id); toast({ title: "Copied!" }); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />
              
              {/* Description Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Description
                </h3>
                
                {/* Icon Selector */}
                <div className="space-y-2">
                  <Label>Service Icon</Label>
                  <div className="grid grid-cols-8 gap-2 p-2 bg-muted/30 rounded-lg border max-h-[120px] overflow-y-auto">
                    {Object.entries(SOCIAL_ICONS_MAP).slice(0, 24).map(([key, { icon: IconComponent, label, bgColor }]) => (
                      <button key={key} type="button"
                        onClick={() => setFormData({...formData, image_url: `icon:${key}`})}
                        className={cn("p-1.5 rounded-lg transition-all hover:scale-105",
                          formData.image_url === `icon:${key}` ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"
                        )} title={label}>
                        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center", bgColor)}>
                          <IconComponent className="text-white" size={14} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Instagram Followers - Premium" className="bg-background/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Select value={formData.serviceType} onValueChange={(v) => setFormData({...formData, serviceType: v})}>
                      <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v, image_url: `icon:${v}`})}>
                      <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Quantity</Label>
                    <Input type="number" value={formData.min_quantity} onChange={(e) => setFormData({...formData, min_quantity: parseInt(e.target.value) || 0})} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Quantity</Label>
                    <Input type="number" value={formData.max_quantity} onChange={(e) => setFormData({...formData, max_quantity: parseInt(e.target.value) || 0})} className="bg-background/50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe your service..." className="bg-background/50 min-h-[60px]" />
                </div>
              </div>

              <Separator className="my-4" />

              {/* Options Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Options</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "minMaxParsed", label: "Min/Max from provider", icon: ArrowDownUp },
                    { key: "cancelEnabled", label: "Cancel enabled", icon: XCircle },
                    { key: "refillEnabled", label: "Refill support", icon: RefreshCw },
                    { key: "overflowEnabled", label: "Overflow", icon: TrendingUp },
                    { key: "oneOrderPerHand", label: "1 order in 1 hand", icon: Hand },
                  ].map((opt) => (
                    <div key={opt.key} className={cn("flex items-center justify-between p-2 rounded-lg border text-sm",
                      options[opt.key as keyof typeof options] ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border/50")}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs">{opt.label}</span>
                      </div>
                      <Switch checked={options[opt.key as keyof typeof options]} onCheckedChange={(checked) => setOptions({...options, [opt.key]: checked})} />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="m-0 space-y-4">
              <Card className="bg-muted/50"><CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Provider Price (per 1000)</p>
                  <p className="text-2xl font-bold">${providerPrice.toFixed(2)}</p>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">{providers.find(p => p.id === formData.provider_id)?.name || 'Manual'}</Badge>
              </CardContent></Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><Percent className="w-4 h-4" />Your Extra Price</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={useFixedPrice} onCheckedChange={setUseFixedPrice} />
                    <span className="text-sm text-muted-foreground">Fixed</span>
                  </div>
                </div>
                {!useFixedPrice ? (
                  <div className="flex items-center gap-4">
                    <Slider value={[markupPercent]} onValueChange={([v]) => setMarkupPercent(v)} min={0} max={100} className="flex-1" />
                    <span className="text-2xl font-bold text-primary w-16 text-center">{markupPercent}%</span>
                  </div>
                ) : (
                  <Input type="number" value={fixedPrice} onChange={(e) => setFixedPrice(parseFloat(e.target.value) || 0)} step="0.01" className="bg-background/50" />
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="w-3 h-3" />Price auto-updates with provider</p>
              </div>

              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30"><CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Price (per 1000)</p>
                  <p className="text-3xl font-bold text-primary">${calculatedPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-500/10 text-green-500 mb-1">+${profit.toFixed(2)}</Badge>
                  <p className="text-xs text-muted-foreground">{profitPercent}% margin</p>
                </div>
              </CardContent></Card>

              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-muted/50"><CardContent className="p-3 text-center">
                  <ShoppingCart className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{service.orders || 0}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </CardContent></Card>
                <Card className="bg-muted/50"><CardContent className="p-3 text-center">
                  <DollarSign className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">${((service.orders || 0) * profit).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Est. Profit</p>
                </CardContent></Card>
                <Card className="bg-muted/50"><CardContent className="p-3 text-center">
                  <BarChart3 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{profitPercent}%</p>
                  <p className="text-xs text-muted-foreground">Margin</p>
                </CardContent></Card>
              </div>
            </TabsContent>

            {/* Custom Prices Tab */}
            <TabsContent value="custom-prices" className="m-0 space-y-4">
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold">Custom Prices</h3><p className="text-sm text-muted-foreground">Set individual pricing for customers</p></div>
                <Button size="sm" variant="outline"><Users className="w-4 h-4 mr-2" />Add Customer</Button>
              </div>
              <Card className="bg-muted/30 border-dashed"><CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No custom prices set</p>
              </CardContent></Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="m-0">
              <ServiceSEOTab serviceName={formData.name} seoData={seoData} onUpdate={(data) => setSeoData(prev => ({ ...prev, ...data }))} />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="p-4 border-t border-border/50 flex-row justify-between">
          <Button variant="destructive" size="sm" className="gap-2"><Trash2 className="w-4 h-4" />Remove</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-green-600 to-green-500 gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <Sparkles className="w-4 h-4" />Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
