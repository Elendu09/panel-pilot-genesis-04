import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePanel } from "@/hooks/usePanel";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Settings, 
  Globe, 
  AlertCircle, 
  CheckCircle, 
  DollarSign, 
  Activity,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Download,
  Zap,
  Server,
  Clock,
  ExternalLink,
  XCircle,
  Package,
  Loader2,
  AlertTriangle,
  Home,
  Crown,
  Sparkles,
  Key,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportProgressStepper, ImportStep } from "@/components/panel/ImportProgressStepper";
import { ProviderLimitBanner } from "@/components/providers/ProviderLimitBanner";
import { DirectProviderCard } from "@/components/providers/DirectProviderCard";
import { ProviderListItem } from "@/components/providers/ProviderListItem";
import { SponsoredProviderSlider } from "@/components/providers/SponsoredProviderSlider";
import { trackAdImpression, trackAdClick } from "@/lib/ad-tracking";

interface Provider {
  id: string;
  name: string;
  api_endpoint: string;
  api_key: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  currency?: string;
  currency_rate_to_usd?: number;
  is_direct?: boolean;
  source_panel_id?: string;
}

interface DirectPanel {
  id: string;
  name: string;
  subdomain: string | null;
  custom_domain: string | null;
  logo_url: string | null;
  service_count?: number;
  ad_type?: 'sponsored' | 'top' | 'best' | 'featured' | null;
  is_connected?: boolean;
}

// Common currencies for SMM providers
const CURRENCY_OPTIONS = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
];

