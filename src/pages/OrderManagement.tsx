import { useState, useEffect } from "react";
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
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  ArrowUpDown,
  ExternalLink
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
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'partial' | 'processing' | 'awaiting_payment';
  start_count: number;
  remains: number;
  progress: number;
  created_at: string;
  updated_at: string;
  service?: {
    name: string;
    category: string;
    provider_cost?: number;
    provider?: {
      name: string;
    } | null;
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

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, profile]);

  const fetchOrders = async () => {
    try {
      let query = (supabase as any).from('orders').select(`
        *, provider_cost, provider_id, provider_order_id, notes,
        service:services(name, category, provider_cost, provider:providers(name)),
        buyer:client_users!orders_buyer_id_fkey(email, full_name)
      `);

      // If panel owner, only show orders for their panel
      if (profile?.role === 'panel_owner') {
        const { data: panelData } = await supabase
          .from('panels')
          .select('id')
          .eq('owner_id', profile.id)
          .single();

        if (panelData) {
          query = query.eq('panel_id', panelData.id);
        }
      }

      const { data: ordersData } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load orders"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'partial') => {
    try {
      await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      fetchOrders();
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status"
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.target_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.service?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders = orders.filter(o => ['pending', 'processing', 'awaiting_payment', 'in_progress'].includes(o.status || '')).length;
  const totalOrderAmount = orders.reduce((sum, order) => sum + (order.price || 0), 0);
  const profitFromOrders = orders.reduce((sum, order) => {
    const cost = order.provider_cost || order.service?.provider_cost || 0;
    return sum + ((order.price || 0) - cost);
  }, 0);
  const conversionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'in_progress':
        return <Activity className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3" />;
      case 'partial':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      case 'partial':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      instagram: '📸',
      youtube: '🎥', 
      tiktok: '🎵',
      twitter: '🐦',
      facebook: '👥',
      linkedin: '💼'
    };
    return icons[category] || '🌟';
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
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Total Orders</p>
                      <p className="text-xl font-bold text-primary">{totalOrders}</p>
                    </div>
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Completed</p>
                      <p className="text-xl font-bold text-primary">{completedOrders}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Pending</p>
                      <p className="text-xl font-bold text-primary">{pendingOrders}</p>
                    </div>
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Total Order Amount</p>
                      <p className="text-xl font-bold text-primary">${totalOrderAmount.toFixed(2)}</p>
                    </div>
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Profit from Orders</p>
                      <p className="text-xl font-bold text-primary">${profitFromOrders.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Conversion Rate</p>
                      <p className="text-xl font-bold text-primary">{conversionRate.toFixed(1)}%</p>
                    </div>
                    <Activity className="w-6 h-6 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <Card className="bg-gradient-card border-border shadow-card">
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders by number, service, or URL..."
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
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-8 h-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading orders...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Target URL</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="font-mono text-sm">{order.order_number}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {getCategoryIcon(order.service?.category || '')}
                              </span>
                              <div>
                                <p className="font-medium">{order.service?.name}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {order.service?.category}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {order.service?.provider?.name || '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[120px]">
                              <p className="font-medium truncate">{order.buyer?.full_name || 'No Name'}</p>
                              <p className="text-sm text-muted-foreground truncate">{order.buyer?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-sm truncate max-w-[200px]">
                                {order.target_url}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => window.open(order.target_url, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{order.quantity?.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">${order.price?.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-20">
                              <Progress value={order.progress || 0} className="h-2" />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(order.progress || 0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => setSelectedOrder(order)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {!loading && filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground">
                      {orders.length === 0 
                        ? "No orders have been placed yet" 
                        : "Try adjusting your search or filter criteria"
                      }
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
        <DialogContent className="max-w-lg p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 text-sm">
              {/* Row 1: Order # + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Order #</p>
                  <p className="font-mono text-xs font-semibold break-all">{selectedOrder.order_number}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Status</p>
                  <Badge className={cn("mt-0.5", getStatusColor(selectedOrder.status))}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1 capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </div>

              {/* Row 2: Service + Provider */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Service</p>
                  <p className="font-medium text-xs leading-snug">{selectedOrder.service?.name || 'Deleted service'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Provider</p>
                  <p className="text-xs">{selectedOrder.service?.provider?.name || '—'}</p>
                </div>
              </div>

              {/* Row 3: Customer + Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Customer</p>
                  <p className="font-medium text-xs">{selectedOrder.buyer?.full_name || 'N/A'}</p>
                  <p className="text-muted-foreground text-[10px] break-all">{selectedOrder.buyer?.email}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Quantity / Start</p>
                  <p className="font-medium text-xs">{selectedOrder.quantity?.toLocaleString()}</p>
                  <p className="text-muted-foreground text-[10px]">Start: {selectedOrder.start_count ?? '—'}</p>
                </div>
              </div>

              {/* Target URL */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Target URL</p>
                <div className="flex items-center gap-2">
                  <p className="break-all text-xs flex-1">{selectedOrder.target_url}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0"
                    onClick={() => {
                      const url = selectedOrder.target_url;
                      const finalUrl = url.startsWith('http') ? url : (url.startsWith('@') ? `https://instagram.com/${url.replace('@', '')}` : `https://${url}`);
                      window.open(finalUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Earnings Breakdown</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Customer Paid</p>
                    <p className="text-sm font-bold text-green-500">${selectedOrder.price?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Provider Cost</p>
                    <p className="text-sm font-bold text-red-500">-${(selectedOrder.provider_cost || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Your Profit</p>
                    <p className={cn(
                      "text-sm font-bold",
                      (selectedOrder.price - (selectedOrder.provider_cost || 0)) >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      ${(selectedOrder.price - (selectedOrder.provider_cost || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Progress</p>
                <Progress value={selectedOrder.progress || 0} className="h-2 mt-1" />
                <span className="text-xs text-muted-foreground">{Math.round(selectedOrder.progress || 0)}%</span>
              </div>

              {/* Provider Order ID + Notes */}
              <div className="grid grid-cols-2 gap-3">
                {selectedOrder.provider_order_id && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Provider Order ID</p>
                    <p className="font-mono text-xs">{selectedOrder.provider_order_id}</p>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Notes</p>
                    <p className="text-xs">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Created</p>
                  <p className="text-xs">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-medium mb-1">Updated</p>
                  <p className="text-xs">{new Date(selectedOrder.updated_at).toLocaleString()}</p>
                </div>
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