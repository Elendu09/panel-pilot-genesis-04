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
  TrendingDown,
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
import { calculateChange, getPreviousPeriodRange } from "@/lib/analytics-utils";
import { formatDistanceToNow } from "date-fns";

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

interface AuditLog {
  id: string;
  action: string;
  resource_type: string | null;
  created_at: string;
  details: any;
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
  const [statsChanges, setStatsChanges] = useState<{
    panels: { value: string; trend: 'up' | 'down' | 'neutral' };
    users: { value: string; trend: 'up' | 'down' | 'neutral' };
    revenue: { value: string; trend: 'up' | 'down' | 'neutral' };
  }>({
    panels: { value: '+0', trend: 'neutral' },
    users: { value: '+0', trend: 'neutral' },
    revenue: { value: '+0%', trend: 'neutral' },
  });
  const [recentPanels, setRecentPanels] = useState<Panel[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [topPanels, setTopPanels] = useState<Panel[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch panels
      const { data: panels } = await supabase
        .from('panels')
        .select('*, owner:profiles!panels_owner_id_fkey(email, full_name)')
        .order('created_at', { ascending: false });

      // Fetch users
      const { data: users } = await supabase.from('profiles').select('id, is_active, created_at');

      // Fetch recent audit logs
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('id, action, resource_type, created_at, details')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch top performing panels by revenue
      const { data: topPerformers } = await supabase
        .from('panels')
        .select('id, name, subdomain, custom_domain, monthly_revenue, status')
        .eq('status', 'active')
        .order('monthly_revenue', { ascending: false })
        .limit(3);

      // Calculate changes
      const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodRange(30);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPanelCount = panels?.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length || 0;
      const prevPanelCount = panels?.filter(p => 
        new Date(p.created_at) >= prevStart && new Date(p.created_at) < prevEnd
      ).length || 0;

      const recentUserCount = users?.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length || 0;
      const prevUserCount = users?.filter(u => 
        new Date(u.created_at) >= prevStart && new Date(u.created_at) < prevEnd
      ).length || 0;

      const panelChange = calculateChange(recentPanelCount, prevPanelCount);
      const userChange = calculateChange(recentUserCount, prevUserCount);

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

      setStatsChanges({
        panels: { value: `+${recentPanelCount}`, trend: recentPanelCount > 0 ? 'up' : 'neutral' },
        users: { value: `+${recentUserCount}`, trend: recentUserCount > 0 ? 'up' : 'neutral' },
        revenue: { value: panelChange.value, trend: panelChange.trend },
      });

      setRecentActivity((auditLogs || []) as AuditLog[]);
      setTopPanels((topPerformers || []) as unknown as Panel[]);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatActivityTitle = (log: AuditLog): string => {
    const action = log.action?.toLowerCase() || 'action';
    const resource = log.resource_type || 'resource';
    return `${action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ')} - ${resource}`;
  };

  const formatActivitySub = (log: AuditLog): string => {
    if (log.details && typeof log.details === 'object') {
      return JSON.stringify(log.details).slice(0, 50) + '...';
    }
    return log.resource_type || 'System activity';
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
    { title: 'Total Panels', value: stats.totalPanels, icon: BarChart3, change: statsChanges.panels.value, trend: statsChanges.panels.trend, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10' },
    { title: 'Active Users', value: stats.activeUsers, icon: Users, change: statsChanges.users.value, trend: statsChanges.users.trend, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10' },
    { title: 'Platform Revenue', value: `$${stats.platformRevenue.toFixed(0)}`, icon: DollarSign, change: statsChanges.revenue.value, trend: statsChanges.revenue.trend, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-500/10' },
    { title: 'Security Score', value: '98.2%', icon: Shield, change: 'Secure', trend: 'up' as const, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10' }
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
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    stat.trend === 'down' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
                     stat.trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
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
                        className="glass-card-hover p-3 md:p-4 space-y-3 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="font-medium group-hover:text-primary transition-colors text-sm md:text-base truncate">
                              {panel.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Globe className="w-3 h-3" />
                              <span className="truncate">{panel.subdomain}.smmpilot.online</span>
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full text-xs gap-1"
                            asChild
                          >
                            <Link to={`/admin/panels?id=${panel.id}`}>
                              Manage <ArrowUpRight className="w-3 h-3" />
                            </Link>
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
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
                ))
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{formatActivityTitle(log)}</p>
                      <p className="text-xs text-muted-foreground">{formatActivitySub(log)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))
              )}
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
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
                ))
              ) : topPanels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active panels yet</p>
                </div>
              ) : (
                topPanels.map((panel, i) => (
                  <div key={panel.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{panel.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {panel.subdomain}.smmpilot.online
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary">${(panel.monthly_revenue || 0).toFixed(0)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminOverview;
