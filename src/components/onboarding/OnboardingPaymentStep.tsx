import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, ExternalLink, CheckCircle2, Shield } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

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
}

const planPrices = {
  basic: 5,
  pro: 15
};

export const OnboardingPaymentStep = ({ 
  selectedPlan, 
  panelId,
  onPaymentSuccess,
  onSkip 
}: OnboardingPaymentStepProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentProviders();
  }, []);

  const fetchPaymentProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_payment_providers')
        .select('*')
        .eq('is_enabled', true)
        .eq('supports_subscriptions', true);

      if (error) throw error;
      setProviders(data || []);
      
      // Auto-select first provider
      if (data && data.length > 0) {
        setSelectedProvider(data[0].provider_name);
      }
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
      if (!user) {
        toast({ variant: 'destructive', title: 'Please sign in first' });
        return;
      }

      const returnUrl = `${window.location.origin}/panel/onboarding?payment=success`;

      const { data, error: fnError } = await supabase.functions.invoke('process-payment', {
        body: {
          gateway: selectedProvider,
          amount: planPrices[selectedPlan],
          panelId,
          buyerId: user.id,
          returnUrl,
          currency: 'usd',
          isOwnerDeposit: true,
          metadata: { type: 'subscription', plan: selectedPlan },
        }
      });

      if (fnError) throw fnError;

      if (data?.success && (data?.redirectUrl || data?.url)) {
        // Update panel subscription status to pending before redirect
        if (panelId) {
          await supabase
            .from('panels')
            .update({ 
              subscription_tier: selectedPlan,
              subscription_status: 'pending'
            })
            .eq('id', panelId);
        }
        // Redirect to payment gateway
        window.location.href = data.redirectUrl || data.url;
      } else {
        toast({
          variant: 'destructive',
          title: 'Payment Error',
          description: data?.error || 'Could not initialize payment. Please try again.'
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({ variant: 'destructive', title: 'Payment failed', description: error.message || 'Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  const getProviderIcon = (providerName: string, logoUrl: string | null) => {
    if (logoUrl) {
      return <img src={logoUrl} alt={providerName} className="w-6 h-6 object-contain" />;
    }
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
            <p className="text-amber-600 mb-4">
              No payment providers are currently configured. Please contact the platform administrator.
            </p>
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Continue with Free Plan
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
        <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
        <p className="text-muted-foreground">
          Subscribe to {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan for ${planPrices[selectedPlan]}/month
        </p>
      </div>

      {/* Order Summary */}
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <span className="text-muted-foreground">{selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan</span>
            <span className="font-medium">${planPrices[selectedPlan]}/mo</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-bold">Total</span>
            <span className="text-xl font-bold text-primary">${planPrices[selectedPlan]}/mo</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
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
                  <Badge variant="outline" className="text-xs capitalize mt-1">
                    {provider.category}
                  </Badge>
                </div>
                {selectedProvider === provider.provider_name && (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <Shield className="w-4 h-4 shrink-0" />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onSkip && (
          <Button variant="outline" onClick={onSkip} className="flex-1">
            Use Free Plan Instead
          </Button>
        )}
        <Button 
          className="flex-1 gap-2"
          onClick={handlePayment}
          disabled={!selectedProvider || processing}
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay ${planPrices[selectedPlan]}/mo
              <ExternalLink className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
