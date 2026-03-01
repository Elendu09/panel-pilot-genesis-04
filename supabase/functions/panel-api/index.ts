import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
  // Service update fields
  is_active?: boolean;
  price?: number;
  min_quantity?: number;
  max_quantity?: number;
  name?: string;
  description?: string;
  // Customer update fields
  balance?: number;
  is_vip?: boolean;
  is_banned?: boolean;
  custom_discount?: number;
}

// Consistent JSON response helper
function jsonResponse(data: any, statusCode = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status: statusCode, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Error response helper
function errorResponse(message: string, statusCode = 400) {
  return jsonResponse({ success: false, error: message }, statusCode);
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
    let params: PanelApiRequest;
    const contentType = req.headers.get('content-type') || '';
    
    try {
      if (contentType.includes('application/json')) {
        params = await req.json();
      } else if (contentType.includes('form-data') || contentType.includes('urlencoded')) {
        const formData = await req.formData();
        params = Object.fromEntries(formData) as unknown as PanelApiRequest;
      } else {
        // Try to parse as JSON anyway (common for API calls without proper content-type)
        const bodyText = await req.text();
        if (bodyText) {
          params = JSON.parse(bodyText);
        } else {
          return errorResponse("Request body is required", 400);
        }
      }
    } catch (parseError: any) {
      console.error('[panel-api] Parse error:', parseError);
      return errorResponse("Invalid request body. Expected JSON.", 400);
    }

    const { key, action } = params;

    if (!key) {
      return errorResponse("API key is required", 401);
    }

    if (!action) {
      return errorResponse("Action is required", 400);
    }

    console.log(`[panel-api] action=${action}`);

    // Validate panel owner API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('panel_api_keys')
      .select('panel_id, is_active')
      .eq('api_key', key)
      .eq('is_active', true)
      .maybeSingle();

    if (apiKeyError || !apiKeyData) {
      console.log('[panel-api] Invalid API key');
      return errorResponse("Invalid API key", 401);
    }

    const panelId = apiKeyData.panel_id;

    // Route to handler
    let response: Response;
    switch (action?.toLowerCase()) {
      case 'services':
        response = await handleServices(supabase, panelId, params);
        break;
      
      case 'services.sync':
        response = await handleServicesSync(supabase, panelId, params);
        break;
      
      case 'service.update':
        response = await handleServiceUpdate(supabase, panelId, params);
        break;
      
      case 'orders':
        response = await handleOrders(supabase, panelId, params);
        break;
      
      case 'order':
        response = await handleOrder(supabase, panelId, params);
        break;
      
      case 'customers':
        response = await handleCustomers(supabase, panelId, params);
        break;
      
      case 'customer':
        response = await handleCustomer(supabase, panelId, params);
        break;
      
      case 'customer.update':
        response = await handleCustomerUpdate(supabase, panelId, params);
        break;
      
      case 'balance':
        response = await handleBalance(supabase, panelId);
        break;
      
      case 'providers':
        response = await handleProviders(supabase, panelId);
        break;
      
      case 'stats':
        response = await handleStats(supabase, panelId);
        break;
      
      default:
        response = errorResponse(`Unknown action: ${action}`, 400);
    }

    // Log the API call with actual response time
    const responseTime = Date.now() - startTime;
    await supabase.from('api_logs').insert({
      panel_id: panelId,
      endpoint: `/api/v2/panel/${action}`,
      method: 'POST',
      status_code: response.status,
      response_time_ms: responseTime
    });

    return response;

  } catch (error: any) {
    console.error('[panel-api] Error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
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
    console.error('[panel-api] Services fetch error:', error);
    return errorResponse('Failed to fetch services', 500);
  }

  return jsonResponse({
    success: true,
    data: data,
    total: count,
    limit,
    offset
  });
}

// Sync services from provider - FIXED: Direct implementation instead of calling another edge function
async function handleServicesSync(supabase: any, panelId: string, params: PanelApiRequest) {
  const { provider_id, markup_percent = 25 } = params;

  if (!provider_id) {
    return errorResponse("provider_id is required", 400);
  }

  // Verify provider belongs to panel
  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('*')
    .eq('id', provider_id)
    .eq('panel_id', panelId)
    .maybeSingle();

  if (providerError || !provider) {
    return errorResponse("Provider not found", 404);
  }

  console.log(`[panel-api] Syncing services from provider: ${provider.name}`);

  try {
    // Fetch services from upstream provider API
    const providerResponse = await fetch(provider.api_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: provider.api_key, action: 'services' })
    });

    if (!providerResponse.ok) {
      return errorResponse(`Provider API error: ${providerResponse.status}`, 502);
    }

    const providerServices = await providerResponse.json();

    if (!Array.isArray(providerServices)) {
      return errorResponse("Invalid response from provider API", 502);
    }

    let imported = 0;
    let updated = 0;
    let failed = 0;

    for (const svc of providerServices) {
      const serviceId = String(svc.service || svc.id);
      const providerRate = parseFloat(svc.rate) || 0;
      const buyerPrice = providerRate * (1 + markup_percent / 100);

      // Check if service already exists
      const { data: existing } = await supabase
        .from('services')
        .select('id')
        .eq('panel_id', panelId)
        .eq('provider_service_id', serviceId)
        .maybeSingle();

      const serviceData = {
        panel_id: panelId,
        provider_id: provider_id,
        provider_service_id: serviceId,
        name: svc.name || `Service ${serviceId}`,
        description: svc.desc || svc.description || null,
        category: svc.category?.toLowerCase()?.replace(/[^a-z0-9]/g, '_') || 'other',
        price: buyerPrice,
        provider_rate: providerRate,
        min_quantity: parseInt(svc.min) || 1,
        max_quantity: parseInt(svc.max) || 100000,
        service_type: svc.type || 'Default',
        refill_available: svc.refill === true || svc.refill === 'true',
        cancel_available: svc.cancel === true || svc.cancel === 'true',
        estimated_time: svc.average_time || null,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', existing.id);

        if (error) {
          console.error(`[panel-api] Update error for service ${serviceId}:`, error);
          failed++;
        } else {
          updated++;
        }
      } else {
        // Insert new service
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) {
          console.error(`[panel-api] Insert error for service ${serviceId}:`, error);
          failed++;
        } else {
          imported++;
        }
      }
    }

    // Update provider last sync time
    await supabase
      .from('providers')
      .update({ 
        last_synced: new Date().toISOString(),
        sync_status: 'synced'
      })
      .eq('id', provider_id);

    console.log(`[panel-api] Sync complete: ${imported} imported, ${updated} updated, ${failed} failed`);

    return jsonResponse({
      success: true,
      message: 'Services synced successfully',
      stats: {
        total_from_provider: providerServices.length,
        imported,
        updated,
        failed
      }
    });

  } catch (error: any) {
    console.error('[panel-api] Sync error:', error);
    return errorResponse(`Failed to sync: ${error.message}`, 500);
  }
}

