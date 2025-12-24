/**
 * Tenant Domain Configuration Utilities
 * 
 * This module handles tenant subdomain and custom domain routing
 * compatible with Lovable's domain setup (A records to 185.158.133.1)
 * 
 * DOMAIN TYPES:
 * 1. Platform Root: smmpilot.online, www.smmpilot.online
 * 2. Tenant Subdomain: {panel-name}.smmpilot.online
 * 3. Custom Domain: panel-owner's own domain (e.g., mypanel.com)
 * 
 * LOVABLE DOMAIN REQUIREMENTS:
 * - A record for root (@) → 185.158.133.1
 * - A record for www → 185.158.133.1
 * - TXT record _lovable → lovable_verify=XXX
 */

export const LOVABLE_IP = '185.158.133.1';
export const PLATFORM_DOMAIN = 'smmpilot.online';

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
 */
export function getDnsConfigForDomain(domain: string, verificationToken: string) {
  const rootDomain = domain.startsWith('www.') ? domain.slice(4) : domain;
  
  return {
    records: [
      {
        type: 'A',
        host: '@',
        value: LOVABLE_IP,
        ttl: 3600,
        description: 'Points your root domain to Lovable hosting',
        required: true,
      },
      {
        type: 'A',
        host: 'www',
        value: LOVABLE_IP,
        ttl: 3600,
        description: 'Points www subdomain to Lovable hosting',
        required: true,
      },
      {
        type: 'TXT',
        host: '_lovable',
        value: `lovable_verify=${verificationToken}`,
        ttl: 3600,
        description: 'Verifies domain ownership for Lovable',
        required: true,
      },
      {
        type: 'TXT',
        host: '_smmpilot',
        value: `smmpilot-verify=${verificationToken}`,
        ttl: 3600,
        description: 'Verifies domain ownership for your panel',
        required: true,
      },
    ],
    instructions: {
      namecheap: [
        '1. Log in to Namecheap → Domain List → Manage',
        '2. Go to Advanced DNS tab',
        '3. Add A Record: Host = @, Value = 185.158.133.1',
        '4. Add A Record: Host = www, Value = 185.158.133.1',
        `5. Add TXT Record: Host = _lovable, Value = lovable_verify=${verificationToken}`,
        `6. Add TXT Record: Host = _smmpilot, Value = smmpilot-verify=${verificationToken}`,
        '7. Save all changes and wait up to 48 hours for propagation',
      ],
      godaddy: [
        '1. Log in to GoDaddy → My Products → DNS',
        '2. Click "Add" under Records',
        '3. Type = A, Name = @, Value = 185.158.133.1, TTL = 1 Hour',
        '4. Type = A, Name = www, Value = 185.158.133.1, TTL = 1 Hour',
        `5. Type = TXT, Name = _lovable, Value = lovable_verify=${verificationToken}`,
        `6. Type = TXT, Name = _smmpilot, Value = smmpilot-verify=${verificationToken}`,
        '7. Save and wait for DNS propagation',
      ],
      cloudflare: [
        '1. Log in to Cloudflare → Select your domain',
        '2. Go to DNS → Records',
        '3. Add A record: Name = @, Content = 185.158.133.1, Proxy = OFF (DNS only)',
        '4. Add A record: Name = www, Content = 185.158.133.1, Proxy = OFF',
        `5. Add TXT record: Name = _lovable, Content = lovable_verify=${verificationToken}`,
        `6. Add TXT record: Name = _smmpilot, Content = smmpilot-verify=${verificationToken}`,
        '⚠️ IMPORTANT: Disable Cloudflare proxy (orange cloud → gray) for A records',
      ],
    },
    rootDomain,
    targetIp: LOVABLE_IP,
    verificationToken,
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
