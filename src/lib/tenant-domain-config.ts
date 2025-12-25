/**
 * Tenant Domain Configuration Utilities
 * 
 * This module handles tenant subdomain and custom domain routing
 * Supports multiple hosting providers including Vercel with wildcard DNS
 * 
 * DOMAIN TYPES:
 * 1. Platform Root: smmpilot.online, www.smmpilot.online
 * 2. Tenant Subdomain: {panel-name}.smmpilot.online
 * 3. Custom Domain: panel-owner's own domain (e.g., mypanel.com)
 * 
 * VERCEL WILDCARD REQUIREMENTS (RECOMMENDED):
 * - Point nameservers to Vercel: ns1.vercel-dns.com, ns2.vercel-dns.com
 * - Add apex domain (smmpilot.online) in Vercel dashboard
 * - Add wildcard domain (*.smmpilot.online) in Vercel dashboard
 * - Vercel auto-provisions SSL for each subdomain
 * 
 * LOVABLE HOSTING FALLBACK:
 * - A record for root (@) → 185.158.133.1
 * - A record for www → 185.158.133.1
 * - TXT record _lovable → lovable_verify=XXX
 */

// Hosting Provider IPs and Targets
export const LOVABLE_IP = '185.158.133.1';
export const VERCEL_IP = '76.76.21.21';
export const VERCEL_CNAME = 'cname.vercel-dns.com';
export const VERCEL_NAMESERVERS = ['ns1.vercel-dns.com', 'ns2.vercel-dns.com'];
export const NETLIFY_IP = '75.2.60.5';

export const PLATFORM_DOMAIN = 'smmpilot.online';

export type HostingProviderType = 'lovable' | 'vercel' | 'netlify' | 'cloudflare_pages' | 'custom';

export interface TenantDomainConfig {
  type: 'platform' | 'subdomain' | 'custom' | 'external' | 'development';
  hostname: string;
  subdomain: string | null;
  baseDomain: string;
  isValid: boolean;
  requiresVerification: boolean;
}

// Development/preview domains - show platform app
const DEV_PATTERNS = [
  /lovableproject\.com$/,
  /\.lovable\.app$/,
  /lovable\.app$/,
  /^localhost$/,
  /^127\.0\.0\.1$/,
  /\.local$/,
  /\.test$/,
];

// External hosting platforms
const EXTERNAL_HOSTING_PATTERNS = [
  { pattern: /\.netlify\.app$/, provider: 'netlify' },
  { pattern: /\.vercel\.app$/, provider: 'vercel' },
  { pattern: /\.pages\.dev$/, provider: 'cloudflare' },
  { pattern: /\.onrender\.com$/, provider: 'render' },
  { pattern: /\.railway\.app$/, provider: 'railway' },
  { pattern: /\.fly\.dev$/, provider: 'fly' },
  { pattern: /\.herokuapp\.com$/, provider: 'heroku' },
];

/**
 * Analyze a hostname and determine its domain type
 */
export function analyzeDomain(hostname: string): TenantDomainConfig {
  const normalizedHostname = hostname.toLowerCase().trim();
  
  // Check for development/preview domains
  const isDev = DEV_PATTERNS.some(p => p.test(normalizedHostname));
  if (isDev) {
    return {
      type: 'development',
      hostname: normalizedHostname,
      subdomain: null,
      baseDomain: normalizedHostname,
      isValid: true,
      requiresVerification: false,
    };
  }
  
  // Check for platform root
  if (normalizedHostname === PLATFORM_DOMAIN || normalizedHostname === `www.${PLATFORM_DOMAIN}`) {
    return {
      type: 'platform',
      hostname: normalizedHostname,
      subdomain: null,
      baseDomain: PLATFORM_DOMAIN,
      isValid: true,
      requiresVerification: false,
    };
  }
  
  // Check for tenant subdomain (*.smmpilot.online)
  if (normalizedHostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
    const subdomain = normalizedHostname.replace(`.${PLATFORM_DOMAIN}`, '');
    return {
      type: 'subdomain',
      hostname: normalizedHostname,
      subdomain,
      baseDomain: PLATFORM_DOMAIN,
      isValid: isValidSubdomain(subdomain),
      requiresVerification: false, // Subdomains don't need DNS verification
    };
  }
  
  // Check for external hosting platforms
  const externalHost = EXTERNAL_HOSTING_PATTERNS.find(p => p.pattern.test(normalizedHostname));
  if (externalHost) {
    const parts = normalizedHostname.split('.');
    return {
      type: 'external',
      hostname: normalizedHostname,
      subdomain: parts[0],
      baseDomain: normalizedHostname,
      isValid: true,
      requiresVerification: true,
    };
  }
  
  // Custom domain
  return {
    type: 'custom',
    hostname: normalizedHostname,
    subdomain: null,
    baseDomain: normalizedHostname,
    isValid: true,
    requiresVerification: true, // Custom domains need DNS verification
  };
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  // Must be 3-63 characters
  if (subdomain.length < 3 || subdomain.length > 63) return false;
  
  // Must start with letter, end with alphanumeric
  if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(subdomain)) return false;
  
  // No consecutive hyphens
  if (/--/.test(subdomain)) return false;
  
  // Reserved subdomains
  const reserved = ['www', 'api', 'admin', 'mail', 'smtp', 'ftp', 'cpanel', 'webmail', 'ns1', 'ns2'];
  if (reserved.includes(subdomain)) return false;
  
  return true;
}

