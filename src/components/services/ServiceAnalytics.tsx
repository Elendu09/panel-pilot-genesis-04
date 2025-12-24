import { useState, useEffect } from "react";
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
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  PieChartIcon,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

interface ServiceStats {
  id: string;
  name: string;
  category: string;
  price: number;
  orders: number;
  revenue: number;
}

interface CategoryStats {
  name: string;
  count: number;
  revenue: number;
  orders: number;
  color: string;
}

const SERVICE_LIMIT = 2500;
const WARNING_THRESHOLD = 2000;

const CATEGORY_COLORS: Record<string, string> = {
  instagram: "#E4405F",
  facebook: "#1877F2",
  twitter: "#1DA1F2",
  youtube: "#FF0000",
  tiktok: "#010101",
  linkedin: "#0A66C2",
  telegram: "#26A5E4",
  spotify: "#1DB954",
  other: "#6B7280",
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
  const [orderTrends, setOrderTrends] = useState<{ date: string; orders: number; revenue: number }[]>([]);

  useEffect(() => {
    if (isOpen && panel?.id) {
      fetchAnalytics();
    }
  }, [isOpen, panel?.id]);

  const fetchAnalytics = async () => {
    if (!panel?.id) return;
    setLoading(true);

    try {
      // Fetch services
      const { data: servicesData, count } = await supabase
        .from("services")
        .select("id, name, category, price", { count: 'exact' })
        .eq("panel_id", panel.id);

      setTotalServiceCount(count || 0);

      // Fetch orders for these services
      const { data: ordersData } = await supabase
        .from("orders")
        .select("service_id, price, created_at")
        .eq("panel_id", panel.id);

      // Calculate service stats
      const serviceMap = new Map<string, ServiceStats>();
      
      (servicesData || []).forEach((s) => {
        serviceMap.set(s.id, {
          id: s.id,
          name: s.name,
          category: s.category,
          price: Number(s.price),
          orders: 0,
          revenue: 0,
        });
      });

      // Aggregate orders
      (ordersData || []).forEach((order) => {
        const service = serviceMap.get(order.service_id || "");
        if (service) {
          service.orders += 1;
          service.revenue += Number(order.price);
        }
      });

      const serviceStats = Array.from(serviceMap.values())
        .sort((a, b) => b.revenue - a.revenue);
      setServices(serviceStats);

      // Calculate category stats
      const catMap = new Map<string, CategoryStats>();
      serviceStats.forEach((s) => {
        const existing = catMap.get(s.category) || {
          name: s.category,
          count: 0,
          revenue: 0,
          orders: 0,
          color: CATEGORY_COLORS[s.category] || "#6B7280",
        };
        existing.count += 1;
        existing.revenue += s.revenue;
        existing.orders += s.orders;
        catMap.set(s.category, existing);
      });
      setCategoryStats(Array.from(catMap.values()).sort((a, b) => b.revenue - a.revenue));

      // Calculate order trends (last 7 days)
      const trends: Record<string, { orders: number; revenue: number }> = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split("T")[0];
        trends[key] = { orders: 0, revenue: 0 };
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
          date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
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
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
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
                    <Badge variant="destructive" className="text-xs font-bold">
                      MAX
                    </Badge>
                  ) : isNearLimit ? (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Near Limit
                    </Badge>
                  ) : null}
                </div>
              </div>
              <Progress 
                value={Math.min(usagePercentage, 100)} 
                className={cn(
                  "h-2",
                  isAtLimit ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-amber-500" : ""
                )}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {isAtLimit 
                  ? "You've reached the maximum service limit. Delete unused services to add new ones."
                  : isNearLimit 
                    ? `Only ${SERVICE_LIMIT - totalServiceCount} services remaining.`
                    : `${SERVICE_LIMIT - totalServiceCount} services available.`
                }
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Total Revenue</span>
                </div>
                <p className="text-xl font-bold text-green-500">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Total Orders</span>
                </div>
                <p className="text-xl font-bold text-blue-500">{totalOrders}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Avg Order</span>
                </div>
                <p className="text-xl font-bold text-purple-500">${avgOrderValue.toFixed(2)}</p>
              </div>
            </div>

            <Tabs defaultValue="top" className="space-y-3">
              <TabsList className="grid grid-cols-3 bg-muted/50">
                <TabsTrigger value="top" className="text-xs">Top Services</TabsTrigger>
                <TabsTrigger value="category" className="text-xs">By Category</TabsTrigger>
                <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
              </TabsList>

              {/* Top Services */}
              <TabsContent value="top" className="m-0">
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {services.slice(0, 10).map((s, i) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-[10px] shrink-0">
                            {i + 1}
                          </Badge>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground capitalize">{s.category}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-green-500">${s.revenue.toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">{s.orders} orders</p>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-8">
                        No order data yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Category Chart */}
              <TabsContent value="category" className="m-0">
                {categoryStats.length > 0 ? (
                  <div className="h-[200px]">
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
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
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
                  <p className="text-center text-muted-foreground text-sm py-8">
                    No category data yet
                  </p>
                )}
              </TabsContent>

              {/* Order Trends */}
              <TabsContent value="trends" className="m-0">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={orderTrends}>
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
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: "#10B981" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
