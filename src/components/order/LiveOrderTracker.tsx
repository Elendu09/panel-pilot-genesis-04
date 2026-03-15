import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Clock, Loader2, Package, Zap, 
  ArrowRight, Copy, ExternalLink, RefreshCw,
  TrendingUp, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  status: string;
  progress: number;
  quantity: number;
  start_count: number;
  remains: number;
  target_url: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  estimated_completion: string | null;
}

interface LiveOrderTrackerProps {
  orderId: string;
  orderNumber: string;
  themeMode?: string;
  buyerApiKey?: string;
  onTrackAnother?: () => void;
  onViewAllOrders?: () => void;
}

const statusConfig: Record<string, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: React.ElementType;
  description: string;
}> = {
  pending: { 
    label: 'Pending', 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
    icon: Clock,
    description: 'Your order is queued and will start soon'
  },
  processing: { 
    label: 'Processing', 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    icon: Loader2,
    description: 'Order is being processed by our system'
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'text-cyan-500', 
    bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    icon: Zap,
    description: 'Delivery is actively in progress'
  },
  completed: { 
    label: 'Completed', 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10 border-green-500/30',
    icon: CheckCircle,
    description: 'Order has been fully delivered'
  },
  partial: { 
    label: 'Partial', 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/10 border-orange-500/30',
    icon: AlertCircle,
    description: 'Partial delivery completed'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10 border-red-500/30',
    icon: AlertCircle,
    description: 'Order has been cancelled'
  },
  refunded: { 
    label: 'Refunded', 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    icon: RefreshCw,
    description: 'Order has been refunded'
  },
};

