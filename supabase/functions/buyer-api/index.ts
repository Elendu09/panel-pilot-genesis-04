import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

function jsonResponse(data: any, statusCode = 200) {
  return new Response(
    JSON.stringify(data),
    { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

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

    let params: BuyerApiRequest;
    const contentType = req.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        params = await req.json();
      } else if (contentType.includes('form-data') || contentType.includes('urlencoded')) {
        const formData = await req.formData();
        params = Object.fromEntries(formData) as unknown as BuyerApiRequest;
      } else {
        const bodyText = await req.text();
        if (bodyText) {
          params = JSON.parse(bodyText);
        } else {
          return errorResponse("Request body is required");
        }
      }
    } catch (parseError: any) {
      console.error('[buyer-api] Parse error:', (parseError as Error).message);
      return errorResponse("Invalid request body. Expected JSON.");
    }

    const { key, action } = params;

    if (!key) return errorResponse("Invalid API key");
    if (!action) return errorResponse("Action is required");

    console.log(`[buyer-api] action=${action}`);

    // Validate API key — or use buyerId+panelId direct auth for order tracking
    let panelId: string | null = null;
    let buyerId: string | null = null;
    
    // Special auth path: buyerId+panelId direct auth (for LiveOrderTracker without API key)
    if (key === '__buyer_id_auth__' && (params as any).buyerId && (params as any).panelId) {
      const directBuyerId = (params as any).buyerId;
      const directPanelId = (params as any).panelId;
      
      // Validate buyer exists on this panel
      const { data: buyerCheck } = await supabase
        .from('client_users')
        .select('id')
        .eq('id', directBuyerId)
        .eq('panel_id', directPanelId)
        .maybeSingle();
      
      if (buyerCheck) {
        panelId = directPanelId;
        buyerId = directBuyerId;
      }
    }
    
    // Standard API key auth
    if (!panelId) {
      const { data: panelKeyData } = await supabase
        .from('panel_api_keys')
        .select('panel_id, is_active')
        .eq('api_key', key)
        .eq('is_active', true)
        .maybeSingle();

      if (panelKeyData) {
        panelId = panelKeyData.panel_id;
      } else {
        const { data: buyerKeyData } = await supabase
          .from('client_users')
          .select('id, panel_id, api_key')
          .eq('api_key', key)
          .maybeSingle();

        if (buyerKeyData) {
          panelId = buyerKeyData.panel_id;
          buyerId = buyerKeyData.id;
        }
      }
    }

    if (!panelId) return errorResponse("Invalid API key");

    let response: Response;
    switch (action.toLowerCase()) {
      case 'services':
        response = await handleServices(supabase, panelId);
        break;
      case 'add':
        response = await handleAddOrder(supabase, panelId, buyerId, params);
        break;
      case 'status':
        response = await handleStatus(supabase, panelId, params);
        break;
      case 'balance':
        response = await handleBalance(supabase, panelId, key, buyerId);
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
      case 'get-orders':
        response = await handleGetOrders(supabase, panelId, buyerId);
        break;
      case 'get-order':
        response = await handleGetOrder(supabase, panelId, buyerId, params);
        break;
      default:
        response = errorResponse(`Unknown action: ${action}`);
    }

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
    console.error('[buyer-api] Error:', (error as Error).message);
    return errorResponse((error as Error).message || 'Internal server error');
  }
});

