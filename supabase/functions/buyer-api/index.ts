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

// Consistent JSON response helper - matches standard SMM panel API format
function jsonResponse(data: any, statusCode = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status: statusCode, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Error response in standard SMM format
function errorResponse(message: string) {
  return jsonResponse({ error: message });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request - support JSON, form-data, and raw body
    let params: BuyerApiRequest;
    const contentType = req.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        params = await req.json();
      } else if (contentType.includes('form-data') || contentType.includes('urlencoded')) {
        const formData = await req.formData();
        params = Object.fromEntries(formData) as unknown as BuyerApiRequest;
      } else {
        // Try to parse as JSON anyway (common for API calls without proper content-type)
        const bodyText = await req.text();
        if (bodyText) {
          params = JSON.parse(bodyText);
        } else {
          return errorResponse("Request body is required");
        }
      }
    } catch (parseError: any) {
      console.error('[buyer-api] Parse error:', parseError);
      return errorResponse("Invalid request body. Expected JSON.");
    }

    const { key, action } = params;

    if (!key) {
      return errorResponse("Invalid API key");
    }

    if (!action) {
      return errorResponse("Action is required");
    }

    console.log(`[buyer-api] action=${action}, key=${key.substring(0, 10)}...`);

    // Validate API key - check both panel_api_keys and client_users tables
    let panelId: string | null = null;
    let buyerId: string | null = null;
    
    // First try panel_api_keys (panel owner keys)
    const { data: panelKeyData, error: panelKeyError } = await supabase
      .from('panel_api_keys')
      .select('panel_id, is_active')
      .eq('api_key', key)
      .eq('is_active', true)
      .maybeSingle();

    if (panelKeyData) {
      console.log('[buyer-api] Valid panel API key found');
      panelId = panelKeyData.panel_id;
    } else {
      // Try client_users for buyer-level API keys
      const { data: buyerKeyData, error: buyerKeyError } = await supabase
        .from('client_users')
        .select('id, panel_id, api_key')
        .eq('api_key', key)
        .maybeSingle();

      if (buyerKeyData) {
        console.log('[buyer-api] Valid buyer API key found for buyer:', buyerKeyData.id);
        panelId = buyerKeyData.panel_id;
        buyerId = buyerKeyData.id;
      }
    }

    if (!panelId) {
      console.log('[buyer-api] Invalid API key attempt:', key.substring(0, 10));
      return errorResponse("Invalid API key");
    }

    // Route to appropriate handler
    let response: Response;
    switch (action.toLowerCase()) {
      case 'services':
        response = await handleServices(supabase, panelId);
        break;
      
      case 'add':
        response = await handleAddOrder(supabase, panelId, params);
        break;
      
      case 'status':
        response = await handleStatus(supabase, panelId, params);
        break;
      
      case 'balance':
        response = await handleBalance(supabase, panelId, key);
        break;
      
      case 'refill':
        response = await handleRefill(supabase, panelId, params);
        break;
      
      case 'refill_status':
        response = await handleRefillStatus(supabase, panelId, params);
        break;
      
      case 'cancel':
        response = await handleCancel(supabase, panelId, params);
        break;
      
      default:
        response = errorResponse(`Unknown action: ${action}`);
    }

    // Log the API call with actual response time
    const responseTime = Date.now() - startTime;
    await supabase.from('api_logs').insert({
      panel_id: panelId,
      endpoint: `/api/v1/${action}`,
      method: 'POST',
      status_code: response.status,
      response_time_ms: responseTime
    });

    return response;

  } catch (error: any) {
    console.error('[buyer-api] Error:', error);
    return errorResponse(error.message || 'Internal server error');
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
    console.error('[buyer-api] Services fetch error:', error);
    return errorResponse('Failed to fetch services');
  }

  // Format response like standard SMM panel API
  const formattedServices = services.map((s: any, index: number) => ({
    service: s.provider_service_id || String(index + 1),
    name: s.name,
    type: s.service_type || 'Default',
    category: formatCategory(s.category),
    rate: parseFloat(s.price).toFixed(4),
    min: s.min_quantity,
    max: s.max_quantity,
    refill: s.refill_available || false,
    cancel: s.cancel_available || false,
    dripfeed: false,
    desc: s.description || '',
    average_time: s.average_time || s.estimated_time || 'N/A'
  }));

  return jsonResponse(formattedServices);
}

