import { useState, useEffect, useRef } from "react";
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
  XCircle,
  Upload,
  Image as ImageIcon,
  X
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
import { useCurrency } from "@/contexts/CurrencyContext";
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
  const { buyer, refreshBuyer, loading: authLoading, getToken } = useBuyerAuth();
  const { panel, loading: panelLoading } = useTenant();
  const { generateInvoice } = useInvoiceGeneration();
  const { currency, currencyConfig, formatPrice, convertFromUSD } = useCurrency();
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
  
  // Proof of payment upload state
  const [proofUploading, setProofUploading] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [showProofUpload, setShowProofUpload] = useState(false);
  const proofInputRef = useRef<HTMLInputElement>(null);

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
          (supabase as any).from('panels_public').select('settings').eq('id', panel.id).single(),
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

  const fetchTransactions = async () => {
    if (!buyer?.id || !panel?.id) return;
    
    try {
      const token = getToken();
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: {
          panelId: panel.id,
          action: 'transactions',
          buyerId: buyer.id,
          token
        }
      });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }
      
      if (data?.error) {
        console.error('Transaction fetch error:', data.error);
        return;
      }
      
      if (data?.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [buyer?.id, panel?.id]);

  const previousTransactionsRef = useRef<Transaction[]>([]);

  useEffect(() => {
    if (!buyer?.id || !panel?.id) return;

    const hasPending = transactions.some(t => 
      t.status === 'pending' || t.status === 'pending_verification' || t.status === 'processing'
    );
    const interval = hasPending ? 8000 : 30000;
    
    const pollInterval = setInterval(async () => {
      await fetchTransactions();
    }, interval);

    return () => clearInterval(pollInterval);
  }, [buyer?.id, panel?.id, transactions]);

  useEffect(() => {
    const prev = previousTransactionsRef.current;
    if (prev.length === 0 && transactions.length > 0) {
      previousTransactionsRef.current = transactions;
      return;
    }

    for (const tx of transactions) {
      const prevTx = prev.find(p => p.id === tx.id);
      if (prevTx && prevTx.status !== tx.status) {
        if (tx.status === 'completed' && prevTx.status !== 'completed') {
          refreshBuyer();
          toast({
            title: "Payment Successful!",
            description: `$${Number(tx.amount).toFixed(2)} has been added to your balance.`
          });
        }
        if (tx.status === 'failed' && prevTx.status !== 'failed') {
          toast({
            variant: "destructive",
            title: "Payment Failed",
            description: "Your payment could not be processed."
          });
        }
      }
    }

    previousTransactionsRef.current = transactions;
  }, [transactions, refreshBuyer]);

  // Check for payment success/cancel URL params on mount - VERIFY actual status from DB
  useEffect(() => {
    const verifyPaymentStatus = async () => {
      const params = new URLSearchParams(window.location.search);
      const successParam = params.get('success');
      const cancelledParam = params.get('cancelled');
      const transactionId = params.get('transaction_id');
      
      // Clean up URL immediately
      if (successParam || cancelledParam || transactionId) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      if (cancelledParam === 'true') {
        toast({ 
          variant: "destructive",
          title: "Payment Cancelled", 
          description: "Your deposit was not completed." 
        });
        if (transactionId) {
          try {
            await supabase.functions.invoke('process-payment', {
              body: { action: 'verify-payment', transactionId }
            });
          } catch (e) {
            console.error('Cancel verify error:', e);
          }
        }
        fetchTransactions();
        return;
      }
      
      // If we have a transaction ID, verify actual status from database
      if (transactionId && successParam === 'true') {
        toast({ 
          title: "Verifying Payment...", 
          description: "Please wait while we confirm your payment." 
        });
        
        // Actively verify with the gateway first
        try {
          const { data: verifyResult } = await supabase.functions.invoke('process-payment', {
            body: { action: 'verify-payment', transactionId }
          });
          
          if (verifyResult?.status === 'completed') {
            toast({ 
              title: "Payment Successful!", 
              description: `$${Number(verifyResult.amount).toFixed(2)} has been added to your balance.` 
            });
            refreshBuyer();
            fetchTransactions();
            return;
          } else if (verifyResult?.status === 'failed') {
            toast({ 
              variant: "destructive",
              title: "Payment Failed", 
              description: "Your payment could not be processed." 
            });
            fetchTransactions();
            return;
          }
        } catch (err) {
          console.error('Verify error:', err);
        }
        
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkStatus = async (): Promise<void> => {
          try {
            const { data: verifyRetry } = await supabase.functions.invoke('process-payment', {
              body: { action: 'verify-payment', transactionId }
            });
            
            if (verifyRetry?.status === 'completed') {
              toast({ 
                title: "Payment Successful!", 
                description: `$${Number(verifyRetry.amount).toFixed(2)} has been added to your balance.` 
              });
              refreshBuyer();
              fetchTransactions();
              return;
            } else if (verifyRetry?.status === 'failed') {
              toast({ 
                variant: "destructive",
                title: "Payment Failed", 
                description: "Your payment could not be processed." 
              });
              fetchTransactions();
              return;
            }
          } catch (err) {
            console.error('Status check error:', err);
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 3000);
          } else {
            toast({ 
              title: "Payment Processing", 
              description: "Your payment is still being verified. Check back shortly." 
            });
            fetchTransactions();
          }
        };
        
        checkStatus();
      }
    };
    
    verifyPaymentStatus();
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

      // ALWAYS refresh transactions immediately after initiating - shows pending status
      fetchTransactions();

      if (result.redirectUrl) {
        // Show pending notification before redirect
        toast({ 
          title: "Deposit Initiated", 
          description: "Redirecting to payment gateway..." 
        });
        // Small delay to ensure transaction list shows the new pending transaction
        setTimeout(() => {
          window.location.href = result.redirectUrl;
        }, 500);
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
        
        // Wait briefly for DB propagation, then fetch transactions
        setTimeout(() => {
          fetchTransactions();
        }, 800);
        
        // Clear form
        setAmount("");
        setSelectedMethod(null);
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

  const handleProofUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please upload an image file (PNG, JPG, GIF, WebP)" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Maximum file size is 2MB" });
      return;
    }
    setProofUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `proof-${Date.now()}.${ext}`;
      const txId = manualPaymentDetails?.transactionId || "unknown";
      const filePath = `${txId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);
      
      setProofUrl(urlData.publicUrl);

      if (txId !== "unknown" && buyer?.id && panel?.id) {
        const token = getToken();
        await supabase.functions.invoke('buyer-auth', {
          body: {
            panelId: panel.id,
            action: 'update-transaction-proof',
            buyerId: buyer.id,
            token,
            transactionId: txId,
            proofUrl: urlData.publicUrl
          }
        });
        fetchTransactions();
      }

      toast({ title: "Proof uploaded", description: "Your payment proof has been attached." });
    } catch (err) {
      console.error("Proof upload error:", err);
      toast({ variant: "destructive", title: "Upload failed", description: "Please try again." });
    } finally {
      setProofUploading(false);
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
                    <p className="text-2xl md:text-3xl font-bold" data-testid="text-current-balance">{formatPrice(buyer?.balance || 0)}</p>
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
                {formatPrice(quickAmount)}
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
            data-testid="button-deposit"
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
          <h2 className="text-base md:text-lg font-semibold" data-testid="text-recent-deposits">Recent Deposits</h2>
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
                      const isPending = tx.status === 'pending' || tx.status === 'pending_verification' || tx.status === 'processing';
                      const isFailed = tx.status === 'failed' || tx.status === 'cancelled';
                      
                      return (
                        <div key={tx.id} className="p-3 md:p-4 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <div className={cn(
                              "p-1.5 md:p-2 rounded-lg shrink-0",
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
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-sm md:text-base">${tx.amount.toFixed(2)}</p>
                                {/* Transaction ID with copy */}
                                <button 
                                  onClick={() => copyToClipboard(tx.id)}
                                  className="text-[10px] font-mono text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                                  title="Copy Transaction ID"
                                >
                                  #{tx.id.slice(0, 8).toUpperCase()}
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                              </div>
                              <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                                {tx.payment_method || 'Payment'} • {new Date(tx.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={isCompleted ? 'default' : 'secondary'}
                            className={cn(
                              "text-[10px] md:text-xs capitalize shrink-0",
                              isCompleted && "bg-green-500/10 text-green-500 border-green-500/20",
                              isPending && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                              isFailed && "bg-red-500/10 text-red-500 border-red-500/20"
                            )}
                          >
                            {tx.status === 'pending_verification' ? 'Pending Verification' : (tx.status || 'pending')}
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
      <Dialog open={manualDialogOpen} onOpenChange={(open) => {
        setManualDialogOpen(open);
        if (!open) {
          setShowProofUpload(false);
          setProofUrl(null);
        }
      }}>
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

            {!showProofUpload && (
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <p>After completing your transfer, click the button below to upload payment proof.</p>
              </div>
            )}

            {/* Payment Proof Upload — only shown after clicking "I've Made the Transfer" */}
            {showProofUpload && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold" data-testid="label-upload-proof">Upload Payment Proof</Label>
                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProofUpload(file);
                  }}
                />
                {proofUrl ? (
                  <div className="relative rounded-lg border overflow-hidden">
                    <img src={proofUrl} alt="Payment proof" className="w-full max-h-[200px] object-contain bg-muted/30" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => setProofUrl(null)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => proofInputRef.current?.click()}
                    disabled={proofUploading}
                    data-testid="button-upload-proof"
                    className={cn(
                      "w-full p-4 rounded-lg border-2 border-dashed transition-all flex flex-col items-center gap-2",
                      proofUploading
                        ? "opacity-60 pointer-events-none border-border/50"
                        : "border-border/50 hover:border-primary/50 cursor-pointer"
                    )}
                  >
                    {proofUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {proofUploading ? "Uploading..." : "Click to upload screenshot"}
                    </span>
                    <span className="text-xs text-muted-foreground">Max 2MB • PNG, JPG, GIF, WebP</span>
                  </button>
                )}

                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  <p>Your balance will be credited once payment is verified by our team.</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setManualDialogOpen(false);
                setManualPaymentDetails(null);
                setProofUrl(null);
                setShowProofUpload(false);
                setAmount("");
                setSelectedMethod(null);
              }}
            >
              Close
            </Button>
            {!showProofUpload ? (
              <Button 
                onClick={() => setShowProofUpload(true)}
                className="gap-2"
                data-testid="button-ive-made-transfer"
              >
                <CheckCircle className="w-4 h-4" />
                I've Made the Transfer
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  setManualDialogOpen(false);
                  setManualPaymentDetails(null);
                  setProofUrl(null);
                  setShowProofUpload(false);
                  setAmount("");
                  setSelectedMethod(null);
                  toast({ 
                    title: "Payment Pending", 
                    description: "Your payment proof has been submitted. Balance will update once verified." 
                  });
                }}
                className="gap-2"
                data-testid="button-done-transfer"
              >
                <CheckCircle className="w-4 h-4" />
                Done
              </Button>
            )}
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
