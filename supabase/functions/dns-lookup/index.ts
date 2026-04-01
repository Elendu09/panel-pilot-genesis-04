import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// Rate limiting
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 30;

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

// Validate domain format
function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') return false;
  if (domain.length > 253) return false;
  
  // Basic domain validation regex
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
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
        JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authentication check - require valid auth header for panel owners
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

    const { domain, recordType = "A" } = await req.json();

    // Validate domain
    if (!domain || !isValidDomain(domain)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid domain format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate record type
    if (!DNS_TYPE_MAP[recordType]) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid record type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`DNS lookup for ${domain} (${recordType}) by user ${claims.user.id}`);

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
              typeName: getTypeName(a.type),
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
            error: (error as Error).message,
          };
        }
      })
    );

    // Also query CNAME if A record lookup was requested (helps debug)
    let cnameResults: any[] = [];
    if (recordType === "A") {
      const cnameQueries = await Promise.allSettled(
        [DNS_SERVERS[0], DNS_SERVERS[1]].map(async (server) => {
          try {
            const queryFn = server.type === "google" ? queryGoogleDNS : queryCloudflare;
            const result = await queryFn(domain, "CNAME");
            return {
              serverId: server.id,
              answers: result.answers.map((a: any) => ({
                type: "CNAME",
                data: a.data,
              })),
            };
          } catch {
            return { serverId: server.id, answers: [] };
          }
        })
      );
      cnameResults = cnameQueries
        .filter(r => r.status === "fulfilled")
        .map(r => (r as PromiseFulfilledResult<any>).value);
    }

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

    // Extract unique values found
    const uniqueARecords = [...new Set(
      processedResults
        .filter((r: any) => r.status === "resolved" && r.value)
        .map((r: any) => r.value)
    )];

    const uniqueCnameRecords = [...new Set(
      cnameResults
        .flatMap(r => r.answers)
        .filter((a: any) => a.type === "CNAME")
        .map((a: any) => a.data)
    )];

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        recordType,
        results: processedResults,
        cnameResults,
        uniqueARecords,
        uniqueCnameRecords,
        propagationPercentage,
        fullyPropagated: propagationPercentage === 100,
        checkedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("DNS lookup error:", error);
    
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

function getTypeName(typeNum: number): string {
  const typeNames: Record<number, string> = {
    1: 'A',
    5: 'CNAME',
    15: 'MX',
    16: 'TXT',
    28: 'AAAA',
    2: 'NS',
    33: 'SRV',
  };
  return typeNames[typeNum] || `TYPE${typeNum}`;
}
