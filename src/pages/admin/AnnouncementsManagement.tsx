import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Megaphone, 
  FileEdit, 
  CheckCircle, 
  Archive,
  Search,
  Plus,
  Calendar,
  Users,
  Eye,
  Trash2,
  Send
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import KanbanColumn from "@/components/admin/KanbanColumn";
import KanbanCard from "@/components/admin/KanbanCard";

interface Announcement {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'active' | 'archived';
  target: 'all' | 'panel_owners' | 'specific';
  created_at: string;
  published_at?: string;
}

const AnnouncementsManagement = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Platform Maintenance Scheduled',
      content: 'We will be performing maintenance on March 15th from 2-4 AM UTC.',
      status: 'active',
      target: 'all',
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'New Instagram Services Available',
      content: 'Check out our new Instagram reels services with faster delivery!',
      status: 'draft',
      target: 'panel_owners',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Black Friday Sale',
      content: '50% off all services this weekend!',
      status: 'archived',
      target: 'all',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString()
    }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    target: 'all' as 'all' | 'panel_owners' | 'specific'
  });

  const kanbanColumns = [
    { 
      title: 'Draft', 
      status: 'draft' as const, 
      icon: FileEdit, 
      color: 'from-slate-500 to-slate-600',
      bg: 'bg-slate-500/10',
      textColor: 'text-slate-500'
    },
    { 
      title: 'Active', 
      status: 'active' as const, 
      icon: CheckCircle, 
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-500'
    },
    { 
      title: 'Archived', 
      status: 'archived' as const, 
      icon: Archive, 
      color: 'from-gray-500 to-gray-600',
      bg: 'bg-gray-500/10',
      textColor: 'text-gray-500'
    }
  ];

  const getTargetBadge = (target: string) => {
    const colors: Record<string, string> = {
      all: 'bg-blue-500/10 text-blue-500',
      panel_owners: 'bg-violet-500/10 text-violet-500',
      specific: 'bg-amber-500/10 text-amber-500'
    };
    const labels: Record<string, string> = {
      all: 'All Users',
      panel_owners: 'Panel Owners',
      specific: 'Specific Panels'
    };
    return { color: colors[target], label: labels[target] };
  };

  const openCreateDialog = () => {
    setEditingAnnouncement(null);
    setForm({ title: '', content: '', target: 'all' });
    setDialogOpen(true);
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setForm({
      title: announcement.title,
      content: announcement.content,
      target: announcement.target
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title || !form.content) return;

    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(a => 
        a.id === editingAnnouncement.id 
          ? { ...a, ...form }
          : a
      ));
      toast({ title: "Announcement Updated" });
    } else {
      const newAnnouncement: Announcement = {
        id: crypto.randomUUID(),
        ...form,
        status: 'draft',
        created_at: new Date().toISOString()
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast({ title: "Announcement Created" });
    }
    setDialogOpen(false);
  };

  const publishAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => 
      a.id === id 
        ? { ...a, status: 'active' as const, published_at: new Date().toISOString() }
        : a
    ));
    toast({ title: "Announcement Published" });
  };

  const archiveAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'archived' as const } : a
    ));
    toast({ title: "Announcement Archived" });
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast({ title: "Announcement Deleted" });
  };

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <title>Announcements - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Create and manage platform-wide announcements</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{announcements.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        {kanbanColumns.map(col => (
          <Card key={col.status} className="glass-card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${col.bg}`}>
                <col.icon className={`w-5 h-5 ${col.textColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {announcements.filter(a => a.status === col.status).length}
                </p>
                <p className="text-xs text-muted-foreground">{col.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Kanban Board */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {kanbanColumns.map((column) => {
          const columnItems = filteredAnnouncements.filter(a => a.status === column.status);
          
          return (
            <KanbanColumn
              key={column.status}
              title={column.title}
              count={columnItems.length}
              icon={column.icon}
              color={column.color}
              bgColor={column.bg}
              textColor={column.textColor}
              emptyMessage={`No ${column.title.toLowerCase()} announcements`}
            >
              {columnItems.map((announcement) => {
                const targetInfo = getTargetBadge(announcement.target);
                return (
                  <KanbanCard
                    key={announcement.id}
                    onClick={() => openEditDialog(announcement)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold line-clamp-2">{announcement.title}</p>
                        <Badge variant="outline" className={targetInfo.color}>
                          <Users className="w-3 h-3 mr-1" />
                          {targetInfo.label}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {announcement.content}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                        {announcement.status === 'draft' && (
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              publishAnnouncement(announcement.id);
                            }}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Publish
                          </Button>
                        )}
                        {announcement.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveAnnouncement(announcement.id);
                            }}
                          >
                            <Archive className="w-3 h-3 mr-1" />
                            Archive
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAnnouncement(announcement.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </KanbanCard>
                );
              })}
            </KanbanColumn>
          );
        })}
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Announcement title"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Announcement content..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select 
                value={form.target} 
                onValueChange={(value: 'all' | 'panel_owners' | 'specific') => setForm(prev => ({ ...prev, target: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="panel_owners">Panel Owners Only</SelectItem>
                  <SelectItem value="specific">Specific Panels</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingAnnouncement ? 'Save Changes' : 'Create Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AnnouncementsManagement;
