import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Bell,
  Gift,
  History,
  CreditCard,
  ExternalLink,
  Users,
  Activity,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant, useTenantServices } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import BuyerLayout from "./BuyerLayout";

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
  const { panel } = useTenant();
  const { buyer } = useBuyerAuth();
  const { services, loading: servicesLoading } = useTenantServices(panel?.id);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (buyer?.id && panel?.id) {
      fetchBuyerData();
    }
  }, [buyer?.id, panel?.id]);

  const fetchBuyerData = async () => {
    if (!buyer?.id) return;

    setLoading(true);
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
    } catch (error) {
      console.error('Error fetching buyer data:', error);
    } finally {
      setLoading(false);
    }
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
        return { label: 'Completed', icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', text: 'text-emerald-500' };
      case 'in_progress':
        return { label: 'In Progress', icon: Loader2, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', text: 'text-blue-500', spin: true };
      case 'pending':
        return { label: 'Pending', icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', text: 'text-amber-500' };
      default:
        return { label: status, icon: Clock, color: 'from-muted to-muted', bg: 'bg-muted', text: 'text-muted-foreground' };
    }
  };

  const balance = buyer?.balance || 0;

  const statsCards = [
    { 
      title: 'Balance', 
      value: `$${balance.toFixed(2)}`, 
      icon: Wallet, 
      color: 'from-emerald-500 to-emerald-600', 
      bg: 'bg-emerald-500/10',
      action: { label: 'Add Funds', href: '/deposit' }
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingCart, 
      color: 'from-blue-500 to-blue-600', 
      bg: 'bg-blue-500/10',
      action: { label: 'View All', href: '/orders' }
    },
    { 
      title: 'Pending', 
      value: stats.pendingOrders, 
      icon: Clock, 
      color: 'from-amber-500 to-amber-600', 
      bg: 'bg-amber-500/10' 
    },
    { 
      title: 'Completed', 
      value: stats.completedOrders, 
      icon: CheckCircle, 
      color: 'from-violet-500 to-violet-600', 
      bg: 'bg-violet-500/10' 
    },
  ];

  const kanbanColumns = [
    { title: 'Pending', status: 'pending', icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', textColor: 'text-amber-500', borderColor: 'border-amber-500/20' },
    { title: 'In Progress', status: 'in_progress', icon: Loader2, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', textColor: 'text-blue-500', borderColor: 'border-blue-500/20' },
    { title: 'Completed', status: 'completed', icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', textColor: 'text-emerald-500', borderColor: 'border-emerald-500/20' },
  ];

  const quickActions = [
    { name: 'New Order', icon: Package, href: '/services', color: 'from-blue-500 to-blue-600' },
    { name: 'My Orders', icon: ShoppingCart, href: '/orders', color: 'from-violet-500 to-violet-600' },
    { name: 'Add Funds', icon: CreditCard, href: '/deposit', color: 'from-emerald-500 to-emerald-600' },
    { name: 'Support', icon: Zap, href: '/support', color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <BuyerLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, {buyer?.full_name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-muted-foreground">Here's your account overview</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders" className="gap-2">
                <History className="w-4 h-4" />
                Order History
              </Link>
            </Button>
            <Button size="sm" asChild className="gap-2">
              <Link to="/services">
                <Package className="w-4 h-4" />
                New Order
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card-hover relative overflow-hidden group">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", stat.color)} />
                  <CardContent className="p-4 md:p-6 relative">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={cn("p-3 rounded-xl bg-gradient-to-br", stat.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {stat.action && (
                      <Link 
                        to={stat.action.href} 
                        className="inline-flex items-center gap-1 text-xs text-primary mt-3 hover:underline"
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

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    className="h-auto py-4 w-full flex-col gap-2 group hover:border-primary/50"
                  >
                    <Link to={action.href}>
                      <div className={cn("p-2 rounded-lg bg-gradient-to-br transition-transform group-hover:scale-110", action.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium">{action.name}</span>
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Orders Kanban Board */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Orders
            </h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kanbanColumns.map((column) => {
              const columnOrders = recentOrders.filter(o => o.status === column.status);
              const Icon = column.icon;

              return (
                <div key={column.status} className="space-y-3">
                  {/* Column Header */}
                  <div className={cn("glass-card p-4 border-l-4", column.borderColor)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl bg-gradient-to-br", column.color)}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold">{column.title}</span>
                          <p className="text-xs text-muted-foreground">{columnOrders.length} orders</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("font-bold", column.bg, column.textColor)}>
                        {columnOrders.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Items */}
                  <div className="space-y-2 min-h-[200px]">
                    {loading ? (
                      <div className="space-y-2">
                        {[1, 2].map(i => (
                          <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : columnOrders.length === 0 ? (
                      <div className="glass-card p-8 text-center">
                        <div className={cn("w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center", column.bg)}>
                          <Icon className={cn("w-6 h-6", column.textColor)} />
                        </div>
                        <p className="text-sm text-muted-foreground">No {column.title.toLowerCase()} orders</p>
                      </div>
                    ) : (
                      columnOrders.slice(0, 4).map((order, idx) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card-hover p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">{order.service?.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground font-mono">{order.order_number}</p>
                              </div>
                              <Badge variant="outline" className={cn("text-[10px] shrink-0", statusConfig.bg, statusConfig.text)}>
                                <StatusIcon className={cn("w-3 h-3 mr-1", statusConfig.spin && "animate-spin")} />
                                {statusConfig.label}
                              </Badge>
                            </div>

                            {order.target_url && (
                              <a 
                                href={order.target_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline truncate flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{order.target_url}</span>
                              </a>
                            )}

                            {order.status === 'in_progress' && (
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{order.progress}%</span>
                                </div>
                                <Progress value={order.progress} className="h-2" />
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                              <span className="text-muted-foreground">{order.quantity.toLocaleString()} qty</span>
                              <span className="font-bold">${order.price.toFixed(2)}</span>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Popular Services */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Popular Services
            </h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/services" className="gap-2">
                Browse All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicesLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
              ))
            ) : services.slice(0, 6).map((service: any, idx: number) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass-card-hover group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-semibold truncate">{service.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{service.category}</p>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 shrink-0">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Popular
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {service.description || 'High quality service with fast delivery'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">${service.price}</span>
                        <span className="text-xs text-muted-foreground"> /1K</span>
                      </div>
                      <Button size="sm" asChild className="group-hover:scale-105 transition-transform">
                        <Link to={`/services?service=${service.id}`}>
                          Order Now
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity & Promotions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                ))
              ) : recentOrders.slice(0, 5).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentOrders.slice(0, 5).map((order) => {
                  const config = getStatusConfig(order.status);
                  const Icon = config.icon;
                  return (
                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className={cn("p-2 rounded-lg", config.bg)}>
                        <Icon className={cn("w-4 h-4", config.text, config.spin && "animate-spin")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{order.service?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-bold">${order.price.toFixed(2)}</span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Promotions */}
          <Card className="glass-card overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
            <CardContent className="p-6 relative">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">Special Offer! 🎉</h3>
                  <p className="text-muted-foreground mb-4">
                    Get 10% off on your next order when you add $50 or more to your balance.
                  </p>
                  <Button asChild>
                    <Link to="/deposit" className="gap-2">
                      <CreditCard className="w-4 h-4" />
                      Add Funds Now
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerDashboard;
