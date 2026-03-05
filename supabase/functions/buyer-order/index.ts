import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface OrderRequest {
  panelId: string;
  buyerId: string;
  serviceId: string;
  quantity: number;
  targetUrl: string;
  price: number;
  promoCode?: string;
  notes?: string;
  paymentType?: 'balance' | 'direct';
}

// Forward order to upstream provider API
async function forwardToProvider(
  supabase: any,
  serviceId: string,
  targetUrl: string,
  quantity: number,
  orderId: string
): Promise<{ success: boolean; externalOrderId?: string; error?: string }> {
  try {
    // Get service's provider info
    const { data: service } = await supabase
      .from('services')
      .select('provider_id, provider_service_id')
      .eq('id', serviceId)
      .single();

    if (!service?.provider_id || !service?.provider_service_id) {
      console.log('[buyer-order] No provider linked to service, skipping forwarding');
      return { success: false, error: 'No provider linked' };
    }

    // Get provider API credentials
    const { data: provider } = await supabase
      .from('providers')
      .select('api_endpoint, api_key, is_active')
      .eq('id', service.provider_id)
      .single();

    if (!provider || !provider.is_active) {
      console.log('[buyer-order] Provider not found or inactive');
      return { success: false, error: 'Provider inactive' };
    }

    console.log(`[buyer-order] Forwarding to provider: ${provider.api_endpoint}`);

    // Call provider's API (standard SMM panel API format)
    const formData = new URLSearchParams();
    formData.append('key', provider.api_key);
    formData.append('action', 'add');
    formData.append('service', service.provider_service_id);
    formData.append('link', targetUrl);
    formData.append('quantity', String(quantity));

    const response = await fetch(provider.api_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log('[buyer-order] Provider response:', JSON.stringify(result));

    if (result.order) {
      // Update order with provider's order ID and set to processing
      await supabase
        .from('orders')
        .update({
          provider_order_id: String(result.order),
          status: 'processing',
        })
        .eq('id', orderId);

      return { success: true, externalOrderId: String(result.order) };
    } else {
      const errorMsg = result.error || 'Unknown provider error';
      // Mark order with appropriate error status
      const isServiceError = errorMsg.toLowerCase().includes('incorrect service') || 
                             errorMsg.toLowerCase().includes('invalid service') ||
                             errorMsg.toLowerCase().includes('service not found');
      await supabase
        .from('orders')
        .update({
          status: isServiceError ? 'cancelled' : 'partial',
          notes: `Provider error: ${errorMsg}`,
          provider_order_id: null,
        })
        .eq('id', orderId);

      return { success: false, error: errorMsg };
    }
  } catch (error: any) {
    console.error('[buyer-order] Provider forwarding error:', error);
    await supabase
      .from('orders')
      .update({ notes: `Forwarding failed: ${error.message}` })
      .eq('id', orderId);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: OrderRequest = await req.json();
    const { panelId, buyerId, serviceId, quantity, targetUrl, price, promoCode, notes, paymentType = 'balance' } = body;

    console.log(`[buyer-order] Creating order for buyer ${buyerId} on panel ${panelId}, paymentType: ${paymentType}`);

    // Validate required fields
    if (!panelId || !buyerId || !serviceId || !quantity || !targetUrl || price === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the buyer exists and get their balance
    const { data: buyer, error: buyerError } = await supabase
      .from('client_users')
      .select('id, balance, total_spent, panel_id')
      .eq('id', buyerId)
      .eq('panel_id', panelId)
      .single();

    if (buyerError || !buyer) {
      return new Response(
        JSON.stringify({ success: false, error: 'Buyer not found or does not belong to this panel' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check balance for balance payment type
    const currentBalance = buyer.balance || 0;
    if (paymentType === 'balance' && currentBalance < price) {
      return new Response(
        JSON.stringify({ success: false, error: 'Insufficient balance', currentBalance, required: price, needsPayment: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify service exists and is active
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, price, min_quantity, max_quantity, is_active, panel_id, provider_id, provider_cost, cost_usd')
      .eq('id', serviceId)
      .eq('panel_id', panelId)
      .single();

    if (serviceError || !service) {
      return new Response(
        JSON.stringify({ success: false, error: 'Service not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!service.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: 'Service is currently disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate quantity
    const minQty = service.min_quantity || 1;
    const maxQty = service.max_quantity || 1000000;
    if (quantity < minQty || quantity > maxQty) {
      return new Response(
        JSON.stringify({ success: false, error: `Quantity must be between ${minQty} and ${maxQty}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create the order
    const orderStatus = paymentType === 'direct' ? 'awaiting_payment' : 'pending';
    const providerCostAtOrder = service.provider_cost || service.cost_usd || 0;
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        panel_id: panelId,
        buyer_id: buyerId,
        service_id: serviceId,
        target_url: targetUrl,
        quantity,
        price,
        status: orderStatus,
        progress: 0,
        notes: notes || (promoCode ? `Promo: ${promoCode}` : null),
        provider_cost: providerCostAtOrder,
        provider_id: service.provider_id || null,
      })
      .select()
      .single();

    if (orderError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create order', details: orderError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only deduct balance for balance payment type
    let newBalance = currentBalance;
    if (paymentType === 'balance') {
      newBalance = currentBalance - price;
      const newTotalSpent = (buyer.total_spent || 0) + price;

      const { error: balanceError } = await supabase
        .from('client_users')
        .update({ balance: newBalance, total_spent: newTotalSpent })
        .eq('id', buyerId);

      if (balanceError) {
        await supabase.from('orders').delete().eq('id', order.id);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update balance' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Forward order to upstream provider (only for balance-paid orders)
    let providerResult = null;
    if (paymentType === 'balance') {
      providerResult = await forwardToProvider(supabase, serviceId, targetUrl, quantity, order.id);
      console.log(`[buyer-order] Provider forwarding result:`, providerResult);
    }

    // Create notification
    const notificationMessage = paymentType === 'direct'
      ? `Order #${orderNumber} created. Complete payment to start processing.`
      : `Order #${orderNumber} for ${quantity.toLocaleString()} ${service.name} has been placed successfully.`;

    await supabase.from('buyer_notifications').insert({
      buyer_id: buyerId,
      panel_id: panelId,
      order_id: order.id,
      type: 'order',
      title: paymentType === 'direct' ? 'Order Awaiting Payment' : 'Order Placed',
      message: notificationMessage,
    });

    // Update promo code usage if used
    if (promoCode) {
      await supabase
        .from('promo_codes')
        .update({ used_count: supabase.rpc('increment_promo_usage', { promo_code: promoCode }) })
        .eq('code', promoCode)
        .eq('panel_id', panelId);
    }

    console.log(`[buyer-order] Order ${orderNumber} created successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: providerResult?.success ? 'processing' : order.status,
          quantity: order.quantity,
          price: order.price,
          serviceName: service.name,
          providerOrderId: providerResult?.externalOrderId || null,
        },
        newBalance,
        paymentType,
        requiresPayment: paymentType === 'direct',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[buyer-order] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
