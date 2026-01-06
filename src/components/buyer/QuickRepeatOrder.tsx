import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Repeat, Package, Link as LinkIcon, Hash, Zap, Info } from "lucide-react";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { cn } from "@/lib/utils";
import { SpeedGauge } from "@/components/buyer/SpeedGauge";

interface QuickRepeatOrderProps {
  services: any[];
  getEffectivePrice: (service: any) => number;
  formatPrice: (amount: number) => string;
  onAddToCart: (items: { service: any; quantity: number; targetUrl: string; effectivePrice: number }[]) => Promise<void>;
  disabled?: boolean;
}

export const QuickRepeatOrder = ({
  services,
  getEffectivePrice,
  formatPrice,
  onAddToCart,
  disabled = false,
}: QuickRepeatOrderProps) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1000);
  const [urlsText, setUrlsText] = useState<string>("");
  const [adding, setAdding] = useState(false);

  // Group services by category
  const groupedServices = useMemo(() => {
    const groups: Record<string, any[]> = {};
    services.forEach((s) => {
      const cat = s.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, [services]);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const effectivePrice = selectedService ? getEffectivePrice(selectedService) : 0;

  // Parse URLs from textarea
  const urls = useMemo(() => {
    return urlsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && (line.startsWith("http://") || line.startsWith("https://")));
  }, [urlsText]);

  const totalAmount = (effectivePrice * quantity * urls.length) / 1000;

  const handleAddAll = async () => {
    if (!selectedService || urls.length === 0) return;

    setAdding(true);
    try {
      const items = urls.map((url) => ({
        service: selectedService,
        quantity,
        targetUrl: url,
        effectivePrice,
      }));

      await onAddToCart(items);

      // Reset form
      setUrlsText("");
    } finally {
      setAdding(false);
    }
  };

  const categoryData = selectedService
    ? SOCIAL_ICONS_MAP[selectedService.category] || SOCIAL_ICONS_MAP.other
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Repeat className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm">Quick Repeat Order</span>
        <Badge variant="secondary" className="text-xs">Same service, multiple URLs</Badge>
      </div>

      {/* Service Select */}
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1">
          <Package className="w-3 h-3" />
          Service
        </Label>
        <Select
          value={selectedServiceId}
          onValueChange={(val) => {
            setSelectedServiceId(val);
            const svc = services.find((s) => s.id === val);
            if (svc) setQuantity(svc.min_quantity || 1000);
          }}
          disabled={disabled || adding}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select a service..." />
          </SelectTrigger>
          <SelectContent className="max-h-[250px]">
            {Object.entries(groupedServices).map(([cat, svcs]) => {
              const catData = SOCIAL_ICONS_MAP[cat] || SOCIAL_ICONS_MAP.other;
              const CatIcon = catData.icon;
              return (
                <div key={cat}>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <div className={cn("p-1 rounded", catData.bgColor)}>
                      <CatIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                    {catData.label || cat}
                  </div>
                  {svcs.map((svc) => (
                    <SelectItem key={svc.id} value={svc.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="truncate max-w-[200px]">{svc.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatPrice(getEffectivePrice(svc))}/1k
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Service Info */}
      {selectedService && categoryData && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
          <div className={cn("p-2 rounded-lg shrink-0", categoryData.bgColor)}>
            <categoryData.icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{selectedService.name}</p>
            <p className="text-xs text-muted-foreground">
              Min: {(selectedService.min_quantity || 100).toLocaleString()} | 
              Max: {(selectedService.max_quantity || 10000).toLocaleString()}
            </p>
          </div>
          <SpeedGauge 
            estimatedTime={selectedService.average_time || selectedService.averageTime} 
            compact 
            size="sm"
            className="shrink-0"
          />
          <div className="text-right shrink-0">
            <p className="font-bold text-sm">{formatPrice(effectivePrice)}</p>
            <p className="text-xs text-muted-foreground">per 1K</p>
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1">
          <Hash className="w-3 h-3" />
          Quantity per URL
        </Label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Math.max(
                selectedService?.min_quantity || 1,
                parseInt(e.target.value) || 0
              )
            )
          }
          min={selectedService?.min_quantity || 1}
          max={selectedService?.max_quantity || 1000000}
          className="h-10"
          disabled={disabled || adding || !selectedServiceId}
        />
      </div>

      {/* URLs Textarea */}
      <div className="space-y-1.5">
        <Label className="text-xs flex items-center gap-1">
          <LinkIcon className="w-3 h-3" />
          Target URLs (one per line)
        </Label>
        <Textarea
          placeholder={`https://instagram.com/post1\nhttps://instagram.com/post2\nhttps://instagram.com/post3`}
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          className="min-h-[120px] text-sm font-mono"
          disabled={disabled || adding || !selectedServiceId}
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>
            {urls.length} valid URL{urls.length !== 1 ? "s" : ""} detected
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Orders to create</span>
          <span className="font-medium">{urls.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Quantity each</span>
          <span className="font-medium">{quantity.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Price per order</span>
          <span className="font-medium">
            {formatPrice((effectivePrice * quantity) / 1000)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-primary/20">
          <span className="font-medium">Total</span>
          <span className="text-lg font-bold">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Add Button */}
      <Button
        onClick={handleAddAll}
        disabled={disabled || adding || !selectedServiceId || urls.length === 0}
        className="w-full gap-2"
      >
        <Zap className="w-4 h-4" />
        Add {urls.length} Orders to Cart
      </Button>
    </div>
  );
};
