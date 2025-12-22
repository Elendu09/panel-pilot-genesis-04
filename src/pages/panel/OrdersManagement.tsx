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
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Download,
  Bell,
  BellOff,
  Loader2,
  ExternalLink,
  Zap,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "@/hooks/usePanel";

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
  notes: string | null;
  created_at: string;
  service?: { name: string; category: string } | null;
  buyer?: { email: string; full_name: string | null } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any; glow: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock, glow: "shadow-yellow-500/20" },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Loader2, glow: "shadow-blue-500/20" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle, glow: "shadow-green-500/20" },
  partial: { label: "Partial", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertCircle, glow: "shadow-orange-500/20" },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle, glow: "shadow-red-500/20" },
};

const OrdersManagement = () => {
  const { panel, loading: panelLoading } = usePanel();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newOrderNote, setNewOrderNote] = useState("");

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
      // Transform data to match Order type (buyer comes as array from join)
      const transformedOrders = (data || []).map(order => ({
        ...order,
        buyer: Array.isArray(order.buyer) ? order.buyer[0] : order.buyer
      }));
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.buyer?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.service?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const todayOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const inProgressOrders = orders.filter(o => o.status === "in_progress").length;
  const todayRevenue = orders.reduce((acc, o) => acc + (o.price || 0), 0);

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Orders Management
          </h1>
          <p className="text-muted-foreground">Track and manage customer orders in real-time</p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          { label: "Total Orders", value: todayOrders, icon: ShoppingCart, color: "primary", trend: null },
          { label: "Pending", value: pendingOrders, icon: Clock, color: "yellow-500", trend: null },
          { label: "In Progress", value: inProgressOrders, icon: Zap, color: "blue-500", trend: null },
          { label: "Revenue", value: `$${todayRevenue.toFixed(2)}`, icon: DollarSign, color: "green-500", trend: null },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Status Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide"
      >
        {["all", "pending", "in_progress", "completed", "partial", "cancelled"].map((status) => {
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

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
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
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {loading ? 'Loading orders...' : 'No orders found'}
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
      </motion.div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="glass max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>{selectedOrder?.order_number}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedOrder.service?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.buyer?.email || 'Unknown'}</p>
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
    </div>
  );
};

export default OrdersManagement;
