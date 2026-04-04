import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Search,
  Eye,
  RefreshCw,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

interface Order {
  id: string;
  order_number: string;
  target_url: string;
  quantity: number;
  price: number;
  provider_cost?: number;
  provider_id?: string;
  provider_order_id?: string;
  notes?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | "partial" | "processing";
  start_count: number;
  remains: number;
  progress: number;
  created_at: string;
  updated_at: string;
  panel_id?: string; // Added for ownership checks
  service?: {
    name: string;
    category: string;
    provider?: { name: string } | null;
  };
  buyer?: {
    email: string;
    full_name: string;
  };
}

const OrderManagement = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPanelId, setCurrentPanelId] = useState<string | null>(null);

  // Fetch panel ID securely first
  useEffect(() => {
    const getPanelId = async () => {
      if (!user || !profile) return;

      try {
        const { data, error } = await supabase.from("panels").select("id").eq("owner_id", profile.id).maybeSingle();

        if (error) throw error;
        if (data) setCurrentPanelId(data.id);
      } catch (err) {
        console.error("Error fetching panel:", err);
      }
    };

    getPanelId();
  }, [user, profile]);

  const fetchOrders = useCallback(async () => {
    // SECURITY: Only fetch if we have confirmed panel ownership
    if (!user || !currentPanelId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(
          `
          id, order_number, target_url, quantity, price, provider_cost, 
          provider_id, provider_order_id, notes, status, start_count, 
          remains, progress, created_at, updated_at, panel_id,
          service:services!inner(name, category, provider:providers(name)),
          buyer:client_users!inner(email, full_name)
        `,
        )
        .eq("panel_id", currentPanelId) // ALWAYS filter by panel
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders(ordersData || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load orders",
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user, currentPanelId, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // SECURITY: Verify order belongs to panel before updating
  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    if (!currentPanelId) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .eq("panel_id", currentPanelId); // Critical: Ensure ownership

      if (error) throw error;

      fetchOrders();
      toast({ title: "Status Updated", description: "Order status has been updated successfully" });
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update order status",
      });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.target_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics (memoized for performance)
  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const pending = orders.filter((o) => ["pending", "processing", "in_progress"].includes(o.status)).length;
    const totalAmount = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const profit = orders.reduce((sum, o) => sum + ((o.price || 0) - (o.provider_cost || 0)), 0);
    return { total, completed, pending, totalAmount, profit, conversion: total > 0 ? (completed / total) * 100 : 0 };
  }, [orders]);

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: CheckCircle,
      in_progress: Activity,
      pending: Clock,
      cancelled: XCircle,
      partial: AlertCircle,
      processing: Clock,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="w-3 h-3" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
      in_progress: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
      pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
      cancelled: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
      partial: "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30",
      processing: "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-700 dark:text-gray-400";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Please log in to continue</h1>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Helmet>
        <title>Order Management - HOME OF SMM</title>
        <meta name="description" content="Manage and track all your SMM orders and service deliveries." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <Navigation />

      <section className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Order Management</h1>
                <p className="text-muted-foreground">Track and manage all your SMM orders</p>
              </div>
              <Button onClick={fetchOrders} variant="outline" className="gap-2">
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Total Orders", value: stats.total, icon: ShoppingCart },
                { label: "Completed", value: stats.completed, icon: CheckCircle },
                { label: "Pending", value: stats.pending, icon: Clock },
                { label: "Total Revenue", value: `$${stats.totalAmount.toFixed(2)}`, icon: DollarSign },
                { label: "Profit", value: `$${stats.profit.toFixed(2)}`, icon: TrendingUp },
                { label: "Conversion", value: `${stats.conversion.toFixed(1)}%`, icon: Activity },
              ].map((stat, idx) => (
                <Card key={idx} className="bg-card/80 backdrop-blur border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-bold text-primary">{stat.value}</p>
                      </div>
                      <stat.icon className="w-5 h-5 text-primary/60" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Orders Table - Wrapped in overflow-x-auto for mobile */}
            <Card className="bg-card/80 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>Orders ({filteredOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile scroll wrapper */}
                <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                  {loading ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-8 h-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Loading orders...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Order #</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead className="hidden md:table-cell">Customer</TableHead>
                          <TableHead className="hidden lg:table-cell">Target</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[80px]">Progress</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <TableCell className="font-mono text-xs">{order.order_number}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm line-clamp-1">{order.service?.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{order.service?.category}</p>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="text-sm">{order.buyer?.full_name || "N/A"}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {order.buyer?.email}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <span className="text-xs truncate max-w-[150px] font-mono">{order.target_url}</span>
                                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">{order.quantity?.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">${order.price?.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("text-xs", getStatusColor(order.status))}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize hidden sm:inline">
                                  {order.status.replace("_", " ")}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={order.progress || 0} className="h-1.5 w-12" />
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(order.progress || 0)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {!loading && filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground">
                      {orders.length === 0
                        ? "No orders have been placed yet"
                        : "Try adjusting your search or filter criteria"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Order #{selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              {/* ... (Keep your existing dialog content structure) ... */}
              {/* Simplified for brevity - ensure provider_cost is displayed correctly */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-xs text-muted-foreground uppercase">Revenue</p>
                  <p className="text-lg font-bold text-green-600">${selectedOrder.price?.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-xs text-muted-foreground uppercase">Cost</p>
                  <p className="text-lg font-bold text-red-500">${(selectedOrder.provider_cost || 0).toFixed(2)}</p>
                </div>
              </div>

              {selectedOrder.provider_cost !== undefined && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Net Profit</span>
                    <span
                      className={cn(
                        "text-lg font-bold",
                        selectedOrder.price - selectedOrder.provider_cost >= 0 ? "text-green-600" : "text-red-500",
                      )}
                    >
                      ${(selectedOrder.price - selectedOrder.provider_cost).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {["pending", "in_progress", "completed", "cancelled"].map((status) => (
                  <Button
                    key={status}
                    variant={selectedOrder.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateOrderStatus(selectedOrder.id, status as Order["status"])}
                    disabled={selectedOrder.status === status}
                    className="capitalize flex-1"
                  >
                    {status.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default OrderManagement;
