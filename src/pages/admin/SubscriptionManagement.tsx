import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowUpRight
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SubscriptionWithPanel {
  id: string;
  plan_type: 'free' | 'basic' | 'pro';
  price: number;
  status: string;
  started_at: string;
  expires_at: string | null;
  panel: {
    name: string;
    subdomain: string;
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

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await supabase
        .from('panel_subscriptions')
        .select(`
          *,
          panel:panels(name, subdomain, owner:profiles!panels_owner_id_fkey(email, full_name))
        `)
        .order('created_at', { ascending: false });

      setSubscriptions((data || []) as SubscriptionWithPanel[]);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalSubscriptions: subscriptions.length,
    freeCount: subscriptions.filter(s => s.plan_type === 'free').length,
    basicCount: subscriptions.filter(s => s.plan_type === 'basic').length,
    proCount: subscriptions.filter(s => s.plan_type === 'pro').length,
    monthlyRevenue: subscriptions.reduce((sum, s) => sum + (s.price || 0), 0)
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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Monitor and manage panel subscriptions</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
                <p className="text-xs text-muted-foreground">Total Subscriptions</p>
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
                <p className="text-xs text-muted-foreground">Free Plans</p>
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
                <p className="text-xs text-muted-foreground">Basic Plans</p>
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
                <p className="text-xs text-muted-foreground">Pro Plans</p>
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
                <p className="text-xs text-muted-foreground">Monthly Revenue</p>
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
                    <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
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
                      className="glass-card-hover p-3 md:p-4 space-y-3 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium group-hover:text-primary transition-colors text-sm md:text-base truncate">
                            {sub.panel?.name || 'Unknown Panel'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {sub.panel?.owner?.email}
                          </p>
                        </div>
                        <Badge className={cn(
                          "text-xs shrink-0",
                          sub.status === 'active' && "bg-emerald-500/20 text-emerald-500",
                          sub.status === 'expired' && "bg-destructive/20 text-destructive"
                        )}>
                          {sub.status}
                        </Badge>
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
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs gap-1"
                          onClick={() => {
                            // Navigate to panel management with this subscription
                            window.location.href = `/admin/panels?subscription=${sub.id}`;
                          }}
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
    </motion.div>
  );
};

export default SubscriptionManagement;
