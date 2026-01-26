// Hosting provider configurations for domain setup
// Supports multiple hosting platforms with their specific DNS requirements
// Updated for Vercel wildcard DNS support

export type HostingProvider = 'lovable' | 'netlify' | 'vercel' | 'cloudflare_pages' | 'custom';

export interface HostingProviderConfig {
  id: HostingProvider;
  name: string;
  icon: string;
  description: string;
  dnsType: 'A' | 'CNAME' | 'NS';
  target: string;
  targetLabel: string;
  wwwTarget?: string;
  requiresWildcard: boolean;
  supportsAutoWildcard: boolean;
  verificationMethod: 'dns' | 'txt' | 'file' | 'nameserver';
  nameservers?: string[];
  helpUrl: string;
  notes?: string[];
}

// Vercel configuration constants
export const VERCEL_A_RECORDS = ['76.76.21.21'];
export const VERCEL_CNAME = 'cname.vercel-dns.com';
export const VERCEL_CNAME_PATTERNS = ['cname.vercel-dns.com', 'vercel-dns.com', 'vercel.app'];
export const VERCEL_NAMESERVERS = ['ns1.vercel-dns.com', 'ns2.vercel-dns.com'];

// Other provider constants
export const NETLIFY_A_RECORDS = ['75.2.60.5'];
export const NETLIFY_CNAME_PATTERNS = ['netlify.app', 'netlify.com'];
export const LOVABLE_IP = '185.158.133.1';

export const HOSTING_PROVIDERS: Record<HostingProvider, HostingProviderConfig> = {
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    description: 'Deploy on Vercel with automatic wildcard SSL for all subdomains',
    dnsType: 'A',
    target: '76.76.21.21',
    targetLabel: 'Vercel IP',
    wwwTarget: 'cname.vercel-dns.com',
    requiresWildcard: true,
    supportsAutoWildcard: true,
    verificationMethod: 'nameserver',
    nameservers: VERCEL_NAMESERVERS,
    helpUrl: 'https://vercel.com/docs/projects/domains/working-with-nameservers',
    notes: [
      '⚠️ RECOMMENDED: Use Vercel nameservers for automatic wildcard SSL',
      'Point nameservers to ns1.vercel-dns.com and ns2.vercel-dns.com',
      'Add apex domain (homeofsmm.com) in Vercel dashboard',
      'Add wildcard domain (*.homeofsmm.com) in Vercel dashboard',
      'Vercel auto-provisions SSL certificates for each subdomain',
    ],
  },
  lovable: {
    id: 'lovable',
    name: 'Lovable / HomeOfSMM',
    icon: '💜',
    description: 'Default hosting on Lovable infrastructure',
    dnsType: 'A',
    target: '185.158.133.1',
    targetLabel: 'Lovable IP',
    requiresWildcard: true,
    supportsAutoWildcard: false,
    verificationMethod: 'dns',
    helpUrl: 'https://docs.lovable.dev/features/custom-domain',
    notes: [
      'Add A record for @ pointing to 185.158.133.1',
      'Add A record for www pointing to 185.158.133.1',
      'Optional: Add wildcard (*) for subdomains',
    ],
  },
  netlify: {
    id: 'netlify',
    name: 'Netlify',
    icon: '🌐',
    description: 'Deploy on Netlify with automatic SSL',
    dnsType: 'A',
    target: '75.2.60.5',
    targetLabel: 'Netlify Load Balancer',
    wwwTarget: '[your-site].netlify.app',
    requiresWildcard: false,
    supportsAutoWildcard: false,
    verificationMethod: 'dns',
    helpUrl: 'https://docs.netlify.com/domains-https/custom-domains/',
    notes: [
      'For root domain: Add A record to 75.2.60.5 (Netlify load balancer)',
      'For www: Add CNAME to your-site.netlify.app',
      'Netlify handles SSL automatically',
    ],
  },
  cloudflare_pages: {
    id: 'cloudflare_pages',
    name: 'Cloudflare Pages',
    icon: '☁️',
    description: 'Deploy on Cloudflare Pages',
    dnsType: 'CNAME',
    target: '[project].pages.dev',
    targetLabel: 'Cloudflare Pages URL',
    requiresWildcard: false,
    supportsAutoWildcard: false,
    verificationMethod: 'dns',
    helpUrl: 'https://developers.cloudflare.com/pages/configuration/custom-domains/',
    notes: [
      'Add CNAME pointing to your-project.pages.dev',
      'Turn OFF Cloudflare proxy (gray cloud) initially',
      'SSL is automatic via Cloudflare',
    ],
  },
  custom: {
    id: 'custom',
    name: 'Custom / Self-Hosted',
    icon: '🔧',
    description: 'Use your own server or hosting provider',
    dnsType: 'A',
    target: '',
    targetLabel: 'Your Server IP',
    requiresWildcard: false,
    supportsAutoWildcard: false,
    verificationMethod: 'txt',
    helpUrl: '',
    notes: [
      'Add A record pointing to your server IP',
      'Or add CNAME pointing to your server hostname',
      'You are responsible for SSL configuration',
    ],
  },
};

