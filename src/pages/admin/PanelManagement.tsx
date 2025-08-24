import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Monitor, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Users,
  Globe,
  Search,
  Eye,
  Edit,
  Ban,
  Calendar,
  TrendingUp,
  Activity
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
  owner?: {
    email: string;
    full_name: string;
  };
}

const PanelManagement = () => {
  const { toast } = useToast();
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);

  useEffect(() => {
    fetchPanels();
  }, []);

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

  const updatePanelStatus = async (panelId: string, newStatus: 'active' | 'suspended') => {
    try {
      await supabase
        .from('panels')
        .update({ status: newStatus })
        .eq('id', panelId);

      // If approving, also call the approve_panel function
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

  const filteredPanels = panels.filter(panel => {
    const matchesSearch = panel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (panel.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         panel.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || panel.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPanels = panels.length;
  const activePanels = panels.filter(p => p.status === 'active').length;
  const pendingPanels = panels.filter(p => p.status === 'pending').length;
  const totalRevenue = panels.reduce((sum, panel) => sum + (panel.monthly_revenue || 0), 0);

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
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'suspended':
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel Management</h1>
          <p className="text-muted-foreground">Monitor and manage all SMM panels on the platform</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Panels</p>
                <p className="text-2xl font-bold text-primary">{totalPanels}</p>
              </div>
              <Monitor className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Panels</p>
                <p className="text-2xl font-bold text-primary">{activePanels}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold text-primary">{pendingPanels}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panels Table */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle>Panels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Monitor className="w-8 h-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading panels...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Panel</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPanels.map((panel) => (
                  <TableRow key={panel.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{panel.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {panel.description || 'No description'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{panel.owner?.full_name || 'No Name'}</p>
                        <p className="text-sm text-muted-foreground">{panel.owner?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-mono">
                          {panel.custom_domain || `${panel.subdomain}.smmpilot.online`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(panel.status)}>
                        {getStatusIcon(panel.status)}
                        <span className="ml-1 capitalize">{panel.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">{panel.total_orders || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">${panel.monthly_revenue?.toFixed(2) || '0.00'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(panel.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => setSelectedPanel(panel)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {panel.status === 'pending' && (
                          <Button
                            onClick={() => updatePanelStatus(panel.id, 'active')}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {panel.status === 'active' && (
                          <Button
                            onClick={() => updatePanelStatus(panel.id, 'suspended')}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredPanels.length === 0 && (
            <div className="text-center py-12">
              <Monitor className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No panels found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PanelManagement;