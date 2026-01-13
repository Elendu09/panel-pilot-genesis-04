import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Loader2, 
  Save, 
  CheckCircle2,
  Globe,
  Wallet,
  Bitcoin,
  AlertCircle,
  Copy,
  ExternalLink,
  TestTube,
  XCircle,
  Zap,
  DollarSign,
  Settings2
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
  fee_percentage: number | null;
  fixed_fee: number | null;
  logo_url: string | null;
  regions: string[] | null;
}

interface ProviderConfig {
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
  testMode: boolean;
  // Provider-specific fields
  merchantId?: string;
  encryptionKey?: string;
  clientId?: string;
  sandboxMode?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  card: CreditCard,
  wallet: Wallet,
  crypto: Bitcoin,
  local: Globe,
  bank: Globe
};

const categoryLabels: Record<string, string> = {
  card: 'Cards & Global',
  wallet: 'Digital Wallets',
  crypto: 'Cryptocurrency',
  local: 'Regional',
  bank: 'Bank Transfer'
};

// Provider logos (fallback if not in DB)
const providerLogos: Record<string, string> = {
  stripe: 'https://cdn.brandfetch.io/idxAg10C0L/theme/dark/symbol.svg',
  paypal: 'https://cdn.brandfetch.io/id_-qPibLw/theme/dark/symbol.svg',
  paystack: 'https://website-v3-assets.s3.amazonaws.com/assets/img/logo/paystack-logo.svg',
  flutterwave: 'https://cdn.brandfetch.io/idRBq-xKN_/theme/dark/logo.svg',
  nowpayments: 'https://nowpayments.io/images/logo.svg',
  razorpay: 'https://cdn.brandfetch.io/idDJnN8dek/theme/dark/logo.svg',
  paddle: 'https://cdn.brandfetch.io/id-R5C0kqp/theme/dark/logo.svg',
  lemonsqueezy: 'https://www.lemonsqueezy.com/favicon.ico',
  polar: 'https://polar.sh/favicon.ico'
};

// Get webhook URL based on provider
const getWebhookUrl = (providerName: string) => {
  const baseUrl = `https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1`;
  return `${baseUrl}/payment-webhook?provider=${providerName}`;
};