export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT' | 'NS';
  host: string;
  value: string;
  description: string;
  required: boolean;
  priority?: 'critical' | 'recommended' | 'optional';
}

export function getDnsRecordsForProvider(
  provider: HostingProvider,
  domain: string,
  customTarget?: string
): DnsRecord[] {
  const config = HOSTING_PROVIDERS[provider];
  const records: DnsRecord[] = [];

  switch (provider) {
    case 'vercel':
      // For Vercel with wildcard, recommend nameservers first
      records.push(
        { 
          type: 'NS', 
          host: '@', 
          value: 'ns1.vercel-dns.com', 
          description: 'Vercel Nameserver 1 (required for wildcard)', 
          required: true,
          priority: 'critical'
        },
        { 
          type: 'NS', 
          host: '@', 
          value: 'ns2.vercel-dns.com', 
          description: 'Vercel Nameserver 2 (required for wildcard)', 
          required: true,
          priority: 'critical'
        }
      );
      // Alternative: Direct DNS records (no wildcard)
      records.push(
        { 
          type: 'A', 
          host: '@', 
          value: '76.76.21.21', 
          description: `Root domain (${domain}) - Alternative if not using Vercel NS`, 
          required: false,
          priority: 'optional'
        },
        { 
          type: 'CNAME', 
          host: 'www', 
          value: 'cname.vercel-dns.com', 
          description: `WWW to Vercel DNS - Alternative if not using Vercel NS`, 
          required: false,
          priority: 'optional'
        }
      );
      break;

    case 'lovable':
      records.push(
        { type: 'A', host: '@', value: LOVABLE_IP, description: `Root domain (${domain})`, required: true },
        { type: 'A', host: 'www', value: LOVABLE_IP, description: `WWW subdomain (www.${domain})`, required: true }
      );
      if (config.requiresWildcard) {
        records.push({ type: 'A', host: '*', value: LOVABLE_IP, description: `Wildcard (*.${domain})`, required: false });
      }
      break;

    case 'netlify':
      records.push(
        { type: 'A', host: '@', value: '75.2.60.5', description: `Root domain (Netlify LB)`, required: true },
        { type: 'CNAME', host: 'www', value: customTarget || '[your-site].netlify.app', description: `WWW to Netlify site`, required: true }
      );
      break;

    case 'cloudflare_pages':
      records.push(
        { type: 'CNAME', host: '@', value: customTarget || '[project].pages.dev', description: `Root (may need flattening)`, required: true },
        { type: 'CNAME', host: 'www', value: customTarget || '[project].pages.dev', description: `WWW subdomain`, required: true }
      );
      break;

    case 'custom':
      if (customTarget) {
        const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(customTarget);
        records.push({
          type: isIp ? 'A' : 'CNAME',
          host: '@',
          value: customTarget,
          description: `Root domain`,
          required: true,
        });
        records.push({
          type: isIp ? 'A' : 'CNAME',
          host: 'www',
          value: customTarget,
          description: `WWW subdomain`,
          required: true,
        });
      }
      break;
  }

  return records;
}

