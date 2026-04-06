import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WebhookPayload {
  event: string;
  payload: Record<string, any>;
  webhookId?: string; // ID of configured webhook in admin_webhooks table
  panelId?: string; // Panel ID for validation
}

// Rate limiting
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 20;

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(clientIP);
  
  if (!record || now > record.resetAt) {
    requestCounts.set(clientIP, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  record.count++;
  return true;
}

// Generate HMAC signature for webhook payload
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !claims?.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { event, payload, webhookId, panelId, webhookUrl: directWebhookUrl }: WebhookPayload & { webhookUrl?: string } = await req.json();

    if (!event) {
      return new Response(
        JSON.stringify({ success: false, error: "Event type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // If webhookId is provided, fetch the webhook configuration
    let webhookUrl: string | null = null;
    let webhookSecret: string | null = null;

    if (webhookId) {
      // Verify the user owns the webhook
      const { data: webhook, error: webhookError } = await supabaseAdmin
        .from('admin_webhooks')
        .select('url, secret, events, is_active, created_by')
        .eq('id', webhookId)
        .single();

      if (webhookError || !webhook) {
        return new Response(
          JSON.stringify({ success: false, error: "Webhook not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify the webhook is active and the event is subscribed
      if (!webhook.is_active) {
        return new Response(
          JSON.stringify({ success: false, error: "Webhook is disabled" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!webhook.events.includes(event) && !webhook.events.includes('*')) {
        return new Response(
          JSON.stringify({ success: false, error: "Event not subscribed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      webhookUrl = webhook.url;
      webhookSecret = webhook.secret;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Webhook ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending webhook for event: ${event} to ${webhookUrl}`);

    // Prepare webhook payload
    const webhookBody = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    const bodyString = JSON.stringify(webhookBody);
    
    // Generate signature if secret is configured
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "SMMPilot-Webhook/1.0",
      "X-Webhook-Event": event,
    };

    if (webhookSecret) {
      const signature = await generateSignature(bodyString, webhookSecret);
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    // Send webhook with retry logic
    let lastError: Error | null = null;
    let response: Response | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(webhookUrl!, {
          method: "POST",
          headers,
          body: bodyString,
        });

        if (response.ok) {
          console.log(`Webhook delivered successfully on attempt ${attempt + 1}`);
          
          // Update webhook success status
          await supabaseAdmin
            .from('admin_webhooks')
            .update({ 
              last_triggered_at: new Date().toISOString(),
              last_status: response.status,
              failure_count: 0
            })
            .eq('id', webhookId);
          
          break;
        }

        console.log(`Webhook attempt ${attempt + 1} failed with status ${response.status}`);
      } catch (error) {
        lastError = error as Error;
        console.error(`Webhook attempt ${attempt + 1} error:`, error);
      }

      // Wait before retry (exponential backoff)
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }

    if (!response?.ok) {
      // Update webhook failure status
      await supabaseAdmin
        .from('admin_webhooks')
        .update({ 
          last_triggered_at: new Date().toISOString(),
          last_status: response?.status || 0,
          failure_count: 1
        })
        .eq('id', webhookId);
      
      throw new Error(lastError?.message || `Webhook delivery failed after 3 attempts`);
    }

    const responseText = await response.text();

    return new Response(
      JSON.stringify({
        success: true,
        event,
        statusCode: response.status,
        response: responseText.slice(0, 500),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Webhook notification error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
