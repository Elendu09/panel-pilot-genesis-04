import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Calendar,
  Package,
  ChevronRight,
  Eye,
  Copy,
  Filter,
  AlertTriangle,
  LogIn,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTenant } from "@/hooks/useTenant";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BuyerLayout from "./BuyerLayout";
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
  service_name?: string | null;
  service?: { name: string; display_order?: number; provider_service_id?: string } | null;
}

const BuyerOrders = () => {
  const { panel, loading: panelLoading } = useTenant();
  const { buyer, loading: authLoading } = useBuyerAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (buyer?.id) {
      fetchOrders();
    }
  }, [buyer?.id]);

  useEffect(() => {
    if (!buyer?.id) return;

    const channel = supabase
      .channel(`buyer-orders-${buyer.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `buyer_id=eq.${buyer.id}`,
        },
        (payload: any) => {
          const updated = payload.new;
          setOrders(prev => prev.map(o =>
            o.id === updated.id
              ? { ...o, status: updated.status, progress: updated.progress || o.progress }
              : o
          ));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `buyer_id=eq.${buyer.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buyer?.id]);

  const fetchOrders = async () => {
    if (!buyer?.id) return;

    setLoading(true);
    setError(null);
    try {
      // Use buyer-api edge function to bypass RLS
      const buyerApiKey = buyer.api_key || localStorage.getItem('buyer_api_key') || '';
      
      // Build request body — use __buyer_id_auth__ fallback when no API key
      const requestBody = buyerApiKey
        ? { key: buyerApiKey, action: 'get-orders' }
        : { key: '__buyer_id_auth__', action: 'get-orders', buyerId: buyer.id, panelId: panel?.id };
      
      const { data, error } = await supabase.functions.invoke('buyer-api', {
        body: requestBody
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const ordersData = Array.isArray(data) ? data : [];
      const formattedOrders: Order[] = ordersData.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        target_url: o.target_url,
        quantity: o.quantity,
        price: o.price,
        status: o.status || 'pending',
        progress: o.progress || 0,
        created_at: o.created_at,
        service_name: o.service_name,
        service: o.service,
      }));
      setOrders(formattedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string; spin?: boolean }> = {
    pending: { label: t('orders.pending'), icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/20' },
    processing: { label: 'Processing', icon: Loader2, color: 'text-blue-500', bgColor: 'bg-blue-500/10 border-blue-500/20', spin: true },
    in_progress: { label: t('orders.in_progress'), icon: Loader2, color: 'text-primary', bgColor: 'bg-primary/10 border-primary/20', spin: true },
    completed: { label: t('orders.completed'), icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
    partial: { label: t('orders.partial'), icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10 border-orange-500/20' },
    cancelled: { label: t('orders.cancelled'), icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10 border-red-500/20' },
    awaiting_payment: { label: 'Awaiting Payment', icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10 border-yellow-500/20' },
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.service?.name || order.service_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const kanbanColumns = [
    { title: 'Awaiting Payment', status: 'awaiting_payment', icon: Clock, gradient: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-500/10', textColor: 'text-yellow-500', borderColor: 'border-yellow-500/30' },
    { title: t('orders.pending'), status: 'pending', icon: Clock, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', textColor: 'text-amber-500', borderColor: 'border-amber-500/30' },
    { title: 'Processing', status: 'processing', icon: Loader2, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', textColor: 'text-blue-500', borderColor: 'border-blue-500/30' },
    { title: t('orders.in_progress'), status: 'in_progress', icon: Loader2, gradient: 'from-primary to-primary/80', bg: 'bg-primary/10', textColor: 'text-primary', borderColor: 'border-primary/30' },
    { title: t('orders.completed'), status: 'completed', icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', textColor: 'text-emerald-500', borderColor: 'border-emerald-500/30' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('common.copied'), description: t('orders.order_number') });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Loading state
  if (panelLoading || authLoading) {
    return (
      <BuyerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </BuyerLayout>
    );
  }

  // Not authenticated
  if (!buyer) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t('orders.login_required')}</h2>
          <p className="text-muted-foreground mb-4 text-sm">{t('orders.login_to_view')}</p>
          <Button asChild>
            <a href="/auth">{t('auth.sign_in')}</a>
          </Button>
        </div>
      </BuyerLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t('error.something_wrong')}</h2>
          <p className="text-muted-foreground mb-4 text-sm">{error}</p>
          <Button onClick={fetchOrders}>{t('common.retry')}</Button>
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
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{t('orders.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('orders.subtitle')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2 self-start sm:self-auto">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.refresh')}</span>
          </Button>
        </motion.div>

        {/* Stats - Mobile optimized horizontal scroll */}
        <motion.div variants={itemVariants} className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex md:grid md:grid-cols-5 gap-2 md:gap-3 min-w-max md:min-w-0">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = orders.filter(o => o.status === status).length;
              const Icon = config.icon;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                  className={cn(
                    "glass-card p-3 md:p-4 text-left transition-all min-w-[100px] md:min-w-0 shrink-0 md:shrink",
                    statusFilter === status && "ring-2 ring-primary"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 md:p-2 rounded-lg", config.bgColor.split(' ')[0])}>
                      <Icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4", config.color, config.spin && "animate-spin")} />
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-bold">{count}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Search */}
        <motion.div variants={itemVariants} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('orders.search_placeholder')}
            className="pl-9 bg-card/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        {/* Kanban View - Responsive */}
        <motion.div variants={itemVariants}>
          {/* Desktop/Tablet: Grid layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {kanbanColumns.map((column) => {
              const columnOrders = filteredOrders.filter(o => o.status === column.status);
              const Icon = column.icon;

              return (
                <div key={column.status} className="space-y-3">
                  {/* Column Header */}
                  <div className={cn("glass-card p-3 border-l-4", column.borderColor)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", column.gradient)}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">{column.title}</span>
                      </div>
                      <Badge variant="outline" className={cn(column.bg, column.textColor)}>
                        {columnOrders.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Items */}
                  <ScrollArea className="h-[calc(100vh-400px)] pr-2">
                    <div className="space-y-2">
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
                        columnOrders.map((order) => (
                          <OrderCard 
                            key={order.id} 
                            order={order} 
                            statusConfig={statusConfig}
                            onView={() => setSelectedOrder(order)}
                            onCopy={() => copyToClipboard(order.order_number)}
                          />
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
                const columnOrders = filteredOrders.filter(o => o.status === column.status);
                const Icon = column.icon;

                return (
                  <div key={column.status} className="w-[85vw] max-w-[320px] shrink-0 snap-center space-y-3">
                    {/* Column Header */}
                    <div className={cn("glass-card p-3 border-l-4", column.borderColor)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", column.gradient)}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-sm">{column.title}</span>
                        </div>
                        <Badge variant="outline" className={cn(column.bg, column.textColor)}>
                          {columnOrders.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Column Items */}
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                      {loading ? (
                        [1, 2].map(i => (
                          <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
                        ))
                      ) : columnOrders.length === 0 ? (
                        <div className="glass-card p-6 text-center">
                          <Icon className={cn("w-8 h-8 mx-auto mb-2", column.textColor)} />
                          <p className="text-sm text-muted-foreground">No orders</p>
                        </div>
                      ) : (
                        columnOrders.map((order) => (
                          <OrderCard 
                            key={order.id} 
                            order={order} 
                            statusConfig={statusConfig}
                            onView={() => setSelectedOrder(order)}
                            onCopy={() => copyToClipboard(order.order_number)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Other status orders (cancelled, partial, refunded) */}
        {filteredOrders.filter(o => !['awaiting_payment', 'pending', 'processing', 'in_progress', 'completed'].includes(o.status)).length > 0 && (
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-3">{t('orders.other_orders')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredOrders
                .filter(o => !['awaiting_payment', 'pending', 'processing', 'in_progress', 'completed'].includes(o.status))
                .map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    statusConfig={statusConfig}
                    onView={() => setSelectedOrder(order)}
                    onCopy={() => copyToClipboard(order.order_number)}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t('common.details')}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('orders.order_number')}</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">{selectedOrder.order_number}</code>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(selectedOrder.order_number)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('orders.service')}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedOrder.service?.name || selectedOrder.service_name || 'Unknown'}</span>
                  {selectedOrder.service?.display_order && (
                    <Badge variant="secondary" className="text-xs font-mono">
                      ID: #{selectedOrder.service.display_order}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('common.status')}</span>
                <Badge variant="outline" className={statusConfig[selectedOrder.status]?.bgColor}>
                  {statusConfig[selectedOrder.status]?.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('common.quantity')}</span>
                <span className="font-medium">{selectedOrder.quantity.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('common.price')}</span>
                <span className="font-bold text-lg">${selectedOrder.price.toFixed(2)}</span>
              </div>

              {selectedOrder.status === 'in_progress' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('orders.progress')}</span>
                    <span className="font-medium">{selectedOrder.progress}%</span>
                  </div>
                  <Progress value={selectedOrder.progress} className="h-2" />
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-2">Target URL</p>
                <a 
                  href={selectedOrder.target_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {selectedOrder.target_url}
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Calendar className="w-3 h-3" />
                Created: {new Date(selectedOrder.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </BuyerLayout>
  );
};

// Order Card Component
const OrderCard = ({ 
  order, 
  statusConfig, 
  onView, 
  onCopy 
}: { 
  order: Order; 
  statusConfig: Record<string, any>; 
  onView: () => void; 
  onCopy: () => void;
}) => {
  const config = statusConfig[order.status];
  const StatusIcon = config?.icon || Clock;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card-hover p-3 space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{order.service?.name || order.service_name || 'Unknown'}</p>
            {order.service?.display_order && (
              <Badge variant="secondary" className="text-[10px] font-mono px-1 py-0 h-4 shrink-0">
                ID: #{order.service.display_order}
              </Badge>
            )}
          </div>
          <button 
            onClick={onCopy}
            className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
          >
            {order.order_number}
          </button>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={onView}>
          <Eye className="w-3.5 h-3.5" />
        </Button>
      </div>

      <a 
        href={order.target_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline truncate block flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
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
};

export default BuyerOrders;
