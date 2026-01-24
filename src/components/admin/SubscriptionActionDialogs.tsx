import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Sparkles, 
  Zap, 
  Plus, 
  Minus, 
  Calendar, 
  AlertTriangle,
  Loader2,
  DollarSign,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionWithPanel {
  id: string;
  plan_type: 'free' | 'basic' | 'pro';
  price: number;
  status: string;
  started_at: string;
  expires_at: string | null;
  panel_id?: string;
  panel: {
    id?: string;
    name: string;
    subdomain: string;
    balance?: number;
    owner: {
      email: string;
      full_name: string;
    };
  };
}

// Upgrade/Downgrade Dialog
interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: SubscriptionWithPanel | null;
  onSuccess: () => void;
}

export const UpgradeDialog = ({ open, onClose, subscription, onSuccess }: UpgradeDialogProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'pro'>('basic');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const plans = [
    { key: 'free', name: 'Free', price: 0, icon: Zap, color: 'from-slate-500 to-slate-600' },
    { key: 'basic', name: 'Basic', price: 29, icon: Sparkles, color: 'from-blue-500 to-blue-600' },
    { key: 'pro', name: 'Pro', price: 79, icon: Crown, color: 'from-amber-500 to-amber-600' },
  ];

  const handleSubmit = async () => {
    if (!subscription) return;
    setLoading(true);

    try {
      const panelId = subscription.panel_id || (subscription.panel as any)?.id;
      const { data, error } = await supabase.functions.invoke('admin-panel-ops', {
        body: {
          action: 'update_subscription',
          panel_id: panelId,
          operation: selectedPlan > subscription.plan_type ? 'upgrade' : 'downgrade',
          new_plan: selectedPlan,
          reason: reason || `Admin changed plan to ${selectedPlan}`
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Subscription updated to ${selectedPlan.toUpperCase()}`, {
        description: `${subscription.panel?.name} has been updated successfully`
      });
      
      // Create notification for panel owner
      await supabase.from('panel_notifications').insert({
        panel_id: panelId,
        title: 'Subscription Updated',
        message: `Your subscription has been changed to ${selectedPlan.toUpperCase()} by admin`,
        type: 'subscription'
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to update subscription', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const isUpgrade = selectedPlan && subscription && 
    plans.findIndex(p => p.key === selectedPlan) > plans.findIndex(p => p.key === subscription.plan_type);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isUpgrade ? <ArrowUp className="w-5 h-5 text-emerald-500" /> : <ArrowDown className="w-5 h-5 text-amber-500" />}
            Change Subscription Plan
          </DialogTitle>
          <DialogDescription>
            {subscription?.panel?.name} - Currently on <Badge variant="outline">{subscription?.plan_type}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as any)}>
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = subscription?.plan_type === plan.key;
              return (
                <div 
                  key={plan.key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedPlan === plan.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                    isCurrent && "opacity-50"
                  )}
                  onClick={() => !isCurrent && setSelectedPlan(plan.key as any)}
                >
                  <RadioGroupItem value={plan.key} id={plan.key} disabled={isCurrent} />
                  <div className={cn("p-2 rounded-lg bg-gradient-to-br", plan.color)}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={plan.key} className="cursor-pointer font-medium">
                      {plan.name} {isCurrent && <span className="text-muted-foreground">(current)</span>}
                    </Label>
                    <p className="text-sm text-muted-foreground">${plan.price}/month</p>
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="Enter reason for plan change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || selectedPlan === subscription?.plan_type}
            className={cn(isUpgrade ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700")}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isUpgrade ? 'Upgrade' : 'Downgrade'} Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Extend Subscription Dialog
interface ExtendDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: SubscriptionWithPanel | null;
  onSuccess: () => void;
}

export const ExtendDialog = ({ open, onClose, subscription, onSuccess }: ExtendDialogProps) => {
  const [days, setDays] = useState('30');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const quickOptions = [7, 14, 30, 60, 90];

  const handleSubmit = async () => {
    if (!subscription || !days) return;
    setLoading(true);

    try {
      const panelId = subscription.panel_id || (subscription.panel as any)?.id;
      const { data, error } = await supabase.functions.invoke('admin-panel-ops', {
        body: {
          action: 'update_subscription',
          panel_id: panelId,
          operation: 'extend',
          extend_days: parseInt(days),
          reason: reason || `Extended by ${days} days`
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Subscription extended by ${days} days`, {
        description: `New expiry: ${new Date(data.new_expiry).toLocaleDateString()}`
      });

      // Notify panel owner
      await supabase.from('panel_notifications').insert({
        panel_id: panelId,
        title: 'Subscription Extended',
        message: `Your subscription has been extended by ${days} days`,
        type: 'subscription'
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to extend subscription', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Extend Subscription
          </DialogTitle>
          <DialogDescription>
            {subscription?.panel?.name} - Expires: {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : 'Never'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={days === String(d) ? "default" : "outline"}
                  onClick={() => setDays(String(d))}
                >
                  {d} days
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">Or enter custom days</Label>
            <Input
              id="days"
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Enter number of days"
            />
          </div>

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="Enter reason for extension..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !days}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Extend by {days} Days
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Cancel Subscription Dialog
interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: SubscriptionWithPanel | null;
  onSuccess: () => void;
}

export const CancelDialog = ({ open, onClose, subscription, onSuccess }: CancelDialogProps) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleSubmit = async () => {
    if (!subscription || confirmText !== 'CANCEL') return;
    setLoading(true);

    try {
      const panelId = subscription.panel_id || (subscription.panel as any)?.id;
      const { data, error } = await supabase.functions.invoke('admin-panel-ops', {
        body: {
          action: 'update_subscription',
          panel_id: panelId,
          operation: 'cancel',
          reason: reason || 'Cancelled by admin'
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Subscription cancelled', {
        description: `${subscription.panel?.name} has been cancelled`
      });

      // Notify panel owner
      await supabase.from('panel_notifications').insert({
        panel_id: panelId,
        title: 'Subscription Cancelled',
        message: 'Your subscription has been cancelled by admin. Please contact support for more information.',
        type: 'warning'
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to cancel subscription', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            This will immediately cancel the subscription for {subscription?.panel?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">Warning: This action cannot be undone</p>
            <p className="text-xs text-muted-foreground mt-1">
              The panel will lose access to all premium features immediately.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Reason for cancellation</Label>
            <Textarea
              placeholder="Enter reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Type CANCEL to confirm</Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type CANCEL"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Keep Active</Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit} 
            disabled={loading || confirmText !== 'CANCEL'}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Cancel Subscription
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add Funds Dialog
interface AddFundsDialogProps {
  open: boolean;
  onClose: () => void;
  subscription: SubscriptionWithPanel | null;
  onSuccess: () => void;
}

export const AddFundsDialog = ({ open, onClose, subscription, onSuccess }: AddFundsDialogProps) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  const handleSubmit = async () => {
    if (!subscription || !amount) return;
    setLoading(true);

    try {
      const panelId = subscription.panel_id || (subscription.panel as any)?.id;
      const { data, error } = await supabase.functions.invoke('admin-panel-ops', {
        body: {
          action: 'add_funds',
          panel_id: panelId,
          amount: parseFloat(amount),
          type,
          reason: reason || `Admin ${type}`
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Funds ${type === 'credit' ? 'added' : 'deducted'} successfully`, {
        description: `New balance: $${data.new_balance.toFixed(2)}`
      });

      // Notify panel owner
      await supabase.from('panel_notifications').insert({
        panel_id: panelId,
        title: type === 'credit' ? 'Funds Added' : 'Funds Deducted',
        message: `$${amount} has been ${type === 'credit' ? 'added to' : 'deducted from'} your account${reason ? `: ${reason}` : ''}`,
        type: type === 'credit' ? 'info' : 'warning'
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to update funds', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Manage Panel Funds
          </DialogTitle>
          <DialogDescription>
            {subscription?.panel?.name} - Current balance: ${(subscription?.panel as any)?.balance?.toFixed(2) || '0.00'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Operation Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={type === 'credit' ? 'default' : 'outline'}
                className={cn(type === 'credit' && 'bg-emerald-600 hover:bg-emerald-700')}
                onClick={() => setType('credit')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Credit
              </Button>
              <Button
                type="button"
                variant={type === 'debit' ? 'default' : 'outline'}
                className={cn(type === 'debit' && 'bg-amber-600 hover:bg-amber-700')}
                onClick={() => setType('debit')}
              >
                <Minus className="w-4 h-4 mr-2" />
                Deduct
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  size="sm"
                  variant={amount === String(amt) ? "default" : "outline"}
                  onClick={() => setAmount(String(amt))}
                >
                  ${amt}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Or enter custom amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              placeholder="Enter reason for adjustment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className={cn(type === 'credit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700')}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {type === 'credit' ? 'Add' : 'Deduct'} ${amount || '0'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