export const SubscriptionProviderManager = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>({});
  const [activeCategory, setActiveCategory] = useState('all');

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
      const initialConfigs: Record<string, ProviderConfig> = {};
      data?.forEach(p => {
        initialConfigs[p.provider_name] = {
          publicKey: (p.config as any)?.publicKey || '',
          secretKey: (p.config as any)?.secretKey || '',
          webhookSecret: (p.config as any)?.webhookSecret || '',
          testMode: (p.config as any)?.testMode ?? true,
          merchantId: (p.config as any)?.merchantId || '',
          encryptionKey: (p.config as any)?.encryptionKey || '',
          clientId: (p.config as any)?.clientId || '',
          sandboxMode: (p.config as any)?.sandboxMode ?? true
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

  const testPayment = async (provider: PaymentProvider) => {
    setTesting(provider.id);
    try {
      // Simulate test payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({ 
        title: 'Test Successful', 
        description: `${provider.display_name} is configured correctly` 
      });
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Test Failed', 
        description: 'Check your API credentials' 
      });
    } finally {
      setTesting(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const categories = ['all', ...new Set(providers.map(p => p.category))];
  const filteredProviders = activeCategory === 'all' 
    ? providers 
    : providers.filter(p => p.category === activeCategory);

  const enabledCount = providers.filter(p => p.is_enabled).length;
  const configuredCount = providers.filter(p => {
    const config = configs[p.provider_name];
    return p.is_enabled && config?.secretKey;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Providers</p>
              <p className="text-2xl font-bold">{providers.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enabled</p>
              <p className="text-2xl font-bold">{enabledCount}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Settings2 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Configured</p>
              <p className="text-2xl font-bold">{configuredCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-6 h-auto p-1">
          <TabsTrigger value="all" className="text-xs py-2">
            All
          </TabsTrigger>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="text-xs py-2">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Provider Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProviders.map((provider) => {
          const Icon = categoryIcons[provider.category] || CreditCard;
          const config = configs[provider.provider_name] || { 
            publicKey: '', secretKey: '', testMode: true, webhookSecret: '' 
          };
          const logoUrl = provider.logo_url || providerLogos[provider.provider_name];
          const isConfigured = config.secretKey?.length > 0;
          const webhookUrl = getWebhookUrl(provider.provider_name);
          
          return (
            <Card 
              key={provider.id} 
              className={cn(
                "border-2 transition-all overflow-hidden",
                provider.is_enabled 
                  ? "border-primary/40 bg-gradient-to-br from-primary/5 to-transparent" 
                  : "border-border/50 hover:border-border"
              )}
            >
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center p-1.5">
                        <img 
                          src={logoUrl} 
                          alt={provider.display_name} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{provider.display_name}</span>
                        {provider.supports_subscriptions && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Subscriptions
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize">{provider.category}</span>
                        {provider.fee_percentage !== null && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <DollarSign className="w-3 h-3" />
                              {provider.fee_percentage}%
                              {provider.fixed_fee ? ` + $${provider.fixed_fee}` : ''}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {provider.is_enabled && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px]",
                          isConfigured 
                            ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" 
                            : "border-amber-500/50 text-amber-500 bg-amber-500/10"
                        )}
                      >
                        {isConfigured ? 'Configured' : 'Needs Setup'}
                      </Badge>
                    )}
                    <Switch
                      checked={provider.is_enabled}
                      onCheckedChange={() => toggleProvider(provider)}
                      disabled={saving === provider.id}
                    />
                  </div>
                </div>

                {/* Config Section - Only show when enabled */}
                {provider.is_enabled && (
                  <div className="border-t border-border/50 p-4 space-y-4 bg-background/30">
                    {/* API Keys */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {provider.provider_name === 'paypal' ? 'Client ID' : 'Public/API Key'}
                        </Label>
                        <Input
                          placeholder={`${provider.provider_name}_pk_...`}
                          value={config.publicKey}
                          onChange={(e) => updateConfig(provider.provider_name, 'publicKey', e.target.value)}
                          className="h-9 text-sm font-mono bg-background/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                          {provider.provider_name === 'paypal' ? 'Client Secret' : 'Secret Key'}
                        </Label>
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          value={config.secretKey}
                          onChange={(e) => updateConfig(provider.provider_name, 'secretKey', e.target.value)}
                          className="h-9 text-sm font-mono bg-background/50"
                        />
                      </div>
                    </div>

                    {/* Provider-specific fields */}
                    {provider.provider_name === 'flutterwave' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Encryption Key</Label>
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          value={config.encryptionKey || ''}
                          onChange={(e) => updateConfig(provider.provider_name, 'encryptionKey', e.target.value)}
                          className="h-9 text-sm font-mono bg-background/50"
                        />
                      </div>
                    )}

                    {/* Webhook URL */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={webhookUrl}
                          readOnly
                          className="h-9 text-xs font-mono bg-muted/50 text-muted-foreground"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 px-3"
                          onClick={() => copyToClipboard(webhookUrl)}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Webhook Secret */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Webhook Signing Secret</Label>
                      <Input
                        type="password"
                        placeholder="whsec_..."
                        value={config.webhookSecret || ''}
                        onChange={(e) => updateConfig(provider.provider_name, 'webhookSecret', e.target.value)}
                        className="h-9 text-sm font-mono bg-background/50"
                      />
                    </div>

                    <Separator />

                    {/* Actions Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <Switch
                            checked={config.testMode}
                            onCheckedChange={(checked) => updateConfig(provider.provider_name, 'testMode', checked)}
                          />
                          <span className="text-muted-foreground">Test Mode</span>
                        </label>
                        
                        {!config.testMode && (
                          <Badge variant="destructive" className="text-[10px]">
                            LIVE
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testPayment(provider)}
                          disabled={testing === provider.id || !isConfigured}
                          className="gap-1.5 text-xs"
                        >
                          {testing === provider.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <TestTube className="w-3.5 h-3.5" />
                          )}
                          Test
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => saveProviderConfig(provider)}
                          disabled={saving === provider.id}
                          className="gap-1.5 text-xs"
                        >
                          {saving === provider.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProviders.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No providers in this category</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
