import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface DNSAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface GoogleDNSResponse {
  Status: number;
  Answer?: DNSAnswer[];
}

async function checkDNS(domain: string, expectedTargets: string[], expectedCnames: string[]): Promise<{ verified: boolean; matchType: string }> {
  try {
    // Check A records
    const aResponse = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { headers: { Accept: "application/dns-json" } }
    );
    
    if (aResponse.ok) {
      const aData: GoogleDNSResponse = await aResponse.json();
      if (aData.Status === 0 && aData.Answer) {
        const aRecords = aData.Answer.map(a => a.data);
        if (expectedTargets.some(t => aRecords.includes(t))) {
          return { verified: true, matchType: 'A' };
        }
      }
    }

    // Check CNAME records
    if (expectedCnames.length > 0) {
      const cnameResponse = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=CNAME`,
        { headers: { Accept: "application/dns-json" } }
      );
      
      if (cnameResponse.ok) {
        const cnameData: GoogleDNSResponse = await cnameResponse.json();
        if (cnameData.Status === 0 && cnameData.Answer) {
          const cnameRecords = cnameData.Answer.map(a => a.data.toLowerCase());
          const hasMatch = cnameRecords.some(r => 
            expectedCnames.some(e => r.includes(e.toLowerCase()))
          );
          if (hasMatch) {
            return { verified: true, matchType: 'CNAME' };
          }
        }
      }
    }

    return { verified: false, matchType: 'none' };
  } catch (error) {
    console.error(`DNS check failed for ${domain}:`, error);
    return { verified: false, matchType: 'error' };
  }
}

function getExpectedTargets(hostingProvider: string, customTarget?: string): { targets: string[]; cnames: string[] } {
  switch (hostingProvider) {
    case 'lovable':
      return { targets: [LOVABLE_IP], cnames: [] };
    case 'netlify':
      return { targets: NETLIFY_IPS, cnames: NETLIFY_CNAMES };
    case 'vercel':
      return { targets: VERCEL_IPS, cnames: VERCEL_CNAMES };
    case 'cloudflare_pages':
      return { targets: [], cnames: ['pages.dev'] };
    case 'custom':
      if (customTarget) {
        const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(customTarget);
        return isIp 
          ? { targets: [customTarget], cnames: [] }
          : { targets: [], cnames: [customTarget] };
      }
      return { targets: [LOVABLE_IP], cnames: [] };
    default:
      // Default to checking both Vercel and Lovable for flexibility
      return { targets: [...VERCEL_IPS, LOVABLE_IP], cnames: VERCEL_CNAMES };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting auto-verification of pending domains...");

    // Fetch all pending domains with panel info for hosting provider
    const { data: pendingDomains, error: fetchError } = await supabase
      .from("panel_domains")
      .select(`
        id, 
        domain, 
        panel_id, 
        verification_status,
        expected_target,
        hosting_provider,
        panels!inner(
          id,
          settings,
          hosting_provider
        )
      `)
      .eq("verification_status", "pending");

    if (fetchError) {
      throw new Error(`Failed to fetch domains: ${fetchError.message}`);
    }

    console.log(`Found ${pendingDomains?.length || 0} pending domains`);

    const results: { domain: string; verified: boolean; matchType?: string; provider?: string }[] = [];

    for (const domainRecord of pendingDomains || []) {
      console.log(`Checking DNS for: ${domainRecord.domain}`);
      
      // Get hosting provider - prefer domain-specific, then panel-level, then settings
      const hostingProvider = 
        domainRecord.hosting_provider || 
        (domainRecord.panels as any)?.hosting_provider ||
        ((domainRecord.panels as any)?.settings as Record<string, any>)?.hosting_provider || 
        'vercel'; // Default to Vercel now
      
      const customTarget = domainRecord.expected_target || 
        ((domainRecord.panels as any)?.settings as Record<string, any>)?.custom_dns_target;
      
      console.log(`Using hosting provider: ${hostingProvider}`);
      
      const { targets, cnames } = getExpectedTargets(hostingProvider, customTarget);
      const { verified, matchType } = await checkDNS(domainRecord.domain, targets, cnames);
      
      if (verified) {
        console.log(`✅ ${domainRecord.domain} verified via ${matchType} (provider: ${hostingProvider})`);
        
        // Update domain record
        const { error: updateError } = await supabase
          .from("panel_domains")
          .update({
            verification_status: "verified",
            dns_configured: true,
            verified_at: new Date().toISOString(),
            ssl_status: "active",
          })
          .eq("id", domainRecord.id);

        if (updateError) {
          console.error(`Failed to update domain ${domainRecord.domain}:`, updateError);
        }

        // Also update the panel's domain verification status
        if (domainRecord.panel_id) {
          await supabase
            .from("panels")
            .update({
              domain_verification_status: "verified",
              ssl_status: "active",
            })
            .eq("id", domainRecord.panel_id);
        }
      } else {
        console.log(`⏳ ${domainRecord.domain} not yet configured (expected: ${targets.join(', ') || cnames.join(', ')})`);
      }

      results.push({ domain: domainRecord.domain, verified, matchType, provider: hostingProvider });
    }

    // Also check panels with custom_domain set but not verified
    const { data: panelsWithCustomDomain } = await supabase
      .from("panels")
      .select("id, custom_domain, domain_verification_status, settings, hosting_provider")
      .not("custom_domain", "is", null)
      .neq("domain_verification_status", "verified");

    for (const panel of panelsWithCustomDomain || []) {
      if (!panel.custom_domain) continue;
      
      console.log(`Checking panel custom domain: ${panel.custom_domain}`);
      
      const hostingProvider = panel.hosting_provider || 
        (panel.settings as Record<string, any>)?.hosting_provider || 
        'vercel';
      const customTarget = (panel.settings as Record<string, any>)?.custom_dns_target;
      
      const { targets, cnames } = getExpectedTargets(hostingProvider, customTarget);
      const { verified, matchType } = await checkDNS(panel.custom_domain, targets, cnames);
      
      if (verified) {
        console.log(`✅ Panel domain ${panel.custom_domain} verified via ${matchType} (provider: ${hostingProvider})`);
        await supabase
          .from("panels")
          .update({
            domain_verification_status: "verified",
            ssl_status: "active",
          })
          .eq("id", panel.id);
        
        results.push({ domain: panel.custom_domain, verified: true, matchType, provider: hostingProvider });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked ${results.length} domains`,
        results,
        verifiedCount: results.filter((r) => r.verified).length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Auto-verify error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
