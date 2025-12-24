import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Activity
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfMonth, subMonths, format, startOfWeek, startOfDay, subDays } from 'date-fns';

const RevenueAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    todayRevenue: 0,
    totalPanels: 0,
    activePanels: 0,
    avgRevenuePerPanel: 0,
    revenueGrowth: 0,
    previousMonthRevenue: 0
  });
  const [panelRevenueData, setPanelRevenueData] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [revenueSourcesData, setRevenueSourcesData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch panels
      const { data: panels } = await supabase
        .from('panels')
        .select('id, name, monthly_revenue, status, created_at')
        .order('monthly_revenue', { ascending: false });

      // Fetch all orders with dates
      const { data: orders } = await supabase
        .from('orders')
        .select('price, created_at, status, panel_id')
        .order('created_at', { ascending: true });

      // Fetch platform fees
      const { data: platformFees } = await supabase
        .from('platform_fees')
        .select('fee_amount, created_at');

      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from('panel_subscriptions')
        .select('price, status, started_at');

      const now = new Date();
      const startOfCurrentMonth = startOfMonth(now);
      const startOfPrevMonth = startOfMonth(subMonths(now, 1));
      const startOfCurrentWeek = startOfWeek(now);
      const startOfToday = startOfDay(now);

      // Calculate real revenue from orders
      const completedOrders = orders?.filter(o => o.status === 'completed') || [];
      const totalOrderRevenue = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);

      // Calculate subscription revenue
      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
      const subscriptionRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.price || 0), 0);

      // Calculate commission revenue from platform fees
      const totalCommission = platformFees?.reduce((sum, f) => sum + (f.fee_amount || 0), 0) || 0;

      const totalRevenue = totalOrderRevenue + subscriptionRevenue + totalCommission;

      // Monthly revenue (current month orders)
      const currentMonthOrders = completedOrders.filter(o => new Date(o.created_at) >= startOfCurrentMonth);
      const monthlyRevenue = currentMonthOrders.reduce((sum, o) => sum + (o.price || 0), 0);

      // Previous month revenue
      const prevMonthOrders = completedOrders.filter(o => {
        const date = new Date(o.created_at);
        return date >= startOfPrevMonth && date < startOfCurrentMonth;
      });
      const previousMonthRevenue = prevMonthOrders.reduce((sum, o) => sum + (o.price || 0), 0);

      // Weekly revenue
      const weeklyOrders = completedOrders.filter(o => new Date(o.created_at) >= startOfCurrentWeek);
      const weeklyRevenue = weeklyOrders.reduce((sum, o) => sum + (o.price || 0), 0);

      // Today's revenue
      const todayOrders = completedOrders.filter(o => new Date(o.created_at) >= startOfToday);
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.price || 0), 0);

      // Calculate growth
      const revenueGrowth = previousMonthRevenue > 0 
        ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
        : monthlyRevenue > 0 ? 100 : 0;

      const activePanels = panels?.filter(p => p.status === 'active').length || 0;

      setStats({
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        todayRevenue,
        totalPanels: panels?.length || 0,
        activePanels,
        avgRevenuePerPanel: activePanels > 0 ? totalRevenue / activePanels : 0,
        revenueGrowth,
        previousMonthRevenue
      });

      // Top panels for bar chart
      setPanelRevenueData(
        (panels || []).slice(0, 5).map(p => ({
          name: p.name?.substring(0, 12) || 'Unknown',
          revenue: p.monthly_revenue || 0
        }))
      );

      // Generate monthly trend from real order data
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(now, 5 - i);
        return {
          month: format(date, 'MMM'),
          start: startOfMonth(date),
          end: startOfMonth(subMonths(date, -1))
        };
      });

      const trendData = last6Months.map(({ month, start, end }) => {
        const monthOrders = completedOrders.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate >= start && orderDate < end;
        });
        return {
          month,
          revenue: monthOrders.reduce((sum, o) => sum + (o.price || 0), 0),
          orders: monthOrders.length
        };
      });

      setMonthlyTrend(trendData);

      // Calculate real revenue sources
      const totalSources = subscriptionRevenue + totalCommission + totalOrderRevenue;
      if (totalSources > 0) {
        setRevenueSourcesData([
          { name: 'Subscriptions', value: Math.round((subscriptionRevenue / totalSources) * 100), color: '#3b82f6' },
          { name: 'Commission', value: Math.round((totalCommission / totalSources) * 100), color: '#10b981' },
          { name: 'Orders', value: Math.round((totalOrderRevenue / totalSources) * 100), color: '#8b5cf6' }
        ].filter(s => s.value > 0));
      } else {
        setRevenueSourcesData([
          { name: 'No Data', value: 100, color: '#6b7280' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const revenueCards = [
    { 
      title: 'Total Revenue', 
      value: stats.totalRevenue, 
      change: `${stats.revenueGrowth >= 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}%`, 
      trend: stats.revenueGrowth >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10'
    },
    { 
      title: 'Monthly Revenue', 
      value: stats.monthlyRevenue, 
      change: `vs $${stats.previousMonthRevenue.toFixed(0)} last month`, 
      trend: stats.monthlyRevenue >= stats.previousMonthRevenue ? 'up' : 'down',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10'
    },
    { 
      title: 'Weekly Revenue', 
      value: stats.weeklyRevenue, 
      change: 'This week', 
      trend: 'up',
      icon: BarChart3,
      color: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-500/10'
    },
    { 
      title: "Today's Revenue", 
      value: stats.todayRevenue, 
      change: 'Today', 
      trend: stats.todayRevenue > 0 ? 'up' : 'neutral',
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10'
    }
  ];

  const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 md:space-y-6"
    >
      <Helmet>
        <title>Revenue Analytics - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Revenue Analytics</h1>
        <p className="text-sm text-muted-foreground">Track platform revenue and financial performance</p>
      </motion.div>

      {/* Revenue Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {revenueCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="glass-card-hover relative overflow-hidden">
              <div className={cn("absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 rounded-full blur-2xl opacity-20", card.bg)} />
              <CardContent className="p-3 md:p-4 relative">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className={cn("p-1.5 md:p-2 rounded-lg", card.bg)}>
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    card.trend === 'up' ? 'text-emerald-500' : card.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {card.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : card.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    <span className="hidden sm:inline">{card.change}</span>
                  </div>
                </div>
                <p className="text-lg md:text-2xl font-bold">${card.value.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue Trend Line Chart */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Revenue Trend
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Monthly revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Revenue ($)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Panels Bar Chart */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Top Performing Panels
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Revenue by panel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={panelRevenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={70} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Second Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue Sources Pie Chart */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <PieChart className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Revenue Sources
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Revenue breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={revenueSourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  >
                    {revenueSourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Panel Stats */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Platform Statistics
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Key platform metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-accent/50 rounded-lg text-center">
                <Users className="w-6 h-6 md:w-8 md:h-8 mx-auto text-primary mb-2" />
                <p className="text-xl md:text-2xl font-bold">{stats.totalPanels}</p>
                <p className="text-xs text-muted-foreground">Total Panels</p>
              </div>
              <div className="p-3 md:p-4 bg-accent/50 rounded-lg text-center">
                <BarChart3 className="w-6 h-6 md:w-8 md:h-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-xl md:text-2xl font-bold">{stats.activePanels}</p>
                <p className="text-xs text-muted-foreground">Active Panels</p>
              </div>
            </div>
            <div className="p-3 md:p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Avg Revenue/Panel</p>
                  <p className="text-xl md:text-2xl font-bold">${stats.avgRevenuePerPanel.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
            </div>
            <div className="p-3 md:p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Growth Rate</p>
                  <p className={cn(
                    "text-xl md:text-2xl font-bold",
                    stats.revenueGrowth >= 0 ? "text-emerald-500" : "text-destructive"
                  )}>
                    {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}%
                  </p>
                </div>
                {stats.revenueGrowth >= 0 ? (
                  <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default RevenueAnalytics;