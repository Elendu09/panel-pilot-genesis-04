import { useState, useEffect } from "react";
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
  Play
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
  notes: string | null;
  created_at: string;
  service?: { name: string; category: string } | null;
  buyer?: { email: string; full_name: string | null } | null;
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

  useEffect(() => {
    if (panel?.id) {
      fetchOrders();
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
      (order.service?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
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
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled' as any, 
          notes: `Refund: $${refundAmount} - ${refundReason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      setOrders(prev => prev.map(o => 
        o.id === selectedOrder.id ? { ...o, status: "cancelled", notes: `Refund: $${refundAmount} - ${refundReason}` } : o
      ));
      toast({ title: `Refund of $${refundAmount} processed` });
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

  const exportOrders = () => {
    const csv = [
      ["Order ID", "Service", "Customer", "Link", "Quantity", "Price", "Status", "Progress", "Date"],
      ...filteredOrders.map(o => [
        o.order_number, 
        o.service?.name || '', 
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
                                {order.service?.name || 'Unknown Service'}
                              </p>
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

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedOrders.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-4 glass-card rounded-xl border border-primary/30"
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <span className="font-medium">{selectedOrders.size} selected</span>
            </div>
            <div className="flex-1" />
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bulk action..." />
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
              className="bg-primary"
            >
              Apply
            </Button>
            <Button variant="ghost" onClick={() => setSelectedOrders(new Set())}>
              Clear Selection
            </Button>
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
          <Card className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left p-4">
                      <Checkbox
                        checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Order</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Customer</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Quantity</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Progress</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-left p-4 font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center">
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

                        return (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-border/30 hover:bg-accent/30 transition-colors group"
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
                                  <p className="text-xs text-muted-foreground">{order.service?.name || 'Unknown Service'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <span className="text-sm">{order.buyer?.email || 'Unknown'}</span>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              <span className="text-sm">{order.quantity.toLocaleString()}</span>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className={cn(statusInfo.color, "shadow-sm", statusInfo.glow)}>
                                <StatusIcon className={cn("w-3 h-3 mr-1", order.status === "in_progress" && "animate-spin")} />
                                {statusInfo.label}
                              </Badge>
                            </td>
                            <td className="p-4 hidden md:table-cell">
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
                        );
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
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
                  <p className="font-medium">{selectedOrder.service?.name || 'Unknown'}</p>
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
