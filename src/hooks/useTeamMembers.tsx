import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Database enum only supports: panel_admin, manager, agent
// We map UI roles to these DB roles
export type PanelRole = 'panel_admin' | 'manager' | 'agent';

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  role: PanelRole;
  is_active: boolean;
  invited_at: string;
  accepted_at: string | null;
}

export function useTeamMembers(panelId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ['team-members', panelId],
    queryFn: async () => {
      if (!panelId) return [];
      const { data, error } = await supabase
        .from('panel_team_members')
        .select('id, email, full_name, role, is_active, invited_at, accepted_at')
        .eq('panel_id', panelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!panelId,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Create member via edge function (which handles password hashing)
  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: PanelRole }) => {
      if (!panelId) throw new Error('No panel ID');
      
      const { data, error } = await supabase.functions.invoke('team-auth', {
        body: {
          panelId,
          action: 'create-member',
          email: email.toLowerCase().trim(),
          role
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', panelId] });
      const tempPass = data?.tempPassword || 'role123';
      toast({ 
        title: 'Team member added!',
        description: `Temporary password: ${tempPass} (must be changed on first login)`
      });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: PanelRole }) => {
      const { error } = await supabase
        .from('panel_team_members')
        .update({ role: newRole })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', panelId] });
      toast({ title: 'Role updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ memberId, isActive }: { memberId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('panel_team_members')
        .update({ is_active: !isActive })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', panelId] });
      toast({ title: 'Member status updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('panel_team_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', panelId] });
      toast({ title: 'Team member removed' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    members,
    isLoading,
    error,
    invite: inviteMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    toggleActive: toggleActiveMutation.mutate,
    deleteMember: deleteMutation.mutate,
    isInviting: inviteMutation.isPending,
  };
}
