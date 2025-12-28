import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePanel } from '@/hooks/usePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Plus, MoreVertical, Shield, UserCog, Headphones, Trash2, Mail, Clock, CheckCircle, Loader2 } from 'lucide-react';

type PanelRole = 'panel_admin' | 'manager' | 'agent';

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  role: PanelRole;
  is_active: boolean;
  invited_at: string;
  accepted_at: string | null;
}

const roleConfig = {
  panel_admin: {
    label: 'Admin',
    description: 'Full access to all panel features including billing and settings',
    icon: Shield,
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    permissions: ['Dashboard', 'Services', 'Orders', 'Customers', 'Analytics', 'Billing', 'Settings', 'Team']
  },
  manager: {
    label: 'Manager',
    description: 'Manage orders, customers, and services (no billing access)',
    icon: UserCog,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    permissions: ['Dashboard', 'Services', 'Orders', 'Customers', 'Analytics']
  },
  agent: {
    label: 'Support Agent',
    description: 'Handle support tickets and view orders (read-only)',
    icon: Headphones,
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
    permissions: ['Dashboard', 'Orders (view)', 'Support Tickets']
  }
};

export default function TeamManagement() {
  const { panel } = usePanel();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteRole, setInviteRole] = useState<PanelRole>('agent');

  useEffect(() => {
    if (panel?.id) {
      fetchMembers();
    }
  }, [panel?.id]);

  const fetchMembers = async () => {
    if (!panel?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('panel_team_members')
        .select('*')
        .eq('panel_id', panel.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({ title: 'Error loading team', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!panel?.id || !inviteEmail) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('panel_team_members')
        .insert({
          panel_id: panel.id,
          email: inviteEmail.toLowerCase().trim(),
          full_name: inviteFullName.trim() || null,
          role: inviteRole,
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('This email is already a team member');
        }
        throw error;
      }

      toast({ title: 'Team member added!', description: `${inviteEmail} has been added as ${roleConfig[inviteRole].label}` });
      setInviteOpen(false);
      setInviteEmail('');
      setInviteFullName('');
      setInviteRole('agent');
      fetchMembers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: PanelRole) => {
    try {
      const { error } = await supabase
        .from('panel_team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      
      toast({ title: 'Role updated' });
      fetchMembers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from('panel_team_members')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      
      toast({ title: 'Team member removed' });
      setDeleteId(null);
      fetchMembers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const toggleActive = async (memberId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('panel_team_members')
        .update({ is_active: !isActive })
        .eq('id', memberId);

      if (error) throw error;
      
      toast({ title: isActive ? 'Member deactivated' : 'Member activated' });
      fetchMembers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Add team members to help manage your panel</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Invite someone to help manage your panel
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="team@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name (Optional)</Label>
                <Input
                  placeholder="John Doe"
                  value={inviteFullName}
                  onChange={(e) => setInviteFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as PanelRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {roleConfig[inviteRole].description}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={handleInvite} disabled={!inviteEmail || saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Permissions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(roleConfig).map(([key, config]) => (
          <Card key={key} className="border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <config.icon className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm">{config.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{config.description}</p>
              <div className="flex flex-wrap gap-1">
                {config.permissions.map((perm) => (
                  <Badge key={perm} variant="secondary" className="text-[10px]">
                    {perm}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members ({members.length})
          </CardTitle>
          <CardDescription>People who can access your panel</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No team members yet</p>
              <p className="text-sm">Add your first team member to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const config = roleConfig[member.role];
                const RoleIcon = config.icon;
                
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      !member.is_active ? 'opacity-50 bg-muted/30' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {(member.full_name || member.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.full_name || member.email}</p>
                          {!member.is_active && (
                            <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{member.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={config.color}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {member.accepted_at ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </>
                        )}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'panel_admin')}>
                            <Shield className="w-4 h-4 mr-2" />
                            Set as Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'manager')}>
                            <UserCog className="w-4 h-4 mr-2" />
                            Set as Manager
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'agent')}>
                            <Headphones className="w-4 h-4 mr-2" />
                            Set as Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActive(member.id, member.is_active)}>
                            {member.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(member.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke their access to your panel. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
