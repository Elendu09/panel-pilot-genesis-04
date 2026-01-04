import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuyerApiRequest {
  key: string;
  action: string;
  service?: string | number;
  link?: string;
  quantity?: number;
  order?: string | number;
  orders?: string;
  refill?: string | number;
  refills?: string;
  comments?: string;
  username?: string;
  min?: number;
  max?: number;
  posts?: number;
  delay?: number;
  expiry?: string;
  runs?: number;
  interval?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body (supports both JSON and form-data)
    let params: BuyerApiRequest;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      params = await req.json();
    } else {
      const formData = await req.formData();
      params = Object.fromEntries(formData) as unknown as BuyerApiRequest;
    }

    const { key, action } = params;

    if (!key) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Action is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Buyer API: action=${action}, key=${key.substring(0, 10)}...`);

    // Validate API key and get buyer
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('panel_api_keys')
      .select('panel_id, is_active')
      .eq('api_key', key)
      .eq('is_active', true)
      .maybeSingle();

    if (apiKeyError || !apiKeyData) {
      console.log('Invalid API key attempt:', key.substring(0, 10));
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const panelId = apiKeyData.panel_id;

    // Log the API call
    await supabase.from('api_logs').insert({
      panel_id: panelId,
      endpoint: `/api/v2/${action}`,
      method: 'POST',
      status_code: 200,
      response_time_ms: 0
    });

    // Route to appropriate handler
    switch (action.toLowerCase()) {
      case 'services':
        return await handleServices(supabase, panelId);
      
      case 'add':
        return await handleAddOrder(supabase, panelId, params);
      
      case 'status':
        return await handleStatus(supabase, panelId, params);
      
      case 'balance':
        return await handleBalance(supabase, panelId, key);
      
      case 'refill':
        return await handleRefill(supabase, panelId, params);
      
      case 'refill_status':
        return await handleRefillStatus(supabase, panelId, params);
      
      case 'cancel':
        return await handleCancel(supabase, panelId, params);
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: any) {
    console.error('Buyer API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Get all services for the panel
async function handleServices(supabase: any, panelId: string) {
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('panel_id', panelId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch services' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Format response like standard SMM panel API
  const formattedServices = services.map((s: any, index: number) => ({
    service: s.provider_service_id || String(index + 1),
    name: s.name,
    type: s.service_type || 'Default',
    category: formatCategory(s.category),
    rate: s.price.toFixed(4),
    min: s.min_quantity,
    max: s.max_quantity,
    refill: s.refill_available || false,
    cancel: s.cancel_available || false,
    dripfeed: false,
    desc: s.description || '',
    average_time: s.average_time || s.estimated_time || 'N/A'
  }));

  return new Response(
    JSON.stringify(formattedServices),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Add new order
async function handleAddOrder(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { service, link, quantity, comments, username, min, max, posts, delay, expiry, runs, interval } = params;

  if (!service || !link) {
    return new Response(
      JSON.stringify({ error: "Service and link are required" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Find the service
  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('panel_id', panelId)
    .eq('is_active', true)
    .or(`provider_service_id.eq.${service},id.eq.${service}`)
    .maybeSingle();

  if (serviceError || !serviceData) {
    return new Response(
      JSON.stringify({ error: "Service not found" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const orderQuantity = quantity || serviceData.min_quantity;
  const price = (serviceData.price / 1000) * orderQuantity;

  // Generate order number
  const orderNumber = 'ORD' + Date.now().toString().slice(-10) + Math.random().toString(36).slice(-4).toUpperCase();

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      panel_id: panelId,
      service_id: serviceData.id,
      order_number: orderNumber,
      target_url: link,
      quantity: orderQuantity,
      price: price,
      status: 'pending',
      notes: comments || null
    })
    .select('id, order_number')
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    return new Response(
      JSON.stringify({ error: "Failed to create order" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // TODO: Forward order to provider if configured
  // This would call the upstream SMM panel's API

  console.log(`Order created: ${order.order_number}`);

  return new Response(
    JSON.stringify({ order: order.order_number }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get order status (single or multiple)
async function handleStatus(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { order, orders } = params;

  // Multiple orders
  if (orders) {
    const orderIds = orders.split(',').map(o => o.trim());
    const { data: orderData, error } = await supabase
      .from('orders')
      .select('order_number, price, start_count, status, remains, quantity')
      .eq('panel_id', panelId)
      .in('order_number', orderIds);

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch orders" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: Record<string, any> = {};
    orderIds.forEach(id => {
      const found = orderData?.find((o: any) => o.order_number === id);
      if (found) {
        result[id] = {
          charge: found.price.toFixed(4),
          start_count: found.start_count?.toString() || "0",
          status: formatStatus(found.status),
          remains: found.remains?.toString() || "0",
          currency: "USD"
        };
      } else {
        result[id] = { error: "Incorrect order ID" };
      }
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Single order
  if (!order) {
    return new Response(
      JSON.stringify({ error: "Order ID is required" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { data: orderData, error } = await supabase
    .from('orders')
    .select('*')
    .eq('panel_id', panelId)
    .eq('order_number', String(order))
    .maybeSingle();

  if (error || !orderData) {
    return new Response(
      JSON.stringify({ error: "Incorrect order ID" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      charge: orderData.price.toFixed(4),
      start_count: orderData.start_count?.toString() || "0",
      status: formatStatus(orderData.status),
      remains: orderData.remains?.toString() || "0",
      currency: "USD"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get buyer balance (placeholder - would need buyer auth)
async function handleBalance(supabase: any, panelId: string, apiKey: string) {
  // For now, return panel balance - in full implementation would return buyer's balance
  const { data: panel, error } = await supabase
    .from('panels')
    .select('balance')
    .eq('id', panelId)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch balance" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      balance: (panel.balance || 0).toFixed(4),
      currency: "USD"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Request order refill
async function handleRefill(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { order, orders } = params;

  if (!order && !orders) {
    return new Response(
      JSON.stringify({ error: "Order ID is required" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const orderIds = orders ? orders.split(',').map(o => o.trim()) : [String(order)];
  const results: any[] = [];

  for (const orderId of orderIds) {
    // Check order exists and is refillable
    const { data: orderData, error } = await supabase
      .from('orders')
      .select('id, status, service_id, services(refill_available)')
      .eq('panel_id', panelId)
      .eq('order_number', orderId)
      .maybeSingle();

    if (error || !orderData) {
      results.push({ order: orderId, refill: { error: "Incorrect order ID" } });
      continue;
    }

    if (orderData.status !== 'completed') {
      results.push({ order: orderId, refill: { error: "Order is not completed" } });
      continue;
    }

    // Create refill request
    const { data: refill, error: refillError } = await supabase
      .from('order_refills')
      .insert({
        order_id: orderData.id,
        panel_id: panelId,
        status: 'pending'
      })
      .select('id')
      .single();

    if (refillError) {
      results.push({ order: orderId, refill: { error: "Failed to create refill" } });
    } else {
      results.push({ order: orderId, refill: refill.id });
    }
  }

  // Return single or array based on request
  if (!orders && results.length === 1) {
    return new Response(
      JSON.stringify(results[0].refill.error ? { error: results[0].refill.error } : { refill: results[0].refill }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify(results),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get refill status
async function handleRefillStatus(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { refill, refills } = params;

  if (!refill && !refills) {
    return new Response(
      JSON.stringify({ error: "Refill ID is required" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const refillIds = refills ? refills.split(',').map(r => r.trim()) : [String(refill)];

  const { data: refillData, error } = await supabase
    .from('order_refills')
    .select('id, status')
    .eq('panel_id', panelId)
    .in('id', refillIds);

  if (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch refill status" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (refillIds.length === 1) {
    const found = refillData?.find((r: any) => r.id === refillIds[0]);
    if (!found) {
      return new Response(
        JSON.stringify({ error: "Incorrect refill ID" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ status: formatStatus(found.status) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const result: Record<string, any> = {};
  refillIds.forEach(id => {
    const found = refillData?.find((r: any) => r.id === id);
    result[id] = found ? { status: formatStatus(found.status) } : { error: "Incorrect refill ID" };
  });

  return new Response(
    JSON.stringify(result),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Cancel orders
async function handleCancel(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { orders } = params;

  if (!orders) {
    return new Response(
      JSON.stringify({ error: "Order IDs are required" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const orderIds = orders.split(',').map(o => o.trim());
  const results: any[] = [];

  for (const orderId of orderIds) {
    const { data: orderData, error } = await supabase
      .from('orders')
      .select('id, status, service_id, services(cancel_available)')
      .eq('panel_id', panelId)
      .eq('order_number', orderId)
      .maybeSingle();

    if (error || !orderData) {
      results.push({ order: orderId, cancel: { error: "Incorrect order ID" } });
      continue;
    }

    if (orderData.status !== 'pending') {
      results.push({ order: orderId, cancel: { error: "Order cannot be cancelled" } });
      continue;
    }

    // Update order status
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderData.id);

    results.push({ order: orderId, cancel: true });
  }

  return new Response(
    JSON.stringify(results),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper functions
function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook', 
    twitter: 'Twitter / X',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    telegram: 'Telegram',
    linkedin: 'LinkedIn',
    spotify: 'Spotify',
    twitch: 'Twitch',
    discord: 'Discord',
    threads: 'Threads',
    other: 'Other Services'
  };
  return categoryMap[category?.toLowerCase()] || category || 'Other';
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    processing: 'In progress',
    in_progress: 'In progress',
    completed: 'Completed',
    partial: 'Partial',
    cancelled: 'Canceled',
    canceled: 'Canceled',
    refunded: 'Refunded',
    failed: 'Failed'
  };
  return statusMap[status?.toLowerCase()] || status || 'Pending';
}
