import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Check, 
  Zap, 
  Crown, 
  Wallet, 
  ArrowUpRight,
  Calendar,
  DollarSign,
  Sparkles,
  Percent,
  Loader2
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { TransactionHistory } from '@/components/billing/TransactionHistory';
import { CommissionTracker } from '@/components/billing/CommissionTracker';
import { QuickDeposit } from '@/components/billing/QuickDeposit';
import { PaymentMethodsQuickAccess } from '@/components/billing/PaymentMethodsQuickAccess';
import { usePanel } from '@/hooks/usePanel';

interface Subscription {
  id: string;
  plan_type: 'free' | 'basic' | 'pro';
  price: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  started_at: string;
  expires_at: string | null;
}

interface CommissionData {
  commissionRate: number;
  earnedThisMonth: number;
  pendingCommission: number;
  paidCommission: number;
}

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic features',
    icon: Zap,
    color: 'from-slate-500 to-slate-600',
    features: [
      '1 Active Service',
      'Basic Analytics',
      'Email Support',
      'Subdomain Only',
      '100 Orders/month'
    ],
  },
  {
    name: 'Basic',
    price: 5,
    period: 'month',
    description: 'Perfect for growing panels',
    icon: Sparkles,
    color: 'from-blue-500 to-blue-600',
    popular: true,
    features: [
      '10 Active Services',
      'Full Analytics Dashboard',
      'Priority Email Support',
      'Custom Domain',
      '1,000 Orders/month',
      'API Access',
      'Custom Branding'
    ],
  },
  {
    name: 'Pro',
    price: 15,
    period: 'month',
    description: 'For serious SMM businesses',
    icon: Crown,
    color: 'from-amber-500 to-amber-600',
    features: [
      'Unlimited Services',
      'Advanced Analytics + Reports',
      '24/7 Priority Support',
      'Multiple Custom Domains',
      'Unlimited Orders',
      'Full API Access',
      'White-label Branding',
      'Dedicated Account Manager',
      'Custom Integrations'
    ],
  }
];

