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
        panel_id
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