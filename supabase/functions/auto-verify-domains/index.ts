import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_IP = "185.158.133.1";

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

async function checkDNS(domain: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { headers: { Accept: "application/dns-json" } }
    );
    
    if (!response.ok) return false;
    
    const data: GoogleDNSResponse = await response.json();
    
    if (data.Status === 0 && data.Answer) {
      return data.Answer.some((answer) => answer.data === LOVABLE_IP);
    }
    return false;
  } catch (error) {
    console.error(`DNS check failed for ${domain}:`, error);
    return false;
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

    // Fetch all pending domains
    const { data: pendingDomains, error: fetchError } = await supabase
      .from("panel_domains")
      .select("id, domain, panel_id, verification_status")
      .eq("verification_status", "pending");

    if (fetchError) {
      throw new Error(`Failed to fetch domains: ${fetchError.message}`);
    }

    console.log(`Found ${pendingDomains?.length || 0} pending domains`);

    const results: { domain: string; verified: boolean }[] = [];

    for (const domainRecord of pendingDomains || []) {
      console.log(`Checking DNS for: ${domainRecord.domain}`);
      
      const isVerified = await checkDNS(domainRecord.domain);
      
      if (isVerified) {
        console.log(`✅ ${domainRecord.domain} verified!`);
        
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
        console.log(`⏳ ${domainRecord.domain} not yet configured`);
      }

      results.push({ domain: domainRecord.domain, verified: isVerified });
    }

    // Also check panels with custom_domain set but not verified
    const { data: panelsWithCustomDomain } = await supabase
      .from("panels")
      .select("id, custom_domain, domain_verification_status")
      .not("custom_domain", "is", null)
      .neq("domain_verification_status", "verified");

    for (const panel of panelsWithCustomDomain || []) {
      if (!panel.custom_domain) continue;
      
      console.log(`Checking panel custom domain: ${panel.custom_domain}`);
      const isVerified = await checkDNS(panel.custom_domain);
      
      if (isVerified) {
        console.log(`✅ Panel domain ${panel.custom_domain} verified!`);
        await supabase
          .from("panels")
          .update({
            domain_verification_status: "verified",
            ssl_status: "active",
          })
          .eq("id", panel.id);
        
        results.push({ domain: panel.custom_domain, verified: true });
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