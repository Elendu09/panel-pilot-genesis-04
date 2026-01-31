import { useState, memo, useCallback } from 'react';
import { usePanel } from '@/hooks/usePanel';
import { useTeamMembers, type PanelRole } from '@/hooks/useTeamMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Plus, MoreVertical, Shield, UserCog, Headphones, Trash2, Mail, Clock, CheckCircle, Loader2, Info } from 'lucide-react';

// Role configuration - maps to database roles
const roleConfig: Record<PanelRole, {
  label: string;
  description: string;
  color: string;
  permissions: string[];
  tempPassword: string;
}> = {
  panel_admin: {
    label: 'Admin',
    description: 'Same rights as of main account',
    color: 'border-primary bg-primary/10',
    permissions: ['Full access', 'Billing', 'Settings', 'Team'],
    tempPassword: 'admin123'
  },
  manager: {
    label: 'Manager',
    description: "Can't see balance, providers and panel settings. Can work with orders, edit services and answer in support.",
    color: 'border-muted bg-muted/50',
    permissions: ['Orders', 'Services', 'Support'],
    tempPassword: 'manager123'
  },
  agent: {
    label: 'Agent',
    description: "Has SEO rights. Can answer in support, see orders and services but cant edit. Doesn't see provider and panel settings.",
    color: 'border-muted bg-muted/50',
    permissions: ['View Orders', 'View Services', 'Support', 'SEO'],
    tempPassword: 'agent123'
  }
};

// Role illustration SVGs
const AdminIllustration = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="20" width="32" height="20" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="24" cy="30" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M24 34V36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 20V16C16 11.5817 19.5817 8 24 8C28.4183 8 32 11.5817 32 16V20" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const ManagerIllustration = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 40C12 33.3726 17.3726 28 24 28C30.6274 28 36 33.3726 36 40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M32 12L36 16L32 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 12L12 16L16 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AgentIllustration = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="20" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M14 40C14 34.4772 18.4772 30 24 30C29.5228 30 34 34.4772 34 40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M32 10L40 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 16L40 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M36 22L40 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const roleIllustrations: Record<PanelRole, React.FC> = {
  panel_admin: AdminIllustration,
  manager: ManagerIllustration,
  agent: AgentIllustration
};

// Memoized role card for the overview section
const RoleCard = memo(({ roleKey, config }: { roleKey: PanelRole; config: typeof roleConfig[PanelRole] }) => {
  const Illustration = roleIllustrations[roleKey];
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <Illustration />
          </div>
          <div>
            <CardTitle className="text-sm">{config.label}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {config.permissions.map((perm) => (
            <Badge key={perm} variant="secondary" className="text-[10px]">
              {perm}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
RoleCard.displayName = 'RoleCard';

// Memoized member row
const MemberRow = memo(({ 
  member, 
  onRoleChange, 
  onToggleActive, 
  onDelete 
}: { 
  member: any; 
  onRoleChange: (id: string, role: PanelRole) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}) => {
  const config = roleConfig[member.role as PanelRole] || roleConfig.agent;
  
  return (
    <div
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
        <Badge variant="outline" className={config.color}>
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
            <DropdownMenuItem onClick={() => onRoleChange(member.id, 'panel_admin')}>
              <Shield className="w-4 h-4 mr-2" />
              Set as Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange(member.id, 'manager')}>
              <UserCog className="w-4 h-4 mr-2" />
              Set as Manager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange(member.id, 'agent')}>
              <Headphones className="w-4 h-4 mr-2" />
              Set as Agent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleActive(member.id, member.is_active)}>
              {member.is_active ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(member.id)}
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
});
MemberRow.displayName = 'MemberRow';

// Role selection card for the dialog
const RoleSelectCard = memo(({ 
  roleKey, 
  config, 
  selected, 
  onSelect 
}: { 
  roleKey: PanelRole; 
  config: typeof roleConfig[PanelRole]; 
  selected: boolean;
  onSelect: () => void;
}) => {
  const Illustration = roleIllustrations[roleKey];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
        selected 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-muted-foreground/30 bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
          <Illustration />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
              {config.label}
            </span>
            {selected && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {config.description}
          </p>
          <p className="text-xs text-primary mt-2">
            Temp password: <code className="bg-muted px-1 py-0.5 rounded">{config.tempPassword}</code>
          </p>
        </div>
      </div>
    </button>
  );
});
RoleSelectCard.displayName = 'RoleSelectCard';

export default function TeamManagement() {
  const { panel } = usePanel();
  const { members, isLoading, invite, updateRole, toggleActive, deleteMember, isInviting } = useTeamMembers(panel?.id);
  
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<PanelRole>('agent');

  const handleInvite = useCallback(() => {
    if (!inviteEmail) return;
    
    invite(
      { email: inviteEmail, role: inviteRole },
      {
        onSuccess: () => {
          setInviteOpen(false);
          setInviteEmail('');
          setInviteRole('agent');
        }
      }
    );
  }, [invite, inviteEmail, inviteRole]);

  const handleRoleChange = useCallback((memberId: string, newRole: PanelRole) => {
    updateRole({ memberId, newRole });
  }, [updateRole]);

  const handleToggleActive = useCallback((memberId: string, isActive: boolean) => {
    toggleActive({ memberId, isActive });
  }, [toggleActive]);

  const handleDelete = useCallback(() => {
    if (deleteId) {
      deleteMember(deleteId);
      setDeleteId(null);
    }
  }, [deleteMember, deleteId]);

  const resetForm = useCallback(() => {
    setInviteEmail('');
    setInviteRole('agent');
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedRoleConfig = roleConfig[inviteRole];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Add team members to help manage your panel</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={(open) => { setInviteOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold">Add Team Member</DialogTitle>
              </div>
            </DialogHeader>
            
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Email field only */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email Address</Label>
                <Input
                  type="email"
                  placeholder="team@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              
              {/* Role selection cards */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Role</Label>
                <div className="grid gap-3">
                  {(Object.entries(roleConfig) as [PanelRole, typeof roleConfig[PanelRole]][]).map(([key, config]) => (
                    <RoleSelectCard
                      key={key}
                      roleKey={key}
                      config={config}
                      selected={inviteRole === key}
                      onSelect={() => setInviteRole(key)}
                    />
                  ))}
                </div>
              </div>
              
              {/* Info about temporary password */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Temporary Password</p>
                  <p className="text-muted-foreground mt-1">
                    The team member will use <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{selectedRoleConfig.tempPassword}</code> to log in. 
                    They'll be required to change it on first login.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Coming Soon Notice */}
            <div className="px-6 py-4 border-t bg-muted/30 space-y-3">
              <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Team management is coming soon. You'll be able to add 
                  team members with different roles to help manage your panel.
                </p>
              </div>
              <Button 
                disabled={true}
                className="w-full h-11 cursor-not-allowed"
              >
                <Clock className="w-4 h-4 mr-2" />
                Coming Soon!
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Permissions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(roleConfig) as [PanelRole, typeof roleConfig[PanelRole]][]).map(([key, config]) => (
          <RoleCard key={key} roleKey={key} config={config} />
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
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onRoleChange={handleRoleChange}
                  onToggleActive={handleToggleActive}
                  onDelete={setDeleteId}
                />
              ))}
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
