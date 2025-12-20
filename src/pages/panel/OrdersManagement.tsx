import { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Package,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Download,
  Bell,
  BellOff,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Loader2 },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle },
  partial: { label: "Partial", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
  refunded: { label: "Refunded", color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: RefreshCw },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orders Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders in real-time</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          >
            {notificationsEnabled ? (
              <><Bell className="w-4 h-4 mr-2" /> Notifications On</>
            ) : (
              <><BellOff className="w-4 h-4 mr-2" /> Notifications Off</>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={exportOrders}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Orders</p>
                <p className="text-2xl font-bold">{todayOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Loader2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold">${todayRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by order ID, customer, or service..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
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
              {filteredOrders.map((order) => {
                const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <>
                    <tr key={order.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          <div>
                            <p className="font-medium">{order.id}</p>
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
                        <Badge variant="outline" className={statusInfo.color}>
                          <StatusIcon className={`w-3 h-3 mr-1 ${order.status === "in_progress" ? "animate-spin" : ""}`} />
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 min-w-32">
                          <Progress value={order.progress} className="h-2" />
                          <span className="text-xs text-muted-foreground w-10">{Math.round(order.progress)}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">${order.price.toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                    </tr>
                    {isExpanded && (
                      <tr className="bg-accent/20">
                        <td colSpan={7} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">Target Link</p>
                              <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                {order.link.substring(0, 40)}...
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Count</p>
                              <p>Start: {order.startCount.toLocaleString()} → Current: {order.currentCount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Created</p>
                              <p>{order.createdAt}</p>
                            </div>
                            {order.notes && (
                              <div className="md:col-span-3">
                                <p className="text-muted-foreground mb-1">Notes</p>
                                <p className="whitespace-pre-wrap">{order.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              View complete order information and manage order
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Service</Label>
                    <p className="font-medium">{selectedOrder.service}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Customer</Label>
                    <p className="font-medium">{selectedOrder.customer}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Target Link</Label>
                    <a href={selectedOrder.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      {selectedOrder.link}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Quantity</Label>
                    <p className="font-medium">{selectedOrder.quantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Price</Label>
                    <p className="font-medium">${selectedOrder.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge variant="outline" className={statusConfig[selectedOrder.status as keyof typeof statusConfig].color}>
                      {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="font-medium">{selectedOrder.createdAt}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="progress" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Delivery Progress</Label>
                      <span className="text-sm font-medium">{Math.round(selectedOrder.progress)}%</span>
                    </div>
                    <Progress value={selectedOrder.progress} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-accent/50">
                      <p className="text-sm text-muted-foreground">Start Count</p>
                      <p className="text-xl font-bold">{selectedOrder.startCount.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/50">
                      <p className="text-sm text-muted-foreground">Current Count</p>
                      <p className="text-xl font-bold">{selectedOrder.currentCount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-muted-foreground">Delivered</p>
                    <p className="text-xl font-bold text-green-500">
                      +{(selectedOrder.currentCount - selectedOrder.startCount).toLocaleString()}
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="notes" className="space-y-4 mt-4">
                {selectedOrder.notes && (
                  <div className="p-4 rounded-lg bg-accent/50">
                    <Label className="text-muted-foreground mb-2 block">Existing Notes</Label>
                    <p className="whitespace-pre-wrap">{selectedOrder.notes}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Add Note</Label>
                  <Textarea 
                    placeholder="Add internal note about this order..."
                    value={newOrderNote}
                    onChange={(e) => setNewOrderNote(e.target.value)}
                  />
                  <Button onClick={addOrderNote} size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Issue a refund for order {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Refund Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="number" 
                  step="0.01"
                  className="pl-9"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Original amount: ${selectedOrder?.price.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason for Refund</Label>
              <Textarea 
                placeholder="Enter reason for refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundOpen(false)}>Cancel</Button>
            <Button onClick={processRefund} className="bg-gradient-to-r from-primary to-primary/80">
              <RefreshCw className="w-4 h-4 mr-2" />
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
