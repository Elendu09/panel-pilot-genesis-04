import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, panel_id, user_id, email, user_agent, ip_address, details } = body;

    if (!action || !panel_id) {
      return new Response(JSON.stringify({ error: 'action and panel_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse device from user_agent
    let device = 'Unknown Device';
    if (user_agent) {
      if (user_agent.includes('Chrome') && user_agent.includes('Windows')) device = 'Chrome on Windows';
      else if (user_agent.includes('Chrome') && user_agent.includes('Mac')) device = 'Chrome on macOS';
      else if (user_agent.includes('Chrome') && user_agent.includes('Android')) device = 'Chrome on Android';
      else if (user_agent.includes('Safari') && user_agent.includes('Mac')) device = 'Safari on macOS';
      else if (user_agent.includes('Firefox')) device = 'Firefox';
      else if (user_agent.includes('Edge')) device = 'Edge on Windows';
      else device = user_agent.substring(0, 40);
    }

    // Insert audit log
    const { error: auditError } = await supabase.from('audit_logs').insert({
      action,
      panel_id,
      user_id: user_id || null,
      user_agent: user_agent || null,
      details: {
        email: email || null,
        device,
        ip: ip_address || null,
        location: details?.location || null,
        status: details?.status || 'success',
        suspicious: details?.suspicious || false,
        ...details,
      },
    });

    if (auditError) {
      console.error('Audit log insert error:', auditError);
    }

    // Check for suspicious patterns: 5+ failed logins in last hour
    if (details?.status === 'failed') {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { count } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('panel_id', panel_id)
        .gte('created_at', oneHourAgo)
        .contains('details', { status: 'failed' });

      if (count && count >= 5) {
        // Insert a notification for the panel owner
        await supabase.from('panel_notifications').insert({
          panel_id,
          user_id: user_id || null,
          title: 'Security Alert: Multiple Failed Logins',
          message: `${count} failed login attempts detected in the last hour. Review your security settings.`,
          type: 'security',
        });
      }
    }

    return new Response(JSON.stringify({ success: true, device }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Security audit error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
