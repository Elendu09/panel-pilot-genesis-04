import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  RefreshCw
} from "lucide-react";

interface Provider {
  id: string;
  name: string;
  api_endpoint: string;
  api_key: string;
  balance: number;
  is_active: boolean;
  created_at: string;
}

const ProviderManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load providers"
      });
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
          
        toast({
          title: "Provider Updated",
          description: "Provider settings have been updated successfully"
        });
      } else {
        await supabase
          .from('providers')
          .insert({
            panel_id: panelData.id,
            name: formData.name,
            api_endpoint: formData.api_endpoint,
            api_key: formData.api_key
          });
          
        toast({
          title: "Provider Added",
          description: "New provider has been added successfully"
        });
      }

      setDialogOpen(false);
      setEditingProvider(null);
      setFormData({ name: "", api_endpoint: "", api_key: "" });
      fetchProviders();
    } catch (error) {
      console.error('Error saving provider:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save provider"
      });
    }
  };

  const toggleProviderStatus = async (provider: Provider) => {
    try {
      await supabase
        .from('providers')
        .update({ is_active: !provider.is_active })
        .eq('id', provider.id);

      fetchProviders();
      toast({
        title: "Status Updated",
        description: `Provider ${!provider.is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error updating provider status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update provider status"
      });
    }
  };

  const deleteProvider = async (providerId: string) => {
    try {
      await supabase
        .from('providers')
        .delete()
        .eq('id', providerId);

      fetchProviders();
      toast({
        title: "Provider Deleted",
        description: "Provider has been removed successfully"
      });
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete provider"
      });
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Provider Management</h1>
          <p className="text-muted-foreground">Manage your SMM service providers and API integrations</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 bg-gradient-primary hover:shadow-glow">
          <Plus className="w-4 h-4" />
          Add Provider
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Providers</p>
                <p className="text-2xl font-bold text-primary">{providers.length}</p>
              </div>
              <Settings className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Providers</p>
                <p className="text-2xl font-bold text-primary">{activeProviders}</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-primary">${totalBalance.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Calls Today</p>
                <p className="text-2xl font-bold text-primary">2,847</p>
              </div>
              <Globe className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Providers Table */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Providers</CardTitle>
          <Button 
            onClick={fetchProviders} 
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading providers...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No providers configured</h3>
              <p className="text-muted-foreground mb-4">Add your first provider to start offering services</p>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Provider
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>API Endpoint</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {provider.api_endpoint}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">${provider.balance?.toFixed(2) || '0.00'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={provider.is_active}
                          onCheckedChange={() => toggleProviderStatus(provider)}
                        />
                        <Badge
                          variant={provider.is_active ? "default" : "secondary"}
                          className={provider.is_active ? "bg-green-500/20 text-green-400" : ""}
                        >
                          {provider.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(provider.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => openEditDialog(provider)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteProvider(provider.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Provider Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingProvider ? "Edit Provider" : "Add New Provider"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Provider Name</Label>
              <Input
                id="name"
                placeholder="Enter provider name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="https://api.provider.com"
                value={formData.api_endpoint}
                onChange={(e) => setFormData({...formData, api_endpoint: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter API key"
                value={formData.api_key}
                onChange={(e) => setFormData({...formData, api_key: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProvider} className="bg-gradient-primary hover:shadow-glow">
                {editingProvider ? "Update Provider" : "Add Provider"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderManagement;