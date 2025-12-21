import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncResult {
  providerId: string;
  providerName: string;
  servicesUpdated: number;
  pricesChanged: number;
  newServices: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { panelId, providerId } = await req.json();

    if (!panelId) {
      return new Response(
        JSON.stringify({ error: 'Panel ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting sync for panel: ${panelId}, provider: ${providerId || 'all'}`);

    // Get providers for this panel
    let providerQuery = supabase
      .from('providers')
      .select('*')
      .eq('panel_id', panelId)
      .eq('is_active', true);

    if (providerId) {
      providerQuery = providerQuery.eq('id', providerId);
    }

    const { data: providers, error: providersError } = await providerQuery;

    if (providersError) {
      throw new Error(`Failed to fetch providers: ${providersError.message}`);
    }

    if (!providers || providers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No active providers found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: SyncResult[] = [];

    for (const provider of providers) {
      const result: SyncResult = {
        providerId: provider.id,
        providerName: provider.name,
        servicesUpdated: 0,
        pricesChanged: 0,
        newServices: 0,
        errors: [],
      };

      try {
        // Fetch services from provider API
        const url = new URL(provider.api_endpoint);
        url.searchParams.set('key', provider.api_key);
        url.searchParams.set('action', 'services');

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: { 'User-Agent': 'SMM-Panel/1.0' },
        });

        if (!response.ok) {
          result.errors.push(`API returned ${response.status}`);
          results.push(result);
          continue;
        }

        const data = await response.json();
        const providerServices = Array.isArray(data) ? data : (data.services || []);

        // Get existing services for this panel from this provider
        const { data: existingServices } = await supabase
          .from('services')
          .select('*')
          .eq('panel_id', panelId)
          .eq('provider_id', provider.id);

        const existingByProviderId = new Map(
          (existingServices || []).map(s => [s.provider_id, s])
        );

        for (const providerService of providerServices) {
          const serviceId = String(providerService.service);
          const existing = existingByProviderId.get(serviceId);
          const newRate = parseFloat(providerService.rate) || 0;

          if (existing) {
            // Check if price changed
            if (Math.abs(existing.price - newRate) > 0.001) {
              result.pricesChanged++;
            }
            result.servicesUpdated++;
          } else {
            result.newServices++;
          }
        }

        // Update last sync timestamp
        await supabase
          .from('providers')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', provider.id);

      } catch (error) {
        result.errors.push(error.message || 'Unknown error');
      }

      results.push(result);
    }

    // Log sync to audit
    await supabase.from('audit_logs').insert({
      action: 'service_sync',
      resource_type: 'services',
      details: {
        panel_id: panelId,
        results: results.map(r => ({
          provider: r.providerName,
          updated: r.servicesUpdated,
          pricesChanged: r.pricesChanged,
          new: r.newServices,
        })),
      },
    });

    console.log('Sync completed:', JSON.stringify(results));

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        syncedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Sync failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
