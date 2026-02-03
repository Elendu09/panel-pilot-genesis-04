import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { 
  Crown, 
  Star, 
  Trophy, 
  Sparkles, 
  Loader2,
  ExternalLink,
  Check,
  Globe,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProviderListItemProps {
  id: string;
  name: string;
  domain: string;
  logoUrl?: string | null;
  serviceCount?: number;
  rating?: number;
  adType?: 'sponsored' | 'top' | 'best' | 'featured' | null;
  isConnected?: boolean;
  isExternal?: boolean;
  category?: string;
  onAction: () => void;
  onManualConnect?: () => void;
  isLoading?: boolean;
  actionLabel?: string;
  rank?: number;
  showRank?: boolean;
  showSwitch?: boolean;
  isEnabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  serviceTags?: string[];
}

const adBadgeConfig = {
  sponsored: { 
    icon: Crown, 
    label: "Ads", 
    className: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0" 
  },
  top: { 
    icon: Trophy, 
    label: "Top", 
    className: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0" 
  },
  best: { 
    icon: Star, 
    label: "Best", 
    className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0" 
  },
  featured: { 
    icon: Sparkles, 
    label: "Featured", 
    className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0" 
  },
};

export function ProviderListItem({ 
  id,
  name, 
  domain,
  logoUrl,
  serviceCount = 0,
  rating,
  adType,
  isConnected = false,
  isExternal = false,
  category,
  onAction,
  onManualConnect,
  isLoading = false,
  actionLabel = "Enable",
  rank,
  showRank = false,
  showSwitch = false,
  isEnabled = false,
  onToggle,
  serviceTags = []
}: ProviderListItemProps) {
  const adConfig = adType ? adBadgeConfig[adType] : null;
  const AdIcon = adConfig?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: 'hsl(var(--primary) / 0.03)' }}
      className={cn(
        "flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200",
        "bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-md",
        adType === 'sponsored' && "border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent",
        adType === 'top' && "border-blue-500/20",
        isConnected && "border-green-500/30 bg-green-500/5"
      )}
    >
      {/* Main Row */}
      <div className="flex items-center gap-3">
        {/* Rank with Crown */}
        {showRank && rank && (
          <div className="flex items-center gap-1 min-w-[40px]">
            <span className="text-xl font-bold">{rank}</span>
            {rank <= 3 && <Crown className="w-4 h-4 text-amber-500" />}
          </div>
        )}

        {/* Avatar */}
        <Avatar className="w-10 h-10 border-2 border-border shrink-0">
          <AvatarImage src={logoUrl || undefined} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
            {name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold truncate text-sm">{name}</h4>
            {adConfig && AdIcon && (
              <Badge className={cn("text-[10px] px-1.5 py-0", adConfig.className)}>
                <AdIcon className="w-3 h-3 mr-0.5" />
                {adConfig.label}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              USD
            </Badge>
            {isConnected && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-green-600 border-green-500/50">
                <Check className="w-3 h-3 mr-0.5" />
                Connected
              </Badge>
            )}
          </div>
          <a 
            href={`https://${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {domain}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>

        {/* Rating */}
        {rating && (
          <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground px-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{rating}</span>
          </div>
        )}

        {/* Category */}
        {category && (
          <Badge variant="secondary" className="hidden sm:flex text-[10px] px-1.5 py-0">
            {category}
          </Badge>
        )}

        {/* Action Area */}
        <div className="shrink-0 flex items-center gap-2">
          {showSwitch && onToggle ? (
            <Switch checked={isEnabled} onCheckedChange={onToggle} />
          ) : isConnected ? (
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1.5 border-green-500/50 text-green-600 cursor-default"
              disabled
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Connected</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              {onManualConnect && !isExternal && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onManualConnect();
                  }}
                  className="gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Manual</span>
                </Button>
              )}
              <Button 
                size="sm"
                onClick={onAction}
                disabled={isLoading}
                className="gap-1.5 bg-gradient-to-r from-primary to-primary/80"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="hidden sm:inline">Enabling...</span>
                  </>
                ) : (
                  <>
                    {isExternal ? <Globe className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{actionLabel}</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Service Tags Row (optional) */}
      {serviceTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-[52px]">
          {serviceTags.slice(0, 3).map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5 gap-1">
              <Sparkles className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
          {serviceTags.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              +{serviceTags.length - 3} more
            </Badge>
          )}
        </div>
      )}
    </motion.div>
  );
}
