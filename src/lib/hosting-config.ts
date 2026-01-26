// Simplified hosting configuration for Vercel-only infrastructure
// All domains are hosted on Vercel with wildcard DNS support

// Vercel DNS Configuration - the ONLY hosting provider we use
export const VERCEL_IP = '76.76.21.21';
export const VERCEL_CNAME = 'cname.vercel-dns.com';
export const VERCEL_NAMESERVERS = ['ns1.vercel-dns.com', 'ns2.vercel-dns.com'];

// Platform domain
export const PLATFORM_DOMAIN = 'smmpilot.online';

// DNS Records for custom domains
export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT';
  host: string;
  value: string;
  description: string;
  required: boolean;
}

/**
 * Get DNS records required for a custom domain on Vercel
 */
export function getDnsRecordsForDomain(domain: string, verificationToken: string): DnsRecord[] {
  return [
    {
      type: 'A',
      host: '@',
      value: VERCEL_IP,
      description: `Points ${domain} to Vercel hosting`,
      required: true,
    },
    {
      type: 'CNAME',
      host: 'www',
      value: VERCEL_CNAME,
      description: `Points www.${domain} to Vercel DNS`,
      required: true,
    },
    {
      type: 'TXT',
      host: '_smmpilot',
      value: `smmpilot-verify=${verificationToken}`,
      description: 'Verifies domain ownership for your panel',
      required: true,
    },
  ];
}

/**
 * Validate if DNS is correctly pointing to Vercel
 */
export function validateDnsForVercel(
  aRecords: string[],
  cnameRecords: string[]
): { valid: boolean; message: string } {
  if (aRecords.includes(VERCEL_IP)) {
    return { valid: true, message: 'DNS correctly points to Vercel' };
  }
  
  if (cnameRecords.some(r => r.toLowerCase().includes('vercel'))) {
    return { valid: true, message: 'CNAME correctly points to Vercel' };
  }
  
  return { 
    valid: false, 
    message: `Expected A record ${VERCEL_IP}, found: ${aRecords.join(', ') || 'none'}` 
  };
}