// Update a service
async function handleServiceUpdate(supabase: any, panelId: string, params: PanelApiRequest) {
  const { service_id, is_active, price, min_quantity, max_quantity, name, description } = params;

  if (!service_id) {
    return errorResponse("service_id is required", 400);
  }

  // Verify service belongs to panel
  const { data: service, error: findError } = await supabase
    .from('services')
    .select('id')
    .eq('panel_id', panelId)
    .or(`id.eq.${service_id},provider_service_id.eq.${service_id}`)
    .maybeSingle();

  if (findError || !service) {
    return errorResponse("Service not found", 404);
  }

  // Build update object
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (is_active !== undefined) updates.is_active = is_active;
  if (price !== undefined) updates.price = price;
  if (min_quantity !== undefined) updates.min_quantity = min_quantity;
  if (max_quantity !== undefined) updates.max_quantity = max_quantity;
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;

  const { error: updateError } = await supabase
    .from('services')
    .update(updates)
    .eq('id', service.id);

  if (updateError) {
    console.error('[panel-api] Service update error:', updateError);
    return errorResponse("Failed to update service", 500);
  }

  return jsonResponse({ success: true, message: 'Service updated' });
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
    console.error('[panel-api] Orders fetch error:', error);
    return errorResponse('Failed to fetch orders', 500);
  }

  return jsonResponse({
    success: true,
    data: data,
    total: count,
    limit,
    offset
  });
}

