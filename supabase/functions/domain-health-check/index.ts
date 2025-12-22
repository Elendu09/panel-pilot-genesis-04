// Supabase Edge Function: domain-health-check
// Checks DNS A record + HTTP/HTTPS reachability to help determine SSL readiness.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_IP = "185.158.133.1";

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startedAt = Date.now();

  try {
    const { domain } = await req.json().catch(() => ({ domain: "" }));

    if (!domain || typeof domain !== "string") {
      return json({ error: "domain is required" }, { status: 400 });
    }

    console.log("[domain-health-check] start", { domain });

    // 1) DNS A record check
    let aRecords: string[] = [];
    try {
      aRecords = (await Deno.resolveDns(domain, "A")) as string[];
    } catch (e) {
      console.log("[domain-health-check] dns error", { domain, error: String(e) });
      aRecords = [];
    }

    const dnsOk = aRecords.includes(LOVABLE_IP);

    // 2) HTTPS reachability (true SSL check – if cert is broken, fetch throws)
    let httpsOk = false;
    try {
      const res = await fetch(`https://${domain}`, {
        method: "GET",
        redirect: "manual",
      });
      httpsOk = res.ok || (res.status >= 300 && res.status < 400);
    } catch (e) {
      console.log("[domain-health-check] https error", { domain, error: String(e) });
      httpsOk = false;
    }

    // 3) HTTP reachability (optional fallback)
    let httpOk = false;
    try {
      const res = await fetch(`http://${domain}`, {
        method: "GET",
        redirect: "manual",
      });
      httpOk = res.ok || (res.status >= 300 && res.status < 400);
    } catch (e) {
      console.log("[domain-health-check] http error", { domain, error: String(e) });
      httpOk = false;
    }

    const result = {
      domain,
      lovable_ip: LOVABLE_IP,
      a_records: aRecords,
      dns_ok: dnsOk,
      https_ok: httpsOk,
      http_ok: httpOk,
      checked_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
    };

    console.log("[domain-health-check] result", result);
    return json(result);
  } catch (e) {
    console.log("[domain-health-check] fatal", { error: String(e) });
    return json({ error: "Unexpected error", details: String(e) }, { status: 500 });
  }
});
