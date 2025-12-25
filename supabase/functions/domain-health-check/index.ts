// Supabase Edge Function: domain-health-check
// Checks DNS A/CNAME records + HTTP/HTTPS reachability for multiple hosting providers
// Updated for Vercel wildcard DNS support

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Known hosting provider targets
const LOVABLE_IP = "185.158.133.1";
const NETLIFY_IPS = ["75.2.60.5"];
const VERCEL_IPS = ["76.76.21.21"];
const VERCEL_CNAMES = ["cname.vercel-dns.com", "vercel-dns.com", "vercel.app"];
const NETLIFY_CNAMES = ["netlify.app", "netlify.com"];

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
    const { domain, expectedTarget, hostingProvider = 'vercel' } = body;

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

    // 3) DNS NS record check (important for Vercel wildcard)
    let nsRecords: string[] = [];
    try {
      nsRecords = (await Deno.resolveDns(domain, "NS")) as string[];
    } catch (e) {
      console.log("[domain-health-check] NS records not found", { domain });
      nsRecords = [];
    }

    // Determine expected targets based on hosting provider
    let expectedTargets: string[] = [];
    let expectedCnames: string[] = [];
    let isUsingVercelNameservers = false;
    
    // Check if using Vercel nameservers (for wildcard support)
    if (nsRecords.some(ns => ns.toLowerCase().includes('vercel-dns.com'))) {
      isUsingVercelNameservers = true;
      console.log("[domain-health-check] Vercel nameservers detected - wildcard support enabled");
    }
    
    switch (hostingProvider) {
      case 'lovable':
        expectedTargets = expectedTarget ? [expectedTarget] : [LOVABLE_IP];
        break;
      case 'netlify':
        expectedTargets = NETLIFY_IPS;
        expectedCnames = NETLIFY_CNAMES;
        break;
      case 'vercel':
        expectedTargets = VERCEL_IPS;
        expectedCnames = VERCEL_CNAMES;
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
        // Default to checking both Vercel and Lovable
        expectedTargets = [...VERCEL_IPS, LOVABLE_IP];
        expectedCnames = VERCEL_CNAMES;
    }

    // Check if DNS matches expected configuration
    let dnsOk = false;
    let dnsMatchType = 'none';

    // If using Vercel nameservers, DNS is automatically OK for Vercel hosting
    if (hostingProvider === 'vercel' && isUsingVercelNameservers) {
      dnsOk = true;
      dnsMatchType = 'NS';
      console.log("[domain-health-check] Verified via Vercel nameservers");
    }

    // Check A records
    if (!dnsOk && expectedTargets.length > 0 && aRecords.some(r => expectedTargets.includes(r))) {
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

    // 4) HTTPS reachability (true SSL check – if cert is broken, fetch throws)
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

    // 5) HTTP reachability (optional fallback)
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
      ns_records: nsRecords,
      using_vercel_nameservers: isUsingVercelNameservers,
      wildcard_enabled: isUsingVercelNameservers && hostingProvider === 'vercel',
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
