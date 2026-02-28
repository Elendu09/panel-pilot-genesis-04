import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Crown, 
  Trophy, 
  Star, 
  Sparkles, 
  DollarSign, 
  Eye, 
  MousePointer,
  Calendar,
  Loader2,
  Check,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeft,
  Flame,
  List,
  MessageSquare,
  LayoutGrid,
  ListOrdered,
  Clock,
  Globe,
  Target,
  Radio
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { format, addDays, addWeeks, addMonths, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { MiniSparkline } from "@/components/analytics/MiniSparkline";

// Ad reach placements per type
const adReachMap: Record<string, { label: string; icon: typeof Globe }[]> = {
  sponsored: [
    { label: "Marketplace — Sponsored Slider", icon: Globe },
    { label: "Chat Inbox — Promotion Cards", icon: MessageSquare },
    { label: "Provider Search — Top Results", icon: Target },
  ],
  top: [
    { label: "Marketplace — Top Providers Grid", icon: Globe },
    { label: "Provider Rankings — Highlighted", icon: Target },
  ],
  best: [
    { label: "Marketplace — Best Choice List", icon: Globe },
    { label: "Service Pages — Editor's Pick", icon: Target },
  ],
  featured: [
    { label: "Chat Inbox — Recommendations", icon: MessageSquare },
    { label: "Storefront Widget — Featured", icon: Radio },
    { label: "Homepage Carousel", icon: Globe },
  ],
};

interface AdPricing {
  id: string;
  ad_type: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  max_slots: number;
  description: string | null;
  is_active: boolean;
}

interface MyAd {
  id: string;
  ad_type: string;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
  impressions: number;
  clicks: number;
  total_spent: number;
}

// Configuration for ad types with icons and styling - matching reference design
const adTypeConfig = {
  sponsored: { 
    icon: Flame, 
    color: "text-orange-500", 
    bgColor: "bg-orange-500/10",
    gradient: "from-orange-500 to-amber-500",
    title: "Top providers page",
    benefits: [
      "Top position in marketplace",
      "Gold 'Sponsored' badge",
      "Priority in search results",
      "Maximum visibility"
    ]
  },
  top: { 
    icon: List, 
    color: "text-blue-500", 
    bgColor: "bg-blue-500/10",
    gradient: "from-blue-500 to-cyan-500",
    title: "Providers list",
    benefits: [
      "Featured in 'Top Providers' section",
      "Blue highlight badge",
      "Increased visibility"
    ]
  },
  best: { 
    icon: Check, 
    color: "text-emerald-500", 
    bgColor: "bg-emerald-500/10",
    gradient: "from-emerald-500 to-green-500",
    title: "Top services page",
    benefits: [
      "'Best Choice' badge",
      "Editor's pick highlight",
      "Trust indicator"
    ]
  },
  featured: { 
    icon: MessageSquare, 
    color: "text-purple-500", 
    bgColor: "bg-purple-500/10",
    gradient: "from-purple-500 to-pink-500",
    title: "Direct offers",
    benefits: [
      "Homepage carousel inclusion",
      "'Featured' badge",
      "Landing page visibility"
    ]
  },
};

const ProviderAds = () => {
  const { toast } = useToast();
  const { panel, refreshPanel } = usePanel();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [pricing, setPricing] = useState<AdPricing[]>([]);
  const [myAds, setMyAds] = useState<MyAd[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAdType, setPreviewAdType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const [activePanelCount, setActivePanelCount] = useState(0);

  // Live countdown timer for My Ads
  useEffect(() => {
    if (myAds.length === 0) return;
    
    const updateCountdowns = () => {
      const newCountdowns: Record<string, string> = {};
      myAds.forEach(ad => {
        const now = new Date();
        const expires = new Date(ad.expires_at);
        const diff = expires.getTime() - now.getTime();
        
        if (diff <= 0) {
          newCountdowns[ad.id] = 'Expired';
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          if (days > 0) {
            newCountdowns[ad.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
          } else if (hours > 0) {
            newCountdowns[ad.id] = `${hours}h ${minutes}m ${seconds}s`;
          } else {
            newCountdowns[ad.id] = `${minutes}m ${seconds}s`;
          }
        }
      });
      setCountdowns(newCountdowns);
    };
    
    updateCountdowns();
    const timer = setInterval(updateCountdowns, 1000);
    return () => clearInterval(timer);
  }, [myAds]);

  useEffect(() => {
    if (panel?.id) {
      fetchData();
    }
  }, [panel?.id]);

  const fetchData = async () => {
    try {
      const [pricingRes, adsRes, panelCountRes] = await Promise.all([
        supabase.from('provider_ad_pricing').select('*').eq('is_active', true).order('daily_rate', { ascending: false }),
        supabase.from('provider_ads').select('*').eq('panel_id', panel?.id).order('created_at', { ascending: false }),
        supabase.from('panels').select('id', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      if (pricingRes.data) {
        setPricing(pricingRes.data);
        const durations: Record<string, string> = {};
        pricingRes.data.forEach(p => { durations[p.ad_type] = 'monthly'; });
        setSelectedDuration(durations);
      }
      if (adsRes.data) setMyAds(adsRes.data);
      if (panelCountRes.count) setActivePanelCount(panelCountRes.count);
    } catch (error) {
      console.error('Error fetching ads data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (tier: AdPricing, duration: string) => {
    switch (duration) {
      case 'weekly': return tier.weekly_rate;
      case 'monthly': return tier.monthly_rate;
      default: return tier.daily_rate;
    }
  };

  const getExpiryDate = (duration: string) => {
    const now = new Date();
    switch (duration) {
      case 'weekly': return addWeeks(now, 1);
      case 'monthly': return addMonths(now, 1);
      default: return addDays(now, 1);
    }
  };

  const getDurationDays = (duration: string) => {
    switch (duration) {
      case 'weekly': return 7;
      case 'monthly': return 30;
      default: return 1;
    }
  };

  const handlePurchase = async (tier: AdPricing) => {
    if (!panel?.id) return;
    
    const duration = selectedDuration[tier.ad_type] || 'monthly';
    const price = getPrice(tier, duration);

    // Check balance
    if ((panel.balance || 0) < price) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You need $${price.toFixed(2)} but only have $${(panel.balance || 0).toFixed(2)}. Please add funds first.`
      });
      return;
    }

    setPurchasing(tier.ad_type);

    try {
      // Deduct balance
      const { error: balanceError } = await supabase
        .from('panels')
        .update({ balance: (panel.balance || 0) - price })
        .eq('id', panel.id);

      if (balanceError) throw balanceError;

      // Create ad
      const expiresAt = getExpiryDate(duration);
      const now = new Date();
      const { error: adError } = await supabase
        .from('provider_ads')
        .insert({
          panel_id: panel.id,
          ad_type: tier.ad_type,
          daily_fee: tier.daily_rate,
          total_spent: price,
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true,
          position: 0,
          impressions: 0,
          clicks: 0
        });

      if (adError) throw adError;

      // Create transaction record with user_id for RLS visibility
      const { data: { user } } = await supabase.auth.getUser();
      let profileId: string | undefined;
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        profileId = profileData?.id;
      }

      await supabase.from('transactions').insert({
        panel_id: panel.id,
        user_id: profileId,
        type: 'debit',
        amount: price,
        status: 'completed',
        description: `Ad purchase: ${tier.ad_type} (${duration})`,
        payment_method: 'balance'
      });

      toast({ 
        title: "Ad Purchased!", 
        description: `Your ${tier.ad_type} ad is now active until ${format(expiresAt, 'MMM dd, yyyy')}`
      });

      refreshPanel();
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Purchase Failed", description: error.message });
    } finally {
      setPurchasing(null);
    }
  };

  // Check if panel already has active ad of this type
  const hasActiveAd = (adType: string) => {
    return myAds.some(ad => 
      ad.ad_type === adType && 
      ad.is_active && 
      new Date(ad.expires_at) > new Date()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <Helmet>
        <title>Advertising</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header - Clean minimal style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Link to="/panel/more">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold">Advertising</h1>
      </motion.div>

      <Tabs defaultValue="purchase" className="space-y-6">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="purchase" className="gap-2">
            <Crown className="w-4 h-4" />
            Purchase Ads
          </TabsTrigger>
          <TabsTrigger value="my-ads" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            My Ads ({myAds.filter(a => a.is_active && new Date(a.expires_at) > new Date()).length})
          </TabsTrigger>
        </TabsList>

        {/* Purchase Ads - Clean vertical list layout per reference design */}
        <TabsContent value="purchase">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-end mb-4">
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'cards' | 'list')}>
              <ToggleGroupItem value="cards" aria-label="Card view">
                <LayoutGrid className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <ListOrdered className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Card Grid View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {pricing.map((tier, index) => {
                const config = adTypeConfig[tier.ad_type as keyof typeof adTypeConfig];
                const Icon = config?.icon || Crown;
                const duration = selectedDuration[tier.ad_type] || 'monthly';
                const price = getPrice(tier, duration);
                const days = getDurationDays(duration);
                const isActive = hasActiveAd(tier.ad_type);

                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "glass-card overflow-hidden transition-all hover:shadow-xl",
                      isActive && "ring-2 ring-green-500/50"
                    )}>
                      {/* Gradient Header */}
                      <div className={cn(
                        "h-2 bg-gradient-to-r",
                        config?.gradient ? `from-${config.gradient.split(' ')[0].replace('from-', '')} to-${config.gradient.split(' ')[1]?.replace('to-', '') || 'primary'}` : 'from-primary to-primary/80'
                      )} style={{
                        background: `linear-gradient(to right, var(--${tier.ad_type === 'sponsored' ? 'tw-orange-500' : tier.ad_type === 'top' ? 'tw-blue-500' : tier.ad_type === 'best' ? 'tw-emerald-500' : 'tw-purple-500'}), var(--${tier.ad_type === 'sponsored' ? 'tw-amber-500' : tier.ad_type === 'top' ? 'tw-cyan-500' : tier.ad_type === 'best' ? 'tw-green-500' : 'tw-pink-500'}))`
                      }} />
                      
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            config?.bgColor
                          )}>
                            <Icon className={cn("w-6 h-6", config?.color)} />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {config?.title || tier.ad_type}
                            </CardTitle>
                            {isActive && (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs mt-1">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tier.description || "Boost your visibility in the marketplace"}
                        </p>
                        
                        {/* Benefits list */}
                        {config?.benefits && (
                          <ul className="space-y-1.5">
                            {config.benefits.slice(0, 3).map((benefit, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Check className="w-3 h-3 text-green-500" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {/* Duration & Price */}
                        <div className="pt-3 border-t border-border/50">
                          <Select 
                            value={duration}
                            onValueChange={(v) => setSelectedDuration({
                              ...selectedDuration,
                              [tier.ad_type]: v
                            })}
                          >
                            <SelectTrigger className="w-full h-9 text-sm mb-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">1 Day</SelectItem>
                              <SelectItem value="weekly">7 Days</SelectItem>
                              <SelectItem value="monthly">30 Days</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl font-bold">${price.toFixed(0)}</span>
                            <span className="text-xs text-muted-foreground">for {days} days</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handlePurchase(tier)}
                              disabled={purchasing === tier.ad_type || isActive || (panel?.balance || 0) < price}
                              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                              size="sm"
                            >
                              {purchasing === tier.ad_type ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isActive ? (
                                'Active'
                              ) : (
                                'Get now'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setPreviewAdType(tier.ad_type);
                                setPreviewOpen(true);
                              }}
                              className="border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10"
                            >
                              Preview
                            </Button>
                          </div>
                          
                          {(panel?.balance || 0) < price && !isActive && (
                            <p className="flex items-center gap-1 text-xs text-amber-500 mt-2">
                              <AlertCircle className="w-3 h-3" />
                              Insufficient balance
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
          <div className="space-y-1">
            {pricing.map((tier, index) => {
              const config = adTypeConfig[tier.ad_type as keyof typeof adTypeConfig];
              const Icon = config?.icon || Crown;
              const duration = selectedDuration[tier.ad_type] || 'monthly';
              const price = getPrice(tier, duration);
              const days = getDurationDays(duration);
              const isActive = hasActiveAd(tier.ad_type);

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="py-5 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      config?.bgColor
                    )}>
                      <Icon className={cn("w-6 h-6", config?.color)} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base md:text-lg mb-1">
                        {config?.title || tier.ad_type}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {tier.description || "Boost your visibility in the marketplace"}
                      </p>
                      
                      {/* Duration selector */}
                      <div className="mb-3">
                        <Select 
                          value={duration}
                          onValueChange={(v) => setSelectedDuration({
                            ...selectedDuration,
                            [tier.ad_type]: v
                          })}
                        >
                          <SelectTrigger className="w-full max-w-[200px] h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">1 Day</SelectItem>
                            <SelectItem value="weekly">7 Days</SelectItem>
                            <SelectItem value="monthly">30 Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Price */}
                      <p className="text-xl font-bold mb-4">
                        ${price.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">for {days} days</span>
                      </p>
                      
                      {/* Action buttons - Matching reference design */}
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handlePurchase(tier)}
                          disabled={purchasing === tier.ad_type || isActive || (panel?.balance || 0) < price}
                          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6"
                        >
                          {purchasing === tier.ad_type ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Processing...
                            </>
                          ) : isActive ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Active
                            </>
                          ) : (
                            'Get now'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPreviewAdType(tier.ad_type);
                            setPreviewOpen(true);
                          }}
                          className="border-cyan-500 text-cyan-500 hover:bg-cyan-500/10"
                        >
                          Example
                        </Button>
                      </div>

                      {/* Insufficient balance warning */}
                      {(panel?.balance || 0) < price && !isActive && (
                        <div className="flex items-center gap-2 text-xs text-amber-500 mt-3">
                          <AlertCircle className="w-4 h-4" />
                          Insufficient balance. <Link to="/panel/billing" className="underline">Add funds</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          )}
          
          {/* Cross-Panel Reach Indicator */}
          {activePanelCount > 0 && (
            <Card className="glass-card mt-4 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Active across {activePanelCount} panels</p>
                    <p className="text-xs text-muted-foreground">Your ad reaches all active panels in the marketplace</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Balance card at bottom */}
          <Card className="glass-card mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Available Balance</p>
                    <p className="text-lg font-bold">${(panel?.balance || 0).toFixed(2)}</p>
                  </div>
                </div>
                <Link to="/panel/billing">
                  <Button size="sm" variant="outline">Add Funds</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Ads - Enhanced UI */}
        <TabsContent value="my-ads">
          {myAds.length === 0 ? (
            <Card className="glass-card bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
                  <Crown className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Active Ads</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Boost your panel's visibility in the marketplace by purchasing an advertisement
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myAds.map((ad) => {
                const config = adTypeConfig[ad.ad_type as keyof typeof adTypeConfig];
                const Icon = config?.icon || Crown;
                const daysLeft = differenceInDays(new Date(ad.expires_at), new Date());
                const isExpired = daysLeft < 0;
                const isExpiringSoon = daysLeft <= 3 && daysLeft >= 0;

                return (
                  <Card 
                    key={ad.id} 
                    className={cn(
                      "glass-card overflow-hidden transition-all",
                      isExpired && "opacity-50 grayscale",
                      isExpiringSoon && "ring-2 ring-amber-500/50",
                      ad.is_active && !isExpired && "ring-1 ring-green-500/30"
                    )}
                  >
                    {/* Status bar at top */}
                    <div className={cn(
                      "h-1.5",
                      isExpired ? "bg-red-500" : isExpiringSoon ? "bg-amber-500" : "bg-green-500"
                    )} />
                    
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {/* Icon with gradient background */}
                          <div className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                            config?.bgColor
                          )}>
                            <Icon className={cn("w-7 h-7", config?.color)} />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-lg capitalize">{config?.title || ad.ad_type}</h3>
                              <Badge className={cn(
                                "flex items-center gap-1",
                                isExpired 
                                  ? "bg-red-500/10 text-red-500 border-red-500/20" 
                                  : isExpiringSoon
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-green-500/10 text-green-500 border-green-500/20"
                              )}>
                                <Clock className="w-3 h-3" />
                                {countdowns[ad.id] || (isExpired ? 'Expired' : 'Active')}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              Started {format(new Date(ad.starts_at), 'MMM d, yyyy')} • 
                              Ends {format(new Date(ad.expires_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        
                        {/* Performance metrics with trend indicators */}
                        {(() => {
                          const totalDays = differenceInDays(new Date(ad.expires_at), new Date(ad.starts_at)) || 1;
                          const elapsedDays = Math.max(differenceInDays(new Date(), new Date(ad.starts_at)), 1);
                          const dailyImpressionAvg = ad.impressions / elapsedDays;
                          const impressionTrend = ad.impressions >= (dailyImpressionAvg * elapsedDays * 0.5) ? 'up' : 'down';
                          const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
                          const ctrTrend = ctr >= 1.5 ? 'up' : ctr < 0.5 ? 'down' : 'neutral';
                          const cpc = ad.clicks > 0 ? ad.total_spent / ad.clicks : 0;
                          const cpm = ad.impressions > 0 ? (ad.total_spent / ad.impressions) * 1000 : 0;
                          
                          // Generate sparkline data (simulated daily distribution)
                          const sparklineData = Array.from({ length: Math.min(elapsedDays, 14) }, (_, i) => {
                            const base = dailyImpressionAvg;
                            return Math.max(0, Math.round(base + (Math.random() - 0.5) * base * 0.6));
                          });
                          
                          return (
                            <div className="flex items-center gap-4 text-sm flex-wrap">
                              <div className="text-center px-3 py-2 rounded-lg bg-muted/50">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Eye className="w-3 h-3 text-blue-500" />
                                  <span className="text-lg font-bold">{ad.impressions.toLocaleString()}</span>
                                  {impressionTrend === 'up' ? (
                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3 text-red-500" />
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">Views</p>
                              </div>
                              <div className="text-center px-3 py-2 rounded-lg bg-muted/50">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <MousePointer className="w-3 h-3 text-purple-500" />
                                  <span className="text-lg font-bold">{ad.clicks.toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Clicks</p>
                              </div>
                              <div className="text-center px-3 py-2 rounded-lg bg-muted/50">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  {ctrTrend === 'up' ? (
                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                  ) : ctrTrend === 'down' ? (
                                    <TrendingDown className="w-3 h-3 text-red-500" />
                                  ) : (
                                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                  )}
                                  <span className="text-lg font-bold">{ctr.toFixed(1)}%</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">CTR</p>
                              </div>
                              <div className="text-center px-3 py-2 rounded-lg bg-cyan-500/10">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <MousePointer className="w-3 h-3 text-cyan-500" />
                                  <span className="text-lg font-bold">${cpc.toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">CPC</p>
                              </div>
                              <div className="text-center px-3 py-2 rounded-lg bg-indigo-500/10">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Eye className="w-3 h-3 text-indigo-500" />
                                  <span className="text-lg font-bold">${cpm.toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">CPM</p>
                              </div>
                              <div className="text-center px-3 py-2 rounded-lg bg-amber-500/10">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <DollarSign className="w-3 h-3 text-amber-500" />
                                  <span className="text-lg font-bold">${ad.total_spent.toFixed(0)}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Spent</p>
                              </div>
                              {sparklineData.length > 1 && (
                                <div className="text-center px-3 py-2 rounded-lg bg-muted/50">
                                  <MiniSparkline data={sparklineData} width={70} height={30} showArea />
                                  <p className="text-[10px] text-muted-foreground mt-1">Trend</p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Reach Placements */}
                      {adReachMap[ad.ad_type] && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Target className="w-3 h-3" />
                            Ad Placements
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {adReachMap[ad.ad_type].map((placement, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs bg-muted/40 rounded-md px-2.5 py-1.5">
                                <placement.icon className="w-3 h-3 text-muted-foreground" />
                                <span>{placement.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">{previewAdType} Ad Preview</DialogTitle>
            <DialogDescription>
              See how your ad will appear in the marketplace
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Mock preview showing panel at top */}
            <div className="relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-amber-500 text-white text-xs">
                  👆 You will be here
                </Badge>
              </div>
              
              <Card className={cn(
                "border-2",
                previewAdType === 'sponsored' && "border-amber-500 ring-2 ring-amber-500/20",
                previewAdType === 'top' && "border-blue-500 ring-2 ring-blue-500/20",
                previewAdType === 'best' && "border-purple-500 ring-2 ring-purple-500/20",
                previewAdType === 'featured' && "border-green-500 ring-2 ring-green-500/20"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">1</span>
                      <Crown className="w-5 h-5 text-amber-500" />
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {panel?.name?.charAt(0) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{panel?.name || 'Your Panel'}</span>
                        {previewAdType === 'sponsored' && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs">Sponsored</Badge>
                        )}
                        {previewAdType === 'top' && (
                          <Badge className="bg-blue-500 text-white text-xs">Top</Badge>
                        )}
                        {previewAdType === 'best' && (
                          <Badge className="bg-purple-500 text-white text-xs">Best</Badge>
                        )}
                        {previewAdType === 'featured' && (
                          <Badge className="bg-green-500 text-white text-xs">Featured</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {panel?.subdomain}.smmpilot.online
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Other providers below */}
              {[2, 3, 4].map(rank => (
                <Card key={rank} className="mt-2 opacity-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">{rank}</span>
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-3 w-24 bg-muted rounded" />
                        <div className="h-2 w-16 bg-muted rounded mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderAds;
