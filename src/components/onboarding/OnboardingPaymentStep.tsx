import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, ExternalLink, CheckCircle2, Shield, Clock, Sparkles, Lock } from "lucide-react";
import { SlideToUnlock } from './SlideToUnlock';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PaymentProvider {
  id: string;
  provider_name: string;
  display_name: string;
  category: string;
  supports_subscriptions: boolean;
  logo_url: string | null;
  is_enabled: boolean;
}

interface OnboardingPaymentStepProps {
  selectedPlan: 'basic' | 'pro';
  panelId?: string;
  onPaymentSuccess: () => void;
  onSkip?: () => void;
  paymentCompleted?: boolean;
  trialStarted?: boolean;
  onSlideUnlocked?: () => void;
  slideUnlocked?: boolean;
  verifying?: boolean;
}

const planPrices = { basic: 5, pro: 15 };
const planGlow = {
  basic: 'shadow-[0_0_40px_rgba(59,130,246,0.2)]',
  pro: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]',
};
const planGradient = {
  basic: 'from-blue-500 to-blue-600',
  pro: 'from-amber-500 to-amber-600',
};

export const OnboardingPaymentStep = ({ 
  selectedPlan, panelId, onPaymentSuccess, onSkip, paymentCompleted = false, trialStarted = false,
  onSlideUnlocked, slideUnlocked = false
}: OnboardingPaymentStepProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => { fetchPaymentProviders(); }, []);

  // Realtime subscription + polling for payment status sync
  useEffect(() => {
    if (!panelId || paymentCompleted) return;

    // Realtime subscription
    const channel = supabase
      .channel(`panel-payment-${panelId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'panels',
        filter: `id=eq.${panelId}`
      }, (payload: any) => {
        const status = payload.new?.subscription_status;
        if (status === 'active' || status === 'trial') {
          onPaymentSuccess();
        }
      })
      .subscribe();

    // Polling fallback (3 attempts, 5s intervals) for gateway return
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        const { data } = await supabase
          .from('panels')
          .select('subscription_status')
          .eq('id', panelId)
          .single();
        if (data?.subscription_status === 'active' || data?.subscription_status === 'trial') {
          clearInterval(poll);
          onPaymentSuccess();
        }
        if (attempts >= 3) clearInterval(poll);
      }, 5000);
      return () => { clearInterval(poll); supabase.removeChannel(channel); };
    }

    return () => { supabase.removeChannel(channel); };
  }, [panelId, paymentCompleted, onPaymentSuccess]);

  const fetchPaymentProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_payment_providers')
        .select('*')
        .eq('is_enabled', true)
        .eq('supports_subscriptions', true);
      if (error) throw error;
      setProviders(data || []);
      if (data && data.length > 0) setSelectedProvider(data[0].provider_name);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!panelId) {
      toast({ variant: 'destructive', title: 'Setup Error', description: 'Panel not yet created. Please go back and complete previous steps first.' });
      return;
    }
    if (!selectedProvider) {
      toast({ variant: 'destructive', title: 'Please select a payment method' });
      return;
    }
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ variant: 'destructive', title: 'Please sign in first' }); return; }
      const returnUrl = `${window.location.origin}/panel/onboarding?payment=success`;
      const { data, error: fnError } = await supabase.functions.invoke('process-payment', {
        body: {
          gateway: selectedProvider, amount: planPrices[selectedPlan], panelId,
          buyerId: user.id, returnUrl, currency: 'usd', isOwnerDeposit: true,
          metadata: { type: 'subscription', plan: selectedPlan },
        }
      });
      if (fnError) throw fnError;
      if (data?.success && (data?.redirectUrl || data?.url)) {
        if (panelId) {
          await supabase.from('panels').update({ 
            subscription_tier: selectedPlan, subscription_status: 'pending'
          }).eq('id', panelId);
        }
        window.location.href = data.redirectUrl || data.url;
      } else {
        toast({ variant: 'destructive', title: 'Payment Error', description: data?.error || 'Could not initialize payment.' });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({ variant: 'destructive', title: 'Payment failed', description: error.message || 'Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleSkipWithTrial = async () => {
    if (panelId) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 3);
      await supabase.from('panels').update({
        subscription_tier: selectedPlan,
        subscription_status: 'trial',
      }).eq('id', panelId);
      await supabase.from('panel_subscriptions').upsert({
        panel_id: panelId,
        plan_type: selectedPlan,
        price: planPrices[selectedPlan],
        status: 'trial' as any,
        started_at: new Date().toISOString(),
        expires_at: trialEndsAt.toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
      }, { onConflict: 'panel_id' });
    }
    onSkip?.();
  };

  const getProviderIcon = (providerName: string, logoUrl: string | null) => {
    if (logoUrl) return <img src={logoUrl} alt={providerName} className="w-6 h-6 object-contain" />;
    return <CreditCard className="w-6 h-6" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-6 text-center">
            <p className="text-amber-600 mb-4">No payment providers configured. Contact the platform administrator.</p>
            {onSkip && !paymentCompleted && (
              <Button variant="outline" onClick={handleSkipWithTrial}>
                Start 3-Day Free Trial Instead
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {paymentCompleted ? 'Payment Confirmed' : trialStarted ? 'Trial Active' : 'Complete Payment'}
        </h2>
        <p className="text-muted-foreground">
          {paymentCompleted 
            ? `Your ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan is active. Click Next to continue.`
            : trialStarted
              ? `Your 3-day trial for the ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan is active. Subscribe anytime to continue after the trial.`
              : `Subscribe to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan`
          }
        </p>
      </div>

      {/* Payment confirmed banner */}
      {paymentCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-600">Payment Complete</p>
            <p className="text-xs text-muted-foreground">Your subscription is active. Press Next to set up your domain.</p>
          </div>
        </motion.div>
      )}

      {/* Trial Active banner — amber, NOT green */}
      {trialStarted && !paymentCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-600">3-Day Trial Active</p>
            <p className="text-xs text-muted-foreground">Your trial ends in 3 days. Subscribe before it expires to keep your panel active.</p>
          </div>
        </motion.div>
      )}

      {/* Trial Notice — only when not yet paid AND not trialing */}
      {!paymentCompleted && !trialStarted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium">3-Day Free Trial Included</p>
            <p className="text-xs text-muted-foreground">Try all features free. You'll only be charged after the trial ends.</p>
          </div>
        </motion.div>
      )}

      {/* Order Summary with glow */}
      <Card className={cn(
        "bg-card/60 backdrop-blur-xl border-border/50 transition-shadow duration-500",
        planGlow[selectedPlan]
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-muted-foreground">{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan</span>
            <span className="font-medium">${planPrices[selectedPlan]}/mo</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-muted-foreground">3-Day Trial</span>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Free</Badge>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-bold">Due Today</span>
            <span className="text-xl font-bold text-primary">
              {paymentCompleted ? (
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" /> Paid
                </span>
              ) : trialStarted ? (
                <span className="flex items-center gap-1 text-amber-500">
                  <Clock className="w-5 h-5" /> Trial
                </span>
              ) : (
                `$${planPrices[selectedPlan]}/mo`
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods — hidden when already paid or trial started */}
      {!paymentCompleted && !trialStarted && (
        <div className="space-y-3">
          <label className="text-sm font-medium">Select Payment Method</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {providers.map((provider) => (
              <Card
                key={provider.id}
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  selectedProvider === provider.provider_name
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "border-border/50 hover:border-primary/50"
                )}
                onClick={() => setSelectedProvider(provider.provider_name)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  {getProviderIcon(provider.provider_name, provider.logo_url)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{provider.display_name}</p>
                    <Badge variant="outline" className="text-xs capitalize mt-1">{provider.category}</Badge>
                  </div>
                  {selectedProvider === provider.provider_name && (
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Security */}
      {!paymentCompleted && !trialStarted && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 shrink-0" />
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onSkip && !paymentCompleted && !trialStarted && (
          <Button variant="outline" onClick={handleSkipWithTrial} className="flex-1">
            Start Free Trial
          </Button>
        )}
        {paymentCompleted ? (
          <Button 
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-600 cursor-default"
            disabled
          >
            <Lock className="w-4 h-4" />
            Paid — ${planPrices[selectedPlan]}/mo
            <CheckCircle2 className="w-4 h-4" />
          </Button>
        ) : trialStarted ? (
          <div className="flex-1 space-y-3">
            <SlideToUnlock 
              onUnlock={() => onSlideUnlocked?.()}
              unlocked={slideUnlocked}
              label="Slide right to continue"
            />
          </div>
        ) : (
          <Button 
            className={cn(
              "flex-1 gap-2 relative overflow-hidden bg-gradient-to-r",
              planGradient[selectedPlan]
            )}
            onClick={handlePayment}
            disabled={!selectedProvider || processing}
          >
            <span className="absolute inset-0 overflow-hidden">
              <span className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </span>
            <span className="relative z-10 flex items-center gap-2">
              {processing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <>Pay ${planPrices[selectedPlan]}/mo <ExternalLink className="w-4 h-4" /></>
              )}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
