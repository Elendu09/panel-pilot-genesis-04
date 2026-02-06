import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ExternalLink, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SponsoredPromotion {
  panel_id: string;
  panel_name: string;
  logo_url: string | null;
  subdomain: string | null;
  custom_domain: string | null;
}

interface SponsoredPromotionCardProps {
  promotion: SponsoredPromotion;
  className?: string;
}

export function SponsoredPromotionCard({ promotion, className }: SponsoredPromotionCardProps) {
  const panelUrl = promotion.custom_domain 
    ? `https://${promotion.custom_domain}` 
    : `https://${promotion.subdomain}.smmpilot.online`;

  return (
    <div className={cn(
      "p-3 border-b border-border/50 bg-gradient-to-r from-amber-500/5 to-amber-500/10 hover:from-amber-500/10 hover:to-amber-500/15 transition-colors",
      className
    )}>
      <div className="flex items-center gap-3">
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-medium gap-1">
          <Crown className="w-2.5 h-2.5" />
          Sponsored
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
          <p className="text-sm font-medium truncate">{promotion.panel_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            Check out their services
          </p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="shrink-0 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10 gap-1"
          onClick={() => window.open(panelUrl, '_blank')}
        >
          Visit
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