export const LiveOrderTracker = ({ 
  orderId, 
  orderNumber, 
  themeMode = 'dark',
  buyerApiKey,
  onTrackAnother,
  onViewAllOrders
}: LiveOrderTrackerProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch initial order data via edge function (bypasses RLS)
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Get buyer API key from localStorage (set during buyer auth)
        const buyerApiKey = localStorage.getItem('buyer_api_key') || '';
        const panelApiKey = localStorage.getItem('panel_api_key') || '';
        const apiKey = buyerApiKey || panelApiKey;
        
        if (apiKey) {
          // Use buyer-api edge function to bypass RLS
          const { data, error } = await supabase.functions.invoke('buyer-api', {
            body: { key: apiKey, action: 'get-order', orderId }
          });
          
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          setOrder(data);
        } else {
          // Fallback: direct query (may fail due to RLS, but try)
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
          if (error) throw error;
          setOrder(data);
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        toast({ title: 'Failed to load order', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updatedOrder = payload.new as Order;
          setOrder(updatedOrder);
          setLastUpdate(new Date());
          
          // Show toast for status changes
          const oldStatus = order?.status;
          if (oldStatus && oldStatus !== updatedOrder.status) {
            const statusInfo = statusConfig[updatedOrder.status] || statusConfig.pending;
            toast({
              title: `Order Status: ${statusInfo.label}`,
              description: statusInfo.description,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, order?.status]);

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast({ title: 'Order number copied!' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const cardBg = themeMode === 'dark' 
    ? 'bg-gray-900/80 backdrop-blur-xl border-gray-800' 
    : 'bg-white backdrop-blur-xl border-gray-200 shadow-xl';

  if (loading) {
    return (
      <Card className={cn("border rounded-3xl overflow-hidden", cardBg)}>
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className={cn(
              "w-12 h-12",
              themeMode === 'dark' ? 'text-blue-400' : 'text-blue-500'
            )} />
          </motion.div>
          <p className={cn(
            "mt-4 text-sm",
            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}>
            Loading order status...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className={cn("border rounded-3xl overflow-hidden", cardBg)}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className={cn(
            "text-lg font-bold mb-2",
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Order Not Found
          </h3>
          <p className={cn(
            "text-sm mb-4",
            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}>
            Unable to load order details
          </p>
          {onTrackAnother && (
            <Button onClick={onTrackAnother} variant="outline">
              Track Another Order
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const progress = order.progress || 0;
  const delivered = order.quantity - (order.remains || 0);
  const isComplete = order.status === 'completed';
  const isActive = ['processing', 'in_progress'].includes(order.status);

  return (
    <Card className={cn("border rounded-3xl overflow-hidden", cardBg)}>
      <CardContent className="p-6 md:p-8">
        {/* Header with success animation */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4",
              isComplete ? 'bg-green-500/20' : status.bgColor,
              "border-2",
              isComplete ? 'border-green-500/50' : 'border-current'
            )}
          >
            {isActive ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <StatusIcon className={cn("w-10 h-10", status.color)} />
              </motion.div>
            ) : (
              <StatusIcon className={cn("w-10 h-10", status.color)} />
            )}
          </motion.div>
          
          <Badge className={cn("mb-3 text-sm font-medium", status.bgColor, status.color, "border")}>
            {status.label}
          </Badge>
          
          <h2 className={cn(
            "text-2xl font-bold tracking-tight mb-2",
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {isComplete ? 'Order Completed!' : 'Order In Progress'}
          </h2>
          
          <p className={cn(
            "text-sm",
            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )}>
            {status.description}
          </p>
        </motion.div>

        {/* Order Number */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "flex items-center justify-center gap-3 p-4 rounded-2xl mb-6",
            themeMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
          )}
        >
          <Package className={cn(
            "w-5 h-5",
            themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
          )} />
          <span className={cn(
            "font-mono text-lg font-bold tracking-wider",
            themeMode === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            {orderNumber}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyOrderNumber}
            className={cn(
              "h-8 w-8 p-0",
              themeMode === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            )}
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className={cn(
                "w-4 h-4",
                themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )} />
            )}
          </Button>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              "text-sm font-medium",
              themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'
            )}>
              Delivery Progress
            </span>
            <div className="flex items-center gap-2">
              <TrendingUp className={cn(
                "w-4 h-4",
                themeMode === 'dark' ? 'text-blue-400' : 'text-blue-500'
              )} />
              <span className={cn(
                "text-lg font-bold tabular-nums",
                themeMode === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          
          <div className={cn(
            "h-4 rounded-full overflow-hidden",
            themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
          )}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                "h-full rounded-full relative",
                isComplete 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400',
                themeMode === 'light' && 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'
              )}
            >
              {/* Shimmer effect for active orders */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className={cn(
            "p-4 rounded-2xl text-center",
            themeMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
          )}>
            <div className={cn(
              "text-2xl font-bold tabular-nums",
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {order.quantity.toLocaleString()}
            </div>
            <div className={cn(
              "text-xs font-medium",
              themeMode === 'dark' ? 'text-gray-500' : 'text-gray-500'
            )}>
              Ordered
            </div>
          </div>
          
          <div className={cn(
            "p-4 rounded-2xl text-center",
            themeMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
          )}>
            <div className={cn(
              "text-2xl font-bold tabular-nums",
              isComplete ? 'text-green-500' : themeMode === 'dark' ? 'text-blue-400' : 'text-blue-500'
            )}>
              {delivered.toLocaleString()}
            </div>
            <div className={cn(
              "text-xs font-medium",
              themeMode === 'dark' ? 'text-gray-500' : 'text-gray-500'
            )}>
              Delivered
            </div>
          </div>
          
          <div className={cn(
            "p-4 rounded-2xl text-center",
            themeMode === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
          )}>
            <div className={cn(
              "text-2xl font-bold tabular-nums",
              themeMode === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              {(order.remains || 0).toLocaleString()}
            </div>
            <div className={cn(
              "text-xs font-medium",
              themeMode === 'dark' ? 'text-gray-500' : 'text-gray-500'
            )}>
              Remaining
            </div>
          </div>
        </motion.div>

        {/* Live Update Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-xl mb-6",
            themeMode === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
          )}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <span className={cn(
            "text-xs font-medium",
            themeMode === 'dark' ? 'text-green-400' : 'text-green-600'
          )}>
            Live tracking enabled • Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {onViewAllOrders && (
            <Button
              onClick={onViewAllOrders}
              className={cn(
                "flex-1 h-12 text-white font-semibold",
                themeMode === 'dark'
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-blue-500 hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
              )}
            >
              View All Orders
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          
          {onTrackAnother && (
            <Button
              onClick={onTrackAnother}
              variant="outline"
              className={cn(
                "flex-1 h-12 font-semibold",
                themeMode === 'dark' 
                  ? 'border-gray-700 hover:bg-gray-800' 
                  : 'border-gray-300 hover:bg-gray-100'
              )}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Order
            </Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default LiveOrderTracker;
