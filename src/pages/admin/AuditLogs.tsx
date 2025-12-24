import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  FileText, 
  Search,
  User,
  Calendar as CalendarIcon,
  Shield,
  Activity,
  RefreshCw,
  Filter,
  Clock,
  Plus,
  Trash2,
  Key,
  Download,
  X,
  ChevronDown,
  Eye
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import AdminViewToggle from "@/components/admin/AdminViewToggle";
import KanbanColumn from "@/components/admin/KanbanColumn";
import KanbanCard from "@/components/admin/KanbanCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  created_at: string;
  user_id?: string;
  user?: {
    email: string;
    full_name: string;
  };
}

type DatePreset = 'today' | '7days' | '30days' | 'custom' | 'all';

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [datePreset, setDatePreset] = useState<DatePreset>('7days');
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'table' | 'kanban'>(() => {
    return (localStorage.getItem('auditLogsView') as 'table' | 'kanban') || 'table';
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    localStorage.setItem('auditLogsView', view);
  }, [view]);

  useEffect(() => {
    // Update dates based on preset
    const now = new Date();
    switch (datePreset) {
      case 'today':
        setStartDate(startOfDay(now));
        setEndDate(endOfDay(now));
        break;
      case '7days':
        setStartDate(subDays(now, 7));
        setEndDate(now);
        break;
      case '30days':
        setStartDate(subDays(now, 30));
        setEndDate(now);
        break;
      case 'all':
        setStartDate(undefined);
        setEndDate(undefined);
        break;
      // 'custom' keeps the manual dates
    }
  }, [datePreset]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

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
      case 'create': return Plus;
      case 'update': return RefreshCw;
      case 'delete': return Trash2;
      case 'login': return Key;
      case 'role_change': return Shield;
      default: return Activity;
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

  // Apply all filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase() === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource_type?.toLowerCase() === resourceFilter;
    
    // Date filtering
    let matchesDate = true;
    if (startDate || endDate) {
      const logDate = new Date(log.created_at);
      if (startDate && endDate) {
        matchesDate = isWithinInterval(logDate, { start: startOfDay(startDate), end: endOfDay(endDate) });
      } else if (startDate) {
        matchesDate = logDate >= startOfDay(startDate);
      } else if (endDate) {
        matchesDate = logDate <= endOfDay(endDate);
      }
    }
    
    return matchesSearch && matchesAction && matchesResource && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const createLogs = filteredLogs.filter(l => l.action.toLowerCase() === 'create');
  const updateLogs = filteredLogs.filter(l => l.action.toLowerCase() === 'update');
  const deleteLogs = filteredLogs.filter(l => l.action.toLowerCase() === 'delete');
  const authLogs = filteredLogs.filter(l => ['login', 'role_change'].includes(l.action.toLowerCase()));

  const uniqueActions = [...new Set(logs.map(l => l.action.toLowerCase()))];
  const uniqueResources = [...new Set(logs.map(l => l.resource_type?.toLowerCase()).filter(Boolean))];

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Action', 'Resource Type', 'Resource ID', 'User', 'Date', 'Details'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.action,
      log.resource_type || '',
      log.resource_id || '',
      log.user?.email || log.user_id || '',
      new Date(log.created_at).toISOString(),
      JSON.stringify(log.details || {})
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setResourceFilter('all');
    setDatePreset('7days');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || actionFilter !== 'all' || resourceFilter !== 'all' || datePreset !== '7days';

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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon className="w-3 h-3" />
              {format(new Date(log.created_at), 'MMM d, HH:mm')}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => {
                setSelectedLog(log);
                setDetailsOpen(true);
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
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
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
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
              <p className="text-2xl font-bold">{filteredLogs.length}</p>
              <p className="text-xs text-muted-foreground">Filtered Logs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
              <Plus className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{createLogs.length}</p>
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
              <p className="text-2xl font-bold">{updateLogs.length}</p>
              <p className="text-xs text-muted-foreground">Update Actions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{deleteLogs.length}</p>
              <p className="text-xs text-muted-foreground">Delete Actions</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Filters */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, resource, user..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>

          {/* Action Filter */}
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full lg:w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action} className="capitalize">{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Resource Filter */}
          <Select value={resourceFilter} onValueChange={(v) => { setResourceFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full lg:w-[160px]">
              <Activity className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              {uniqueResources.map(resource => (
                <SelectItem key={resource} value={resource} className="capitalize">{resource}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Preset */}
          <Select value={datePreset} onValueChange={(v) => { setDatePreset(v as DatePreset); setCurrentPage(1); }}>
            <SelectTrigger className="w-full lg:w-[160px]">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {datePreset === 'custom' && (
          <div className="flex flex-wrap gap-4 items-center p-4 rounded-lg bg-muted/30 border border-border/50">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => { setStartDate(d); setCurrentPage(1); }}
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">to</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => { setEndDate(d); setCurrentPage(1); }}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Clear all filters
          </Button>
        )}
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
            {createLogs.slice(0, 15).map(renderLogCard)}
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
            {updateLogs.slice(0, 15).map(renderLogCard)}
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
            {deleteLogs.slice(0, 15).map(renderLogCard)}
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
            {authLogs.slice(0, 15).map(renderLogCard)}
          </KanbanColumn>
        </motion.div>
      ) : (
        /* Timeline View */
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Activity Timeline
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} ({filteredLogs.length} logs)
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {paginatedLogs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No logs found matching your filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paginatedLogs.map((log, index) => {
                    const ActionIcon = getActionIcon(log.action);
                    
                    return (
                      <motion.div
                        key={log.id}
                        variants={itemVariants}
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/30 transition-colors group border border-transparent hover:border-border cursor-pointer"
                        onClick={() => {
                          setSelectedLog(log);
                          setDetailsOpen(true);
                        }}
                      >
                        {/* Timeline indicator */}
                        <div className="relative flex flex-col items-center">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getActionColor(log.action).replace('text-', 'bg-').split(' ')[0])}>
                            <ActionIcon className="w-5 h-5" />
                          </div>
                          {index < paginatedLogs.length - 1 && (
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
                            {log.resource_id && (
                              <span className="text-xs text-muted-foreground font-mono">
                                #{log.resource_id.slice(0, 8)}
                              </span>
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
                              <CalendarIcon className="w-3 h-3" />
                              {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                            </div>
                          </div>
                        </div>

                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-6 border-t border-border/50 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPages) return null;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Log Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Action</p>
                  <Badge className={cn("capitalize", getActionColor(selectedLog.action))}>
                    {selectedLog.action.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Resource Type</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedLog.resource_type || 'N/A'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Resource ID</p>
                <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                  {selectedLog.resource_id || 'N/A'}
                </code>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                <p className="text-sm">{format(new Date(selectedLog.created_at), 'PPpp')}</p>
              </div>

              {selectedLog.user && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">User</p>
                  <p className="text-sm">{selectedLog.user.full_name || selectedLog.user.email}</p>
                </div>
              )}

              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Details</p>
                  <pre className="text-xs bg-muted rounded-lg p-3 overflow-x-auto max-h-[200px]">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AuditLogs;
