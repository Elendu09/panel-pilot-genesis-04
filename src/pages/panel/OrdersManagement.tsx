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

// Mock data for orders
const mockOrders = [
  { id: "ORD-001", service: "Instagram Followers", customer: "john@example.com", link: "https://instagram.com/user1", quantity: 1000, price: 2.50, status: "completed", progress: 100, startCount: 5000, currentCount: 6000, createdAt: "2024-01-15 14:30", notes: "" },
  { id: "ORD-002", service: "Instagram Likes", customer: "jane@example.com", link: "https://instagram.com/p/abc123", quantity: 500, price: 0.60, status: "in_progress", progress: 65, startCount: 100, currentCount: 425, createdAt: "2024-01-15 14:25", notes: "" },
  { id: "ORD-003", service: "YouTube Views", customer: "mike@example.com", link: "https://youtube.com/watch?v=xyz", quantity: 10000, price: 8.00, status: "pending", progress: 0, startCount: 1500, currentCount: 1500, createdAt: "2024-01-15 14:20", notes: "" },
  { id: "ORD-004", service: "TikTok Likes", customer: "sara@example.com", link: "https://tiktok.com/@user/video/123", quantity: 2000, price: 3.00, status: "in_progress", progress: 40, startCount: 200, currentCount: 1000, createdAt: "2024-01-15 14:15", notes: "Rush order" },
  { id: "ORD-005", service: "Facebook Page Likes", customer: "tom@example.com", link: "https://facebook.com/page", quantity: 5000, price: 15.00, status: "partial", progress: 80, startCount: 1000, currentCount: 5000, createdAt: "2024-01-15 14:10", notes: "" },
  { id: "ORD-006", service: "Twitter Followers", customer: "lisa@example.com", link: "https://twitter.com/user", quantity: 500, price: 1.40, status: "cancelled", progress: 0, startCount: 300, currentCount: 300, createdAt: "2024-01-15 14:05", notes: "Customer requested cancellation" },
  { id: "ORD-007", service: "Instagram Followers", customer: "alex@example.com", link: "https://instagram.com/user2", quantity: 3000, price: 7.50, status: "refunded", progress: 0, startCount: 2000, currentCount: 2000, createdAt: "2024-01-15 14:00", notes: "Full refund issued" },
];

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock, glow: "shadow-yellow-500/20" },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Loader2, glow: "shadow-blue-500/20" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle, glow: "shadow-green-500/20" },
  partial: { label: "Partial", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertCircle, glow: "shadow-orange-500/20" },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle, glow: "shadow-red-500/20" },
  refunded: { label: "Refunded", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: RefreshCw, glow: "shadow-purple-500/20" },
};

