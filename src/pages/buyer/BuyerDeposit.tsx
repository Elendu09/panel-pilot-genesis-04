import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  CreditCard, 
  DollarSign, 
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Loader2,
  AlertTriangle,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useTenant } from "@/hooks/useTenant";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import { BuyerInvoiceHistory } from "@/components/billing/BuyerInvoiceHistory";
import { useInvoiceGeneration } from "@/hooks/useInvoiceGeneration";

const defaultPaymentMethods = [
  { id: "stripe", name: "Card", icon: CreditCard, color: "from-blue-500 to-blue-600", badge: "Instant" },
  { id: "paypal", name: "PayPal", icon: DollarSign, color: "from-blue-400 to-blue-500", badge: "Instant" },
  { id: "crypto", name: "Crypto", icon: Sparkles, color: "from-orange-500 to-yellow-500", badge: "5-30 min" },
  { id: "perfectmoney", name: "Perfect Money", icon: Shield, color: "from-green-500 to-emerald-500", badge: "Instant" },
];

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  color: string;
  badge: string;
}

const quickAmounts = [10, 25, 50, 100, 250, 500];

interface Transaction {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

const BuyerDeposit = () => {
  const { buyer, refreshBuyer, loading: authLoading } = useBuyerAuth();
  const { panel, loading: panelLoading } = useTenant();
  const { generateInvoice } = useInvoiceGeneration();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [noPaymentGateway, setNoPaymentGateway] = useState(false);

  // Fetch enabled payment methods from panel settings
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!panel?.id) {
        setLoadingMethods(false);
        return;
      }
      
      try {
        const { data: panelData } = await supabase
          .from('panels')
          .select('settings')
          .eq('id', panel.id)
          .single();
        
        const panelSettings = panelData?.settings as Record<string, any> || {};
        const paymentSettings = panelSettings.payments || {};
        const enabledMethods = paymentSettings.enabledMethods || [];
        
        if (enabledMethods.length > 0) {
          // Filter to only show enabled methods that match configured gateways
          const filteredMethods = defaultPaymentMethods.filter(m => 
            enabledMethods.some((em: any) => 
              (typeof em === 'string' ? em === m.id : em.id === m.id) && 
              (typeof em === 'string' || em.enabled !== false)
            )
          );
          if (filteredMethods.length > 0) {
            setPaymentMethods(filteredMethods);
            setNoPaymentGateway(false);
          } else {
            setPaymentMethods([]);
            setNoPaymentGateway(true);
          }
        } else {
          // No payment methods configured
          setPaymentMethods([]);
          setNoPaymentGateway(true);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        setNoPaymentGateway(true);
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchPaymentMethods();
  }, [panel?.id]);

  // Fetch transaction history on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!buyer?.id) return;
      
