import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type NotificationType = 'low_balance' | 'failed_transaction' | 'sync_error' | 'service_update' | 'chat' | 'info' | 'warning' | 'error' | 'pending_deposit';

interface NotificationPayload {
  panelId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  sendEmail?: boolean;
  emailTo?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: NotificationPayload = await req.json();
    const { panelId, userId, type, title, message, metadata, sendEmail, emailTo } = payload;

    if (!panelId || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'panelId, title, and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const { data: panel } = await supabase
        .from('panels')
        .select('owner_id')
        .eq('id', panelId)
        .maybeSingle();
      resolvedUserId = panel?.owner_id || undefined;
    }

    console.log(`Creating notification: ${type} - ${title}`);

    const { data: notification, error: notifError } = await supabase
      .from('panel_notifications')
      .insert({
        panel_id: panelId,
        user_id: resolvedUserId,
        type: mapNotificationType(type),
        title,
        message,
        is_read: false,
      })
      .select()
      .single();

    if (notifError) {
      console.error('Failed to create notification:', notifError);
      throw new Error(`Failed to create notification: ${notifError.message}`);
    }

    await supabase.from('audit_logs').insert({
      panel_id: panelId,
      user_id: resolvedUserId,
      action: 'notification_sent',
      resource_type: 'notification',
      resource_id: notification.id,
      details: { type, title, sendEmail: sendEmail || false },
    });

    let shouldEmail = sendEmail || false;
    let resolvedEmailTo = emailTo;

    if (!shouldEmail && resolvedUserId) {
      const { data: panel } = await supabase
        .from('panels')
        .select('settings, subscription_tier')
        .eq('id', panelId)
        .maybeSingle();

      if (panel) {
        const settings = (panel.settings as Record<string, any>) || {};
        const tier = panel.subscription_tier || 'free';
        const paidTier = tier === 'basic' || tier === 'pro' || tier === 'enterprise';

        if (paidTier && settings.email_notifications === true) {
          shouldEmail = true;
        }
      }
    }

    if (shouldEmail && !resolvedEmailTo && resolvedUserId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', resolvedUserId)
        .maybeSingle();
      resolvedEmailTo = profile?.email || undefined;
    }

    if (shouldEmail && resolvedEmailTo) {
      console.log(`Email notification requested for: ${resolvedEmailTo}`);

      await supabase.from('email_send_logs').insert({
        email: resolvedEmailTo,
        email_action_type: `notification_${type}`,
        metadata: {
          title,
          message,
          type,
          panel_id: panelId,
          sent_at: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: {
          id: notification.id,
          type,
          title,
          message,
          createdAt: notification.created_at,
        },
        emailSent: shouldEmail && !!resolvedEmailTo,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Failed to send notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function mapNotificationType(type: NotificationType): string {
  switch (type) {
    case 'low_balance':
    case 'warning':
    case 'pending_deposit':
      return 'warning';
    case 'failed_transaction':
    case 'sync_error':
    case 'error':
      return 'error';
    case 'service_update':
    case 'info':
      return 'info';
    case 'chat':
      return 'chat';
    default:
      return 'info';
  }
}
