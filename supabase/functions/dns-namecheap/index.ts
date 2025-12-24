import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DNSRecord {
  type: 'A' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  ttl?: number;
}

interface NamecheapRequest {
  domain: string;
  records: DNSRecord[];
  action: 'add' | 'verify';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NAMECHEAP_API_KEY');
    const apiUser = Deno.env.get('NAMECHEAP_API_USER');
    const clientIp = Deno.env.get('NAMECHEAP_CLIENT_IP') || '127.0.0.1';

    if (!apiKey || !apiUser) {
      console.log('[dns-namecheap] Missing API credentials');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Namecheap API credentials not configured',
          requiresSetup: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { domain, records, action } = await req.json() as NamecheapRequest;
    
    if (!domain) {
      return new Response(
        JSON.stringify({ success: false, error: 'Domain is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[dns-namecheap] Processing ${action} for domain: ${domain}`);

    // Parse domain into SLD and TLD
    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid domain format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tld = domainParts.pop()!;
    const sld = domainParts.pop()!;
    const subdomain = domainParts.join('.') || '@';

    console.log(`[dns-namecheap] Parsed domain - SLD: ${sld}, TLD: ${tld}, Subdomain: ${subdomain}`);

    // Namecheap API base URL
    const baseUrl = 'https://api.namecheap.com/xml.response';

    if (action === 'verify') {
      // Get current DNS hosts to verify domain ownership
      const getHostsParams = new URLSearchParams({
        ApiUser: apiUser,
        ApiKey: apiKey,
        UserName: apiUser,
        ClientIp: clientIp,
        Command: 'namecheap.domains.dns.getHosts',
        SLD: sld,
        TLD: tld,
      });

      console.log('[dns-namecheap] Fetching current DNS records...');
      const getResponse = await fetch(`${baseUrl}?${getHostsParams}`);
      const getXml = await getResponse.text();

      console.log('[dns-namecheap] Get hosts response received');

      // Check for errors in response
      if (getXml.includes('<Error')) {
        const errorMatch = getXml.match(/<Error[^>]*>([^<]+)<\/Error>/);
        const errorMsg = errorMatch ? errorMatch[1] : 'Failed to fetch DNS records';
        console.error('[dns-namecheap] API Error:', errorMsg);
        return new Response(
          JSON.stringify({ success: false, error: errorMsg }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Domain verified with Namecheap',
          rawResponse: getXml.substring(0, 500) // Return snippet for debugging
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'add' && records && records.length > 0) {
      // First, get existing hosts
      const getHostsParams = new URLSearchParams({
        ApiUser: apiUser,
        ApiKey: apiKey,
        UserName: apiUser,
        ClientIp: clientIp,
        Command: 'namecheap.domains.dns.getHosts',
        SLD: sld,
        TLD: tld,
      });

      console.log('[dns-namecheap] Fetching existing DNS records before adding...');
      const getResponse = await fetch(`${baseUrl}?${getHostsParams}`);
      const getXml = await getResponse.text();

      // Parse existing hosts from XML
      const existingHosts: Array<{ Name: string; Type: string; Address: string; TTL: string }> = [];
      const hostMatches = getXml.matchAll(/<host\s+([^>]+)\/>/g);
      
      for (const match of hostMatches) {
        const attrs = match[1];
        const nameMatch = attrs.match(/Name="([^"]+)"/);
        const typeMatch = attrs.match(/Type="([^"]+)"/);
        const addressMatch = attrs.match(/Address="([^"]+)"/);
        const ttlMatch = attrs.match(/TTL="([^"]+)"/);
        
        if (nameMatch && typeMatch && addressMatch) {
          existingHosts.push({
            Name: nameMatch[1],
            Type: typeMatch[1],
            Address: addressMatch[1],
            TTL: ttlMatch ? ttlMatch[1] : '1800',
          });
        }
      }

      console.log(`[dns-namecheap] Found ${existingHosts.length} existing DNS records`);

      // Prepare setHosts request with existing + new records
      const setHostsParams = new URLSearchParams({
        ApiUser: apiUser,
        ApiKey: apiKey,
        UserName: apiUser,
        ClientIp: clientIp,
        Command: 'namecheap.domains.dns.setHosts',
        SLD: sld,
        TLD: tld,
      });

      // Add existing hosts
      let hostNum = 1;
      for (const host of existingHosts) {
        // Skip if we're replacing this record
        const isBeingReplaced = records.some(r => 
          r.name === host.Name && r.type === host.Type
        );
        if (isBeingReplaced) continue;

        setHostsParams.append(`HostName${hostNum}`, host.Name);
        setHostsParams.append(`RecordType${hostNum}`, host.Type);
        setHostsParams.append(`Address${hostNum}`, host.Address);
        setHostsParams.append(`TTL${hostNum}`, host.TTL);
        hostNum++;
      }

      // Add new records
      for (const record of records) {
        setHostsParams.append(`HostName${hostNum}`, record.name);
        setHostsParams.append(`RecordType${hostNum}`, record.type);
        setHostsParams.append(`Address${hostNum}`, record.value);
        setHostsParams.append(`TTL${hostNum}`, String(record.ttl || 1800));
        hostNum++;
      }

      console.log(`[dns-namecheap] Setting ${hostNum - 1} total DNS records...`);
      const setResponse = await fetch(`${baseUrl}?${setHostsParams}`);
      const setXml = await setResponse.text();

      // Check for errors
      if (setXml.includes('<Error')) {
        const errorMatch = setXml.match(/<Error[^>]*>([^<]+)<\/Error>/);
        const errorMsg = errorMatch ? errorMatch[1] : 'Failed to set DNS records';
        console.error('[dns-namecheap] API Error:', errorMsg);
        return new Response(
          JSON.stringify({ success: false, error: errorMsg }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check for success
      if (setXml.includes('IsSuccess="true"')) {
        console.log('[dns-namecheap] DNS records updated successfully');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully added ${records.length} DNS record(s)`,
            recordsAdded: records
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unknown response from Namecheap API',
          rawResponse: setXml.substring(0, 500)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action or missing records' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[dns-namecheap] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
