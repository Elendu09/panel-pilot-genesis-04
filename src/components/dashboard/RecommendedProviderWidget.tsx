import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, ExternalLink, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { trackAdImpression, trackAdClick } from '@/lib/ad-tracking';

interface RecommendedProvider {
  panel_id: string;
  panel_name: string;
  logo_url: string | null;
  subdomain: string | null;
  custom_domain: string | null;
  ad_type: string;
  service_count: number;
}

interface RecommendedProviderWidgetProps {
  currentPanelId: string;
}

export function RecommendedProviderWidget({ currentPanelId }: RecommendedProviderWidgetProps) {
  const [provider, setProvider] = useState<RecommendedProvider | null>(null);
  const impressionTracked = useRef(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: ads } = await supabase
        .from('provider_ads')
        .select('panel_id, ad_type, total_spent')
        .eq('is_active', true)
        .in('ad_type', ['sponsored', 'featured'])
        .gt('expires_at', new Date().toISOString())
        .neq('panel_id', currentPanelId)
        .order('total_spent', { ascending: false })
        .limit(1);

      if (!ads || ads.length === 0) return;

      const ad = ads[0];
      const { data: panel } = await supabase
        .from('panels')
        .select('id, name, subdomain, custom_domain, logo_url')
        .eq('id', ad.panel_id)
        .eq('status', 'active')
        .single();

      if (!panel) return;

      const { count } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panel.id)
        .eq('is_active', true);

      setProvider({
        panel_id: panel.id,
        panel_name: panel.name,
        logo_url: panel.logo_url,
        subdomain: panel.subdomain,
        custom_domain: panel.custom_domain,
        ad_type: ad.ad_type,
        service_count: count || 0,
      });
    };

    if (currentPanelId) fetch();
  }, [currentPanelId]);

  // Track impression once provider loads
  useEffect(() => {
    if (provider && !impressionTracked.current) {
      trackAdImpression(provider.panel_id, provider.ad_type);
      impressionTracked.current = true;
    }
  }, [provider]);

  if (!provider) return null;

  const url = provider.custom_domain
    ? `https://${provider.custom_domain}`
    : `https://${provider.subdomain}.smmpilot.online`;

  const isSponsored = provider.ad_type === 'sponsored';

  const handleClick = () => {
    trackAdClick(provider.panel_id, provider.ad_type);
    window.open(url, '_blank');
  };

  return (
    <Card className={cn(
      "glass-card overflow-hidden",
      isSponsored 
        ? "border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent" 
        : "border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {isSponsored ? (
            <Crown className="w-4 h-4 text-amber-500" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-500" />
          )}
          {isSponsored ? 'Recommended Provider' : 'Featured Provider'}
          <Badge className={cn(
            "text-[9px] ml-auto",
            isSponsored 
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
              : "bg-purple-500/10 text-purple-500 border-purple-500/20"
          )}>
            {isSponsored ? 'Sponsored' : 'Featured'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Avatar className={cn(
            "w-11 h-11 border",
            isSponsored ? "border-amber-500/30" : "border-purple-500/30"
          )}>
            <AvatarImage src={provider.logo_url || undefined} />
            <AvatarFallback className={cn(
              "font-bold",
              isSponsored ? "bg-amber-500/10 text-amber-500" : "bg-purple-500/10 text-purple-500"
            )}>
              {provider.panel_name?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{provider.panel_name}</p>
            <p className="text-xs text-muted-foreground">
              {provider.service_count} services available
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "shrink-0 text-xs gap-1",
              isSponsored
                ? "border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                : "border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
            )}
            onClick={handleClick}
          >
            Visit
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
