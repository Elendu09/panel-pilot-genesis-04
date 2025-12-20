import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Clock,
  Activity,
  ExternalLink,
  Plus,
  RefreshCw
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const PanelOverview = () => {
  const { profile } = useAuth();
  const [panelData, setPanelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeServices: 0,
    totalCustomers: 0
  });

  useEffect(() => {
    const fetchPanelData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: panel } = await supabase
          .from('panels')
          .select('*, panel_settings(*)')
          .eq('owner_id', profile.id)
          .single();

        setPanelData(panel);

        if (panel) {
          const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('panel_id', panel.id);

          const { data: services } = await supabase
            .from('services')
            .select('*')
            .eq('panel_id', panel.id)
            .eq('is_active', true);

          const uniqueCustomers = new Set(orders?.map(o => o.buyer_id) || []).size;
          const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.price), 0) || 0;

          setStats({
            totalOrders: orders?.length || 0,
            totalRevenue,
            activeServices: services?.length || 0,
            totalCustomers: uniqueCustomers
          });
        }
      } catch (error) {
        console.error('Error fetching panel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPanelData();
  }, [profile?.id]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const statsData = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "+12%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-500"
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      change: "+23%",
      trend: "up",
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-500"
    },
    {
      title: "Active Services",
      value: stats.activeServices.toString(),
      change: "+5",
      trend: "up",
      icon: Package,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-500"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      change: "+18%",
      trend: "up",
      icon: Users,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-500"
    },
  ];

  const quickActions = [
    { title: "Add New Service", description: "Create a new SMM service", icon: Plus, href: "/panel/services", color: "text-blue-500" },
    { title: "View Analytics", description: "Check your performance", icon: BarChart3, href: "/panel/analytics", color: "text-emerald-500" },
    { title: "Manage Providers", description: "Configure API providers", icon: Activity, href: "/panel/providers", color: "text-violet-500" },
    { title: "Open Storefront", description: "View your public panel", icon: ExternalLink, href: "/", color: "text-amber-500" },
  ];

  const recentOrders = [
    { id: "ORD-001", service: "Instagram Followers", customer: "john@example.com", amount: "$12.50", status: "completed" },
    { id: "ORD-002", service: "YouTube Views", customer: "sarah@example.com", amount: "$8.00", status: "in_progress" },
    { id: "ORD-003", service: "TikTok Likes", customer: "mike@example.com", amount: "$5.50", status: "pending" },
    { id: "ORD-004", service: "Twitter Followers", customer: "emma@example.com", amount: "$15.00", status: "completed" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Helmet>
        <title>{panelData?.name || 'Panel'} - Dashboard</title>
        <meta name="description" content="Manage your SMM panel, track orders and revenue." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl glass-card p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with{" "}
                <span className="font-semibold text-foreground">{panelData?.name || 'your panel'}</span> today.
              </p>
              {panelData?.subdomain && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="pill-primary">
                    <Activity className="w-3 h-3 mr-1" />
                    {panelData.subdomain}.smmpilot.online
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "pill",
                      panelData.status === 'active' ? 'pill-success' : 'pill-warning'
                    )}
                  >
                    {panelData.status}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <Eye className="w-4 h-4" />
                View Panel
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              className="glass-card-hover p-5 relative overflow-hidden group"
            >
              {/* Background Gradient */}
              <div className={cn(
                "absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity",
                stat.bgColor
              )} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <Icon className={cn("w-5 h-5", stat.textColor)} />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                  )}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold counter">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  to={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all duration-200 group"
                >
                  <div className={cn("p-2 rounded-lg bg-accent", action.color)}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>Latest order activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/panel/orders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order, index) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{order.service}</p>
                        <p className="text-xs text-muted-foreground">{order.customer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{order.amount}</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          order.status === 'completed' && "pill-success",
                          order.status === 'in_progress' && "pill-info",
                          order.status === 'pending' && "pill-warning"
                        )}
                      >
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Panel Status & Provider Status */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Panel Status</CardTitle>
            <CardDescription>Current configuration and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/30">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Panel Status</span>
                </div>
                <Badge className={cn(
                  panelData?.status === 'active' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
                  panelData?.status === 'pending' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                  'bg-red-500/20 text-red-500 border-red-500/30'
                )}>
                  {panelData?.status || 'Unknown'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/30">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Commission Rate</span>
                </div>
                <span className="text-sm font-medium">{panelData?.commission_rate || 5}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/30">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Theme</span>
                </div>
                <span className="text-sm font-medium capitalize">{panelData?.theme_type?.replace('_', ' ') || 'Dark Gradient'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Performance Overview</CardTitle>
            <CardDescription>Key metrics for your panel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Order Completion Rate</span>
                  <span className="text-sm font-semibold">87%</span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                  <span className="text-sm font-semibold">94%</span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Provider Uptime</span>
                  <span className="text-sm font-semibold">99.2%</span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full" style={{ width: '99.2%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PanelOverview;
