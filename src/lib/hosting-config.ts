// Simplified hosting configuration - Lovable infrastructure only
// NO multi-provider support, NO nameserver recommendations

export const LOVABLE_IP = '185.158.133.1';
export const PLATFORM_DOMAIN = 'smmpilot.online';

export interface DnsRecord {
  type: 'A' | 'TXT';
  name: string;
  value: string;
  description: string;
  required: boolean;
}

/**
 * Get required DNS records for a custom domain
 * Uses only Lovable infrastructure (185.158.133.1)
 */
export function getDnsRecordsForDomain(domain: string, panelId: string): DnsRecord[] {
  return [
    {
      type: 'A',
      name: '@',
      value: LOVABLE_IP,
      description: `Root domain (${domain})`,
      required: true
    },
    {
      type: 'A',
      name: 'www',
      value: LOVABLE_IP,
      description: `WWW subdomain (www.${domain})`,
      required: true
    },
    {
      type: 'TXT',
      name: '_lovable',
      value: `lovable_verify=${panelId}`,
      description: 'Domain ownership verification',
      required: true
    }
  ];
}

/**
 * Validate if DNS is correctly configured for Lovable
 */
export function validateDnsForLovable(
  aRecords: string[]
): { valid: boolean; message: string } {
  if (aRecords.includes(LOVABLE_IP)) {
    return { valid: true, message: 'DNS correctly points to Lovable infrastructure' };
  }
  return { 
    valid: false, 
    message: `Expected A record ${LOVABLE_IP}, found: ${aRecords.join(', ') || 'none'}` 
  };
}