      try {
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', buyer.id)
          .eq('type', 'deposit')
          .order('created_at', { ascending: false })
          .limit(10);
        
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchTransactions();
  }, [buyer?.id]);

  // Check for payment success/cancel URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const cancelled = params.get('cancelled');
    const transactionId = params.get('transaction_id');
    
    if (success === 'true' && transactionId) {
      // Payment was successful - verify and show confirmation
      toast({ 
        title: "Payment Successful!", 
        description: "Your balance will be updated shortly." 
      });
      // Refresh buyer data
      refreshBuyer();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (cancelled === 'true') {
      toast({ 
        variant: "destructive",
        title: "Payment Cancelled", 
        description: "Your deposit was not completed." 
      });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshBuyer]);

  const handleDeposit = async () => {
    if (!selectedMethod || !amount || parseFloat(amount) <= 0) {
      toast({ variant: "destructive", title: "Please select payment method and enter amount" });
      return;
    }

    if (!buyer?.id || !panel?.id) {
      toast({ variant: "destructive", title: "Error", description: "User or panel not found" });
      return;
    }

    setProcessing(true);

    try {
      const depositAmount = parseFloat(amount);

      // Create transaction record with pending status
      const { data: transaction, error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: buyer.id,
          panel_id: panel.id,
          amount: depositAmount,
          type: 'deposit',
          payment_method: selectedMethod,
          status: 'pending',
          description: `Deposit via ${paymentMethods.find(m => m.id === selectedMethod)?.name}`
        })
        .select()
        .single();

      if (transError) throw transError;

      // Call the payment processing edge function
      const response = await supabase.functions.invoke('process-payment', {
        body: {
          gateway: selectedMethod,
          amount: depositAmount,
          panelId: panel.id,
          buyerId: buyer.id,
          transactionId: transaction.id,
          returnUrl: window.location.origin + '/deposit',
          currency: 'usd'
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Payment processing failed');
      }

      const { redirectUrl, error: paymentError } = response.data || {};

      if (paymentError) {
        // Update transaction to failed
        await supabase
          .from('transactions')
          .update({ status: 'failed' })
          .eq('id', transaction.id);
        throw new Error(paymentError);
      }

      if (redirectUrl) {
        // Redirect to payment gateway
        window.location.href = redirectUrl;
      } else {
        // If no redirect (some gateways might complete instantly)
        toast({ 
          title: "Deposit Initiated", 
          description: "Your payment is being processed." 
        });
        setAmount("");
        setSelectedMethod(null);
      }

    } catch (error: any) {
      console.error('Deposit error:', error);
      toast({ 
        variant: "destructive", 
        title: "Deposit Failed", 
        description: error.message || "Please try again" 
      });
    } finally {
      setProcessing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Loading state
  if (panelLoading || authLoading) {
    return (
      <BuyerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </BuyerLayout>
    );
  }

  // Not authenticated
  if (!buyer) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-4 text-sm">Please sign in to add funds.</p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 md:space-y-6 max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Add Funds</h1>
          <p className="text-sm text-muted-foreground">Deposit money to purchase services</p>
        </motion.div>

        {/* Current Balance */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <Wallet className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-2xl md:text-3xl font-bold">${(buyer?.balance || 0).toFixed(2)}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs md:text-sm">
                  <Zap className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Amount Selection */}
        <motion.div variants={itemVariants} className="space-y-2 md:space-y-3">
          <Label className="text-sm md:text-base font-semibold">Quick Select Amount</Label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {quickAmounts.map((quickAmount, index) => (
              <motion.button
                key={quickAmount}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                onClick={() => setAmount(quickAmount.toString())}
                className={cn(
                  "p-3 md:p-4 rounded-xl border-2 transition-all duration-200 font-semibold text-sm md:text-base",
                  amount === quickAmount.toString()
                    ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20"
                    : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                ${quickAmount}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Custom Amount */}
        <motion.div variants={itemVariants} className="space-y-2">
          <Label className="text-sm">Custom Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-9 md:pl-10 text-base md:text-lg h-10 md:h-12 bg-card/50"
              min="1"
              step="0.01"
            />
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div variants={itemVariants} className="space-y-2 md:space-y-3">
          <Label className="text-sm md:text-base font-semibold">Select Payment Method</Label>
          {loadingMethods ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl border-2 border-border/50 bg-card/50 animate-pulse">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-muted" />
                    <div className="h-4 w-16 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : noPaymentGateway ? (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payment Gateway Available</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Payment methods are currently being configured. Please contact support for assistance.
                </p>
                <Button asChild variant="outline">
                  <Link to="/support" className="gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {paymentMethods.map((method, index) => (
                <motion.button
                  key={method.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "p-3 md:p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden group",
                    selectedMethod === method.id
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border/50 bg-card/50 hover:border-primary/50"
                  )}
                >
                  <div className="flex flex-col items-center md:flex-row md:items-center gap-2 md:gap-3">
                    <div className={cn(
                      "p-2 md:p-3 rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110 shrink-0",
                      method.color
                    )}>
                      <method.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <p className="font-semibold text-sm md:text-base">{method.name}</p>
                      <Badge variant="secondary" className="text-[10px] md:text-xs mt-1">
                        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                        {method.badge}
                      </Badge>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary absolute top-2 right-2 md:static" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Deposit Button */}
        <motion.div variants={itemVariants}>
          <Button
            size="lg"
            className="w-full h-12 md:h-14 text-base md:text-lg gap-2 md:gap-3 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
            disabled={!selectedMethod || !amount || parseFloat(amount) <= 0 || processing}
            onClick={handleDeposit}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                Deposit ${amount || "0.00"}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Invoice History */}
        {buyer?.id && (
          <motion.div variants={itemVariants}>
            <BuyerInvoiceHistory buyerId={buyer.id} />
          </motion.div>
        )}

        {/* Recent Deposits */}
        <motion.div variants={itemVariants} className="space-y-3 md:space-y-4">
          <h2 className="text-base md:text-lg font-semibold">Recent Deposits</h2>
          <Card className="glass-card">
            <CardContent className="p-0">
              {loadingHistory ? (
                <div className="p-6 md:p-8 text-center text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-6 md:p-8 text-center text-muted-foreground">
                  <Wallet className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 opacity-50" />
                  <p className="text-sm">No deposits yet</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[300px]">
                  <div className="divide-y divide-border/50">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-3 md:p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={cn(
                            "p-1.5 md:p-2 rounded-lg",
                            tx.status === 'completed' ? "bg-green-500/10" : "bg-yellow-500/10"
                          )}>
                            {tx.status === 'completed' ? (
                              <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm md:text-base">${tx.amount.toFixed(2)}</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">
                              {tx.payment_method} • {new Date(tx.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={tx.status === 'completed' ? 'default' : 'secondary'}
                          className="text-[10px] md:text-xs"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </BuyerLayout>
  );
};

export default BuyerDeposit;
