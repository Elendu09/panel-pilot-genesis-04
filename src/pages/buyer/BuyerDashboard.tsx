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
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant, useTenantServices } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import BuyerLayout from "./BuyerLayout";

const BuyerDashboard = () => {
  const { panel } = useTenant();
  const { services, loading: servicesLoading } = useTenantServices(panel?.id);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    balance: 125.50, // Mock - would come from buyer auth
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In real app, fetch buyer's orders from supabase
    // For now, using mock data
    setRecentOrders([
      { id: 'ORD-001', service: 'Instagram Followers', quantity: 1000, status: 'completed', progress: 100, price: 2.50, date: '2024-12-20' },
      { id: 'ORD-002', service: 'TikTok Likes', quantity: 500, status: 'in_progress', progress: 65, price: 1.50, date: '2024-12-21' },
      { id: 'ORD-003', service: 'YouTube Views', quantity: 5000, status: 'pending', progress: 0, price: 4.00, date: '2024-12-22' },
    ]);
    setStats({
      totalOrders: 15,
      pendingOrders: 2,
      completedOrders: 12,
      totalSpent: 87.50,
      balance: 125.50,
    });
    setLoading(false);
  }, [panel?.id]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
      case 'in_progress':
        return { label: 'In Progress', icon: Loader2, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', spin: true };
      case 'pending':
        return { label: 'Pending', icon: Clock, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
      default:
        return { label: status, icon: Clock, color: 'bg-muted' };
    }
  };

  const statsCards = [
    { title: 'Balance', value: `$${stats.balance.toFixed(2)}`, icon: Wallet, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10' },
    { title: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10' },
    { title: 'Total Spent', value: `$${stats.totalSpent.toFixed(2)}`, icon: TrendingUp, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-500/10' },
  ];

  // Kanban columns for orders
  const orderColumns = [
    { title: 'Pending', status: 'pending', icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', textColor: 'text-amber-500' },
    { title: 'In Progress', status: 'in_progress', icon: Loader2, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', textColor: 'text-blue-500' },
    { title: 'Completed', status: 'completed', icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', textColor: 'text-emerald-500' },
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
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back! 👋</h1>
          <p className="text-muted-foreground">Here's an overview of your orders and services</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="glass-card-hover relative overflow-hidden">
                <div className={cn("absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20", stat.bg)} />
                <CardContent className="p-4 md:p-6 relative">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                      <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button asChild className="h-auto py-4 flex-col gap-2" variant="outline">
            <Link to="/services">
              <Package className="w-6 h-6" />
              <span>New Order</span>
            </Link>
          </Button>
          <Button asChild className="h-auto py-4 flex-col gap-2" variant="outline">
            <Link to="/orders">
              <ShoppingCart className="w-6 h-6" />
              <span>My Orders</span>
            </Link>
          </Button>
          <Button asChild className="h-auto py-4 flex-col gap-2" variant="outline">
            <Link to="/deposit">
              <Wallet className="w-6 h-6" />
              <span>Add Funds</span>
            </Link>
          </Button>
          <Button asChild className="h-auto py-4 flex-col gap-2" variant="outline">
            <Link to="/support">
              <Zap className="w-6 h-6" />
              <span>Support</span>
            </Link>
          </Button>
        </motion.div>

        {/* Orders Kanban View */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {orderColumns.map((column) => {
              const columnOrders = recentOrders.filter(o => o.status === column.status);
              const Icon = column.icon;

              return (
                <div key={column.status} className="space-y-3">
                  {/* Column Header */}
                  <div className="glass-card p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", column.color)}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">{column.title}</span>
                      </div>
                      <Badge variant="outline" className={column.bg}>
                        {columnOrders.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Items */}
                  <div className="space-y-2">
                    {loading ? (
                      <div className="h-20 bg-muted rounded-xl animate-pulse" />
                    ) : columnOrders.length === 0 ? (
                      <div className="glass-card p-4 text-center">
                        <p className="text-sm text-muted-foreground">No orders</p>
                      </div>
                    ) : (
                      columnOrders.map((order) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card-hover p-3 space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm">{order.service}</p>
                                <p className="text-xs text-muted-foreground">{order.id}</p>
                              </div>
                              <Badge variant="outline" className={cn("text-[10px]", statusConfig.color)}>
                                <StatusIcon className={cn("w-3 h-3 mr-1", statusConfig.spin && "animate-spin")} />
                                {statusConfig.label}
                              </Badge>
                            </div>

                            {order.status === 'in_progress' && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span>{order.progress}%</span>
                                </div>
                                <Progress value={order.progress} className="h-1.5" />
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{order.quantity.toLocaleString()} qty</span>
                              <span className="font-medium">${order.price.toFixed(2)}</span>
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
            <h2 className="text-xl font-bold">Popular Services</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/services" className="gap-2">
                Browse All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servicesLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))
            ) : services.slice(0, 6).map((service: any) => (
              <Card key={service.id} className="glass-card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{service.category}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${service.price}</span>
                    <Button size="sm" asChild>
                      <Link to={`/services?service=${service.id}`}>
                        Order Now
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerDashboard;
