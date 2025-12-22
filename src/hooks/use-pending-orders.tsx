import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePanel } from "./usePanel";

export const usePendingOrders = () => {
  const { panel } = usePanel();
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingCount = useCallback(async () => {
    if (!panel?.id) {
      setPendingCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panel.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingCount(count || 0);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [panel?.id]);

  useEffect(() => {
    if (!panel?.id) {
      setIsLoading(false);
      return;
    }

    fetchPendingCount();

    // Subscribe to realtime changes on orders table
    const channel = supabase
      .channel('orders-pending-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `panel_id=eq.${panel.id}`,
        },
        () => {
          // Refetch count on any order change
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panel?.id, fetchPendingCount]);

  return {
    pendingCount,
    isLoading,
    refetch: fetchPendingCount,
  };
};

export default usePendingOrders;
