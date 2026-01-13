import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Create client with user's JWT to verify they're admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is an admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      console.error('Profile error or not admin:', profileError, profile);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { configs, action } = await req.json();

    // Use service role client to bypass RLS
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'fetch') {
      // Fetch configs - but mask sensitive values
      const { data, error } = await serviceClient
        .from('platform_config')
        .select('key, value, is_sensitive, description')
        .in('key', configs);

      if (error) {
        console.error('Fetch error:', error);
        throw error;
      }

      // Mask sensitive values
      const maskedData = data?.map(item => ({
        ...item,
        value: item.is_sensitive && item.value 
          ? `••••••••${item.value.slice(-4)}` 
          : item.value,
        is_configured: item.is_sensitive ? !!item.value : undefined
      }));

      return new Response(
        JSON.stringify({ success: true, data: maskedData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'save') {
      // Save each config
      for (const config of configs) {
        const { error } = await serviceClient
          .from('platform_config')
          .upsert({
            key: config.key,
            value: config.value,
            description: config.description || null,
            is_sensitive: config.is_sensitive || false,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });

        if (error) {
          console.error('Save error for', config.key, ':', error);
          throw error;
        }
      }

      // Log to audit
      await serviceClient.from('audit_logs').insert({
        user_id: profile.id,
        action: 'platform_config_update',
        resource_type: 'platform_config',
        details: { 
          keys_updated: configs.map((c: any) => c.key),
          updated_by: user.email 
        }
      });

      console.log('Platform config saved successfully by', user.email);

      return new Response(
        JSON.stringify({ success: true, message: 'Configuration saved successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
