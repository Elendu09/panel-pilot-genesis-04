import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Server, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  RefreshCw,
  Globe,
  DollarSign,
  Package,
  Eye,
  EyeOff,
  Zap,
  AlertTriangle
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import KanbanColumn from "@/components/admin/KanbanColumn";
import KanbanCard from "@/components/admin/KanbanCard";
import AdminViewToggle from "@/components/admin/AdminViewToggle";

interface Provider {
  id: string;
  name: string;
  api_endpoint: string;
  balance: number;
  is_active: boolean;
  created_at: string;
  panel?: {
    name: string;
    subdomain: string;
  };
}

const ProviderManagement = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<'table' | 'kanban'>('kanban');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data } = await supabase
        .from('providers')
        .select(`
          *,
          panel:panels(name, subdomain)
        `)
        .order('created_at', { ascending: false });

      setProviders((data || []) as Provider[]);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load providers"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = async (provider: Provider) => {
    try {
      await supabase
        .from('providers')
        .update({ is_active: !provider.is_active })
        .eq('id', provider.id);

      toast({
        title: "Provider Updated",
        description: `Provider ${!provider.is_active ? 'enabled' : 'disabled'} successfully`
      });
      fetchProviders();
    } catch (error) {
      console.error('Error toggling provider:', error);
    }
  };

  const kanbanColumns = [
    { 
      title: 'Active', 
      filter: (p: Provider) => p.is_active && (p.balance || 0) > 10, 
      icon: CheckCircle, 
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-500'
    },
    { 
      title: 'Low Balance', 
      filter: (p: Provider) => p.is_active && (p.balance || 0) <= 10, 
      icon: AlertTriangle, 
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
      textColor: 'text-amber-500'
    },
    { 
      title: 'Disabled', 
      filter: (p: Provider) => !p.is_active, 
      icon: XCircle, 
      color: 'from-red-500 to-red-600',
      bg: 'bg-red-500/10',
      textColor: 'text-red-500'
    }
  ];

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.api_endpoint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: providers.length,
    active: providers.filter(p => p.is_active).length,
    totalBalance: providers.reduce((sum, p) => sum + (p.balance || 0), 0)
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Helmet>
        <title>Provider Management - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Provider Management</h1>
          <p className="text-muted-foreground">Manage all SMM API providers across panels</p>
        </div>
        <div className="flex items-center gap-2">
          <AdminViewToggle view={view} onViewChange={setView} />
          <Button onClick={fetchProviders} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Sync All
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Zap className="w-5 h-5 text-emerald-500" />
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
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{providers.filter(p => (p.balance || 0) <= 10).length}</p>
              <p className="text-xs text-muted-foreground">Low Balance</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Kanban Board */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {kanbanColumns.map((column) => {
          const columnProviders = filteredProviders.filter(column.filter);
          
          return (
            <KanbanColumn
              key={column.title}
              title={column.title}
              count={columnProviders.length}
              icon={column.icon}
              color={column.color}
              bgColor={column.bg}
              textColor={column.textColor}
              loading={loading}
              emptyMessage={`No ${column.title.toLowerCase()} providers`}
            >
              {columnProviders.map((provider) => (
                <KanbanCard
                  key={provider.id}
                  variant={provider.is_active ? ((provider.balance || 0) > 10 ? 'success' : 'warning') : 'danger'}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{provider.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Globe className="w-3 h-3" />
                          <span className="truncate">{provider.api_endpoint}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={provider.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}
                      >
                        {provider.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">${(provider.balance || 0).toFixed(2)}</span>
                      </div>
                      {provider.panel && (
                        <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {provider.panel.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProvider(provider);
                        }}
                      >
                        {provider.is_active ? (
                          <><EyeOff className="w-3 h-3 mr-1" />Disable</>
                        ) : (
                          <><Eye className="w-3 h-3 mr-1" />Enable</>
                        )}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                        <RefreshCw className="w-3 h-3 mr-1" />Sync
                      </Button>
                    </div>
                  </div>
                </KanbanCard>
              ))}
            </KanbanColumn>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default ProviderManagement;
