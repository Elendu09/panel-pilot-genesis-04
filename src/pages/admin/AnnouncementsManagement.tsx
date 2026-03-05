import { useState, useEffect } from "react";
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
  Trash2,
  Send,
  Loader2
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  created_by?: string;
}

const AnnouncementsManagement = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    target: 'all' as 'all' | 'panel_owners' | 'specific'
  });

  useEffect(() => {
    fetchAnnouncements();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements((data || []) as Announcement[]);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({ title: "Error loading announcements", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!form.title || !form.content) return;

    setSaving(true);
    try {
      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update({
            title: form.title,
            content: form.content,
            target: form.target
          })
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        toast({ title: "Announcement Updated" });
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        const { error } = await supabase
          .from('announcements')
          .insert({
            title: form.title,
            content: form.content,
            target: form.target,
            status: 'draft',
            created_by: profile?.id
          });

        if (error) throw error;
        toast({ title: "Announcement Created" });
      }
      setDialogOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({ title: "Error saving announcement", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const publishAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ 
          status: 'active', 
          published_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Announcement Published" });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error publishing announcement:', error);
      toast({ title: "Error publishing announcement", variant: "destructive" });
    }
  };

  const archiveAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Announcement Archived" });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error archiving announcement:', error);
      toast({ title: "Error archiving announcement", variant: "destructive" });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Announcement Deleted" });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({ title: "Error deleting announcement", variant: "destructive" });
    }
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
      className="space-y-4 md:space-y-6"
    >
      <Helmet>
        <title>Announcements - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Announcements</h1>
          <p className="text-sm text-muted-foreground">Create and manage platform-wide announcements</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          New Announcement
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="glass-card-hover">
          <CardContent className="p-3 md:p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Megaphone className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{announcements.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        {kanbanColumns.map(col => (
          <Card key={col.status} className="glass-card-hover">
            <CardContent className="p-3 md:p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${col.bg}`}>
                <col.icon className={`w-4 h-4 md:w-5 md:h-5 ${col.textColor}`} />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold">
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
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
              loading={loading}
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
                        <p className="font-semibold line-clamp-2 text-sm md:text-base">{announcement.title}</p>
                        <Badge variant="outline" className={`${targetInfo.color} text-xs shrink-0`}>
                          <Users className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">{targetInfo.label}</span>
                        </Badge>
                      </div>

                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                        {announcement.content}
                      </p>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border invisible group-hover:visible transition-[visibility]">
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
                          className="h-8 w-8 p-0 text-destructive"
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
        <DialogContent className="max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingAnnouncement ? 'Save Changes' : 'Create Draft'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AnnouncementsManagement;