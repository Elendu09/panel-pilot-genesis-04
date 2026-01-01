import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ShoppingCart, 
  Package, 
  Wallet, 
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  ArrowRight,
  Zap,
  Star,
  History,
  CreditCard,
  ExternalLink,
  Activity,
  ChevronRight,
  AlertTriangle,
  Mail,
  X,
  BadgeCheck,
  ClipboardList
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant, useTenantServices } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import BuyerLayout from "./BuyerLayout";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Order {
  id: string;
  order_number: string;
  target_url: string;
  quantity: number;
  price: number;
  status: string;
  progress: number;
  created_at: string;
  service?: { name: string } | null;
}

const BuyerDashboard = () => {
  const { panel, loading: panelLoading } = useTenant();
  const { buyer, loading: authLoading } = useBuyerAuth();
  const { services, loading: servicesLoading } = useTenantServices(panel?.id);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);

  useEffect(() => {
    if (buyer?.id && panel?.id) {
      fetchBuyerData();
    } else if (!authLoading && !panelLoading) {
      setLoading(false);
    }
  }, [buyer?.id, panel?.id, authLoading, panelLoading]);

  useEffect(() => {
    if (!buyer) return;
    const key = `buyer_verify_dismissed_${buyer.id}`;
    if (!localStorage.getItem(key)) {
      setShowVerifyBanner(true);
    }
  }, [buyer?.id]);

  const fetchBuyerData = async () => {
    if (!buyer?.id) return;

    setLoading(true);
    setError(null);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          service:services(name)
        `)
        .eq('buyer_id', buyer.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedOrders: Order[] = (orders || []).map(o => ({
        id: o.id,
        order_number: o.order_number,
        target_url: o.target_url,
        quantity: o.quantity,
        price: o.price,
        status: o.status || 'pending',
        progress: o.progress || 0,
        created_at: o.created_at,
        service: o.service,
      }));

      setRecentOrders(formattedOrders);

      const totalOrders = formattedOrders.length;
      const pendingOrders = formattedOrders.filter(o => o.status === 'pending').length;
      const inProgressOrders = formattedOrders.filter(o => o.status === 'in_progress').length;
      const completedOrders = formattedOrders.filter(o => o.status === 'completed').length;
      const totalSpent = buyer.total_spent || 0;

      setStats({
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        totalSpent,
      });
    } catch (error: any) {
      console.error('Error fetching buyer data:', error);
      setError('We had trouble loading your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    if (!buyer?.email || !panel?.id) return;
    try {
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: { panelId: panel.id, email: buyer.email, action: 'forgot-password' },
      });
      if (error || data?.error) {
        toast({ title: 'Could not send email', description: data?.error || 'Please try again later.', variant: 'destructive' });
        return;
      }
      toast({ title: t('dashboard.verification_sent'), description: t('dashboard.check_inbox') });
    } catch (err: any) {
      console.error('Verification send error', err);
    }
  };

  const handleDismissVerifyBanner = () => {
    if (!buyer) return;
    const key = `buyer_verify_dismissed_${buyer.id}`;
    localStorage.setItem(key, '1');
    setShowVerifyBanner(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' };
      case 'in_progress':
        return { label: 'In Progress', icon: Loader2, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30', spin: true };
      case 'pending':
        return { label: 'Pending', icon: Clock, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' };
      default:
        return { label: status, icon: Clock, gradient: 'from-muted to-muted', bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-muted' };
    }
  };

  const balance = buyer?.balance || 0;

  const statsCards = [
    { 
      title: t('dashboard.balance'), 
      value: `$${balance.toFixed(2)}`, 
      icon: Wallet, 
      gradient: 'from-emerald-500 to-emerald-600', 
      bg: 'bg-emerald-500/10',
      action: { label: t('nav.deposit'), href: '/deposit' }
    },
    { 
      title: t('dashboard.total_orders'), 
      value: stats.totalOrders, 
      icon: ShoppingCart, 
      gradient: 'from-blue-500 to-blue-600', 
      bg: 'bg-blue-500/10',
      action: { label: t('common.view_all'), href: '/orders' }
    },
    { 
      title: t('dashboard.pending'), 
      value: stats.pendingOrders, 
      icon: Clock, 
      gradient: 'from-amber-500 to-amber-600', 
      bg: 'bg-amber-500/10' 
    },
    { 
      title: t('dashboard.completed'), 
      value: stats.completedOrders, 
      icon: CheckCircle, 
      gradient: 'from-violet-500 to-violet-600', 
      bg: 'bg-violet-500/10' 
    },
  ];

  const kanbanColumns = [
    { title: t('dashboard.pending'), status: 'pending', icon: Clock, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', textColor: 'text-amber-500', borderColor: 'border-amber-500/30' },
    { title: t('dashboard.in_progress'), status: 'in_progress', icon: Loader2, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', textColor: 'text-blue-500', borderColor: 'border-blue-500/30' },
    { title: t('dashboard.completed'), status: 'completed', icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', textColor: 'text-emerald-500', borderColor: 'border-emerald-500/30' },
  ];

  const quickActions = [
    { name: t('nav.orders'), icon: ClipboardList, href: '/orders', gradient: 'from-blue-500 to-blue-600' },
    { name: t('nav.new_order'), icon: Package, href: '/services', gradient: 'from-violet-500 to-violet-600' },
    { name: t('nav.deposit'), icon: CreditCard, href: '/deposit', gradient: 'from-emerald-500 to-emerald-600' },
    { name: t('nav.support'), icon: Zap, href: '/support', gradient: 'from-amber-500 to-amber-600' },
  ];

  // Show loading state while auth/panel is being determined
  if (panelLoading || authLoading) {
    return (
      <BuyerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </BuyerLayout>
    );
  }

  // Show login prompt if no buyer after loading
  if (!buyer) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t('auth.please_sign_in')}</h2>
          <p className="text-muted-foreground mb-6">{t('auth.need_login')}</p>
          <Button asChild>
            <Link to="/auth">{t('auth.sign_in')}</Link>
          </Button>
        </div>
      </BuyerLayout>
    );
  }

  // Show error state if data fetch failed
  if (error) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t('error.dashboard_unavailable')}</h2>
          <p className="text-muted-foreground mb-4 text-sm max-w-md">{error}</p>
          <Button onClick={fetchBuyerData}>
            {t('common.retry')}
          </Button>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 md:space-y-6"
      >
        {/* Compact Email Verification Banner - Blue theme */}
        {showVerifyBanner && (
          <motion.div
            variants={itemVariants}
            className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Mail className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {t('dashboard.verify_email')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={handleSendVerification}
                className="h-7 px-3 bg-blue-500 hover:bg-blue-600 text-white text-xs"
              >
                {t('common.send')}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDismissVerifyBanner}
                className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Welcome Header with Verified Badge */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2">
              {t('dashboard.welcome')}{buyer?.full_name ? `, ${buyer.full_name.split(' ')[0]}` : ''}! 👋
              {/* Facebook-style blue checkmark for verified users */}
              {!showVerifyBanner && (
                <BadgeCheck className="w-5 h-5 md:w-6 md:h-6 text-blue-500 fill-blue-500/20" />
              )}
            </h1>
            <p className="text-sm text-muted-foreground">{t('dashboard.overview')}</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to="/services">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.new_order')}</span>
              </Link>
            </Button>
            <Button size="sm" asChild className="gap-2">
              <Link to="/orders">
                <ClipboardList className="w-4 h-4" />
                {t('nav.orders')}
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid - Mobile: 2x2, Desktop: 4 cols */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card-hover relative overflow-hidden group h-full">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", stat.gradient)} />
                  <CardContent className="p-3 md:p-4 lg:p-6 relative">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] md:text-xs text-muted-foreground">{stat.title}</p>
                        <p className="text-lg md:text-2xl lg:text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={cn("p-2 md:p-3 rounded-xl bg-gradient-to-br", stat.gradient)}>
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                    </div>
                    {stat.action && (
                      <Link 
                        to={stat.action.href} 
                        className="inline-flex items-center gap-1 text-[10px] md:text-xs text-primary mt-2 md:mt-3 hover:underline"
                      >
                        {stat.action.label}
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions - Mobile: 2x2, Desktop: 4 cols */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-auto py-3 md:py-4 w-full flex-col gap-1.5 md:gap-2 group hover:border-primary/50"
                  >
                    <Link to={action.href}>
                      <div className={cn("p-1.5 md:p-2 rounded-lg bg-gradient-to-br transition-transform group-hover:scale-110", action.gradient)}>
                        <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                      <span className="font-medium text-xs md:text-sm">{action.name}</span>
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Orders Kanban Board */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              {t('dashboard.recent_orders')}
            </h2>
            <Button variant="outline" size="sm" asChild className="text-xs md:text-sm">
              <Link to="/orders" className="gap-1 md:gap-2">
                {t('common.view_all')} <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </Link>
            </Button>
          </div>

          {/* Desktop/Tablet: Grid layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {kanbanColumns.map((column) => {
              const columnOrders = recentOrders.filter(o => o.status === column.status);
              const Icon = column.icon;

              return (
                <div key={column.status} className="space-y-3">
                  {/* Column Header */}
                  <div className={cn("glass-card p-3 md:p-4 border-l-4", column.borderColor)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className={cn("p-1.5 md:p-2 rounded-xl bg-gradient-to-br", column.gradient)}>
                          <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm md:text-base">{column.title}</span>
                          <p className="text-[10px] md:text-xs text-muted-foreground">{columnOrders.length} orders</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("font-bold text-xs md:text-sm", column.bg, column.textColor)}>
                        {columnOrders.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Items */}
                  <ScrollArea className="h-[300px] md:h-[350px]">
                    <div className="space-y-2 pr-2">
                      {loading ? (
                        [1, 2].map(i => (
                          <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                        ))
                      ) : columnOrders.length === 0 ? (
                        <div className="glass-card p-6 md:p-8 text-center">
                          <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-full mx-auto mb-2 md:mb-3 flex items-center justify-center", column.bg)}>
                            <Icon className={cn("w-5 h-5 md:w-6 md:h-6", column.textColor)} />
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground">No {column.title.toLowerCase()} orders</p>
                        </div>
                      ) : (
                        columnOrders.slice(0, 4).map((order, idx) => (
                          <OrderCard key={order.id} order={order} getStatusConfig={getStatusConfig} />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>

          {/* Mobile: Horizontal scroll kanban */}
          <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
            <div className="flex gap-4" style={{ width: 'max-content' }}>
              {kanbanColumns.map((column) => {
                const columnOrders = recentOrders.filter(o => o.status === column.status);
                const Icon = column.icon;

                return (
                  <div key={column.status} className="w-[85vw] max-w-[320px] shrink-0 snap-center space-y-3">
                    {/* Column Header */}
                    <div className={cn("glass-card p-3 border-l-4", column.borderColor)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-xl bg-gradient-to-br", column.gradient)}>
                            <Icon className="w-4 h-4 text-white" />
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
                      {loading ? (
                        [1, 2].map(i => (
                          <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                        ))
                      ) : columnOrders.length === 0 ? (
                        <div className="glass-card p-6 text-center">
                          <div className={cn("w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center", column.bg)}>
                            <Icon className={cn("w-5 h-5", column.textColor)} />
                          </div>
                          <p className="text-xs text-muted-foreground">No orders</p>
                        </div>
                      ) : (
                        columnOrders.slice(0, 4).map((order) => (
                          <OrderCard key={order.id} order={order} getStatusConfig={getStatusConfig} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Popular Services */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
              Popular Services
            </h2>
            <Button variant="outline" size="sm" asChild className="text-xs md:text-sm">
              <Link to="/services" className="gap-1 md:gap-2">
                Browse All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {servicesLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-28 md:h-32 bg-muted/50 rounded-xl animate-pulse" />
              ))
            ) : services.slice(0, 6).map((service: any, idx: number) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card-hover group h-full">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-semibold text-sm md:text-base truncate">{service.name}</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground capitalize">{service.category}</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 shrink-0 text-[10px] md:text-xs">
                        <Star className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 fill-amber-500" />
                        Popular
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg md:text-xl font-bold">${service.price.toFixed(2)}</span>
                        <span className="text-[10px] md:text-xs text-muted-foreground">/1K</span>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1 md:gap-2 h-7 md:h-8 text-xs" asChild>
                        <Link to="/services">
                          Order <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </BuyerLayout>
  );
};

// Order Card Component
const OrderCard = ({ order, getStatusConfig }: { order: Order; getStatusConfig: (status: string) => any }) => {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-hover p-3 md:p-4 space-y-2 md:space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-xs md:text-sm truncate">{order.service?.name || 'Unknown'}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground font-mono">{order.order_number}</p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] shrink-0", statusConfig.bg, statusConfig.text)}>
          <StatusIcon className={cn("w-2.5 h-2.5 md:w-3 md:h-3 mr-1", statusConfig.spin && "animate-spin")} />
          {statusConfig.label}
        </Badge>
      </div>

      {order.target_url && (
        <a 
          href={order.target_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] md:text-xs text-primary hover:underline truncate flex items-center gap-1"
        >
          <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
          <span className="truncate">{order.target_url}</span>
        </a>
      )}

      {order.status === 'in_progress' && (
        <div className="space-y-1 md:space-y-1.5">
          <div className="flex justify-between text-[10px] md:text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{order.progress}%</span>
          </div>
          <Progress value={order.progress} className="h-1.5 md:h-2" />
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] md:text-xs pt-1 md:pt-2 border-t border-border/50">
        <span className="text-muted-foreground">{order.quantity.toLocaleString()} qty</span>
        <span className="font-bold">${order.price.toFixed(2)}</span>
      </div>
    </motion.div>
  );
};

export default BuyerDashboard;
