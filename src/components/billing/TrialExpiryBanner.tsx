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
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!panelId) return;

    const fetchTrialStatus = async () => {
      const { data: panel } = await supabase
        .from('panels')
        .select('subscription_status')
        .eq('id', panelId)
        .single();

      if (!panel) return;
      setSubscriptionStatus(panel.subscription_status);

      if (panel.subscription_status === 'trial' || panel.subscription_status === 'expired') {
        const { data: sub } = await supabase
          .from('panel_subscriptions')
          .select('trial_ends_at, status')
          .eq('panel_id', panelId)
          .maybeSingle();

        if (sub?.trial_ends_at) {
          setTrialEndsAt(new Date(sub.trial_ends_at));
        }
      }
    };

    fetchTrialStatus();
  }, [panelId]);

  if (dismissed || !subscriptionStatus) return null;
  if (subscriptionStatus !== 'trial' && subscriptionStatus !== 'expired') return null;

  const now = new Date();
  const isExpired = trialEndsAt ? now > trialEndsAt : subscriptionStatus === 'expired';

  const getDaysRemaining = () => {
    if (!trialEndsAt) return 0;
    const diff = trialEndsAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getHoursRemaining = () => {
    if (!trialEndsAt) return 0;
    const diff = trialEndsAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
  };

  const daysLeft = getDaysRemaining();
  const hoursLeft = getHoursRemaining();

  if (isExpired) {
    return (
      <Alert className="border-destructive/50 bg-destructive/10 mb-4">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-1">
            <span className="font-semibold text-destructive">Trial Expired</span>
            <span className="text-muted-foreground ml-2">
              Your free trial has ended. Subscribe now to keep your panel active.
            </span>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/panel/billing')}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 gap-1.5"
          >
            <Crown className="w-3.5 h-3.5" />
            Subscribe Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial is active
  const isUrgent = daysLeft <= 1;

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
            Trial Active
          </Badge>
          <span className="text-sm text-muted-foreground">
            {daysLeft > 0 
              ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`
              : `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} remaining`
            }
            {isUrgent && ' — Subscribe to avoid interruption'}
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
            Subscribe
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
