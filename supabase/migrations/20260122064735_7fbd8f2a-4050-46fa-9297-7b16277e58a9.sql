-- Seed Security documentation articles
INSERT INTO platform_docs (title, slug, category, content, excerpt, status, order_index, read_time, icon, is_popular)
VALUES 
  (
    'Security Overview',
    'security-overview',
    'security',
    '# Security Overview

Your SMM panel handles sensitive data including customer information, payment details, and API credentials. This guide provides a comprehensive overview of security features and best practices.

## Why Security Matters

- **Protect Customer Data**: Safeguard personal information and transaction history
- **Prevent Financial Loss**: Secure payment processing and balance management
- **Maintain Trust**: Build confidence with your customers through robust security
- **Regulatory Compliance**: Meet data protection requirements

## Security Features

### Authentication
- Secure password hashing with bcrypt
- Session management with automatic expiration
- Two-factor authentication (2FA) support
- Account lockout after failed attempts

### API Security
- API key rotation and management
- Rate limiting to prevent abuse
- IP whitelisting options
- Request signing and validation

### Data Protection
- Encrypted data at rest and in transit
- Secure HTTPS connections
- Regular security audits
- Automated backups

## Quick Security Checklist

1. ✅ Enable two-factor authentication
2. ✅ Use strong, unique passwords
3. ✅ Rotate API keys regularly
4. ✅ Monitor audit logs
5. ✅ Keep software updated
6. ✅ Configure rate limiting
7. ✅ Set up IP restrictions

## Next Steps

- [Two-Factor Authentication](/docs/security/two-factor-auth)
- [API Key Security](/docs/security/api-key-security)
- [Rate Limiting](/docs/security/rate-limiting-security)
- [Security Best Practices](/docs/security/security-best-practices)',
    'Complete security guide for protecting your SMM panel, customers, and data.',
    'published',
    0,
    '5 min',
    'shield',
    true
  ),
  (
    'Two-Factor Authentication',
    'two-factor-auth',
    'security',
    '# Two-Factor Authentication (2FA)

Add an extra layer of security to your panel admin and customer accounts with two-factor authentication.

## What is 2FA?

Two-factor authentication requires users to provide two different forms of identification:
1. **Something you know** - Your password
2. **Something you have** - A code from your phone

## Setting Up 2FA

### For Admin Accounts

1. Go to **Settings > Security**
2. Click **Enable Two-Factor Authentication**
3. Scan the QR code with your authenticator app
4. Enter the verification code
5. Save your backup codes securely

### Supported Authenticator Apps

- Google Authenticator
- Authy
- Microsoft Authenticator
- 1Password
- Bitwarden

## Backup Codes

When you enable 2FA, you receive backup codes. These are essential for account recovery:

- Store backup codes in a secure location
- Each code can only be used once
- Generate new codes if you run out
- Never share backup codes with anyone

## Customer 2FA

You can require or encourage customers to use 2FA:

```
Panel Settings > Security > Customer Authentication
├── Optional 2FA (recommended)
├── Required 2FA for high-value accounts
└── Disabled
```

## Recovery Process

If a user loses access to their 2FA device:
1. Verify identity through support
2. Use a backup code
3. Temporarily disable 2FA
4. Re-enable with new device

## Best Practices

- ✅ Always enable 2FA on admin accounts
- ✅ Use an authenticator app (not SMS)
- ✅ Store backup codes offline
- ✅ Encourage customer adoption
- ✅ Have a recovery process documented',
    'Enable two-factor authentication for enhanced account security.',
    'published',
    1,
    '4 min',
    'shield',
    false
  ),
  (
    'API Key Security',
    'api-key-security',
    'security',
    '# API Key Security

Your API keys are the gateway to your panel. Proper management is crucial for preventing unauthorized access.

## API Key Types

### Panel Owner API Key
- Full access to panel management
- Used for custom integrations
- Should be kept highly secure

### Buyer API Key
- Limited to buyer operations
- Safe for customer distribution
- Per-user key generation

## Security Best Practices

### 1. Key Storage
```javascript
// ❌ Never do this
const API_KEY = "sk_live_abc123...";

// ✅ Use environment variables
const API_KEY = process.env.PANEL_API_KEY;
```

### 2. Key Rotation
Rotate your API keys regularly:
- Every 90 days for production keys
- Immediately if compromised
- After team member departure

### 3. Key Permissions
Limit keys to minimum required permissions:
```
API Key Settings
├── Read-only access
├── Order management
├── Customer management
└── Full access (admin only)
```

## Monitoring API Usage

Track API key usage in the dashboard:
- Request volume and patterns
- Geographic distribution
- Error rates and anomalies
- Unused key identification

## If a Key is Compromised

1. **Immediately revoke** the compromised key
2. **Generate a new key** for legitimate uses
3. **Review audit logs** for unauthorized actions
4. **Update applications** with new key
5. **Investigate** the breach source

## IP Whitelisting

Restrict API access to specific IP addresses:

1. Go to **Settings > API > IP Restrictions**
2. Add allowed IP addresses
3. Enable restriction mode
4. Test with your application

## Rate Limiting per Key

Configure per-key rate limits to prevent abuse:
- Standard: 100 requests/minute
- Premium: 500 requests/minute
- Custom limits available',
    'Best practices for managing and securing your API keys.',
    'published',
    2,
    '5 min',
    'code',
    false
  ),
  (
    'Rate Limiting & DDoS Protection',
    'rate-limiting-security',
    'security',
    '# Rate Limiting & DDoS Protection

Protect your panel from abuse, attacks, and resource exhaustion with proper rate limiting.

## Understanding Rate Limits

Rate limiting controls how many requests can be made in a given time period. This protects against:
- API abuse
- DDoS attacks
- Runaway scripts
- Resource exhaustion

## Default Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| API requests | 100/min | Per API key |
| Login attempts | 5/min | Per IP |
| Password resets | 3/hour | Per email |
| Order creation | 50/min | Per user |

## Configuring Rate Limits

### Panel Settings

```
Settings > Security > Rate Limiting
├── API Rate Limit: [100] requests per [minute]
├── Login Attempts: [5] per [5 minutes]
├── Lockout Duration: [15] minutes
└── Enable IP blocking: [✓]
```

### Custom Limits

For specific endpoints or users:
```javascript
// Example: Premium user higher limits
{
  "user_tier": "premium",
  "api_limit": 500,
  "window_seconds": 60
}
```

## DDoS Protection

### Built-in Protection
- Automatic traffic analysis
- Geographic blocking options
- Challenge-response for suspicious traffic
- CDN integration

### Cloudflare Integration

For enhanced protection:
1. Add your domain to Cloudflare
2. Enable DDoS protection rules
3. Configure custom rules for API endpoints
4. Monitor attack analytics

## Response Headers

API responses include rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640995200
```

## Handling Rate Limit Errors

When rate limited, the API returns:
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please retry after 60 seconds.",
  "retry_after": 60
}
```

## Best Practices

1. ✅ Implement exponential backoff in clients
2. ✅ Monitor rate limit metrics
3. ✅ Set alerts for unusual patterns
4. ✅ Use different limits for different user tiers
5. ✅ Cache API responses where possible',
    'Configure rate limiting and protect against DDoS attacks.',
    'published',
    3,
    '5 min',
    'shield',
    false
  ),
  (
    'Security Best Practices',
    'security-best-practices',
    'security',
    '# Security Best Practices

Follow these essential security practices to protect your SMM panel and customers.

## Account Security

### Strong Passwords
- Minimum 12 characters
- Mix of letters, numbers, symbols
- Unique for each account
- Use a password manager

### Session Management
```
Settings > Security > Sessions
├── Session timeout: 24 hours
├── Single session mode: Optional
├── Force logout on password change: ✓
└── Remember device: 30 days max
```

## Data Protection

### Encryption Standards
- All data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- Secure password hashing (bcrypt)
- Encrypted backups

### Sensitive Data Handling
Never log or expose:
- Full API keys
- Customer passwords
- Payment card numbers
- Personal identification

## Access Control

### Principle of Least Privilege
Grant minimum permissions needed:
```
Team Member Roles
├── Viewer: Read-only access
├── Support: Customer management
├── Manager: Orders + Services
└── Admin: Full access
```

### Audit Everything
- Track all admin actions
- Monitor login attempts
- Review permission changes
- Keep logs for 90+ days

## Infrastructure Security

### HTTPS Only
- Force HTTPS on all pages
- HSTS header enabled
- Valid SSL certificate
- Regular certificate renewal

### Regular Updates
- Keep platform updated
- Monitor security advisories
- Test updates in staging
- Quick deployment of patches

## Incident Response

### Preparation
1. Document response procedures
2. Identify key contacts
3. Test backup restoration
4. Train team on protocols

### If Breached
1. **Contain** - Isolate affected systems
2. **Investigate** - Determine scope
3. **Notify** - Inform affected users
4. **Remediate** - Fix vulnerabilities
5. **Learn** - Update procedures

## Security Checklist

### Daily
- [ ] Review authentication logs
- [ ] Check for failed login spikes
- [ ] Monitor API usage patterns

### Weekly
- [ ] Review user permissions
- [ ] Check for unused accounts
- [ ] Verify backup integrity

### Monthly
- [ ] Rotate API keys
- [ ] Review security settings
- [ ] Update team training
- [ ] Test recovery procedures

## Compliance Considerations

- **GDPR**: Data protection for EU users
- **PCI DSS**: If handling card payments
- **Local Laws**: Jurisdiction-specific requirements

## Resources

- [Two-Factor Authentication](/docs/security/two-factor-auth)
- [API Key Security](/docs/security/api-key-security)
- [Rate Limiting](/docs/security/rate-limiting-security)
- [Audit Logs](/docs/configuration/security-settings)',
    'Essential security practices for protecting your SMM panel.',
    'published',
    4,
    '6 min',
    'shield',
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  category = EXCLUDED.category,
  order_index = EXCLUDED.order_index,
  read_time = EXCLUDED.read_time,
  icon = EXCLUDED.icon,
  is_popular = EXCLUDED.is_popular;