import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[scheduled-sync] Starting daily provider sync');

    // Get all active panels with active providers
    const { data: panels, error: panelsError } = await supabase
      .from('panels')
      .select('id, name')
      .eq('status', 'active');

    if (panelsError) {
      throw new Error(`Failed to fetch panels: ${panelsError.message}`);
    }

    const results: any[] = [];
    let totalSynced = 0;
    let totalErrors = 0;

    for (const panel of panels || []) {
      // Check if panel has active providers
      const { data: providers } = await supabase
        .from('providers')
        .select('id, name')
        .eq('panel_id', panel.id)
        .eq('is_active', true);

      if (!providers?.length) {
        continue;
      }

      console.log(`[scheduled-sync] Syncing panel: ${panel.name} (${providers.length} providers)`);

      // Create sync log entry
      const { data: logEntry } = await supabase
        .from('provider_sync_logs')
        .insert({
          panel_id: panel.id,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select('id')
        .single();

      try {
        // Call sync-provider-services for this panel
        const syncResponse = await fetch(`${supabaseUrl}/functions/v1/sync-provider-services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            panelId: panel.id,
            markupPercent: 25, // Default markup
            importNew: true
          })
        });

        const syncResult = await syncResponse.json();

        if (syncResult.success) {
          totalSynced += (syncResult.summary?.totalNew || 0) + (syncResult.summary?.totalUpdated || 0);
          
          // Update log entry
          if (logEntry) {
            await supabase
              .from('provider_sync_logs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                services_synced: (syncResult.summary?.totalNew || 0) + (syncResult.summary?.totalUpdated || 0),
                prices_updated: syncResult.summary?.totalUpdated || 0
              })
              .eq('id', logEntry.id);
          }

          results.push({
            panelId: panel.id,
            panelName: panel.name,
            status: 'success',
            ...syncResult.summary
          });
        } else {
          totalErrors++;
          
          if (logEntry) {
            await supabase
              .from('provider_sync_logs')
              .update({
                status: 'error',
                completed_at: new Date().toISOString(),
                errors: [{ message: syncResult.error }]
              })
              .eq('id', logEntry.id);
          }

          results.push({
            panelId: panel.id,
            panelName: panel.name,
            status: 'error',
            error: syncResult.error
          });
        }

      } catch (error: any) {
        totalErrors++;
        console.error(`[scheduled-sync] Error syncing panel ${panel.name}:`, error);

        if (logEntry) {
          await supabase
            .from('provider_sync_logs')
            .update({
              status: 'error',
              completed_at: new Date().toISOString(),
              errors: [{ message: error.message }]
            })
            .eq('id', logEntry.id);
        }

        results.push({
          panelId: panel.id,
          panelName: panel.name,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`[scheduled-sync] Complete: synced=${totalSynced}, errors=${totalErrors}`);

    return new Response(JSON.stringify({
      success: true,
      summary: {
        panelsProcessed: results.length,
        totalSynced,
        totalErrors
      },
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[scheduled-sync] Fatal error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
