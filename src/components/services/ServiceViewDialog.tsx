import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Edit, 
  Copy, 
  Power, 
  ExternalLink, 
  DollarSign, 
  Package, 
  Clock, 
  TrendingUp,
  Image as ImageIcon,
  Server,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { supabase } from "@/integrations/supabase/client";

interface ServiceViewDialogProps {
  service: {
    id: string;
    name: string;
    category: string;
    description?: string;
    price: number;
    originalPrice?: number;
    minQty: number;
    maxQty: number;
    status: boolean;
    imageUrl?: string;
    provider?: string;
    providerId?: string;
    orders?: number;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onDuplicate?: () => void;
}

const ServiceIcon = ({ imageUrl, category, size = "lg" }: { imageUrl?: string; category?: string; size?: "sm" | "lg" }) => {
  const sizeClasses = size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const iconSize = size === "lg" ? 32 : 20;

  if (imageUrl?.startsWith('icon:')) {
    const iconKey = imageUrl.replace('icon:', '');
    const iconData = SOCIAL_ICONS_MAP[iconKey];
    if (iconData) {
      const IconComponent = iconData.icon;
      return (
        <div className={cn(sizeClasses, "rounded-xl flex items-center justify-center", iconData.bgColor)}>
          <IconComponent className="text-white" size={iconSize} />
        </div>
      );
    }
  }

  if (imageUrl && !imageUrl.startsWith('icon:')) {
    return (
      <img 
        src={imageUrl} 
        alt="Service" 
        className={cn(sizeClasses, "rounded-xl object-cover")}
      />
    );
  }

  // Fallback
  return (
    <div className={cn(sizeClasses, "rounded-xl bg-muted flex items-center justify-center")}>
      <ImageIcon className="text-muted-foreground" size={iconSize} />
    </div>
  );
};

export const ServiceViewDialog = ({
  service,
  open,
  onOpenChange,
  onEdit,
  onToggleStatus,
  onDuplicate
}: ServiceViewDialogProps) => {
  const [providerInfo, setProviderInfo] = useState<{ name: string; balance?: number } | null>(null);
  const [loadingProvider, setLoadingProvider] = useState(false);

  // Fetch provider info when dialog opens
  useEffect(() => {
    if (open && service?.providerId) {
      fetchProviderInfo(service.providerId);
    } else {
      setProviderInfo(null);
    }
  }, [open, service?.providerId]);

  const fetchProviderInfo = async (providerId: string) => {
    if (!providerId || providerId === 'Direct') {
      setProviderInfo(null);
      return;
    }
    
    setLoadingProvider(true);
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('name, balance, is_active')
        .eq('id', providerId)
        .maybeSingle();

      if (data) {
        setProviderInfo({ name: data.name, balance: data.balance });
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setLoadingProvider(false);
    }
  };

  if (!service) return null;

  const profitMargin = service.originalPrice 
    ? ((service.price - service.originalPrice) / service.originalPrice * 100).toFixed(0)
    : null;

  // Only show as Direct if there truly is no provider ID
  const displayProvider = providerInfo?.name || (service.providerId && service.providerId !== 'Direct' ? 'Loading...' : (service.provider && service.provider !== 'Unknown' ? service.provider : 'Direct'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <ServiceIcon 
              imageUrl={service.imageUrl} 
              category={service.category} 
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold leading-tight mb-2">
                {service.name}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="capitalize">
                  {service.category}
                </Badge>
                <Badge variant={service.status ? "default" : "secondary"}>
                  {service.status ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Description */}
        {service.description && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
            <p className="text-sm">{service.description}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">${service.price.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">Price per 1K</p>
              </div>
            </CardContent>
          </Card>
          
          {profitMargin && (
            <Card className="bg-muted/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-lg font-bold text-success">+{profitMargin}%</p>
                  <p className="text-xs text-muted-foreground">Profit Margin</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Package className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-lg font-bold">{service.minQty.toLocaleString()} - {service.maxQty.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Quantity Range</p>
              </div>
            </CardContent>
          </Card>
          
          {service.orders !== undefined && (
            <Card className="bg-muted/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-lg font-bold">{service.orders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Provider Info */}
        <div className="mb-4 p-3 rounded-lg bg-muted/30 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Provider</span>
            </div>
            <div className="flex items-center gap-2">
              {loadingProvider ? (
                <span className="text-sm text-muted-foreground">Loading...</span>
              ) : (
                <>
                  <Badge variant={displayProvider === 'Direct' ? 'secondary' : 'default'} className="text-xs">
                    {displayProvider}
                  </Badge>
                  {providerInfo?.balance !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      Balance: ${providerInfo.balance.toFixed(2)}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
          {!service.providerId && displayProvider === 'Direct' && (
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3 h-3" />
              <span>No provider linked - manual fulfillment required</span>
            </div>
          )}
          {service.providerId && !providerInfo && !loadingProvider && (
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3 h-3" />
              <span>Provider not found - may have been deleted or deactivated</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={onEdit} className="flex-1 gap-2">
            <Edit className="w-4 h-4" />
            Edit Service
          </Button>
          <Button variant="outline" onClick={onDuplicate} className="gap-2">
            <Copy className="w-4 h-4" />
          </Button>
          <Button 
            variant={service.status ? "outline" : "default"}
            onClick={onToggleStatus}
            className="gap-2"
          >
            <Power className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceViewDialog;
