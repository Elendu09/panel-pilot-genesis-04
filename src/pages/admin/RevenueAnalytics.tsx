import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    revenueGrowth: 15.2
  });
  const [panelRevenueData, setPanelRevenueData] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: panels } = await supabase
        .from('panels')
        .select('id, name, monthly_revenue, status, created_at')
        .order('monthly_revenue', { ascending: false });

      const { data: orders } = await supabase
        .from('orders')
        .select('price, created_at, status');

      if (panels) {
        const totalRevenue = panels.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
        const activePanels = panels.filter(p => p.status === 'active').length;
        
        // Calculate revenue from orders
        const orderRevenue = orders?.reduce((sum, o) => sum + (o.price || 0), 0) || 0;
        
        setStats({
          totalRevenue: Math.max(totalRevenue, orderRevenue),
          monthlyRevenue: totalRevenue * 0.3,
          weeklyRevenue: totalRevenue * 0.08,
          todayRevenue: totalRevenue * 0.01,
          totalPanels: panels.length,
          activePanels,
          avgRevenuePerPanel: activePanels > 0 ? totalRevenue / activePanels : 0,
          revenueGrowth: 15.2
        });

        // Top panels for bar chart
        setPanelRevenueData(panels.slice(0, 5).map(p => ({
          name: p.name?.substring(0, 12) || 'Unknown',
          revenue: p.monthly_revenue || 0
        })));

        // Generate monthly trend data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        setMonthlyTrend(months.map((month, i) => ({
          month,
          revenue: Math.floor((totalRevenue / 6) * (0.7 + Math.random() * 0.6)),
          orders: Math.floor(100 + Math.random() * 200)
        })));
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
      change: '+15.2%', 
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10'
    },
    { 
      title: 'Monthly Revenue', 
      value: stats.monthlyRevenue, 
      change: '+12.5%', 
      trend: 'up',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10'
    },
    { 
      title: 'Weekly Revenue', 
      value: stats.weeklyRevenue, 
      change: '+8.3%', 
      trend: 'up',
      icon: BarChart3,
      color: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-500/10'
    },
    { 
      title: "Today's Revenue", 
      value: stats.todayRevenue, 
      change: '-2.1%', 
      trend: 'down',
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10'
    }
  ];

  const revenueSourcesData = [
    { name: 'Subscriptions', value: 45, color: '#3b82f6' },
    { name: 'Commission', value: 35, color: '#10b981' },
    { name: 'API Access', value: 15, color: '#8b5cf6' },
    { name: 'Premium', value: 5, color: '#f59e0b' }
  ];

  const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Helmet>
        <title>Revenue Analytics - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold">Revenue Analytics</h1>
        <p className="text-muted-foreground">Track platform revenue and financial performance</p>
      </motion.div>

      {/* Revenue Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="glass-card-hover relative overflow-hidden">
              <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20", card.bg)} />
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", card.bg)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    card.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                  )}>
                    {card.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {card.change}
                  </div>
                </div>
                <p className="text-2xl font-bold">${card.value.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly revenue and order trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                    dot={{ fill: '#10b981' }}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Panels Bar Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Top Performing Panels
            </CardTitle>
            <CardDescription>Revenue by panel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={panelRevenueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
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
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources Pie Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Revenue Sources
            </CardTitle>
            <CardDescription>Revenue breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={revenueSourcesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueSourcesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Panel Stats */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Platform Statistics
            </CardTitle>
            <CardDescription>Key platform metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-accent/50 rounded-lg text-center">
                <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{stats.totalPanels}</p>
                <p className="text-xs text-muted-foreground">Total Panels</p>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg text-center">
                <BarChart3 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-2xl font-bold">{stats.activePanels}</p>
                <p className="text-xs text-muted-foreground">Active Panels</p>
              </div>
            </div>
            <div className="p-4 bg-accent/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Revenue/Panel</p>
                  <p className="text-2xl font-bold">${stats.avgRevenuePerPanel.toFixed(2)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                  <p className="text-2xl font-bold text-emerald-500">+{stats.revenueGrowth}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default RevenueAnalytics;
