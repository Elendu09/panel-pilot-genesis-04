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

interface ProviderService {
  service: string | number;
  name: string;
  category: string;
  rate: string | number;
  min: string | number;
  max: string | number;
  desc?: string;
  type?: string;
}

const mapCategory = (category: string): string => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('instagram')) return 'instagram';
  if (categoryLower.includes('facebook') || categoryLower.includes('fb')) return 'facebook';
  if (categoryLower.includes('twitter') || categoryLower.includes('x.com')) return 'twitter';
  if (categoryLower.includes('youtube') || categoryLower.includes('yt')) return 'youtube';
  if (categoryLower.includes('tiktok') || categoryLower.includes('tik tok')) return 'tiktok';
  if (categoryLower.includes('linkedin')) return 'linkedin';
  if (categoryLower.includes('telegram')) return 'telegram';
  if (categoryLower.includes('spotify')) return 'spotify';
  if (categoryLower.includes('discord')) return 'discord';
  if (categoryLower.includes('twitch')) return 'twitch';
  if (categoryLower.includes('pinterest')) return 'pinterest';
  if (categoryLower.includes('snapchat')) return 'snapchat';
  if (categoryLower.includes('threads')) return 'threads';
  if (categoryLower.includes('soundcloud')) return 'soundcloud';
  return 'other';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { panelId, providerId, markupPercent = 25, importNew = true } = await req.json();

    if (!panelId) {
      return new Response(
        JSON.stringify({ error: 'Panel ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting sync for panel: ${panelId}, provider: ${providerId || 'all'}, markup: ${markupPercent}%`);

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

        console.log(`Fetching services from ${provider.name}...`);

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
        
        // Handle both array and object responses
        let providerServices: ProviderService[] = [];
        if (Array.isArray(data)) {
          providerServices = data;
        } else if (data.services) {
          providerServices = data.services;
        } else if (data.data) {
          providerServices = data.data;
        }

        console.log(`Found ${providerServices.length} services from ${provider.name}`);

        // Get ALL existing services for this panel (no limit)
        const providerServiceIds = providerServices.map(s => String(s.service));
        
        // Fetch in batches to avoid Supabase's 1000 limit
        const batchSize = 500;
        const allExistingServices: any[] = [];
        
        for (let i = 0; i < providerServiceIds.length; i += batchSize) {
          const batch = providerServiceIds.slice(i, i + batchSize);
          const { data: batchServices, error: batchError } = await supabase
            .from('services')
            .select('*')
            .eq('panel_id', panelId)
            .in('provider_id', batch);
          
          if (batchError) {
            console.error(`Error fetching batch ${i}-${i + batchSize}:`, batchError);
          } else if (batchServices) {
            allExistingServices.push(...batchServices);
          }
        }

        // Map existing services by their provider_id
        const existingByProviderServiceId = new Map(
          allExistingServices.map(s => [s.provider_id, s])
        );

        console.log(`Found ${allExistingServices.length} existing services to potentially update`);

        // Prepare batch operations
        const toUpdate: any[] = [];
        const toInsert: any[] = [];
        
        // Process each service from provider - MAINTAIN ORIGINAL ORDER
        providerServices.forEach((providerService, originalIndex) => {
          const serviceId = String(providerService.service);
          const existing = existingByProviderServiceId.get(serviceId);
          
          const providerRate = parseFloat(String(providerService.rate)) || 0;
          const markupMultiplier = 1 + (markupPercent / 100);
          const finalPrice = providerRate * markupMultiplier;

          const serviceData = {
            panel_id: panelId,
            provider_id: serviceId,
            name: providerService.name || `Service ${serviceId}`,
            description: providerService.desc || null,
            category: mapCategory(providerService.category || providerService.type || 'other'),
            price: finalPrice,
            min_quantity: parseInt(String(providerService.min)) || 1,
            max_quantity: parseInt(String(providerService.max)) || 10000,
            is_active: true,
            sort_order: originalIndex, // PRESERVE PROVIDER'S ORIGINAL ORDER
            updated_at: new Date().toISOString(),
          };

          if (existing) {
            if (Math.abs(existing.price - finalPrice) > 0.001) {
              result.pricesChanged++;
            }
            toUpdate.push({ ...serviceData, id: existing.id });
            result.servicesUpdated++;
          } else if (importNew) {
            toInsert.push({
              ...serviceData,
              created_at: new Date().toISOString(),
            });
            result.newServices++;
          }
        });

        // Execute batch updates in chunks
        const updateChunkSize = 100;
        for (let i = 0; i < toUpdate.length; i += updateChunkSize) {
          const chunk = toUpdate.slice(i, i + updateChunkSize);
          
          // Use upsert for batch updates
          const { error: updateError } = await supabase
            .from('services')
            .upsert(chunk, { onConflict: 'id' });
          
          if (updateError) {
            console.error(`Batch update error at ${i}:`, updateError);
            result.errors.push(`Batch update failed at ${i}: ${updateError.message}`);
          }
        }

        // Execute batch inserts in chunks (handles >1000 services)
        const insertChunkSize = 100;
        for (let i = 0; i < toInsert.length; i += insertChunkSize) {
          const chunk = toInsert.slice(i, i + insertChunkSize);
          
          const { error: insertError } = await supabase
            .from('services')
            .insert(chunk);
          
          if (insertError) {
            console.error(`Batch insert error at ${i}:`, insertError);
            result.errors.push(`Batch insert failed at ${i}: ${insertError.message}`);
            // Continue with remaining chunks instead of failing completely
          } else {
            console.log(`Successfully inserted chunk ${i}-${i + chunk.length}`);
          }
        }

        console.log(`Processed: ${result.servicesUpdated} updated, ${result.newServices} new, ${result.pricesChanged} price changes`);

        // Update last sync timestamp on provider
        await supabase
          .from('providers')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', provider.id);

      } catch (error: any) {
        console.error(`Error syncing provider ${provider.name}:`, error);
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
        markup_percent: markupPercent,
        results: results.map(r => ({
          provider: r.providerName,
          updated: r.servicesUpdated,
          pricesChanged: r.pricesChanged,
          new: r.newServices,
          errors: r.errors.length,
        })),
      },
    });

    const totalNew = results.reduce((sum, r) => sum + r.newServices, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.servicesUpdated, 0);
    const totalPriceChanges = results.reduce((sum, r) => sum + r.pricesChanged, 0);

    console.log(`Sync completed: ${totalNew} new, ${totalUpdated} updated, ${totalPriceChanges} price changes`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        summary: {
          totalNew,
          totalUpdated,
          totalPriceChanges,
          totalProviders: results.length,
        },
        syncedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Sync failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
