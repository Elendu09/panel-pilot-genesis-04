import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Wallet,
  ArrowLeft
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

const adTypeConfig = {
  sponsored: { 
    icon: Crown, 
    color: "text-amber-500", 
    bgColor: "bg-amber-500/10",
    gradient: "from-amber-500 to-yellow-500",
    benefits: [
      "Top position in marketplace",
      "Gold 'Sponsored' badge",
      "Priority in search results",
      "Maximum visibility"
    ]
  },
  top: { 
    icon: Trophy, 
    color: "text-blue-500", 
    bgColor: "bg-blue-500/10",
    gradient: "from-blue-500 to-cyan-500",
    benefits: [
      "Featured in 'Top Providers' section",
      "Blue highlight badge",
      "Increased visibility"
    ]
  },
  best: { 
    icon: Star, 
    color: "text-purple-500", 
    bgColor: "bg-purple-500/10",
    gradient: "from-purple-500 to-pink-500",
    benefits: [
      "'Best Choice' badge",
      "Editor's pick highlight",
      "Trust indicator"
    ]
  },
  featured: { 
    icon: Sparkles, 
    color: "text-green-500", 
    bgColor: "bg-green-500/10",
    gradient: "from-green-500 to-emerald-500",
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

  useEffect(() => {
    if (panel?.id) {
      fetchData();
    }
  }, [panel?.id]);

  const fetchData = async () => {
    try {
      const [pricingRes, adsRes] = await Promise.all([
        supabase.from('provider_ad_pricing').select('*').eq('is_active', true).order('daily_rate', { ascending: false }),
        supabase.from('provider_ads').select('*').eq('panel_id', panel?.id).order('created_at', { ascending: false })
      ]);

      if (pricingRes.data) {
        setPricing(pricingRes.data);
        // Initialize duration selection
        const durations: Record<string, string> = {};
        pricingRes.data.forEach(p => { durations[p.ad_type] = 'daily'; });
        setSelectedDuration(durations);
      }
      if (adsRes.data) setMyAds(adsRes.data);
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

  const getDiscount = (tier: AdPricing, duration: string) => {
    const dailyEquivalent = tier.daily_rate;
    let daysCount = 1;
    let actualRate = tier.daily_rate;

    if (duration === 'weekly') {
      daysCount = 7;
      actualRate = tier.weekly_rate;
    } else if (duration === 'monthly') {
      daysCount = 30;
      actualRate = tier.monthly_rate;
    }

    const fullPrice = dailyEquivalent * daysCount;
    const discount = Math.round(((fullPrice - actualRate) / fullPrice) * 100);
    return discount > 0 ? discount : 0;
  };

  const handlePurchase = async (tier: AdPricing) => {
    if (!panel?.id) return;
    
    const duration = selectedDuration[tier.ad_type] || 'daily';
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

      // Create transaction record
      await supabase.from('transactions').insert({
        panel_id: panel.id,
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
    <div className="space-y-6">
      <Helmet>
        <title>Promote My Panel</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Promote My Panel</h1>
          <p className="text-muted-foreground">Boost your visibility in the marketplace</p>
        </div>
        <Card className="glass-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="text-lg font-bold">${(panel?.balance || 0).toFixed(2)}</p>
            </div>
            <Link to="/panel/billing">
              <Button size="sm" variant="outline">Add Funds</Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      <Tabs defaultValue="purchase" className="space-y-6">
        <TabsList>
          <TabsTrigger value="purchase" className="gap-2">
            <Crown className="w-4 h-4" />
            Purchase Ads
          </TabsTrigger>
          <TabsTrigger value="my-ads" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            My Ads ({myAds.filter(a => a.is_active && new Date(a.expires_at) > new Date()).length})
          </TabsTrigger>
        </TabsList>

        {/* Purchase Ads */}
        <TabsContent value="purchase">
          <div className="grid md:grid-cols-2 gap-6">
            {pricing.map((tier, index) => {
              const config = adTypeConfig[tier.ad_type as keyof typeof adTypeConfig];
              const Icon = config?.icon || Crown;
              const duration = selectedDuration[tier.ad_type] || 'daily';
              const price = getPrice(tier, duration);
              const discount = getDiscount(tier, duration);
              const isActive = hasActiveAd(tier.ad_type);

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "glass-card-hover overflow-hidden",
                    tier.ad_type === 'sponsored' && "ring-2 ring-amber-500/50"
                  )}>
                    {/* Gradient header */}
                    <div className={cn("h-2 bg-gradient-to-r", config?.gradient)} />
                    
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", config?.bgColor)}>
                            <Icon className={cn("w-6 h-6", config?.color)} />
                          </div>
                          <div>
                            <CardTitle className="capitalize">{tier.ad_type}</CardTitle>
                            <CardDescription>{tier.description}</CardDescription>
                          </div>
                        </div>
                        {isActive && (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                            <Check className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Benefits */}
                      <ul className="space-y-2">
                        {config?.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Duration Select */}
                      <div className="space-y-2">
                        <Select 
                          value={duration}
                          onValueChange={(v) => setSelectedDuration({
                            ...selectedDuration,
                            [tier.ad_type]: v
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">
                              1 Day - ${tier.daily_rate.toFixed(2)}
                            </SelectItem>
                            <SelectItem value="weekly">
                              7 Days - ${tier.weekly_rate.toFixed(2)} ({getDiscount(tier, 'weekly')}% off)
                            </SelectItem>
                            <SelectItem value="monthly">
                              30 Days - ${tier.monthly_rate.toFixed(2)} ({getDiscount(tier, 'monthly')}% off)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price & Purchase */}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="text-2xl font-bold">${price.toFixed(2)}</p>
                          {discount > 0 && (
                            <p className="text-xs text-green-500">Save {discount}%</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Example Preview Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPreviewAdType(tier.ad_type);
                              setPreviewOpen(true);
                            }}
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Example
                          </Button>
                          {/* Purchase Button */}
                          <Button
                            onClick={() => handlePurchase(tier)}
                            disabled={purchasing === tier.ad_type || isActive || (panel?.balance || 0) < price}
                            className={cn("gap-2", `bg-gradient-to-r ${config?.gradient}`)}
                          >
                            {purchasing === tier.ad_type ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : isActive ? (
                              <>Already Active</>
                            ) : (
                              <>
                                <DollarSign className="w-4 h-4" />
                                Get Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {(panel?.balance || 0) < price && !isActive && (
                        <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 p-2 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          Insufficient balance. Add funds to purchase.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* My Ads */}
        <TabsContent value="my-ads">
          {myAds.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Crown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Active Ads</h3>
                <p className="text-muted-foreground mb-4">Purchase an ad to boost your panel's visibility</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myAds.map((ad) => {
                const config = adTypeConfig[ad.ad_type as keyof typeof adTypeConfig];
                const Icon = config?.icon || Crown;
                const daysLeft = differenceInDays(new Date(ad.expires_at), new Date());
                const isExpired = daysLeft < 0;

                return (
                  <Card key={ad.id} className={cn("glass-card", isExpired && "opacity-60")}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", config?.bgColor)}>
                            <Icon className={cn("w-5 h-5", config?.color)} />
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize">{ad.ad_type} Ad</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {isExpired ? (
                                <span className="text-destructive">Expired</span>
                              ) : (
                                <span>Expires in {daysLeft} days</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{ad.impressions}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Impressions
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">{ad.clicks}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MousePointer className="w-3 h-3" /> Clicks
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold">${ad.total_spent.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Spent</p>
                          </div>
                          <Badge variant={ad.is_active && !isExpired ? "default" : "secondary"}>
                            {isExpired ? "Expired" : ad.is_active ? "Active" : "Paused"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Ad Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ad Preview</DialogTitle>
            <DialogDescription>
              How your panel will appear in the marketplace
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Mock Ranking Display */}
            <div className="border rounded-xl p-4 bg-gradient-to-r from-amber-500/10 to-amber-500/5 relative">
              {/* "You will be here" tooltip */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-card border rounded-lg px-3 py-1.5 shadow-lg z-10">
                <p className="text-sm font-medium text-center">You will be here</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-primary p-0 h-auto w-full text-xs"
                  onClick={() => setPreviewOpen(false)}
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back to ads
                </Button>
              </div>
              
              {/* Ranking #1 with Crown */}
              <div className="flex items-center gap-3 mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">1</span>
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <Avatar className="w-10 h-10 border-2 border-amber-500">
                  <AvatarImage src={panel?.logo_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {panel?.name?.substring(0, 2).toUpperCase() || 'MY'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{panel?.name || 'My Panel'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {panel?.custom_domain || `${panel?.subdomain}.smmpilot.online`}
                  </p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 shrink-0">
                  {previewAdType?.charAt(0).toUpperCase()}{previewAdType?.slice(1)}
                </Badge>
              </div>
              
              {/* Sample service badges */}
              <div className="flex flex-wrap gap-2 mt-3 pl-12">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" /> Premium
                </Badge>
                <Badge variant="secondary">Top Quality</Badge>
              </div>
            </div>
            
            {/* Lower rankings preview (faded) */}
            <div className="space-y-3 opacity-60">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="font-bold w-6">2</span>
                <Crown className="w-4 h-4 text-muted-foreground" />
                <Avatar className="w-8 h-8"><AvatarFallback>FS</AvatarFallback></Avatar>
                <span className="text-sm flex-1">flysmm.com</span>
                <Badge variant="outline" className="text-xs">USD</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="font-bold w-6">3</span>
                <Crown className="w-4 h-4 text-muted-foreground" />
                <Avatar className="w-8 h-8"><AvatarFallback>TG</AvatarFallback></Avatar>
                <span className="text-sm flex-1">teateagram.com</span>
                <Badge variant="outline" className="text-xs">USD</Badge>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="font-bold w-6">4</span>
                <Crown className="w-4 h-4 text-muted-foreground" />
                <Avatar className="w-8 h-8"><AvatarFallback>SM</AvatarFallback></Avatar>
                <span className="text-sm flex-1">smmpanel.io</span>
                <Badge variant="outline" className="text-xs">USD</Badge>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderAds;
