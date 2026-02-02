import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Crown, 
  Trophy, 
  Star, 
  Sparkles, 
  DollarSign, 
  Eye, 
  MousePointer,
  Settings,
  Pause,
  Play,
  Trash2,
  Save,
  Loader2,
  TrendingUp,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";

interface AdPricing {
  id: string;
  ad_type: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate: number;
  max_slots: number;
  description: string | null;
  is_active: boolean;
}

interface ProviderAd {
  id: string;
  panel_id: string;
  ad_type: string;
  is_active: boolean;
  starts_at: string;
  expires_at: string;
  impressions: number;
  clicks: number;
  total_spent: number;
  panels?: { name: string; subdomain: string | null };
}

const adTypeConfig = {
  sponsored: { icon: Crown, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  top: { icon: Trophy, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  best: { icon: Star, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  featured: { icon: Sparkles, color: "text-green-500", bgColor: "bg-green-500/10" },
};

const AdsManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<AdPricing[]>([]);
  const [ads, setAds] = useState<ProviderAd[]>([]);
  const [editingPricing, setEditingPricing] = useState<AdPricing | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricingRes, adsRes] = await Promise.all([
        supabase.from('provider_ad_pricing').select('*').order('daily_rate', { ascending: false }),
        supabase.from('provider_ads').select(`
          *,
          panels:panel_id (name, subdomain)
        `).order('created_at', { ascending: false })
      ]);

      if (pricingRes.data) setPricing(pricingRes.data);
      if (adsRes.data) setAds(adsRes.data as ProviderAd[]);
    } catch (error) {
      console.error('Error fetching ads data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePricing = async () => {
    if (!editingPricing) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('provider_ad_pricing')
        .update({
          daily_rate: editingPricing.daily_rate,
          weekly_rate: editingPricing.weekly_rate,
          monthly_rate: editingPricing.monthly_rate,
          max_slots: editingPricing.max_slots,
          description: editingPricing.description,
          is_active: editingPricing.is_active,
        })
        .eq('id', editingPricing.id);

      if (error) throw error;

      toast({ title: "Pricing Updated", description: `${editingPricing.ad_type} pricing saved successfully` });
      setEditingPricing(null);
      fetchData();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleAdStatus = async (ad: ProviderAd) => {
    try {
      await supabase
        .from('provider_ads')
        .update({ is_active: !ad.is_active })
        .eq('id', ad.id);
      
      toast({ title: ad.is_active ? "Ad Paused" : "Ad Resumed" });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const deleteAd = async (adId: string) => {
    try {
      await supabase.from('provider_ads').delete().eq('id', adId);
      toast({ title: "Ad Deleted" });
      fetchData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error" });
    }
  };

  // Calculate stats
  const activeAds = ads.filter(a => a.is_active && new Date(a.expires_at) > new Date());
  const totalRevenue = ads.reduce((sum, a) => sum + (a.total_spent || 0), 0);
  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Ads Management - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold">Ads Management</h1>
        <p className="text-muted-foreground">Configure provider advertising and visibility</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Ads", value: activeAds.length, icon: Play, color: "text-green-500" },
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-blue-500" },
          { label: "Impressions", value: totalImpressions.toLocaleString(), icon: Eye, color: "text-purple-500" },
          { label: "Clicks", value: totalClicks.toLocaleString(), icon: MousePointer, color: "text-amber-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-muted")}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pricing" className="gap-2">
            <Settings className="w-4 h-4" />
            Pricing Configuration
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Active Advertisements
          </TabsTrigger>
        </TabsList>

        {/* Pricing Configuration */}
        <TabsContent value="pricing">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Ad Pricing Tiers</CardTitle>
              <CardDescription>Configure rates and limits for each ad type</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Daily Rate</TableHead>
                    <TableHead>Weekly Rate</TableHead>
                    <TableHead>Monthly Rate</TableHead>
                    <TableHead>Max Slots</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricing.map((tier) => {
                    const config = adTypeConfig[tier.ad_type as keyof typeof adTypeConfig];
                    const Icon = config?.icon || Crown;
                    
                    return (
                      <TableRow key={tier.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-lg", config?.bgColor)}>
                              <Icon className={cn("w-4 h-4", config?.color)} />
                            </div>
                            <span className="font-medium capitalize">{tier.ad_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>${tier.daily_rate.toFixed(2)}</TableCell>
                        <TableCell>${tier.weekly_rate.toFixed(2)}</TableCell>
                        <TableCell>${tier.monthly_rate.toFixed(2)}</TableCell>
                        <TableCell>{tier.max_slots}</TableCell>
                        <TableCell>
                          <Badge variant={tier.is_active ? "default" : "secondary"}>
                            {tier.is_active ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingPricing(tier)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Advertisements */}
        <TabsContent value="active">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Active Advertisements</CardTitle>
              <CardDescription>Manage currently running provider ads</CardDescription>
            </CardHeader>
            <CardContent>
              {ads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active advertisements</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Panel</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.map((ad) => {
                      const config = adTypeConfig[ad.ad_type as keyof typeof adTypeConfig];
                      const Icon = config?.icon || Crown;
                      const daysLeft = differenceInDays(new Date(ad.expires_at), new Date());
                      const isExpired = daysLeft < 0;
                      
                      return (
                        <TableRow key={ad.id} className={isExpired ? "opacity-60" : ""}>
                          <TableCell className="font-medium">
                            {ad.panels?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className={cn("w-4 h-4", config?.color)} />
                              <span className="capitalize">{ad.ad_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {isExpired ? (
                                <span className="text-destructive">Expired</span>
                              ) : (
                                <span>{daysLeft} days</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                          <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                          <TableCell>${ad.total_spent.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={ad.is_active && !isExpired ? "default" : "secondary"}>
                              {isExpired ? "Expired" : ad.is_active ? "Active" : "Paused"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost"
                                onClick={() => toggleAdStatus(ad)}
                                disabled={isExpired}
                              >
                                {ad.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="text-destructive"
                                onClick={() => deleteAd(ad.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Pricing Dialog */}
      <Dialog open={!!editingPricing} onOpenChange={() => setEditingPricing(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="capitalize">Edit {editingPricing?.ad_type} Pricing</DialogTitle>
          </DialogHeader>
          {editingPricing && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Daily Rate ($)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editingPricing.daily_rate}
                    onChange={(e) => setEditingPricing({
                      ...editingPricing,
                      daily_rate: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weekly Rate ($)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editingPricing.weekly_rate}
                    onChange={(e) => setEditingPricing({
                      ...editingPricing,
                      weekly_rate: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Rate ($)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editingPricing.monthly_rate}
                    onChange={(e) => setEditingPricing({
                      ...editingPricing,
                      monthly_rate: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Max Slots</Label>
                <Input 
                  type="number"
                  value={editingPricing.max_slots}
                  onChange={(e) => setEditingPricing({
                    ...editingPricing,
                    max_slots: parseInt(e.target.value) || 1
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={editingPricing.description || ''}
                  onChange={(e) => setEditingPricing({
                    ...editingPricing,
                    description: e.target.value
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch 
                  checked={editingPricing.is_active}
                  onCheckedChange={(checked) => setEditingPricing({
                    ...editingPricing,
                    is_active: checked
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPricing(null)}>Cancel</Button>
            <Button onClick={handleSavePricing} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdsManagement;
