// Simplified hosting configuration for Vercel-only infrastructure
// All domains are hosted on Vercel with wildcard DNS support

// Vercel DNS Configuration - the ONLY hosting provider we use
export const VERCEL_IP = '76.76.21.21';
export const VERCEL_CNAME = 'cname.vercel-dns.com';
export const VERCEL_NAMESERVERS = ['ns1.vercel-dns.com', 'ns2.vercel-dns.com'];

// Platform domains - both are valid platform subdomains
export const PLATFORM_DOMAINS = ['smmpilot.online', 'homeofsmm.com'];
export const PRIMARY_PLATFORM_DOMAIN = 'smmpilot.online'; // Used for display
export const PLATFORM_DOMAIN = PRIMARY_PLATFORM_DOMAIN; // Legacy compatibility

// DNS Records for custom domains
export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT';
  host: string;
  value: string;
  description: string;
  required: boolean;
}

/**
 * Check if a domain is a platform subdomain (e.g., *.smmpilot.online or *.homeofsmm.com)
 * These are FREE subdomains provided by the platform and should NOT be treated as custom domains
 */
export function isPlatformSubdomain(domain: string): boolean {
  if (!domain) return false;
  const lowerDomain = domain.toLowerCase().trim();
  return PLATFORM_DOMAINS.some(pd => lowerDomain.endsWith(`.${pd}`));
}

/**
 * Check if a domain is a platform root domain
 */
export function isPlatformRootDomain(domain: string): boolean {
  if (!domain) return false;
  const lowerDomain = domain.toLowerCase().trim();
  return PLATFORM_DOMAINS.includes(lowerDomain);
}

/**
 * Validate if a domain can be used as a custom domain
 * Returns validation result with error message if invalid
 */
export function isValidCustomDomain(domain: string): { valid: boolean; error?: string } {
  if (!domain || domain.length < 4) {
    return { valid: false, error: 'Domain is too short' };
  }
  
  const lowerDomain = domain.toLowerCase().trim();
  
  // Check if it's a platform subdomain
  if (isPlatformSubdomain(lowerDomain)) {
    return { valid: false, error: 'Platform subdomains cannot be added as custom domains. Use the subdomain selector instead.' };
  }
  
  // Check if it's a platform root domain
  if (isPlatformRootDomain(lowerDomain)) {
    return { valid: false, error: 'Cannot use platform root domain as custom domain' };
  }
  
  // Validate domain format
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
  if (!domainRegex.test(lowerDomain)) {
    return { valid: false, error: 'Invalid domain format. Use format: example.com' };
  }
  
  return { valid: true };
}

/**
 * Check if a domain is a valid custom domain (not a platform subdomain)
 */
export function isCustomDomain(domain: string): boolean {
  if (!domain) return false;
  // Exclude platform subdomains
  if (isPlatformSubdomain(domain)) return false;
  // Exclude platform root domains
  if (isPlatformRootDomain(domain)) return false;
  // Must have at least one dot
  return domain.includes('.');
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