interface BalanceState {
  balance: number | null;
  originalBalance: number | null;
  currency: string;
  rateToUsd: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const getCurrencySymbol = (code: string): string => {
  const currency = CURRENCY_OPTIONS.find(c => c.code === code);
  return currency?.symbol || code;
};

const popularProviders = [
  { name: "SMMRush", endpoint: "https://smmrush.com/api/v2", category: "General", rating: 4.8 },
  { name: "JustAnotherPanel", endpoint: "https://justanotherpanel.com/api/v2", category: "General", rating: 4.7 },
  { name: "SMM Heaven", endpoint: "https://smmheaven.com/api/v2", category: "Instagram", rating: 4.6 },
  { name: "Peakerr", endpoint: "https://peakerr.com/api/v2", category: "General", rating: 4.5 },
  { name: "SMM World", endpoint: "https://smmworld.com/api/v2", category: "TikTok", rating: 4.4 },
  { name: "Follower Packages", endpoint: "https://followerpackages.com/api/v2", category: "YouTube", rating: 4.3 },
];

const LOW_BALANCE_THRESHOLD = 50;

const planLimits: Record<string, number> = {
  free: 1,
  basic: 5,
  pro: Infinity
};

const ProviderManagement = () => {
  const { profile } = useAuth();
  const { panel, refreshPanel } = usePanel();
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [importingServices, setImportingServices] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStep, setImportStep] = useState<ImportStep>("connecting");
  const [importedCount, setImportedCount] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [markupPercent, setMarkupPercent] = useState(25);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    api_endpoint: "",
    api_key: "",
    currency: "USD",
    currency_rate_to_usd: "1.0"
  });
  
  const [balances, setBalances] = useState<Record<string, BalanceState>>({});
  const [refreshingAll, setRefreshingAll] = useState(false);
  
  // Subscription & limits
  const [subscription, setSubscription] = useState<{ plan_type: string } | null>(null);
  const [directProviders, setDirectProviders] = useState<DirectPanel[]>([]);
  const [loadingDirect, setLoadingDirect] = useState(true);
  const [enablingProvider, setEnablingProvider] = useState<string | null>(null);
  
  // Manual connect dialog state
  const [manualConnectOpen, setManualConnectOpen] = useState(false);
  const [manualConnectPanel, setManualConnectPanel] = useState<DirectPanel | null>(null);
  const [manualApiKey, setManualApiKey] = useState('');
  const [manualConnecting, setManualConnecting] = useState(false);

  useEffect(() => {
    if (panel?.id) {
      fetchProviders();
      fetchSubscription();
      fetchDirectProviders();
    }
  }, [panel?.id]);

  useEffect(() => {
    if (providers.length > 0) {
      providers.forEach(provider => {
        if (provider.is_active && !balances[provider.id]?.loading) {
          fetchProviderBalance(provider);
        }
      });
    }
  }, [providers]);

  const fetchSubscription = async () => {
    if (!panel?.id) return;
    const { data } = await supabase
      .from('panel_subscriptions')
      .select('plan_type')
      .eq('panel_id', panel.id)
      .eq('status', 'active')
      .single();
    setSubscription(data);
  };

  const fetchDirectProviders = async () => {
    if (!panel?.id) return;
    setLoadingDirect(true);
    
    try {
      // Get all active panels except own panel
      const { data: panels } = await supabase
        .from('panels')
        .select('id, name, subdomain, custom_domain, logo_url')
        .eq('status', 'active')
        .neq('id', panel.id)
        .not('subdomain', 'is', null);

      // Get active ads for these panels, sorted by total_spent for priority ranking
      const { data: ads } = await supabase
        .from('provider_ads')
        .select('panel_id, ad_type, total_spent')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('total_spent', { ascending: false });

      // Get existing connections
      const { data: connections } = await supabase
        .from('direct_provider_connections')
        .select('target_panel_id')
        .eq('source_panel_id', panel.id)
        .eq('is_active', true);

      const connectedIds = new Set(connections?.map(c => c.target_panel_id) || []);
      // Build ad map keeping highest-spending ad type per panel (ads already sorted by total_spent DESC)
      const adMap = new Map<string, string>();
      for (const a of (ads || [])) {
        if (a.panel_id && !adMap.has(a.panel_id)) {
          adMap.set(a.panel_id, a.ad_type);
        }
      }

      // Fetch service counts for each panel
      const panelIds = panels?.map(p => p.id) || [];
      let serviceCounts: Record<string, number> = {};
      
      if (panelIds.length > 0) {
        const { data: services } = await supabase
          .from('services')
          .select('panel_id')
          .in('panel_id', panelIds)
          .eq('is_active', true);
        
        serviceCounts = (services || []).reduce((acc, s) => {
          acc[s.panel_id] = (acc[s.panel_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      }

      const directPanels: DirectPanel[] = (panels || []).map(p => ({
        ...p,
        ad_type: adMap.get(p.id) as any || null,
        is_connected: connectedIds.has(p.id),
        service_count: serviceCounts[p.id] || 0
      }));

      // Sort: sponsored first, then top, then best, then others
      const adPriority: Record<string, number> = { sponsored: 0, top: 1, best: 2, featured: 3 };
      directPanels.sort((a, b) => {
        const aPriority = a.ad_type ? adPriority[a.ad_type] ?? 99 : 99;
        const bPriority = b.ad_type ? adPriority[b.ad_type] ?? 99 : 99;
        return aPriority - bPriority;
      });

      setDirectProviders(directPanels);

      // Track impressions for displayed ad providers (debounced via ad-tracking)
      directPanels.forEach(p => {
        if (p.ad_type) {
          trackAdImpression(p.id, p.ad_type);
        }
      });
    } catch (error) {
      console.error('Error fetching direct providers:', error);
    } finally {
      setLoadingDirect(false);
    }
  };

  const fetchProviders = async () => {
    if (!panel?.id) return;
    
    try {
      const { data: providersData } = await supabase
        .from('providers')
        .select('*')
        .eq('panel_id', panel.id)
        .order('created_at', { ascending: false });

      setProviders(providersData || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderBalance = useCallback(async (provider: Provider) => {
    setBalances(prev => ({
      ...prev,
      [provider.id]: { ...prev[provider.id], loading: true, error: null }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('provider-balance', {
        body: { providerId: provider.id }
      });

      if (error) throw new Error(error.message);

      if (data.success) {
        setBalances(prev => ({
          ...prev,
          [provider.id]: {
            balance: data.balance,
            originalBalance: data.originalBalance,
            currency: data.currency || 'USD',
            rateToUsd: data.rateToUsd || 1.0,
            loading: false,
            error: null,
            lastUpdated: new Date()
          }
        }));
      } else {
        setBalances(prev => ({
          ...prev,
          [provider.id]: {
            balance: null, originalBalance: null, currency: 'USD', rateToUsd: 1.0, loading: false,
            error: data.error || 'Failed to fetch balance', lastUpdated: null
          }
        }));
      }
    } catch (error: any) {
      setBalances(prev => ({
        ...prev,
        [provider.id]: {
          balance: null, originalBalance: null, currency: 'USD', rateToUsd: 1.0, loading: false,
          error: error.message || 'Connection failed', lastUpdated: null
        }
      }));
    }
  }, []);

  const refreshAllBalances = async () => {
    setRefreshingAll(true);
    for (const provider of providers.filter(p => p.is_active)) {
      await fetchProviderBalance(provider);
    }
    setRefreshingAll(false);
    toast({ title: "All balances refreshed" });
  };

  // Check if can add more providers
  const plan = subscription?.plan_type || 'free';
  const maxProviders = planLimits[plan] || 1;
  const canAddProvider = providers.length < maxProviders;

  const handleSaveProvider = async () => {
    if (!formData.name || !formData.api_endpoint || !formData.api_key || !panel?.id) {
      toast({ variant: "destructive", title: "Missing Fields" });
      return;
    }

    if (!editingProvider && !canAddProvider) {
      toast({ 
        variant: "destructive", 
        title: "Provider Limit Reached", 
        description: `Upgrade to add more providers. ${plan} plan allows ${maxProviders} provider(s).`
      });
      return;
    }

    try {
      const currencyRate = parseFloat(formData.currency_rate_to_usd) || 1.0;
      
      if (editingProvider) {
        await supabase
          .from('providers')
          .update({
            name: formData.name,
            api_endpoint: formData.api_endpoint,
            api_key: formData.api_key,
            currency: formData.currency,
            currency_rate_to_usd: currencyRate,
            currency_last_updated: new Date().toISOString()
          })
          .eq('id', editingProvider.id);
        toast({ title: "Provider Updated" });
      } else {
        const { data: newProvider } = await supabase
          .from('providers')
          .insert({
            panel_id: panel.id,
            name: formData.name,
            api_endpoint: formData.api_endpoint,
            api_key: formData.api_key,
            currency: formData.currency,
            currency_rate_to_usd: currencyRate
          })
          .select()
          .single();
        toast({ title: "Provider Added" });
        if (newProvider) setTimeout(() => fetchProviderBalance(newProvider), 500);
      }

      setDialogOpen(false);
      setEditingProvider(null);
      setFormData({ name: "", api_endpoint: "", api_key: "", currency: "USD", currency_rate_to_usd: "1.0" });
      fetchProviders();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save provider" });
    }
  };

  const handleEnableDirectProvider = async (directPanel: DirectPanel) => {
    if (!panel?.id) return;

    // Track click for ad-bearing providers
    if (directPanel.ad_type) {
      trackAdClick(directPanel.id, directPanel.ad_type);
    }
    if (!canAddProvider) {
      toast({ 
        variant: "destructive", 
        title: "Provider Limit Reached", 
        description: `Upgrade to add more providers. ${plan} plan allows ${maxProviders} provider(s).`
      });
      return;
    }

    setEnablingProvider(directPanel.id);

    try {
      const { data, error } = await supabase.functions.invoke('enable-direct-provider', {
        body: {
          sourcePanelId: panel.id,
          targetPanelId: directPanel.id
        }
      });

      if (error) throw new Error(error.message);
      if (!data.success) throw new Error(data.error);

      toast({ 
        title: "Provider Enabled!", 
        description: `Connected to ${directPanel.name}. API key generated automatically.`
      });

      fetchProviders();
      fetchDirectProviders();
      refreshPanel();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Enable", description: error.message });
    } finally {
    setEnablingProvider(null);
    }
  };

  const openManualConnect = (directPanel: DirectPanel) => {
    setManualConnectPanel(directPanel);
    setManualApiKey('');
    setManualConnectOpen(true);
  };

  const handleManualConnect = async () => {
    if (!manualConnectPanel || !manualApiKey || !panel?.id) return;

    if (!canAddProvider) {
      toast({ 
        variant: "destructive", 
        title: "Provider Limit Reached", 
        description: `Upgrade to add more providers.`
      });
      return;
    }

    setManualConnecting(true);

    try {
      const platformDomain = 'smmpilot.online';
      const apiEndpoint = manualConnectPanel.custom_domain
        ? `https://${manualConnectPanel.custom_domain}/api/v2`
        : `https://${manualConnectPanel.subdomain}.${platformDomain}/api/v2`;

      const { error } = await supabase.from('providers').insert({
        panel_id: panel.id,
        name: manualConnectPanel.name,
        api_endpoint: apiEndpoint,
        api_key: manualApiKey,
        is_active: true,
        is_direct: true,
        source_panel_id: manualConnectPanel.id,
      });

      if (error) throw error;

      toast({ 
        title: "Provider Connected!", 
        description: `Manually connected to ${manualConnectPanel.name}.`
      });

      fetchProviders();
      fetchDirectProviders();
      setManualConnectOpen(false);
      setManualApiKey('');
      setManualConnectPanel(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed to Connect", description: error.message });
    } finally {
      setManualConnecting(false);
    }
  };

  const toggleProviderStatus = async (provider: Provider) => {
    try {
      await supabase
        .from('providers')
        .update({ is_active: !provider.is_active })
        .eq('id', provider.id);
      fetchProviders();
      toast({ title: `Provider ${!provider.is_active ? 'activated' : 'deactivated'}` });
      if (!provider.is_active) {
        setTimeout(() => fetchProviderBalance({ ...provider, is_active: true }), 500);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const deleteProvider = async (providerId: string) => {
    try {
      await supabase.from('providers').delete().eq('id', providerId);
      setBalances(prev => {
        const newBalances = { ...prev };
        delete newBalances[providerId];
        return newBalances;
      });
      fetchProviders();
      toast({ title: "Provider Deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const testConnection = async (provider: Provider) => {
    setTestingConnection(provider.id);
    await fetchProviderBalance(provider);
    setTestingConnection(null);
    
    const balanceState = balances[provider.id];
    if (balanceState?.error) {
      toast({ variant: "destructive", title: "Connection Failed", description: balanceState.error });
    } else {
      toast({ title: "Connection Successful", description: `${provider.name} is responding correctly` });
    }
  };

  const handleImportServices = async () => {
    if (!selectedProvider || !panel?.id) return;
    
    setImportingServices(true);
    setImportProgress(5);
    setImportStep("connecting");
    setImportResult(null);
    setImportError(null);
    setImportedCount(0);
    
    try {
      setImportProgress(15);
      await new Promise(r => setTimeout(r, 500));
      
      setImportStep("fetching");
      setImportProgress(30);
      
      const { data, error } = await supabase.functions.invoke('sync-provider-services', {
        body: {
          panelId: panel.id,
          providerId: selectedProvider.id,
          markupPercent: markupPercent,
          importNew: true
        }
      });

      if (error) throw new Error(error.message);

      setImportStep("processing");
      setImportProgress(70);
      
      const summary = data.summary || { totalNew: 0, totalUpdated: 0 };
      setImportedCount(summary.totalNew + summary.totalUpdated);
      
      await new Promise(r => setTimeout(r, 500));
      
      setImportStep("complete");
      setImportProgress(100);
      setImportResult(data);
      
      toast({ 
        title: "Services Imported", 
        description: `${summary.totalNew} new services added, ${summary.totalUpdated} updated` 
      });

      setTimeout(() => {
        setImportDialogOpen(false);
        setImportProgress(0);
        setImportStep("connecting");
        setImportResult(null);
        setImportedCount(0);
      }, 2500);

    } catch (error: any) {
      console.error('Import error:', error);
      setImportStep("error");
      setImportError(error.message || "Import failed");
      toast({ variant: "destructive", title: "Import Failed", description: error.message });
    } finally {
      setImportingServices(false);
    }
  };

  const openImportDialog = (provider: Provider) => {
    setSelectedProvider(provider);
    setImportProgress(0);
    setImportResult(null);
    setImportDialogOpen(true);
  };

  const openEditDialog = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      api_endpoint: provider.api_endpoint,
      api_key: provider.api_key,
      currency: provider.currency || "USD",
      currency_rate_to_usd: (provider.currency_rate_to_usd || 1.0).toString()
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    if (!canAddProvider) {
      toast({ 
        variant: "destructive", 
        title: "Provider Limit Reached", 
        description: `Upgrade your plan to add more providers.`
      });
      return;
    }
    setEditingProvider(null);
    setFormData({ name: "", api_endpoint: "", api_key: "", currency: "USD", currency_rate_to_usd: "1.0" });
    setDialogOpen(true);
  };

  const openAddFromMarketplace = (providerInfo: typeof popularProviders[0]) => {
    if (!canAddProvider) {
      toast({ 
        variant: "destructive", 
        title: "Provider Limit Reached", 
        description: `Upgrade your plan to add more providers.`
      });
      return;
    }
    setFormData({
      name: providerInfo.name,
      api_endpoint: providerInfo.endpoint,
      api_key: "",
      currency: "USD",
      currency_rate_to_usd: "1.0"
    });
    setEditingProvider(null);
    setDialogOpen(true);
  };

  const totalBalance = Object.values(balances).reduce((sum, b) => sum + (b.balance || 0), 0);
  const activeProviders = providers.filter(p => p.is_active).length;
  const filteredMarketplace = popularProviders.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDirect = directProviders.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Provider Management
          </h1>
          <p className="text-muted-foreground">Connect SMM providers and import services</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshAllBalances} disabled={refreshingAll} className="gap-2">
            <RefreshCw className={cn("w-4 h-4", refreshingAll && "animate-spin")} />
            Refresh All
          </Button>
          <Button 
            onClick={openAddDialog} 
            disabled={!canAddProvider}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Add Provider
          </Button>
        </div>
      </motion.div>

      {/* Provider Limit Banner */}
      <ProviderLimitBanner
        currentCount={providers.length}
        maxAllowed={maxProviders}
        plan={plan}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Providers", value: providers.length, icon: Server, color: "text-primary" },
          { label: "Active Providers", value: activeProviders, icon: Activity, color: "text-green-500" },
          { label: "Total Balance", value: `$${totalBalance.toFixed(2)}`, icon: DollarSign, color: "text-blue-500" },
          { label: "Low Balance", value: Object.values(balances).filter(b => b.balance !== null && b.balance < LOW_BALANCE_THRESHOLD).length, icon: AlertTriangle, color: "text-amber-500" },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="glass-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted">
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="providers" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Server className="w-4 h-4 mr-2" /> My Providers
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Globe className="w-4 h-4 mr-2" /> Marketplace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            </div>
          ) : providers.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No providers configured</h3>
                <p className="text-muted-foreground mb-4">Add your first provider to start offering services</p>
                <Button onClick={openAddDialog} className="gap-2">
                  <Plus className="w-4 h-4" /> Add Provider
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {providers.map((provider, index) => {
                const balanceState = balances[provider.id] || { balance: null, originalBalance: null, loading: false, error: null, lastUpdated: null, currency: 'USD', rateToUsd: 1.0 };
                const isLowBalance = balanceState.balance !== null && balanceState.balance < LOW_BALANCE_THRESHOLD;
                
                return (
                  <motion.div key={provider.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className={cn("glass-card-hover transition-all", !provider.is_active && "opacity-60", isLowBalance && "border-amber-500/50")}>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn("p-2.5 md:p-3 rounded-xl shrink-0", provider.is_active ? "bg-primary/10" : "bg-muted")}>
                              {provider.is_direct ? (
                                <Home className={cn("w-5 h-5 md:w-6 md:h-6", provider.is_active ? "text-primary" : "text-muted-foreground")} />
                              ) : (
                                <Server className={cn("w-5 h-5 md:w-6 md:h-6", provider.is_active ? "text-primary" : "text-muted-foreground")} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold truncate">{provider.name}</h3>
                                <Badge variant={provider.is_active ? "default" : "secondary"} className="shrink-0">
                                  {provider.is_active ? "Active" : "Inactive"}
                                </Badge>
                                {provider.is_direct && (
                                  <Badge variant="outline" className="shrink-0 text-primary border-primary/50">
                                    <Home className="w-3 h-3 mr-1" /> Direct
                                  </Badge>
                                )}
                                {provider.currency && provider.currency !== 'USD' && (
                                  <Badge variant="outline" className="shrink-0 text-blue-500 border-blue-500/50">
                                    {provider.currency}
                                  </Badge>
                                )}
                                {isLowBalance && (
                                  <Badge variant="outline" className="text-amber-500 border-amber-500/50 shrink-0">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> Low
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{provider.api_endpoint}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-3 md:gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                            <div className="text-left md:text-right min-w-[80px]">
                              {balanceState.loading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                              ) : balanceState.error ? (
                                <div className="flex items-center gap-1 text-destructive">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-xs">Error</span>
                                </div>
                              ) : (
                                <>
                                  <p className={cn("text-lg md:text-xl font-bold", isLowBalance ? "text-amber-500" : "text-green-500")}>
                                    ${balanceState.balance?.toFixed(2) || '0.00'}
                                  </p>
                                  {balanceState.currency && balanceState.currency !== 'USD' && balanceState.originalBalance !== null && (
                                    <p className="text-xs text-muted-foreground">
                                      {getCurrencySymbol(balanceState.currency)}{balanceState.originalBalance?.toFixed(2)} {balanceState.currency}
                                    </p>
                                  )}
                                  {(!balanceState.currency || balanceState.currency === 'USD') && (
                                    <p className="text-xs text-muted-foreground">Balance</p>
                                  )}
                                </>
                              )}
                            </div>

                            <Switch checked={provider.is_active} onCheckedChange={() => toggleProviderStatus(provider)} />
                            
                            <div className="flex gap-1 overflow-x-auto">
                              <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8 md:h-9 md:w-9" onClick={() => fetchProviderBalance(provider)} disabled={balanceState.loading}>
                                <RefreshCw className={cn("w-4 h-4", balanceState.loading && "animate-spin")} />
                              </Button>
                              <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8 md:h-9 md:w-9" onClick={() => testConnection(provider)} disabled={testingConnection === provider.id}>
                                {testingConnection === provider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                              </Button>
                              <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8 md:h-9 md:w-9" onClick={() => openEditDialog(provider)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8 md:h-9 md:w-9 text-destructive" onClick={() => deleteProvider(provider.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search all providers..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sponsored Providers Slider */}
          {filteredDirect.filter(p => p.ad_type === 'sponsored').length > 0 && (
            <SponsoredProviderSlider
              providers={filteredDirect.filter(p => p.ad_type === 'sponsored')}
              onEnable={handleEnableDirectProvider}
              enablingId={enablingProvider}
            />
          )}

          {/* Top Providers Section - Gold bordered grid */}
          {filteredDirect.filter(p => p.ad_type === 'top').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/10">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg">Top Providers</h3>
                <Badge variant="outline" className="border-amber-500/30 text-amber-500">{filteredDirect.filter(p => p.ad_type === 'top').length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDirect.filter(p => p.ad_type === 'top').map((provider) => (
                  <DirectProviderCard
                    key={provider.id}
                    provider={provider}
                    onEnable={handleEnableDirectProvider}
                    isEnabled={provider.is_connected}
                    isLoading={enablingProvider === provider.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Best Providers Section */}
          {filteredDirect.filter(p => p.ad_type === 'best').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg">Best Providers</h3>
                <Badge variant="outline" className="border-blue-500/30 text-blue-500">{filteredDirect.filter(p => p.ad_type === 'best').length}</Badge>
              </div>
              <div className="space-y-2">
                {filteredDirect.filter(p => p.ad_type === 'best').map((provider, index) => (
                  <ProviderListItem
                    key={provider.id}
                    id={provider.id}
                    name={provider.name}
                    domain={provider.custom_domain || `${provider.subdomain}.smmpilot.online`}
                    logoUrl={provider.logo_url}
                    serviceCount={provider.service_count}
                    adType={provider.ad_type}
                    isConnected={provider.is_connected}
                    onAction={() => handleEnableDirectProvider(provider)}
                    onManualConnect={() => openManualConnect(provider)}
                    isLoading={enablingProvider === provider.id}
                    actionLabel="Enable"
                    rank={index + 1}
                    showRank={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Featured Providers Section */}
          {filteredDirect.filter(p => p.ad_type === 'featured').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/10">
                  <Crown className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold text-lg">Featured Providers</h3>
                <Badge variant="outline" className="border-purple-500/30 text-purple-500">{filteredDirect.filter(p => p.ad_type === 'featured').length}</Badge>
              </div>
              <div className="space-y-2">
                {filteredDirect.filter(p => p.ad_type === 'featured').map((provider, index) => (
                  <ProviderListItem
                    key={provider.id}
                    id={provider.id}
                    name={provider.name}
                    domain={provider.custom_domain || `${provider.subdomain}.smmpilot.online`}
                    logoUrl={provider.logo_url}
                    serviceCount={provider.service_count}
                    adType={provider.ad_type}
                    isConnected={provider.is_connected}
                    onAction={() => handleEnableDirectProvider(provider)}
                    onManualConnect={() => openManualConnect(provider)}
                    isLoading={enablingProvider === provider.id}
                    actionLabel="Enable"
                    rank={index + 1}
                    showRank={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All HomeOfSMM Providers (Kanban List Style) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">HomeOfSMM Panels</h3>
              <Badge variant="outline">{filteredDirect.filter(p => !p.ad_type).length}</Badge>
            </div>
            {loadingDirect ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : filteredDirect.filter(p => !p.ad_type).length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No HomeOfSMM panels available yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredDirect.filter(p => !p.ad_type).map((provider, index) => (
                  <ProviderListItem
                    key={provider.id}
                    id={provider.id}
                    name={provider.name}
                    domain={provider.custom_domain || `${provider.subdomain}.smmpilot.online`}
                    logoUrl={provider.logo_url}
                    serviceCount={provider.service_count}
                    isConnected={provider.is_connected}
                    onAction={() => handleEnableDirectProvider(provider)}
                    onManualConnect={() => openManualConnect(provider)}
                    isLoading={enablingProvider === provider.id}
                    actionLabel="Enable"
                    rank={index + 1}
                    showRank={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Other Providers Section (External SMM Panels) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted">
                <Globe className="w-5 h-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Other Providers</h3>
              <Badge variant="outline">{filteredMarketplace.length}</Badge>
            </div>
            <div className="space-y-2">
              {filteredMarketplace.map((provider) => (
                <ProviderListItem
                  key={provider.name}
                  id={provider.name}
                  name={provider.name}
                  domain={provider.endpoint.replace('https://', '').replace('/api/v2', '')}
                  serviceCount={0}
                  rating={provider.rating}
                  category={provider.category}
                  isExternal={true}
                  onAction={() => openAddFromMarketplace(provider)}
                  isLoading={false}
                  actionLabel="Add"
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Provider Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>{editingProvider ? "Edit Provider" : "Add Provider"}</DialogTitle>
            <DialogDescription>Enter the API credentials for your SMM provider</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., SMMRush" />
            </div>
            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input value={formData.api_endpoint} onChange={(e) => setFormData({...formData, api_endpoint: e.target.value})} placeholder="https://example.com/api/v2" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" value={formData.api_key} onChange={(e) => setFormData({...formData, api_key: e.target.value})} placeholder="Your API key" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider Currency</Label>
                <Select value={formData.currency} onValueChange={(v) => setFormData({...formData, currency: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map(curr => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rate to USD</Label>
                <Input 
                  type="number" 
                  step="0.000001"
                  value={formData.currency_rate_to_usd}
                  onChange={(e) => setFormData({...formData, currency_rate_to_usd: e.target.value})}
                  placeholder="1.0"
                />
              </div>
            </div>
            {formData.currency !== 'USD' && (
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                1 {formData.currency} = ${formData.currency_rate_to_usd} USD. Provider prices will be converted to USD using this rate.
              </p>
            )}
            
            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value="currency-faq" className="border-border/50">
                <AccordionTrigger className="text-sm py-2 hover:no-underline">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-primary">?</span> How does currency conversion work?
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p><strong className="text-foreground">Provider Currency:</strong> Select the currency your provider uses.</p>
                    <p><strong className="text-foreground">Rate to USD:</strong> Enter how many USD equals 1 unit of the provider's currency.</p>
                    <p className="text-primary mt-2">💡 Tip: Update the exchange rate periodically for accurate pricing.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProvider}>{editingProvider ? "Update" : "Add"} Provider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Services Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => {
        if (!importingServices) {
          setImportDialogOpen(open);
          if (!open) {
            setImportProgress(0);
            setImportStep("connecting");
            setImportResult(null);
            setImportError(null);
          }
        }
      }}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle>Import All Services</DialogTitle>
            <DialogDescription>
              Import all services from <span className="font-semibold text-primary">{selectedProvider?.name}</span> to your panel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!importingServices && !importResult && (
              <div className="space-y-3">
                <Label>Markup Percentage</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[markupPercent]}
                    onValueChange={([value]) => setMarkupPercent(value)}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-xl font-bold text-primary w-16">{markupPercent}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Your services will be priced {markupPercent}% higher than the provider's prices</p>
                
                <Card className="bg-muted/30 border-border/50">
                  <CardContent className="p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      This will import <strong>ALL</strong> services from the provider.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {(importingServices || importResult) && (
              <ImportProgressStepper
                currentStep={importStep}
                progress={importProgress}
                servicesCount={importedCount}
                error={importError || undefined}
              />
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(false)} disabled={importingServices}>
              {importResult ? "Close" : "Cancel"}
            </Button>
            {!importResult && (
              <Button onClick={handleImportServices} disabled={importingServices} className="bg-gradient-to-r from-primary to-primary/80">
                {importingServices ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Import All Services
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Connect Dialog */}
      <Dialog open={manualConnectOpen} onOpenChange={setManualConnectOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>Connect with Existing Account</DialogTitle>
            <DialogDescription>
              Already have an account on {manualConnectPanel?.name}? Enter your API key to connect manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input 
                type="password"
                value={manualApiKey}
                onChange={(e) => setManualApiKey(e.target.value)}
                placeholder="Enter your existing API key"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You can find your API key in your account settings on {manualConnectPanel?.name}.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualConnectOpen(false)} disabled={manualConnecting}>
              Cancel
            </Button>
            <Button 
              onClick={handleManualConnect} 
              disabled={manualConnecting || !manualApiKey}
              className="gap-2"
            >
              {manualConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderManagement;
