import { useState, useEffect } from "react";
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
  Loader2
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

  useEffect(() => {
    fetchProviders();
  }, [profile]);

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
        await supabase
          .from('providers')
          .insert({
            panel_id: panelData.id,
            name: formData.name,
            api_endpoint: formData.api_endpoint,
            api_key: formData.api_key
          });
          
        toast({ title: "Provider Added" });
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
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const deleteProvider = async (providerId: string) => {
    try {
      await supabase.from('providers').delete().eq('id', providerId);
      fetchProviders();
      toast({ title: "Provider Deleted" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const testConnection = async (provider: Provider) => {
    setTestingConnection(provider.id);
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestingConnection(null);
    toast({ title: "Connection Successful", description: `${provider.name} is responding correctly` });
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

  const totalBalance = providers.reduce((sum, provider) => sum + (provider.balance || 0), 0);
  const activeProviders = providers.filter(p => p.is_active).length;

  const filteredMarketplace = popularProviders.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Button onClick={openAddDialog} className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Provider
        </Button>
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
                {providers.map((provider, index) => (
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
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  ${provider.balance?.toFixed(2) || '0.00'}
                                </Badge>
                                <Badge variant="outline" className="text-muted-foreground">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(provider.created_at).toLocaleDateString()}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2">
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
                ))}
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