// Get single order
async function handleOrder(supabase: any, panelId: string, params: PanelApiRequest) {
  const { order_id } = params;

  if (!order_id) {
    return errorResponse("order_id is required", 400);
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*, services(name, category, price)')
    .eq('panel_id', panelId)
    .or(`id.eq.${order_id},order_number.eq.${order_id}`)
    .maybeSingle();

  if (error || !data) {
    return errorResponse("Order not found", 404);
  }

  return jsonResponse({ success: true, data });
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
    console.error('[panel-api] Customers fetch error:', error);
    return errorResponse('Failed to fetch customers', 500);
  }

  // Remove sensitive data
  const sanitized = data?.map((c: any) => ({
    ...c,
    password_hash: undefined,
    password_temp: undefined
  }));

  return jsonResponse({
    success: true,
    data: sanitized,
    total: count,
    limit,
    offset
  });
}

// Get single customer
async function handleCustomer(supabase: any, panelId: string, params: PanelApiRequest) {
  const { customer_id } = params;

  if (!customer_id) {
    return errorResponse("customer_id is required", 400);
  }

  const { data, error } = await supabase
    .from('client_users')
    .select('*')
    .eq('panel_id', panelId)
    .eq('id', customer_id)
    .maybeSingle();

  if (error || !data) {
    return errorResponse("Customer not found", 404);
  }

  // Remove sensitive data
  const sanitized = {
    ...data,
    password_hash: undefined,
    password_temp: undefined
  };

  return jsonResponse({ success: true, data: sanitized });
}

// Update customer
async function handleCustomerUpdate(supabase: any, panelId: string, params: PanelApiRequest) {
  const { customer_id, balance, is_vip, is_banned, custom_discount } = params;

  if (!customer_id) {
    return errorResponse("customer_id is required", 400);
  }

  // Verify customer belongs to panel
  const { data: customer, error: findError } = await supabase
    .from('client_users')
    .select('id')
    .eq('panel_id', panelId)
    .eq('id', customer_id)
    .maybeSingle();

  if (findError || !customer) {
    return errorResponse("Customer not found", 404);
  }

  // Build update object
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (balance !== undefined) updates.balance = balance;
  if (is_vip !== undefined) updates.is_vip = is_vip;
  if (is_banned !== undefined) updates.is_banned = is_banned;
  if (custom_discount !== undefined) updates.custom_discount = custom_discount;

  const { error: updateError } = await supabase
    .from('client_users')
    .update(updates)
    .eq('id', customer_id);

  if (updateError) {
    console.error('[panel-api] Customer update error:', updateError);
    return errorResponse("Failed to update customer", 500);
  }

  return jsonResponse({ success: true, message: 'Customer updated' });
}

// Get panel balance
async function handleBalance(supabase: any, panelId: string) {
  const { data, error } = await supabase
    .from('panels')
    .select('balance, monthly_revenue')
    .eq('id', panelId)
    .maybeSingle();

  if (error || !data) {
    return errorResponse('Failed to fetch balance', 500);
  }

  return jsonResponse({
    success: true,
    balance: data.balance || 0,
    monthly_revenue: data.monthly_revenue || 0,
    currency: "USD"
  });
}

// Get connected providers
async function handleProviders(supabase: any, panelId: string) {
  const { data, error } = await supabase
    .from('providers')
    .select('id, name, api_endpoint, balance, is_active, last_synced, sync_status, created_at, updated_at')
    .eq('panel_id', panelId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[panel-api] Providers fetch error:', error);
    return errorResponse('Failed to fetch providers', 500);
  }

  // Mask API endpoints
  const sanitized = data?.map((p: any) => {
    let hostname = null;
    try {
      hostname = p.api_endpoint ? new URL(p.api_endpoint).hostname : null;
    } catch {}
    return { ...p, api_endpoint: hostname };
  });

  return jsonResponse({ success: true, data: sanitized });
}

// Get panel statistics
async function handleStats(supabase: any, panelId: string) {
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

  return jsonResponse({
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
      completion_rate: ordersResult.count ? parseFloat(((completedOrders / ordersResult.count) * 100).toFixed(1)) : 0
    }
  });
}
