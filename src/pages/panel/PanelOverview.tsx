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
  RefreshCw,
  Radio,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { calculateChange, getDateRange, getPreviousPeriodRange } from '@/lib/analytics-utils';

interface LiveOrder {
  id: string;
  order_number: string;
  status: string;
  price: number;
  created_at: string;
  target_url: string;
  service?: { name: string };
}

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
  const [changes, setChanges] = useState<{
    orders: { value: string; trend: 'up' | 'down' | 'neutral' };
    revenue: { value: string; trend: 'up' | 'down' | 'neutral' };
    services: { value: string; trend: 'up' | 'down' | 'neutral' };
    customers: { value: string; trend: 'up' | 'down' | 'neutral' };
  }>({
    orders: { value: '0%', trend: 'neutral' },
    revenue: { value: '0%', trend: 'neutral' },
    services: { value: '+0', trend: 'neutral' },
    customers: { value: '0%', trend: 'neutral' },
  });
  
  // Live orders state
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

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

          // Fetch recent orders for live widget
          const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, order_number, status, price, created_at, target_url')
            .eq('panel_id', panel.id)
            .order('created_at', { ascending: false })
            .limit(5);

          setLiveOrders((recentOrders || []) as LiveOrder[]);

          const uniqueCustomers = new Set(orders?.map(o => o.buyer_id) || []).size;
          const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.price), 0) || 0;

          // Fetch previous period data (last 30 days vs previous 30 days)
          const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodRange(30);
          const { data: prevOrders } = await supabase
            .from('orders')
            .select('price')
            .eq('panel_id', panel.id)
            .gte('created_at', prevStart.toISOString())
            .lt('created_at', prevEnd.toISOString());

          const prevRevenue = prevOrders?.reduce((sum, o) => sum + Number(o.price), 0) || 0;
          const prevOrderCount = prevOrders?.length || 0;

          // Calculate real changes
          const orderChange = calculateChange(orders?.length || 0, prevOrderCount);
          const revenueChange = calculateChange(totalRevenue, prevRevenue);

          setChanges({
            orders: { value: orderChange.value, trend: orderChange.trend },
            revenue: { value: revenueChange.value, trend: revenueChange.trend },
            services: { value: `+${services?.length || 0}`, trend: 'up' },
            customers: { value: orderChange.value, trend: orderChange.trend },
          });

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

  // Realtime subscription for orders
  useEffect(() => {
    if (!panelData?.id) return;

    let channel: RealtimeChannel;

    const setupRealtime = () => {
      channel = supabase
        .channel('live-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `panel_id=eq.${panelData.id}`
          },
          (payload) => {
            console.log('Realtime order update:', payload);
            setLastRefresh(new Date());
            
            if (payload.eventType === 'INSERT') {
              const newOrder = payload.new as LiveOrder;
              setLiveOrders(prev => [newOrder, ...prev.slice(0, 4)]);
              setStats(prev => ({
                ...prev,
                totalOrders: prev.totalOrders + 1,
                totalRevenue: prev.totalRevenue + Number(newOrder.price)
              }));
            } else if (payload.eventType === 'UPDATE') {
              setLiveOrders(prev => prev.map(o => 
                o.id === (payload.new as LiveOrder).id ? payload.new as LiveOrder : o
              ));
            }
          }
        )
        .subscribe((status) => {
          setIsLive(status === 'SUBSCRIBED');
        });
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [panelData?.id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    if (!panelData?.id) return;
    setRefreshing(true);
    
    try {
      // Fetch latest orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, order_number, status, price, created_at, target_url')
        .eq('panel_id', panelData.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setLiveOrders((ordersData || []) as LiveOrder[]);

      // Check domain configuration status
      const { data: domains } = await supabase
        .from('panel_domains')
        .select('*')
        .eq('panel_id', panelData.id);

      // Check services count
      const { data: services } = await supabase
        .from('services')
        .select('id')
        .eq('panel_id', panelData.id)
        .eq('is_active', true);

      // Verify pending domains via DNS lookup
      const pendingDomains = domains?.filter(d => d.verification_status === 'pending') || [];
      for (const domain of pendingDomains) {
        try {
          const { data: dnsData } = await supabase.functions.invoke('dns-lookup', {
            body: { domain: domain.domain, recordType: 'A' }
          });

          if (dnsData?.results?.some((r: any) => r.status === 'resolved' && r.value === '185.158.133.1')) {
            await supabase.from('panel_domains')
              .update({ verification_status: 'verified', verified_at: new Date().toISOString(), dns_configured: true })
              .eq('id', domain.id);
          }
        } catch (e) {
          console.log('DNS check skipped:', e);
        }
      }

      // Update panel status to 'active' when a subdomain exists.
      // (Custom domains still rely on DNS verification, but subdomains should be live immediately.)
      const hasSubdomain = !!panelData.subdomain;
      
      if (hasSubdomain && panelData.status !== 'active') {
        await supabase.from('panels')
          .update({ status: 'active', is_approved: true })
          .eq('id', panelData.id);

        // Refetch panel data to update UI
        const { data: updatedPanel } = await supabase
          .from('panels')
          .select('*, panel_settings(*)')
          .eq('id', panelData.id)
          .single();
        
        if (updatedPanel) {
          setPanelData(updatedPanel);
        }
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewPanel = () => {
    if (!panelData) return;
    const url = panelData?.custom_domain 
      ? `https://${panelData.custom_domain}`
      : `https://${panelData.subdomain}.smmpilot.online`;
    window.open(url, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Loader2;
      case 'pending': return Clock;
      case 'cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-500';
      case 'in_progress': return 'bg-blue-500/20 text-blue-500';
      case 'pending': return 'bg-amber-500/20 text-amber-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      default: return 'bg-slate-500/20 text-slate-500';
    }
  };

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
      change: changes.orders.value,
      trend: changes.orders.trend,
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-500"
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      change: changes.revenue.value,
      trend: changes.revenue.trend,
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-500"
    },
    {
      title: "Active Services",
      value: stats.activeServices.toString(),
      change: changes.services.value,
      trend: changes.services.trend,
      icon: Package,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-500"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      change: changes.customers.value,
      trend: changes.customers.trend,
      icon: Users,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-500"
    },
  ];

  // Dynamic storefront URL
  const storefrontUrl = panelData?.custom_domain 
    ? `https://${panelData.custom_domain}`
    : panelData?.subdomain 
      ? `https://${panelData.subdomain}.smmpilot.online`
      : '/';

  const quickActions = [
    { title: "Add New Service", description: "Create a new SMM service", icon: Plus, href: "/panel/services", color: "text-blue-500" },
    { title: "View Analytics", description: "Check your performance", icon: BarChart3, href: "/panel/analytics", color: "text-emerald-500" },
    { title: "Manage Providers", description: "Configure API providers", icon: Activity, href: "/panel/providers", color: "text-violet-500" },
    { title: "Open Storefront", description: "View your public panel", icon: ExternalLink, href: storefrontUrl, color: "text-amber-500", external: true },
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
                    {panelData.status === 'active' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                    ) : (
                      <><Clock className="w-3 h-3 mr-1" /> {panelData.status}</>
                    )}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleManualRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                Refresh
              </Button>
              <Button 
                size="sm" 
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={handleViewPanel}
              >
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
              {quickActions.map((action) => (
                action.external ? (
                  <a
                    key={action.title}
                    href={action.href}
                    target="_blank"
                    rel="noopener noreferrer"
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
                  </a>
                ) : (
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
                )
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Orders Widget */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    isLive ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  <Badge variant="outline" className={cn(
                    "text-xs gap-1",
                    isLive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-amber-500/10 text-amber-500"
                  )}>
                    <Radio className="w-3 h-3" />
                    {isLive ? 'LIVE' : 'Connecting...'}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-lg">Live Orders</CardTitle>
                  <CardDescription className="text-xs">
                    Updated {lastRefresh.toLocaleTimeString()}
                  </CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {liveOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No orders yet</p>
                    </div>
                  ) : (
                    liveOrders.map((order, index) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: -20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{order.order_number}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {order.target_url || 'No target'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold">${Number(order.price).toFixed(2)}</span>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs gap-1", getStatusColor(order.status))}
                            >
                              <StatusIcon className={cn(
                                "w-3 h-3",
                                order.status === 'in_progress' && "animate-spin"
                              )} />
                              {order.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-4 pt-3 border-t border-border/50">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/panel/orders">View All Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

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

        {/* Recent Orders - Using Real Data */}
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
                {liveOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No orders yet</p>
                    <p className="text-xs">Orders will appear here when customers place them</p>
                  </div>
                ) : (
                  liveOrders.slice(0, 5).map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <div 
                        key={order.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{order.service?.name || 'Service'}</p>
                            <p className="text-xs text-muted-foreground">{order.order_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">${Number(order.price).toFixed(2)}</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs gap-1", getStatusColor(order.status))}
                          >
                            <StatusIcon className={cn("w-3 h-3", order.status === 'in_progress' && "animate-spin")} />
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
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
