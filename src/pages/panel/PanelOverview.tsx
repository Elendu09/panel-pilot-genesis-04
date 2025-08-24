import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, DollarSign, ShoppingCart, TrendingUp, Eye } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PanelOverview = () => {
  const { profile } = useAuth();
  const [panelData, setPanelData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeServices: 0,
    totalCustomers: 0
  });

  useEffect(() => {
    const fetchPanelData = async () => {
      if (!profile?.id) return;

      try {
        // Fetch panel data
        const { data: panel } = await supabase
          .from('panels')
          .select('*, panel_settings(*)')
          .eq('owner_id', profile.id)
          .single();

        setPanelData(panel);

        if (panel) {
          // Fetch panel statistics
          const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('panel_id', panel.id);

          const { data: services } = await supabase
            .from('services')
            .select('*')
            .eq('panel_id', panel.id)
            .eq('is_active', true);

          // Calculate unique customers
          const uniqueCustomers = new Set(orders?.map(o => o.buyer_id) || []).size;
          const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.price), 0) || 0;

          setStats({
            totalOrders: orders?.length || 0,
            totalRevenue,
            activeServices: services?.length || 0,
            totalCustomers: uniqueCustomers
          });
        }
      } catch (error) {
        console.error('Error fetching panel data:', error);
      }
    };

    fetchPanelData();
  }, [profile?.id]);

  if (!panelData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Panel Dashboard</h1>
          <p className="text-muted-foreground">Loading your panel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{panelData.name} - Panel Dashboard</title>
        <meta name="description" content="Manage your SMM panel, track orders and revenue." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <div>
        <h1 className="text-3xl font-bold">{panelData.name}</h1>
        <p className="text-muted-foreground">
          Welcome to your SMM panel dashboard
              {panelData.subdomain && (
                <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  {panelData.subdomain}.smmpilot.online
                </span>
              )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Active Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeServices}</div>
            <p className="text-xs text-muted-foreground">Services available</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Unique customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Panel Status</CardTitle>
            <CardDescription>Current status and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Panel Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  panelData.status === 'active' ? 'bg-green-100 text-green-800' :
                  panelData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {panelData.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Domain</span>
                <span className="text-sm">
                  {panelData.custom_domain || `${panelData.subdomain}.smmpilot.online`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Theme</span>
                <span className="text-sm capitalize">{panelData.theme_type?.replace('_', ' ')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your panel efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="text-sm">Add New Service</span>
                </div>
                <span className="text-xs text-muted-foreground">→</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="text-sm">View Public Panel</span>
                </div>
                <span className="text-xs text-muted-foreground">→</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">View Analytics</span>
                </div>
                <span className="text-xs text-muted-foreground">→</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PanelOverview;