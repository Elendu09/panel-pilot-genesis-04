import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check admin role
    const { data: profile } = await userClient
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, settings } = await req.json();
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'fetch') {
      const { data, error } = await serviceClient
        .from('platform_settings')
        .select('*')
        .eq('setting_key', 'security');

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data: data?.[0]?.setting_value || {} }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'save') {
      const { error } = await serviceClient
        .from('platform_settings')
        .upsert({
          setting_key: 'security',
          setting_value: settings,
          category: 'security',
          description: 'Platform security settings',
          updated_at: new Date().toISOString(),
          updated_by: profile.id
        }, { onConflict: 'setting_key' });

      if (error) throw error;

      // Audit log
      await serviceClient.from('audit_logs').insert({
        user_id: profile.id,
        action: 'security_settings_update',
        resource_type: 'security',
        details: { settings, updated_by: user.email }
      });

      console.log('Security settings updated by', user.email);

      return new Response(
        JSON.stringify({ success: true, message: 'Security settings saved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
