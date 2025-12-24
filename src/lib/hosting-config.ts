// Hosting provider configurations for domain setup
// Supports multiple hosting platforms with their specific DNS requirements

export type HostingProvider = 'lovable' | 'netlify' | 'vercel' | 'cloudflare_pages' | 'custom';

export interface HostingProviderConfig {
  id: HostingProvider;
  name: string;
  icon: string;
  description: string;
  dnsType: 'A' | 'CNAME';
  target: string;
  targetLabel: string;
  wwwTarget?: string;
  requiresWildcard: boolean;
  verificationMethod: 'dns' | 'txt' | 'file';
  helpUrl: string;
  notes?: string[];
}

export const HOSTING_PROVIDERS: Record<HostingProvider, HostingProviderConfig> = {
  lovable: {
    id: 'lovable',
    name: 'Lovable / SMMPilot',
    icon: '💜',
    description: 'Default hosting on Lovable infrastructure',
    dnsType: 'A',
    target: '185.158.133.1',
    targetLabel: 'Lovable IP',
    requiresWildcard: true,
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
    dnsType: 'CNAME',
    target: 'apex-loadbalancer.netlify.com',
    targetLabel: 'Netlify Load Balancer',
    wwwTarget: '[your-site].netlify.app',
    requiresWildcard: false,
    verificationMethod: 'dns',
    helpUrl: 'https://docs.netlify.com/domains-https/custom-domains/',
    notes: [
      'For root domain: Add A record to 75.2.60.5 (Netlify load balancer)',
      'For www: Add CNAME to your-site.netlify.app',
      'Netlify handles SSL automatically',
    ],
  },
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    description: 'Deploy on Vercel with edge network',
    dnsType: 'CNAME',
    target: 'cname.vercel-dns.com',
    targetLabel: 'Vercel DNS',
    wwwTarget: 'cname.vercel-dns.com',
    requiresWildcard: false,
    verificationMethod: 'txt',
    helpUrl: 'https://vercel.com/docs/projects/domains',
    notes: [
      'Add CNAME record pointing to cname.vercel-dns.com',
      'For root domain: Use A record with 76.76.21.21',
      'Vercel may require TXT verification',
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
    verificationMethod: 'txt',
    helpUrl: '',
    notes: [
      'Add A record pointing to your server IP',
      'Or add CNAME pointing to your server hostname',
      'You are responsible for SSL configuration',
    ],
  },
};

export const VERCEL_A_RECORDS = ['76.76.21.21'];
export const NETLIFY_A_RECORDS = ['75.2.60.5'];
export const LOVABLE_IP = '185.158.133.1';

export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT';
  host: string;
  value: string;
  description: string;
  required: boolean;
}

export function getDnsRecordsForProvider(
  provider: HostingProvider,
  domain: string,
  customTarget?: string
): DnsRecord[] {
  const config = HOSTING_PROVIDERS[provider];
  const records: DnsRecord[] = [];

  switch (provider) {
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

    case 'vercel':
      records.push(
        { type: 'A', host: '@', value: '76.76.21.21', description: `Root domain (Vercel)`, required: true },
        { type: 'CNAME', host: 'www', value: 'cname.vercel-dns.com', description: `WWW to Vercel DNS`, required: true }
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

export function validateDnsForProvider(
  provider: HostingProvider,
  aRecords: string[],
  cnameRecords: string[],
  customTarget?: string
): { valid: boolean; message: string } {
  const expected = getExpectedTargetForProvider(provider);
  
  switch (provider) {
    case 'lovable':
      if (aRecords.includes(LOVABLE_IP)) {
        return { valid: true, message: 'DNS correctly points to Lovable' };
      }
      return { valid: false, message: `Expected A record ${LOVABLE_IP}, found: ${aRecords.join(', ') || 'none'}` };

    case 'netlify':
      if (aRecords.some(r => NETLIFY_A_RECORDS.includes(r))) {
        return { valid: true, message: 'DNS correctly points to Netlify' };
      }
      if (cnameRecords.some(r => r.includes('netlify'))) {
        return { valid: true, message: 'CNAME correctly points to Netlify' };
      }
      return { valid: false, message: 'DNS does not point to Netlify' };

    case 'vercel':
      if (aRecords.some(r => VERCEL_A_RECORDS.includes(r))) {
        return { valid: true, message: 'DNS correctly points to Vercel' };
      }
      if (cnameRecords.some(r => r.includes('vercel'))) {
        return { valid: true, message: 'CNAME correctly points to Vercel' };
      }
      return { valid: false, message: 'DNS does not point to Vercel' };

    case 'cloudflare_pages':
      if (cnameRecords.some(r => r.includes('pages.dev'))) {
        return { valid: true, message: 'CNAME correctly points to Cloudflare Pages' };
      }
      return { valid: false, message: 'DNS does not point to Cloudflare Pages' };

    case 'custom':
      if (customTarget) {
        const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(customTarget);
        if (isIp && aRecords.includes(customTarget)) {
          return { valid: true, message: `DNS correctly points to ${customTarget}` };
        }
        if (!isIp && cnameRecords.includes(customTarget)) {
          return { valid: true, message: `CNAME correctly points to ${customTarget}` };
        }
      }
      return { valid: false, message: 'Custom target not configured in DNS' };

    default:
      return { valid: false, message: 'Unknown hosting provider' };
  }
}
