import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Server, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Globe, 
  DollarSign,
  Percent,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface PlatformProvider {
  id: string;
  name: string;
  api_endpoint: string;
  api_key: string;
  is_active: boolean;
  commission_percentage: number;
  balance: number;
  last_sync_at: string | null;
  sync_status: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
}

const PlatformProviderManagement = () => {
  const [providers, setProviders] = useState<PlatformProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<PlatformProvider | null>(null);
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [showApiKeys, setShowApiKeys] = useState<Set<string>>(new Set());
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    api_endpoint: "",
    api_key: "",
    commission_percentage: 5,
    description: "",
    is_active: true,
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching platform providers:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load providers" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.api_endpoint || !formData.api_key) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all required fields" });
      return;
    }

    try {
      if (editingProvider) {
        const { error } = await supabase
          .from('platform_providers')
          .update({
            name: formData.name,
            api_endpoint: formData.api_endpoint,
            api_key: formData.api_key,
            commission_percentage: formData.commission_percentage,
            description: formData.description || null,
            is_active: formData.is_active,
          })
          .eq('id', editingProvider.id);

        if (error) throw error;
        toast({ title: "Provider updated successfully" });
      } else {
        const { error } = await supabase
          .from('platform_providers')
          .insert({
            name: formData.name,
            api_endpoint: formData.api_endpoint,
            api_key: formData.api_key,
            commission_percentage: formData.commission_percentage,
            description: formData.description || null,
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast({ title: "Provider added successfully" });
      }

      resetForm();
      fetchProviders();
    } catch (error: any) {
      console.error('Error saving provider:', error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save provider" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    try {
      const { error } = await supabase
        .from('platform_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Provider deleted" });
      fetchProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete provider" });
    }
  };

  const handleSync = async (provider: PlatformProvider) => {
    setSyncing(prev => new Set(prev).add(provider.id));

    try {
      const { data, error } = await supabase.functions.invoke('provider-balance', {
        body: { api_endpoint: provider.api_endpoint, api_key: provider.api_key }
      });

      if (error) throw error;

      await supabase
        .from('platform_providers')
        .update({
          balance: data?.balance || 0,
          last_sync_at: new Date().toISOString(),
          sync_status: 'synced',
        })
        .eq('id', provider.id);

      toast({ title: "Provider synced", description: `Balance: $${data?.balance?.toFixed(2) || 0}` });
      fetchProviders();
    } catch (error) {
      console.error('Sync error:', error);
      await supabase
        .from('platform_providers')
        .update({ sync_status: 'error' })
        .eq('id', provider.id);
      toast({ variant: "destructive", title: "Sync failed" });
      fetchProviders();
    } finally {
      setSyncing(prev => {
        const newSet = new Set(prev);
        newSet.delete(provider.id);
        return newSet;
      });
    }
  };

  const toggleActive = async (provider: PlatformProvider) => {
    try {
      const { error } = await supabase
        .from('platform_providers')
        .update({ is_active: !provider.is_active })
        .eq('id', provider.id);

      if (error) throw error;
      toast({ title: `Provider ${!provider.is_active ? 'enabled' : 'disabled'}` });
      fetchProviders();
    } catch (error) {
      console.error('Error toggling provider:', error);
    }
  };

  const resetForm = () => {
    setShowDialog(false);
    setEditingProvider(null);
    setFormData({
      name: "",
      api_endpoint: "",
      api_key: "",
      commission_percentage: 5,
      description: "",
      is_active: true,
    });
  };

  const openEditDialog = (provider: PlatformProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      api_endpoint: provider.api_endpoint,
      api_key: provider.api_key,
      commission_percentage: provider.commission_percentage,
      description: provider.description || "",
      is_active: provider.is_active,
    });
    setShowDialog(true);
  };

  const toggleShowApiKey = (id: string) => {
    setShowApiKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const stats = {
    total: providers.length,
    active: providers.filter(p => p.is_active).length,
    totalBalance: providers.reduce((sum, p) => sum + (p.balance || 0), 0),
    avgCommission: providers.length > 0 
      ? providers.reduce((sum, p) => sum + (p.commission_percentage || 0), 0) / providers.length 
      : 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Helmet>
        <title>Platform Providers - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Platform Providers</h1>
          <p className="text-muted-foreground">Manage API providers for all panels (worldofsmm, famsup, etc.)</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Provider
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Providers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <DollarSign className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">${stats.totalBalance.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Balance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Percent className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgCommission.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Avg Commission</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Providers List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Server className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Platform Providers</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add providers like worldofsmm, famsup to offer services to panel owners
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add First Provider
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {providers.map((provider) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold">{provider.name}</h3>
                        <Badge variant={provider.is_active ? "default" : "secondary"}>
                          {provider.is_active ? "Active" : "Disabled"}
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Percent className="w-3 h-3" />
                          {provider.commission_percentage}% commission
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span className="truncate">{provider.api_endpoint}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">API Key:</span>
                        <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">
                          {showApiKeys.has(provider.id) 
                            ? provider.api_key 
                            : `${'•'.repeat(20)}${provider.api_key.slice(-4)}`}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleShowApiKey(provider.id)}
                        >
                          {showApiKeys.has(provider.id) ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                      {provider.description && (
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium">${(provider.balance || 0).toFixed(2)}</span>
                        </span>
                        {provider.last_sync_at && (
                          <span className="text-muted-foreground">
                            Last sync: {new Date(provider.last_sync_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Switch
                        checked={provider.is_active}
                        onCheckedChange={() => toggleActive(provider)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(provider)}
                        disabled={syncing.has(provider.id)}
                      >
                        {syncing.has(provider.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        <span className="ml-2">Sync</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(provider)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(provider.id)}
                        className="text-destructive hover:text-destructive"
                      >
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

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={resetForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProvider ? "Edit Provider" : "Add Platform Provider"}</DialogTitle>
            <DialogDescription>
              {editingProvider 
                ? "Update the provider configuration"
                : "Add a new SMM API provider for panel owners to use"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Provider Name *</Label>
              <Input
                placeholder="e.g., WorldOfSMM, Famsup"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>API Endpoint *</Label>
              <Input
                placeholder="https://api.provider.com/v1"
                value={formData.api_endpoint}
                onChange={(e) => setFormData(prev => ({ ...prev, api_endpoint: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>API Key *</Label>
              <Input
                type="password"
                placeholder="Your API key"
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Commission Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.commission_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission_percentage: Number(e.target.value) }))}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (Your earning on each order)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingProvider ? "Update" : "Add Provider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PlatformProviderManagement;
