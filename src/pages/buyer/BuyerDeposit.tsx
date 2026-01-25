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
  LogIn,
  Globe,
  Smartphone,
  Banknote,
  Bitcoin,
  Copy,
  ExternalLink,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useTenant } from "@/hooks/useTenant";
import BuyerLayout from "./BuyerLayout";
import { Link } from "react-router-dom";
import { BuyerInvoiceHistory } from "@/components/billing/BuyerInvoiceHistory";
import { useInvoiceGeneration } from "@/hooks/useInvoiceGeneration";

// All available payment gateways with their display info (40+ gateways)
const allPaymentGateways: Record<string, { name: string; icon: any; color: string; badge: string }> = {
  // Cards & Digital Wallets
  stripe: { name: "Stripe", icon: CreditCard, color: "from-blue-500 to-blue-600", badge: "Instant" },
  paypal: { name: "PayPal", icon: DollarSign, color: "from-blue-400 to-blue-500", badge: "Instant" },
  square: { name: "Square", icon: CreditCard, color: "from-black to-gray-700", badge: "Instant" },
  adyen: { name: "Adyen", icon: CreditCard, color: "from-green-600 to-green-700", badge: "Instant" },
  checkout: { name: "Checkout.com", icon: CreditCard, color: "from-blue-500 to-blue-600", badge: "Instant" },
  
  // African Gateways
  flutterwave: { name: "Flutterwave", icon: Globe, color: "from-orange-400 to-yellow-400", badge: "Instant" },
  paystack: { name: "Paystack", icon: Smartphone, color: "from-cyan-500 to-blue-500", badge: "Instant" },
  korapay: { name: "Kora Pay", icon: Globe, color: "from-purple-500 to-indigo-500", badge: "Instant" },
  monnify: { name: "Monnify", icon: Banknote, color: "from-green-500 to-teal-500", badge: "Instant" },
  pawapay: { name: "Pawapay", icon: Globe, color: "from-blue-500 to-blue-600", badge: "Instant" },
  chipper: { name: "Chipper Cash", icon: Smartphone, color: "from-purple-400 to-purple-600", badge: "Instant" },
  
  // Indian Gateways
  razorpay: { name: "Razorpay", icon: Globe, color: "from-blue-600 to-indigo-600", badge: "Instant" },
  paytm: { name: "Paytm", icon: Smartphone, color: "from-blue-400 to-cyan-500", badge: "Instant" },
  phonepe: { name: "PhonePe", icon: Smartphone, color: "from-purple-500 to-purple-600", badge: "Instant" },
  upi: { name: "UPI", icon: Smartphone, color: "from-green-500 to-green-600", badge: "Instant" },
  
  // LATAM Gateways
  mercadopago: { name: "Mercado Pago", icon: DollarSign, color: "from-sky-400 to-blue-500", badge: "Instant" },
  payu: { name: "PayU", icon: CreditCard, color: "from-green-600 to-green-700", badge: "Instant" },
  pagseguro: { name: "PagSeguro", icon: CreditCard, color: "from-green-500 to-green-600", badge: "Instant" },
  pix: { name: "PIX", icon: Smartphone, color: "from-teal-400 to-teal-600", badge: "Instant" },
  
  // EU Gateways
  mollie: { name: "Mollie", icon: CreditCard, color: "from-black to-gray-800", badge: "Instant" },
  klarna: { name: "Klarna", icon: Wallet, color: "from-pink-400 to-pink-500", badge: "Instant" },
  ideal: { name: "iDEAL", icon: Globe, color: "from-pink-500 to-red-500", badge: "Instant" },
  sofort: { name: "Sofort", icon: Globe, color: "from-pink-400 to-pink-600", badge: "Instant" },
  giropay: { name: "Giropay", icon: Globe, color: "from-blue-500 to-blue-700", badge: "Instant" },
  bancontact: { name: "Bancontact", icon: CreditCard, color: "from-blue-400 to-blue-500", badge: "Instant" },
  
  // Crypto Gateways
  crypto: { name: "Crypto", icon: Sparkles, color: "from-orange-500 to-yellow-500", badge: "5-30 min" },
  coinbase: { name: "Coinbase", icon: Bitcoin, color: "from-blue-600 to-blue-700", badge: "5-30 min" },
  btcpay: { name: "Bitcoin", icon: Bitcoin, color: "from-orange-500 to-amber-500", badge: "10-60 min" },
  nowpayments: { name: "NowPayments", icon: Bitcoin, color: "from-gray-700 to-gray-900", badge: "5-30 min" },
  coingate: { name: "CoinGate", icon: Bitcoin, color: "from-blue-500 to-indigo-600", badge: "5-30 min" },
  binancepay: { name: "Binance Pay", icon: Bitcoin, color: "from-yellow-400 to-yellow-500", badge: "Instant" },
  bitpay: { name: "BitPay", icon: Bitcoin, color: "from-blue-500 to-blue-700", badge: "5-30 min" },
  cryptomus: { name: "Cryptomus", icon: Bitcoin, color: "from-green-500 to-green-600", badge: "5-30 min" },
  
  // E-Wallets
  perfectmoney: { name: "Perfect Money", icon: Shield, color: "from-green-500 to-emerald-500", badge: "Instant" },
  skrill: { name: "Skrill", icon: Shield, color: "from-purple-600 to-purple-700", badge: "Instant" },
  neteller: { name: "Neteller", icon: Shield, color: "from-green-600 to-green-700", badge: "Instant" },
  webmoney: { name: "WebMoney", icon: Wallet, color: "from-blue-500 to-blue-600", badge: "Instant" },
  payeer: { name: "Payeer", icon: Wallet, color: "from-blue-400 to-blue-500", badge: "Instant" },
  airtm: { name: "AirTM", icon: Wallet, color: "from-blue-500 to-cyan-500", badge: "Instant" },
  
  // Bank Transfers
  wise: { name: "Wise", icon: Globe, color: "from-green-400 to-green-600", badge: "1-2 days" },
  ach: { name: "ACH Transfer", icon: Banknote, color: "from-blue-500 to-blue-700", badge: "1-3 days" },
  sepa: { name: "SEPA", icon: Banknote, color: "from-blue-600 to-indigo-600", badge: "1-2 days" },
  wire: { name: "Wire Transfer", icon: Banknote, color: "from-gray-500 to-gray-700", badge: "2-5 days" },
  
  // Manual Transfer
  manual_transfer: { name: "Bank Transfer", icon: Banknote, color: "from-emerald-500 to-teal-600", badge: "12-24h" },
};

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  color: string;
  badge: string;
  isManual?: boolean;
  bankDetails?: string;
  instructions?: string;
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
  
  // Manual payment dialog state
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualPaymentDetails, setManualPaymentDetails] = useState<{
    transactionId: string;
    amount: number;
    bankDetails: string;
    instructions: string;
    title: string;
  } | null>(null);
  
  // Multiple manual methods selector state
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [allManualMethods, setAllManualMethods] = useState<PaymentMethod[]>([]);

  // Fetch enabled payment methods from panel settings + sync with platform providers
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!panel?.id) {
        setLoadingMethods(false);
        return;
      }
      
      try {
        // Fetch panel settings AND platform-enabled providers in parallel
        const [panelRes, providersRes] = await Promise.all([
          supabase.from('panels').select('settings').eq('id', panel.id).single(),
          supabase.from('platform_payment_providers').select('provider_name, is_enabled').eq('is_enabled', true)
        ]);
        
        const panelSettings = panelRes.data?.settings as Record<string, any> || {};
        const paymentSettings = panelSettings.payments || {};
        const enabledMethods = paymentSettings.enabledMethods || [];
        const manualPayments = paymentSettings.manualPayments || [];
        
        // Create a set of platform-enabled provider names
        const platformEnabledProviders = new Set(
          (providersRes.data || []).map((p: any) => p.provider_name)
        );
        
        const allMethods: PaymentMethod[] = [];
        
        // Helper to check if automatic gateway has valid credentials
        const hasCredentials = (method: any) => {
          if (typeof method === 'string') return false; // String-only means no config
          return Boolean((method.apiKey && method.apiKey.trim()) || (method.secretKey && method.secretKey.trim()));
        };
        
        // Map enabled automatic methods - ONLY if platform-approved AND has credentials
        if (enabledMethods.length > 0) {
          const mappedMethods = enabledMethods
            .filter((em: any) => {
              const id = typeof em === 'string' ? em : em.id;
              const isEnabled = typeof em === 'string' ? true : em.enabled !== false;
              // Must be: enabled, have credentials, and be platform-approved
              if (!isEnabled) return false;
              if (!hasCredentials(em)) return false;
              // If platform has providers configured, check approval
              if (platformEnabledProviders.size > 0 && !platformEnabledProviders.has(id)) {
                return false;
              }
              return true;
            })
            .map((em: any) => {
              const id = typeof em === 'string' ? em : em.id;
              const gatewayInfo = allPaymentGateways[id];
              if (!gatewayInfo) {
                return {
                  id,
                  name: id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1').trim(),
                  icon: CreditCard,
                  color: "from-gray-500 to-gray-600",
                  badge: "Instant"
                };
              }
              return { id, ...gatewayInfo };
            });
          allMethods.push(...mappedMethods);
        }
        
        // Add enabled manual payment methods (panel-defined, no platform sync needed)
        if (manualPayments.length > 0) {
          const mappedManual = manualPayments
            .filter((m: any) => m.enabled !== false)
            .map((m: any) => ({
              id: m.id,
              name: m.title,
              icon: Banknote,
              color: "from-emerald-500 to-teal-600",
              badge: m.processingTime || "12-24h",
              isManual: true,
              bankDetails: m.bankDetails,
              instructions: m.instructions
            }));
          
          setAllManualMethods(mappedManual);
          
          if (mappedManual.length > 1) {
            allMethods.push({
              id: 'manual_selector',
              name: 'Bank Transfer',
              icon: Banknote,
              color: "from-emerald-500 to-teal-600",
              badge: `${mappedManual.length} options`,
              isManual: true
            });
          } else {
            allMethods.push(...mappedManual);
          }
        }
        
        if (allMethods.length > 0) {
          setPaymentMethods(allMethods);
          setNoPaymentGateway(false);
        } else {
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
  // Fetch all transactions (pending, completed, failed)
  const fetchTransactions = async () => {
    if (!buyer?.id) return;
    
    try {
      // Fetch using both user_id and buyer_id columns
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .or(`user_id.eq.${buyer.id},buyer_id.eq.${buyer.id}`)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(20);
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [buyer?.id]);

  // Real-time subscription for transaction updates and balance sync
  useEffect(() => {
    if (!buyer?.id) return;

    // Subscribe to updates using user_id (how transactions are stored)
    const channel = supabase
      .channel(`buyer-transactions-${buyer.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${buyer.id}`
        },
        async (payload) => {
          console.log('Transaction update:', payload);
          
          // Refresh transactions list
          fetchTransactions();
          
          // If a transaction was updated to completed, refresh buyer balance
          if (payload.eventType === 'UPDATE' && payload.new?.status === 'completed') {
            refreshBuyer();
            toast({
              title: "Balance Updated!",
              description: `$${payload.new.amount} has been added to your balance.`
            });
          }
          
          // Also handle INSERT for new transactions
          if (payload.eventType === 'INSERT') {
            if (payload.new?.status === 'completed') {
              refreshBuyer();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buyer?.id, refreshBuyer]);

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

  const handleDeposit = async (overrideMethodId?: string) => {
    const methodToUse = overrideMethodId || selectedMethod;
    
    if (!methodToUse || !amount || parseFloat(amount) <= 0) {
      toast({ variant: "destructive", title: "Please select payment method and enter amount" });
      return;
    }

    if (!buyer?.id || !panel?.id) {
      toast({ variant: "destructive", title: "Error", description: "User or panel not found" });
      return;
    }
    
    // If selecting manual_selector, show the manual methods selector
    if (methodToUse === 'manual_selector') {
      setShowManualSelector(true);
      return;
    }

    setProcessing(true);
    setShowManualSelector(false);

    try {
      const depositAmount = parseFloat(amount);
      // Look in both paymentMethods and allManualMethods
      const selectedPaymentMethod = paymentMethods.find(m => m.id === methodToUse) 
        || allManualMethods.find(m => m.id === methodToUse);
      const methodName = selectedPaymentMethod?.name || methodToUse;

      // Call the payment processing edge function (it creates the transaction server-side)
      const response = await supabase.functions.invoke('process-payment', {
        body: {
          gateway: methodToUse,
          amount: depositAmount,
          panelId: panel.id,
          buyerId: buyer.id,
          returnUrl: window.location.origin + '/deposit',
          currency: 'usd',
          description: `Deposit via ${methodName}`
        }
      });

      const result = response.data || {};

      // Handle response (edge function now always returns 200 with success/error in body)
      if (!result.success) {
        throw new Error(result.error || 'Payment processing failed');
      }

      if (result.redirectUrl) {
        // Redirect to payment gateway
        window.location.href = result.redirectUrl;
      } else if (result.requiresManualTransfer || selectedPaymentMethod?.isManual) {
        // Manual payment - show dialog with bank details and instructions
        setManualPaymentDetails({
          transactionId: result.transactionId,
          amount: depositAmount,
          bankDetails: result.config?.bankDetails || selectedPaymentMethod?.bankDetails || '',
          instructions: result.config?.instructions || selectedPaymentMethod?.instructions || 'Please complete the transfer and your balance will be credited once confirmed.',
          title: methodName
        });
        setManualDialogOpen(true);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
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
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
            onClick={() => handleDeposit()}
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
                    {transactions.map((tx) => {
                      const isCompleted = tx.status === 'completed';
                      const isPending = tx.status === 'pending';
                      const isFailed = tx.status === 'failed' || tx.status === 'cancelled';
                      
                      return (
                        <div key={tx.id} className="p-3 md:p-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={cn(
                              "p-1.5 md:p-2 rounded-lg",
                              isCompleted && "bg-green-500/10",
                              isPending && "bg-yellow-500/10",
                              isFailed && "bg-red-500/10"
                            )}>
                              {isCompleted ? (
                                <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                              ) : isPending ? (
                                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm md:text-base">${tx.amount.toFixed(2)}</p>
                              <p className="text-[10px] md:text-xs text-muted-foreground">
                                {tx.payment_method || 'Payment'} • {new Date(tx.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={isCompleted ? 'default' : 'secondary'}
                            className={cn(
                              "text-[10px] md:text-xs capitalize",
                              isCompleted && "bg-green-500/10 text-green-500 border-green-500/20",
                              isPending && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                              isFailed && "bg-red-500/10 text-red-500 border-red-500/20"
                            )}
                          >
                            {tx.status || 'pending'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Manual Payment Instructions Dialog */}
      <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Banknote className="w-6 h-6 text-emerald-500" />
              {manualPaymentDetails?.title || 'Manual Payment'}
            </DialogTitle>
            <DialogDescription>
              Complete your deposit of ${manualPaymentDetails?.amount?.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Transaction Reference */}
            <div className="p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Transaction Reference</p>
                  <p className="font-mono text-sm font-medium">{manualPaymentDetails?.transactionId?.slice(0, 8).toUpperCase()}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(manualPaymentDetails?.transactionId || '')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Amount */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground">Amount to Transfer</p>
              <p className="text-3xl font-bold text-primary">${manualPaymentDetails?.amount?.toFixed(2)}</p>
            </div>

            {/* Bank Details */}
            {manualPaymentDetails?.bankDetails && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Bank/Payment Details</Label>
                <div className="p-3 bg-muted/30 rounded-lg border font-mono text-sm whitespace-pre-wrap relative">
                  {manualPaymentDetails.bankDetails}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(manualPaymentDetails.bankDetails)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Instructions */}
            {manualPaymentDetails?.instructions && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Instructions</Label>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="whitespace-pre-wrap">{manualPaymentDetails.instructions}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
              <p>Your balance will be credited once payment is verified by our team.</p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setManualDialogOpen(false);
                setManualPaymentDetails(null);
                setAmount("");
                setSelectedMethod(null);
              }}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setManualDialogOpen(false);
                setManualPaymentDetails(null);
                setAmount("");
                setSelectedMethod(null);
                toast({ 
                  title: "Payment Pending", 
                  description: "Complete the transfer and your balance will be updated." 
                });
              }}
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              I've Made the Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Methods Selector Dialog */}
      <Dialog open={showManualSelector} onOpenChange={setShowManualSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-emerald-500" />
              Select Payment Method
            </DialogTitle>
            <DialogDescription>
              Choose your preferred transfer method for ${amount}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
            {allManualMethods.map((method) => (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowManualSelector(false);
                  handleDeposit(method.id);
                }}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-emerald-500/50 bg-card transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Banknote className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{method.name}</h4>
                      <p className="text-xs text-muted-foreground">{method.badge}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                {method.bankDetails && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                    {method.bankDetails.split('\n')[0]}...
                  </p>
                )}
              </motion.button>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualSelector(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BuyerLayout>
  );
};

export default BuyerDeposit;
