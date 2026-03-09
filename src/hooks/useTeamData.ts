import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TeamSession {
  memberId: string;
  email: string;
  fullName: string | null;
  role: 'panel_admin' | 'manager' | 'agent';
  panelId: string;
  token: string;
  expiresAt: number;
}

function getTeamSession(): TeamSession | null {
  const stored = localStorage.getItem('team_session');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function useTeamData() {
  const [loading, setLoading] = useState(false);

  const callTeamApi = useCallback(async (action: string, params: Record<string, any> = {}) => {
    const session = getTeamSession();
    if (!session) {
      toast({ variant: 'destructive', title: 'Session expired', description: 'Please login again' });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('team-data', {
        body: { action, token: session.token, ...params },
      });

      if (error) {
        console.error('Team API error:', error);
        toast({ variant: 'destructive', title: 'Error', description: error.message });
        return null;
      }

      if (data?.error) {
        if (data.error.includes('expired') || data.error.includes('Invalid token')) {
          localStorage.removeItem('team_session');
          window.location.href = '/team-login';
          return null;
        }
        toast({ variant: 'destructive', title: 'Error', description: data.error });
        return null;
      }

      return data;
    } catch (err: unknown) {
      console.error('Team API call failed:', err);
      toast({ variant: 'destructive', title: 'Network Error', description: 'Failed to connect to server' });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callTeamApi, loading };
}
