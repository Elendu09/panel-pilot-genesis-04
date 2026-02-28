import { supabase } from '@/integrations/supabase/client';

// Debounced batch impression tracker
const pendingImpressions = new Map<string, { panelId: string; adType: string }>();
let impressionTimer: NodeJS.Timeout | null = null;

export async function trackAdImpression(panelId: string, adType: string) {
  const key = `${panelId}:${adType}`;
  pendingImpressions.set(key, { panelId, adType });

  if (impressionTimer) clearTimeout(impressionTimer);
  impressionTimer = setTimeout(flushImpressions, 3000);
}

async function flushImpressions() {
  const entries = Array.from(pendingImpressions.values());
  pendingImpressions.clear();

  for (const { panelId, adType } of entries) {
    try {
      // Use raw SQL-style increment via select + update
      const { data } = await supabase
        .from('provider_ads')
        .select('impressions')
        .eq('panel_id', panelId)
        .eq('ad_type', adType)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .limit(1)
        .single();

      if (data) {
        await supabase
          .from('provider_ads')
          .update({ impressions: (data.impressions || 0) + 1 })
          .eq('panel_id', panelId)
          .eq('ad_type', adType)
          .eq('is_active', true);
      }
    } catch (e) {
      console.error('Failed to track impression:', e);
    }
  }
}

export async function trackAdClick(panelId: string, adType: string) {
  try {
    const { data } = await supabase
      .from('provider_ads')
      .select('clicks')
      .eq('panel_id', panelId)
      .eq('ad_type', adType)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .single();

    if (data) {
      await supabase
        .from('provider_ads')
        .update({ clicks: (data.clicks || 0) + 1 })
        .eq('panel_id', panelId)
        .eq('ad_type', adType)
        .eq('is_active', true);
    }
  } catch (e) {
    console.error('Failed to track click:', e);
  }
}

export async function deactivateExpiredAds(panelId: string) {
  try {
    await supabase
      .from('provider_ads')
      .update({ is_active: false })
      .eq('panel_id', panelId)
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString());
  } catch (e) {
    console.error('Failed to deactivate expired ads:', e);
  }
}
