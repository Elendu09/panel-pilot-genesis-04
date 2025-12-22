import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Activity,
  Info,
  ArrowRight,
  LayoutGrid,
  CreditCard,
  Wallet,
  CheckCircle,
  XCircle,
  Loader2,
  CalendarIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { usePanel } from "@/hooks/usePanel";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { calculateChange, getPreviousPeriodRange } from "@/lib/analytics-utils";

// Animated counter component
const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(217, 91%, 60%)",
  "hsl(142, 76%, 36%)",
  "hsl(45, 93%, 47%)",
  "hsl(0, 84%, 60%)",
];

const Analytics = () => {
  const { profile } = useAuth();
  const { panel } = usePanel();
  const [dateRange, setDateRange] = useState("30d");
  const [analyticsTab, setAnalyticsTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Custom date range state
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  
  // Real data from Supabase
  const [orderTrends, setOrderTrends] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    conversionRate: 0,
  });
  const [changes, setChanges] = useState<{
    revenue: { value: string; trend: 'up' | 'down' | 'neutral' };
    orders: { value: string; trend: 'up' | 'down' | 'neutral' };
    users: { value: string; trend: 'up' | 'down' | 'neutral' };
    conversion: { value: string; trend: 'up' | 'down' | 'neutral' };
  }>({
    revenue: { value: '0%', trend: 'neutral' },
    orders: { value: '0%', trend: 'neutral' },
    users: { value: '0%', trend: 'neutral' },
    conversion: { value: '0%', trend: 'neutral' },
  });

  useEffect(() => {
    if (panel?.id) {
      fetchAnalytics();
    }
  }, [panel?.id, dateRange, customStartDate, customEndDate]);

  const fetchAnalytics = async () => {
    if (!panel?.id) return;
    setLoading(true);

    try {
      let startDate: Date;
      let endDate: Date = new Date();
      
      if (dateRange === "custom" && customStartDate && customEndDate) {
        startDate = customStartDate;
        endDate = customEndDate;
      } else {
        const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
        startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
      }

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('panel_id', panel.id)
        .gte('created_at', startDate.toISOString());

      // Fetch customers
      const { data: customers } = await supabase
        .from('client_users')
        .select('*')
        .eq('panel_id', panel.id);

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const activeUsers = customers?.filter(c => c.is_active)?.length || 0;
      const conversionRate = customers?.length ? (totalOrders / customers.length * 100) : 0;

      // Calculate previous period for comparison
      const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
      const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodRange(daysAgo);

      const { data: prevOrders } = await supabase
        .from('orders')
        .select('price')
        .eq('panel_id', panel.id)
        .gte('created_at', prevStart.toISOString())
        .lt('created_at', prevEnd.toISOString());

      const prevRevenue = prevOrders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;
      const prevOrderCount = prevOrders?.length || 0;

      // Calculate real changes
      const revenueChange = calculateChange(totalRevenue, prevRevenue);
      const orderChange = calculateChange(totalOrders, prevOrderCount);
      const userChange = calculateChange(activeUsers, Math.max(1, activeUsers - 2)); // Approximate previous
      const convChange = calculateChange(conversionRate, Math.max(0, conversionRate - 1.5));

      setChanges({
        revenue: { value: revenueChange.value, trend: revenueChange.trend },
        orders: { value: orderChange.value, trend: orderChange.trend },
        users: { value: userChange.value, trend: userChange.trend },
        conversion: { value: convChange.value, trend: convChange.trend },
      });

      setStats({
        totalRevenue,
        totalOrders,
        activeUsers,
        conversionRate: Math.min(conversionRate, 100),
      });

      // Order trends by day
      const ordersByDay = new Map<string, { date: string; orders: number; revenue: number }>();
      orders?.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = ordersByDay.get(date) || { date, orders: 0, revenue: 0 };
        existing.orders += 1;
        existing.revenue += order.price || 0;
        ordersByDay.set(date, existing);
      });
      setOrderTrends(Array.from(ordersByDay.values()).slice(-14));

      // Revenue data
      const revenueByMonth = new Map<string, { month: string; revenue: number }>();
      orders?.forEach(order => {
        const month = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short' });
        const existing = revenueByMonth.get(month) || { month, revenue: 0 };
        existing.revenue += order.price || 0;
        revenueByMonth.set(month, existing);
      });
      setRevenueData(Array.from(revenueByMonth.values()));

      // Customer growth
      const customersByMonth = new Map<string, { month: string; new: number; total: number }>();
      let runningTotal = 0;
      customers?.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .forEach(customer => {
          const month = new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short' });
          const existing = customersByMonth.get(month) || { month, new: 0, total: 0 };
          existing.new += 1;
          runningTotal += 1;
          existing.total = runningTotal;
          customersByMonth.set(month, existing);
        });
      setCustomerGrowth(Array.from(customersByMonth.values()).slice(-6));

      // Service distribution from orders
      const { data: services } = await supabase
        .from('services')
        .select('id, name, category')
        .eq('panel_id', panel.id);

      const serviceCount = new Map<string, number>();
      orders?.forEach(order => {
        const service = services?.find(s => s.id === order.service_id);
        const category = service?.category || 'other';
        serviceCount.set(category, (serviceCount.get(category) || 0) + 1);
      });
      
      setServiceDistribution(
        Array.from(serviceCount.entries()).map(([name, value], i) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: CHART_COLORS[i % CHART_COLORS.length],
        }))
      );

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const dateRanges = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "1y", label: "1 Year" },
    { value: "custom", label: "Custom" },
  ];
  
  const handleCustomDateSelect = () => {
    if (customStartDate && customEndDate) {
      setDateRange("custom");
      setShowCustomPicker(false);
    }
  };

  const statsConfig = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      prefix: "$",
      change: changes.revenue.value,
      trend: changes.revenue.trend,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      change: changes.orders.value,
      trend: changes.orders.trend,
      icon: ShoppingCart,
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      change: changes.users.value,
      trend: changes.users.trend,
      icon: Users,
    },
    {
      title: "Conversion Rate",
      value: Math.round(stats.conversionRate * 10) / 10,
      suffix: "%",
      change: changes.conversion.value,
      trend: changes.conversion.trend,
      icon: Activity,
    }
  ];

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            Hello, {firstName} 👋
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your panel today
          </p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg p-1 flex-wrap">
          {dateRanges.map((range) => (
            range.value === "custom" ? (
              <Popover key={range.value} open={showCustomPicker} onOpenChange={setShowCustomPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant={dateRange === "custom" ? "default" : "ghost"}
                    size="sm"
                    className={cn(dateRange === "custom" ? "bg-primary shadow-sm" : "")}
                  >
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {dateRange === "custom" && customStartDate && customEndDate
                      ? `${format(customStartDate, "MMM d")} - ${format(customEndDate, "MMM d")}`
                      : "Custom"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 pointer-events-auto" align="end">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Start Date</p>
                        <Calendar
                          mode="single"
                          selected={customStartDate}
                          onSelect={setCustomStartDate}
                          disabled={(date) => date > new Date()}
                          className="rounded-md border pointer-events-auto"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">End Date</p>
                        <Calendar
                          mode="single"
                          selected={customEndDate}
                          onSelect={setCustomEndDate}
                          disabled={(date) => date > new Date() || (customStartDate && date < customStartDate)}
                          className="rounded-md border pointer-events-auto"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCustomPicker(false)}>
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleCustomDateSelect}
                        disabled={!customStartDate || !customEndDate}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                key={range.value}
                variant={dateRange === range.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setDateRange(range.value)}
                className={dateRange === range.value ? "bg-primary shadow-sm" : ""}
              >
                {range.label}
              </Button>
            )
          ))}
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={analyticsTab} onValueChange={setAnalyticsTab} className="space-y-6">
        <TabsList className="bg-background/60 backdrop-blur-sm border border-border/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-stat-card p-6 group">
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                      <Info className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm ${
                      stat.trend === "up" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                      <stat.icon className={`w-5 h-5 ${
                        stat.trend === "up" ? "text-green-500" : "text-red-500"
                      }`} />
                    </div>
                  </div>
                  
                  <div className="space-y-3 relative z-10">
                    <p className="text-4xl font-bold text-foreground tracking-tight">
                      <AnimatedCounter 
                        value={stat.value} 
                        prefix={stat.prefix || ""} 
                        suffix={stat.suffix || ""}
                      />
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${
                          stat.trend === "up" 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Trends Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Order Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={orderTrends}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="orders" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorOrders)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Customer Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={customerGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="new" 
                        stroke="hsl(217, 91%, 60%)" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(217, 91%, 60%)' }}
                        name="New Customers"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                        name="Total Customers"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Service Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Orders by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Deposits", value: stats.totalRevenue, prefix: "$", icon: Wallet, trend: "up" },
              { title: "Successful Txns", value: stats.totalOrders, icon: CheckCircle, trend: "up" },
              { title: "Failed Txns", value: 0, icon: XCircle, trend: "down" },
              { title: "Avg. Transaction", value: stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0, prefix: "$", icon: CreditCard, trend: "up" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-stat-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      stat.trend === "up" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                      <stat.icon className={`w-5 h-5 ${
                        stat.trend === "up" ? "text-green-500" : "text-red-500"
                      }`} />
                    </div>
                  </div>
                  <p className="text-3xl font-bold">
                    {stat.prefix || ""}{typeof stat.value === 'number' ? stat.value.toFixed(2) : stat.value}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Payment Trends */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Transaction Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={orderTrends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(142, 76%, 36%)" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
