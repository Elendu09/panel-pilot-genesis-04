import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Search,
  User,
  Calendar,
  Shield,
  Activity,
  RefreshCw,
  Filter,
  Clock,
  Plus,
  Trash2,
  Key
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import AdminViewToggle from "@/components/admin/AdminViewToggle";
import KanbanColumn from "@/components/admin/KanbanColumn";
import KanbanCard from "@/components/admin/KanbanCard";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [view, setView] = useState<'table' | 'kanban'>(() => {
    return (localStorage.getItem('auditLogsView') as 'table' | 'kanban') || 'table';
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    localStorage.setItem('auditLogsView', view);
  }, [view]);

  const fetchLogs = async () => {
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setLogs((data || []) as unknown as AuditLog[]);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-emerald-500/20 text-emerald-500',
      update: 'bg-blue-500/20 text-blue-500',
      delete: 'bg-red-500/20 text-red-500',
      login: 'bg-violet-500/20 text-violet-500',
      role_change: 'bg-amber-500/20 text-amber-500'
    };
    return colors[action.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return Plus;
      case 'update':
        return RefreshCw;
      case 'delete':
        return Trash2;
      case 'login':
        return Key;
      case 'role_change':
        return Shield;
      default:
        return Activity;
    }
  };

  const getResourceIcon = (type: string) => {
    const icons: Record<string, any> = {
      user: User,
      panel: Activity,
      provider: Shield
    };
    return icons[type?.toLowerCase()] || FileText;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase() === actionFilter;
    return matchesSearch && matchesAction;
  });

  const createLogs = filteredLogs.filter(l => l.action.toLowerCase() === 'create');
  const updateLogs = filteredLogs.filter(l => l.action.toLowerCase() === 'update');
  const deleteLogs = filteredLogs.filter(l => l.action.toLowerCase() === 'delete');
  const authLogs = filteredLogs.filter(l => ['login', 'role_change'].includes(l.action.toLowerCase()));

  const uniqueActions = [...new Set(logs.map(l => l.action.toLowerCase()))];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const renderLogCard = (log: AuditLog) => {
    const ActionIcon = getActionIcon(log.action);
    const ResourceIcon = getResourceIcon(log.resource_type);
    
    return (
      <KanbanCard 
        key={log.id}
        variant={log.action === 'create' ? 'success' : log.action === 'delete' ? 'danger' : log.action === 'update' ? 'info' : 'warning'}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", getActionColor(log.action).replace('text-', 'bg-').split(' ')[0])}>
              <ActionIcon className="w-3 h-3" />
            </div>
            <Badge className={cn("text-xs capitalize", getActionColor(log.action))}>
              {log.action.replace('_', ' ')}
            </Badge>
            {log.resource_type && (
              <Badge variant="outline" className="text-xs capitalize">
                {log.resource_type}
              </Badge>
            )}
          </div>
          
          {log.user && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium">{(log.user.full_name || log.user.email).charAt(0).toUpperCase()}</span>
              </div>
              <span className="truncate text-muted-foreground">
                {log.user.full_name || log.user.email}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {new Date(log.created_at).toLocaleString()}
          </div>

          {log.details && Object.keys(log.details).length > 0 && (
            <div className="text-xs bg-accent/50 rounded-lg p-2 font-mono overflow-x-auto max-h-20">
              {JSON.stringify(log.details, null, 2)}
            </div>
          )}
        </div>
      </KanbanCard>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Helmet>
        <title>Audit Logs - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all system activities and changes</p>
        </div>
        <div className="flex items-center gap-3">
          <AdminViewToggle view={view} onViewChange={setView} />
          <Button onClick={fetchLogs} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.length}</p>
              <p className="text-xs text-muted-foreground">Total Logs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
              <Plus className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.filter(l => l.action === 'create').length}</p>
              <p className="text-xs text-muted-foreground">Create Actions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
              <RefreshCw className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.filter(l => l.action === 'update').length}</p>
              <p className="text-xs text-muted-foreground">Update Actions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{logs.filter(l => l.action === 'role_change').length}</p>
              <p className="text-xs text-muted-foreground">Role Changes</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map(action => (
              <SelectItem key={action} value={action} className="capitalize">{action}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Content */}
      {loading ? (
        <motion.div variants={itemVariants} className="text-center py-8">
          <FileText className="w-8 h-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading logs...</p>
        </motion.div>
      ) : view === 'kanban' ? (
        /* Kanban View */
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KanbanColumn
            title="Create"
            count={createLogs.length}
            icon={Plus}
            color="from-emerald-500 to-emerald-600"
            bgColor="bg-emerald-500/10"
            textColor="text-emerald-500"
            emptyMessage="No create actions"
            loading={loading}
          >
            {createLogs.slice(0, 10).map(renderLogCard)}
          </KanbanColumn>

          <KanbanColumn
            title="Update"
            count={updateLogs.length}
            icon={RefreshCw}
            color="from-blue-500 to-blue-600"
            bgColor="bg-blue-500/10"
            textColor="text-blue-500"
            emptyMessage="No update actions"
            loading={loading}
          >
            {updateLogs.slice(0, 10).map(renderLogCard)}
          </KanbanColumn>

          <KanbanColumn
            title="Delete"
            count={deleteLogs.length}
            icon={Trash2}
            color="from-red-500 to-red-600"
            bgColor="bg-red-500/10"
            textColor="text-red-500"
            emptyMessage="No delete actions"
            loading={loading}
          >
            {deleteLogs.slice(0, 10).map(renderLogCard)}
          </KanbanColumn>

          <KanbanColumn
            title="Auth & Roles"
            count={authLogs.length}
            icon={Shield}
            color="from-amber-500 to-amber-600"
            bgColor="bg-amber-500/10"
            textColor="text-amber-500"
            emptyMessage="No auth actions"
            loading={loading}
          >
            {authLogs.slice(0, 10).map(renderLogCard)}
          </KanbanColumn>
        </motion.div>
      ) : (
        /* Timeline View */
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No logs found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log, index) => {
                    const ResourceIcon = getResourceIcon(log.resource_type);
                    const ActionIcon = getActionIcon(log.action);
                    
                    return (
                      <motion.div
                        key={log.id}
                        variants={itemVariants}
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/30 transition-colors group border border-transparent hover:border-border"
                      >
                        {/* Timeline indicator */}
                        <div className="relative flex flex-col items-center">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getActionColor(log.action).replace('text-', 'bg-').split(' ')[0])}>
                            <ActionIcon className="w-5 h-5" />
                          </div>
                          {index < filteredLogs.length - 1 && (
                            <div className="w-0.5 h-full bg-border absolute top-12" />
                          )}
                        </div>

                        {/* Log content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <Badge className={cn("text-xs capitalize", getActionColor(log.action))}>
                              {log.action.replace('_', ' ')}
                            </Badge>
                            {log.resource_type && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {log.resource_type}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {log.user && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">
                                  {log.user.full_name || log.user.email}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                          </div>
                          
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="mt-2 text-xs bg-accent/50 rounded-lg p-2 font-mono overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AuditLogs;
