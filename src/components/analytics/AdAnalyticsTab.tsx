import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  Flame, List, Check, MessageSquare, 
  Eye, MousePointer, DollarSign, TrendingUp, 
  TrendingDown, UserPlus, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { formatCompactNumber } from "@/lib/analytics-utils";
import { MiniSparkline } from "./MiniSparkline";
import { subDays, format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface AdAnalyticsTabProps {
  panelId: string;
}

const adTypeConfig: Record<string, {
  icon: typeof Flame;
  color: string;
  bgColor: string;
  label: string;
  chartColor: string;
}> = {
  sponsored: { icon: Flame, color: "text-orange-500", bgColor: "bg-orange-500/10", label: "Sponsored", chartColor: "#f97316" },
  top: { icon: List, color: "text-blue-500", bgColor: "bg-blue-500/10", label: "Top", chartColor: "#3b82f6" },
  best: { icon: Check, color: "text-emerald-500", bgColor: "bg-emerald-500/10", label: "Best", chartColor: "#10b981" },
  featured: { icon: MessageSquare, color: "text-purple-500", bgColor: "bg-purple-500/10", label: "Featured", chartColor: "#a855f7" },
};

interface DailyRow {
  ad_type: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface TypeMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  ctr: number;
  cpc: number;
  cpm: number;
  sparkline: number[];
}

export function AdAnalyticsTab({ panelId }: AdAnalyticsTabProps) {
  const [range, setRange] = useState<'7' | '30' | 'all'>('30');
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<DailyRow[]>([]);
  const [adSpent, setAdSpent] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, [panelId, range]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ad_analytics_daily')
        .select('ad_type, date, impressions, clicks, conversions')
        .eq('panel_id', panelId)
        .order('date', { ascending: true });

      if (range !== 'all') {
        const startDate = subDays(new Date(), parseInt(range)).toISOString().split('T')[0];
        query = query.gte('date', startDate);
      }

      const [dailyRes, adsRes] = await Promise.all([
        query,
        supabase
          .from('provider_ads')
          .select('ad_type, total_spent')
          .eq('panel_id', panelId)
      ]);

      setDailyData((dailyRes.data || []) as DailyRow[]);

      // Sum spent per type
      const spent: Record<string, number> = {};
      (adsRes.data || []).forEach((ad: any) => {
        spent[ad.ad_type] = (spent[ad.ad_type] || 0) + (ad.total_spent || 0);
      });
      setAdSpent(spent);
    } catch (e) {
      console.error('Error fetching ad analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const typeMetrics = useMemo(() => {
    const metrics: Record<string, TypeMetrics> = {};

    for (const type of ['sponsored', 'top', 'best', 'featured']) {
      const rows = dailyData.filter(r => r.ad_type === type);
      const impressions = rows.reduce((s, r) => s + (r.impressions || 0), 0);
      const clicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);
      const conversions = rows.reduce((s, r) => s + (r.conversions || 0), 0);
      const spent = adSpent[type] || 0;
      const sparkline = rows.map(r => r.impressions || 0);

      metrics[type] = {
        impressions,
        clicks,
        conversions,
        spent,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpc: clicks > 0 ? spent / clicks : 0,
        cpm: impressions > 0 ? (spent / impressions) * 1000 : 0,
        sparkline,
      };
    }
    return metrics;
  }, [dailyData, adSpent]);

  // Build comparison chart data
  const chartData = useMemo(() => {
    return ['sponsored', 'top', 'best', 'featured'].map(type => ({
      name: adTypeConfig[type].label,
      Impressions: typeMetrics[type]?.impressions || 0,
      Clicks: typeMetrics[type]?.clicks || 0,
      Conversions: typeMetrics[type]?.conversions || 0,
    }));
  }, [typeMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Performance by Ad Type</h3>
        <ToggleGroup type="single" value={range} onValueChange={(v) => v && setRange(v as any)}>
          <ToggleGroupItem value="7" className="text-xs px-3">7d</ToggleGroupItem>
          <ToggleGroupItem value="30" className="text-xs px-3">30d</ToggleGroupItem>
          <ToggleGroupItem value="all" className="text-xs px-3">All</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Per-type performance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['sponsored', 'top', 'best', 'featured'] as const).map((type, i) => {
          const config = adTypeConfig[type];
          const m = typeMetrics[type];
          const Icon = config.icon;

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass-card overflow-hidden">
                <div className="h-1" style={{ background: config.chartColor }} />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.bgColor)}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>
                      <span className="font-semibold text-sm">{config.label}</span>
                    </div>
                    {m.sparkline.length > 1 && (
                      <MiniSparkline data={m.sparkline} color={config.chartColor} width={60} height={24} showArea />
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/40">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-bold">{formatCompactNumber(m.impressions)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Views</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40">
                      <div className="flex items-center justify-center gap-1">
                        <MousePointer className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-bold">{formatCompactNumber(m.clicks)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Clicks</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/40">
                      <div className="flex items-center justify-center gap-1">
                        <UserPlus className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-bold">{m.conversions}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Leads</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                    <div>
                      <p className="font-semibold text-xs">{m.ctr.toFixed(1)}%</p>
                      <p className="text-muted-foreground">CTR</p>
                    </div>
                    <div>
                      <p className="font-semibold text-xs">${m.cpc.toFixed(2)}</p>
                      <p className="text-muted-foreground">CPC</p>
                    </div>
                    <div>
                      <p className="font-semibold text-xs">${m.cpm.toFixed(2)}</p>
                      <p className="text-muted-foreground">CPM</p>
                    </div>
                    <div>
                      <p className="font-semibold text-xs">${m.spent.toFixed(0)}</p>
                      <p className="text-muted-foreground">Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison bar chart */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ad Type Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="Impressions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Clicks" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Conversions" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Impressions
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Clicks
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Conversions
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
