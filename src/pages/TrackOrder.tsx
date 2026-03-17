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
import { useTenant } from '@/hooks/useTenant';
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
    color: 'text-amber-600 dark:text-amber-500', 
    icon: Clock,
    bgColor: 'bg-amber-500/10 border-amber-500/20'
  },
  processing: { 
    label: 'Processing', 
    color: 'text-blue-600 dark:text-blue-500', 
    icon: RefreshCw,
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'text-blue-600 dark:text-blue-500', 
    icon: TrendingUp,
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  completed: { 
    label: 'Completed', 
    color: 'text-green-600 dark:text-green-500', 
    icon: CheckCircle,
    bgColor: 'bg-green-500/10 border-green-500/20'
  },
  partial: { 
    label: 'Partial', 
    color: 'text-orange-600 dark:text-orange-500', 
    icon: AlertCircle,
    bgColor: 'bg-orange-500/10 border-orange-500/20'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'text-red-600 dark:text-red-500', 
    icon: AlertCircle,
    bgColor: 'bg-red-500/10 border-red-500/20'
  },
  refunded: { 
    label: 'Refunded', 
    color: 'text-purple-600 dark:text-purple-500', 
    icon: RefreshCw,
    bgColor: 'bg-purple-500/10 border-purple-500/20'
  },
};

const TrackOrder = () => {
  const navigate = useNavigate();
  const { panel } = useTenant();
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
        body: { orderNumber: validation.data, panelId: panel?.id }
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

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-border backdrop-blur-xl bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              <span className="font-bold text-foreground">Order Tracker</span>
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
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Real-time Tracking
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Track Your Order
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
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
            <Card className="bg-card/80 border-border backdrop-blur-xl shadow-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter order number (e.g., ORD-ABC123)"
                      value={orderNumber}
                      onChange={(e) => {
                        setOrderNumber(e.target.value.toUpperCase());
                        setError(null);
                      }}
                      onKeyPress={handleKeyPress}
                      className="h-14 pl-12 pr-4 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground text-lg"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading || !orderNumber.trim()}
                    className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
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
                    className="mt-3 text-destructive text-sm flex items-center gap-2"
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
                <Card className="bg-card/80 border-border backdrop-blur-xl shadow-2xl overflow-hidden mb-6">
                  {/* Status Header */}
                  <div className={cn(
                    "p-6 border-b border-border",
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
                          <p className="text-sm text-muted-foreground mb-1">Order Status</p>
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
                        className="text-foreground border-border bg-muted/50 px-4 py-2 text-base font-mono cursor-pointer hover:bg-muted transition-colors"
                        onClick={copyOrderNumber}
                      >
                        {copied ? (
                          <Check className="w-4 h-4 mr-2 text-green-500" />
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
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-bold text-primary">{order.progress}%</span>
                        </div>
                        <Progress value={order.progress} className="h-3 bg-muted" />
                      </div>
                    )}

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Service */}
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center gap-3 mb-2">
                          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-muted-foreground">Service</span>
                        </div>
                        <p className="text-foreground font-medium truncate">{order.serviceName}</p>
                      </div>

                      {/* Quantity */}
                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-center gap-3 mb-2">
                          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm text-muted-foreground">Quantity</span>
                        </div>
                        <p className="text-foreground font-medium">{order.quantity.toLocaleString()}</p>
                      </div>

                      {/* Start Count */}
                      {order.startCount !== null && (
                        <div className="p-4 rounded-xl bg-muted/50 border border-border">
                          <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-muted-foreground">Start Count</span>
                          </div>
                          <p className="text-foreground font-medium">{order.startCount.toLocaleString()}</p>
                        </div>
                      )}

                      {/* Remains */}
                      {order.remains !== null && (
                        <div className="p-4 rounded-xl bg-muted/50 border border-border">
                          <div className="flex items-center gap-3 mb-2">
                            <Timer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm text-muted-foreground">Remaining</span>
                          </div>
                          <p className="text-foreground font-medium">{order.remains.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Target URL */}
                    <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="flex items-center gap-3 mb-2">
                        <ExternalLink className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        <span className="text-sm text-muted-foreground">Target Link</span>
                      </div>
                      <a 
                        href={order.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline truncate block"
                      >
                        {order.targetUrl}
                      </a>
                    </div>

                    {/* Timestamps */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Created</p>
                          <p className="text-sm text-foreground">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Started</p>
                          <p className="text-sm text-foreground">{formatDate(order.startedAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Completed</p>
                          <p className="text-sm text-foreground">{formatDate(order.completedAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Panel Info */}
                    <div className="mt-6 flex items-center justify-center">
                      <Badge variant="outline" className="text-muted-foreground border-border">
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
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Track Another Order
                  </Button>
                  <Button
                    onClick={handleSearch}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty State */}
          {!order && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-xl mx-auto text-center"
            >
              <div className="p-8 rounded-2xl bg-card/50 border border-border">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to Track
                </h3>
                <p className="text-muted-foreground">
                  Enter your order number above to see real-time status updates
                </p>
              </div>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} HOME OF SMM. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default TrackOrder;