const Billing = () => {
  const { profile } = useAuth();
  const { panel } = usePanel();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [panelBalance, setPanelBalance] = useState(0);
  const [depositLoading, setDepositLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [commissionData, setCommissionData] = useState<CommissionData>({
    commissionRate: 5,
    earnedThisMonth: 0,
    pendingCommission: 0,
    paidCommission: 0,
  });

  useEffect(() => {
    if (panel?.id) {
      fetchBillingData();
      // Subscribe to transaction updates for real-time balance
      const channel = supabase
        .channel('billing-transactions')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `panel_id=eq.${panel.id}`
        }, (payload) => {
          if (payload.new && (payload.new as any).status === 'completed') {
            toast({ 
              title: 'Payment Completed!', 
              description: `$${(payload.new as any).amount?.toFixed(2) || '0.00'} has been added to your balance.` 
            });
            fetchBillingData();
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [panel?.id]);

  const fetchBillingData = async () => {
    if (!panel?.id) return;

    try {
      // Fetch panel balance
      setPanelBalance(panel.balance || 0);

      // Fetch subscription
      const { data: sub } = await supabase
        .from('panel_subscriptions')
        .select('*')
        .eq('panel_id', panel.id)
        .maybeSingle();

      if (sub) {
        setSubscription(sub as Subscription);
      }

      // Fetch commission data from platform_fees
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: fees } = await supabase
        .from('platform_fees')
        .select('fee_amount, created_at')
        .eq('panel_id', panel.id);

      if (fees) {
        const thisMonthFees = fees.filter(f => new Date(f.created_at) >= startOfMonth);
        const earnedThisMonth = thisMonthFees.reduce((sum, f) => sum + (f.fee_amount || 0), 0);
        const totalFees = fees.reduce((sum, f) => sum + (f.fee_amount || 0), 0);

        setCommissionData({
          commissionRate: panel.commission_rate || 5,
          earnedThisMonth,
          pendingCommission: earnedThisMonth,
          paidCommission: totalFees - earnedThisMonth,
        });
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: string) => {
    if (!panel?.id || !profile?.id) return;

    const plan = plans.find(p => p.name.toLowerCase() === planName.toLowerCase());
    if (!plan) return;

    // Free plan - direct upgrade without payment
    if (plan.price === 0) {
      try {
        const { error } = await supabase
          .from('panel_subscriptions')
          .upsert({
            panel_id: panel.id,
            plan_type: 'free' as const,
            price: 0,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: null
          }, { onConflict: 'panel_id' });

        if (error) throw error;
        toast({ title: 'Success', description: 'Switched to Free plan!' });
        fetchBillingData();
      } catch (error) {
        console.error('Error switching to free:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to switch plan' });
      }
      return;
    }

    // Paid plan - go through payment flow
    setUpgradeLoading(planName);
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          gateway: 'stripe', // Default to stripe for subscriptions
          amount: plan.price,
          panelId: panel.id,
          buyerId: profile.id,
          returnUrl: `${window.location.origin}/panel/billing?upgrade=success`,
          cancelUrl: `${window.location.origin}/panel/billing?upgrade=cancelled`,
          metadata: {
            type: 'subscription',
            plan: planName.toLowerCase(),
            panelId: panel.id
          }
        }
      });

      if (error) throw error;

      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else if (data?.success) {
        toast({ title: 'Success', description: `Upgraded to ${plan.name} plan!` });
        fetchBillingData();
      } else {
        throw new Error(data?.error || 'Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Error upgrading:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Upgrade Failed', 
        description: error.message || 'Failed to initiate payment. Please try again.' 
      });
    } finally {
      setUpgradeLoading(null);
    }
  };

  const handleDeposit = async (amount: number, method: string) => {
    if (!panel?.id || !profile?.id) return;

    setDepositLoading(true);
    try {
      // Create transaction and initiate payment
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          gateway: method,
          amount,
          panelId: panel.id,
          buyerId: profile.id,
          returnUrl: `${window.location.origin}/panel/billing?deposit=success`,
          cancelUrl: `${window.location.origin}/panel/billing?deposit=cancelled`,
          metadata: {
            type: 'panel_deposit',
            panelId: panel.id
          }
        }
      });

      if (error) throw error;

      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else if (data?.success) {
        toast({ title: 'Success', description: `Deposit of $${amount.toFixed(2)} initiated!` });
        fetchBillingData();
      } else {
        throw new Error(data?.error || 'Payment initialization failed');
      }
    } catch (error: any) {
      console.error('Error adding funds:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Deposit Failed', 
        description: error.message || 'Failed to initiate deposit. Please try again.' 
      });
    } finally {
      setDepositLoading(false);
    }
  };

  const handlePayCommission = async () => {
    if (!panel?.id || !profile?.id || commissionData.pendingCommission <= 0) return;

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          gateway: 'stripe',
          amount: commissionData.pendingCommission,
          panelId: panel.id,
          buyerId: profile.id,
          returnUrl: `${window.location.origin}/panel/billing?commission=success`,
          cancelUrl: `${window.location.origin}/panel/billing?commission=cancelled`,
          metadata: {
            type: 'commission_payment',
            panelId: panel.id
          }
        }
      });

      if (error) throw error;

      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'Failed to initiate commission payment' 
      });
    }
  };

  const currentPlan = subscription?.plan_type || 'free';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Helmet>
        <title>Billing & Subscription - SMMPilot</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription, balance, and transactions</p>
      </motion.div>

      {/* Overview Cards Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Panel Balance</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-emerald-500">${panelBalance.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Commission Due */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Percent className="w-4 h-4" />
              <span className="text-sm">Commission Due</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-orange-500">
              ${commissionData.pendingCommission.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Current Plan */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">Current Plan</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl lg:text-3xl font-bold capitalize">{currentPlan}</p>
              <Badge className={cn(
                "capitalize",
                subscription?.status === 'active' && "bg-emerald-500/20 text-emerald-500"
              )}>
                {subscription?.status || 'active'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Billing */}
        <Card className="bg-card/60 backdrop-blur-xl border-border/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Next Billing</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold">
              ${plans.find(p => p.name.toLowerCase() === currentPlan)?.price || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {subscription?.expires_at 
                ? new Date(subscription.expires_at).toLocaleDateString()
                : 'N/A'
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Grid - Deposit + Payment Methods / Commission */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Deposit */}
        <div className="lg:col-span-2">
          <QuickDeposit onDeposit={handleDeposit} loading={depositLoading} />
        </div>

        {/* Sidebar - Payment Methods & Commission */}
        <div className="space-y-6">
          <PaymentMethodsQuickAccess />
          <CommissionTracker 
            commissionRate={commissionData.commissionRate}
            earnedThisMonth={commissionData.earnedThisMonth}
            pendingCommission={commissionData.pendingCommission}
            paidCommission={commissionData.paidCommission}
            onPayCommission={handlePayCommission} 
          />
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div variants={itemVariants}>
        <Card className="bg-card/60 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Transaction History
            </CardTitle>
            <CardDescription>View all your panel transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistory panelId={panel?.id} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Pricing Plans */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold mb-4">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.name.toLowerCase();
            const isLoading = upgradeLoading === plan.name;
            
            return (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-3">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={cn(
                  "bg-card/60 backdrop-blur-xl border-border/50 h-full relative overflow-hidden transition-all duration-300 hover:border-primary/30",
                  plan.popular && "border-primary/50 shadow-lg shadow-primary/10",
                  isCurrent && "ring-2 ring-primary"
                )}>
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30",
                    `bg-gradient-to-br ${plan.color}`
                  )} />
                  
                  <CardHeader className="text-center pb-2">
                    <div className={cn(
                      "w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 bg-gradient-to-br",
                      plan.color
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      className={cn(
                        "w-full gap-2",
                        isCurrent && "bg-muted text-muted-foreground hover:bg-muted"
                      )}
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => !isCurrent && handleUpgrade(plan.name)}
                      disabled={isCurrent || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : (
                        <>
                          Upgrade <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Billing;