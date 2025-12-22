import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
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
  Image,
  Sparkles,
  Loader2,
  Link2
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
  { id: "instagram", name: "Instagram" },
  { id: "facebook", name: "Facebook" },
  { id: "twitter", name: "Twitter" },
  { id: "youtube", name: "YouTube" },
  { id: "tiktok", name: "TikTok" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "telegram", name: "Telegram" },
  { id: "other", name: "Other" },
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
    additionalOptions: false,
  });

  // Load providers from database
  useEffect(() => {
    if (open && panel?.id) {
      fetchProviders();
    }
  }, [open, panel?.id]);

  // Initialize form when service changes
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

      onSave({
        ...formData,
        price: calculatedPrice,
        options,
      });
      
      toast({ title: "Service Updated", description: "Changes have been saved to database." });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>Configure service settings, pricing, and options</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 bg-muted/50">
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

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* General Tab */}
            <TabsContent value="general" className="m-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Service Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Instagram Followers - Premium"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select 
                    value={formData.provider_id} 
                    onValueChange={(v) => setFormData({...formData, provider_id: v})}
                    disabled={loadingProviders}
                  >
                    <SelectTrigger className="bg-background/50">
                      {loadingProviders ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <SelectValue placeholder="Select provider" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Provider</SelectItem>
                      {providers.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Min Quantity</Label>
                  <Input 
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({...formData, min_quantity: parseInt(e.target.value) || 0})}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Quantity</Label>
                  <Input 
                    type="number"
                    value={formData.max_quantity}
                    onChange={(e) => setFormData({...formData, max_quantity: parseInt(e.target.value) || 0})}
                    className="bg-background/50"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your service..."
                    className="bg-background/50 min-h-[80px]"
                  />
                </div>

                <div className="col-span-2 space-y-3">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Service Icon
                  </Label>
                  
                  {/* Icon Type Toggle */}
                  <div className="flex items-center gap-3 mb-3">
                    <Button
                      type="button"
                      variant={!formData.image_url?.startsWith('icon:') && formData.image_url ? "outline" : "default"}
                      size="sm"
                      onClick={() => setFormData({...formData, image_url: "icon:instagram"})}
                      className="flex-1"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Icon Library
                    </Button>
                    <Button
                      type="button"
                      variant={formData.image_url && !formData.image_url.startsWith('icon:') ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({...formData, image_url: ""})}
                      className="flex-1"
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Custom URL
                    </Button>
                  </div>

                  {/* Icon Grid Selector */}
                  {(!formData.image_url || formData.image_url.startsWith('icon:')) ? (
                    <div className="grid grid-cols-6 gap-2 p-3 bg-muted/30 rounded-lg border border-border/50 max-h-[200px] overflow-y-auto">
                      {Object.entries(SOCIAL_ICONS_MAP).map(([key, { icon: IconComponent, label, bgColor }]) => {
                        const isSelected = formData.image_url === `icon:${key}`;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFormData({...formData, image_url: `icon:${key}`})}
                            className={cn(
                              "flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:scale-105",
                              isSelected 
                                ? "ring-2 ring-primary bg-primary/10" 
                                : "hover:bg-muted/50"
                            )}
                            title={label}
                          >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgColor)}>
                              <IconComponent className="text-white" size={16} />
                            </div>
                            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <Input 
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="https://example.com/image.png"
                      className="bg-background/50"
                    />
                  )}
                  
                  {/* Preview */}
                  {formData.image_url && (
                    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                      <span className="text-xs text-muted-foreground">Preview:</span>
                      {formData.image_url.startsWith('icon:') ? (
                        (() => {
                          const iconKey = formData.image_url.replace('icon:', '');
                          const iconData = SOCIAL_ICONS_MAP[iconKey];
                          if (iconData) {
                            const IconComponent = iconData.icon;
                            return (
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconData.bgColor)}>
                                <IconComponent className="text-white" size={16} />
                              </div>
                            );
                          }
                          return null;
                        })()
                      ) : (
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-8 h-8 rounded-lg object-cover"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Service Options */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Service Options</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "minMaxParsed", label: "Min/Max parsed from provider", icon: ArrowDownUp },
                    { key: "cancelEnabled", label: "Cancel button enabled", icon: XCircle },
                    { key: "refillEnabled", label: "Refill support", icon: RefreshCw },
                    { key: "overflowEnabled", label: "Overflow handling", icon: TrendingUp },
                    { key: "oneOrderPerHand", label: "1 order in 1 hand", icon: Hand },
                    { key: "additionalOptions", label: "Additional options", icon: Sparkles },
                  ].map((opt) => (
                    <div 
                      key={opt.key}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-colors",
                        options[opt.key as keyof typeof options] 
                          ? "bg-primary/5 border-primary/30" 
                          : "bg-muted/50 border-border/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{opt.label}</span>
                      </div>
                      <Switch 
                        checked={options[opt.key as keyof typeof options]}
                        onCheckedChange={(checked) => setOptions({...options, [opt.key]: checked})}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="m-0 space-y-4">
              {/* Provider Price Display */}
              <Card className="bg-muted/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Provider Price (per 1000)</p>
                      <p className="text-2xl font-bold">${providerPrice.toFixed(2)}</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {providers.find(p => p.id === formData.provider_id)?.name || 'Manual'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Markup Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Your Extra Price (Markup)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={useFixedPrice}
                      onCheckedChange={setUseFixedPrice}
                    />
                    <span className="text-sm text-muted-foreground">Use Fixed Price</span>
                  </div>
                </div>

                {!useFixedPrice ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[markupPercent]}
                        onValueChange={([value]) => setMarkupPercent(value)}
                        min={0}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <div className="w-20 text-center">
                        <span className="text-2xl font-bold text-primary">{markupPercent}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Your price will automatically update when the provider changes their price
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Fixed Price (per 1000)</Label>
                    <Input 
                      type="number"
                      value={fixedPrice}
                      onChange={(e) => setFixedPrice(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      className="bg-background/50"
                    />
                  </div>
                )}
              </div>

              {/* Your Price Preview */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Price on Panel (per 1000)</p>
                      <p className="text-3xl font-bold text-primary">${calculatedPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20 mb-1">
                        +${profit.toFixed(2)} profit
                      </Badge>
                      <p className="text-xs text-muted-foreground">{profitPercent}% margin</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Preview */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-muted/50">
                  <CardContent className="p-3 text-center">
                    <ShoppingCart className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-lg font-bold">{service.orders || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3 text-center">
                    <DollarSign className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-lg font-bold">${((service.orders || 0) * profit).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Est. Profit</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3 text-center">
                    <BarChart3 className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-lg font-bold">{profitPercent}%</p>
                    <p className="text-xs text-muted-foreground">Margin</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Custom Prices Tab */}
            <TabsContent value="custom-prices" className="m-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Custom Prices per Customer</h3>
                  <p className="text-sm text-muted-foreground">Set individual pricing for specific customers</p>
                </div>
                <Button size="sm" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </div>

              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No custom prices set</p>
                  <p className="text-sm text-muted-foreground">Click "Add Customer" to set individual pricing</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="m-0 space-y-4">
              <Card className="bg-muted/30">
                <CardContent className="p-6 text-center">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">SEO settings coming soon</p>
                  <p className="text-sm text-muted-foreground">Meta title, description, and keywords for your service page</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-primary to-primary/80">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
