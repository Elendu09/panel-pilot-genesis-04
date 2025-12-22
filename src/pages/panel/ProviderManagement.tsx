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
import { Slider } from "@/components/ui/slider";
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
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Provider {
  id: string;
  name: string;
  api_endpoint: string;
  api_key: string;
  balance: number;
  is_active: boolean;
  created_at: string;
}

interface BalanceState {
  balance: number | null;
  currency: string;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const popularProviders = [
  { name: "SMMRush", endpoint: "https://smmrush.com/api/v2", category: "General", rating: 4.8 },
  { name: "JustAnotherPanel", endpoint: "https://justanotherpanel.com/api/v2", category: "General", rating: 4.7 },
  { name: "SMM Heaven", endpoint: "https://smmheaven.com/api/v2", category: "Instagram", rating: 4.6 },
  { name: "Peakerr", endpoint: "https://peakerr.com/api/v2", category: "General", rating: 4.5 },
  { name: "SMM World", endpoint: "https://smmworld.com/api/v2", category: "TikTok", rating: 4.4 },
  { name: "Follower Packages", endpoint: "https://followerpackages.com/api/v2", category: "YouTube", rating: 4.3 },
];

const LOW_BALANCE_THRESHOLD = 50;

const ProviderManagement = () => {
  const { profile } = useAuth();
  const { panel } = usePanel();
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [importingServices, setImportingServices] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [markupPercent, setMarkupPercent] = useState(25);
  const [importResult, setImportResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    api_endpoint: "",
    api_key: ""
  });
  
  const [balances, setBalances] = useState<Record<string, BalanceState>>({});
  const [refreshingAll, setRefreshingAll] = useState(false);

