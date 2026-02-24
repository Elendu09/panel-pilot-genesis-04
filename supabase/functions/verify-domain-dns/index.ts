import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DnsCheckRequest {
  domain: string;
  panel_id?: string;
  expected_a_record?: string;
  expected_cname?: string;
  expected_txt_value?: string;
}

interface DnsRecord {
  type: string;
  name: string;
  value: string;
}

interface DnsCheckResult {
  domain: string;
  a_record: { found: boolean; value: string | null; expected: string };
  cname_record: { found: boolean; value: string | null; expected: string };
  txt_record: { found: boolean; value: string | null; expected: string };
  overall_status: 'verified' | 'pending' | 'misconfigured';
  vercel_configured: boolean;
  checks_passed: number;
  total_checks: number;
  message: string;
}

// Fetch DNS records using Google's DNS-over-HTTPS
async function fetchDnsRecords(domain: string, recordType: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${recordType}`,
      { headers: { Accept: "application/dns-json" } }
    );
    
    if (!response.ok) {
      console.error(`DNS lookup failed for ${domain} (${recordType}):`, response.status);
      return [];
    }
    
    const data = await response.json();
    if (!data.Answer) return [];
    
    return data.Answer.map((record: { data: string }) => 
      record.data.replace(/^"|"$/g, '').replace(/\\"/g, '"')
    );
  } catch (error) {
    console.error(`Error fetching DNS records for ${domain} (${recordType}):`, error);
    return [];
  }
}

// Check if Vercel has the domain configured
async function checkVercelDomain(domain: string, vercelToken?: string, projectId?: string): Promise<{ configured: boolean; verified: boolean }> {
  if (!vercelToken || !projectId) {
    return { configured: false, verified: false };
  }

  try {
    const response = await fetch(
      `https://api.vercel.com/v6/domains/${domain}/config`,
      {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      }
    );

    if (!response.ok) {
      return { configured: false, verified: false };
    }

    const data = await response.json();
    return {
      configured: !data.misconfigured,
      verified: data.configured === true,
    };
  } catch (error) {
    console.error("Error checking Vercel domain:", error);
    return { configured: false, verified: false };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: DnsCheckRequest = await req.json();
    const { 
      domain, 
      panel_id,
      expected_a_record = "76.76.21.21",
      expected_cname = "cname.vercel-dns.com",
      expected_txt_value
    } = body;

    if (!domain) {
      return new Response(
        JSON.stringify({ error: "Domain is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking DNS for domain: ${domain}`);

    // Get Vercel token from platform_config if available
    let vercelToken: string | undefined;
    let vercelProjectId: string | undefined;

    const { data: configData } = await supabase
      .from('platform_config')
      .select('key, value')
      .in('key', ['vercel_token', 'vercel_project_id']);

    if (configData) {
      vercelToken = configData.find(c => c.key === 'vercel_token')?.value;
      vercelProjectId = configData.find(c => c.key === 'vercel_project_id')?.value;
    }

    // Check A record (root domain)
    const aRecords = await fetchDnsRecords(domain, "A");
    const aRecordFound = aRecords.includes(expected_a_record);
    
    // Check CNAME for www subdomain
    const cnameRecords = await fetchDnsRecords(`www.${domain}`, "CNAME");
    const cnameFound = cnameRecords.some(r => r.toLowerCase().includes('vercel'));

    // Check TXT record for verification
    let txtRecordFound = false;
    let txtValue: string | null = null;
    if (expected_txt_value) {
      const txtRecords = await fetchDnsRecords(`_homeofsmm.${domain}`, "TXT");
      txtValue = txtRecords.find(r => r.includes('homeofsmm-verify')) || null;
      txtRecordFound = txtRecords.some(r => r.includes(expected_txt_value));
    } else {
      // Just check if any homeofsmm verification TXT exists
      const txtRecords = await fetchDnsRecords(`_homeofsmm.${domain}`, "TXT");
      txtValue = txtRecords.find(r => r.includes('homeofsmm-verify')) || null;
      txtRecordFound = txtValue !== null;
    }

    // Check Vercel configuration
    const vercelStatus = await checkVercelDomain(domain, vercelToken, vercelProjectId);

    // Calculate overall status
    let checksRequired = 2; // A record and CNAME
    let checksPassed = 0;
    
    if (aRecordFound) checksPassed++;
    if (cnameFound) checksPassed++;
    
    if (expected_txt_value) {
      checksRequired++;
      if (txtRecordFound) checksPassed++;
    }

    let overallStatus: 'verified' | 'pending' | 'misconfigured';
    let message: string;

    if (checksPassed === checksRequired) {
      overallStatus = 'verified';
      message = 'All DNS records are correctly configured!';
    } else if (checksPassed > 0) {
      overallStatus = 'pending';
      message = `DNS propagation in progress (${checksPassed}/${checksRequired} records found)`;
    } else {
      overallStatus = 'misconfigured';
      message = 'DNS records not found. Please add the required records at your registrar.';
    }

    const result: DnsCheckResult = {
      domain,
      a_record: {
        found: aRecordFound,
        value: aRecords[0] || null,
        expected: expected_a_record,
      },
      cname_record: {
        found: cnameFound,
        value: cnameRecords[0] || null,
        expected: expected_cname,
      },
      txt_record: {
        found: txtRecordFound,
        value: txtValue,
        expected: expected_txt_value || 'homeofsmm-verify=...',
      },
      overall_status: overallStatus,
      vercel_configured: vercelStatus.configured,
      checks_passed: checksPassed,
      total_checks: checksRequired,
      message,
    };

    // Update panel_domains if panel_id provided
    if (panel_id && domain) {
      const updateData: any = {
        verification_status: overallStatus,
        dns_configured: overallStatus === 'verified',
        updated_at: new Date().toISOString(),
      };
      
      if (overallStatus === 'verified') {
        updateData.verified_at = new Date().toISOString();
      }

      await supabase
        .from('panel_domains')
        .update(updateData)
        .eq('panel_id', panel_id)
        .eq('domain', domain);
    }

    console.log(`DNS check result for ${domain}:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-domain-dns:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
