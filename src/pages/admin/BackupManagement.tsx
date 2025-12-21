import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  RotateCcw,
  Plus,
  Calendar,
  HardDrive,
  Shield,
  Loader2,
  Play
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import KanbanColumn from "@/components/admin/KanbanColumn";
import KanbanCard from "@/components/admin/KanbanCard";

interface Backup {
  id: string;
  name: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
  type: 'manual' | 'scheduled';
  size?: string;
  created_at: string;
  completed_at?: string;
}

const BackupManagement = () => {
  const { toast } = useToast();
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: '1',
      name: 'Daily Backup - Dec 20',
      status: 'completed',
      type: 'scheduled',
      size: '2.4 GB',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Manual Backup',
      status: 'in_progress',
      type: 'manual',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Scheduled Backup',
      status: 'scheduled',
      type: 'scheduled',
      created_at: new Date(Date.now() + 86400000).toISOString()
    },
    {
      id: '4',
      name: 'Weekly Backup - Failed',
      status: 'failed',
      type: 'scheduled',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]);
  const [creating, setCreating] = useState(false);

  const kanbanColumns = [
    { 
      title: 'Scheduled', 
      status: 'scheduled' as const, 
      icon: Clock, 
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
      textColor: 'text-blue-500'
    },
    { 
      title: 'In Progress', 
      status: 'in_progress' as const, 
      icon: Play, 
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
      textColor: 'text-amber-500'
    },
    { 
      title: 'Completed', 
      status: 'completed' as const, 
      icon: CheckCircle, 
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-500'
    },
    { 
      title: 'Failed', 
      status: 'failed' as const, 
      icon: XCircle, 
      color: 'from-red-500 to-red-600',
      bg: 'bg-red-500/10',
      textColor: 'text-red-500'
    }
  ];

  const createBackup = async () => {
    setCreating(true);
    
    const newBackup: Backup = {
      id: crypto.randomUUID(),
      name: `Manual Backup - ${new Date().toLocaleString()}`,
      status: 'in_progress',
      type: 'manual',
      created_at: new Date().toISOString()
    };

    setBackups(prev => [newBackup, ...prev]);

    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000));

    setBackups(prev => prev.map(b => 
      b.id === newBackup.id 
        ? { ...b, status: 'completed' as const, size: '2.1 GB', completed_at: new Date().toISOString() }
        : b
    ));

    setCreating(false);
    toast({ title: "Backup Created", description: "Manual backup completed successfully" });
  };

  const restoreBackup = (backup: Backup) => {
    toast({ 
      title: "Restore Initiated", 
      description: `Restoring from ${backup.name}. This may take several minutes.`
    });
  };

  const downloadBackup = (backup: Backup) => {
    toast({ title: "Download Started", description: `Downloading ${backup.name}` });
  };

  const retryBackup = (backup: Backup) => {
    setBackups(prev => prev.map(b => 
      b.id === backup.id ? { ...b, status: 'in_progress' as const } : b
    ));
    
    setTimeout(() => {
      setBackups(prev => prev.map(b => 
        b.id === backup.id 
          ? { ...b, status: 'completed' as const, size: '2.0 GB', completed_at: new Date().toISOString() }
          : b
      ));
      toast({ title: "Backup Completed", description: "Retry successful" });
    }, 2000);
  };

  const stats = {
    total: backups.length,
    completed: backups.filter(b => b.status === 'completed').length,
    totalSize: backups.filter(b => b.size).reduce((acc, b) => {
      const size = parseFloat(b.size?.replace(' GB', '') || '0');
      return acc + size;
    }, 0)
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
        <title>Backup Management - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Backup Management</h1>
          <p className="text-muted-foreground">Manage database backups and restore points</p>
        </div>
        <Button onClick={createBackup} disabled={creating} className="gap-2">
          {creating ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Creating...</>
          ) : (
            <><Plus className="w-4 h-4" />Create Backup</>
          )}
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Backups</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <HardDrive className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalSize.toFixed(1)} GB</p>
              <p className="text-xs text-muted-foreground">Total Size</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Shield className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">Enabled</p>
              <p className="text-xs text-muted-foreground">Auto Backup</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Kanban Board */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kanbanColumns.map((column) => {
          const columnBackups = backups.filter(b => b.status === column.status);
          
          return (
            <KanbanColumn
              key={column.status}
              title={column.title}
              count={columnBackups.length}
              icon={column.icon}
              color={column.color}
              bgColor={column.bg}
              textColor={column.textColor}
              emptyMessage={`No ${column.title.toLowerCase()} backups`}
            >
              {columnBackups.map((backup) => (
                <KanbanCard
                  key={backup.id}
                  variant={
                    backup.status === 'completed' ? 'success' : 
                    backup.status === 'failed' ? 'danger' :
                    backup.status === 'in_progress' ? 'warning' : 'info'
                  }
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm line-clamp-2">{backup.name}</p>
                      <Badge variant="outline" className={backup.type === 'manual' ? 'bg-violet-500/10 text-violet-500' : 'bg-blue-500/10 text-blue-500'}>
                        {backup.type}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(backup.created_at).toLocaleString()}
                      </div>
                      {backup.size && (
                        <div className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {backup.size}
                        </div>
                      )}
                    </div>

                    {backup.status === 'in_progress' && (
                      <div className="flex items-center gap-2 text-amber-500 text-xs">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Backup in progress...
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                      {backup.status === 'completed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadBackup(backup);
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreBackup(backup);
                            }}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restore
                          </Button>
                        </>
                      )}
                      {backup.status === 'failed' && (
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            retryBackup(backup);
                          }}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      )}
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

export default BackupManagement;
