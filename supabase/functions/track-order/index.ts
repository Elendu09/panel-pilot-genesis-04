import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNumber } = await req.json();

    // Input validation
    if (!orderNumber || typeof orderNumber !== 'string') {
      return new Response(
        JSON.stringify({ error: "Order number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize input - only allow alphanumeric and dashes
    const sanitizedOrderNumber = orderNumber.trim().toUpperCase();
    if (!/^[A-Z0-9\-]+$/.test(sanitizedOrderNumber) || sanitizedOrderNumber.length > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid order number format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch order without exposing sensitive data (no price, no buyer details)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        quantity,
        target_url,
        progress,
        start_count,
        remains,
        created_at,
        started_at,
        completed_at,
        estimated_completion,
        service_id,
        panel_id,
        provider_order_id,
        provider_id
      `)
      .eq("order_number", sanitizedOrderNumber)
      .maybeSingle();

    if (orderError) {
      console.error("Database error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found", notFound: true }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch service name (not price)
    let serviceName = "Unknown Service";
    if (order.service_id) {
      const { data: service } = await supabase
        .from("services")
        .select("name, category")
        .eq("id", order.service_id)
        .maybeSingle();
      
      if (service) {
        serviceName = service.name;
      }
    }

    // Fetch panel name
    let panelName = "Panel";
    if (order.panel_id) {
      const { data: panel } = await supabase
        .from("panels")
        .select("name")
        .eq("id", order.panel_id)
        .maybeSingle();
      
      if (panel) {
        panelName = panel.name;
      }
    }

    // If order has a provider_order_id and is in an active state, poll the provider for live status
    if (order.provider_order_id && order.provider_id && ['pending', 'processing', 'in_progress'].includes(order.status)) {
      try {
        const { data: provider } = await supabase
          .from("providers")
          .select("api_endpoint, api_key, is_active")
          .eq("id", order.provider_id)
          .single();

        if (provider?.is_active && provider.api_endpoint && provider.api_key) {
          const formData = new URLSearchParams();
          formData.append('key', provider.api_key);
          formData.append('action', 'status');
          formData.append('order', order.provider_order_id);

          const providerResponse = await fetch(provider.api_endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
          });

          const providerResult = await providerResponse.json();
          console.log('[track-order] Provider status response:', JSON.stringify(providerResult));

          if (providerResult.status) {
            const statusMap: Record<string, string> = {
              'Pending': 'pending',
              'In progress': 'in_progress',
              'Processing': 'in_progress',
              'Completed': 'completed',
              'Partial': 'partial',
              'Canceled': 'cancelled',
              'Cancelled': 'cancelled',
              'Refunded': 'refunded',
              'Failed': 'failed',
            };

            const mappedStatus = statusMap[providerResult.status] || order.status;
            const startCount = providerResult.start_count ? parseInt(providerResult.start_count, 10) : order.start_count;
            const remains = providerResult.remains ? parseInt(providerResult.remains, 10) : order.remains;

            const updateData: Record<string, any> = {};
            if (mappedStatus !== order.status) updateData.status = mappedStatus;
            if (startCount !== order.start_count) updateData.start_count = startCount;
            if (remains !== order.remains) updateData.remains = remains;

            if (mappedStatus === 'completed' && !order.completed_at) {
              updateData.completed_at = new Date().toISOString();
              updateData.progress = 100;
            } else if (mappedStatus === 'in_progress' && !order.started_at) {
              updateData.started_at = new Date().toISOString();
            }

            if (remains !== null && remains !== undefined && order.quantity) {
              const delivered = order.quantity - remains;
              updateData.progress = Math.min(100, Math.max(0, Math.round((delivered / order.quantity) * 100)));
            }

            if (Object.keys(updateData).length > 0) {
              await supabase
                .from("orders")
                .update(updateData)
                .eq("id", order.id);

              if (updateData.status) order.status = updateData.status;
              if (updateData.start_count !== undefined) order.start_count = updateData.start_count;
              if (updateData.remains !== undefined) order.remains = updateData.remains;
              if (updateData.progress !== undefined) order.progress = updateData.progress;
              if (updateData.started_at) order.started_at = updateData.started_at;
              if (updateData.completed_at) order.completed_at = updateData.completed_at;
            }
          }
        }
      } catch (providerError) {
        console.error('[track-order] Provider polling error (non-fatal):', providerError);
      }
    }

    // Return sanitized order data (NO PRICE)
    const sanitizedOrder = {
      orderNumber: order.order_number,
      status: order.status,
      quantity: order.quantity,
      targetUrl: order.target_url,
      progress: order.progress || 0,
      startCount: order.start_count,
      remains: order.remains,
      createdAt: order.created_at,
      startedAt: order.started_at,
      completedAt: order.completed_at,
      estimatedCompletion: order.estimated_completion,
      serviceName,
      panelName,
    };

    return new Response(
      JSON.stringify({ success: true, order: sanitizedOrder }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Track order error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});