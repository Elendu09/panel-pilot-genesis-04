import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Search, 
  MoreVertical, 
  Eye,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Wallet,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Download,
  Bell,
  BellOff,
  Loader2,
  ExternalLink,
  Zap,
  TrendingUp,
  LayoutGrid,
  List,
  Trash2,
  CheckSquare,
  Square,
  Pause,
  Play,
  Copy,
  Link,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";
import { usePendingOrders } from "@/hooks/use-pending-orders";
import { format } from "date-fns";
import { getIconByKey } from "@/components/icons/SocialIcons";

interface Order {
  id: string;
  order_number: string;
  target_url: string;
  quantity: number;
  price: number;
  status: string;
  progress: number;
  start_count: number;
  remains: number;
  provider_cost: number | null;
  provider_order_id: string | null;
  notes: string | null;
  created_at: string;
  service_name?: string | null;
  drip_feed_runs?: number | null;
  drip_feed_interval?: number | null;
  service?: { name: string; category: string } | null;
  buyer?: { email: string; full_name: string | null } | null;
  buyer_id?: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any; glow: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock, glow: "shadow-yellow-500/20" },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Loader2, glow: "shadow-blue-500/20" },
  paused: { label: "Paused", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Pause, glow: "shadow-purple-500/20" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle, glow: "shadow-green-500/20" },
  partial: { label: "Partial", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertCircle, glow: "shadow-orange-500/20" },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle, glow: "shadow-red-500/20" },
};

