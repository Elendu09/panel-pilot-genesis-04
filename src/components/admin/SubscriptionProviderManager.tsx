import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Loader2, 
  Save, 
  CheckCircle2,
  Globe,
  Wallet,
  Bitcoin
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

interface PaymentProvider {
  id: string;
  provider_name: string;
  display_name: string;
  category: string;
  is_enabled: boolean;
  config: any;
  supports_subscriptions: boolean;
  fee_percentage: number;
  fixed_fee: number;
  logo_url: string | null;
}

const categoryIcons: Record<string, React.ElementType> = {
  card: CreditCard,
  wallet: Wallet,
  crypto: Bitcoin,
  local: Globe,
  bank: Globe
};

export const SubscriptionProviderManager = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, { publicKey: string; secretKey: string; testMode: boolean }>>({});

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_payment_providers')
        .select('*')
        .order('display_name');

      if (error) throw error;
      
      setProviders(data || []);
      
      // Initialize configs from stored data
      const initialConfigs: Record<string, any> = {};
      data?.forEach(p => {
        initialConfigs[p.provider_name] = {
          publicKey: (p.config as any)?.publicKey || '',
          secretKey: (p.config as any)?.secretKey || '',
          testMode: (p.config as any)?.testMode ?? true
        };
      });
      setConfigs(initialConfigs);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({ variant: 'destructive', title: 'Failed to load providers' });
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = async (provider: PaymentProvider) => {
    setSaving(provider.id);
    try {
      const { error } = await supabase
        .from('platform_payment_providers')
        .update({ is_enabled: !provider.is_enabled })
        .eq('id', provider.id);

      if (error) throw error;

      setProviders(prev => prev.map(p => 
        p.id === provider.id ? { ...p, is_enabled: !p.is_enabled } : p
      ));

      toast({ 
        title: `${provider.display_name} ${!provider.is_enabled ? 'enabled' : 'disabled'}` 
      });
    } catch (error) {
      console.error('Error toggling provider:', error);
      toast({ variant: 'destructive', title: 'Failed to update provider' });
    } finally {
      setSaving(null);
    }
  };

  const updateConfig = (providerName: string, field: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [providerName]: {
        ...prev[providerName],
        [field]: value
      }
    }));
  };

  const saveProviderConfig = async (provider: PaymentProvider) => {
    setSaving(provider.id);
    try {
      const config = configs[provider.provider_name] || {};
      
      const { error } = await supabase
        .from('platform_payment_providers')
        .update({ config })
        .eq('id', provider.id);

      if (error) throw error;

      toast({ title: `${provider.display_name} configuration saved` });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({ variant: 'destructive', title: 'Failed to save configuration' });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {providers.map((provider) => {
        const Icon = categoryIcons[provider.category] || CreditCard;
        const config = configs[provider.provider_name] || { publicKey: '', secretKey: '', testMode: true };
        
        return (
          <Card 
            key={provider.id} 
            className={cn(
              "border transition-all",
              provider.is_enabled 
                ? "border-primary/30 bg-primary/5" 
                : "border-border/50"
            )}
          >
            <CardContent className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {provider.logo_url ? (
                    <img 
                      src={provider.logo_url} 
                      alt={provider.display_name} 
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{provider.display_name}</span>
                      {provider.supports_subscriptions && (
                        <Badge variant="secondary" className="text-xs">Subscriptions</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{provider.category}</span>
                  </div>
                </div>
                <Switch
                  checked={provider.is_enabled}
                  onCheckedChange={() => toggleProvider(provider)}
                  disabled={saving === provider.id}
                />
              </div>

              {/* Config Fields - Only show when enabled */}
              {provider.is_enabled && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div className="space-y-2">
                    <Label className="text-xs">API Key / Client ID</Label>
                    <Input
                      placeholder={`${provider.provider_name}_key_...`}
                      value={config.publicKey}
                      onChange={(e) => updateConfig(provider.provider_name, 'publicKey', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Secret Key</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={config.secretKey}
                      onChange={(e) => updateConfig(provider.provider_name, 'secretKey', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={config.testMode}
                        onCheckedChange={(checked) => updateConfig(provider.provider_name, 'testMode', checked)}
                      />
                      <span className="text-muted-foreground">Test Mode</span>
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveProviderConfig(provider)}
                      disabled={saving === provider.id}
                      className="gap-1"
                    >
                      {saving === provider.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {/* Status indicator */}
              {provider.is_enabled && config.secretKey && (
                <div className="flex items-center gap-2 text-xs text-emerald-500">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Configured</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