/**
 * Generate DNS configuration for a custom domain
 * Supports multiple hosting providers with Vercel as the recommended default
 */
export function getDnsConfigForDomain(
  domain: string, 
  verificationToken: string, 
  hostingProvider: HostingProviderType = 'vercel'
) {
  const rootDomain = domain.startsWith('www.') ? domain.slice(4) : domain;
  
  const baseRecords = [];
  
  // Provider-specific DNS records
  switch (hostingProvider) {
    case 'vercel':
      baseRecords.push(
        {
          type: 'A' as const,
          host: '@',
          value: VERCEL_IP,
          ttl: 3600,
          description: 'Points your root domain to Vercel hosting',
          required: true,
        },
        {
          type: 'CNAME' as const,
          host: 'www',
          value: VERCEL_CNAME,
          ttl: 3600,
          description: 'Points www subdomain to Vercel DNS',
          required: true,
        }
      );
      break;
    
    case 'netlify':
      baseRecords.push(
        {
          type: 'A' as const,
          host: '@',
          value: NETLIFY_IP,
          ttl: 3600,
          description: 'Points your root domain to Netlify load balancer',
          required: true,
        },
        {
          type: 'CNAME' as const,
          host: 'www',
          value: '[your-site].netlify.app',
          ttl: 3600,
          description: 'Points www subdomain to your Netlify site',
          required: true,
        }
      );
      break;
    
    case 'lovable':
    default:
      baseRecords.push(
        {
          type: 'A' as const,
          host: '@',
          value: LOVABLE_IP,
          ttl: 3600,
          description: 'Points your root domain to Lovable hosting',
          required: true,
        },
        {
          type: 'A' as const,
          host: 'www',
          value: LOVABLE_IP,
          ttl: 3600,
          description: 'Points www subdomain to Lovable hosting',
          required: true,
        }
      );
      break;
  }
  
  // Add verification TXT records
  baseRecords.push(
    {
      type: 'TXT' as const,
      host: '_smmpilot',
      value: `smmpilot-verify=${verificationToken}`,
      ttl: 3600,
      description: 'Verifies domain ownership for your panel',
      required: true,
    }
  );
  
  // Add Lovable verification for Lovable hosting
  if (hostingProvider === 'lovable') {
    baseRecords.push({
      type: 'TXT' as const,
      host: '_lovable',
      value: `lovable_verify=${verificationToken}`,
      ttl: 3600,
      description: 'Verifies domain ownership for Lovable',
      required: true,
    });
  }
  
  return {
    records: baseRecords,
    instructions: {
      // VERCEL (Recommended for wildcard support)
      vercel: [
        '⚠️ RECOMMENDED: Vercel provides automatic wildcard SSL for all subdomains',
        '',
        '🔧 OPTION 1: Use Vercel Nameservers (Best for wildcard)',
        '1. Go to your domain registrar (Namecheap, GoDaddy, etc.)',
        '2. Find the Nameservers section',
        '3. Change nameservers to:',
        '   • ns1.vercel-dns.com',
        '   • ns2.vercel-dns.com',
        '4. Wait 24-48 hours for propagation',
        '',
        '🌐 Then in Vercel Dashboard:',
        '5. Go to Project Settings → Domains',
        `6. Add domain: ${rootDomain}`,
        `7. Add wildcard: *.${rootDomain}`,
        '8. Vercel auto-provisions SSL certificates',
        '',
        '📋 OPTION 2: Keep existing DNS (Manual setup)',
        `1. Add A Record: @ → ${VERCEL_IP}`,
        `2. Add CNAME: www → ${VERCEL_CNAME}`,
        `3. Add TXT: _smmpilot → smmpilot-verify=${verificationToken}`,
        '4. In Vercel: Add domain and verify',
        '⚠️ Note: Wildcards require Vercel nameservers',
      ],
      
      // Traditional registrar instructions
      namecheap: [
        '1. Log in to Namecheap → Domain List → Manage',
        '2. Go to Advanced DNS tab',
        hostingProvider === 'vercel' 
          ? `3. Add A Record: Host = @, Value = ${VERCEL_IP}`
          : `3. Add A Record: Host = @, Value = ${LOVABLE_IP}`,
        hostingProvider === 'vercel'
          ? `4. Add CNAME Record: Host = www, Value = ${VERCEL_CNAME}`
          : `4. Add A Record: Host = www, Value = ${LOVABLE_IP}`,
        `5. Add TXT Record: Host = _smmpilot, Value = smmpilot-verify=${verificationToken}`,
        hostingProvider === 'lovable' ? `6. Add TXT Record: Host = _lovable, Value = lovable_verify=${verificationToken}` : null,
        '7. Save all changes and wait up to 48 hours for propagation',
      ].filter(Boolean) as string[],
      
      godaddy: [
        '1. Log in to GoDaddy → My Products → DNS',
        '2. Click "Add" under Records',
        hostingProvider === 'vercel'
          ? `3. Type = A, Name = @, Value = ${VERCEL_IP}, TTL = 1 Hour`
          : `3. Type = A, Name = @, Value = ${LOVABLE_IP}, TTL = 1 Hour`,
        hostingProvider === 'vercel'
          ? `4. Type = CNAME, Name = www, Value = ${VERCEL_CNAME}, TTL = 1 Hour`
          : `4. Type = A, Name = www, Value = ${LOVABLE_IP}, TTL = 1 Hour`,
        `5. Type = TXT, Name = _smmpilot, Value = smmpilot-verify=${verificationToken}`,
        hostingProvider === 'lovable' ? `6. Type = TXT, Name = _lovable, Value = lovable_verify=${verificationToken}` : null,
        '7. Save and wait for DNS propagation',
      ].filter(Boolean) as string[],
      
      cloudflare: [
        '1. Log in to Cloudflare → Select your domain',
        '2. Go to DNS → Records',
        hostingProvider === 'vercel'
          ? `3. Add A record: Name = @, Content = ${VERCEL_IP}, Proxy = OFF (DNS only)`
          : `3. Add A record: Name = @, Content = ${LOVABLE_IP}, Proxy = OFF (DNS only)`,
        hostingProvider === 'vercel'
          ? `4. Add CNAME record: Name = www, Content = ${VERCEL_CNAME}, Proxy = OFF`
          : `4. Add A record: Name = www, Content = ${LOVABLE_IP}, Proxy = OFF`,
        `5. Add TXT record: Name = _smmpilot, Content = smmpilot-verify=${verificationToken}`,
        hostingProvider === 'lovable' ? `6. Add TXT record: Name = _lovable, Content = lovable_verify=${verificationToken}` : null,
        '⚠️ IMPORTANT: Disable Cloudflare proxy (orange cloud → gray) for A/CNAME records',
      ].filter(Boolean) as string[],
    },
    rootDomain,
    targetIp: hostingProvider === 'vercel' ? VERCEL_IP : hostingProvider === 'netlify' ? NETLIFY_IP : LOVABLE_IP,
    verificationToken,
    hostingProvider,
    nameservers: hostingProvider === 'vercel' ? VERCEL_NAMESERVERS : undefined,
  };
}

