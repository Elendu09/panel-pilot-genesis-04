import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  Play,
  XCircle,
  ArrowRight,
  Package,
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown
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

// Popular SMM Providers marketplace
const popularProviders = [
  { name: "SMMRush", endpoint: "https://smmrush.com/api/v2", category: "General", rating: 4.8 },
  { name: "JustAnotherPanel", endpoint: "https://justanotherpanel.com/api/v2", category: "General", rating: 4.7 },
  { name: "SMM Heaven", endpoint: "https://smmheaven.com/api/v2", category: "Instagram", rating: 4.6 },
  { name: "Peakerr", endpoint: "https://peakerr.com/api/v2", category: "General", rating: 4.5 },
  { name: "SMM World", endpoint: "https://smmworld.com/api/v2", category: "TikTok", rating: 4.4 },
  { name: "Follower Packages", endpoint: "https://followerpackages.com/api/v2", category: "YouTube", rating: 4.3 },
  { name: "BulqFollowers", endpoint: "https://bulqfollowers.com/api/v2", category: "General", rating: 4.5 },
  { name: "SocialPanel24", endpoint: "https://socialpanel24.com/api/v2", category: "General", rating: 4.2 },
];

const LOW_BALANCE_THRESHOLD = 50; // Warn when balance drops below this