const OrdersManagement = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newOrderNote, setNewOrderNote] = useState("");

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(order => {
        if (order.status === "in_progress" && order.progress < 100) {
          const newProgress = Math.min(order.progress + Math.random() * 5, 100);
          const delivered = Math.floor((order.quantity * newProgress) / 100);
          return {
            ...order,
            progress: newProgress,
            currentCount: order.startCount + delivered,
            status: newProgress >= 100 ? "completed" : "in_progress"
          };
        }
        return order;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const todayOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const inProgressOrders = orders.filter(o => o.status === "in_progress").length;
  const todayRevenue = orders.reduce((acc, o) => acc + o.price, 0);

  // View order details
  const viewOrderDetails = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    toast({ title: `Order ${orderId} status updated to ${newStatus}` });
  };

  // Cancel order
  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: "cancelled", progress: 0 } : o
    ));
    toast({ title: `Order ${orderId} cancelled` });
  };

  // Open refund dialog
  const openRefundDialog = (order: typeof mockOrders[0]) => {
    setSelectedOrder(order);
    setRefundAmount(order.price.toFixed(2));
    setIsRefundOpen(true);
  };

  // Process refund
  const processRefund = () => {
    if (!selectedOrder) return;
    setOrders(prev => prev.map(o => 
      o.id === selectedOrder.id ? { ...o, status: "refunded", notes: `Refund: $${refundAmount} - ${refundReason}` } : o
    ));
    toast({ title: `Refund of $${refundAmount} processed for ${selectedOrder.id}` });
    setIsRefundOpen(false);
    setRefundReason("");
  };

  // Add note to order
  const addOrderNote = () => {
    if (!selectedOrder || !newOrderNote.trim()) return;
    setOrders(prev => prev.map(o => 
      o.id === selectedOrder.id ? { ...o, notes: o.notes ? `${o.notes}\n${newOrderNote}` : newOrderNote } : o
    ));
    setSelectedOrder(prev => prev ? { ...prev, notes: prev.notes ? `${prev.notes}\n${newOrderNote}` : newOrderNote } : null);
    setNewOrderNote("");
    toast({ title: "Note added" });
  };

  // Export orders
  const exportOrders = () => {
    const csv = [
      ["Order ID", "Service", "Customer", "Link", "Quantity", "Price", "Status", "Progress", "Date"],
      ...filteredOrders.map(o => [o.id, o.service, o.customer, o.link, o.quantity, o.price, o.status, o.progress, o.createdAt])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    toast({ title: "Orders exported" });
  };

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
          { label: "Today's Orders", value: todayOrders, icon: ShoppingCart, color: "primary", trend: "+12%" },
          { label: "Pending", value: pendingOrders, icon: Clock, color: "yellow-500", trend: null },
          { label: "In Progress", value: inProgressOrders, icon: Zap, color: "blue-500", trend: null },
          { label: "Today's Revenue", value: `$${todayRevenue.toFixed(2)}`, icon: DollarSign, color: "green-500", trend: "+8%" },
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
                  {stat.trend && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.trend}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Status Filters - Horizontal scroll on mobile */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide"
      >
        {["all", "pending", "in_progress", "completed", "partial", "cancelled", "refunded"].map((status) => {
          const isActive = statusFilter === status;
          const config = status !== "all" ? statusConfig[status as keyof typeof statusConfig] : null;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
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
                <AnimatePresence>
                  {filteredOrders.map((order, index) => {
                    const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
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
                              <p className="font-medium group-hover:text-primary transition-colors">{order.id}</p>
                              <p className="text-xs text-muted-foreground">{order.service}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm">{order.customer}</span>
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
                              value={order.progress} 
                              className={cn(
                                "h-2",
                                order.status === "completed" && "[&>div]:bg-green-500",
                                order.status === "in_progress" && "[&>div]:bg-blue-500",
                                order.status === "partial" && "[&>div]:bg-orange-500"
                              )}
                            />
                            <span className="text-xs text-muted-foreground w-10">{Math.round(order.progress)}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">${order.price.toFixed(2)}</span>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card">
                              <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {order.status === "pending" && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "in_progress")}>
                                  <Loader2 className="w-4 h-4 mr-2" /> Start Processing
                                </DropdownMenuItem>
                              )}
                              {order.status === "in_progress" && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "completed")}>
                                  <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
                                </DropdownMenuItem>
                              )}
                              {!["cancelled", "refunded", "completed"].includes(order.status) && (
                                <>
                                  <DropdownMenuItem onClick={() => cancelOrder(order.id)}>
                                    <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openRefundDialog(order)}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Refund
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-medium text-lg">No orders found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              View complete order information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedOrder.service}</p>
                </div>
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="font-medium">{selectedOrder.quantity.toLocaleString()}</p>
                </div>
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-medium text-primary">${selectedOrder.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="glass-card p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Target Link</p>
                <a href={selectedOrder.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                  {selectedOrder.link}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="glass-card p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Progress</p>
                <Progress value={selectedOrder.progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedOrder.currentCount.toLocaleString()} / {(selectedOrder.startCount + selectedOrder.quantity).toLocaleString()}
                </p>
              </div>

              {selectedOrder.notes && (
                <div className="glass-card p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a note..."
                  value={newOrderNote}
                  onChange={(e) => setNewOrderNote(e.target.value)}
                  className="bg-background/50"
                />
                <Button onClick={addOrderNote} size="sm" className="bg-gradient-to-r from-primary to-primary/80">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent className="glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Refund for order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Refund Amount</Label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                step="0.01"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter refund reason..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundOpen(false)}>Cancel</Button>
            <Button onClick={processRefund} className="bg-gradient-to-r from-primary to-primary/80">
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
