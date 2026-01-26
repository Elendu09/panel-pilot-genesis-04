import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TXTVerificationRequest {
  domain: string;
  panel_id: string;
}

interface DNSAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface GoogleDNSResponse {
  Answer?: DNSAnswer[];
  Status: number;
}

async function lookupTXTRecords(domain: string): Promise<string[]> {
  const txtRecords: string[] = [];
  
  // Check _smmpilot subdomain for verification TXT record (Vercel hosting)
  const verificationHost = `_smmpilot.${domain}`;
  
  console.log(`[verify-domain-txt] Looking up TXT records for: ${verificationHost}`);
  
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(verificationHost)}&type=TXT`,
      { headers: { Accept: "application/dns-json" } }
    );
    
    if (!response.ok) {
      console.log(`[verify-domain-txt] Google DNS returned status: ${response.status}`);
      return txtRecords;
    }
    
    const data: GoogleDNSResponse = await response.json();
    console.log(`[verify-domain-txt] Google DNS response:`, JSON.stringify(data));
    
    if (data.Answer) {
      for (const answer of data.Answer) {
        if (answer.type === 16) { // TXT record type
          // Remove quotes from TXT record data
          const cleanData = answer.data.replace(/^"|"$/g, '');
          txtRecords.push(cleanData);
          console.log(`[verify-domain-txt] Found TXT record: ${cleanData}`);
        }
      }
    }
  } catch (error) {
    console.error(`[verify-domain-txt] Error looking up TXT records:`, error);
  }
  
  // Also check Cloudflare DNS as backup
  try {
    const cfResponse = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(verificationHost)}&type=TXT`,
      { headers: { Accept: "application/dns-json" } }
    );
    
    if (cfResponse.ok) {
      const cfData: GoogleDNSResponse = await cfResponse.json();
      console.log(`[verify-domain-txt] Cloudflare DNS response:`, JSON.stringify(cfData));
      
      if (cfData.Answer) {
        for (const answer of cfData.Answer) {
          if (answer.type === 16) {
            const cleanData = answer.data.replace(/^"|"$/g, '');
            if (!txtRecords.includes(cleanData)) {
              txtRecords.push(cleanData);
              console.log(`[verify-domain-txt] Found TXT record (Cloudflare): ${cleanData}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`[verify-domain-txt] Cloudflare DNS error:`, error);
  }
  
  return txtRecords;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, panel_id }: TXTVerificationRequest = await req.json();

    if (!domain || !panel_id) {
      return new Response(
        JSON.stringify({ error: "Missing domain or panel_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[verify-domain-txt] Verifying TXT record for domain: ${domain}, panel: ${panel_id}`);

    // Expected TXT record value
    const expectedValue = `smmpilot-verify=${panel_id}`;
    console.log(`[verify-domain-txt] Expected TXT value: ${expectedValue}`);

    // Lookup TXT records
    const txtRecords = await lookupTXTRecords(domain);
    console.log(`[verify-domain-txt] Found ${txtRecords.length} TXT records`);

    // Check if any TXT record matches
    const isVerified = txtRecords.some(record => 
      record === expectedValue || 
      record.includes(expectedValue)
    );

    console.log(`[verify-domain-txt] Verification result: ${isVerified}`);

    // If verified, update the database
    if (isVerified) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Update panel_domains if exists
      const { error: domainError } = await supabase
        .from("panel_domains")
        .update({
          txt_verified_at: new Date().toISOString(),
          verification_status: "verified",
          verified_at: new Date().toISOString(),
        })
        .eq("panel_id", panel_id)
        .eq("domain", domain);

      if (domainError) {
        console.error(`[verify-domain-txt] Error updating panel_domains:`, domainError);
      }

      // Also update the main panels table if custom_domain matches
      const { error: panelError } = await supabase
        .from("panels")
        .update({
          domain_verification_status: "verified",
        })
        .eq("id", panel_id)
        .eq("custom_domain", domain);

      if (panelError) {
        console.error(`[verify-domain-txt] Error updating panels:`, panelError);
      }

      console.log(`[verify-domain-txt] Database updated successfully`);
    }

    return new Response(
      JSON.stringify({
        verified: isVerified,
        domain,
        panel_id,
        txt_records_found: txtRecords,
        expected_value: expectedValue,
        verification_host: `_smmpilot.${domain}`,
        message: isVerified 
          ? "Domain ownership verified via TXT record" 
          : `TXT record not found. Add a TXT record for _smmpilot.${domain} with value: ${expectedValue}`,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error(`[verify-domain-txt] Error:`, error);
    return new Response(
      JSON.stringify({ error: error.message || "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
