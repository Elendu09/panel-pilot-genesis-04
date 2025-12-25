import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { SOCIAL_ICONS_MAP } from "@/components/icons/SocialIcons";
import { calculateChange } from "@/lib/analytics-utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Percent,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface ServiceStats {
  id: string;
  name: string;
  category: string;
  price: number;
  orders: number;
  revenue: number;
  views?: number;
  conversionRate?: number;
  profitMargin?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

interface CategoryStats {
  name: string;
  count: number;
  revenue: number;
  orders: number;
  color: string;
  avgPrice: number;
  profitMargin: number;
}

interface TrendData {
  date: string;
  orders: number;
  revenue: number;
  newServices?: number;
}

const SERVICE_LIMIT = 5500;
const WARNING_THRESHOLD = 5000;

const CATEGORY_COLORS: Record<string, string> = {
  instagram: SOCIAL_ICONS_MAP.instagram.color,
  facebook: SOCIAL_ICONS_MAP.facebook.color,
  twitter: SOCIAL_ICONS_MAP.twitter.color,
  youtube: SOCIAL_ICONS_MAP.youtube.color,
  tiktok: SOCIAL_ICONS_MAP.tiktok.color,
  linkedin: SOCIAL_ICONS_MAP.linkedin.color,
  telegram: SOCIAL_ICONS_MAP.telegram.color,
  spotify: SOCIAL_ICONS_MAP.spotify.color,
  soundcloud: SOCIAL_ICONS_MAP.soundcloud.color,
  twitch: SOCIAL_ICONS_MAP.twitch.color,
  discord: SOCIAL_ICONS_MAP.discord.color,
  pinterest: SOCIAL_ICONS_MAP.pinterest.color,
  snapchat: SOCIAL_ICONS_MAP.snapchat.color,
  threads: SOCIAL_ICONS_MAP.threads.color,
  other: SOCIAL_ICONS_MAP.other.color,
};

interface ServiceAnalyticsProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ServiceAnalytics = ({ isOpen, onToggle }: ServiceAnalyticsProps) => {
  const { panel } = usePanel();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceStats[]>([]);
  const [totalServiceCount, setTotalServiceCount] = useState(0);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [orderTrends, setOrderTrends] = useState<TrendData[]>([]);
  const [periodComparison, setPeriodComparison] = useState<{
    currentRevenue: number;
    previousRevenue: number;
    currentOrders: number;
    previousOrders: number;
  }>({ currentRevenue: 0, previousRevenue: 0, currentOrders: 0, previousOrders: 0 });

  useEffect(() => {
    if (isOpen && panel?.id) {
      fetchAnalytics();
    }
  }, [isOpen, panel?.id]);