// Add new order
async function handleAddOrder(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { service, link, quantity, comments, username, min, max, posts, delay, expiry, runs, interval } = params;

  if (!service) {
    return errorResponse("Service ID is required");
  }

  if (!link) {
    return errorResponse("Link is required");
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
    return errorResponse("Service not found");
  }

  const orderQuantity = quantity || serviceData.min_quantity;
  
  // Validate quantity
  if (orderQuantity < serviceData.min_quantity) {
    return errorResponse(`Quantity too low. Minimum: ${serviceData.min_quantity}`);
  }
  if (orderQuantity > serviceData.max_quantity) {
    return errorResponse(`Quantity too high. Maximum: ${serviceData.max_quantity}`);
  }

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
    console.error('[buyer-api] Order creation error:', orderError);
    return errorResponse("Failed to create order");
  }

  console.log(`[buyer-api] Order created: ${order.order_number}`);

  // Return in standard SMM format
  return jsonResponse({ order: order.order_number });
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
      console.error('[buyer-api] Status fetch error:', error);
      return errorResponse("Failed to fetch orders");
    }

    const result: Record<string, any> = {};
    orderIds.forEach(id => {
      const found = orderData?.find((o: any) => o.order_number === id);
      if (found) {
        result[id] = {
          charge: parseFloat(found.price).toFixed(4),
          start_count: String(found.start_count || 0),
          status: formatStatus(found.status),
          remains: String(found.remains || 0),
          currency: "USD"
        };
      } else {
        result[id] = { error: "Incorrect order ID" };
      }
    });

    return jsonResponse(result);
  }

  // Single order
  if (!order) {
    return errorResponse("Order ID is required");
  }

  const { data: orderData, error } = await supabase
    .from('orders')
    .select('*')
    .eq('panel_id', panelId)
    .eq('order_number', String(order))
    .maybeSingle();

  if (error || !orderData) {
    return errorResponse("Incorrect order ID");
  }

  return jsonResponse({
    charge: parseFloat(orderData.price).toFixed(4),
    start_count: String(orderData.start_count || 0),
    status: formatStatus(orderData.status),
    remains: String(orderData.remains || 0),
    currency: "USD"
  });
}

// Get buyer balance - returns customer-specific balance if using customer API key
async function handleBalance(supabase: any, panelId: string, apiKey: string) {
  // First try to find a customer with this API key stored in their metadata
  // For now, we look up the panel's balance as a fallback
  // In a full implementation, customers would have their own API keys
  
  // Check if this is a customer-specific key pattern (if implemented)
  // For now, return the balance from client_users if we can match by some criteria
  // Fallback to panel balance for backward compatibility
  
  const { data: panel, error } = await supabase
    .from('panels')
    .select('balance, default_currency')
    .eq('id', panelId)
    .maybeSingle();

  if (error || !panel) {
    return errorResponse("Failed to fetch balance");
  }

  return jsonResponse({
    balance: parseFloat(panel.balance || 0).toFixed(4),
    currency: panel.default_currency || "USD"
  });
}

// Request order refill
async function handleRefill(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { order, orders } = params;

  if (!order && !orders) {
    return errorResponse("Order ID is required");
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
      console.error('[buyer-api] Refill creation error:', refillError);
      results.push({ order: orderId, refill: { error: "Failed to create refill" } });
    } else {
      results.push({ order: orderId, refill: refill.id });
    }
  }

  // Return single or array based on request
  if (!orders && results.length === 1) {
    return jsonResponse(
      results[0].refill.error 
        ? { error: results[0].refill.error } 
        : { refill: results[0].refill }
    );
  }

  return jsonResponse(results);
}

// Get refill status
async function handleRefillStatus(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { refill, refills } = params;

  if (!refill && !refills) {
    return errorResponse("Refill ID is required");
  }

  const refillIds = refills ? refills.split(',').map(r => r.trim()) : [String(refill)];

  const { data: refillData, error } = await supabase
    .from('order_refills')
    .select('id, status')
    .eq('panel_id', panelId)
    .in('id', refillIds);

  if (error) {
    console.error('[buyer-api] Refill status fetch error:', error);
    return errorResponse("Failed to fetch refill status");
  }

  if (refillIds.length === 1) {
    const found = refillData?.find((r: any) => r.id === refillIds[0]);
    if (!found) {
      return errorResponse("Incorrect refill ID");
    }
    return jsonResponse({ status: formatStatus(found.status) });
  }

  const result: Record<string, any> = {};
  refillIds.forEach(id => {
    const found = refillData?.find((r: any) => r.id === id);
    result[id] = found ? { status: formatStatus(found.status) } : { error: "Incorrect refill ID" };
  });

  return jsonResponse(result);
}

// Cancel orders
async function handleCancel(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { orders } = params;

  if (!orders) {
    return errorResponse("Order IDs are required");
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
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderData.id);

    if (updateError) {
      console.error('[buyer-api] Cancel error:', updateError);
      results.push({ order: orderId, cancel: { error: "Failed to cancel order" } });
    } else {
      results.push({ order: orderId, cancel: true });
    }
  }

  return jsonResponse(results);
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
