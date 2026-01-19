import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import AdminViewToggle from "@/components/admin/AdminViewToggle";
import KanbanColumn from "@/components/admin/KanbanColumn";
import KanbanCard from "@/components/admin/KanbanCard";
import DNSConfigGuide from "@/components/admin/DNSConfigGuide";
import { 
  Monitor, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Globe,
  Search,
  Eye,
  Edit,
  Ban,
  Calendar,
  TrendingUp,
  Activity,
  Save,
  Package,
  Users,
  CreditCard,
  Server,
  ExternalLink,
  Wallet,
  Plus,
  Minus,
  ArrowUpDown,
  Crown,
  Sparkles,
  Zap
} from "lucide-react";

interface Panel {
  id: string;
  name: string;
  description: string;
  subdomain: string;
  custom_domain?: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  monthly_revenue: number;
  total_orders: number;
  owner_id: string;
  created_at: string;
  commission_rate: number;
  balance: number;
  owner?: {
    email: string;
    full_name: string;
  };
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  description: string;
}

interface Subscription {
  id: string;
  plan_type: 'free' | 'basic' | 'pro';
  status: string;
  price: number;
  started_at: string;
  expires_at: string | null;
}

const PanelManagement = () => {
  const { toast } = useToast();
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [addFundsDialogOpen, setAddFundsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("panels");
  const [view, setView] = useState<'table' | 'kanban'>(() => {
    return (localStorage.getItem('panelManagementView') as 'table' | 'kanban') || 'table';
  });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    commission_rate: 5,
    status: "pending" as Panel['status']
  });
  const [panelStats, setPanelStats] = useState({
    services: 0,
    orders: 0,
    clients: 0
  });
  
  // Add funds state
  const [fundsAmount, setFundsAmount] = useState<number>(0);
  const [fundsType, setFundsType] = useState<'credit' | 'debit'>('credit');
  const [fundsReason, setFundsReason] = useState("");
  const [addingFunds, setAddingFunds] = useState(false);
  
  // Panel finance data
  const [panelTransactions, setPanelTransactions] = useState<Transaction[]>([]);
  const [panelSubscription, setPanelSubscription] = useState<Subscription | null>(null);
  const [loadingFinance, setLoadingFinance] = useState(false);

  useEffect(() => {
    fetchPanels();
  }, []);

  useEffect(() => {
    localStorage.setItem('panelManagementView', view);
  }, [view]);

  const fetchPanels = async () => {
    try {
      const { data: panelsData } = await supabase
        .from('panels')
        .select(`
          *,
          owner:profiles!panels_owner_id_fkey(email, full_name)
        `)
        .order('created_at', { ascending: false });

      setPanels(panelsData || []);
    } catch (error) {
      console.error('Error fetching panels:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load panels"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPanelStats = async (panelId: string) => {
    try {
      const [servicesRes, ordersRes, clientsRes] = await Promise.all([
        supabase.from('services').select('id', { count: 'exact' }).eq('panel_id', panelId),
        supabase.from('orders').select('id', { count: 'exact' }).eq('panel_id', panelId),
        supabase.from('client_users').select('id', { count: 'exact' }).eq('panel_id', panelId)
      ]);
      
      setPanelStats({
        services: servicesRes.count || 0,
        orders: ordersRes.count || 0,
        clients: clientsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching panel stats:', error);
    }
  };

  const fetchPanelFinanceData = async (panelId: string) => {
    setLoadingFinance(true);
    try {
      const [txRes, subRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('panel_id', panelId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('panel_subscriptions')
          .select('*')
          .eq('panel_id', panelId)
          .single()
      ]);

      setPanelTransactions(txRes.data || []);
      setPanelSubscription(subRes.data as Subscription || null);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoadingFinance(false);
    }
  };

  const updatePanelStatus = async (panelId: string, newStatus: 'active' | 'suspended') => {
    try {
      await supabase
        .from('panels')
        .update({ status: newStatus })
        .eq('id', panelId);

      if (newStatus === 'active') {
        await supabase.rpc('approve_panel', { panel_id: panelId });
      }

      fetchPanels();
      toast({
        title: "Status Updated",
        description: `Panel ${newStatus === 'active' ? 'approved' : 'suspended'} successfully`
      });
    } catch (error) {
      console.error('Error updating panel status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update panel status"
      });
    }
  };

  const openEditDialog = (panel: Panel) => {
    setSelectedPanel(panel);
    setEditForm({
      name: panel.name,
      description: panel.description || "",
      commission_rate: panel.commission_rate || 5,
      status: panel.status
    });
    setEditDialogOpen(true);
  };

  const openDetailsDialog = async (panel: Panel) => {
    setSelectedPanel(panel);
    await Promise.all([
      fetchPanelStats(panel.id),
      fetchPanelFinanceData(panel.id)
    ]);
    setDetailsDialogOpen(true);
  };

  const openAddFundsDialog = (panel: Panel) => {
    setSelectedPanel(panel);
    setFundsAmount(0);
    setFundsType('credit');
    setFundsReason('');
    setAddFundsDialogOpen(true);
  };

  const handleAddFunds = async () => {
    if (!selectedPanel || fundsAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount"
      });
      return;
    }

    setAddingFunds(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('admin-panel-ops', {
        body: {
          action: 'add_funds',
          panel_id: selectedPanel.id,
          amount: fundsAmount,
          type: fundsType,
          reason: fundsReason || `Admin ${fundsType} adjustment`
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Funds Updated",
        description: `Successfully ${fundsType}ed $${fundsAmount.toFixed(2)} to ${selectedPanel.name}. New balance: $${response.data.new_balance.toFixed(2)}`
      });
      
      setAddFundsDialogOpen(false);
      fetchPanels();
    } catch (error: any) {
      console.error('Error adding funds:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update funds"
      });
    } finally {
      setAddingFunds(false);
    }
  };

  const handleSavePanel = async () => {
    if (!selectedPanel) return;
    
    try {
      await supabase
        .from('panels')
        .update({
          name: editForm.name,
          description: editForm.description,
          commission_rate: editForm.commission_rate,
          status: editForm.status
        })
        .eq('id', selectedPanel.id);

      toast({
        title: "Panel Updated",
        description: "Panel settings saved successfully"
      });
      setEditDialogOpen(false);
      fetchPanels();
    } catch (error) {
      console.error('Error updating panel:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update panel"
      });
    }
  };

  const filteredPanels = panels.filter(panel => {
    const matchesSearch = panel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (panel.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         panel.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || panel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingPanels = filteredPanels.filter(p => p.status === 'pending');
  const activePanels = filteredPanels.filter(p => p.status === 'active');
  const suspendedPanels = filteredPanels.filter(p => p.status === 'suspended' || p.status === 'rejected');

  const totalPanels = panels.length;
  const totalActivePanels = panels.filter(p => p.status === 'active').length;
  const totalPendingPanels = panels.filter(p => p.status === 'pending').length;
  const totalRevenue = panels.reduce((sum, panel) => sum + (panel.monthly_revenue || 0), 0);
  const totalBalance = panels.reduce((sum, panel) => sum + (panel.balance || 0), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'suspended':
      case 'rejected':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400';
      case 'suspended':
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro': return Crown;
      case 'basic': return Sparkles;
      default: return Zap;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-amber-500/20 text-amber-500';
      case 'basic': return 'bg-blue-500/20 text-blue-500';
      default: return 'bg-slate-500/20 text-slate-500';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderPanelCard = (panel: Panel) => (
    <KanbanCard 
      key={panel.id}
      variant={panel.status === 'active' ? 'success' : panel.status === 'pending' ? 'warning' : 'danger'}
      onClick={() => openDetailsDialog(panel)}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold truncate">{panel.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{panel.owner?.email}</p>
          </div>
          <Badge className={getStatusColor(panel.status)}>
            {getStatusIcon(panel.status)}
            <span className="ml-1 capitalize">{panel.status}</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Globe className="w-3 h-3" />
          <span className="font-mono truncate">{panel.custom_domain || `${panel.subdomain}.smmpilot.online`}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-accent/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Commission</p>
            <p className="font-semibold text-sm">{panel.commission_rate || 5}%</p>
          </div>
          <div className="p-2 bg-accent/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="font-semibold text-sm">${panel.balance?.toFixed(0) || '0'}</p>
          </div>
          <div className="p-2 bg-accent/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="font-semibold text-sm">{panel.total_orders || 0}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(panel.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button onClick={(e) => { e.stopPropagation(); openAddFundsDialog(panel); }} variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-500" title="Add Funds">
              <Wallet className="w-3 h-3" />
            </Button>
            <Button onClick={(e) => { e.stopPropagation(); openEditDialog(panel); }} variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Edit className="w-3 h-3" />
            </Button>
            {panel.status === 'pending' && (
              <Button onClick={(e) => { e.stopPropagation(); updatePanelStatus(panel.id, 'active'); }} variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-500">
                <CheckCircle className="w-3 h-3" />
              </Button>
            )}
            {panel.status === 'active' && (
              <Button onClick={(e) => { e.stopPropagation(); updatePanelStatus(panel.id, 'suspended'); }} variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500">
                <Ban className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </KanbanCard>
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Panel Management</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage all SMM panels on the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden sm:block">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="panels" className="gap-2">
                <Monitor className="w-4 h-4" />
                Panels
              </TabsTrigger>
              <TabsTrigger value="dns" className="gap-2">
                <Server className="w-4 h-4" />
                DNS Setup
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {activeTab === "panels" && <AdminViewToggle view={view} onViewChange={setView} />}
        </div>
      </motion.div>

      {/* Mobile Tab Selector */}
      <div className="sm:hidden">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="panels">Panels</SelectItem>
            <SelectItem value="dns">DNS Setup</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {activeTab === "dns" ? (
        <motion.div variants={itemVariants}>
          <DNSConfigGuide />
        </motion.div>
      ) : (
        <>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6">
        <Card className="glass-card-hover">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{totalPanels}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Total Panels</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-hover">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{totalActivePanels}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Active Panels</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-hover">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">{totalPendingPanels}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-hover">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">${totalRevenue.toFixed(0)}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-hover">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5">
                <Wallet className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">${totalBalance.toFixed(0)}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Total Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search panels by name or subdomain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Content */}
      {loading ? (
        <motion.div variants={itemVariants} className="text-center py-8">
          <Monitor className="w-8 h-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading panels...</p>
        </motion.div>
      ) : view === 'kanban' ? (
        /* Kanban View */
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KanbanColumn
            title="Pending"
            count={pendingPanels.length}
            icon={Clock}
            color="from-amber-500 to-amber-600"
            bgColor="bg-amber-500/10"
            textColor="text-amber-500"
            emptyMessage="No pending panels"
            loading={loading}
          >
            {pendingPanels.map(renderPanelCard)}
          </KanbanColumn>

          <KanbanColumn
            title="Active"
            count={activePanels.length}
            icon={CheckCircle}
            color="from-emerald-500 to-emerald-600"
            bgColor="bg-emerald-500/10"
            textColor="text-emerald-500"
            emptyMessage="No active panels"
            loading={loading}
          >
            {activePanels.map(renderPanelCard)}
          </KanbanColumn>

          <KanbanColumn
            title="Suspended"
            count={suspendedPanels.length}
            icon={XCircle}
            color="from-red-500 to-red-600"
            bgColor="bg-red-500/10"
            textColor="text-red-500"
            emptyMessage="No suspended panels"
            loading={loading}
          >
            {suspendedPanels.map(renderPanelCard)}
          </KanbanColumn>
        </motion.div>
      ) : (
        /* Table View */
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                Panels
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Panel</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPanels.map((panel) => (
                      <TableRow key={panel.id} className="hover:bg-accent/30 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium">{panel.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{panel.subdomain}.smmpilot.online</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{panel.owner?.full_name || 'No Name'}</p>
                            <p className="text-sm text-muted-foreground">{panel.owner?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(panel.status)}>
                            {getStatusIcon(panel.status)}
                            <span className="ml-1 capitalize">{panel.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-emerald-500">${panel.balance?.toFixed(2) || '0.00'}</span>
                        </TableCell>
                        <TableCell><span className="font-medium">{panel.commission_rate || 5}%</span></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">${panel.monthly_revenue?.toFixed(2) || '0.00'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button onClick={() => openAddFundsDialog(panel)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500" title="Add Funds"><Wallet className="w-4 h-4" /></Button>
                            <Button onClick={() => openDetailsDialog(panel)} variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details"><Eye className="w-4 h-4" /></Button>
                            <Button onClick={() => openEditDialog(panel)} variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit Panel"><Edit className="w-4 h-4" /></Button>
                            {panel.status === 'pending' && (
                              <Button onClick={() => updatePanelStatus(panel.id, 'active')} variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600" title="Approve"><CheckCircle className="w-4 h-4" /></Button>
                            )}
                            {panel.status === 'active' && (
                              <Button onClick={() => updatePanelStatus(panel.id, 'suspended')} variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" title="Suspend"><Ban className="w-4 h-4" /></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredPanels.map((panel) => (
                  <div key={panel.id} className="p-4 rounded-xl border border-border bg-accent/30 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{panel.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{panel.owner?.email}</p>
                      </div>
                      <Badge className={`shrink-0 ${getStatusColor(panel.status)}`}>
                        {getStatusIcon(panel.status)}
                        <span className="ml-1 capitalize">{panel.status}</span>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="font-medium text-emerald-500">${panel.balance?.toFixed(0) || '0'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Commission</p>
                        <p className="font-medium">{panel.commission_rate || 5}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="font-medium">${panel.monthly_revenue?.toFixed(0) || '0'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />{new Date(panel.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button onClick={() => openAddFundsDialog(panel)} variant="ghost" size="sm" className="h-8 w-8 p-0 text-emerald-500"><Wallet className="w-4 h-4" /></Button>
                        <Button onClick={() => openDetailsDialog(panel)} variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="w-4 h-4" /></Button>
                        <Button onClick={() => openEditDialog(panel)} variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPanels.length === 0 && (
                <div className="text-center py-12">
                  <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No panels found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
      </>
      )}

      {/* Add Funds Dialog */}
      <Dialog open={addFundsDialogOpen} onOpenChange={setAddFundsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              Add/Remove Funds
            </DialogTitle>
            <DialogDescription>
              Adjust balance for {selectedPanel?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-accent/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-3xl font-bold text-emerald-500">${selectedPanel?.balance?.toFixed(2) || '0.00'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={fundsType === 'credit' ? 'default' : 'outline'}
                onClick={() => setFundsType('credit')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Credit
              </Button>
              <Button
                variant={fundsType === 'debit' ? 'default' : 'outline'}
                onClick={() => setFundsType('debit')}
                className="gap-2"
              >
                <Minus className="w-4 h-4" />
                Debit
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={fundsAmount}
                onChange={(e) => setFundsAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={fundsReason}
                onChange={(e) => setFundsReason(e.target.value)}
                placeholder="e.g., Promotional credit, Refund, etc."
                rows={2}
              />
            </div>

            {fundsAmount > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  <span className="text-muted-foreground">New Balance: </span>
                  <span className="font-bold text-emerald-500">
                    ${((selectedPanel?.balance || 0) + (fundsType === 'credit' ? fundsAmount : -fundsAmount)).toFixed(2)}
                  </span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFundsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFunds} disabled={addingFunds || fundsAmount <= 0} className="gap-2">
              {addingFunds ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {fundsType === 'credit' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  {fundsType === 'credit' ? 'Add Funds' : 'Remove Funds'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Panel Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Panel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Panel Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission">Commission Rate (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  value={editForm.commission_rate}
                  onChange={(e) => setEditForm({ ...editForm, commission_rate: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: Panel['status']) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePanel}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Panel Details Dialog with Finance & Subscription Tabs */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPanel?.name}
              <Badge className={getStatusColor(selectedPanel?.status || '')}>
                {selectedPanel?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedPanel && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="owner">Owner</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="glass-card-hover">
                    <CardContent className="p-4 text-center">
                      <Package className="w-6 h-6 mx-auto text-primary mb-2" />
                      <p className="text-xl font-bold">{panelStats.services}</p>
                      <p className="text-xs text-muted-foreground">Services</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card-hover">
                    <CardContent className="p-4 text-center">
                      <Activity className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                      <p className="text-xl font-bold">{panelStats.orders}</p>
                      <p className="text-xs text-muted-foreground">Orders</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card-hover">
                    <CardContent className="p-4 text-center">
                      <Users className="w-6 h-6 mx-auto text-violet-500 mb-2" />
                      <p className="text-xl font-bold">{panelStats.clients}</p>
                      <p className="text-xs text-muted-foreground">Clients</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card-hover">
                    <CardContent className="p-4 text-center">
                      <DollarSign className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
                      <p className="text-xl font-bold">${selectedPanel.monthly_revenue?.toFixed(0) || '0'}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Domain</p>
                    <p className="font-mono text-sm">{selectedPanel.custom_domain || `${selectedPanel.subdomain}.smmpilot.online`}</p>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Commission Rate</p>
                    <p className="font-medium">{selectedPanel.commission_rate || 5}%</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="finance" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="glass-card-hover bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                          <p className="text-3xl font-bold text-emerald-500">${selectedPanel.balance?.toFixed(2) || '0.00'}</p>
                        </div>
                        <Wallet className="w-10 h-10 text-emerald-500" />
                      </div>
                      <Button onClick={() => { setDetailsDialogOpen(false); openAddFundsDialog(selectedPanel); }} className="w-full mt-4 gap-2">
                        <ArrowUpDown className="w-4 h-4" />
                        Adjust Balance
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="glass-card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                          <p className="text-3xl font-bold">${selectedPanel.monthly_revenue?.toFixed(2) || '0.00'}</p>
                        </div>
                        <TrendingUp className="w-10 h-10 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingFinance ? (
                      <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : panelTransactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
                    ) : (
                      <div className="space-y-2">
                        {panelTransactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                            <div>
                              <p className="font-medium capitalize">{tx.type.replace('_', ' ')}</p>
                              <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)}
                              </p>
                              <Badge variant="outline" className="text-xs">{tx.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription" className="space-y-4 mt-4">
                {panelSubscription ? (
                  <>
                    <Card className="glass-card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const PlanIcon = getPlanIcon(panelSubscription.plan_type);
                              return (
                                <div className={`p-3 rounded-xl ${getPlanColor(panelSubscription.plan_type).split(' ')[0]}`}>
                                  <PlanIcon className="w-6 h-6" />
                                </div>
                              );
                            })()}
                            <div>
                              <p className="text-lg font-bold capitalize">{panelSubscription.plan_type} Plan</p>
                              <p className="text-sm text-muted-foreground">${panelSubscription.price}/month</p>
                            </div>
                          </div>
                          <Badge className={panelSubscription.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}>
                            {panelSubscription.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Started</p>
                            <p className="font-medium">{new Date(panelSubscription.started_at).toLocaleDateString()}</p>
                          </div>
                          <div className="p-3 bg-accent/50 rounded-lg">
                            <p className="text-xs text-muted-foreground">Expires</p>
                            <p className="font-medium">{panelSubscription.expires_at ? new Date(panelSubscription.expires_at).toLocaleDateString() : 'Never'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-3 gap-3">
                        <Button variant="outline" className="gap-2" onClick={() => {
                          toast({ title: "Coming Soon", description: "Plan change will be available shortly" });
                        }}>
                          <ArrowUpDown className="w-4 h-4" />
                          Change Plan
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={() => {
                          toast({ title: "Coming Soon", description: "Extension will be available shortly" });
                        }}>
                          <Calendar className="w-4 h-4" />
                          Extend
                        </Button>
                        <Button variant="outline" className="gap-2 text-red-500 hover:text-red-600" onClick={() => {
                          toast({ title: "Coming Soon", description: "Cancellation will be available shortly" });
                        }}>
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Subscription</h3>
                    <p className="text-muted-foreground">This panel doesn't have an active subscription</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="owner" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedPanel.owner?.full_name || 'No Name'}</p>
                      <p className="text-sm text-muted-foreground">{selectedPanel.owner?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-accent/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Owner ID</p>
                      <p className="font-mono text-xs">{selectedPanel.owner_id}</p>
                    </div>
                    <div className="p-4 bg-accent/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Panel Created</p>
                      <p className="font-medium">
                        {new Date(selectedPanel.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PanelManagement;
