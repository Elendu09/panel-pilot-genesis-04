import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Loader2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Package,
  Zap,
  Timer,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow, format, addHours } from "date-fns";
import BuyerLayout from "./BuyerLayout";
import ServiceReviewDialog from "@/components/buyer/ServiceReviewDialog";

interface Order {
  id: string;
  order_number: string;
  target_url: string;
  quantity: number;
  price: number;
  status: string;
  progress: number;
  start_count: number | null;
  remains: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  estimated_completion: string | null;
  service_id: string;
  service?: { name: string; estimated_time?: string } | null;
}

const BuyerOrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { buyer } = useBuyerAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  useEffect(() => {
    if (orderId && buyer?.id) {
      fetchOrder();
      subscribeToOrder();
    }
  }, [orderId, buyer?.id]);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, service:services(name, estimated_time)`)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({ title: "Order not found", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToOrder = () => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          setOrder(prev => prev ? { ...prev, ...payload.new } : null);
          toast({ title: "Order updated", description: "Status has changed" });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrder();
    setRefreshing(false);
    toast({ title: "Refreshed" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!" });
  };

  const statusSteps = [
    { status: 'pending', label: 'Pending', icon: Clock, description: 'Order received' },
    { status: 'in_progress', label: 'Processing', icon: Loader2, description: 'Order is being processed' },
    { status: 'completed', label: 'Completed', icon: CheckCircle, description: 'Order completed' },
  ];

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    if (status === 'partial') return 2;
    return statusSteps.findIndex(s => s.status === status);
  };

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
    in_progress: { label: 'In Progress', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    completed: { label: 'Completed', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
    partial: { label: 'Partial', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    cancelled: { label: 'Cancelled', color: 'text-red-500', bgColor: 'bg-red-500/10' },
  };

  if (loading) {
    return (
      <BuyerLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </BuyerLayout>
    );
  }

  if (!order) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </div>
      </BuyerLayout>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const config = statusConfig[order.status] || statusConfig.pending;
  
  // Calculate estimated completion
  const estimatedCompletion = order.estimated_completion 
    ? new Date(order.estimated_completion)
    : order.started_at 
      ? addHours(new Date(order.started_at), 2) 
      : addHours(new Date(order.created_at), 4);

  return (
    <BuyerLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/orders">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">Order Tracking</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{order.order_number}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(order.order_number)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Status Card */}
        <Card className="glass-card overflow-hidden">
          <div className={cn("p-4 border-b", config.bgColor)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-background/50", config.color)}>
                  {order.status === 'in_progress' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : order.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : order.status === 'cancelled' ? (
                    <XCircle className="w-5 h-5" />
                  ) : order.status === 'partial' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className={cn("font-semibold", config.color)}>{config.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Last updated {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={cn(config.bgColor, config.color)}>
                {order.progress}%
              </Badge>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{order.progress}%</span>
              </div>
              <Progress value={order.progress} className="h-3" />
              {order.remains !== null && order.remains > 0 && (
                <p className="text-xs text-muted-foreground">
                  {order.remains.toLocaleString()} remaining
                </p>
              )}
            </div>

            {/* Progress Steps */}
            {order.status !== 'cancelled' && (
              <div className="relative">
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />
                {statusSteps.map((step, index) => {
                  const isCompleted = currentStatusIndex > index || order.status === 'completed';
                  const isCurrent = currentStatusIndex === index;
                  const StepIcon = step.icon;

                  return (
                    <motion.div
                      key={step.status}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start gap-4 pb-6 last:pb-0"
                    >
                      <div className={cn(
                        "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        isCompleted 
                          ? "bg-emerald-500 text-white" 
                          : isCurrent 
                            ? "bg-blue-500 text-white" 
                            : "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : isCurrent && order.status === 'in_progress' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="pt-2">
                        <p className={cn(
                          "font-medium",
                          (isCompleted || isCurrent) && "text-foreground",
                          !isCompleted && !isCurrent && "text-muted-foreground"
                        )}>
                          {step.label}
                        </p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {isCurrent && order.status === 'in_progress' && (
                          <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Currently processing...
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Estimated Completion */}
            {order.status === 'in_progress' && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <Timer className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Estimated Completion</p>
                  <p className="text-xs text-muted-foreground">
                    {format(estimatedCompletion, "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="glass-card">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="w-4 h-4" />
              Order Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="font-medium">{order.service?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="font-medium">{order.quantity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Price</p>
                <p className="font-bold text-lg">${order.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Start Count</p>
                <p className="font-medium">{order.start_count?.toLocaleString() || '—'}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Target URL</p>
              <a 
                href={order.target_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                {order.target_url}
              </a>
            </div>

            <div className="pt-4 border-t text-xs text-muted-foreground">
              <p>Created: {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
              {order.started_at && (
                <p>Started: {format(new Date(order.started_at), "MMM d, yyyy 'at' h:mm a")}</p>
              )}
              {order.completed_at && (
                <p>Completed: {format(new Date(order.completed_at), "MMM d, yyyy 'at' h:mm a")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review Button */}
        {order.status === 'completed' && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">Rate this service</p>
                    <p className="text-sm text-muted-foreground">Help others by sharing your experience</p>
                  </div>
                </div>
                <Button onClick={() => setShowReviewDialog(true)}>
                  Write Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Dialog */}
        <ServiceReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          orderId={order.id}
          serviceId={order.service_id}
          serviceName={order.service?.name || 'Service'}
          onReviewSubmitted={() => toast({ title: "Thank you for your review!" })}
        />
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerOrderTracking;