const kanbanColumns = [
  { id: "pending", title: "Pending", color: "bg-yellow-500" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500" },
  { id: "paused", title: "Paused", color: "bg-purple-500" },
  { id: "completed", title: "Completed", color: "bg-green-500" },
  { id: "cancelled", title: "Cancelled", color: "bg-red-500" },
];

const OrdersManagement = () => {
  const { panel, loading: panelLoading } = usePanel();
  const { pendingCount: pendingOrders } = usePendingOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newOrderNote, setNewOrderNote] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (panel?.id) {
      fetchOrders();

      // Realtime subscription for order updates
      const channel = supabase
        .channel('orders-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `panel_id=eq.${panel.id}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchOrders();
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => 
              o.id === (payload.new as any).id ? { ...o, ...(payload.new as any) } : o
            ));
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [panel?.id]);

  const fetchOrders = async () => {
    if (!panel?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          service:services(name, category),
          buyer:client_users!orders_buyer_id_fkey(email, full_name)
        `)
        .eq('panel_id', panel.id)
        .order('created_at', { ascending: false });
      

      if (error) throw error;
      const transformedOrders = (data || []).map(order => ({
        ...order,
        buyer: Array.isArray(order.buyer) ? order.buyer[0] : order.buyer
      }));
      setOrders(transformedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      // Silently handle - empty state will show instead of toast
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.buyer?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.service?.name || order.service_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const todayOrders = orders.length;
  const pendingOrdersLocal = orders.filter(o => o.status === "pending").length;
  const totalOrderAmount = orders.reduce((acc, o) => acc + (o.price || 0), 0);
  const profitFromOrders = orders.reduce((acc, o) => acc + ((o.price || 0) - (o.provider_cost || 0)), 0);

  const toggleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus as any, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      toast({ title: `Order status updated to ${newStatus}` });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update order' });
    }
  };

  const cancelOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'cancelled');
  };

  const pauseOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'paused');
    toast({ title: "Order paused", description: "Order has been paused and can be resumed later" });
  };

  const resumeOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'in_progress');
    toast({ title: "Order resumed", description: "Order is now back in progress" });
  };

  const openRefundDialog = (order: Order) => {
    setSelectedOrder(order);
    setRefundAmount(order.price.toFixed(2));
    setIsRefundOpen(true);
  };

  const processRefund = async () => {
    if (!selectedOrder) return;
    
    try {
      const refundAmt = parseFloat(refundAmount);

      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled' as any, 
          notes: `Refund: $${refundAmount} - ${refundReason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // Restore buyer balance
      if (selectedOrder.buyer_id && refundAmt > 0) {
        const { data: buyer } = await supabase
          .from('client_users')
          .select('balance, total_spent')
          .eq('id', selectedOrder.buyer_id)
          .single();

        if (buyer) {
          await supabase
            .from('client_users')
            .update({
              balance: parseFloat(String(buyer.balance || 0)) + refundAmt,
              total_spent: Math.max(0, parseFloat(String(buyer.total_spent || 0)) - refundAmt)
            })
            .eq('id', selectedOrder.buyer_id);
        }
      }

      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id ? { ...o, status: "cancelled", notes: `Refund: $${refundAmount} - ${refundReason}` } : o
      ));
      toast({ title: `Refund of $${refundAmount} processed and balance restored` });
      setIsRefundOpen(false);
      setRefundReason("");
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process refund' });
    }
  };

  // Bulk Actions
  const executeBulkAction = async () => {
    if (selectedOrders.size === 0 || !bulkAction) return;
    
    setBulkProcessing(true);
    const orderIds = Array.from(selectedOrders);
    
    try {
      if (bulkAction === "cancel") {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' as any, updated_at: new Date().toISOString() })
          .in('id', orderIds);
        toast({ title: `${orderIds.length} orders cancelled` });
      } else if (bulkAction === "complete") {
        await supabase
          .from('orders')
          .update({ status: 'completed' as any, progress: 100, updated_at: new Date().toISOString() })
          .in('id', orderIds);
        toast({ title: `${orderIds.length} orders marked complete` });
      } else if (bulkAction === "in_progress") {
        await supabase
          .from('orders')
          .update({ status: 'in_progress' as any, updated_at: new Date().toISOString() })
          .in('id', orderIds);
        toast({ title: `${orderIds.length} orders set to in progress` });
      } else if (bulkAction === "pause") {
        await supabase
          .from('orders')
          .update({ status: 'paused' as any, updated_at: new Date().toISOString() })
          .in('id', orderIds);
        toast({ title: `${orderIds.length} orders paused` });
      } else if (bulkAction === "resume") {
        await supabase
          .from('orders')
          .update({ status: 'in_progress' as any, updated_at: new Date().toISOString() })
          .in('id', orderIds);
        toast({ title: `${orderIds.length} orders resumed` });
      } else if (bulkAction === "refund") {
        // Process refunds
        for (const orderId of orderIds) {
          const order = orders.find(o => o.id === orderId);
          if (order) {
            await supabase
              .from('orders')
              .update({ 
                status: 'cancelled' as any, 
                notes: `Bulk refund: $${order.price}`,
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId);
          }
        }
        toast({ title: `${orderIds.length} orders refunded` });
      }
      
      await fetchOrders();
      setSelectedOrders(new Set());
      setIsBulkActionOpen(false);
      setBulkAction("");
    } catch (error) {
      console.error('Bulk action error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to execute bulk action' });
    } finally {
      setBulkProcessing(false);
    }
  };

  const addOrderNote = async () => {
    if (!selectedOrder || !newOrderNote.trim()) return;
    
    const updatedNotes = selectedOrder.notes 
      ? `${selectedOrder.notes}\n${newOrderNote}` 
      : newOrderNote;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id ? { ...o, notes: updatedNotes } : o
      ));
      setSelectedOrder(prev => prev ? { ...prev, notes: updatedNotes } : null);
      setNewOrderNote("");
      toast({ title: "Note added" });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add note' });
    }
  };

  const syncOrders = async () => {
    if (!panel?.id) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-orders', {
        body: { panelId: panel.id },
      });
      if (error) throw error;
      if (data?.success) {
        toast({ title: "Orders synced", description: `${data.updated} of ${data.total} active orders updated from providers` });
        if (data.updated > 0) await fetchOrders();
      } else {
        toast({ variant: 'destructive', title: 'Sync failed', description: data?.error || 'Failed to sync orders' });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({ variant: 'destructive', title: 'Sync failed', description: 'Could not reach the server' });
    } finally {
      setSyncing(false);
    }
  };

  const exportOrders = () => {
    const csv = [
      ["Order ID", "Service", "Customer", "Link", "Quantity", "Price", "Status", "Progress", "Date"],
      ...filteredOrders.map(o => [
        o.order_number, 
        o.service?.name || o.service_name || '', 
        o.buyer?.email || '', 
        o.target_url, 
        o.quantity, 
        o.price, 
        o.status, 
        o.progress || 0, 
        o.created_at
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    toast({ title: "Orders exported" });
  };

  // Kanban view render
  const renderKanbanView = () => (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {kanbanColumns.map((column) => {
        const columnOrders = filteredOrders.filter(o => o.status === column.id);
        return (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-w-[300px] flex-shrink-0"
          >
            <Card className="glass-card h-full">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold">{column.title}</h3>
                  <Badge variant="secondary" className="ml-auto">{columnOrders.length}</Badge>
                </div>
              </div>
              <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
                {columnOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No orders
                  </div>
                ) : (
                  columnOrders.map((order) => {
                    const statusInfo = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className="cursor-pointer"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Card className="glass-card-hover p-3 border-border/30">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm">{order.order_number}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {order.service?.name || order.service_name || 'Unknown Service'}
                              </p>
                              {order.drip_feed_runs && order.drip_feed_runs >= 2 && (
                                <Badge variant="outline" className="text-[10px] mt-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                                  Drip: {order.drip_feed_runs} runs / {order.drip_feed_interval || 60}min
                                </Badge>
                              )}
                            </div>
                            <Checkbox
                              checked={selectedOrders.has(order.id)}
                              onCheckedChange={() => toggleSelectOrder(order.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{order.buyer?.email || 'Unknown'}</span>
                            <Badge variant="outline" className="text-xs">${order.price.toFixed(2)}</Badge>
                          </div>
                          {order.progress > 0 && order.status === 'in_progress' && (
                            <Progress value={order.progress} className="h-1 mt-2" />
                          )}
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  if (panelLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted rounded-xl"></div>)}
        </div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header with Real-time Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Orders Management
            </h1>
            {pendingOrders > 0 && (
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 animate-pulse">
                {pendingOrders} Pending
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Track and manage customer orders in real-time</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={syncOrders} disabled={syncing} className="glass-card border-border/50" data-testid="button-sync-orders">
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            {syncing ? "Syncing..." : "Sync Orders"}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchOrders} className="glass-card border-border/50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="glass-card border-border/50"
          >
            {notificationsEnabled ? (
              <><Bell className="w-4 h-4 mr-2" /> Notifications On</>
            ) : (
              <><BellOff className="w-4 h-4 mr-2" /> Notifications Off</>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={exportOrders} className="glass-card border-border/50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Total Orders", value: todayOrders, icon: ShoppingCart, color: "primary", testId: "stat-total-orders" },
          { label: "Pending", value: pendingOrders, icon: Clock, color: "yellow-500", testId: "stat-pending-orders" },
          { label: "Total Order Amount", value: `$${totalOrderAmount.toFixed(2)}`, icon: Wallet, color: "blue-500", testId: "stat-total-order-amount" },
          { label: "Profit from Orders", value: `$${profitFromOrders.toFixed(2)}`, icon: DollarSign, color: "green-500", testId: "stat-profit-from-orders" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            data-testid={stat.testId}
          >
            <Card className="glass-card-hover overflow-hidden">
              <CardContent className="p-4 relative">
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <div className={cn(
                    "w-full h-full rounded-full blur-2xl",
                    stat.color === "primary" ? "bg-primary" : `bg-${stat.color}`
                  )} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      stat.color === "primary" ? "bg-primary/10" : `bg-${stat.color}/10`
                    )}>
                      <stat.icon className={cn(
                        "w-5 h-5",
                        stat.color === "primary" ? "text-primary" : `text-${stat.color}`
                      )} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground" data-testid={`${stat.testId}-label`}>{stat.label}</p>
                      <p className="text-2xl font-bold" data-testid={`${stat.testId}-value`}>{stat.value}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bulk Actions Bar - Fixed at bottom on mobile */}
      <AnimatePresence>
        {selectedOrders.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-background/95 backdrop-blur-xl rounded-2xl border border-primary/30 shadow-2xl">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{selectedOrders.size} selected</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:hidden" onClick={() => setSelectedOrders(new Set())} data-testid="button-clear-selection-mobile">
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="flex-1 min-w-0 h-9" data-testid="select-bulk-action">
                    <SelectValue placeholder="Action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cancel">Cancel Orders</SelectItem>
                    <SelectItem value="complete">Mark Complete</SelectItem>
                    <SelectItem value="in_progress">Set In Progress</SelectItem>
                    <SelectItem value="pause">Pause Orders</SelectItem>
                    <SelectItem value="resume">Resume Orders</SelectItem>
                    <SelectItem value="refund">Process Refund</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => setIsBulkActionOpen(true)} 
                  disabled={!bulkAction}
                  className="bg-primary shrink-0"
                  size="sm"
                  data-testid="button-apply-bulk"
                >
                  Apply
                </Button>
                <Button variant="ghost" size="icon" className="hidden sm:flex h-8 w-8 shrink-0" onClick={() => setSelectedOrders(new Set())} data-testid="button-clear-selection">
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide"
      >
        {["all", "pending", "in_progress", "paused", "completed", "partial", "cancelled"].map((status) => {
          const isActive = statusFilter === status;
          const config = status !== "all" ? statusConfig[status] : null;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "glass-card hover:bg-accent/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {status === "all" ? "All Orders" : config?.label}
            </button>
          );
        })}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search by order ID, customer, or service..." 
          className="pl-9 bg-card/50 backdrop-blur-sm border-border/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Orders View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {viewMode === "kanban" ? renderKanbanView() : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {/* Mobile Select All */}
              {filteredOrders.length > 0 && (
                <div className="flex items-center gap-3 px-1">
                  <Checkbox
                    checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                    onCheckedChange={toggleSelectAll}
                    data-testid="checkbox-select-all-mobile"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedOrders.size > 0 ? `${selectedOrders.size} of ${filteredOrders.length} selected` : "Select all"}
                  </span>
                </div>
              )}
              {filteredOrders.length === 0 ? (
                <Card className="glass-card">
                  <div className="flex flex-col items-center gap-4 p-8">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                      <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-lg mb-1">No Orders Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Orders will appear here once customers place them.
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <Card key={order.id} className="glass-card-hover" data-testid={`card-order-${order.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedOrders.has(order.id)}
                            onCheckedChange={() => toggleSelectOrder(order.id)}
                            className="mt-1 shrink-0"
                            data-testid={`checkbox-order-${order.id}`}
                          />
                          <div className="flex-1 min-w-0" onClick={() => viewOrderDetails(order)}>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="font-medium text-sm truncate">{order.order_number}</p>
                              <Badge variant="outline" className={cn(statusInfo.color, "text-xs shrink-0")}>
                                <StatusIcon className={cn("w-3 h-3 mr-1", order.status === "in_progress" && "animate-spin")} />
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mb-1">
                              {order.service?.name || order.service_name || 'Unknown Service'}
                              {order.drip_feed_runs && order.drip_feed_runs >= 2 && (
                                <span className="ml-1 text-blue-500">[Drip: {order.drip_feed_runs}×{order.drip_feed_interval || 60}min]</span>
                              )}
                            </p>
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-muted-foreground truncate">{order.buyer?.email || 'Unknown'}</span>
                              <span className="font-semibold shrink-0">${order.price.toFixed(2)}</span>
                            </div>
                            {order.progress > 0 && order.status === 'in_progress' && (
                              <Progress value={order.progress} className="h-1 mt-2" />
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass">
                              <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'in_progress')}>
                                <Loader2 className="w-4 h-4 mr-2" /> Start Processing
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'completed')}>
                                <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                              </DropdownMenuItem>
                              {order.status === 'in_progress' && (
                                <DropdownMenuItem onClick={() => pauseOrder(order.id)}>
                                  <Pause className="w-4 h-4 mr-2" /> Pause
                                </DropdownMenuItem>
                              )}
                              {order.status === 'paused' && (
                                <DropdownMenuItem onClick={() => resumeOrder(order.id)}>
                                  <Play className="w-4 h-4 mr-2" /> Resume
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => cancelOrder(order.id)} className="text-destructive">
                                <XCircle className="w-4 h-4 mr-2" /> Cancel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openRefundDialog(order)} className="text-destructive">
                                <RefreshCw className="w-4 h-4 mr-2" /> Refund
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Desktop Table View */}
            <Card className="glass-card overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left p-4">
                        <Checkbox
                          checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                          onCheckedChange={toggleSelectAll}
                          data-testid="checkbox-select-all-desktop"
                        />
                      </th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Order</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Quantity</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden xl:table-cell">Start Count</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden xl:table-cell">Remains</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Progress</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-12 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                              <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <div>
                              <h3 className="font-medium text-lg mb-1">No Orders Yet</h3>
                              <p className="text-sm text-muted-foreground">
                                Orders will appear here once customers place them.
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <AnimatePresence>
                        {filteredOrders.map((order, index) => {
                          const statusInfo = statusConfig[order.status] || statusConfig.pending;
                          const StatusIcon = statusInfo.icon;
                          const isExpanded = expandedOrder === order.id;

                          // Detect platform from service category or name
                          const category = order.service?.category || '';
                          const platformIcon = getIconByKey(category);
                          const PlatformIcon = platformIcon.icon;
                          const platformName = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Unknown';

                          return (
                            <React.Fragment key={order.id}>
                            <motion.tr
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "border-b border-border/30 hover:bg-accent/30 transition-colors group",
                                isExpanded && "bg-accent/20"
                              )}
                            >
                              <td className="p-4">
                                <Checkbox
                                  checked={selectedOrders.has(order.id)}
                                  onCheckedChange={() => toggleSelectOrder(order.id)}
                                />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </Button>
                                  <div>
                                    <p className="font-medium group-hover:text-primary transition-colors">{order.order_number}</p>
                                    <p className="text-xs text-muted-foreground">{order.service?.name || order.service_name || 'Unknown Service'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="text-sm">{order.buyer?.email || 'Unknown'}</span>
                              </td>
                              <td className="p-4 hidden lg:table-cell">
                                <span className="text-sm">{order.quantity.toLocaleString()}</span>
                              </td>
                              <td className="p-4 hidden xl:table-cell">
                                <span className="text-sm">{order.start_count || 0}</span>
                              </td>
                              <td className="p-4 hidden xl:table-cell">
                                <span className="text-sm">{order.remains || 0}</span>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline" className={cn(statusInfo.color, "shadow-sm", statusInfo.glow)}>
                                  <StatusIcon className={cn("w-3 h-3 mr-1", order.status === "in_progress" && "animate-spin")} />
                                  {statusInfo.label}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2 min-w-32">
                                  <Progress 
                                    value={order.progress || 0} 
                                    className={cn(
                                      "h-2",
                                      order.status === "completed" && "[&>div]:bg-green-500",
                                      order.status === "in_progress" && "[&>div]:bg-blue-500",
                                      order.status === "pending" && "[&>div]:bg-yellow-500"
                                    )}
                                  />
                                  <span className="text-xs text-muted-foreground w-12">{order.progress || 0}%</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="font-semibold">${order.price.toFixed(2)}</span>
                              </td>
                              <td className="p-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="glass">
                                    <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                                      <Eye className="w-4 h-4 mr-2" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(order.target_url, '_blank')}>
                                      <ExternalLink className="w-4 h-4 mr-2" /> Open Link
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'in_progress')}>
                                      <Loader2 className="w-4 h-4 mr-2" /> Start Processing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'completed')}>
                                      <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => cancelOrder(order.id)} className="text-destructive">
                                      <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openRefundDialog(order)} className="text-destructive">
                                      <RefreshCw className="w-4 h-4 mr-2" /> Process Refund
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </motion.tr>

                            {/* Expanded Row Details */}
                            {isExpanded && (
                              <tr className="border-b border-border/30 bg-muted/20">
                                <td colSpan={10} className="p-0">
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-6 py-4"
                                  >
                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                                      <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Platform</p>
                                        <div className="flex items-center gap-2">
                                          <div className={cn("w-5 h-5 rounded flex items-center justify-center", platformIcon.bgColor)}>
                                            <PlatformIcon className="text-white" size={12} />
                                          </div>
                                          <span className="text-sm font-medium">{platformName}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Link</p>
                                        <a 
                                          href={order.target_url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm text-primary hover:underline truncate block max-w-[180px]"
                                        >
                                          {order.target_url.replace(/^https?:\/\//, '').slice(0, 30)}
                                        </a>
                                      </div>
                                      <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Provider</p>
                                        <span className="text-sm font-medium">Provider A</span>
                                      </div>
                                      <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">API Order ID</p>
                                        <span className="text-sm font-mono">{order.provider_order_id || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Created</p>
                                        <span className="text-sm">{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}</span>
                                      </div>
                                      <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Updated</p>
                                        <span className="text-sm">{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}</span>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => viewOrderDetails(order)}>
                                        <Eye className="w-3 h-3" /> View Details
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => updateOrderStatus(order.id, 'in_progress')}>
                                        <RefreshCw className="w-3 h-3" /> Refill
                                      </Button>
                                      <Button 
                                        size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                                        onClick={() => {
                                          navigator.clipboard.writeText(order.id);
                                          toast({ title: "Copied", description: "Order ID copied to clipboard" });
                                        }}
                                      >
                                        <Copy className="w-3 h-3" /> Copy ID
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => window.open(order.target_url, '_blank')}>
                                        <ExternalLink className="w-3 h-3" /> Open Link
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => cancelOrder(order.id)}>
                                        <XCircle className="w-3 h-3" /> Cancel
                                      </Button>
                                    </div>
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                            </React.Fragment>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </motion.div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="glass max-w-lg overflow-hidden">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>{selectedOrder?.order_number}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedOrder.service?.name || selectedOrder.service_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium break-all text-sm" data-testid="text-customer-email">{selectedOrder.buyer?.email || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{selectedOrder.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">${selectedOrder.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Count</p>
                  <p className="font-medium">{selectedOrder.start_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remains</p>
                  <p className="font-medium">{selectedOrder.remains || 0}</p>
                </div>
                {selectedOrder.provider_order_id && (
                  <div className="col-span-1 sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Provider Order ID</p>
                    <p className="font-medium font-mono text-xs">{selectedOrder.provider_order_id}</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Target URL</p>
                <a href={selectedOrder.target_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm break-all">
                  {selectedOrder.target_url}
                </a>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Progress</p>
                <Progress value={selectedOrder.progress || 0} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{selectedOrder.progress || 0}% complete</p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Input 
                  placeholder="Add a note..." 
                  value={newOrderNote} 
                  onChange={(e) => setNewOrderNote(e.target.value)}
                />
                <Button onClick={addOrderNote} disabled={!newOrderNote.trim()}>
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>Order: {selectedOrder?.order_number}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Refund Amount</Label>
              <Input 
                type="number" 
                value={refundAmount} 
                onChange={(e) => setRefundAmount(e.target.value)}
                step="0.01"
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea 
                value={refundReason} 
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter refund reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundOpen(false)}>Cancel</Button>
            <Button onClick={processRefund} className="bg-destructive text-destructive-foreground">
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={isBulkActionOpen} onOpenChange={setIsBulkActionOpen}>
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              You are about to {bulkAction === "cancel" ? "cancel" : bulkAction === "complete" ? "complete" : bulkAction === "refund" ? "refund" : "update"} {selectedOrders.size} orders.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action will affect {selectedOrders.size} selected orders. This cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkActionOpen(false)}>Cancel</Button>
            <Button 
              onClick={executeBulkAction} 
              disabled={bulkProcessing}
              className={bulkAction === "cancel" || bulkAction === "refund" ? "bg-destructive" : ""}
            >
              {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
