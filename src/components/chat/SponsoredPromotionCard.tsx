import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ExternalLink, Crown, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SponsoredPromotion {
  panel_id: string;
  panel_name: string;
  logo_url: string | null;
  subdomain: string | null;
  custom_domain: string | null;
  service_count?: number;
}

interface SponsoredPromotionCardProps {
  promotion: SponsoredPromotion;
  className?: string;
  onImpression?: (panelId: string) => void;
  onClickAd?: (panelId: string) => void;
  onChat?: (promotion: SponsoredPromotion) => void;
}

export function SponsoredPromotionCard({ promotion, className, onImpression, onClickAd, onChat }: SponsoredPromotionCardProps) {
  const impressionTracked = useRef(false);

  useEffect(() => {
    if (!impressionTracked.current && onImpression) {
      onImpression(promotion.panel_id);
      impressionTracked.current = true;
    }
  }, [promotion.panel_id, onImpression]);

  const panelUrl = promotion.custom_domain 
    ? `https://${promotion.custom_domain}` 
    : `https://${promotion.subdomain}.smmpilot.online`;

  const handleVisit = () => {
    onClickAd?.(promotion.panel_id);
    window.open(panelUrl, '_blank');
  };

  return (
    <div className={cn(
      "p-3 border-b border-border/50 bg-gradient-to-r from-amber-500/5 to-amber-500/10 hover:from-amber-500/10 hover:to-amber-500/15 transition-colors",
      className
    )}>
      <div className="flex items-center gap-3">
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-medium gap-1">
          <Crown className="w-2.5 h-2.5" />
          Featured Ad
        </Badge>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <Avatar className="w-10 h-10 border border-amber-500/20">
          <AvatarImage src={promotion.logo_url || undefined} />
          <AvatarFallback className="bg-amber-500/10 text-amber-500 font-bold">
            {promotion.panel_name?.charAt(0) || 'P'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{promotion.panel_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {promotion.service_count ? `${promotion.service_count} services available` : 'SMM Provider'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onChat && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-purple-500/30 text-purple-600 hover:bg-purple-500/10 gap-1"
              onClick={() => onChat(promotion)}
            >
              <MessageCircle className="w-3 h-3" />
              Chat
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10 gap-1"
            onClick={handleVisit}
          >
            Visit
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
