import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Panel {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  status: string;
  balance: number;
  commission_rate: number;
  total_orders: number;
  monthly_revenue: number;
  theme_type: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  onboarding_completed: boolean;
}

export function usePanel() {
  const { profile } = useAuth();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    const fetchPanel = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('panels')
          .select('*')
          .eq('owner_id', profile.id)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setPanel(data);
      } catch (err) {
        console.error('Error fetching panel:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch panel');
      } finally {
        setLoading(false);
      }
    };

    fetchPanel();
  }, [profile?.id]);

  const refreshPanel = async () => {
    if (!profile?.id) return;
    
    const { data } = await supabase
      .from('panels')
      .select('*')
      .eq('owner_id', profile.id)
      .maybeSingle();
    
    setPanel(data);
  };

  return { panel, loading, error, refreshPanel };
}