import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  event: string;
  payload: Record<string, any>;
  webhookUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, payload, webhookUrl }: WebhookPayload = await req.json();

    console.log(`Sending webhook for event: ${event} to ${webhookUrl}`);

    if (!webhookUrl) {
      throw new Error("Webhook URL is required");
    }

    // Prepare webhook payload
    const webhookBody = {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    // Send webhook with retry logic
    let lastError: Error | null = null;
    let response: Response | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "SMMPilot-Webhook/1.0",
            "X-Webhook-Event": event,
          },
          body: JSON.stringify(webhookBody),
        });

        if (response.ok) {
          console.log(`Webhook delivered successfully on attempt ${attempt + 1}`);
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
  } catch (error) {
    console.error("Webhook notification error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
