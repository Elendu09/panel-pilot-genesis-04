import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  Calendar,
  RefreshCw
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

interface RecentDeposit {
  id: string;
  amount: number;
  payment_method: string | null;
  created_at: string;
  status: string | null;
  panel: {
    id: string;
    name: string;
    subdomain: string;
  } | null;
}

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [recentDeposits, setRecentDeposits] = useState<RecentDeposit[]>([]);
  const [securityScore, setSecurityScore] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      // Fetch all data directly from Supabase tables
      const [panelsRes, profilesRes, txRes, auditRes] = await Promise.all([
        supabase.from('panels').select('*, owner:profiles!panels_owner_id_fkey(email, full_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, created_at', { count: 'exact', head: false }),
        supabase.from('transactions').select('id, amount, payment_method, created_at, status, panel_id').eq('type', 'deposit').order('created_at', { ascending: false }).limit(10),
        supabase.from('audit_logs').select('id, action, resource_type, created_at, details').order('created_at', { ascending: false }).limit(10),
      ]);

      const allPanels = (panelsRes.data || []) as Panel[];
      const totalPanels = allPanels.length;
      const activePanels = allPanels.filter(p => p.status === 'active').length;
      const pendingPanels = allPanels.filter(p => p.status === 'pending').length;
      const suspendedPanels = allPanels.filter(p => p.status === 'suspended').length;
      const platformRevenue = (txRes.data || []).filter((t: any) => t.status === 'completed').reduce((s: number, t: any) => s + (t.amount || 0), 0);

      setStats({
        totalPanels,
        activeUsers: profilesRes.count || 0,
        platformRevenue,
        pendingPanels,
        activePanels,
        suspendedPanels,
      });

      setSecurityScore(Math.min(activePanels > 0 ? 85 : 60, 100));
      setRecentPanels(allPanels.slice(0, 6));

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { startDate: prevStart, endDate: prevEnd } = getPreviousPeriodRange(30);

      const recentPanelCount = allPanels.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;

      setStatsChanges({
        panels: { value: `+${recentPanelCount}`, trend: recentPanelCount > 0 ? 'up' : 'neutral' },
        users: { value: `+0`, trend: 'neutral' },
        revenue: { value: '+0%', trend: 'neutral' },
      });

      setRecentActivity((auditRes.data || []) as AuditLog[]);

      const activePerformers = allPanels
        .filter(p => p.status === 'active')
        .sort((a, b) => (b.monthly_revenue || 0) - (a.monthly_revenue || 0))
        .slice(0, 3);
      setTopPanels(activePerformers);

      // Map deposits with panel info
      const depositsWithPanels = (txRes.data || []).map((tx: any) => {
        const txPanel = allPanels.find(p => p.id === tx.panel_id);
        return {
          ...tx,
          panel: txPanel ? { id: txPanel.id, name: txPanel.name, subdomain: txPanel.subdomain } : null,
        };
      });
      setRecentDeposits(depositsWithPanels as RecentDeposit[]);

    } catch (err: any) {
      console.error('Error fetching admin overview data:', err);
      setError(err.message || 'An unexpected error occurred while loading the dashboard.');
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
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const statsCards = [
    { title: 'Total Panels', value: stats.totalPanels, icon: BarChart3, change: statsChanges.panels.value, trend: statsChanges.panels.trend, iconBg: 'bg-blue-500/10 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-400' },
    { title: 'Active Users', value: stats.activeUsers, icon: Users, change: statsChanges.users.value, trend: statsChanges.users.trend, iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Platform Revenue', value: `$${stats.platformRevenue.toFixed(0)}`, icon: DollarSign, change: statsChanges.revenue.value, trend: statsChanges.revenue.trend, iconBg: 'bg-violet-500/10 dark:bg-violet-500/20', iconColor: 'text-violet-600 dark:text-violet-400' },
    { title: 'Security Score', value: loading ? '...' : `${securityScore}%`, icon: Shield, change: securityScore >= 90 ? 'Secure' : securityScore >= 70 ? 'Fair' : 'At Risk', trend: securityScore >= 80 ? 'up' : 'down', iconBg: 'bg-amber-500/10 dark:bg-amber-500/20', iconColor: 'text-amber-600 dark:text-amber-400' }
  ];

  const kanbanColumns = [
    { title: 'Pending Approval', status: 'pending', icon: Clock, iconBg: 'bg-amber-500/10 dark:bg-amber-500/20', iconColor: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
    { title: 'Active', status: 'active', icon: CheckCircle, iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20', iconColor: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
    { title: 'Suspended', status: 'suspended', icon: AlertCircle, iconBg: 'bg-red-500/10 dark:bg-red-500/20', iconColor: 'text-red-600 dark:text-red-400', badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' }
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <Helmet>
          <title>Admin Overview - SMMPilot Platform</title>
          <meta name="description" content="Platform overview and management dashboard for super administrators." />
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70" data-testid="text-page-title">
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Platform overview and management</p>
        </div>
        <Card data-testid="error-card">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <div>
              <p className="text-lg font-semibold" data-testid="text-error-title">Failed to Load Dashboard</p>
              <p className="text-sm text-muted-foreground mt-1" data-testid="text-error-message">{error}</p>
            </div>
            <Button onClick={fetchData} variant="outline" data-testid="button-retry">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70" data-testid="text-page-title">
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Platform overview and management</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          data-testid="button-refresh"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover-elevate" data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={cn("p-2 rounded-md", stat.iconBg)}>
                    <Icon className={cn("w-4 h-4 md:w-5 md:h-5", stat.iconColor)} />
                  </div>
                  {loading ? (
                    <Skeleton className="h-5 w-12" />
                  ) : (
                    <Badge variant="outline" className={cn(
                      "text-xs no-default-hover-elevate no-default-active-elevate",
                      stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                      stat.trend === 'down' ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" :
                      "bg-muted text-muted-foreground"
                    )} data-testid={`badge-trend-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {stat.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : 
                       stat.trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
                      {stat.change}
                    </Badge>
                  )}
                </div>
                {loading ? (
                  <>
                    <Skeleton className="h-8 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl md:text-3xl font-bold tracking-tight" data-testid={`text-stat-value-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <h2 className="text-lg md:text-xl font-semibold">Panels by Status</h2>
          <Button variant="outline" size="sm" asChild data-testid="link-view-all-panels">
            <Link to="/admin/panels">
              View All
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanColumns.map((column) => {
            const columnPanels = recentPanels.filter(p => p.status === column.status);
            const Icon = column.icon;
            const count = column.status === 'pending' ? stats.pendingPanels :
                          column.status === 'active' ? stats.activePanels : stats.suspendedPanels;
            
            return (
              <div key={column.status} className="space-y-3" data-testid={`kanban-column-${column.status}`}>
                <Card>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("p-2 rounded-md", column.iconBg)}>
                          <Icon className={cn("w-4 h-4", column.iconColor)} />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{column.title}</h3>
                          <p className="text-xs text-muted-foreground">{count} panels</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-xs", column.badgeBg)}>
                        {loading ? '...' : count}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-0.5">
                  {loading ? (
                    [1, 2].map(i => (
                      <Card key={i}>
                        <CardContent className="p-3 md:p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <Skeleton className="h-4 w-3/4 mb-2" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : columnPanels.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Icon className={cn("w-8 h-8 mx-auto mb-2 opacity-40", column.iconColor)} />
                        <p className="text-sm text-muted-foreground">No {column.title.toLowerCase()} panels</p>
                      </CardContent>
                    </Card>
                  ) : (
                    columnPanels.map((panel) => (
                      <Card
                        key={panel.id}
                        className="hover-elevate group cursor-pointer"
                        data-testid={`card-panel-${panel.id}`}
                      >
                        <CardContent className="p-3 md:p-4 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate" data-testid={`text-panel-name-${panel.id}`}>
                                {panel.name}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Globe className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{panel.subdomain}.smmpilot.online</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(panel.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <DollarSign className="w-3 h-3" />
                              ${panel.monthly_revenue?.toFixed(0) || 0}
                            </div>
                          </div>
                          
                          <div className="invisible group-hover:visible transition-[visibility]">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs gap-1"
                              asChild
                              data-testid={`button-manage-panel-${panel.id}`}
                            >
                              <Link to={`/admin/panels?id=${panel.id}`}>
                                Manage <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card data-testid="card-recent-activity">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-3 w-16 flex-shrink-0" />
                  </div>
                ))
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center justify-between gap-3 p-2.5 rounded-md hover-elevate" data-testid={`activity-item-${log.id}`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{formatActivityTitle(log)}</p>
                      <p className="text-xs text-muted-foreground truncate">{formatActivitySub(log)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-deposits">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Recent Deposits
            </CardTitle>
            <CardDescription>Latest deposits across all panels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-14" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-14 flex-shrink-0" />
                  </div>
                ))
              ) : recentDeposits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No recent deposits</p>
                </div>
              ) : (
                recentDeposits.map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between gap-3 p-2.5 rounded-md hover-elevate" data-testid={`deposit-item-${deposit.id}`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{deposit.panel?.name || 'Unknown Panel'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <Badge variant="outline" className="text-xs capitalize no-default-hover-elevate no-default-active-elevate">
                          {deposit.payment_method?.replace('_', ' ') || 'N/A'}
                        </Badge>
                        <span>{formatDistanceToNow(new Date(deposit.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-2 flex-shrink-0" data-testid={`text-deposit-amount-${deposit.id}`}>
                      +${deposit.amount.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4" asChild data-testid="link-view-all-transactions">
              <Link to="/admin/payments">View All Transactions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-top-panels">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-md bg-primary/10">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              Top Performing Panels
            </CardTitle>
            <CardDescription>Highest revenue this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="w-8 h-8 rounded-md flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-10 flex-shrink-0" />
                  </div>
                ))
              ) : topPanels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active panels yet</p>
                </div>
              ) : (
                topPanels.map((panel, i) => (
                  <div key={panel.id} className="flex items-center justify-between gap-3 p-2.5 rounded-md hover-elevate" data-testid={`top-panel-${panel.id}`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center font-semibold text-sm text-primary flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{panel.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {panel.subdomain}.smmpilot.online
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary flex-shrink-0" data-testid={`text-top-panel-revenue-${panel.id}`}>
                      ${(panel.monthly_revenue || 0).toFixed(0)}
                    </span>
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
