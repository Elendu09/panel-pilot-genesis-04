import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Crown, 
  Star, 
  Trophy, 
  Sparkles, 
  Package, 
  Loader2,
  ExternalLink,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DirectProvider {
  id: string;
  name: string;
  subdomain: string | null;
  custom_domain: string | null;
  logo_url: string | null;
  service_count?: number;
  ad_type?: 'sponsored' | 'top' | 'best' | 'featured' | null;
  is_connected?: boolean;
}

interface DirectProviderCardProps {
  provider: DirectProvider;
  onEnable: (provider: DirectProvider) => Promise<void>;
  isEnabled?: boolean;
  isLoading?: boolean;
}

const adBadgeConfig = {
  sponsored: { 
    icon: Crown, 
    label: "Sponsored", 
    className: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0" 
  },
  top: { 
    icon: Trophy, 
    label: "Top Provider", 
    className: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0" 
  },
  best: { 
    icon: Star, 
    label: "Best Choice", 
    className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0" 
  },
  featured: { 
    icon: Sparkles, 
    label: "Featured", 
    className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0" 
  },
};

export function DirectProviderCard({ 
  provider, 
  onEnable, 
  isEnabled = false,
  isLoading = false 
}: DirectProviderCardProps) {
  const [enabling, setEnabling] = useState(false);

  const handleEnable = async () => {
    setEnabling(true);
    try {
      await onEnable(provider);
    } finally {
      setEnabling(false);
    }
  };

  const domain = provider.custom_domain || `${provider.subdomain}.homeofsmm.com`;
  const adConfig = provider.ad_type ? adBadgeConfig[provider.ad_type] : null;
  const AdIcon = adConfig?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "glass-card-hover overflow-hidden transition-all duration-300",
        provider.ad_type === 'sponsored' && "ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10",
        provider.ad_type === 'top' && "ring-1 ring-blue-500/30",
        (isEnabled || provider.is_connected) && "border-green-500/50"
      )}>
        {/* Ad Badge */}
        {adConfig && AdIcon && (
          <div className="absolute top-0 right-0 z-10">
            <Badge className={cn("rounded-none rounded-bl-lg", adConfig.className)}>
              <AdIcon className="w-3 h-3 mr-1" />
              {adConfig.label}
            </Badge>
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-12 h-12 border-2 border-border">
              <AvatarImage src={provider.logo_url || undefined} alt={provider.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {provider.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{provider.name}</h3>
              <a 
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
              >
                {domain}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>{provider.service_count || 0} services</span>
            </div>
            {/* Could add rating here later */}
          </div>

          {/* Action Button */}
          <div className="mt-4">
            {isEnabled || provider.is_connected ? (
              <Button 
                variant="outline" 
                className="w-full gap-2 border-green-500/50 text-green-600"
                disabled
              >
                <Check className="w-4 h-4" />
                Connected
              </Button>
            ) : (
              <Button 
                onClick={handleEnable}
                disabled={enabling || isLoading}
                className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
              >
                {enabling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enabling...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Enable Provider
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
