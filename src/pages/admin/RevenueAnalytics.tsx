import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Calendar,
  Users
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: panels } = await supabase
        .from('panels')
        .select('id, monthly_revenue, status');

      if (panels) {
        const totalRevenue = panels.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
        const activePanels = panels.filter(p => p.status === 'active').length;
        
        setStats({
          totalRevenue,
          monthlyRevenue: totalRevenue * 0.3,
          weeklyRevenue: totalRevenue * 0.08,
          todayRevenue: totalRevenue * 0.01,
          totalPanels: panels.length,
          activePanels,
          avgRevenuePerPanel: activePanels > 0 ? totalRevenue / activePanels : 0,
          revenueGrowth: 15.2
        });
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

  const topPanels = [
    { name: 'SMMKing Pro', revenue: 15892, orders: 1234, growth: 23.5 },
    { name: 'SocialGrow', revenue: 12567, orders: 987, growth: 18.2 },
    { name: 'BoostPanel', revenue: 9834, orders: 756, growth: 15.7 },
    { name: 'ViralBoost', revenue: 8421, orders: 623, growth: 12.3 },
    { name: 'FastSMM', revenue: 7156, orders: 512, growth: 9.8 }
  ];

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

      {/* Kanban-style Revenue Breakdown */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Panels */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Performing Panels
            </CardTitle>
            <CardDescription>Panels with highest revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPanels.map((panel, index) => (
              <div 
                key={panel.name}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">{panel.name}</p>
                    <p className="text-xs text-muted-foreground">{panel.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${panel.revenue.toLocaleString()}</p>
                  <p className="text-xs text-emerald-500">+{panel.growth}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue Sources */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Revenue Sources
            </CardTitle>
            <CardDescription>Revenue breakdown by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Subscription Fees', amount: 45000, percentage: 45, color: 'bg-blue-500' },
              { name: 'Commission', amount: 35000, percentage: 35, color: 'bg-emerald-500' },
              { name: 'API Access', amount: 15000, percentage: 15, color: 'bg-violet-500' },
              { name: 'Premium Features', amount: 5000, percentage: 5, color: 'bg-amber-500' }
            ].map((source) => (
              <div key={source.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{source.name}</span>
                  <span className="text-muted-foreground">${source.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", source.color)}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Panel Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card-hover">
          <CardContent className="p-6 text-center">
            <Users className="w-10 h-10 mx-auto text-primary mb-3" />
            <p className="text-3xl font-bold">{stats.totalPanels}</p>
            <p className="text-sm text-muted-foreground">Total Panels</p>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
            <p className="text-3xl font-bold">{stats.activePanels}</p>
            <p className="text-sm text-muted-foreground">Active Panels</p>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-10 h-10 mx-auto text-violet-500 mb-3" />
            <p className="text-3xl font-bold">${stats.avgRevenuePerPanel.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Avg Revenue/Panel</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default RevenueAnalytics;
