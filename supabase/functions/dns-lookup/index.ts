import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DNSServer {
  id: string;
  name: string;
  location: string;
  flag: string;
  endpoint: string;
  type: "google" | "cloudflare";
}

const DNS_SERVERS: DNSServer[] = [
  { id: "google-us", name: "Google DNS", location: "US East", flag: "🇺🇸", endpoint: "https://dns.google/resolve", type: "google" },
  { id: "cloudflare-us", name: "Cloudflare", location: "US West", flag: "🇺🇸", endpoint: "https://cloudflare-dns.com/dns-query", type: "cloudflare" },
  { id: "google-uk", name: "Google UK", location: "UK", flag: "🇬🇧", endpoint: "https://dns.google/resolve", type: "google" },
  { id: "cloudflare-de", name: "Cloudflare DE", location: "Germany", flag: "🇩🇪", endpoint: "https://cloudflare-dns.com/dns-query", type: "cloudflare" },
  { id: "google-jp", name: "Google Japan", location: "Tokyo", flag: "🇯🇵", endpoint: "https://dns.google/resolve", type: "google" },
  { id: "cloudflare-au", name: "Cloudflare AU", location: "Sydney", flag: "🇦🇺", endpoint: "https://cloudflare-dns.com/dns-query", type: "cloudflare" },
  { id: "google-sg", name: "Google SG", location: "Singapore", flag: "🇸🇬", endpoint: "https://dns.google/resolve", type: "google" },
  { id: "cloudflare-br", name: "Cloudflare BR", location: "São Paulo", flag: "🇧🇷", endpoint: "https://cloudflare-dns.com/dns-query", type: "cloudflare" },
];

const DNS_TYPE_MAP: Record<string, number> = {
  A: 1,
  AAAA: 28,
  CNAME: 5,
  TXT: 16,
  MX: 15,
  NS: 2,
  SRV: 33,
};

async function queryGoogleDNS(domain: string, recordType: string) {
  const typeNum = DNS_TYPE_MAP[recordType] || 1;
  const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${typeNum}`;
  
  const startTime = Date.now();
  const response = await fetch(url, {
    headers: { Accept: "application/dns-json" },
  });
  const latency = Date.now() - startTime;
  
  if (!response.ok) {
    throw new Error(`DNS query failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    answers: data.Answer || [],
    status: data.Status,
    latency,
  };
}

async function queryCloudflare(domain: string, recordType: string) {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${recordType}`;
  
  const startTime = Date.now();
  const response = await fetch(url, {
    headers: { Accept: "application/dns-json" },
  });
  const latency = Date.now() - startTime;
  
  if (!response.ok) {
    throw new Error(`DNS query failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    answers: data.Answer || [],
    status: data.Status,
    latency,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, recordType = "A" } = await req.json();

    if (!domain) {
      throw new Error("Domain is required");
    }

    console.log(`DNS lookup for ${domain} (${recordType})`);

    // Query all DNS servers in parallel
    const results = await Promise.allSettled(
      DNS_SERVERS.map(async (server) => {
        try {
          const queryFn = server.type === "google" ? queryGoogleDNS : queryCloudflare;
          const result = await queryFn(domain, recordType);
          
          return {
            serverId: server.id,
            serverName: server.name,
            location: server.location,
            flag: server.flag,
            status: result.answers.length > 0 ? "resolved" : "not_found",
            value: result.answers.length > 0 ? result.answers[0].data : undefined,
            ttl: result.answers.length > 0 ? result.answers[0].TTL : undefined,
            latency: result.latency,
            allAnswers: result.answers.map((a: any) => ({
              type: a.type,
              data: a.data,
              ttl: a.TTL,
            })),
          };
        } catch (error) {
          console.error(`Error querying ${server.name}:`, error);
          return {
            serverId: server.id,
            serverName: server.name,
            location: server.location,
            flag: server.flag,
            status: "error",
            error: error.message,
          };
        }
      })
    );

    const processedResults = results.map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }
      return {
        serverId: DNS_SERVERS[index].id,
        serverName: DNS_SERVERS[index].name,
        location: DNS_SERVERS[index].location,
        flag: DNS_SERVERS[index].flag,
        status: "error",
        error: result.reason?.message || "Unknown error",
      };
    });

    const resolvedCount = processedResults.filter((r) => r.status === "resolved").length;
    const propagationPercentage = Math.round((resolvedCount / processedResults.length) * 100);

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        recordType,
        results: processedResults,
        propagationPercentage,
        fullyPropagated: propagationPercentage === 100,
        checkedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("DNS lookup error:", error);
    
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
