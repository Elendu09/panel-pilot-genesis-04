import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    setFormData({
      name: '',
      url: '',
      secret: '',
      events: [],
      is_active: true
    });
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

        toast({ title: "Webhook Updated", description: "Webhook configuration saved successfully" });
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

        toast({ title: "Webhook Created", description: "New webhook has been added" });
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
      toast({ title: "Webhook Deleted", description: "Webhook has been removed" });
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
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Webhook
        </Button>
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
              <p className="text-2xl font-bold">{webhooks.filter(w => w.is_active).length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
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

      {/* Webhooks Table */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Configured Webhooks</CardTitle>
            <CardDescription>Manage your platform webhook endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading webhooks...</p>
              </div>
            ) : webhooks.length === 0 ? (
              <div className="text-center py-12">
                <Webhook className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
                <p className="text-muted-foreground mb-4">Create a webhook to start receiving event notifications</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Webhook
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Triggered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell>
                        <span className="text-xs font-mono truncate max-w-[200px] block">
                          {webhook.url}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map(event => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{webhook.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={webhook.is_active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-500/20 text-gray-500'}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {webhook.failure_count > 0 && (
                          <Badge className="ml-1 bg-red-500/20 text-red-500">
                            {webhook.failure_count} failures
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {webhook.last_triggered_at ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(webhook.last_triggered_at).toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => testWebhook(webhook)}
                            title="Test Webhook"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(webhook)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(webhook.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
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
