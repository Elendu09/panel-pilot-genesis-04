import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Eye, MousePointer, Users, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AdsFunnelCardProps {
  panelId: string;
}

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  icon: typeof Eye;
  color: string;
}

export function AdsFunnelCard({ panelId }: AdsFunnelCardProps) {
  const [loading, setLoading] = useState(true);
  const [hasActiveAds, setHasActiveAds] = useState(false);
  const [metrics, setMetrics] = useState({
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchAdsData();
  }, [panelId]);

  const fetchAdsData = async () => {
    if (!panelId) return;
    
    try {
      const { data: panelAds } = await supabase
        .from('provider_ads')
        .select('impressions, clicks, total_spent, is_active, expires_at')
        .eq('panel_id', panelId);

      if (panelAds) {
        // Check for active ads
        const activeAds = panelAds.filter(ad => 
          ad.is_active && new Date(ad.expires_at) > new Date()
        );
        setHasActiveAds(activeAds.length > 0);

        // Calculate metrics from all ads (including expired for historical data)
        const totalImpressions = panelAds.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
        const totalClicks = panelAds.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
        const totalSpent = panelAds.reduce((sum, ad) => sum + (ad.total_spent || 0), 0);
        
        // Estimate conversions as clicks that led to provider connections (simulated ratio for now)
        // In production, this would be tracked via analytics_events
        const estimatedConversions = Math.floor(totalClicks * 0.15); // 15% click-to-conversion

        setMetrics({
          impressions: totalImpressions,
          clicks: totalClicks,
          conversions: estimatedConversions,
          revenue: totalSpent
        });
      }
    } catch (error) {
      console.error('Error fetching ads data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build funnel stages
  const funnelStages: FunnelStage[] = [
    { 
      name: "Impressions", 
      count: metrics.impressions, 
      percentage: 100,
      icon: Eye,
      color: "from-purple-500 to-purple-600"
    },
    { 
      name: "Clicks", 
      count: metrics.clicks, 
      percentage: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0,
      icon: MousePointer,
      color: "from-blue-500 to-blue-600"
    },
    { 
      name: "Conversions", 
      count: metrics.conversions, 
      percentage: metrics.clicks > 0 ? (metrics.conversions / metrics.clicks) * 100 : 0,
      icon: Users,
      color: "from-green-500 to-green-600"
    },
    { 
      name: "Revenue", 
      count: metrics.revenue, 
      percentage: 100,
      icon: DollarSign,
      color: "from-amber-500 to-amber-600"
    }
  ];

  const ctr = metrics.impressions > 0 ? ((metrics.clicks / metrics.impressions) * 100).toFixed(2) : "0.00";

  return (
    <Card className="glass-stat-card relative overflow-hidden">
      {/* No Ads Overlay */}
      {!loading && !hasActiveAds && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-background/85 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg"
        >
          <div className="text-center p-6 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
              <Crown className="w-8 h-8 text-amber-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Active Advertisements</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Promote your panel to increase visibility in the marketplace and attract more customers
              </p>
            </div>
            <Link to="/panel/promote">
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                <Crown className="w-4 h-4" />
                Promote My Panel
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Ads Performance Funnel
          </CardTitle>
          {hasActiveAds && (
            <span className="text-xs text-muted-foreground">
              CTR: <span className="font-semibold text-foreground">{ctr}%</span>
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-3">
          {funnelStages.map((stage, index) => {
            const Icon = stage.icon;
            const isRevenue = stage.name === "Revenue";
            
            return (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br",
                    stage.color
                  )}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{stage.name}</span>
                      <span className="text-sm font-bold">
                        {isRevenue ? `$${stage.count.toFixed(2)}` : stage.count.toLocaleString()}
                      </span>
                    </div>
                    
                    {!isRevenue && (
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(stage.percentage, 100)}%` }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                          className={cn("h-full rounded-full bg-gradient-to-r", stage.color)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {index < funnelStages.length - 1 && !isRevenue && (
                  <div className="absolute left-4 top-10 h-3 w-px bg-border" />
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
