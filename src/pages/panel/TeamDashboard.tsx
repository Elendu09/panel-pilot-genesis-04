import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Package, ShoppingCart, MessageSquare, LogOut, BarChart3,
  FileText, Settings, Home, Loader2, Shield, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';

// Role permissions configuration
const rolePermissions = {
  panel_admin: {
    label: 'Admin',
    color: 'bg-purple-500/10 text-purple-500',
    tabs: ['overview', 'orders', 'services', 'customers', 'support', 'analytics'],
    canEdit: true,
    canDelete: true,
  },
  manager: {
    label: 'Manager',
    color: 'bg-blue-500/10 text-blue-500',
    tabs: ['overview', 'orders', 'services', 'support'],
    canEdit: true,
    canDelete: false,
  },
  agent: {
    label: 'Agent',
    color: 'bg-green-500/10 text-green-500',
    tabs: ['overview', 'orders', 'support'],
    canEdit: false,
    canDelete: false,
  },
};

interface TeamSession {
  memberId: string;
  email: string;
  fullName: string | null;
  role: 'panel_admin' | 'manager' | 'agent';
  panelId: string;
  token: string;
  expiresAt: number;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalServices: number;
  totalCustomers: number;
}

const TeamDashboard = () => {
  const navigate = useNavigate();
  const { panel, loading: tenantLoading } = useTenant();
  
  const [session, setSession] = useState<TeamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalServices: 0,
    totalCustomers: 0,
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkSession();
  }, [panel?.id]);

  const checkSession = async () => {
    const storedSession = localStorage.getItem('team_session');
    
    if (!storedSession) {
      navigate('/team-login');
      return;
    }

    try {
      const parsed: TeamSession = JSON.parse(storedSession);
      
      // Check if session matches current panel
      if (parsed.panelId !== panel?.id) {
        localStorage.removeItem('team_session');
        navigate('/team-login');
        return;
      }

      // Check if session expired
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem('team_session');
        toast({ variant: 'destructive', title: 'Session expired', description: 'Please login again' });
        navigate('/team-login');
        return;
      }

      // Verify token with backend
      const { data } = await supabase.functions.invoke('team-auth', {
        body: {
          panelId: panel?.id,
          action: 'verify-token',
          token: parsed.token
        }
      });

      if (!data?.valid) {
        localStorage.removeItem('team_session');
        navigate('/team-login');
        return;
      }

      setSession(parsed);
      await fetchStats();
    } catch (error) {
      console.error('Session check error:', error);
      localStorage.removeItem('team_session');
      navigate('/team-login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!panel?.id) return;

    try {
      // Fetch basic stats
      const [ordersRes, servicesRes, customersRes] = await Promise.all([
        supabase.from('orders').select('id, status', { count: 'exact' }).eq('panel_id', panel.id),
        supabase.from('services').select('id', { count: 'exact' }).eq('panel_id', panel.id).eq('is_active', true),
        supabase.from('client_users').select('id', { count: 'exact' }).eq('panel_id', panel.id),
      ]);

      const pendingOrders = ordersRes.data?.filter(o => o.status === 'pending' || o.status === 'in_progress').length || 0;

      setStats({
        totalOrders: ordersRes.count || 0,
        pendingOrders,
        totalServices: servicesRes.count || 0,
        totalCustomers: customersRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('team_session');
    toast({ title: 'Logged out successfully' });
    navigate('/team-login');
  };

  if (tenantLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const permissions = rolePermissions[session.role];
  const allowedTabs = permissions.tabs;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold">{panel?.name || 'Panel'}</h1>
                <p className="text-xs text-muted-foreground">Team Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{session.fullName || session.email}</p>
              <Badge className={permissions.color}>{permissions.label}</Badge>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Welcome, {session.fullName || session.email.split('@')[0]}!
                  </h2>
                  <p className="text-muted-foreground">
                    You're logged in as <span className="font-medium">{permissions.label}</span>
                    {!permissions.canEdit && ' (View Only)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-500', tab: 'orders' },
            { label: 'Pending', value: stats.pendingOrders, icon: AlertCircle, color: 'text-yellow-500', tab: 'orders' },
            { label: 'Services', value: stats.totalServices, icon: Package, color: 'text-green-500', tab: 'services' },
            { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'text-purple-500', tab: 'customers' },
          ].filter(stat => allowedTabs.includes(stat.tab) || stat.tab === 'orders').map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-muted">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass-card p-1 flex-wrap h-auto">
            {allowedTabs.includes('overview') && (
              <TabsTrigger value="overview"><Home className="w-4 h-4 mr-2" /> Overview</TabsTrigger>
            )}
            {allowedTabs.includes('orders') && (
              <TabsTrigger value="orders"><ShoppingCart className="w-4 h-4 mr-2" /> Orders</TabsTrigger>
            )}
            {allowedTabs.includes('services') && (
              <TabsTrigger value="services"><Package className="w-4 h-4 mr-2" /> Services</TabsTrigger>
            )}
            {allowedTabs.includes('customers') && (
              <TabsTrigger value="customers"><Users className="w-4 h-4 mr-2" /> Customers</TabsTrigger>
            )}
            {allowedTabs.includes('support') && (
              <TabsTrigger value="support"><MessageSquare className="w-4 h-4 mr-2" /> Support</TabsTrigger>
            )}
            {allowedTabs.includes('analytics') && (
              <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2" /> Analytics</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allowedTabs.includes('orders') && (
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab('orders')}>
                    <ShoppingCart className="w-6 h-6" />
                    <span>View Orders</span>
                  </Button>
                )}
                {allowedTabs.includes('services') && (
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab('services')}>
                    <Package className="w-6 h-6" />
                    <span>Manage Services</span>
                  </Button>
                )}
                {allowedTabs.includes('support') && (
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab('support')}>
                    <MessageSquare className="w-6 h-6" />
                    <span>Support Tickets</span>
                  </Button>
                )}
                {allowedTabs.includes('analytics') && (
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setActiveTab('analytics')}>
                    <BarChart3 className="w-6 h-6" />
                    <span>View Analytics</span>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Your Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Role</span>
                    <Badge className={permissions.color}>{permissions.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Can Edit</span>
                    <Badge variant={permissions.canEdit ? 'default' : 'secondary'}>
                      {permissions.canEdit ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Can Delete</span>
                    <Badge variant={permissions.canDelete ? 'default' : 'secondary'}>
                      {permissions.canDelete ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Orders list will load here</p>
                  <p className="text-sm">Based on your role: {permissions.canEdit ? 'You can manage orders' : 'View only access'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Services Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Services list will load here</p>
                  <p className="text-sm">Based on your role: {permissions.canEdit ? 'You can edit services' : 'View only access'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Customer list will load here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Support tickets will load here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics charts will load here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeamDashboard;
