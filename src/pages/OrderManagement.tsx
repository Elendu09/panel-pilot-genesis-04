import { useState, useEffect, useCallback, useMemo } from "react";
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
  Activity,
  Search,
  Eye,
  RefreshCw,
  Calendar,
  ExternalLink,
  Loader2,
  ChevronDown,
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
  status: "pending" | "in_progress" | "completed" | "cancelled" | "partial" | "processing" | "awaiting_payment";
  start_count: number;
  remains: number;
  progress: number;
  created_at: string;
  updated_at: string;
  service?: {
    name: string;
    category: string;
    provider_cost?: number;
    provider?: { name: string } | null;
  };
  buyer?: {
    email: string;
    full_name: string;
  };
}

const ITEMS_PER_PAGE = 25;

const OrderManagement = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPanelId, setCurrentPanelId] = useState<string | null>(null);

  // 1. SECURITY: Fetch confirmed Panel ID first
  useEffect(() => {
    const getPanelId = async () => {
      if (!user || !profile) return;
      const { data, error } = await supabase.from("panels").select("id").eq("owner_id", profile.id).maybeSingle();
      if (data) setCurrentPanelId(data.id);
    };
    getPanelId();
  }, [user, profile]);

  // 2. ACTUAL PAGINATION: fetch function
  const fetchOrders = useCallback(
    async (isLoadMore = false) => {
      if (!user || !currentPanelId) return;

      if (isLoadMore) setFetchingMore(true);
      else setLoading(true);

      try {
        let query = supabase
          .from("orders")
          .select(
            `
          *,
          service:services(name, category, provider_cost, provider:providers(name)),
          buyer:client_users!orders_buyer_id_fkey(email, full_name)
        `,
          )
          .eq("panel_id", currentPanelId)
          .order("created_at", { ascending: false });

        // Apply range for pagination
        const from = isLoadMore ? orders.length : 0;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, error } = await query;

        if (error) throw error;

        if (isLoadMore) {
          setOrders((prev) => [...prev, ...(data || [])]);
        } else {
          setOrders(data || []);
        }

        setHasMore(data?.length === ITEMS_PER_PAGE);
      } catch (error: any) {
        console.error("Error fetching orders:", error);
        toast({ variant: "destructive", title: "Fetch Error", description: error.message });
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [user, currentPanelId, orders.length, toast],
  );

  useEffect(() => {
    if (currentPanelId) fetchOrders();
  }, [currentPanelId]);

  // 3. SECURITY: Update status with ownership check
  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    if (!currentPanelId) return;
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .eq("panel_id", currentPanelId); // Ensure owner owns this specific order

      if (error) throw error;

      // Update local state instead of full refresh for smoother UX
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));

      toast({ title: "Status Updated", description: `Order is now ${newStatus}` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.target_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 4. PERFORMANCE: Memoized Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const pending = orders.filter((o) =>
      ["pending", "processing", "awaiting_payment", "in_progress"].includes(o.status),
    ).length;
    const revenue = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const cost = orders.reduce((sum, o) => sum + (o.provider_cost || o.service?.provider_cost || 0), 0);
    const profit = revenue - cost;
    const conv = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, pending, revenue, profit, conv };
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "partial":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      instagram: "📸",
      youtube: "🎥",
      tiktok: "🎵",
      twitter: "🐦",
      facebook: "👥",
      linkedin: "💼",
    };
    return icons[category.toLowerCase()] || "🌟";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
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
        <title>Order Management - Panel Owner</title>
      </Helmet>
      <Navigation />

      <section className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Order Management</h1>
                <p className="text-muted-foreground text-sm">Control panel for all tenant orders</p>
              </div>
              <Button onClick={() => fetchOrders(false)} variant="outline" className="gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Total" value={stats.total} Icon={ShoppingCart} />
              <StatCard label="Completed" value={stats.completed} Icon={CheckCircle} />
              <StatCard label="Pending" value={stats.pending} Icon={Clock} />
              <StatCard label="Revenue" value={`$${stats.revenue.toFixed(2)}`} Icon={DollarSign} />
              <StatCard label="Profit" value={`$${stats.profit.toFixed(2)}`} Icon={TrendingUp} />
              <StatCard label="Success" value={`${stats.conv.toFixed(1)}%`} Icon={Activity} />
            </div>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search Order #, URL, or Service..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-background/50"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {["pending", "processing", "in_progress", "completed", "cancelled", "partial"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border border-border/40">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead className="hidden md:table-cell">Customer</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Progress</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/20">
                          <TableCell className="font-mono text-xs font-bold">{order.order_number}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{getCategoryIcon(order.service?.category || "")}</span>
                              <span className="truncate max-w-[150px] text-xs font-medium">{order.service?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="text-xs">
                              <p className="font-semibold">{order.buyer?.full_name}</p>
                              <p className="text-muted-foreground">{order.buyer?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-bold">${order.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={cn("text-[10px] h-5", getStatusColor(order.status))}>
                              <span className="capitalize">{order.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="w-16">
                              <Progress value={order.progress} className="h-1" />
                              <span className="text-[10px] text-muted-foreground">{order.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* PAGINATION: Load More Button */}
                {hasMore && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => fetchOrders(true)}
                      disabled={fetchingMore}
                      className="w-full max-w-xs gap-2"
                    >
                      {fetchingMore ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      Load More Orders
                    </Button>
                  </div>
                )}

                {loading && (
                  <div className="py-20 text-center">
                    <Loader2 className="mx-auto w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
                {!loading && filteredOrders.length === 0 && (
                  <div className="py-20 text-center text-muted-foreground">No orders found matching your criteria.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">Order Details: {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <DetailItem label="Service Name" value={selectedOrder.service?.name} />
                <DetailItem label="Target URL" value={selectedOrder.target_url} isLink />
                <DetailItem label="Quantity" value={selectedOrder.quantity.toLocaleString()} />
                <DetailItem label="Status" value={selectedOrder.status.toUpperCase()} />
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <h4 className="text-xs font-bold uppercase text-primary mb-3">Profit Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Selling Price:</span>
                      <span className="font-bold text-green-500">${selectedOrder.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Provider Cost:</span>
                      <span className="font-bold text-red-500">-${(selectedOrder.provider_cost || 0).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Your Profit:</span>
                      <span className="text-primary">
                        ${(selectedOrder.price - (selectedOrder.provider_cost || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Update Status</Label>
                  <Select onValueChange={(v) => updateOrderStatus(selectedOrder.id, v as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {["pending", "processing", "in_progress", "completed", "cancelled", "partial"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

// Helper Components
const StatCard = ({ label, value, Icon }: any) => (
  <Card className="bg-card/40 border-border/40">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-[10px] uppercase font-bold text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
      <Icon className="w-5 h-5 text-primary/40" />
    </CardContent>
  </Card>
);

const DetailItem = ({ label, value, isLink }: any) => (
  <div>
    <p className="text-[10px] uppercase text-muted-foreground font-bold">{label}</p>
    {isLink ? (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-primary hover:underline break-all inline-flex items-center gap-1"
      >
        {value} <ExternalLink className="w-3 h-3" />
      </a>
    ) : (
      <p className="text-sm font-medium">{value || "—"}</p>
    )}
  </div>
);

export default OrderManagement;
