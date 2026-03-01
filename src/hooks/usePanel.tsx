import { useState, useEffect, useCallback } from 'react';
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
  settings?: any;
  subscription_tier?: string;
  custom_branding?: any;
  created_at?: string;
}

// Panel limits by subscription tier
export const PANEL_LIMITS: Record<string, number> = {
  free: 1,
  basic: 2,
  pro: 5,
};

export function usePanel() {
  const { profile } = useAuth();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [allPanels, setAllPanels] = useState<Panel[]>([]);
  const [resolvedTier, setResolvedTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPanels = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      // Fetch ALL panels for this owner
      const { data: panels, error: fetchError } = await supabase
        .from('panels')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const panelList = panels || [];
      setAllPanels(panelList);

      if (panelList.length === 0) {
        setPanel(null);
        setResolvedTier('free');
        return;
      }

      // Query panel_subscriptions for active plans to get the real tier
      const panelIds = panelList.map(p => p.id);
      const { data: subscriptions } = await supabase
        .from('panel_subscriptions')
        .select('plan_type, status')
        .in('panel_id', panelIds)
        .in('status', ['active'] as any);

      // Determine the highest tier from active subscriptions
      let highestTier = 'free';
      if (subscriptions && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          const planType = sub.plan_type || 'free';
          if (planType === 'pro') { highestTier = 'pro'; break; }
          if (planType === 'basic' && highestTier === 'free') highestTier = 'basic';
        }
      }

      // Fallback: also check panels.subscription_tier in case subscriptions table is empty
      if (highestTier === 'free') {
        for (const p of panelList) {
          const tier = (p as any).subscription_tier || 'free';
          if (tier === 'pro') { highestTier = 'pro'; break; }
          if (tier === 'basic' && highestTier === 'free') highestTier = 'basic';
        }
      }

      setResolvedTier(highestTier);

      // Determine active panel
      const activePanelId = (profile as any)?.active_panel_id;
      let activePanel = panelList.find(p => p.id === activePanelId);
      
      if (!activePanel) {
        activePanel = panelList.find(p => p.onboarding_completed) || panelList[0];
      }

      setPanel(activePanel);
    } catch (err) {
      console.error('Error fetching panels:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch panel');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, (profile as any)?.active_panel_id]);

  useEffect(() => {
    fetchPanels();
  }, [fetchPanels]);

  const switchPanel = useCallback(async (panelId: string) => {
    if (!profile?.id) return;

    // Update active_panel_id in profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ active_panel_id: panelId } as any)
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error switching panel:', updateError);
      return;
    }

    // Update local state immediately
    const newActive = allPanels.find(p => p.id === panelId);
    if (newActive) {
      setPanel(newActive);
    }
  }, [profile?.id, allPanels]);

  const refreshPanel = useCallback(async () => {
    await fetchPanels();
  }, [fetchPanels]);

  // Get max panels allowed based on resolved subscription tier
  const getMaxPanels = useCallback(() => {
    return PANEL_LIMITS[resolvedTier] || 1;
  }, [resolvedTier]);

  const canCreatePanel = useCallback(() => {
    return allPanels.length < getMaxPanels();
  }, [allPanels, getMaxPanels]);

  // Compute locked panels: panels beyond tier limit (newest first are locked)
  const getLockedPanelIds = useCallback((): Set<string> => {
    const max = PANEL_LIMITS[resolvedTier] || 1;
    if (allPanels.length <= max) return new Set();
    // Keep oldest panels active, lock newest ones beyond limit
    const sortedByCreation = [...allPanels].sort(
      (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );
    const locked = sortedByCreation.slice(max);
    return new Set(locked.map(p => p.id));
  }, [allPanels, resolvedTier]);

  const lockedPanelIds = getLockedPanelIds();

  const isPanelLocked = useCallback((panelId: string) => {
    return lockedPanelIds.has(panelId);
  }, [lockedPanelIds]);

  return { 
    panel, 
    allPanels,
    loading, 
    error, 
    refreshPanel, 
    switchPanel,
    canCreatePanel,
    getMaxPanels,
    resolvedTier,
    isPanelLocked,
    lockedPanelIds,
  };
}
