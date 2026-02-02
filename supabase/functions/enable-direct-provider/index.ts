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
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ success: false, error: "Authorization required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    console.log("Authenticated user:", user.id);

    const { sourcePanelId, targetPanelId } = await req.json();
    console.log("Request params:", { sourcePanelId, targetPanelId });

    if (!sourcePanelId || !targetPanelId) {
      throw new Error("Missing sourcePanelId or targetPanelId");
    }

    // CRITICAL FIX: Get the profile for the authenticated user
    // profiles.user_id = auth.users.id, NOT profiles.id = auth.users.id
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("user_id", user.id)
      .single();

    if (profileError || !userProfile) {
      console.error("Profile error:", profileError?.message);
      throw new Error("Could not get user profile");
    }

    console.log("User profile:", userProfile.id);

    // Verify source panel ownership
    const { data: sourcePanel, error: sourcePanelError } = await supabase
      .from("panels")
      .select("id, owner_id, name")
      .eq("id", sourcePanelId)
      .single();

    if (sourcePanelError || !sourcePanel) {
      console.error("Source panel error:", sourcePanelError?.message);
      throw new Error("Source panel not found");
    }

    // CRITICAL FIX: panels.owner_id references profiles.id, NOT auth.users.id
    if (sourcePanel.owner_id !== userProfile.id) {
      console.error("Ownership mismatch:", { 
        panelOwnerId: sourcePanel.owner_id, 
        userProfileId: userProfile.id 
      });
      throw new Error("You don't own this panel");
    }

    // Get target panel info
    const { data: targetPanel, error: targetPanelError } = await supabase
      .from("panels")
      .select("id, name, subdomain, custom_domain")
      .eq("id", targetPanelId)
      .single();

    if (targetPanelError || !targetPanel) {
      console.error("Target panel error:", targetPanelError?.message);
      throw new Error("Target panel not found");
    }

    // Check if already connected
    const { data: existingConnection } = await supabase
      .from("direct_provider_connections")
      .select("id")
      .eq("source_panel_id", sourcePanelId)
      .eq("target_panel_id", targetPanelId)
      .single();

    if (existingConnection) {
      throw new Error("Already connected to this provider");
    }

    // Check provider limit based on subscription
    const { data: subscription } = await supabase
      .from("panel_subscriptions")
      .select("plan_type")
      .eq("panel_id", sourcePanelId)
      .eq("status", "active")
      .single();

    const planLimits: Record<string, number> = {
      free: 1,
      basic: 5,
      pro: 999999,
    };

    const plan = subscription?.plan_type || "free";
    const maxProviders = planLimits[plan] || 1;

    // Count current providers
    const { count: providerCount } = await supabase
      .from("providers")
      .select("*", { count: "exact", head: true })
      .eq("panel_id", sourcePanelId);

    if ((providerCount || 0) >= maxProviders) {
      throw new Error(`Provider limit reached (${maxProviders} for ${plan} plan). Upgrade to add more.`);
    }

    // Create buyer account on target panel using userProfile data
    const username = `panel_${sourcePanelId.substring(0, 8)}`;
    const tempPassword = crypto.randomUUID().substring(0, 12);
    
    // Simple hash for password
    const encoder = new TextEncoder();
    const data = encoder.encode(tempPassword);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Create client user on target panel
    const { data: clientUser, error: clientError } = await supabase
      .from("client_users")
      .insert({
        panel_id: targetPanelId,
        email: userProfile.email,
        username: username,
        full_name: userProfile.full_name || sourcePanel.name,
        password_hash: passwordHash,
        password_temp: tempPassword,
        is_active: true,
        balance: 0,
      })
      .select()
      .single();

    if (clientError) {
      // If email already exists, try to find existing user
      if (clientError.code === "23505") {
        console.log("Client user already exists, finding existing user...");
        const { data: existingUser } = await supabase
          .from("client_users")
          .select("*")
          .eq("panel_id", targetPanelId)
          .eq("email", userProfile.email)
          .single();

        if (existingUser) {
          const apiKey = existingUser.api_key || crypto.randomUUID();
          
          if (!existingUser.api_key) {
            await supabase
              .from("client_users")
              .update({ api_key: apiKey })
              .eq("id", existingUser.id);
          }

          // Create connection
          const { data: connection, error: connError } = await supabase
            .from("direct_provider_connections")
            .insert({
              source_panel_id: sourcePanelId,
              target_panel_id: targetPanelId,
              client_user_id: existingUser.id,
              api_key: apiKey,
              is_active: true,
            })
            .select()
            .single();

          if (connError) {
            console.error("Connection error:", connError);
            throw connError;
          }

          // Create provider record
          const apiEndpoint = targetPanel.custom_domain
            ? `https://${targetPanel.custom_domain}/api/v2/buyer-api`
            : `https://${targetPanel.subdomain}.homeofsmm.com/api/v2/buyer-api`;

          await supabase.from("providers").insert({
            panel_id: sourcePanelId,
            name: targetPanel.name,
            api_endpoint: apiEndpoint,
            api_key: apiKey,
            is_active: true,
            is_direct: true,
            source_panel_id: targetPanelId,
            direct_connection_id: connection.id,
          });

          console.log("Successfully connected using existing account");

          return new Response(
            JSON.stringify({
              success: true,
              message: "Connected to existing account",
              connection: connection,
              apiKey: apiKey,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      console.error("Client error:", clientError);
      throw clientError;
    }

    // Generate API key for new user
    const apiKey = crypto.randomUUID();
    await supabase
      .from("client_users")
      .update({ api_key: apiKey, password_temp: null })
      .eq("id", clientUser.id);

    // Create direct provider connection
    const { data: connection, error: connError } = await supabase
      .from("direct_provider_connections")
      .insert({
        source_panel_id: sourcePanelId,
        target_panel_id: targetPanelId,
        client_user_id: clientUser.id,
        api_key: apiKey,
        is_active: true,
      })
      .select()
      .single();

    if (connError) {
      console.error("Connection error:", connError);
      throw connError;
    }

    // Create provider record in source panel
    const apiEndpoint = targetPanel.custom_domain
      ? `https://${targetPanel.custom_domain}/api/v2/buyer-api`
      : `https://${targetPanel.subdomain}.homeofsmm.com/api/v2/buyer-api`;

    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .insert({
        panel_id: sourcePanelId,
        name: targetPanel.name,
        api_endpoint: apiEndpoint,
        api_key: apiKey,
        is_active: true,
        is_direct: true,
        source_panel_id: targetPanelId,
        direct_connection_id: connection.id,
      })
      .select()
      .single();

    if (providerError) {
      console.error("Provider error:", providerError);
      throw providerError;
    }

    console.log("Successfully enabled direct provider:", provider.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Direct provider enabled successfully",
        connection: connection,
        provider: provider,
        apiKey: apiKey,
        targetPanel: {
          name: targetPanel.name,
          domain: targetPanel.custom_domain || `${targetPanel.subdomain}.homeofsmm.com`,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error enabling direct provider:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
