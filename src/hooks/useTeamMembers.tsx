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

  const inviteMutation = useMutation({
    mutationFn: async ({ email, fullName, role }: { email: string; fullName: string; role: PanelRole }) => {
      if (!panelId) throw new Error('No panel ID');
      const { error } = await supabase
        .from('panel_team_members')
        .insert({
          panel_id: panelId,
          email: email.toLowerCase().trim(),
          full_name: fullName.trim() || null,
          role,
        });
      if (error) {
        if (error.code === '23505') throw new Error('This email is already a team member');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', panelId] });
      toast({ title: 'Team member added!' });
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
