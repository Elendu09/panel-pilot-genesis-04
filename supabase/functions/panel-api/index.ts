import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PanelApiRequest {
  key: string;
  action: string;
  provider_id?: string;
  service_id?: string;
  markup_percent?: number;
  status?: string;
  limit?: number;
  offset?: number;
  customer_id?: string;
  order_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request
    let params: PanelApiRequest;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      params = await req.json();
    } else {
      const formData = await req.formData();
      params = Object.fromEntries(formData) as unknown as PanelApiRequest;
    }

    const { key, action } = params;

    if (!key) {
      return new Response(
        JSON.stringify({ error: "API key is required" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Panel API: action=${action}, key=${key.substring(0, 10)}...`);

    // Validate panel owner API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('panel_api_keys')
      .select('panel_id, is_active')
      .eq('api_key', key)
      .eq('is_active', true)
      .maybeSingle();

    if (apiKeyError || !apiKeyData) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const panelId = apiKeyData.panel_id;

    // Log the API call
    await supabase.from('api_logs').insert({
      panel_id: panelId,
      endpoint: `/panel-api/${action}`,
      method: 'POST',
      status_code: 200,
      response_time_ms: 0
    });

    // Route to handler
    switch (action?.toLowerCase()) {
      case 'services':
        return await handleServices(supabase, panelId, params);
      
      case 'services.sync':
        return await handleServicesSync(supabase, panelId, params);
      
      case 'orders':
        return await handleOrders(supabase, panelId, params);
      
      case 'order':
        return await handleOrder(supabase, panelId, params);
      
      case 'customers':
        return await handleCustomers(supabase, panelId, params);
      
      case 'customer':
        return await handleCustomer(supabase, panelId, params);
      
      case 'balance':
        return await handleBalance(supabase, panelId);
      
      case 'providers':
        return await handleProviders(supabase, panelId);
      
      case 'stats':
        return await handleStats(supabase, panelId);
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: any) {
    console.error('Panel API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Get panel services
async function handleServices(supabase: any, panelId: string, params: PanelApiRequest) {
  const { status, limit = 1000, offset = 0 } = params;

  let query = supabase
    .from('services')
    .select('*', { count: 'exact' })
    .eq('panel_id', panelId)
    .order('display_order', { ascending: true })
    .range(offset, offset + limit - 1);

  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'inactive') {
    query = query.eq('is_active', false);
  }

  const { data, error, count } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch services' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: data,
      total: count,
      limit,
      offset
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Sync services from provider
async function handleServicesSync(supabase: any, panelId: string, params: PanelApiRequest) {
  const { provider_id, markup_percent = 25 } = params;

  if (!provider_id) {
    return new Response(
      JSON.stringify({ error: "Provider ID is required" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Verify provider belongs to panel
  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('*')
    .eq('id', provider_id)
    .eq('panel_id', panelId)
    .single();

  if (providerError || !provider) {
    return new Response(
      JSON.stringify({ error: "Provider not found" }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Trigger sync via the existing edge function
  const syncResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/sync-provider-services`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    },
    body: JSON.stringify({
      panelId,
      providerId: provider_id,
      markupPercent: markup_percent,
      importNew: true
    })
  });

  const syncData = await syncResponse.json();

  return new Response(
    JSON.stringify(syncData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get panel orders
async function handleOrders(supabase: any, panelId: string, params: PanelApiRequest) {
  const { status, limit = 100, offset = 0 } = params;

  let query = supabase
    .from('orders')
    .select('*, services(name, category)', { count: 'exact' })
    .eq('panel_id', panelId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch orders' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: data,
      total: count,
      limit,
      offset
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get single order
async function handleOrder(supabase: any, panelId: string, params: PanelApiRequest) {
  const { order_id } = params;

  if (!order_id) {
    return new Response(
      JSON.stringify({ error: "Order ID is required" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*, services(name, category, price)')
    .eq('panel_id', panelId)
    .or(`id.eq.${order_id},order_number.eq.${order_id}`)
    .maybeSingle();

  if (error || !data) {
    return new Response(
      JSON.stringify({ error: "Order not found" }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get panel customers
async function handleCustomers(supabase: any, panelId: string, params: PanelApiRequest) {
  const { status, limit = 100, offset = 0 } = params;

  let query = supabase
    .from('client_users')
    .select('*', { count: 'exact' })
    .eq('panel_id', panelId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status === 'active') {
    query = query.eq('is_active', true).eq('is_banned', false);
  } else if (status === 'banned') {
    query = query.eq('is_banned', true);
  } else if (status === 'vip') {
    query = query.eq('is_vip', true);
  }

  const { data, error, count } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch customers' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Remove sensitive data
  const sanitized = data?.map((c: any) => ({
    ...c,
    password_hash: undefined,
    password_temp: undefined
  }));

  return new Response(
    JSON.stringify({
      success: true,
      data: sanitized,
      total: count,
      limit,
      offset
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get single customer
async function handleCustomer(supabase: any, panelId: string, params: PanelApiRequest) {
  const { customer_id } = params;

  if (!customer_id) {
    return new Response(
      JSON.stringify({ error: "Customer ID is required" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data, error } = await supabase
    .from('client_users')
    .select('*')
    .eq('panel_id', panelId)
    .eq('id', customer_id)
    .maybeSingle();

  if (error || !data) {
    return new Response(
      JSON.stringify({ error: "Customer not found" }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Remove sensitive data
  const sanitized = {
    ...data,
    password_hash: undefined,
    password_temp: undefined
  };

  return new Response(
    JSON.stringify({ success: true, data: sanitized }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get panel balance
async function handleBalance(supabase: any, panelId: string) {
  const { data, error } = await supabase
    .from('panels')
    .select('balance, monthly_revenue')
    .eq('id', panelId)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch balance' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      balance: data.balance || 0,
      monthly_revenue: data.monthly_revenue || 0,
      currency: "USD"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get connected providers
async function handleProviders(supabase: any, panelId: string) {
  const { data, error } = await supabase
    .from('providers')
    .select('id, name, api_endpoint, balance, is_active, created_at, updated_at')
    .eq('panel_id', panelId)
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch providers' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Mask API endpoints partially
  const sanitized = data?.map((p: any) => ({
    ...p,
    api_endpoint: p.api_endpoint ? new URL(p.api_endpoint).hostname : null
  }));

  return new Response(
    JSON.stringify({ success: true, data: sanitized }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get panel statistics
async function handleStats(supabase: any, panelId: string) {
  // Get counts
  const [servicesResult, ordersResult, customersResult, providersResult] = await Promise.all([
    supabase.from('services').select('id', { count: 'exact', head: true }).eq('panel_id', panelId),
    supabase.from('orders').select('id, price, status', { count: 'exact' }).eq('panel_id', panelId),
    supabase.from('client_users').select('id', { count: 'exact', head: true }).eq('panel_id', panelId),
    supabase.from('providers').select('id', { count: 'exact', head: true }).eq('panel_id', panelId).eq('is_active', true)
  ]);

  const orders = ordersResult.data || [];
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.price || 0), 0);
  const completedOrders = orders.filter((o: any) => o.status === 'completed').length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length;

  // Get today's stats
  const today = new Date().toISOString().split('T')[0];
  const { data: todayOrders } = await supabase
    .from('orders')
    .select('price')
    .eq('panel_id', panelId)
    .gte('created_at', today);

  const todayRevenue = todayOrders?.reduce((sum: number, o: any) => sum + (o.price || 0), 0) || 0;

  return new Response(
    JSON.stringify({
      success: true,
      stats: {
        total_services: servicesResult.count || 0,
        total_orders: ordersResult.count || 0,
        total_customers: customersResult.count || 0,
        active_providers: providersResult.count || 0,
        total_revenue: totalRevenue,
        today_revenue: todayRevenue,
        today_orders: todayOrders?.length || 0,
        completed_orders: completedOrders,
        pending_orders: pendingOrders,
        completion_rate: ordersResult.count ? ((completedOrders / ordersResult.count) * 100).toFixed(1) : 0
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
