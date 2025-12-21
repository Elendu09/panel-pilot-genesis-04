import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Shield,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Globe,
  Calendar
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Panel {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  monthly_revenue: number;
  total_orders: number;
  created_at: string;
  owner?: { email: string; full_name: string };
}

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPanels: 0,
    activeUsers: 0,
    platformRevenue: 0,
    pendingPanels: 0,
    activePanels: 0,
    suspendedPanels: 0
  });
  const [recentPanels, setRecentPanels] = useState<Panel[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: panels } = await supabase
        .from('panels')
        .select('*, owner:profiles!panels_owner_id_fkey(email, full_name)')
        .order('created_at', { ascending: false });

      const { data: users } = await supabase.from('profiles').select('id, is_active');

      if (panels) {
        const totalRevenue = panels.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
        setStats({
          totalPanels: panels.length,
          activeUsers: users?.filter(u => u.is_active).length || 0,
          platformRevenue: totalRevenue,
          pendingPanels: panels.filter(p => p.status === 'pending').length,
          activePanels: panels.filter(p => p.status === 'active').length,
          suspendedPanels: panels.filter(p => p.status === 'suspended').length
        });
        setRecentPanels(panels.slice(0, 6) as Panel[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const statsCards = [
    { title: 'Total Panels', value: stats.totalPanels, icon: BarChart3, change: '+12%', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10' },
    { title: 'Active Users', value: stats.activeUsers, icon: Users, change: '+8%', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10' },
    { title: 'Platform Revenue', value: `$${stats.platformRevenue.toFixed(0)}`, icon: DollarSign, change: '+15%', color: 'from-violet-500 to-violet-600', bg: 'bg-violet-500/10' },
    { title: 'Security Score', value: '98.2%', icon: Shield, change: 'Secure', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10' }
  ];

  const kanbanColumns = [
    { title: 'Pending Approval', status: 'pending', icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10', textColor: 'text-amber-500' },
    { title: 'Active', status: 'active', icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', textColor: 'text-emerald-500' },
    { title: 'Suspended', status: 'suspended', icon: AlertCircle, color: 'from-red-500 to-red-600', bg: 'bg-red-500/10', textColor: 'text-red-500' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Helmet>
        <title>Admin Overview - SMMPilot Platform</title>
        <meta name="description" content="Platform overview and management dashboard for super administrators." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="glass-card-hover relative overflow-hidden">
              <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20", stat.bg)} />
              <CardContent className="p-4 md:p-6 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl md:text-3xl font-bold">{loading ? '...' : stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Kanban-style Panel Status */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Panels by Status</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/panels">View All</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {kanbanColumns.map((column) => {
            const columnPanels = recentPanels.filter(p => p.status === column.status);
            const Icon = column.icon;
            const count = column.status === 'pending' ? stats.pendingPanels :
                          column.status === 'active' ? stats.activePanels : stats.suspendedPanels;
            
            return (
              <div key={column.status} className="space-y-4">
                {/* Column Header */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-gradient-to-br", column.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{column.title}</h3>
                        <p className="text-xs text-muted-foreground">{count} panels</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={column.bg}>
                      {count}
                    </Badge>
                  </div>
                </div>

                {/* Column Items */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {loading ? (
                    [1, 2].map(i => (
                      <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                    ))
                  ) : columnPanels.length === 0 ? (
                    <div className="glass-card p-6 text-center">
                      <Icon className={cn("w-8 h-8 mx-auto mb-2", column.textColor)} />
                      <p className="text-sm text-muted-foreground">No {column.title.toLowerCase()} panels</p>
                    </div>
                  ) : (
                    columnPanels.map((panel) => (
                      <motion.div
                        key={panel.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card-hover p-4 space-y-3 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">
                              {panel.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Globe className="w-3 h-3" />
                              {panel.subdomain}.smmpilot.online
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(panel.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-emerald-500">
                            <DollarSign className="w-3 h-3" />
                            ${panel.monthly_revenue?.toFixed(0) || 0}
                          </div>
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                            Manage <ArrowUpRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activity & Top Panels */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'New panel created: "SocialBoost Pro"', sub: 'by john@example.com', time: '2m ago' },
                { title: 'Domain connected: mysmmservices.com', sub: 'SSL certificate issued', time: '5m ago' },
                { title: 'Payment gateway configured', sub: 'Stripe integration', time: '12m ago' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Performing Panels
            </CardTitle>
            <CardDescription>Highest revenue this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'SMMKing Pro', domain: 'smmking.panelpilot.com', revenue: '$15,892' },
                { name: 'SocialGrow', domain: 'socialgrow.net', revenue: '$12,567' },
                { name: 'BoostPanel', domain: 'boostpanel.io', revenue: '$9,834' }
              ].map((panel, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{panel.name}</p>
                      <p className="text-xs text-muted-foreground">{panel.domain}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">{panel.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminOverview;
