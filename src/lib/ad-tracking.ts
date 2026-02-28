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
      // Increment cumulative impressions on provider_ads
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

      // Upsert daily snapshot
      await upsertDailyMetric(panelId, adType, 'impressions', 1);
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

    // Upsert daily snapshot
    await upsertDailyMetric(panelId, adType, 'clicks', 1);
  } catch (e) {
    console.error('Failed to track click:', e);
  }
}

export async function trackAdConversion(panelId: string, adType: string) {
  try {
    await upsertDailyMetric(panelId, adType, 'conversions', 1);
  } catch (e) {
    console.error('Failed to track conversion:', e);
  }
}

/**
 * Upsert a daily metric increment into ad_analytics_daily.
 * Uses ON CONFLICT to atomically increment the counter for today.
 */
async function upsertDailyMetric(
  panelId: string,
  adType: string,
  metric: 'impressions' | 'clicks' | 'conversions',
  increment: number
) {
  const today = new Date().toISOString().split('T')[0];

  // Try to fetch existing row for today
  const { data: existing } = await supabase
    .from('ad_analytics_daily')
    .select('id, impressions, clicks, conversions')
    .eq('panel_id', panelId)
    .eq('ad_type', adType)
    .eq('date', today)
    .maybeSingle();

  if (existing) {
    // Update existing row
    await supabase
      .from('ad_analytics_daily')
      .update({ [metric]: (existing[metric] || 0) + increment })
      .eq('id', existing.id);
  } else {
    // Insert new row
    const row: Record<string, unknown> = {
      panel_id: panelId,
      ad_type: adType,
      date: today,
      impressions: 0,
      clicks: 0,
      conversions: 0,
    };
    row[metric] = increment;
    await supabase.from('ad_analytics_daily').insert(row as any);
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
