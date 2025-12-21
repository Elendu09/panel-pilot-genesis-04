import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CreditCard, 
  Check, 
  Zap, 
  Crown, 
  Wallet, 
  Plus, 
  ArrowUpRight,
  Calendar,
  DollarSign,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Subscription {
  id: string;
  plan_type: 'free' | 'basic' | 'pro';
  price: number;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  started_at: string;
  expires_at: string | null;
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
    limitations: [
      'No Custom Domain',
      'Limited API Access',
      'Standard Support'
    ]
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
    limitations: []
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
    limitations: []
  }
];

const Billing = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [panelBalance, setPanelBalance] = useState(0);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('10');

  useEffect(() => {
    fetchBillingData();
  }, [profile?.id]);

  const fetchBillingData = async () => {
    if (!profile?.id) return;

    try {
      // Get panel data
      const { data: panel } = await supabase
        .from('panels')
        .select('id, balance')
        .eq('owner_id', profile.id)
        .single();

      if (panel) {
        setPanelBalance(panel.balance || 0);

        // Get subscription
        const { data: sub } = await supabase
          .from('panel_subscriptions')
          .select('*')
          .eq('panel_id', panel.id)
          .maybeSingle();

        if (sub) {
          setSubscription(sub as Subscription);
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: string) => {
    const plan = plans.find(p => p.name.toLowerCase() === planName.toLowerCase());
    if (!plan) return;

    try {
      const { data: panel } = await supabase
        .from('panels')
        .select('id')
        .eq('owner_id', profile?.id)
        .single();

      if (!panel) {
        toast({ variant: 'destructive', title: 'Error', description: 'Panel not found' });
        return;
      }

      // Upsert subscription
      const { error } = await supabase
        .from('panel_subscriptions')
        .upsert({
          panel_id: panel.id,
          plan_type: planName.toLowerCase() as 'free' | 'basic' | 'pro',
          price: plan.price,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: plan.price > 0 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
            : null
        }, { onConflict: 'panel_id' });

      if (error) throw error;

      toast({ title: 'Success', description: `Upgraded to ${plan.name} plan!` });
      fetchBillingData();
    } catch (error) {
      console.error('Error upgrading:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to upgrade plan' });
    }
  };

  const handleAddFunds = async () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Enter a valid amount' });
      return;
    }

    try {
      const { data: panel } = await supabase
        .from('panels')
        .select('id, balance')
        .eq('owner_id', profile?.id)
        .single();

      if (!panel) return;

      const { error } = await supabase
        .from('panels')
        .update({ balance: (panel.balance || 0) + amount })
        .eq('id', panel.id);

      if (error) throw error;

      toast({ title: 'Success', description: `Added $${amount.toFixed(2)} to your balance` });
      setAddFundsOpen(false);
      fetchBillingData();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add funds' });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-96 bg-muted rounded-xl"></div>)}
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
        <p className="text-muted-foreground">Manage your subscription plan and add funds</p>
      </motion.div>

      {/* Balance & Current Plan Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Balance Card */}
        <Card className="glass-card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Panel Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-emerald-500">${panelBalance.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Available for services</p>
              </div>
              <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass">
                  <DialogHeader>
                    <DialogTitle>Add Funds to Balance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-4 gap-2">
                      {['10', '25', '50', '100'].map(amount => (
                        <Button
                          key={amount}
                          variant={fundAmount === amount ? 'default' : 'outline'}
                          onClick={() => setFundAmount(amount)}
                          className="w-full"
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        className="pl-9"
                        placeholder="Custom amount"
                      />
                    </div>
                    <Button onClick={handleAddFunds} className="w-full">
                      Add ${fundAmount || '0'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Current Plan Card */}
        <Card className="glass-card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold capitalize">{currentPlan}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subscription?.expires_at 
                    ? `Renews ${new Date(subscription.expires_at).toLocaleDateString()}`
                    : 'No expiration'
                  }
                </p>
              </div>
              <Badge className={cn(
                "capitalize",
                subscription?.status === 'active' && "bg-emerald-500/20 text-emerald-500",
                subscription?.status === 'expired' && "bg-red-500/20 text-red-500"
              )}>
                {subscription?.status || 'active'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Billing Card */}
        <Card className="glass-card-hover relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Next Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-3xl font-bold">
                ${plans.find(p => p.name.toLowerCase() === currentPlan)?.price || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {subscription?.expires_at 
                  ? new Date(subscription.expires_at).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pricing Plans */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold mb-4">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.name.toLowerCase();
            
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
                  "glass-card-hover h-full relative overflow-hidden transition-all duration-300",
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
                      disabled={isCurrent}
                    >
                      {isCurrent ? (
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
