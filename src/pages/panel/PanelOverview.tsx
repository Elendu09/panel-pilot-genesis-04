import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Plug,
  RefreshCw,
  Radio,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  Settings,
  Globe,
  Sparkles,
  ChevronRight,
  Palette,
  Wallet,
  Crown,
  Percent
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { calculateChange, getPreviousPeriodRange } from '@/lib/analytics-utils';
import SubdomainPreview from '@/components/panel/SubdomainPreview';

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
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [panelData, setPanelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<{ plan_type: string } | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeServices: 0,
    totalCustomers: 0,
    todayOrders: 0,
    todayRevenue: 0,
    topServiceToday: ''
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
          // Fetch subscription
          const { data: sub } = await supabase
            .from('panel_subscriptions')
            .select('plan_type')
            .eq('panel_id', panel.id)
            .eq('status', 'active')
            .single();
          setSubscription(sub);
          const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('panel_id', panel.id);

          // Use count query for accurate active services count (avoids 1000 row limit)
          const { count: activeServicesCount } = await supabase
            .from('services')
            .select('*', { count: 'exact', head: true })
            .eq('panel_id', panel.id)
            .eq('is_active', true);

          // Fetch actual customer count from client_users table
          const { count: totalCustomersCount } = await supabase
            .from('client_users')
            .select('*', { count: 'exact', head: true })
            .eq('panel_id', panel.id);

          // Fetch recent orders for live widget
          const { data: recentOrders } = await supabase
            .from('orders')
            .select('id, order_number, status, price, created_at, target_url')
            .eq('panel_id', panel.id)
            .order('created_at', { ascending: false })
            .limit(20);

          setLiveOrders((recentOrders || []) as LiveOrder[]);

          const totalCustomers = totalCustomersCount || 0;
          const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.price), 0) || 0;

          // Fetch today's orders
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const { data: todayOrders } = await supabase
            .from('orders')
            .select('price, service_id')
            .eq('panel_id', panel.id)
            .gte('created_at', today.toISOString());
          
          const todayOrderCount = todayOrders?.length || 0;
          const todayRevenueTotal = todayOrders?.reduce((sum, o) => sum + Number(o.price), 0) || 0;
          
          // Find top service today
          let topService = '';
          if (todayOrders && todayOrders.length > 0) {
            const serviceCounts: Record<string, number> = {};
            todayOrders.forEach(o => {
              if (o.service_id) {
                serviceCounts[o.service_id] = (serviceCounts[o.service_id] || 0) + 1;
              }
            });
            const topServiceId = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
            if (topServiceId) {
              const { data: serviceData } = await supabase
                .from('services')
                .select('name')
                .eq('id', topServiceId)
                .single();
              topService = serviceData?.name || '';
            }
          }

          // Fetch previous period data
          const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodRange(30);
          const { data: prevOrders } = await supabase
            .from('orders')
            .select('price')
            .eq('panel_id', panel.id)
            .gte('created_at', prevStart.toISOString())
            .lt('created_at', prevEnd.toISOString());

          const prevRevenue = prevOrders?.reduce((sum, o) => sum + Number(o.price), 0) || 0;
          const prevOrderCount = prevOrders?.length || 0;

          const orderChange = calculateChange(orders?.length || 0, prevOrderCount);
          const revenueChange = calculateChange(totalRevenue, prevRevenue);

          setChanges({
            orders: { value: orderChange.value, trend: orderChange.trend },
            revenue: { value: revenueChange.value, trend: revenueChange.trend },
            services: { value: `+${activeServicesCount || 0}`, trend: 'up' },
            customers: { value: orderChange.value, trend: orderChange.trend },
          });

          setStats({
            totalOrders: orders?.length || 0,
            totalRevenue,
            activeServices: activeServicesCount || 0,
            totalCustomers,
            todayOrders: todayOrderCount,
            todayRevenue: todayRevenueTotal,
            topServiceToday: topService
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
            setLastRefresh(new Date());
            
            if (payload.eventType === 'INSERT') {
              const newOrder = payload.new as LiveOrder;
              setLiveOrders(prev => [newOrder, ...prev.slice(0, 19)]);
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

  const handleManualRefresh = async () => {
    if (!panelData?.id) return;
    setRefreshing(true);
    
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, order_number, status, price, created_at, target_url')
        .eq('panel_id', panelData.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      setLiveOrders((ordersData || []) as LiveOrder[]);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': 
        return { 
          label: 'Completed', 
          gradient: 'from-emerald-500 to-emerald-600', 
          bg: 'bg-emerald-500/10', 
          text: 'text-emerald-500',
          border: 'border-emerald-500/30'
        };
      case 'in_progress': 
        return { 
          label: 'In Progress', 
          gradient: 'from-blue-500 to-blue-600', 
          bg: 'bg-blue-500/10', 
          text: 'text-blue-500',
          border: 'border-blue-500/30'
        };
      case 'pending': 
        return { 
          label: 'Pending', 
          gradient: 'from-amber-500 to-amber-600', 
          bg: 'bg-amber-500/10', 
          text: 'text-amber-500',
          border: 'border-amber-500/30'
        };
      case 'cancelled': 
        return { 
          label: 'Cancelled', 
          gradient: 'from-red-500 to-red-600', 
          bg: 'bg-red-500/10', 
          text: 'text-red-500',
          border: 'border-red-500/30'
        };
      default: 
        return { 
          label: status, 
          gradient: 'from-muted to-muted', 
          bg: 'bg-muted', 
          text: 'text-muted-foreground',
          border: 'border-muted'
        };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const completedOrders = liveOrders.filter(o => o.status === 'completed').length;
  const conversionRate = stats.totalOrders > 0 
    ? ((completedOrders / stats.totalOrders) * 100) 
    : 0;

  const statsData = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      change: changes.revenue.value,
      trend: changes.revenue.trend,
      icon: DollarSign,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-500",
      href: "/panel/analytics"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: changes.orders.value,
      trend: changes.orders.trend,
      icon: ShoppingCart,
      gradient: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-500",
      href: "/panel/orders"
    },
    {
      title: "Active Users",
      value: stats.totalCustomers.toLocaleString(),
      change: changes.customers.value,
      trend: changes.customers.trend,
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-500",
      href: "/panel/customers"
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(0)}%`,
      change: changes.orders.value,
      trend: changes.orders.trend,
      icon: Percent,
      gradient: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-500",
      href: "/panel/analytics"
    },
  ];

  const storefrontUrl = panelData?.custom_domain 
    ? `https://${panelData.custom_domain}`
    : panelData?.subdomain 
      ? `https://${panelData.subdomain}.smmpilot.online`
      : '/';

  const quickActions = [
    { title: "Integrations", icon: Plug, href: "/panel/integrations", gradient: "from-blue-500 to-blue-600", bg: "bg-blue-500/10" },
    { title: "Analytics", icon: BarChart3, href: "/panel/analytics", gradient: "from-emerald-500 to-emerald-600", bg: "bg-emerald-500/10" },
    { title: "Providers", icon: Activity, href: "/panel/providers", gradient: "from-violet-500 to-violet-600", bg: "bg-violet-500/10" },
    { title: "Design", icon: Palette, href: "/panel/design", gradient: "from-pink-500 to-pink-600", bg: "bg-pink-500/10" },
    { title: "Domain", icon: Globe, href: "/panel/domain", gradient: "from-amber-500 to-amber-600", bg: "bg-amber-500/10" },
    { title: "Settings", icon: Settings, href: "/panel/settings", gradient: "from-slate-500 to-slate-600", bg: "bg-slate-500/10" },
  ];

  // Kanban columns for orders
  const kanbanColumns = [
    { title: 'Pending', status: 'pending', icon: Clock, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', textColor: 'text-amber-500', borderColor: 'border-amber-500/30' },
    { title: 'In Progress', status: 'in_progress', icon: Loader2, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', textColor: 'text-blue-500', borderColor: 'border-blue-500/30' },
    { title: 'Completed', status: 'completed', icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', textColor: 'text-emerald-500', borderColor: 'border-emerald-500/30' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

      {/* Enhanced Welcome Header with Stacked Cards Effect */}
      <div className="relative isolate pt-6 sm:pt-8">
        {/* Stack card 2 (furthest back) - visible at top */}
        <div 
          className="absolute left-6 right-6 sm:left-8 sm:right-8 md:left-10 md:right-10 top-0 h-6 sm:h-8 rounded-t-xl sm:rounded-t-2xl bg-card/60 dark:bg-card/40 border border-b-0 border-border/40 dark:border-blue-500/30 shadow-sm backdrop-blur-sm pointer-events-none"
          style={{ zIndex: 1 }}
          aria-hidden="true"
        />
        
        {/* Stack card 1 (middle) - visible at top */}
        <div 
          className="absolute left-3 right-3 sm:left-4 sm:right-4 md:left-5 md:right-5 top-2 sm:top-3 h-6 sm:h-8 rounded-t-xl sm:rounded-t-2xl bg-card/80 dark:bg-card/60 border border-b-0 border-border/50 dark:border-blue-500/40 shadow-md backdrop-blur-md pointer-events-none"
          style={{ zIndex: 2 }}
          aria-hidden="true"
        />
        
        {/* Main card */}
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-border shadow-lg mt-4 sm:mt-6" style={{ zIndex: 3 }}>
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-primary/5" />
        
        {/* Animated glow orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-primary/10 rounded-full blur-3xl" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} 
        />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left side - Branding & Info */}
            <div className="flex items-start gap-4">
              {/* Panel Logo/Icon */}
              {(panelData?.custom_branding as any)?.faviconUrl || panelData?.logo_url ? (
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-2xl shadow-primary/30 ring-2 ring-primary/20">
                    <img 
                      src={(panelData?.custom_branding as any)?.faviconUrl || panelData?.logo_url} 
                      alt="Panel Icon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Active indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/30 ring-2 ring-primary/20">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
              
              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Welcome back!
                  </h1>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                  </motion.div>
                </div>
                <p className="text-sm md:text-base text-muted-foreground">
                  Manage <span className="font-semibold text-foreground">{panelData?.name || 'your panel'}</span> and track performance
                </p>
                
                {/* Status Badges */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/30 gap-1.5 px-3 py-1">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium">{panelData?.subdomain}.smmpilot.online</span>
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "gap-1.5 px-3 py-1 backdrop-blur-sm",
                      panelData?.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    )}
                  >
                    {panelData?.status === 'active' ? <Zap className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span className="text-xs font-medium">{panelData?.status === 'active' ? 'Active' : panelData?.status}</span>
                  </Badge>
                  <Badge variant="outline" className="gap-1.5 px-3 py-1 bg-background/50 backdrop-blur-sm">
                    <div className={cn(
                      "w-2 h-2 rounded-full", 
                      isLive ? "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-amber-500 animate-pulse"
                    )} />
                    <span className="text-xs font-medium">{isLive ? 'Live' : 'Connecting'}</span>
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Right side - Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start lg:self-center">
              {/* Panel Balance */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Wallet className="w-4 h-4 text-emerald-500" />
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground leading-none">Panel Balance</p>
                  <p className="text-sm font-bold text-emerald-500">${panelData?.balance?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              {/* Plan Badge */}
              <Badge 
                variant="outline" 
                className="gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/30"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium capitalize">{subscription?.plan_type || 'Free'} Plan</span>
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/panel/payment-methods')}
                className="gap-1.5 bg-background/50 backdrop-blur-sm hover:bg-primary/10 border-primary/30"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden md:inline">Payments</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/panel/billing')}
                className="gap-1.5 bg-background/50 backdrop-blur-sm hover:bg-amber-500/10 border-amber-500/30"
              >
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="hidden md:inline">Billing</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="gap-1.5 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-border/50"
              >
                <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                <span className="hidden lg:inline">Refresh</span>
              </Button>
              <Button 
                size="sm"
                onClick={handleViewPanel}
                className="gap-1.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">View Panel</span>
              </Button>
            </div>
          </div>
        </div>
        </motion.div>
      </div>

      {/* Stats Grid - Modern Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={stat.href}>
                <Card className="glass-card-hover relative overflow-hidden group h-full cursor-pointer">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", stat.gradient)} />
                  <CardContent className="p-4 md:p-5 relative">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                        <p className="text-xl md:text-2xl lg:text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={cn("p-2 md:p-3 rounded-xl bg-gradient-to-br shadow-lg", stat.gradient)}>
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                        stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : stat.trend === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-muted text-muted-foreground'
                      )}>
                        {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : stat.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {stat.change}
                      </div>
                      <span className="text-[10px] text-muted-foreground">vs last period</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Link to={action.href}>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3 md:py-4 w-full flex-col gap-2 group hover:border-primary/50 bg-card/50"
                  >
                    <div className={cn("p-2 rounded-lg bg-gradient-to-br transition-transform group-hover:scale-110", action.gradient)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-[10px] md:text-xs">{action.title}</span>
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Orders Kanban Board */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Radio className={cn("w-4 h-4", isLive && "text-emerald-500")} />
              Live Orders
            </h2>
            <span className="text-xs text-muted-foreground">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link to="/panel/orders">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Desktop: 3 Column Kanban */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {kanbanColumns.map((column) => {
            const columnOrders = liveOrders.filter(o => o.status === column.status);
            const Icon = column.icon;

            return (
              <div key={column.status} className="space-y-3">
                {/* Column Header */}
                <div className={cn("glass-card p-3 border-l-4", column.borderColor)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl bg-gradient-to-br", column.gradient)}>
                        <Icon className={cn("w-4 h-4 text-white", column.status === 'in_progress' && "animate-spin")} />
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{column.title}</span>
                        <p className="text-xs text-muted-foreground">{columnOrders.length} orders</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("font-bold text-sm", column.bg, column.textColor)}>
                      {columnOrders.length}
                    </Badge>
                  </div>
                </div>

                {/* Column Items */}
                <ScrollArea className="h-[320px]">
                  <div className="space-y-2 pr-2">
                    <AnimatePresence mode="popLayout">
                      {columnOrders.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                          <div className={cn("w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center", column.bg)}>
                            <Icon className={cn("w-6 h-6", column.textColor)} />
                          </div>
                          <p className="text-sm text-muted-foreground">No {column.title.toLowerCase()} orders</p>
                        </div>
                      ) : (
                        columnOrders.slice(0, 5).map((order, idx) => {
                          const statusConfig = getStatusConfig(order.status);
                          return (
                            <motion.div
                              key={order.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ delay: idx * 0.03 }}
                              className="glass-card p-3 hover:bg-accent/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", statusConfig.bg)}>
                                  <Package className={cn("w-4 h-4", statusConfig.text)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{order.order_number}</p>
                                  <p className="text-xs text-muted-foreground truncate">{order.target_url || 'No target'}</p>
                                </div>
                                <span className="text-sm font-bold">${Number(order.price).toFixed(2)}</span>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>

        {/* Mobile: Horizontal Scroll Kanban */}
        <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {kanbanColumns.map((column) => {
              const columnOrders = liveOrders.filter(o => o.status === column.status);
              const Icon = column.icon;

              return (
                <div key={column.status} className="w-[85vw] max-w-[320px] shrink-0 snap-center space-y-3">
                  {/* Column Header */}
                  <div className={cn("glass-card p-3 border-l-4", column.borderColor)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-xl bg-gradient-to-br", column.gradient)}>
                          <Icon className={cn("w-4 h-4 text-white", column.status === 'in_progress' && "animate-spin")} />
                        </div>
                        <span className="font-semibold text-sm">{column.title}</span>
                      </div>
                      <Badge variant="outline" className={cn(column.bg, column.textColor)}>
                        {columnOrders.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Items */}
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                    {columnOrders.length === 0 ? (
                      <div className="glass-card p-6 text-center">
                        <div className={cn("w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center", column.bg)}>
                          <Icon className={cn("w-5 h-5", column.textColor)} />
                        </div>
                        <p className="text-xs text-muted-foreground">No orders</p>
                      </div>
                    ) : (
                      columnOrders.slice(0, 5).map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        return (
                          <div key={order.id} className="glass-card p-3">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-lg", statusConfig.bg)}>
                                <Package className={cn("w-4 h-4", statusConfig.text)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{order.order_number}</p>
                                <p className="text-xs text-muted-foreground truncate">{order.target_url || 'No target'}</p>
                              </div>
                              <span className="text-sm font-bold">${Number(order.price).toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Panel Status & Performance - Two Column Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Panel Status Card */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Panel Status
            </CardTitle>
            <CardDescription>Current configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">Status</span>
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
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-sm">Commission</span>
              </div>
              <span className="text-sm font-semibold">{panelData?.commission_rate || 5}%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Palette className="w-4 h-4 text-violet-500" />
                </div>
                <span className="text-sm">Buyer Theme</span>
              </div>
              <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">
                {(() => {
                  const themeLabels: Record<string, string> = {
                    default: 'Default Theme',
                    dark_gradient: 'Default Theme',
                    theme_one: 'Default Theme',
                    alipanel: 'AliPanel Style',
                    theme_alipanel: 'AliPanel Style',
                    flysmm: 'FlySMM Style',
                    theme_flysmm: 'FlySMM Style',
                    smmstay: 'SMMStay Style',
                    theme_smmstay: 'SMMStay Style',
                    tgref: 'TGRef Style',
                    theme_tgref: 'TGRef Style',
                    smmvisit: 'SMMVisit Style',
                    theme_smmvisit: 'SMMVisit Style',
                  };
                  // Check multiple sources in priority order
                  const customBranding = panelData?.custom_branding as any;
                  const panelSettings = panelData?.panel_settings as any;
                  const selectedTheme = 
                    customBranding?.selectedTheme || 
                    panelData?.buyer_theme || 
                    panelSettings?.buyer_theme || 
                    'default';
                  return themeLabels[selectedTheme] || 'Default Theme';
                })()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview Card - Enhanced */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Performance
            </CardTitle>
            <CardDescription>Key metrics overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Stats Grid - Enhanced */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-accent/30 border border-border/50">
                <span className="text-xs text-muted-foreground">Today's Orders</span>
                <p className="text-lg font-bold">{stats.todayOrders.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30 border border-border/50">
                <span className="text-xs text-muted-foreground">Today's Revenue</span>
                <p className="text-lg font-bold text-emerald-500">${stats.todayRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30 border border-border/50">
                <span className="text-xs text-muted-foreground">Avg Order Value</span>
                <p className="text-lg font-bold">${(stats.totalRevenue / Math.max(stats.totalOrders, 1)).toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30 border border-border/50">
                <span className="text-xs text-muted-foreground">Revenue Growth</span>
                <p className="text-lg font-bold flex items-center gap-1">
                  {changes.revenue.trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                  {changes.revenue.value}
                </p>
              </div>
            </div>
            
            {/* Top Service Today */}
            {stats.topServiceToday && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                <span className="text-xs text-muted-foreground">Top Service Today</span>
                <p className="text-sm font-semibold text-primary truncate">{stats.topServiceToday}</p>
              </div>
            )}
            
            {/* Progress Bars */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Order Completion Rate</span>
                <span className="text-sm font-semibold">
                  {stats.totalOrders > 0 ? Math.round((liveOrders.filter(o => o.status === 'completed').length / Math.max(liveOrders.length, 1)) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all" 
                  style={{ width: `${stats.totalOrders > 0 ? Math.round((liveOrders.filter(o => o.status === 'completed').length / Math.max(liveOrders.length, 1)) * 100) : 0}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Active Services</span>
                <span className="text-sm font-semibold">{stats.activeServices.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" 
                  style={{ width: `${Math.min((stats.activeServices / 100) * 10, 100)}%` }} 
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Customer Base</span>
                <span className="text-sm font-semibold">{stats.totalCustomers.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full" 
                  style={{ width: `${Math.min(stats.totalCustomers * 2, 100)}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subdomain Preview */}
      {panelData?.subdomain && (
        <motion.div variants={itemVariants}>
          <SubdomainPreview
            subdomain={panelData.subdomain}
            panelName={panelData.name || 'Your Panel'}
            primaryColor={panelData.primary_color}
            secondaryColor={panelData.secondary_color}
            panelStatus={panelData.status as 'active' | 'pending' | 'suspended'}
            onRefresh={handleManualRefresh}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default PanelOverview;