  useEffect(() => {
    if (panel?.id) {
      fetchProviders();
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
        body: { api_endpoint: provider.api_endpoint, api_key: provider.api_key }
      });

      if (error) throw new Error(error.message);

      if (data.success) {
        setBalances(prev => ({
          ...prev,
          [provider.id]: {
            balance: data.balance,
            currency: data.currency || 'USD',
            loading: false,
            error: null,
            lastUpdated: new Date()
          }
        }));

        await supabase
          .from('providers')
          .update({ balance: data.balance })
          .eq('id', provider.id);
      } else {
        setBalances(prev => ({
          ...prev,
          [provider.id]: {
            balance: null, currency: 'USD', loading: false,
            error: data.error || 'Failed to fetch balance', lastUpdated: null
          }
        }));
      }
    } catch (error: any) {
      setBalances(prev => ({
        ...prev,
        [provider.id]: {
          balance: null, currency: 'USD', loading: false,
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

  const handleSaveProvider = async () => {
    if (!formData.name || !formData.api_endpoint || !formData.api_key || !panel?.id) {
      toast({ variant: "destructive", title: "Missing Fields" });
      return;
    }

    try {
      if (editingProvider) {
        await supabase
          .from('providers')
          .update({
            name: formData.name,
            api_endpoint: formData.api_endpoint,
            api_key: formData.api_key
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
            api_key: formData.api_key
          })
          .select()
          .single();
        toast({ title: "Provider Added" });
        if (newProvider) setTimeout(() => fetchProviderBalance(newProvider), 500);
      }

      setDialogOpen(false);
      setEditingProvider(null);
      setFormData({ name: "", api_endpoint: "", api_key: "" });
      fetchProviders();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save provider" });
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

  // Real service import
  const handleImportServices = async () => {
    if (!selectedProvider || !panel?.id) return;
    
    setImportingServices(true);
    setImportProgress(10);
    setImportResult(null);
    
    try {
      setImportProgress(30);
      
      const { data, error } = await supabase.functions.invoke('sync-provider-services', {
        body: {
          panelId: panel.id,
          providerId: selectedProvider.id,
          markupPercent: markupPercent,
          importNew: true
        }
      });

      setImportProgress(90);

      if (error) throw new Error(error.message);

      setImportProgress(100);
      setImportResult(data);
      
      const summary = data.summary || { totalNew: 0, totalUpdated: 0 };
      toast({ 
        title: "Services Imported", 
        description: `${summary.totalNew} new services added, ${summary.totalUpdated} updated` 
      });

      setTimeout(() => {
        setImportDialogOpen(false);
        setImportProgress(0);
        setImportResult(null);
      }, 2000);

    } catch (error: any) {
      console.error('Import error:', error);
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
      api_key: provider.api_key
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingProvider(null);
    setFormData({ name: "", api_endpoint: "", api_key: "" });
    setDialogOpen(true);
  };

  const openAddFromMarketplace = (providerInfo: typeof popularProviders[0]) => {
    setFormData({
      name: providerInfo.name,
      api_endpoint: providerInfo.endpoint,
      api_key: ""
    });
    setEditingProvider(null);
    setDialogOpen(true);
  };

  const totalBalance = Object.values(balances).reduce((sum, b) => sum + (b.balance || 0), 0);
  const activeProviders = providers.filter(p => p.is_active).length;
  const filteredMarketplace = popularProviders.filter(p => 
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
          <Button onClick={openAddDialog} className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Add Provider
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Providers", value: providers.length, icon: Server, color: "primary" },
          { label: "Active Providers", value: activeProviders, icon: Activity, color: "green-500" },
          { label: "Total Balance", value: `$${totalBalance.toFixed(2)}`, icon: DollarSign, color: "blue-500" },
          { label: "Low Balance", value: Object.values(balances).filter(b => b.balance !== null && b.balance < LOW_BALANCE_THRESHOLD).length, icon: AlertTriangle, color: "yellow-500" },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="glass-card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl", `bg-${stat.color}/10`)}>
                    <stat.icon className={cn("w-5 h-5", stat.color === "primary" ? "text-primary" : `text-${stat.color}`)} />
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
                const balanceState = balances[provider.id] || { balance: null, loading: false, error: null, lastUpdated: null, currency: 'USD' };
                const isLowBalance = balanceState.balance !== null && balanceState.balance < LOW_BALANCE_THRESHOLD;
                
                return (
                  <motion.div key={provider.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className={cn("glass-card-hover transition-all", !provider.is_active && "opacity-60", isLowBalance && "border-yellow-500/50")}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", provider.is_active ? "bg-primary/10" : "bg-muted")}>
                              <Server className={cn("w-6 h-6", provider.is_active ? "text-primary" : "text-muted-foreground")} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{provider.name}</h3>
                                <Badge variant={provider.is_active ? "default" : "secondary"}>
                                  {provider.is_active ? "Active" : "Inactive"}
                                </Badge>
                                {isLowBalance && (
                                  <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> Low Balance
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{provider.api_endpoint}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {/* Balance Display */}
                            <div className="text-right">
                              {balanceState.loading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                              ) : balanceState.error ? (
                                <div className="flex items-center gap-1 text-destructive">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-sm">Error</span>
                                </div>
                              ) : (
                                <>
                                  <p className={cn("text-xl font-bold", isLowBalance ? "text-yellow-500" : "text-green-500")}>
                                    ${balanceState.balance?.toFixed(2) || '0.00'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Balance</p>
                                </>
                              )}
                            </div>

                            <Switch checked={provider.is_active} onCheckedChange={() => toggleProviderStatus(provider)} />
                            
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" onClick={() => fetchProviderBalance(provider)} disabled={balanceState.loading}>
                                <RefreshCw className={cn("w-4 h-4", balanceState.loading && "animate-spin")} />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => testConnection(provider)} disabled={testingConnection === provider.id}>
                                {testingConnection === provider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => openImportDialog(provider)}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => openEditDialog(provider)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteProvider(provider.id)}>
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

        <TabsContent value="marketplace" className="space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search providers..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketplace.map((provider, index) => (
              <motion.div key={provider.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="glass-card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="outline">{provider.category}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{provider.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{provider.endpoint}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium">{provider.rating}</span>
                      </div>
                      <Button size="sm" onClick={() => openAddFromMarketplace(provider)}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveProvider}>{editingProvider ? "Update" : "Add"} Provider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Services Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Import Services</DialogTitle>
            <DialogDescription>Import services from {selectedProvider?.name} to your panel</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
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
            </div>

            {importingServices && (
              <div className="space-y-2">
                <Progress value={importProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {importProgress < 30 ? "Connecting to provider..." : 
                   importProgress < 90 ? "Importing services..." : "Finishing up..."}
                </p>
              </div>
            )}

            {importResult && (
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-500 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Import Complete!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {importResult.summary?.totalNew || 0} new services added, {importResult.summary?.totalUpdated || 0} updated
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)} disabled={importingServices}>Cancel</Button>
            <Button onClick={handleImportServices} disabled={importingServices}>
              {importingServices ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Import Services
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderManagement;
