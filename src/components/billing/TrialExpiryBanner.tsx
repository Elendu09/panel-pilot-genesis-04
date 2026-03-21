import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TrialExpiryBannerProps {
  panelId?: string;
}

export const TrialExpiryBanner = ({ panelId }: TrialExpiryBannerProps) => {
  const navigate = useNavigate();
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!panelId) return;

    const fetchStatus = async () => {
      const { data: panel } = await supabase
        .from('panels')
        .select('subscription_status')
        .eq('id', panelId)
        .single();

      if (!panel) return;
      setSubscriptionStatus(panel.subscription_status);

      // Fetch subscription details for both trial and paid plans
      const { data: sub } = await supabase
        .from('panel_subscriptions')
        .select('trial_ends_at, expires_at, status, plan_type')
        .eq('panel_id', panelId)
        .maybeSingle();

      if (sub) {
        setPlanType(sub.plan_type);
        // Use trial_ends_at for trials, expires_at for paid subscriptions
        if (panel.subscription_status === 'trial' && sub.trial_ends_at) {
          setExpiresAt(new Date(sub.trial_ends_at));
        } else if (sub.expires_at) {
          setExpiresAt(new Date(sub.expires_at));
        }
      }
    };

    fetchStatus();
  }, [panelId]);

  if (dismissed || !subscriptionStatus) return null;

  // Show for trial, expired, or active paid plans nearing expiry
  const isTrialOrExpired = subscriptionStatus === 'trial' || subscriptionStatus === 'expired';
  const now = new Date();
  const isExpired = expiresAt ? now > expiresAt : subscriptionStatus === 'expired';

  // For active paid plans, show warning when <= 7 days remain
  const isActivePaid = subscriptionStatus === 'active' && planType && planType !== 'free' && expiresAt;
  const daysUntilExpiry = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  const showPaidWarning = isActivePaid && daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  if (!isTrialOrExpired && !showPaidWarning) return null;

  const getDaysRemaining = () => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const getHoursRemaining = () => {
    if (!expiresAt) return 0;
    return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)));
  };

  const daysLeft = getDaysRemaining();
  const hoursLeft = getHoursRemaining();

  if (isExpired) {
    return (
      <Alert className="border-destructive/50 bg-destructive/10 mb-4">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <span className="font-semibold text-destructive">
              {subscriptionStatus === 'trial' ? 'Trial Expired' : 'Subscription Expired'}
            </span>
            <span className="text-muted-foreground ml-2">
              {subscriptionStatus === 'trial' 
                ? 'Your free trial has ended. Subscribe now to keep your panel active.'
                : `Your ${planType || ''} plan has expired. Renew to maintain access.`
              }
            </span>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/panel/billing')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" />
            {subscriptionStatus === 'trial' ? 'Subscribe Now' : 'Renew Now'}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Active trial or paid plan nearing expiry
  const isUrgent = daysLeft <= 1;
  const label = subscriptionStatus === 'trial' ? 'Trial Active' : `${(planType || '').charAt(0).toUpperCase() + (planType || '').slice(1)} Plan`;

  return (
    <Alert className={cn(
      "mb-4",
      isUrgent 
        ? "border-orange-500/50 bg-orange-500/10" 
        : "border-amber-500/30 bg-amber-500/5"
    )}>
      <Clock className={cn("h-4 w-4", isUrgent ? "text-orange-500" : "text-amber-500")} />
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={cn(
            "text-xs",
            isUrgent ? "border-orange-500/50 text-orange-500" : "border-amber-500/50 text-amber-500"
          )}>
            {label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {daysLeft > 0 
              ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
              : `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} remaining`
            }
            {isUrgent && (subscriptionStatus === 'trial' ? ' — Subscribe to avoid interruption' : ' — Renew to avoid interruption')}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-xs text-muted-foreground"
          >
            Dismiss
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate('/panel/billing')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" />
            {subscriptionStatus === 'trial' ? 'Subscribe' : 'Renew'}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
