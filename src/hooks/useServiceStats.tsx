import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceStats {
  totalServices: number;
  loading: boolean;
}

export function useServiceStats(panelId?: string): ServiceStats {
  const [totalServices, setTotalServices] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let query = supabase
          .from('services')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true);

        if (panelId) {
          query = query.eq('panel_id', panelId);
        }

        const { count, error } = await query;

        if (!error && count !== null) {
          setTotalServices(count);
        }
      } catch (err) {
        console.error('Error fetching service stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [panelId]);

  return { totalServices, loading };
}

export function usePlatformStats() {
  const [stats, setStats] = useState({
    totalPanels: 0,
    totalOrders: 0,
    totalServices: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch panel count
        const { count: panelCount } = await supabase
          .from('panels')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active');

        // Fetch service count
        const { count: serviceCount } = await supabase
          .from('services')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch order count
        const { count: orderCount } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true });

        setStats({
          totalPanels: panelCount || 0,
          totalOrders: orderCount || 0,
          totalServices: serviceCount || 0,
          loading: false
        });
      } catch (err) {
        console.error('Error fetching platform stats:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return stats;
}