export function getExpectedTargetForProvider(provider: HostingProvider): string[] {
  switch (provider) {
    case 'lovable':
      return [LOVABLE_IP];
    case 'netlify':
      return NETLIFY_A_RECORDS;
    case 'vercel':
      return VERCEL_A_RECORDS;
    case 'cloudflare_pages':
      return []; // CNAME-based, varies per project
    case 'custom':
      return []; // User-defined
    default:
      return [LOVABLE_IP];
  }
}

export function getExpectedCnamesForProvider(provider: HostingProvider): string[] {
  switch (provider) {
    case 'vercel':
      return VERCEL_CNAME_PATTERNS;
    case 'netlify':
      return NETLIFY_CNAME_PATTERNS;
    case 'cloudflare_pages':
      return ['pages.dev'];
    default:
      return [];
  }
}

export function validateDnsForProvider(
  provider: HostingProvider,
  aRecords: string[],
  cnameRecords: string[],
  customTarget?: string
): { valid: boolean; message: string; matchType: 'A' | 'CNAME' | 'none' } {
  const expectedIps = getExpectedTargetForProvider(provider);
  const expectedCnames = getExpectedCnamesForProvider(provider);
  
  switch (provider) {
    case 'lovable':
      if (aRecords.includes(LOVABLE_IP)) {
        return { valid: true, message: 'DNS correctly points to Lovable', matchType: 'A' };
      }
      return { valid: false, message: `Expected A record ${LOVABLE_IP}, found: ${aRecords.join(', ') || 'none'}`, matchType: 'none' };

    case 'netlify':
      if (aRecords.some(r => NETLIFY_A_RECORDS.includes(r))) {
        return { valid: true, message: 'DNS correctly points to Netlify', matchType: 'A' };
      }
      if (cnameRecords.some(r => NETLIFY_CNAME_PATTERNS.some(p => r.includes(p)))) {
        return { valid: true, message: 'CNAME correctly points to Netlify', matchType: 'CNAME' };
      }
      return { valid: false, message: 'DNS does not point to Netlify', matchType: 'none' };

    case 'vercel':
      if (aRecords.some(r => VERCEL_A_RECORDS.includes(r))) {
        return { valid: true, message: 'DNS correctly points to Vercel', matchType: 'A' };
      }
      if (cnameRecords.some(r => VERCEL_CNAME_PATTERNS.some(p => r.toLowerCase().includes(p.toLowerCase())))) {
        return { valid: true, message: 'CNAME correctly points to Vercel', matchType: 'CNAME' };
      }
      return { valid: false, message: 'DNS does not point to Vercel', matchType: 'none' };

    case 'cloudflare_pages':
      if (cnameRecords.some(r => r.includes('pages.dev'))) {
        return { valid: true, message: 'CNAME correctly points to Cloudflare Pages', matchType: 'CNAME' };
      }
      return { valid: false, message: 'DNS does not point to Cloudflare Pages', matchType: 'none' };

    case 'custom':
      if (customTarget) {
        const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(customTarget);
        if (isIp && aRecords.includes(customTarget)) {
          return { valid: true, message: `DNS correctly points to ${customTarget}`, matchType: 'A' };
        }
        if (!isIp && cnameRecords.includes(customTarget)) {
          return { valid: true, message: `CNAME correctly points to ${customTarget}`, matchType: 'CNAME' };
        }
      }
      return { valid: false, message: 'Custom target not configured in DNS', matchType: 'none' };

    default:
      return { valid: false, message: 'Unknown hosting provider', matchType: 'none' };
  }
}

/**
 * Check if provider supports automatic wildcard subdomains
 */
export function supportsWildcard(provider: HostingProvider): boolean {
  return HOSTING_PROVIDERS[provider]?.supportsAutoWildcard ?? false;
}

/**
 * Get nameservers for a provider (if applicable)
 */
export function getNameserversForProvider(provider: HostingProvider): string[] | undefined {
  return HOSTING_PROVIDERS[provider]?.nameservers;
}