// Get all services for the panel
async function handleServices(supabase: any, panelId: string) {
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('panel_id', panelId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[buyer-api] Services fetch error:', error);
    return errorResponse('Failed to fetch services');
  }

  // Return display_order as the panel's own service ID (not provider_service_id)
  const formattedServices = services.map((s: any) => ({
    service: s.display_order || s.id,
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

// Resolve the external service ID that the provider API expects
function resolveExternalServiceId(
  service: { provider_service_id?: string }
): string | null {
  if (service.provider_service_id) {
    console.log(`[buyer-api] Using provider_service_id directly: ${service.provider_service_id}`);
    return service.provider_service_id;
  }
  return null;
}

// Forward order to upstream provider
async function forwardOrderToProvider(
  supabase: any,
  serviceId: string,
  targetUrl: string,
  quantity: number,
  orderId: string
): Promise<{ success: boolean; externalOrderId?: string; error?: string }> {
  try {
    const { data: service } = await supabase
      .from('services')
      .select('provider_id, provider_service_id, provider_service_ref')
      .eq('id', serviceId)
      .single();

    if (!service?.provider_id) {
      return { success: false, error: 'No provider linked' };
    }

    const externalServiceId = resolveExternalServiceId(service);
    if (!externalServiceId) {
      return { success: false, error: 'No external service ID found' };
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('api_endpoint, api_key, is_active')
      .eq('id', service.provider_id)
      .single();

    if (!provider || !provider.is_active) {
      return { success: false, error: 'Provider inactive' };
    }

    const formData = new URLSearchParams();
    formData.append('key', provider.api_key);
    formData.append('action', 'add');
    formData.append('service', externalServiceId);
    formData.append('link', targetUrl);
    formData.append('quantity', String(quantity));

    const response = await fetch(provider.api_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('[buyer-api] Provider response:', JSON.stringify(result));

    if (result.order) {
      await supabase
        .from('orders')
        .update({ provider_order_id: String(result.order), status: 'in_progress' })
        .eq('id', orderId);
      return { success: true, externalOrderId: String(result.order) };
    } else {
      await supabase
        .from('orders')
        .update({ notes: `Provider error: ${result.error || 'Unknown'}` })
        .eq('id', orderId);
      return { success: false, error: result.error || 'Unknown provider error' };
    }
  } catch (error: any) {
    console.error('[buyer-api] Provider forwarding error:', (error as Error).message);
    return { success: false, error: (error as Error).message };
  }
}

// Add new order — with balance check & deduction
async function handleAddOrder(supabase: any, panelId: string, buyerId: string | null, params: BuyerApiRequest) {
  const { service, link, quantity, comments } = params;

  if (!service) return errorResponse("Service ID is required");
  if (!link) return errorResponse("Link is required");

  // Sanitize service ID to prevent injection in .or() query
  const sanitizedService = String(service).replace(/[^a-zA-Z0-9_-]/g, '');

  // Find the service
  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('panel_id', panelId)
    .eq('is_active', true)
    .or(`provider_service_id.eq.${sanitizedService},id.eq.${sanitizedService}`)
    .maybeSingle();

  if (serviceError || !serviceData) return errorResponse("Service not found");

  const orderQuantity = quantity || serviceData.min_quantity;
  
  if (orderQuantity < serviceData.min_quantity) {
    return errorResponse(`Quantity too low. Minimum: ${serviceData.min_quantity}`);
  }
  if (orderQuantity > serviceData.max_quantity) {
    return errorResponse(`Quantity too high. Maximum: ${serviceData.max_quantity}`);
  }

  const price = (serviceData.price / 1000) * orderQuantity;

  // ── Balance check & deduction ──
  if (buyerId) {
    // Buyer-level API key: check buyer balance + total_spent
    const { data: buyer, error: buyerErr } = await supabase
      .from('client_users')
      .select('balance, total_spent')
      .eq('id', buyerId)
      .single();

    if (buyerErr || !buyer) return errorResponse("Failed to fetch balance");

    const currentBalance = parseFloat(buyer.balance || 0);
    if (currentBalance < price) {
      return errorResponse("Not enough funds");
    }

    // Deduct balance
    const { error: deductErr } = await supabase
      .from('client_users')
      .update({
        balance: currentBalance - price,
        total_spent: (parseFloat(buyer.total_spent || 0)) + price
      })
      .eq('id', buyerId);

    if (deductErr) {
      console.error('[buyer-api] Balance deduction error:', deductErr);
      return errorResponse("Failed to process payment");
    }
  } else {
    // Panel-level API key: check panel balance
    const { data: panel, error: panelErr } = await supabase
      .from('panels')
      .select('balance')
      .eq('id', panelId)
      .single();

    if (panelErr || !panel) return errorResponse("Failed to fetch panel balance");

    const panelBalance = parseFloat(panel.balance || 0);
    if (panelBalance < price) {
      return errorResponse("Not enough funds");
    }

    const { error: deductErr } = await supabase
      .from('panels')
      .update({ balance: panelBalance - price })
      .eq('id', panelId);

    if (deductErr) {
      console.error('[buyer-api] Panel balance deduction error:', deductErr);
      return errorResponse("Failed to process payment");
    }
  }

  const orderNumber = 'ORD' + Date.now().toString().slice(-10) + Math.random().toString(36).slice(-4).toUpperCase();

  // Create order
  const orderPayload: Record<string, any> = {
    panel_id: panelId,
    service_id: serviceData.id,
    order_number: orderNumber,
    target_url: link,
    quantity: orderQuantity,
    price: price,
    status: 'pending',
    buyer_id: buyerId || null,
    notes: comments || null
  };
  // Include service_name if available (column may or may not exist)
  if (serviceData.name) {
    orderPayload.service_name = serviceData.name;
  }

  console.log(`[buyer-api] Creating order payload:`, JSON.stringify(orderPayload));

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select('id, order_number')
    .single();

  if (orderError) {
    console.error('[buyer-api] Order creation error:', orderError);
    // Refund balance on order creation failure — direct update only (no non-existent RPC)
    if (buyerId) {
      try {
        const { data: b } = await supabase.from('client_users').select('balance, total_spent').eq('id', buyerId).single();
        if (b) {
          await supabase.from('client_users').update({ 
            balance: parseFloat(b.balance || 0) + price,
            total_spent: Math.max(0, parseFloat(b.total_spent || 0) - price)
          }).eq('id', buyerId);
        }
      } catch (refundErr) {
        console.error('[buyer-api] Refund on failure error:', (refundErr as Error).message);
      }
    }
    return errorResponse("Failed to create order");
  }

  // Forward to upstream provider
  const providerResult = await forwardOrderToProvider(supabase, serviceData.id, link, orderQuantity, order.id);
  console.log(`[buyer-api] Order ${order.order_number} forwarding result:`, providerResult);

  // Surface provider errors alongside order number
  if (!providerResult.success) {
    return jsonResponse({ 
      order: order.order_number, 
      provider_error: providerResult.error || 'Provider forwarding failed'
    });
  }

  return jsonResponse({ order: order.order_number });
}

// Get order status (single or multiple)
async function handleStatus(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { order, orders } = params;

  if (orders) {
    const orderIds = orders.split(',').map(o => o.trim());
    const { data: orderData, error } = await supabase
      .from('orders')
      .select('order_number, price, start_count, status, remains, quantity')
      .eq('panel_id', panelId)
      .in('order_number', orderIds);

    if (error) return errorResponse("Failed to fetch orders");

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

  if (!order) return errorResponse("Order ID is required");

  const { data: orderData, error } = await supabase
    .from('orders')
    .select('*')
    .eq('panel_id', panelId)
    .eq('order_number', String(order))
    .maybeSingle();

  if (error || !orderData) return errorResponse("Incorrect order ID");

  return jsonResponse({
    charge: parseFloat(orderData.price).toFixed(4),
    start_count: String(orderData.start_count || 0),
    status: formatStatus(orderData.status),
    remains: String(orderData.remains || 0),
    currency: "USD"
  });
}

// Get buyer balance
async function handleBalance(supabase: any, panelId: string, apiKey: string, buyerId: string | null) {
  if (buyerId) {
    const { data: buyer, error } = await supabase
      .from('client_users')
      .select('balance')
      .eq('id', buyerId)
      .single();
    
    if (error || !buyer) return errorResponse("Failed to fetch balance");
    
    return jsonResponse({
      balance: parseFloat(buyer.balance || 0).toFixed(4),
      currency: "USD"
    });
  }
  
  const { data: panel, error } = await supabase
    .from('panels')
    .select('balance, default_currency')
    .eq('id', panelId)
    .maybeSingle();

  if (error || !panel) return errorResponse("Failed to fetch balance");

  return jsonResponse({
    balance: parseFloat(panel.balance || 0).toFixed(4),
    currency: panel.default_currency || "USD"
  });
}

// Request order refill
async function handleRefill(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { order, orders } = params;
  if (!order && !orders) return errorResponse("Order ID is required");

  const orderIds = orders ? orders.split(',').map(o => o.trim()) : [String(order)];
  const results: any[] = [];

  for (const orderId of orderIds) {
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

    const { data: refill, error: refillError } = await supabase
      .from('order_refills')
      .insert({ order_id: orderData.id, panel_id: panelId, status: 'pending' })
      .select('id')
      .single();

    if (refillError) {
      results.push({ order: orderId, refill: { error: "Failed to create refill" } });
    } else {
      results.push({ order: orderId, refill: refill.id });
    }
  }

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
  if (!refill && !refills) return errorResponse("Refill ID is required");

  const refillIds = refills ? refills.split(',').map(r => r.trim()) : [String(refill)];

  const { data: refillData, error } = await supabase
    .from('order_refills')
    .select('id, status')
    .eq('panel_id', panelId)
    .in('id', refillIds);

  if (error) return errorResponse("Failed to fetch refill status");

  if (refillIds.length === 1) {
    const found = refillData?.find((r: any) => r.id === refillIds[0]);
    if (!found) return errorResponse("Incorrect refill ID");
    return jsonResponse({ status: formatStatus(found.status) });
  }

  const result: Record<string, any> = {};
  refillIds.forEach(id => {
    const found = refillData?.find((r: any) => r.id === id);
    result[id] = found ? { status: formatStatus(found.status) } : { error: "Incorrect refill ID" };
  });
  return jsonResponse(result);
}

// Cancel orders — with proper balance refund
async function handleCancel(supabase: any, panelId: string, params: BuyerApiRequest) {
  const { orders } = params;
  if (!orders) return errorResponse("Order IDs are required");

  const orderIds = orders.split(',').map(o => o.trim());
  const results: any[] = [];

  for (const orderId of orderIds) {
    const { data: orderData, error } = await supabase
      .from('orders')
      .select('id, status, price, buyer_id')
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

    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderData.id);

    if (updateError) {
      results.push({ order: orderId, cancel: { error: "Failed to cancel order" } });
    } else {
      // Refund balance on cancellation — read balance+total_spent together
      if (orderData.buyer_id && orderData.price) {
        try {
          const { data: buyer } = await supabase
            .from('client_users')
            .select('balance, total_spent')
            .eq('id', orderData.buyer_id)
            .single();
          if (buyer) {
            const refundPrice = parseFloat(orderData.price);
            await supabase.from('client_users').update({ 
              balance: parseFloat(buyer.balance || 0) + refundPrice,
              total_spent: Math.max(0, parseFloat(buyer.total_spent || 0) - refundPrice)
            }).eq('id', orderData.buyer_id);
          }
        } catch (refundErr) {
          console.error('[buyer-api] Cancel refund error:', (refundErr as Error).message);
        }
      }
      results.push({ order: orderId, cancel: true });
    }
  }
  return jsonResponse(results);
}

// Get all orders for a buyer
async function handleGetOrders(supabase: any, panelId: string, buyerId: string | null) {
  if (!buyerId) return errorResponse("Buyer authentication required");

  const { data, error } = await supabase
    .from('orders')
    .select('*, service:services(name, provider_service_id)')
    .eq('panel_id', panelId)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('[buyer-api] get-orders error:', error);
    return errorResponse("Failed to fetch orders");
  }

  return jsonResponse(data || []);
}

// Get single order for a buyer
async function handleGetOrder(supabase: any, panelId: string, buyerId: string | null, params: any) {
  const orderId = params.orderId || params.order_id;
  const orderNumber = params.orderNumber || params.order_number;

  if (!orderId && !orderNumber) return errorResponse("Order ID or order number required");

  let query = supabase
    .from('orders')
    .select('*')
    .eq('panel_id', panelId);

  if (orderId) {
    query = query.eq('id', orderId);
  } else {
    query = query.eq('order_number', orderNumber);
  }

  // Only enforce buyer ownership if buyerId is present
  if (buyerId) {
    query = query.eq('buyer_id', buyerId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('[buyer-api] get-order error:', error);
    return errorResponse("Failed to fetch order");
  }

  if (!data) return errorResponse("Order not found");

  return jsonResponse(data);
}

// Helper functions
function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    instagram: 'Instagram', facebook: 'Facebook', twitter: 'Twitter / X',
    youtube: 'YouTube', tiktok: 'TikTok', telegram: 'Telegram',
    linkedin: 'LinkedIn', spotify: 'Spotify', twitch: 'Twitch',
    discord: 'Discord', threads: 'Threads', other: 'Other Services'
  };
  return categoryMap[category?.toLowerCase()] || category || 'Other';
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pending', processing: 'In progress', in_progress: 'In progress',
    completed: 'Completed', partial: 'Partial', cancelled: 'Canceled',
    canceled: 'Canceled', refunded: 'Refunded', failed: 'Failed'
  };
  return statusMap[status?.toLowerCase()] || status || 'Pending';
}
