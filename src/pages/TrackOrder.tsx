import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Search, Package, Clock, CheckCircle, AlertCircle, Loader2, 
  ArrowRight, RefreshCw, ExternalLink, Copy, Check, Zap,
  Timer, Target, TrendingUp, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Order number validation schema
const orderNumberSchema = z.string()
  .trim()
  .min(1, "Order number is required")
  .max(50, "Order number is too long")
  .regex(/^[A-Za-z0-9\-]+$/, "Invalid order number format");

interface OrderData {
  orderNumber: string;
  status: string;
  quantity: number;
  targetUrl: string;
  progress: number;
  startCount: number | null;
  remains: number | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  estimatedCompletion: string | null;
  serviceName: string;
  panelName: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
  pending: { 
    label: 'Pending', 
    color: 'text-amber-500', 
    icon: Clock,
    bgColor: 'bg-amber-500/10 border-amber-500/20'
  },
  processing: { 
    label: 'Processing', 
    color: 'text-blue-500', 
    icon: RefreshCw,
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'text-blue-500', 
    icon: TrendingUp,
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  completed: { 
    label: 'Completed', 
    color: 'text-green-500', 
    icon: CheckCircle,
    bgColor: 'bg-green-500/10 border-green-500/20'
  },
  partial: { 
    label: 'Partial', 
    color: 'text-orange-500', 
    icon: AlertCircle,
    bgColor: 'bg-orange-500/10 border-orange-500/20'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'text-red-500', 
    icon: AlertCircle,
    bgColor: 'bg-red-500/10 border-red-500/20'
  },
  refunded: { 
    label: 'Refunded', 
    color: 'text-purple-500', 
    icon: RefreshCw,
    bgColor: 'bg-purple-500/10 border-purple-500/20'
  },
};

const TrackOrder = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async () => {
    // Validate input
    const validation = orderNumberSchema.safeParse(orderNumber);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('track-order', {
        body: { orderNumber: validation.data }
      });

      if (fnError) throw fnError;

      if (data.error) {
        if (data.notFound) {
          setError("Order not found. Please check your order number and try again.");
        } else {
          setError(data.error);
        }
        return;
      }

      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (err: any) {
      console.error('Track order error:', err);
      setError("Failed to fetch order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  const copyOrderNumber = async () => {
    if (order) {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Order number copied to clipboard" });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <>
      <Helmet>
        <title>Track Order | Check Your Order Status</title>
        <meta name="description" content="Track your order status in real-time. Enter your order number to see the current progress." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-slate-900/50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 text-gray-400 hover:text-white"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-white">Order Tracker</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="relative z-10 container mx-auto px-4 py-8 md:py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Zap className="w-3 h-3 mr-1" />
              Real-time Tracking
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Track Your Order
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              Enter your order number to check the current status and progress of your order
            </p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mb-10"
          >
            <Card className="bg-slate-900/80 border-white/10 backdrop-blur-xl shadow-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Enter order number (e.g., ORD-ABC123)"
                      value={orderNumber}
                      onChange={(e) => {
                        setOrderNumber(e.target.value.toUpperCase());
                        setError(null);
                      }}
                      onKeyPress={handleKeyPress}
                      className="h-14 pl-12 pr-4 bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 text-lg"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading || !orderNumber.trim()}
                    className="h-14 px-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Track
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-red-400 text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Result */}
          <AnimatePresence mode="wait">
            {order && (
              <motion.div
                key="order-result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl mx-auto"
              >
                {/* Status Card */}
                <Card className="bg-slate-900/80 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden mb-6">
                  {/* Status Header */}
                  <div className={cn(
                    "p-6 border-b",
                    getStatusInfo(order.status).bgColor
                  )}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-xl",
                          getStatusInfo(order.status).bgColor
                        )}>
                          {(() => {
                            const StatusIcon = getStatusInfo(order.status).icon;
                            return <StatusIcon className={cn("w-8 h-8", getStatusInfo(order.status).color)} />;
                          })()}
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Order Status</p>
                          <h2 className={cn(
                            "text-2xl font-bold",
                            getStatusInfo(order.status).color
                          )}>
                            {getStatusInfo(order.status).label}
                          </h2>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-white border-white/20 bg-white/5 px-4 py-2 text-base font-mono cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={copyOrderNumber}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 mr-2 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        {order.orderNumber}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Progress Bar */}
                    {(order.status === 'processing' || order.status === 'in_progress') && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Progress</span>
                          <span className="text-sm font-bold text-blue-400">{order.progress}%</span>
                        </div>
                        <Progress value={order.progress} className="h-3 bg-slate-800" />
                      </div>
                    )}

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Service */}
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-gray-400">Service</span>
                        </div>
                        <p className="text-white font-medium truncate">{order.serviceName}</p>
                      </div>

                      {/* Quantity */}
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                        <div className="flex items-center gap-3 mb-2">
                          <Target className="w-5 h-5 text-purple-400" />
                          <span className="text-sm text-gray-400">Quantity</span>
                        </div>
                        <p className="text-white font-medium">{order.quantity.toLocaleString()}</p>
                      </div>

                      {/* Start Count */}
                      {order.startCount !== null && (
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                          <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <span className="text-sm text-gray-400">Start Count</span>
                          </div>
                          <p className="text-white font-medium">{order.startCount.toLocaleString()}</p>
                        </div>
                      )}

                      {/* Remains */}
                      {order.remains !== null && (
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                          <div className="flex items-center gap-3 mb-2">
                            <Timer className="w-5 h-5 text-amber-400" />
                            <span className="text-sm text-gray-400">Remaining</span>
                          </div>
                          <p className="text-white font-medium">{order.remains.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Target URL */}
                    <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <ExternalLink className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm text-gray-400">Target Link</span>
                      </div>
                      <a 
                        href={order.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline truncate block"
                      >
                        {order.targetUrl}
                      </a>
                    </div>

                    {/* Timestamps */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Created</p>
                          <p className="text-sm text-gray-300">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Started</p>
                          <p className="text-sm text-gray-300">{formatDate(order.startedAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Completed</p>
                          <p className="text-sm text-gray-300">{formatDate(order.completedAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Panel Info */}
                    <div className="mt-6 flex items-center justify-center">
                      <Badge variant="outline" className="text-gray-400 border-white/10">
                        Fulfilled by {order.panelName}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOrder(null);
                      setOrderNumber('');
                    }}
                    className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Track Another Order
                  </Button>
                  <Button
                    onClick={handleSearch}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Section */}
          {!order && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto mt-16 text-center"
            >
              <h3 className="text-lg font-semibold text-white mb-4">How to Track Your Order</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <p className="text-sm text-gray-400">Find your order number from your email or order confirmation</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <p className="text-sm text-gray-400">Enter the order number in the search box above</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <p className="text-sm text-gray-400">View real-time status and progress of your order</p>
                </div>
              </div>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 py-6 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-500">
              Need help? <a href="/contact" className="text-blue-400 hover:underline">Contact Support</a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default TrackOrder;