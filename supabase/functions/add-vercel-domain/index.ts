import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AddDomainRequest {
  domain: string;
  panel_id: string;
}

interface VercelDomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string;
  redirectStatusCode?: number;
  gitBranch?: string;
  updatedAt?: number;
  createdAt?: number;
  verified: boolean;
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: AddDomainRequest = await req.json();
    const { domain, panel_id } = body;

    if (!domain || !panel_id) {
      return new Response(
        JSON.stringify({ error: "Domain and panel_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Vercel credentials from platform_config
    const { data: configData, error: configError } = await supabase
      .from('platform_config')
      .select('key, value')
      .in('key', ['vercel_token', 'vercel_project_id', 'vercel_team_id']);

    if (configError) {
      console.error("Error fetching platform config:", configError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch platform configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vercelToken = configData?.find(c => c.key === 'vercel_token')?.value;
    const vercelProjectId = configData?.find(c => c.key === 'vercel_project_id')?.value;
    const vercelTeamId = configData?.find(c => c.key === 'vercel_team_id')?.value;

    if (!vercelToken || !vercelProjectId) {
      // Return DNS instructions without Vercel API integration
      console.log("Vercel credentials not configured, returning manual instructions");
      
      const verificationToken = crypto.randomUUID().substring(0, 16);
      
      // Store domain in panel_domains
      await supabase
        .from('panel_domains')
        .upsert({
          panel_id,
          domain,
          verification_status: 'pending',
          verification_token: verificationToken,
          txt_verification_record: `homeofsmm-verify=${verificationToken}`,
          expected_target: '76.76.21.21',
          dns_configured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'panel_id,domain' });

      return new Response(
        JSON.stringify({
          success: true,
          domain,
          manual_setup: true,
          verification_token: verificationToken,
          dns_records: [
            { type: 'A', name: '@', value: '76.76.21.21', ttl: 3600 },
            { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: 3600 },
            { type: 'TXT', name: '_homeofsmm', value: `homeofsmm-verify=${verificationToken}`, ttl: 3600 },
          ],
          message: "Add these DNS records at your domain registrar. Do NOT change your nameservers.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add domain to Vercel project
    console.log(`Adding domain ${domain} to Vercel project ${vercelProjectId}`);

    let vercelUrl = `https://api.vercel.com/v10/projects/${vercelProjectId}/domains`;
    if (vercelTeamId) {
      vercelUrl += `?teamId=${vercelTeamId}`;
    }

    const vercelResponse = await fetch(vercelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });

    const vercelData = await vercelResponse.json();
    
    if (!vercelResponse.ok) {
      // Check if domain already exists (409) or other error
      if (vercelResponse.status === 409) {
        console.log(`Domain ${domain} already exists in Vercel project`);
      } else {
        console.error("Vercel API error:", vercelData);
        return new Response(
          JSON.stringify({ 
            error: vercelData.error?.message || "Failed to add domain to Vercel",
            vercel_error: vercelData 
          }),
          { status: vercelResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const verificationToken = crypto.randomUUID().substring(0, 16);

    // Store domain in panel_domains
    const { error: insertError } = await supabase
      .from('panel_domains')
      .upsert({
        panel_id,
        domain,
        verification_status: 'pending',
        verification_token: verificationToken,
        txt_verification_record: `homeofsmm-verify=${verificationToken}`,
        expected_target: '76.76.21.21',
        dns_configured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'panel_id,domain' });

    if (insertError) {
      console.error("Error storing domain:", insertError);
    }

    // Also add www subdomain to Vercel if root was successful
    if (vercelResponse.ok) {
      try {
        await fetch(vercelUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vercelToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: `www.${domain}`,
            redirect: domain, // Redirect www to apex
            redirectStatusCode: 308,
          }),
        });
      } catch (wwwError) {
        console.log("Note: www subdomain might already exist or couldn't be added");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        vercel_configured: vercelResponse.ok,
        verification_token: verificationToken,
        dns_records: [
          { type: 'A', name: '@', value: '76.76.21.21', ttl: 3600 },
          { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: 3600 },
          { type: 'TXT', name: '_homeofsmm', value: `homeofsmm-verify=${verificationToken}`, ttl: 3600 },
        ],
        message: vercelResponse.ok 
          ? "Domain added to Vercel! Add these DNS records at your registrar." 
          : "Add these DNS records at your domain registrar.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in add-vercel-domain:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
