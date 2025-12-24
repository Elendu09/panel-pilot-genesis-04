// Supabase Edge Function: domain-health-check
// Checks DNS A/CNAME records + HTTP/HTTPS reachability for multiple hosting providers

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Known hosting provider targets
const LOVABLE_IP = "185.158.133.1";
const NETLIFY_IPS = ["75.2.60.5"];
const VERCEL_IPS = ["76.76.21.21"];

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
    const body = await req.json().catch(() => ({}));
    const { domain, expectedTarget, hostingProvider = 'lovable' } = body;

    if (!domain || typeof domain !== "string") {
      return json({ error: "domain is required" }, { status: 400 });
    }

    console.log("[domain-health-check] start", { domain, expectedTarget, hostingProvider });

    // 1) DNS A record check
    let aRecords: string[] = [];
    try {
      aRecords = (await Deno.resolveDns(domain, "A")) as string[];
    } catch (e) {
      console.log("[domain-health-check] A record error", { domain, error: String(e) });
      aRecords = [];
    }

    // 2) DNS CNAME record check
    let cnameRecords: string[] = [];
    try {
      cnameRecords = (await Deno.resolveDns(domain, "CNAME")) as string[];
    } catch (e) {
      console.log("[domain-health-check] CNAME not found (normal for root domains)", { domain });
      cnameRecords = [];
    }

    // Determine expected targets based on hosting provider
    let expectedTargets: string[] = [];
    let expectedCnames: string[] = [];
    
    switch (hostingProvider) {
      case 'lovable':
        expectedTargets = expectedTarget ? [expectedTarget] : [LOVABLE_IP];
        break;
      case 'netlify':
        expectedTargets = NETLIFY_IPS;
        expectedCnames = ['netlify'];
        break;
      case 'vercel':
        expectedTargets = VERCEL_IPS;
        expectedCnames = ['vercel'];
        break;
      case 'cloudflare_pages':
        expectedCnames = ['pages.dev'];
        break;
      case 'custom':
        if (expectedTarget) {
          const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(expectedTarget);
          if (isIp) {
            expectedTargets = [expectedTarget];
          } else {
            expectedCnames = [expectedTarget];
          }
        }
        break;
      default:
        expectedTargets = [LOVABLE_IP];
    }

    // Check if DNS matches expected configuration
    let dnsOk = false;
    let dnsMatchType = 'none';

    // Check A records
    if (expectedTargets.length > 0 && aRecords.some(r => expectedTargets.includes(r))) {
      dnsOk = true;
      dnsMatchType = 'A';
    }

    // Check CNAME records
    if (!dnsOk && expectedCnames.length > 0) {
      const cnameMatch = cnameRecords.some(r => 
        expectedCnames.some(expected => r.toLowerCase().includes(expected.toLowerCase()))
      );
      if (cnameMatch) {
        dnsOk = true;
        dnsMatchType = 'CNAME';
      }
    }

    // For custom without expected target, just check if any records exist
    if (hostingProvider === 'custom' && !expectedTarget) {
      dnsOk = aRecords.length > 0 || cnameRecords.length > 0;
      dnsMatchType = aRecords.length > 0 ? 'A' : cnameRecords.length > 0 ? 'CNAME' : 'none';
    }

    // 3) HTTPS reachability (true SSL check – if cert is broken, fetch throws)
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

    // 4) HTTP reachability (optional fallback)
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
      hosting_provider: hostingProvider,
      expected_targets: expectedTargets,
      expected_cnames: expectedCnames,
      a_records: aRecords,
      cname_records: cnameRecords,
      dns_ok: dnsOk,
      dns_match_type: dnsMatchType,
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