/**
 * Build tenant URL from subdomain
 */
export function buildTenantUrl(subdomain: string): string {
  return `https://${subdomain}.${PLATFORM_DOMAIN}`;
}

/**
 * Extract panel identifier from URL
 */
export function extractPanelIdentifier(hostname: string): string | null {
  const config = analyzeDomain(hostname);
  
  switch (config.type) {
    case 'subdomain':
      return config.subdomain;
    case 'custom':
    case 'external':
      return config.hostname; // Use full hostname for custom domains
    default:
      return null;
  }
}

/**
 * Get the expected DNS target for a hosting provider
 */
export function getExpectedDnsTarget(hostingProvider: HostingProviderType): {
  ip: string;
  cname: string;
  nameservers?: string[];
} {
  switch (hostingProvider) {
    case 'vercel':
      return { ip: VERCEL_IP, cname: VERCEL_CNAME, nameservers: VERCEL_NAMESERVERS };
    case 'netlify':
      return { ip: NETLIFY_IP, cname: '[site].netlify.app' };
    case 'lovable':
    default:
      return { ip: LOVABLE_IP, cname: '' };
  }
}

/**
 * Check if a hosting provider supports automatic wildcard SSL
 */
export function supportsWildcardSSL(hostingProvider: HostingProviderType): boolean {
  return hostingProvider === 'vercel';
}
