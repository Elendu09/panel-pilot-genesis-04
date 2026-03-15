import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { panelId } = await req.json();
    if (!panelId) {
      return new Response(JSON.stringify({ success: false, error: 'panelId required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch active orders that have a provider_order_id
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, provider_order_id, provider_id, service_id, status, quantity')
      .eq('panel_id', panelId)
      .not('provider_order_id', 'is', null)
      .in('status', ['pending', 'processing', 'in_progress'])
      .limit(500);

    if (ordersError) {
      console.error('[sync-orders] Fetch error:', ordersError);
      return new Response(JSON.stringify({ success: false, error: 'Failed to fetch orders' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ success: true, total: 0, updated: 0, message: 'No active orders to sync' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get unique service IDs to resolve providers
    const serviceIds = [...new Set(orders.map(o => o.service_id).filter(Boolean))];
    const { data: services } = await supabase
      .from('services')
      .select('id, provider_id')
      .in('id', serviceIds);

    const serviceProviderMap: Record<string, string> = {};
    (services || []).forEach((s: any) => {
      if (s.provider_id) serviceProviderMap[s.id] = s.provider_id;
    });

    // Get unique provider IDs
    const providerIds = [...new Set(Object.values(serviceProviderMap))];
    if (providerIds.length === 0) {
      return new Response(JSON.stringify({ success: true, total: orders.length, updated: 0, message: 'No providers linked' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: providers } = await supabase
      .from('providers')
      .select('id, api_endpoint, api_key, is_active')
      .in('id', providerIds)
      .eq('is_active', true);

    if (!providers || providers.length === 0) {
      return new Response(JSON.stringify({ success: true, total: orders.length, updated: 0, message: 'No active providers' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const providerMap: Record<string, any> = {};
    providers.forEach((p: any) => { providerMap[p.id] = p; });

    // Group orders by provider
    const ordersByProvider: Record<string, any[]> = {};
    for (const order of orders) {
      const providerId = serviceProviderMap[order.service_id];
      if (providerId && providerMap[providerId]) {
        if (!ordersByProvider[providerId]) ordersByProvider[providerId] = [];
        ordersByProvider[providerId].push(order);
      }
    }

    let totalUpdated = 0;
    const errors: string[] = [];

    // Query each provider for order statuses
    for (const [providerId, providerOrders] of Object.entries(ordersByProvider)) {
      const provider = providerMap[providerId];

      // SMM API supports multi-order status check
      const providerOrderIds = providerOrders.map(o => o.provider_order_id);

      try {
        const formData = new URLSearchParams();
        formData.append('key', provider.api_key);
        formData.append('action', 'status');
        formData.append('orders', providerOrderIds.join(','));

        const response = await fetch(provider.api_endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        const result = await response.json();
        console.log(`[sync-orders] Provider ${providerId} response for ${providerOrderIds.length} orders`);

        // Result is a map: { "order_id": { status, start_count, remains, charge, currency } }
        for (const order of providerOrders) {
          const statusData = result[order.provider_order_id];
          if (!statusData || statusData.error) continue;

          const newStatus = mapProviderStatus(statusData.status);
          const startCount = parseInt(statusData.start_count) || 0;
          const remains = parseInt(statusData.remains) || 0;
          const delivered = order.quantity - remains;
          const progress = order.quantity > 0 ? Math.min(100, Math.round((delivered / order.quantity) * 100)) : 0;

          const updateData: Record<string, any> = {
            status: newStatus,
            start_count: startCount,
            remains: remains,
            progress: progress,
          };

          if (newStatus === 'completed' && !order.completed_at) {
            updateData.completed_at = new Date().toISOString();
          }

          const { error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', order.id);

          if (!updateError) totalUpdated++;
        }
      } catch (err: any) {
        console.error(`[sync-orders] Provider ${providerId} error:`, (err as Error).message);
        errors.push(`Provider ${providerId}: ${(err as Error).message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total: orders.length,
      updated: totalUpdated,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[sync-orders] Error:', (error as Error).message);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function mapProviderStatus(providerStatus: string): string {
  const statusMap: Record<string, string> = {
    'Pending': 'pending',
    'In progress': 'in_progress',
    'Processing': 'processing',
    'Completed': 'completed',
    'Partial': 'partial',
    'Canceled': 'cancelled',
    'Cancelled': 'cancelled',
    'Refunded': 'refunded',
  };
  return statusMap[providerStatus] || providerStatus?.toLowerCase() || 'pending';
}
