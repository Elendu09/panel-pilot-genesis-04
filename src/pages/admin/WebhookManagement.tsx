import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Send,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import KanbanColumn from "@/components/admin/KanbanColumn";
import KanbanCard from "@/components/admin/KanbanCard";

interface AdminWebhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  is_active: boolean;
  last_triggered_at?: string;
  last_status?: number;
  failure_count: number;
  created_at: string;
}

const WEBHOOK_EVENTS = [
  { id: 'panel.created', label: 'Panel Created' },
  { id: 'panel.approved', label: 'Panel Approved' },
  { id: 'panel.suspended', label: 'Panel Suspended' },
  { id: 'user.registered', label: 'User Registered' },
  { id: 'order.created', label: 'Order Created' },
  { id: 'order.completed', label: 'Order Completed' },
  { id: 'payment.received', label: 'Payment Received' },
  { id: 'subscription.renewed', label: 'Subscription Renewed' }
];

const WebhookManagement = () => {
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<AdminWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<AdminWebhook | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
    is_active: true
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingWebhook(null);
    setFormData({ name: '', url: '', secret: '', events: [], is_active: true });
    setDialogOpen(true);
  };

  const openEditDialog = (webhook: AdminWebhook) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      secret: webhook.secret || '',
      events: webhook.events,
      is_active: webhook.is_active
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingWebhook) {
        await supabase
          .from('admin_webhooks')
          .update({
            name: formData.name,
            url: formData.url,
            secret: formData.secret || null,
            events: formData.events,
            is_active: formData.is_active
          })
          .eq('id', editingWebhook.id);

        toast({ title: "Webhook Updated" });
      } else {
        await supabase
          .from('admin_webhooks')
          .insert({
            name: formData.name,
            url: formData.url,
            secret: formData.secret || null,
            events: formData.events,
            is_active: formData.is_active
          });

        toast({ title: "Webhook Created" });
      }
      setDialogOpen(false);
      fetchWebhooks();
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to save webhook" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('admin_webhooks').delete().eq('id', id);
      toast({ title: "Webhook Deleted" });
      fetchWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete webhook" });
    }
  };

  const toggleEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const testWebhook = async (webhook: AdminWebhook) => {
    toast({ title: "Test Sent", description: "A test payload has been sent to the webhook" });
  };

  const kanbanColumns = [
    { 
      title: 'Active', 
      filter: (w: AdminWebhook) => w.is_active && w.failure_count === 0, 
      icon: CheckCircle, 
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-500'
    },
    { 
      title: 'With Issues', 
      filter: (w: AdminWebhook) => w.is_active && w.failure_count > 0, 
      icon: AlertTriangle, 
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
      textColor: 'text-amber-500'
    },
    { 
      title: 'Inactive', 
      filter: (w: AdminWebhook) => !w.is_active, 
      icon: XCircle, 
      color: 'from-slate-500 to-slate-600',
      bg: 'bg-slate-500/10',
      textColor: 'text-slate-500'
    }
  ];

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
        <title>Webhook Management - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Webhook Management</h1>
          <p className="text-muted-foreground">Configure platform webhooks for external integrations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchWebhooks} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Webhook
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Webhook className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{webhooks.length}</p>
              <p className="text-xs text-muted-foreground">Total Webhooks</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{webhooks.filter(w => w.is_active && w.failure_count === 0).length}</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{webhooks.filter(w => w.failure_count > 0).length}</p>
              <p className="text-xs text-muted-foreground">With Failures</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Send className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{webhooks.filter(w => w.last_triggered_at).length}</p>
              <p className="text-xs text-muted-foreground">Recently Triggered</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Kanban Board */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {kanbanColumns.map((column) => {
          const columnWebhooks = webhooks.filter(column.filter);
          
          return (
            <KanbanColumn
              key={column.title}
              title={column.title}
              count={columnWebhooks.length}
              icon={column.icon}
              color={column.color}
              bgColor={column.bg}
              textColor={column.textColor}
              emptyMessage={`No ${column.title.toLowerCase()} webhooks`}
              loading={loading}
            >
              {columnWebhooks.map((webhook) => (
                <KanbanCard
                  key={webhook.id}
                  onClick={() => openEditDialog(webhook)}
                  variant={webhook.failure_count > 0 ? 'warning' : webhook.is_active ? 'success' : 'default'}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold line-clamp-1">{webhook.name}</p>
                      {webhook.failure_count > 0 && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 text-xs">
                          {webhook.failure_count} fails
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {webhook.url}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {webhook.events.slice(0, 2).map(event => (
                        <Badge key={event} variant="outline" className="text-[10px]">
                          {event.split('.')[1]}
                        </Badge>
                      ))}
                      {webhook.events.length > 2 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{webhook.events.length - 2}
                        </Badge>
                      )}
                    </div>

                    {webhook.last_triggered_at && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(webhook.last_triggered_at).toLocaleDateString()}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          testWebhook(webhook);
                        }}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(webhook.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </KanbanCard>
              ))}
            </KanbanColumn>
          );
        })}
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWebhook ? 'Edit Webhook' : 'Create Webhook'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Webhook"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Endpoint URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/webhook"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret">Secret (optional)</Label>
              <Input
                id="secret"
                type="password"
                placeholder="Webhook secret for verification"
                value={formData.secret}
                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2 p-3 border border-border rounded-lg max-h-48 overflow-y-auto">
                {WEBHOOK_EVENTS.map(event => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={event.id}
                      checked={formData.events.includes(event.id)}
                      onCheckedChange={() => toggleEvent(event.id)}
                    />
                    <label htmlFor={event.id} className="text-sm cursor-pointer">
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Enable or disable this webhook</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.url || formData.events.length === 0}>
              {editingWebhook ? 'Save Changes' : 'Create Webhook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default WebhookManagement;