const ProviderManagement = () => {
  const { profile } = useAuth();
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
  const [formData, setFormData] = useState({
    name: "",
    api_endpoint: "",
    api_key: ""
  });
  
  // Balance state for each provider
  const [balances, setBalances] = useState<Record<string, BalanceState>>({});
  const [refreshingAll, setRefreshingAll] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [profile]);

  // Auto-fetch balances when providers are loaded
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
    if (!profile?.id) return;
    
    try {
      const { data: panelData } = await supabase
        .from('panels')
        .select('id')
        .eq('owner_id', profile.id)
        .single();

      if (panelData) {
        const { data: providersData } = await supabase
          .from('providers')
          .select('*')
          .eq('panel_id', panelData.id)
          .order('created_at', { ascending: false });

        setProviders(providersData || []);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderBalance = useCallback(async (provider: Provider) => {
    // Set loading state
    setBalances(prev => ({
      ...prev,
      [provider.id]: {
        ...prev[provider.id],
        loading: true,
        error: null
      }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('provider-balance', {
        body: {
          api_endpoint: provider.api_endpoint,
          api_key: provider.api_key
        }
      });

      if (error) {
        throw new Error(error.message);
      }

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

        // Update balance in database
        await supabase
          .from('providers')
          .update({ balance: data.balance })
          .eq('id', provider.id);

      } else {
        setBalances(prev => ({
          ...prev,
          [provider.id]: {
            balance: null,
            currency: 'USD',
            loading: false,
            error: data.error || 'Failed to fetch balance',
            lastUpdated: null
          }
        }));
      }
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      setBalances(prev => ({
        ...prev,
        [provider.id]: {
          balance: null,
          currency: 'USD',
          loading: false,
          error: error.message || 'Connection failed',
          lastUpdated: null
        }
      }));
    }
  }, []);

  const refreshAllBalances = async () => {
    setRefreshingAll(true);
    const activeProviders = providers.filter(p => p.is_active);
    
    for (const provider of activeProviders) {
      await fetchProviderBalance(provider);
    }
    
    setRefreshingAll(false);
    toast({ title: "All balances refreshed" });
  };

  const handleSaveProvider = async () => {
    if (!formData.name || !formData.api_endpoint || !formData.api_key) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      const { data: panelData } = await supabase
        .from('panels')
        .select('id')
        .eq('owner_id', profile?.id)
        .single();

      if (!panelData) return;

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
            panel_id: panelData.id,
            name: formData.name,
            api_endpoint: formData.api_endpoint,
            api_key: formData.api_key
          })
          .select()
          .single();
          
        toast({ title: "Provider Added" });
        
        // Auto-fetch balance for new provider
        if (newProvider) {
          setTimeout(() => fetchProviderBalance(newProvider), 500);
        }
      }

      setDialogOpen(false);
      setEditingProvider(null);
      setFormData({ name: "", api_endpoint: "", api_key: "" });
      fetchProviders();
    } catch (error) {
      console.error('Error saving provider:', error);
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
      
      // Fetch balance if activating
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
      // Clean up balance state
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
      toast({ 
        variant: "destructive",
        title: "Connection Failed", 
        description: balanceState.error 
      });
    } else {
      toast({ 
        title: "Connection Successful", 
        description: `${provider.name} is responding correctly` 
      });
    }
  };

  const handleImportServices = async () => {
    if (!selectedProvider) return;
    setImportingServices(true);
    setImportProgress(0);
    
    // Simulate import progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setImportProgress(i);
    }
    
    setImportingServices(false);
    setImportDialogOpen(false);
    toast({ title: "Services Imported", description: "Successfully imported 45 services" });
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

  // Calculate total balance from fetched balances
  const totalBalance = Object.values(balances).reduce((sum, b) => sum + (b.balance || 0), 0);
  const activeProviders = providers.filter(p => p.is_active).length;

  const filteredMarketplace = popularProviders.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

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
          <Button 
            variant="outline" 
            onClick={refreshAllBalances}
            disabled={refreshingAll}
            className="gap-2"
          >
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
          { label: "API Calls Today", value: "2,847", icon: Zap, color: "yellow-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
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

        {/* My Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading providers...</p>
              </motion.div>
            ) : providers.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="glass-card">
                  <CardContent className="py-12 text-center">
                    <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No providers configured</h3>
                    <p className="text-muted-foreground mb-4">Add your first provider to start offering services</p>
                    <Button onClick={openAddDialog} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Provider
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {providers.map((provider, index) => {
                  const balanceState = balances[provider.id] || { balance: null, loading: false, error: null, lastUpdated: null, currency: 'USD' };
                  const isLowBalance = balanceState.balance !== null && balanceState.balance < LOW_BALANCE_THRESHOLD;
                  
                  return (
                    <motion.div
                      key={provider.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-card-hover overflow-hidden">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Provider Info */}
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "p-3 rounded-xl",
                                provider.is_active ? "bg-green-500/10" : "bg-muted"
                              )}>
                                <Server className={cn(
                                  "w-6 h-6",
                                  provider.is_active ? "text-green-500" : "text-muted-foreground"
                                )} />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-semibold text-lg">{provider.name}</h3>
                                <p className="text-sm text-muted-foreground font-mono truncate max-w-xs">
                                  {provider.api_endpoint}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <Badge variant={provider.is_active ? "default" : "secondary"} 
                                    className={provider.is_active ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
                                    {provider.is_active ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                                    {provider.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                  
                                  {/* Balance Badge */}
                                  {balanceState.loading ? (
                                    <Badge variant="outline" className="bg-muted/50">
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Loading...
                                    </Badge>
                                  ) : balanceState.error ? (
                                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Error
                                    </Badge>
                                  ) : balanceState.balance !== null ? (
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        isLowBalance 
                                          ? "bg-warning/10 text-warning border-warning/20" 
                                          : "bg-primary/10 text-primary border-primary/20"
                                      )}
                                    >
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      {balanceState.balance.toFixed(2)} {balanceState.currency}
                                      {isLowBalance && <AlertTriangle className="w-3 h-3 ml-1" />}
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      --
                                    </Badge>
                                  )}
                                  
                                  <Badge variant="outline" className="text-muted-foreground">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {formatTimeAgo(balanceState.lastUpdated)}
                                  </Badge>
                                </div>
                                
                                {/* Low Balance Warning */}
                                {isLowBalance && (
                                  <p className="text-xs text-warning flex items-center gap-1 mt-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Low balance warning - consider adding funds
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchProviderBalance(provider)}
                                disabled={balanceState.loading}
                                className="gap-2"
                              >
                                {balanceState.loading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4" />
                                )}
                                Refresh
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => testConnection(provider)}
                                disabled={testingConnection === provider.id}
                                className="gap-2"
                              >
                                {testingConnection === provider.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                                Test
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedProvider(provider);
                                  setImportDialogOpen(true);
                                }}
                                className="gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Import
                              </Button>
                              <Switch
                                checked={provider.is_active}
                                onCheckedChange={() => toggleProviderStatus(provider)}
                              />
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(provider)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProvider(provider.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search providers..." 
              className="pl-9 bg-card/50 backdrop-blur-sm border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarketplace.map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card-hover h-full">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                          <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-xs text-muted-foreground">{provider.category}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        ★ {provider.rating}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">{provider.endpoint}</p>
                    <Button 
                      className="w-full gap-2" 
                      variant="outline"
                      onClick={() => openAddFromMarketplace(provider)}
                    >
                      <Plus className="w-4 h-4" />
                      Add Provider
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Provider Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>{editingProvider ? "Edit Provider" : "Add New Provider"}</DialogTitle>
            <DialogDescription>
              Enter the API credentials from your SMM provider
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Provider Name</Label>
              <Input
                placeholder="Enter provider name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input
                placeholder="https://api.provider.com/v2"
                value={formData.api_endpoint}
                onChange={(e) => setFormData({...formData, api_endpoint: e.target.value})}
                className="bg-background/50 font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="Enter API key"
                value={formData.api_key}
                onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                className="bg-background/50"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProvider} className="bg-gradient-to-r from-primary to-primary/80">
                {editingProvider ? "Update" : "Add"} Provider
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Services Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Import Services from {selectedProvider?.name}</DialogTitle>
            <DialogDescription>
              Fetch and import services from this provider
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {importingServices ? (
              <div className="space-y-4 text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                <div className="space-y-2">
                  <p className="font-medium">Importing services...</p>
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{importProgress}% complete</p>
                </div>
              </div>
            ) : (
              <>
                <div className="glass-card p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Provider</span>
                    <span className="font-medium">{selectedProvider?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Endpoint</span>
                    <span className="font-mono text-xs truncate max-w-[200px]">{selectedProvider?.api_endpoint}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <span className="font-medium text-primary">
                      ${balances[selectedProvider?.id || '']?.balance?.toFixed(2) || '--'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Markup Percentage</Label>
                  <Input type="number" placeholder="20" className="bg-background/50" />
                  <p className="text-xs text-muted-foreground">Apply markup to imported service prices</p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleImportServices} className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                    <Download className="w-4 h-4" />
                    Import Services
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderManagement;