  const fetchAnalytics = async () => {
    if (!panel?.id) return;
    setLoading(true);

    try {
      // Fetch services with count
      const { data: servicesData, count } = await supabase
        .from("services")
        .select("id, name, category, price", { count: 'exact' })
        .eq("panel_id", panel.id);

      setTotalServiceCount(count || 0);

      // Fetch orders for last 14 days to compare periods
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const { data: ordersData } = await supabase
        .from("orders")
        .select("service_id, price, created_at, status")
        .eq("panel_id", panel.id)
        .gte("created_at", fourteenDaysAgo.toISOString());

      // Calculate service stats with trends
      const serviceMap = new Map<string, ServiceStats>();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      (servicesData || []).forEach((s) => {
        serviceMap.set(s.id, {
          id: s.id,
          name: s.name,
          category: s.category,
          price: Number(s.price),
          orders: 0,
          revenue: 0,
          profitMargin: 25, // Default profit margin assumption
          trend: 'neutral',
          trendValue: 0,
        });
      });

      // Track current vs previous period
      let currentRevenue = 0, previousRevenue = 0;
      let currentOrders = 0, previousOrders = 0;
      const currentPeriodOrders: Record<string, number> = {};
      const previousPeriodOrders: Record<string, number> = {};

      // Aggregate orders
      (ordersData || []).forEach((order) => {
        const service = serviceMap.get(order.service_id || "");
        const orderDate = new Date(order.created_at);
        const isCurrentPeriod = orderDate >= sevenDaysAgo;
        
        if (service) {
          service.orders += 1;
          service.revenue += Number(order.price);
          
          if (isCurrentPeriod) {
            currentPeriodOrders[order.service_id || ""] = (currentPeriodOrders[order.service_id || ""] || 0) + 1;
            currentRevenue += Number(order.price);
            currentOrders += 1;
          } else {
            previousPeriodOrders[order.service_id || ""] = (previousPeriodOrders[order.service_id || ""] || 0) + 1;
            previousRevenue += Number(order.price);
            previousOrders += 1;
          }
        }
      });

      setPeriodComparison({ currentRevenue, previousRevenue, currentOrders, previousOrders });

      // Calculate trends for each service
      serviceMap.forEach((service) => {
        const current = currentPeriodOrders[service.id] || 0;
        const previous = previousPeriodOrders[service.id] || 0;
        if (current > previous) {
          service.trend = 'up';
          service.trendValue = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 100;
        } else if (current < previous) {
          service.trend = 'down';
          service.trendValue = previous > 0 ? Math.round(((previous - current) / previous) * 100) : 0;
        }
      });

      const serviceStats = Array.from(serviceMap.values())
        .sort((a, b) => b.revenue - a.revenue);
      setServices(serviceStats);

      // Calculate category stats with profit margins
      const catMap = new Map<string, CategoryStats>();
      serviceStats.forEach((s) => {
        const existing = catMap.get(s.category) || {
          name: s.category,
          count: 0,
          revenue: 0,
          orders: 0,
          color: CATEGORY_COLORS[s.category] || CATEGORY_COLORS.other,
          avgPrice: 0,
          profitMargin: 0,
        };
        existing.count += 1;
        existing.revenue += s.revenue;
        existing.orders += s.orders;
        existing.avgPrice = (existing.avgPrice * (existing.count - 1) + s.price) / existing.count;
        catMap.set(s.category, existing);
      });
      
      // Calculate avg profit margin per category (estimate)
      catMap.forEach((cat) => {
        cat.profitMargin = cat.orders > 0 ? Math.round((cat.revenue / cat.orders) * 0.25 * 100) / 100 : 0;
      });
      
      setCategoryStats(Array.from(catMap.values()).sort((a, b) => b.revenue - a.revenue));

      // Calculate order trends (last 7 days)
      const trends: Record<string, TrendData> = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split("T")[0];
        trends[key] = { date: key, orders: 0, revenue: 0 };
      }

      (ordersData || []).forEach((order) => {
        const date = new Date(order.created_at).toISOString().split("T")[0];
        if (trends[date]) {
          trends[date].orders += 1;
          trends[date].revenue += Number(order.price);
        }
      });

      setOrderTrends(
        Object.entries(trends).map(([date, data]) => ({
          date: new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          ...data,
        }))
      );
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = services.reduce((sum, s) => sum + s.revenue, 0);
  const totalOrders = services.reduce((sum, s) => sum + s.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const usagePercentage = (totalServiceCount / SERVICE_LIMIT) * 100;
  const isAtLimit = totalServiceCount >= SERVICE_LIMIT;
  const isNearLimit = totalServiceCount >= WARNING_THRESHOLD;

  // Calculate period changes
  const revenueChange = calculateChange(periodComparison.currentRevenue, periodComparison.previousRevenue);
  const ordersChange = calculateChange(periodComparison.currentOrders, periodComparison.previousOrders);

  // Identify low-performing services (no orders in 7 days)
  const lowPerformers = useMemo(() => 
    services.filter(s => s.orders === 0 && s.price > 0).slice(0, 5),
    [services]
  );

  // Top performers
  const topPerformers = useMemo(() => 
    services.filter(s => s.orders > 0).slice(0, 5),
    [services]
  );

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="w-full justify-between mb-4"
      >
        <span className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Service Analytics
        </span>
        <ChevronDown className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Service Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchAnalytics} disabled={loading}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
            <Skeleton className="h-48" />
          </div>
        ) : (
          <>
            {/* Service Limit Counter */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Service Usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-bold",
                    isAtLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : "text-foreground"
                  )}>
                    {totalServiceCount.toLocaleString()} / {SERVICE_LIMIT.toLocaleString()}
                  </span>
                  {isAtLimit ? (
                    <Badge variant="destructive" className="text-xs font-bold">MAX</Badge>
                  ) : isNearLimit ? (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />Near Limit
                    </Badge>
                  ) : null}
                </div>
              </div>
              <Progress 
                value={Math.min(usagePercentage, 100)} 
                className={cn("h-2", isAtLimit ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-amber-500" : "")}
              />
            </div>

            {/* Summary Stats with Trends */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <div className={cn("flex items-center gap-1 text-xs", 
                    revenueChange.trend === 'up' ? "text-green-500" : 
                    revenueChange.trend === 'down' ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {revenueChange.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
                     revenueChange.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                    {revenueChange.value}
                  </div>
                </div>
                <p className="text-lg font-bold text-green-500">${totalRevenue.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">Total Revenue</p>
              </div>
              
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                  <div className={cn("flex items-center gap-1 text-xs", 
                    ordersChange.trend === 'up' ? "text-green-500" : 
                    ordersChange.trend === 'down' ? "text-red-500" : "text-muted-foreground"
                  )}>
                    {ordersChange.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : 
                     ordersChange.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                    {ordersChange.value}
                  </div>
                </div>
                <p className="text-lg font-bold text-blue-500">{totalOrders}</p>
                <p className="text-[10px] text-muted-foreground">Total Orders</p>
              </div>
              
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-lg font-bold text-purple-500">${avgOrderValue.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">Avg Order Value</p>
              </div>
              
              <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-lg font-bold text-amber-500">
                  {totalOrders > 0 ? Math.round((services.filter(s => s.orders > 0).length / services.length) * 100) : 0}%
                </p>
                <p className="text-[10px] text-muted-foreground">Active Services</p>
              </div>
            </div>

            {/* Low Performers Alert */}
            {lowPerformers.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-500">Low-Performing Services</span>
                  <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500">
                    {lowPerformers.length} services with no orders
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowPerformers.map(s => (
                    <Badge key={s.id} variant="secondary" className="text-xs truncate max-w-[150px]">
                      {s.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Tabs defaultValue="top" className="space-y-3">
              <TabsList className="grid grid-cols-4 bg-muted/50">
                <TabsTrigger value="top" className="text-xs">Top Services</TabsTrigger>
                <TabsTrigger value="category" className="text-xs">Categories</TabsTrigger>
                <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
                <TabsTrigger value="profit" className="text-xs">Profit</TabsTrigger>
              </TabsList>

              {/* Top Services */}
              <TabsContent value="top" className="m-0">
                <ScrollArea className="h-[220px]">
                  <div className="space-y-2">
                    {topPerformers.map((s, i) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="outline" className={cn(
                            "w-6 h-6 flex items-center justify-center text-[10px] shrink-0",
                            i === 0 && "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
                            i === 1 && "bg-gray-400/20 text-gray-400 border-gray-400/30",
                            i === 2 && "bg-amber-700/20 text-amber-700 border-amber-700/30"
                          )}>
                            {i + 1}
                          </Badge>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{s.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground capitalize">{s.category}</span>
                              {s.trend === 'up' && (
                                <span className="flex items-center text-[10px] text-green-500">
                                  <TrendingUp className="w-3 h-3 mr-0.5" />+{s.trendValue}%
                                </span>
                              )}
                              {s.trend === 'down' && (
                                <span className="flex items-center text-[10px] text-red-500">
                                  <TrendingDown className="w-3 h-3 mr-0.5" />-{s.trendValue}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-green-500">${s.revenue.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">{s.orders} orders</p>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-8">No order data yet</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Category Chart */}
              <TabsContent value="category" className="m-0">
                {categoryStats.length > 0 ? (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryStats}
                          dataKey="revenue"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={40}
                          paddingAngle={2}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {categoryStats.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-8">No category data yet</p>
                )}
              </TabsContent>

              {/* Order Trends */}
              <TabsContent value="trends" className="m-0">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={orderTrends}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="orders"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorOrders)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Profit Analysis */}
              <TabsContent value="profit" className="m-0">
                <div className="h-[220px]">
                  {categoryStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryStats.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={10}
                          width={80}
                          tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            name === 'revenue' ? `$${value.toFixed(2)}` : value,
                            name === 'revenue' ? 'Revenue' : 'Orders'
                          ]}
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="orders" fill="#10B981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center text-muted-foreground text-sm py-8">No profit data yet</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceAnalytics;