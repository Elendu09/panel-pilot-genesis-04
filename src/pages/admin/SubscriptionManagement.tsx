import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  CreditCard, 
  Crown, 
  Zap, 
  Sparkles,
  DollarSign,
  TrendingUp,
  Users,
  Search,
  Calendar,
  ArrowUpRight,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  CalendarPlus,
  XCircle,
  Wallet,
  RefreshCw
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  UpgradeDialog, 
  ExtendDialog, 
  CancelDialog, 
  AddFundsDialog 
} from '@/components/admin/SubscriptionActionDialogs';

interface SubscriptionWithPanel {
  id: string;
  panel_id?: string;
  plan_type: 'free' | 'basic' | 'pro';
  price: number;
  status: string;
  started_at: string;
  expires_at: string | null;
  panel: {
    id?: string;
    name: string;
    subdomain: string;
    balance?: number;
    owner: {
      email: string;
      full_name: string;
    };
  };
}

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [upgradeDialog, setUpgradeDialog] = useState<{ open: boolean; subscription: SubscriptionWithPanel | null }>({ open: false, subscription: null });
  const [extendDialog, setExtendDialog] = useState<{ open: boolean; subscription: SubscriptionWithPanel | null }>({ open: false, subscription: null });
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; subscription: SubscriptionWithPanel | null }>({ open: false, subscription: null });
  const [addFundsDialog, setAddFundsDialog] = useState<{ open: boolean; subscription: SubscriptionWithPanel | null }>({ open: false, subscription: null });

  useEffect(() => {
    fetchSubscriptions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin-subscriptions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'panel_subscriptions'
      }, () => {
        fetchSubscriptions();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, () => {
        fetchSubscriptions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await supabase
        .from('panel_subscriptions')
        .select(`
          *,
          panel:panels(id, name, subdomain, balance, owner:profiles!panels_owner_id_fkey(email, full_name))
        `)
        .order('created_at', { ascending: false });

      // Transform data to include panel_id at subscription level
      const transformed = (data || []).map(sub => ({
        ...sub,
        panel_id: sub.panel?.id || sub.panel_id
      })) as SubscriptionWithPanel[];

      setSubscriptions(transformed);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalSubscriptions: subscriptions.length,
    freeCount: subscriptions.filter(s => s.plan_type === 'free').length,
    basicCount: subscriptions.filter(s => s.plan_type === 'basic').length,
    proCount: subscriptions.filter(s => s.plan_type === 'pro').length,
    monthlyRevenue: subscriptions.reduce((sum, s) => sum + (s.price || 0), 0),
    activeCount: subscriptions.filter(s => s.status === 'active').length,
    totalBalance: subscriptions.reduce((sum, s) => sum + ((s.panel as any)?.balance || 0), 0)
  };

  const filteredSubs = subscriptions.filter(sub =>
    sub.panel?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.panel?.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro': return Crown;
      case 'basic': return Sparkles;
      default: return Zap;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'from-amber-500 to-amber-600';
      case 'basic': return 'from-blue-500 to-blue-600';
      default: return 'from-slate-500 to-slate-600';
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

  // Group subscriptions by plan type for Kanban view
  const kanbanColumns = [
    { title: 'Free', plan: 'free', icon: Zap, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-500/10' },
    { title: 'Basic', plan: 'basic', icon: Sparkles, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10' },
    { title: 'Pro', plan: 'pro', icon: Crown, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Helmet>
        <title>Subscription Management - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Monitor and manage panel subscriptions</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubscriptions} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4">
        <Card className="glass-card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-500/10">
                <Zap className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.freeCount}</p>
                <p className="text-xs text-muted-foreground">Free</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Sparkles className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.basicCount}</p>
                <p className="text-xs text-muted-foreground">Basic</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Crown className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.proCount}</p>
                <p className="text-xs text-muted-foreground">Pro</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.monthlyRevenue}</p>
                <p className="text-xs text-muted-foreground">MRR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Wallet className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.totalBalance.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Balances</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by panel or owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Kanban View */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {kanbanColumns.map((column) => {
          const columnSubs = filteredSubs.filter(s => s.plan_type === column.plan);
          const Icon = column.icon;
          
          return (
            <div key={column.plan} className="space-y-4">
              {/* Column Header */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-gradient-to-br", column.color)}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{column.title}</h3>
                      <p className="text-xs text-muted-foreground">{columnSubs.length} subscriptions</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={column.bg}>
                    {columnSubs.length}
                  </Badge>
                </div>
              </div>

              {/* Column Items */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
                  ))
                ) : columnSubs.length === 0 ? (
                  <div className="glass-card p-6 text-center">
                    <Icon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No {column.title} subscriptions</p>
                  </div>
                ) : (
                  columnSubs.map((sub) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card-hover p-3 md:p-4 space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm md:text-base truncate">
                            {sub.panel?.name || 'Unknown Panel'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {sub.panel?.owner?.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-xs shrink-0",
                            sub.status === 'active' && "bg-emerald-500/20 text-emerald-500",
                            sub.status === 'cancelled' && "bg-destructive/20 text-destructive",
                            sub.status === 'expired' && "bg-amber-500/20 text-amber-500"
                          )}>
                            {sub.status}
                          </Badge>
                          
                          {/* Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setUpgradeDialog({ open: true, subscription: sub })}>
                                <ArrowUp className="w-4 h-4 mr-2" />
                                Upgrade/Downgrade
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setExtendDialog({ open: true, subscription: sub })}>
                                <CalendarPlus className="w-4 h-4 mr-2" />
                                Extend Duration
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAddFundsDialog({ open: true, subscription: sub })}>
                                <Wallet className="w-4 h-4 mr-2" />
                                Manage Funds
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setCancelDialog({ open: true, subscription: sub })}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(sub.started_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${sub.price}/mo
                        </div>
                      </div>

                      {/* Balance indicator */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">Balance</span>
                        <Badge variant="outline" className="text-xs">
                          ${((sub.panel as any)?.balance || 0).toFixed(2)}
                        </Badge>
                      </div>
                      
                      {/* Quick action */}
                      <div className="invisible group-hover:visible transition-[visibility] pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs gap-1"
                          onClick={() => window.location.href = `/admin/panels?subscription=${sub.id}`}
                        >
                          View Details <ArrowUpRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Dialogs */}
      <UpgradeDialog
        open={upgradeDialog.open}
        onClose={() => setUpgradeDialog({ open: false, subscription: null })}
        subscription={upgradeDialog.subscription}
        onSuccess={fetchSubscriptions}
      />
      <ExtendDialog
        open={extendDialog.open}
        onClose={() => setExtendDialog({ open: false, subscription: null })}
        subscription={extendDialog.subscription}
        onSuccess={fetchSubscriptions}
      />
      <CancelDialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, subscription: null })}
        subscription={cancelDialog.subscription}
        onSuccess={fetchSubscriptions}
      />
      <AddFundsDialog
        open={addFundsDialog.open}
        onClose={() => setAddFundsDialog({ open: false, subscription: null })}
        subscription={addFundsDialog.subscription}
        onSuccess={fetchSubscriptions}
      />
    </motion.div>
  );
};

export default SubscriptionManagement;
