import { useState } from "react";
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
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useTenant } from "@/hooks/useTenant";
import BuyerLayout from "./BuyerLayout";

const paymentMethods = [
  { id: "stripe", name: "Credit/Debit Card", icon: CreditCard, color: "from-blue-500 to-blue-600", badge: "Instant" },
  { id: "paypal", name: "PayPal", icon: DollarSign, color: "from-blue-400 to-blue-500", badge: "Instant" },
  { id: "crypto", name: "Cryptocurrency", icon: Sparkles, color: "from-orange-500 to-yellow-500", badge: "5-30 min" },
  { id: "perfectmoney", name: "Perfect Money", icon: Shield, color: "from-green-500 to-emerald-500", badge: "Instant" },
];

const quickAmounts = [10, 25, 50, 100, 250, 500];

interface Transaction {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

const BuyerDeposit = () => {
  const { buyer, refreshBuyer } = useBuyerAuth();
  const { panel } = useTenant();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch transaction history on mount
  useState(() => {
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
  });

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

      // Create transaction record
      const { data: transaction, error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: buyer.id,
          amount: depositAmount,
          type: 'deposit',
          payment_method: selectedMethod,
          status: 'pending',
          description: `Deposit via ${paymentMethods.find(m => m.id === selectedMethod)?.name}`
        })
        .select()
        .single();

      if (transError) throw transError;

      // Simulate payment processing (in real app, integrate with payment gateway)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update transaction status to completed
      await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id);

      // Update buyer balance
      const newBalance = (buyer.balance || 0) + depositAmount;
      await supabase
        .from('client_users')
        .update({ balance: newBalance })
        .eq('id', buyer.id);

      // Refresh buyer data
      await refreshBuyer();

      toast({ 
        title: "Deposit Successful!", 
        description: `$${depositAmount.toFixed(2)} has been added to your balance` 
      });

      // Reset form
      setAmount("");
      setSelectedMethod(null);

      // Refresh transactions
      const { data: updatedTrans } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', buyer.id)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setTransactions(updatedTrans || []);

    } catch (error) {
      console.error('Deposit error:', error);
      toast({ variant: "destructive", title: "Deposit Failed", description: "Please try again" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <BuyerLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Add Funds
          </h1>
          <p className="text-muted-foreground">Deposit money to purchase services</p>
        </motion.div>

        {/* Current Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-3xl font-bold">${(buyer?.balance || 0).toFixed(2)}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Zap className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Amount Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <Label className="text-base font-semibold">Quick Select Amount</Label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {quickAmounts.map((quickAmount, index) => (
              <motion.button
                key={quickAmount}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => setAmount(quickAmount.toString())}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 font-semibold",
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label>Custom Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 text-lg h-12 bg-card/50"
              min="1"
              step="0.01"
            />
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Label className="text-base font-semibold">Select Payment Method</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method, index) => (
              <motion.button
                key={method.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden group",
                  selectedMethod === method.id
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border/50 bg-card/50 hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110",
                    method.color
                  )}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{method.name}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {method.badge}
                    </Badge>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Deposit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            size="lg"
            className="w-full h-14 text-lg gap-3 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
            disabled={!selectedMethod || !amount || parseFloat(amount) <= 0 || processing}
            onClick={handleDeposit}
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                Deposit ${amount || "0.00"}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Recent Deposits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold">Recent Deposits</h2>
          <Card className="glass-card">
            <CardContent className="p-0">
              {loadingHistory ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading...
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No deposits yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          tx.status === 'completed' ? "bg-green-500/10" : "bg-yellow-500/10"
                        )}>
                          {tx.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">${tx.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.payment_method} • {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </BuyerLayout>
  );
};

export default BuyerDeposit;
