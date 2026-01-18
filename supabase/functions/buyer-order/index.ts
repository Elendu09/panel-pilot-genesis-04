import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: OrderRequest = await req.json();
    const { panelId, buyerId, serviceId, quantity, targetUrl, price, promoCode, notes } = body;

    console.log(`[buyer-order] Creating order for buyer ${buyerId} on panel ${panelId}`);

    // Validate required fields
    if (!panelId || !buyerId || !serviceId || !quantity || !targetUrl || price === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      console.error('[buyer-order] Buyer not found:', buyerError);
      return new Response(
        JSON.stringify({ error: 'Buyer not found or does not belong to this panel' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if buyer has sufficient balance
    const currentBalance = buyer.balance || 0;
    if (currentBalance < price) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient balance',
          currentBalance,
          required: price
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the service exists and is enabled
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, price, min_quantity, max_quantity, is_enabled, panel_id')
      .eq('id', serviceId)
      .eq('panel_id', panelId)
      .single();

    if (serviceError || !service) {
      console.error('[buyer-order] Service not found:', serviceError);
      return new Response(
        JSON.stringify({ error: 'Service not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!service.is_enabled) {
      return new Response(
        JSON.stringify({ error: 'Service is currently disabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate quantity
    const minQty = service.min_quantity || 1;
    const maxQty = service.max_quantity || 1000000;
    if (quantity < minQty || quantity > maxQty) {
      return new Response(
        JSON.stringify({ 
          error: `Quantity must be between ${minQty} and ${maxQty}`,
          minQuantity: minQty,
          maxQuantity: maxQty
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create the order
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
        status: 'pending',
        progress: 0,
        notes: notes || (promoCode ? `Promo: ${promoCode}` : null),
      })
      .select()
      .single();

    if (orderError) {
      console.error('[buyer-order] Order creation failed:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order', details: orderError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct balance from buyer
    const newBalance = currentBalance - price;
    const newTotalSpent = (buyer.total_spent || 0) + price;

    const { error: balanceError } = await supabase
      .from('client_users')
      .update({ 
        balance: newBalance,
        total_spent: newTotalSpent
      })
      .eq('id', buyerId);

    if (balanceError) {
      console.error('[buyer-order] Balance update failed:', balanceError);
      // Rollback the order if balance update fails
      await supabase.from('orders').delete().eq('id', order.id);
      return new Response(
        JSON.stringify({ error: 'Failed to update balance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notification for buyer
    await supabase
      .from('buyer_notifications')
      .insert({
        buyer_id: buyerId,
        panel_id: panelId,
        order_id: order.id,
        type: 'order',
        title: 'Order Placed',
        message: `Order #${orderNumber} for ${quantity.toLocaleString()} ${service.name} has been placed successfully.`,
      });

    // Update promo code usage if used
    if (promoCode) {
      await supabase
        .from('promo_codes')
        .update({ used_count: supabase.rpc('increment_promo_usage', { promo_code: promoCode }) })
        .eq('code', promoCode)
        .eq('panel_id', panelId);
    }

    console.log(`[buyer-order] Order ${orderNumber} created successfully, new balance: ${newBalance}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          quantity: order.quantity,
          price: order.price,
          serviceName: service.name,
        },
        newBalance
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[buyer-order] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
