import { useState, useEffect, useMemo } from "react";
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
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays, subDays } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet-async";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

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
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="pricing" className="gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Active Ads</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Performance</span>
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

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="space-y-6">
            {/* Performance Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0;
                const avgSpent = ads.length > 0 ? (totalRevenue / ads.length) : 0;
                const expiringSoon = ads.filter(a => {
                  const daysLeft = differenceInDays(new Date(a.expires_at), new Date());
                  return a.is_active && daysLeft >= 0 && daysLeft <= 7;
                }).length;

                return [
                  { label: "Click-Through Rate", value: `${ctr.toFixed(2)}%`, icon: Target, color: "text-purple-500" },
                  { label: "Avg. Spend/Ad", value: `$${avgSpent.toFixed(2)}`, icon: DollarSign, color: "text-green-500" },
                  { label: "Active Ads", value: activeAds.length, icon: Play, color: "text-blue-500" },
                  { label: "Expiring Soon", value: expiringSoon, icon: Clock, color: "text-amber-500" },
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
                          <div className="p-2 rounded-lg bg-muted">
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className="text-xl font-bold">{stat.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ));
              })()}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Over Time */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Revenue Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Aggregate revenue by date
                    const revenueByDate = ads.reduce((acc, ad) => {
                      const date = format(new Date(ad.starts_at), 'MMM dd');
                      acc[date] = (acc[date] || 0) + (ad.total_spent || 0);
                      return acc;
                    }, {} as Record<string, number>);

                    const chartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
                      date,
                      revenue
                    })).slice(-14);

                    if (chartData.length === 0) {
                      return (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                          No revenue data yet
                        </div>
                      );
                    }

                    return (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                            <YAxis className="text-xs" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="revenue" 
                              stroke="hsl(var(--primary))" 
                              fill="url(#revenueGradient)" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Ad Type Distribution */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Ad Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const typeDistribution = ads.reduce((acc, ad) => {
                      acc[ad.ad_type] = (acc[ad.ad_type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);

                    const pieData = Object.entries(typeDistribution).map(([name, value]) => ({
                      name: name.charAt(0).toUpperCase() + name.slice(1),
                      value
                    }));

                    const COLORS = ['hsl(38, 92%, 50%)', 'hsl(217, 91%, 60%)', 'hsl(271, 91%, 65%)', 'hsl(142, 76%, 36%)'];

                    if (pieData.length === 0) {
                      return (
                        <div className="h-48 flex items-center justify-center text-muted-foreground">
                          No ad data yet
                        </div>
                      );
                    }

                    return (
                      <div className="h-48 flex items-center">
                        <ResponsiveContainer width="50%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-2">
                          {pieData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm">{item.name}</span>
                              <span className="text-sm text-muted-foreground ml-auto">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Ads Table */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">Top Performing Ads</CardTitle>
                <CardDescription>Ranked by click-through rate</CardDescription>
              </CardHeader>
              <CardContent>
                {ads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No ads data available</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Panel</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-right">Spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...ads]
                        .map(ad => ({
                          ...ad,
                          ctr: ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0
                        }))
                        .sort((a, b) => b.ctr - a.ctr)
                        .slice(0, 10)
                        .map((ad) => {
                          const config = adTypeConfig[ad.ad_type as keyof typeof adTypeConfig];
                          const Icon = config?.icon || Crown;
                          
                          return (
                            <TableRow key={ad.id}>
                              <TableCell className="font-medium">
                                {ad.panels?.name || 'Unknown'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Icon className={cn("w-4 h-4", config?.color)} />
                                  <span className="capitalize">{ad.ad_type}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{ad.impressions.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{ad.clicks.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={ad.ctr > 2 ? "default" : "secondary"}>
                                  {ad.ctr.toFixed(2)}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">${ad.total_spent.toFixed(2)}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
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
