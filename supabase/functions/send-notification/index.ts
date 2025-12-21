import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type NotificationType = 'low_balance' | 'failed_transaction' | 'sync_error' | 'service_update' | 'info' | 'warning' | 'error';

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

    console.log(`Creating notification: ${type} - ${title}`);

    // Create in-app notification
    const { data: notification, error: notifError } = await supabase
      .from('panel_notifications')
      .insert({
        panel_id: panelId,
        user_id: userId,
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

    // Log to audit
    await supabase.from('audit_logs').insert({
      panel_id: panelId,
      user_id: userId,
      action: 'notification_sent',
      resource_type: 'notification',
      resource_id: notification.id,
      details: { type, title, sendEmail: sendEmail || false },
    });

    // If email is requested, log it (would integrate with email service)
    if (sendEmail && emailTo) {
      console.log(`Email notification requested for: ${emailTo}`);
      
      // Log email send attempt
      await supabase.from('email_send_logs').insert({
        email: emailTo,
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
        emailSent: sendEmail || false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send notification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function mapNotificationType(type: NotificationType): string {
  switch (type) {
    case 'low_balance':
    case 'warning':
      return 'warning';
    case 'failed_transaction':
    case 'sync_error':
    case 'error':
      return 'error';
    case 'service_update':
    case 'info':
    default:
      return 'info';
  }
}
