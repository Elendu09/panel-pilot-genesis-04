import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { connectionId, amount } = await req.json();

    if (!connectionId || !amount || amount <= 0) {
      throw new Error("Invalid connection ID or amount");
    }

    // Get connection details
    const { data: connection, error: connError } = await supabase
      .from("direct_provider_connections")
      .select(`
        *,
        source_panel:source_panel_id (id, owner_id, balance, name),
        target_panel:target_panel_id (id, name),
        client_user:client_user_id (id, balance)
      `)
      .eq("id", connectionId)
      .single();

    if (connError || !connection) {
      throw new Error("Connection not found");
    }

    // Verify ownership
    const sourcePanel = connection.source_panel as any;
    if (sourcePanel.owner_id !== user.id) {
      throw new Error("You don't own this panel");
    }

    // Check source panel balance
    if ((sourcePanel.balance || 0) < amount) {
      throw new Error(`Insufficient balance. You have $${(sourcePanel.balance || 0).toFixed(2)} but trying to transfer $${amount.toFixed(2)}`);
    }

    const clientUser = connection.client_user as any;
    const targetPanel = connection.target_panel as any;

    // Start transaction
    // 1. Deduct from source panel
    const { error: deductError } = await supabase
      .from("panels")
      .update({ balance: (sourcePanel.balance || 0) - amount })
      .eq("id", sourcePanel.id);

    if (deductError) throw deductError;

    // 2. Add to client user on target panel
    const { error: addError } = await supabase
      .from("client_users")
      .update({ balance: (clientUser.balance || 0) + amount })
      .eq("id", clientUser.id);

    if (addError) {
      // Rollback
      await supabase
        .from("panels")
        .update({ balance: sourcePanel.balance })
        .eq("id", sourcePanel.id);
      throw addError;
    }

    // 3. Update connection transfer total
    await supabase
      .from("direct_provider_connections")
      .update({ 
        balance_transferred: (connection.balance_transferred || 0) + amount,
        updated_at: new Date().toISOString()
      })
      .eq("id", connectionId);

    // 4. Create transaction record on source panel
    await supabase.from("transactions").insert({
      panel_id: sourcePanel.id,
      type: "debit",
      amount: amount,
      status: "completed",
      description: `Balance transfer to ${targetPanel.name} provider`,
      payment_method: "balance_transfer",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully transferred $${amount.toFixed(2)} to ${targetPanel.name}`,
        newSourceBalance: (sourcePanel.balance || 0) - amount,
        newProviderBalance: (clientUser.balance || 0) + amount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error transferring balance:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
