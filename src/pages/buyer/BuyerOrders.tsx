import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  Search,
  Clock,
  CheckCircle,
  Loader2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant } from "@/hooks/useTenant";
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

const BuyerOrders = () => {
  const { panel } = useTenant();
  const { buyer } = useBuyerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (buyer?.id) {
      fetchOrders();
    }
  }, [buyer?.id]);

  const fetchOrders = async () => {
    if (!buyer?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          service:services(name)
        `)
        .eq('buyer_id', buyer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: Order[] = (data || []).map(o => ({
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

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { label: string; icon: any; color: string; spin?: boolean }> = {
    pending: { label: 'Pending', icon: Clock, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    in_progress: { label: 'In Progress', icon: Loader2, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', spin: true },
    completed: { label: 'Completed', icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    partial: { label: 'Partial', icon: AlertCircle, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.service?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const kanbanColumns = [
    { title: 'Pending', status: 'pending', icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', textColor: 'text-amber-500' },
    { title: 'In Progress', status: 'in_progress', icon: Loader2, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', textColor: 'text-blue-500' },
    { title: 'Completed', status: 'completed', icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', textColor: 'text-emerald-500' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <BuyerLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your service orders</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = orders.filter(o => o.status === status).length;
            const Icon = config.icon;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                className={cn(
                  "glass-card p-3 text-left transition-all",
                  statusFilter === status && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg", config.color.split(' ')[0])}>
                    <Icon className={cn("w-4 h-4", config.spin && "animate-spin")} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-[10px] text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or service..."
            className="pl-9 bg-card/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        {/* Kanban View */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kanbanColumns.map((column) => {
              const columnOrders = filteredOrders.filter(o => o.status === column.status);
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
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {loading ? (
                      [1, 2].map(i => (
                        <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
                      ))
                    ) : columnOrders.length === 0 ? (
                      <div className="glass-card p-6 text-center">
                        <Icon className={cn("w-8 h-8 mx-auto mb-2", column.textColor)} />
                        <p className="text-sm text-muted-foreground">No {column.title.toLowerCase()} orders</p>
                      </div>
                    ) : (
                      columnOrders.map((order) => {
                        const config = statusConfig[order.status];
                        const StatusIcon = config?.icon || Clock;

                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card-hover p-3 space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{order.service?.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{order.order_number}</p>
                              </div>
                            </div>

                            <a 
                              href={order.target_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline truncate block flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{order.target_url}</span>
                            </a>

                            {order.status === 'in_progress' && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span>{order.progress}%</span>
                                </div>
                                <Progress value={order.progress} className="h-1.5" />
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                              <span className="text-muted-foreground">{order.quantity.toLocaleString()} qty</span>
                              <span className="font-medium">${order.price.toFixed(2)}</span>
                            </div>

                            <p className="text-[10px] text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
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

        {/* Other status orders (cancelled, partial, refunded) */}
        {filteredOrders.filter(o => !['pending', 'in_progress', 'completed'].includes(o.status)).length > 0 && (
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-3">Other Orders</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredOrders
                .filter(o => !['pending', 'in_progress', 'completed'].includes(o.status))
                .map((order) => {
                  const config = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <Card key={order.id} className="glass-card-hover">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{order.service?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{order.order_number}</p>
                          </div>
                          <Badge variant="outline" className={config.color}>
                            <StatusIcon className={cn("w-3 h-3 mr-1", config.spin && "animate-spin")} />
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{order.quantity.toLocaleString()} qty</span>
                          <span className="font-medium">${order.price.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerOrders;
