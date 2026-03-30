import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Loader2,
  AlertTriangle,
  ArrowDownRight
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { CommissionTracker } from '@/components/billing/CommissionTracker';
import { QuickDeposit } from '@/components/billing/QuickDeposit';
import { TrialExpiryBanner } from '@/components/billing/TrialExpiryBanner';
import { GatewaySelectDialog } from '@/components/billing/GatewaySelectDialog';
import { usePanel } from '@/hooks/usePanel';
import { useAdminPaymentGateways } from '@/hooks/useAdminPaymentGateways';

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
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: 'forever',
    description: 'Get started with basic features',
    icon: Zap,
    color: 'from-slate-500 to-slate-600',
    features: [
      'Up to 50 Services',
      'Basic Analytics',
      'Email Support',
      'Subdomain Only',
      '100 Orders/month'
    ],
  },
  {
    name: 'Basic',
    monthlyPrice: 5,
    yearlyPrice: 50,
    period: 'month',
    description: 'Perfect for growing panels',
    icon: Sparkles,
    color: 'from-blue-500 to-blue-600',
    popular: true,
    features: [
      'Up to 5,000 Services',
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
    monthlyPrice: 15,
    yearlyPrice: 150,
    period: 'month',
    description: 'For serious SMM businesses',
    icon: Crown,
    color: 'from-amber-500 to-amber-600',
    features: [
      'Up to 10,000 Services',
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [downgradeDialogOpen, setDowngradeDialogOpen] = useState(false);
  const [pendingDowngradePlan, setPendingDowngradePlan] = useState<string | null>(null);
  const [commissionData, setCommissionData] = useState<CommissionData>({
    commissionRate: 5,
    earnedThisMonth: 0,
    pendingCommission: 0,
    paidCommission: 0,
  });

  // Balance upgrade dialog state
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [pendingUpgradePlan, setPendingUpgradePlan] = useState<typeof plans[0] | null>(null);
  const [balancePaymentLoading, setBalancePaymentLoading] = useState(false);

  // Gateway selection dialog state
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false);
  const [pendingGatewayPlan, setPendingGatewayPlan] = useState<typeof plans[0] | null>(null);

  // Use admin-controlled payment gateways for panel owner billing (not panel-configured buyer gateways)
  const { gateways: availableGateways, loading: gatewaysLoading } = useAdminPaymentGateways();

  // Supported gateways that have backend processing in process-payment edge function
  const SUPPORTED_GATEWAYS = new Set([
    'stripe', 'paypal', 'coinbase', 'flutterwave', 'paystack', 'korapay',
    'heleket', 'razorpay', 'monnify', 'nowpayments', 'coingate', 'binancepay',
    'cryptomus', 'skrill', 'perfectmoney', 'square', 'braintree', 'ach',
    'sepa', 'btcpay', 'wise', 'manual_transfer'
  ]);

  // Filter to only gateways supported by the backend
  const supportedGateways = availableGateways.filter(g => SUPPORTED_GATEWAYS.has(g.id) || g.id.startsWith('manual_'));

  // Helper to get plan price based on billing cycle
  const getPlanPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0;
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getYearlySavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 0;
    return (plan.monthlyPrice * 12) - plan.yearlyPrice;
  };

  useEffect(() => {
    if (panel?.id) {
      fetchBillingData();

      const params = new URLSearchParams(window.location.search);
      let transactionId = params.get('transaction_id');
      const isSuccess = params.get('deposit') === 'success' || params.get('upgrade') === 'success' || params.get('commission') === 'success' || params.get('success') === 'true';
      const isCancelled = params.get('cancelled') === 'true';

      if (isSuccess || isCancelled || transactionId) {
        window.history.replaceState({}, '', '/panel/billing');

        if (isCancelled) {
          toast({ variant: 'destructive', title: 'Payment Cancelled', description: 'Your payment was not completed.' });
          if (transactionId) {
            fetchBillingData();
          }
        } else if (transactionId) {
          toast({ title: 'Verifying Payment...', description: 'Please wait while we confirm your payment.' });
          
          const verifyPayment = async () => {
            try {
              const { data } = await supabase.functions.invoke('process-payment', {
                body: { action: 'verify-payment', transactionId }
              });
              if (data?.status === 'completed') {
                if (data?.subscriptionUpdated) {
                  toast({ title: 'Subscription Activated!', description: 'Your plan has been upgraded successfully.' });
                } else {
                  toast({ title: 'Payment Successful!', description: `$${Number(data.amount).toFixed(2)} has been added to your balance.` });
                }
                fetchBillingData();
              } else if (data?.status === 'failed') {
                toast({ variant: 'destructive', title: 'Payment Failed', description: 'Your payment could not be processed. Please try again.' });
                fetchBillingData();
              } else {
                let attempts = 0;
                const poll = setInterval(async () => {
                  attempts++;
                  const { data: txData } = await supabase.from('transactions').select('status, amount').eq('id', transactionId).single();
                  if (txData?.status === 'completed') {
                    clearInterval(poll);
                    toast({ title: 'Payment Successful!', description: `$${Number(txData.amount).toFixed(2)} added to balance.` });
                    fetchBillingData();
                  } else if (txData?.status === 'failed') {
                    clearInterval(poll);
                    toast({ variant: 'destructive', title: 'Payment Failed', description: 'Your deposit could not be processed. Please try again.' });
                    fetchBillingData();
                  } else if (attempts >= 10) {
                    clearInterval(poll);
                    toast({ title: 'Payment Processing', description: 'Your payment is still being verified. Balance will update shortly.' });
                  }
                }, 2000);
              }
            } catch (err) {
              console.error('Verify error:', err);
              toast({ title: 'Payment Processing', description: 'Balance will update shortly.' });
              setTimeout(() => fetchBillingData(), 3000);
            }
          };
          verifyPayment();
        } else if (isSuccess) {
          const lookupAndVerify = async () => {
            try {
              const { data: recentTx } = await supabase
                .from('transactions')
                .select('id')
                .eq('panel_id', panel.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
              
              if (recentTx?.id) {
                transactionId = recentTx.id;
                toast({ title: 'Verifying Payment...', description: 'Please wait while we confirm your payment.' });
                const { data } = await supabase.functions.invoke('process-payment', {
                  body: { action: 'verify-payment', transactionId: recentTx.id }
                });
                if (data?.status === 'completed') {
                  if (data?.subscriptionUpdated) {
                    toast({ title: 'Subscription Activated!', description: 'Your plan has been upgraded successfully.' });
                  } else {
                    toast({ title: 'Payment Successful!', description: `$${Number(data.amount).toFixed(2)} has been added to your balance.` });
                  }
                  fetchBillingData();
                } else if (data?.status === 'failed') {
                  toast({ variant: 'destructive', title: 'Payment Failed', description: 'Your payment could not be processed.' });
                  fetchBillingData();
                } else {
                  toast({ title: 'Payment Processing', description: 'Your payment is being confirmed. Balance will update shortly.' });
                  setTimeout(() => fetchBillingData(), 3000);
                }
              } else {
                toast({ title: 'Payment Processing', description: 'Your payment is being confirmed. Balance will update shortly.' });
                setTimeout(() => fetchBillingData(), 3000);
              }
            } catch (err) {
              console.error('Lookup verify error:', err);
              toast({ title: 'Payment Processing', description: 'Balance will update shortly.' });
              setTimeout(() => fetchBillingData(), 3000);
            }
          };
          lookupAndVerify();
        }
      }

      // Subscribe to transaction updates for real-time balance
      const channel = supabase
        .channel('billing-transactions')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `panel_id=eq.${panel.id}`
        }, (payload) => {
          const newStatus = (payload.new as any)?.status;
          if (newStatus === 'completed') {
            const meta = (payload.new as any).metadata;
            if (meta?.type === 'subscription') {
              toast({ 
                title: 'Subscription Activated!', 
                description: `Your ${meta.plan || 'new'} plan has been activated successfully.` 
              });
            } else {
              toast({ 
                title: 'Payment Completed!', 
                description: `$${(payload.new as any).amount?.toFixed(2) || '0.00'} has been added to your balance.` 
              });
            }
            fetchBillingData();
          } else if (newStatus === 'failed') {
            toast({ 
              variant: 'destructive',
              title: 'Payment Failed', 
              description: 'Your payment could not be processed. Please try again or use a different payment method.' 
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
      // Fetch fresh panel balance from DB (not cached hook value)
      const { data: freshPanel } = await supabase
        .from('panels')
        .select('balance')
        .eq('id', panel.id)
        .single();
      setPanelBalance(freshPanel?.balance || 0);

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
    if (getPlanPrice(plan) === 0) {
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

    // Check if panel balance covers the plan price — show choice dialog
    if (panelBalance >= getPlanPrice(plan)) {
      setPendingUpgradePlan(plan);
      setBalanceDialogOpen(true);
      return;
    }

    // Not enough balance — show gateway selector
    if (supportedGateways.length === 1) {
      await proceedWithGatewayPayment(plan, supportedGateways[0].id);
    } else {
      setPendingGatewayPlan(plan);
      setGatewayDialogOpen(true);
    }
  };

  const handleBalanceUpgrade = async () => {
    if (!pendingUpgradePlan || !panel?.id || !profile?.id) return;

    setBalancePaymentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          action: 'balance-payment',
          panelId: panel.id,
          userId: profile.id,
          amount: getPlanPrice(pendingUpgradePlan),
          plan: pendingUpgradePlan.name.toLowerCase(),
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Balance payment failed');

      toast({ title: 'Plan Upgraded!', description: `Successfully upgraded to ${pendingUpgradePlan.name} using your balance.` });
      setBalanceDialogOpen(false);
      setPendingUpgradePlan(null);
      fetchBillingData();
    } catch (err: any) {
      console.error('Balance upgrade error:', err);
      toast({ variant: 'destructive', title: 'Upgrade Failed', description: err.message || 'Failed to upgrade using balance.' });
    } finally {
      setBalancePaymentLoading(false);
    }
  };

  const proceedWithGatewayPayment = async (plan: typeof plans[0], selectedGateway?: string) => {
    if (!panel?.id || !profile?.id) return;

    const gatewayToUse = selectedGateway || supportedGateways[0]?.id;
    if (!gatewayToUse) {
      toast({
        variant: 'destructive',
        title: 'Payment Methods Unavailable',
        description: 'Platform payment methods are not configured yet. Please contact the administrator.'
      });
      return;
    }
    setUpgradeLoading(plan.name);
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          gateway: gatewayToUse,
          amount: getPlanPrice(plan),
          panelId: panel.id,
          buyerId: profile.id,
          isOwnerDeposit: true,
          returnUrl: `${window.location.origin}/panel/billing`,
          cancelUrl: `${window.location.origin}/panel/billing?cancelled=true`,
          metadata: {
            type: 'subscription',
            plan: plan.name.toLowerCase(),
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
    if (!panel?.id || !profile?.id) {
      toast({
        variant: 'destructive',
        title: 'Session Error',
        description: 'Panel or user session not available. Please refresh the page.'
      });
      return;
    }

    if (!method) {
      toast({
        variant: 'destructive',
        title: 'No Payment Method',
        description: 'Please select a payment method to continue.'
      });
      return;
    }

    setDepositLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          gateway: method,
          amount,
          panelId: panel.id,
          buyerId: profile.id,
          isOwnerDeposit: true,
          returnUrl: `${window.location.origin}/panel/billing`,
          cancelUrl: `${window.location.origin}/panel/billing?cancelled=true`,
          metadata: {
            type: 'panel_deposit',
            panelId: panel.id,
            panelName: panel.name,
            ownerEmail: profile.email
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
        description: error.message || 'Failed to initiate deposit. Please check your payment gateway configuration.' 
      });
    } finally {
      setDepositLoading(false);
    }
  };

  const handlePayCommission = async () => {
    if (!panel?.id || !profile?.id || commissionData.pendingCommission <= 0) return;

    const gatewayToUse = supportedGateways[0]?.id;
    if (!gatewayToUse) {
      toast({
        variant: 'destructive',
        title: 'Payment Methods Unavailable',
        description: 'Platform payment methods are not configured yet. Please contact the administrator.'
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          gateway: gatewayToUse,
          amount: commissionData.pendingCommission,
          panelId: panel.id,
          buyerId: profile.id,
          isOwnerDeposit: true,
          returnUrl: `${window.location.origin}/panel/billing`,
          cancelUrl: `${window.location.origin}/panel/billing?cancelled=true`,
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
  const isExpired = subscription?.status === 'expired' && currentPlan !== 'free';

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
        <title>Billing & Subscription - Home of SMM</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Subscription Expiry Lock Banner */}
      {isExpired && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border-2 border-destructive/50 bg-destructive/10 p-6 text-center space-y-3"
        >
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-destructive">Subscription Expired</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your <span className="font-semibold capitalize">{currentPlan}</span> plan has expired. 
            Please renew your subscription to regain full access to your panel features.
          </p>
          {panelBalance >= (plans.find(p => p.name.toLowerCase() === currentPlan)?.monthlyPrice || 999) && (
            <Badge className="bg-emerald-500/20 text-emerald-500 text-sm">
              You have ${panelBalance.toFixed(2)} — enough to renew!
            </Badge>
          )}
        </motion.div>
      )}

      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription, balance, and pricing plans</p>
      </motion.div>

      {/* Trial Expiry Banner */}
      <TrialExpiryBanner panelId={panel?.id} />

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
                subscription?.status === 'active' && "bg-emerald-500/20 text-emerald-500",
                (subscription?.status as any) === 'trial' && "bg-amber-500/20 text-amber-500",
                subscription?.status === 'expired' && "bg-destructive/20 text-destructive"
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
              ${getPlanPrice(plans.find(p => p.name.toLowerCase() === currentPlan) || plans[0])}
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

      {/* Main Grid - Deposit + Commission */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Deposit */}
        <div className="lg:col-span-2">
          <QuickDeposit onDeposit={handleDeposit} loading={depositLoading} />
        </div>

        {/* Sidebar - Commission (only for free plan) */}
        {(!currentPlan || currentPlan === 'free') && (
          <div className="space-y-6">
            <CommissionTracker 
              commissionRate={commissionData.commissionRate}
              earnedThisMonth={commissionData.earnedThisMonth}
              pendingCommission={commissionData.pendingCommission}
              paidCommission={commissionData.paidCommission}
              onPayCommission={handlePayCommission} 
            />
          </div>
        )}
      </motion.div>


      {/* Billing Cycle Toggle + Pricing Plans */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Choose Your Plan</h2>
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-2">
            <Label htmlFor="billing-cycle" className={cn("text-sm cursor-pointer", billingCycle === 'monthly' && "font-semibold")}>Monthly</Label>
            <Switch 
              id="billing-cycle"
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <Label htmlFor="billing-cycle" className={cn("text-sm cursor-pointer", billingCycle === 'yearly' && "font-semibold")}>
              Yearly
              <Badge className="ml-2 bg-emerald-500/20 text-emerald-500 text-[10px]">Save up to 17%</Badge>
            </Label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, planIndex) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.name.toLowerCase();
            const isLoading = upgradeLoading === plan.name;
            const currentPlanIndex = plans.findIndex(p => p.name.toLowerCase() === currentPlan);
            const isLowerTier = planIndex < currentPlanIndex;
            const isActivePaid = subscription?.status === 'active' && currentPlan !== 'free';
            const isDisabled = isCurrent || isLoading || (isLowerTier && isActivePaid);
            // Show "Renew" for expired plans matching current tier
            const isRenewable = isExpired && isCurrent;
            
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
                  isCurrent && !isExpired && "ring-2 ring-primary",
                  isRenewable && "ring-2 ring-destructive"
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
                      <span className="text-4xl font-bold">${getPlanPrice(plan)}</span>
                      <span className="text-muted-foreground">/{billingCycle === 'yearly' && plan.monthlyPrice > 0 ? 'year' : plan.period}</span>
                      {billingCycle === 'yearly' && getYearlySavings(plan) > 0 && (
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">
                            Save ${getYearlySavings(plan)}/year
                          </Badge>
                        </div>
                      )}
                    </div>

                    {isCurrent && !isExpired && subscription?.expires_at && (
                      <div className="text-center text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Renews {new Date(subscription.expires_at).toLocaleDateString()}
                      </div>
                    )}
                    
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
                        isRenewable && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
                        (isCurrent && !isRenewable || (isDisabled && !isRenewable && !(isLowerTier && isActivePaid))) && "bg-muted text-muted-foreground hover:bg-muted"
                      )}
                      variant={isRenewable ? 'default' : isLowerTier && isActivePaid ? 'outline' : plan.popular && !isDisabled ? 'default' : 'outline'}
                      onClick={() => {
                        if (isLowerTier && isActivePaid) {
                          setPendingDowngradePlan(plan.name.toLowerCase());
                          setDowngradeDialogOpen(true);
                        } else if (isRenewable || !isDisabled) {
                          handleUpgrade(plan.name);
                        }
                      }}
                      disabled={isCurrent && !isRenewable}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : isRenewable ? (
                        <>
                          <Crown className="w-4 h-4" />
                          Renew Plan
                        </>
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : isLowerTier && isActivePaid ? (
                        <>
                          <ArrowDownRight className="w-4 h-4" />
                          Downgrade
                        </>
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

      {/* Downgrade Confirmation Dialog */}
      <AlertDialog open={downgradeDialogOpen} onOpenChange={setDowngradeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-amber-500" />
              Downgrade Plan?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Your current <span className="font-semibold capitalize">{currentPlan}</span> plan will remain active until{' '}
                <span className="font-semibold">
                  {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'the end of your billing period'}
                </span>.
              </p>
              <p>
                After that, you'll be switched to the <span className="font-semibold capitalize">{pendingDowngradePlan}</span> plan.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!panel?.id || !pendingDowngradePlan) return;
                try {
                  await supabase
                    .from('panel_subscriptions')
                    .update({ pending_downgrade: pendingDowngradePlan })
                    .eq('panel_id', panel.id);
                  toast({ title: 'Downgrade Scheduled', description: `Your plan will change to ${pendingDowngradePlan} at the end of the current billing period.` });
                  setDowngradeDialogOpen(false);
                  setPendingDowngradePlan(null);
                } catch (err) {
                  toast({ variant: 'destructive', title: 'Error', description: 'Failed to schedule downgrade.' });
                }
              }}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Confirm Downgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              Pay from Balance?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You have <span className="font-semibold text-emerald-500">${panelBalance.toFixed(2)}</span> in your panel balance. 
                The <span className="font-semibold capitalize">{pendingUpgradePlan?.name}</span> plan costs <span className="font-semibold">${pendingUpgradePlan ? getPlanPrice(pendingUpgradePlan) : 0}/{billingCycle}</span>.
              </p>
              <p>Would you like to pay from your balance or use an external payment gateway?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={balancePaymentLoading}>Cancel</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                setBalanceDialogOpen(false);
                if (pendingUpgradePlan) {
                  if (supportedGateways.length === 1) {
                    proceedWithGatewayPayment(pendingUpgradePlan, supportedGateways[0].id);
                  } else {
                    setPendingGatewayPlan(pendingUpgradePlan);
                    setGatewayDialogOpen(true);
                  }
                }
              }}
              disabled={balancePaymentLoading}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay via Gateway
            </Button>
            <Button
              onClick={handleBalanceUpgrade}
              disabled={balancePaymentLoading}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              {balancePaymentLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Wallet className="w-4 h-4 mr-2" />
              )}
              Use Balance (${pendingUpgradePlan ? getPlanPrice(pendingUpgradePlan) : 0})
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <GatewaySelectDialog
        open={gatewayDialogOpen}
        onOpenChange={setGatewayDialogOpen}
        gateways={supportedGateways}
        loading={upgradeLoading !== null}
        title="Select Payment Gateway"
        description="Choose how you'd like to pay for your subscription"
        onSelect={async (gatewayId) => {
          setGatewayDialogOpen(false);
          if (pendingGatewayPlan) {
            await proceedWithGatewayPayment(pendingGatewayPlan, gatewayId);
            setPendingGatewayPlan(null);
          }
        }}
      />
    </motion.div>
  );
};

export default Billing;
