import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, ExternalLink, Sparkles, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { trackAdImpression, trackAdClick } from '@/lib/ad-tracking';

interface SponsoredProvider {
  panel_id: string;
  panel_name: string;
  logo_url: string | null;
  subdomain: string | null;
  custom_domain: string | null;
  ad_type: string;
  service_count: number;
}

interface SponsoredProviderBannerProps {
  currentPanelId?: string;
  className?: string;
}

export function SponsoredProviderBanner({ currentPanelId, className }: SponsoredProviderBannerProps) {
  const [providers, setProviders] = useState<SponsoredProvider[]>([]);
  const impressionTracked = useRef(false);

  useEffect(() => {
    const fetchSponsored = async () => {
      const { data: ads } = await supabase
        .from('provider_ads')
        .select('panel_id, ad_type, total_spent')
        .eq('is_active', true)
        .in('ad_type', ['sponsored', 'featured'])
        .gt('expires_at', new Date().toISOString())
        .order('total_spent', { ascending: false })
        .limit(3);

      if (!ads || ads.length === 0) return;

      const panelIds = ads.map(a => a.panel_id).filter((id): id is string => !!id);
      if (panelIds.length === 0) return;

      const { data: panels } = await supabase
        .from('panels')
        .select('id, name, subdomain, custom_domain, logo_url')
        .in('id', panelIds)
        .eq('status', 'active');

      if (!panels || panels.length === 0) return;

      const { data: services } = await supabase
        .from('services')
        .select('panel_id')
        .in('panel_id', panelIds)
        .eq('is_active', true);

      const serviceCounts: Record<string, number> = {};
      (services || []).forEach(s => {
        serviceCounts[s.panel_id] = (serviceCounts[s.panel_id] || 0) + 1;
      });

      const adTypeMap = new Map(ads.map(a => [a.panel_id, a.ad_type]));

      const result: SponsoredProvider[] = panels
        .filter(p => !currentPanelId || p.id !== currentPanelId)
        .map(p => ({
          panel_id: p.id,
          panel_name: p.name,
          logo_url: p.logo_url,
          subdomain: p.subdomain,
          custom_domain: p.custom_domain,
          ad_type: adTypeMap.get(p.id) || 'sponsored',
          service_count: serviceCounts[p.id] || 0,
        }));

      setProviders(result);
    };

    fetchSponsored();
  }, [currentPanelId]);

  useEffect(() => {
    if (providers.length > 0 && !impressionTracked.current) {
      providers.forEach(p => trackAdImpression(p.panel_id, p.ad_type));
      impressionTracked.current = true;
    }
  }, [providers]);

  if (providers.length === 0) return null;

  const handleClick = (provider: SponsoredProvider) => {
    trackAdClick(provider.panel_id, provider.ad_type);
    if (!provider.custom_domain && !provider.subdomain) return;
    const url = provider.custom_domain
      ? `https://${provider.custom_domain}`
      : `https://${provider.subdomain}.smmpilot.online`;
    window.open(url, '_blank');
  };

  return (
    <Card className={cn("border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5", className)} data-testid="banner-sponsored-providers">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold">Featured Providers</span>
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] ml-auto">
            Ad
          </Badge>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {providers.map((provider) => (
            <button
              key={provider.panel_id}
              onClick={() => handleClick(provider)}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-card border border-border/50 hover-elevate transition-all shrink-0 min-w-[200px] text-left"
              data-testid={`button-sponsored-provider-${provider.panel_id}`}
            >
              <Avatar className="w-9 h-9 border border-amber-500/20 shrink-0">
                <AvatarImage src={provider.logo_url || undefined} />
                <AvatarFallback className="bg-amber-500/10 text-amber-500 font-bold text-sm">
                  {provider.panel_name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{provider.panel_name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {provider.service_count} services
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function InterstitialAdCard({ currentPanelId, className }: SponsoredProviderBannerProps) {
  const [provider, setProvider] = useState<SponsoredProvider | null>(null);
  const impressionTracked = useRef(false);

  useEffect(() => {
    const fetchAd = async () => {
      const { data: ads } = await supabase
        .from('provider_ads')
        .select('panel_id, ad_type, total_spent')
        .eq('is_active', true)
        .in('ad_type', ['sponsored', 'top', 'best'])
        .gt('expires_at', new Date().toISOString())
        .order('total_spent', { ascending: false })
        .limit(1);

      if (!ads || ads.length === 0) return;

      const ad = ads[0];
      if (!ad.panel_id) return;

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

    fetchAd();
  }, [currentPanelId]);

  useEffect(() => {
    if (provider && !impressionTracked.current) {
      trackAdImpression(provider.panel_id, provider.ad_type);
      impressionTracked.current = true;
    }
  }, [provider]);

  if (!provider) return null;

  const handleClick = () => {
    trackAdClick(provider.panel_id, provider.ad_type);
    if (!provider.custom_domain && !provider.subdomain) return;
    const url = provider.custom_domain
      ? `https://${provider.custom_domain}`
      : `https://${provider.subdomain}.smmpilot.online`;
    window.open(url, '_blank');
  };

  return (
    <Card
      className={cn(
        "border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-transparent to-purple-500/5 cursor-pointer hover-elevate",
        className
      )}
      onClick={handleClick}
      data-testid="card-interstitial-ad"
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
          <Sparkles className="w-5 h-5 text-purple-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm font-semibold truncate">{provider.panel_name}</span>
            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[9px]">
              Promoted
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {provider.service_count} services available
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 text-xs gap-1 border-purple-500/30 text-purple-600"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          data-testid="button-visit-promoted"
        >
          Visit
          <ExternalLink className="w-3 h-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
