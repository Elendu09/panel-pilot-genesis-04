

# Plan: Domain Management Page Complete Rewrite

## Current Issues Analysis

After thorough analysis of the current `DomainSettings.tsx` (970 lines) and 15 domain-related components, I've identified significant problems that require a complete rewrite:

### Critical Problems

| Issue | Current State | Impact |
|-------|---------------|--------|
| **Multi-provider complexity** | Supports Vercel, Lovable, Netlify, Cloudflare, Custom | Confuses users - panels only need ONE hosting provider |
| **Inconsistent IP addresses** | Shows `76.76.21.21` (Vercel), `185.158.133.1` (Lovable) | Users don't know which to use |
| **Nameserver recommendation** | Wizard recommends changing nameservers | THIS BREAKS EMAIL - very dangerous |
| **7 tabs** | Domains, Setup, Diagnostics, Propagation, SSL, Help, Buy | Overwhelming for panel owners |
| **Redundant components** | 15 files in `/domain/` - most duplicating functionality | Maintenance nightmare |
| **Panel sync issue** | `panel_domains` table vs `panels.custom_domain` not synced | Two sources of truth |
| **smmpilot.online vs homeofsmm** | TXT verification uses `_smmpilot`, records use `_homeofsmm` | Confusing branding |

### What to REMOVE

| Component | Reason |
|-----------|--------|
| `CustomDomainWizard.tsx` | Recommends nameserver changes (dangerous) |
| `HostingProviderSelector.tsx` | Multi-provider support unnecessary |
| `VercelDeploymentGuide.tsx` | Vercel-specific, not relevant |
| `SubdomainManager.tsx` | Subdomains are automatic via wildcard |
| `DomainTransfer.tsx` | Complex feature rarely used |
| `DomainPurchaseLinks.tsx` | Just links - can be inline |
| `DNSRecordGuide.tsx` | Duplicate of inline instructions |
| `DnsRecordsDisplay.tsx` | Duplicate functionality |
| **7 tabs UI** | Replace with simplified 2-section layout |
| **Nameserver recommendations** | NEVER recommend changing nameservers |

### What to ENHANCE

| Feature | Enhancement |
|---------|-------------|
| **Single IP focus** | Use ONLY `185.158.133.1` (Lovable infrastructure) |
| **Unified branding** | Use `_lovable` for TXT verification consistently |
| **Panel sync** | Update both `panel_domains` AND `panels.custom_domain` together |
| **Simple wizard** | 3 steps max: Enter domain → Add DNS records → Verify |
| **Auto-verification** | Silent background verification, no manual "Verify" button spam |
| **Status clarity** | Clear states: Pending → Verifying → Active → Error |

### What to RESTRICT

| Feature | Restriction |
|---------|-------------|
| **One custom domain per panel** | MVP panels need only 1 custom domain |
| **No nameserver changes** | Only allow A/CNAME record additions |
| **No multi-provider** | Lock to Lovable infrastructure only |
| **No manual DNS checks** | All verification happens automatically |

---

## New Architecture

### Database Sync Strategy

```text
+--------------------+          +-----------------+
|   panel_domains    |  <--->   |     panels      |
+--------------------+          +-----------------+
| id                 |          | id              |
| panel_id (FK)      |  sync    | custom_domain   |
| domain             |  <--->   | domain_status   |
| verification_status|          | ssl_status      |
| ssl_status         |          | subdomain       |
+--------------------+          +-----------------+
```

When domain is added/verified:
1. Insert into `panel_domains`
2. Update `panels.custom_domain` and `panels.domain_verification_status`

### New Simplified UI Structure

```text
Domain Settings Page (2 sections only)
├── Section 1: Your Panel URLs
│   ├── Default Subdomain: {subdomain}.smmpilot.online ✅ Live
│   └── Custom Domain: {domain} [Status Badge]
│
└── Section 2: Add/Manage Custom Domain
    ├── If no domain: Simple input + DNS instructions
    └── If has domain: Status card + DNS instructions + Remove button
```

### DNS Configuration (Lovable Only)

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A | @ | 185.158.133.1 | Root domain |
| A | www | 185.158.133.1 | WWW subdomain |
| TXT | _lovable | lovable_verify={panel_id} | Ownership proof |

**Note:** NO nameserver changes. NO CNAME to vercel-dns.com. Simple A records only.

---

## Implementation Plan

### Files to DELETE (Clean Codebase)

| File | Lines | Reason |
|------|-------|--------|
| `CustomDomainWizard.tsx` | 413 | Recommends dangerous nameserver changes |
| `HostingProviderSelector.tsx` | ~150 | Multi-provider unnecessary |
| `VercelDeploymentGuide.tsx` | ~200 | Vercel-specific |
| `SubdomainManager.tsx` | ~200 | Automatic via wildcard |
| `DomainTransfer.tsx` | ~250 | Rarely used feature |
| `DomainPurchaseLinks.tsx` | ~100 | Inline links sufficient |
| `DNSRecordGuide.tsx` | ~150 | Duplicate |
| `DnsRecordsDisplay.tsx` | ~100 | Duplicate |
| `DomainConfigWizard.tsx` | ~200 | Replace with simpler version |
| **Total removed:** | ~1,750+ lines | Massive simplification |

### Files to KEEP but SIMPLIFY

| File | Keep/Modify |
|------|-------------|
| `SimpleDomainSetup.tsx` | Keep - already simplified |
| `DNSPropagationTracker.tsx` | Keep - useful for debugging |
| `DomainDiagnostics.tsx` | Simplify - remove multi-provider |
| `SSLMonitoringDashboard.tsx` | Keep - useful for SSL status |
| `DomainTroubleshootingGuide.tsx` | Keep - helpful for support |
| `TenantDomainSetup.tsx` | Review - may be duplicate |

### New `DomainSettings.tsx` Structure (Target: ~400 lines max)

```typescript
// Simplified DomainSettings.tsx
const DomainSettings = () => {
  // State: panel, customDomain (singular), verificationStatus
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Header title="Domain Settings" />
      
      {/* Section 1: Your Panel URLs */}
      <PanelURLsCard 
        subdomain={panel.subdomain}
        customDomain={customDomain}
      />
      
      {/* Section 2: Custom Domain Setup */}
      {!customDomain ? (
        <AddDomainCard 
          onDomainAdded={handleDomainAdded}
          panelId={panel.id}
        />
      ) : (
        <DomainStatusCard 
          domain={customDomain}
          status={verificationStatus}
          onRemove={handleRemoveDomain}
          onRetryVerification={handleRetry}
        />
      )}
      
      {/* Optional: Collapsible Help Section */}
      <Collapsible>
        <DNSHelpSection />
      </Collapsible>
    </div>
  );
};
```

### Update Edge Functions

| Function | Change |
|----------|--------|
| `add-vercel-domain` | Rename to `add-domain`, remove Vercel API calls |
| `verify-domain-txt` | Standardize to `_lovable.{domain}` |
| `verify-domain-dns` | Use only `185.158.133.1` as target |
| `domain-health-check` | Remove multi-provider logic |

### Update `hosting-config.ts`

Remove multi-provider constants. Keep only:

```typescript
export const LOVABLE_IP = '185.158.133.1';
export const DNS_RECORDS = [
  { type: 'A', name: '@', value: '185.158.133.1' },
  { type: 'A', name: 'www', value: '185.158.133.1' },
  { type: 'TXT', name: '_lovable', value: 'lovable_verify={panel_id}' }
];
```

---

## New User Flow

```text
1. Panel owner opens Domain Settings
   ↓
2. Sees default subdomain (always active)
   ↓
3. Clicks "Add Custom Domain"
   ↓
4. Enters domain (e.g., mysmmpanel.com)
   ↓
5. System shows DNS instructions:
   - A record @ → 185.158.133.1
   - A record www → 185.158.133.1
   - TXT _lovable → lovable_verify=abc123
   ↓
6. User adds records at registrar
   ↓
7. System auto-verifies every 60 seconds
   ↓
8. When verified: Status changes to "Active" ✅
   ↓
9. Panel accessible at custom domain
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/panel/DomainSettings.tsx` | **REWRITE** | 970 → ~400 lines |
| `src/components/domain/SimpleDomainSetup.tsx` | Keep | Already good |
| `src/components/domain/AddDomainCard.tsx` | **CREATE** | Simple domain input |
| `src/components/domain/DomainStatusCard.tsx` | **CREATE** | Status display |
| `src/components/domain/PanelURLsCard.tsx` | **CREATE** | Show subdomain + custom |
| `src/lib/hosting-config.ts` | **SIMPLIFY** | Remove multi-provider |
| 8+ domain components | **DELETE** | See list above |
| `supabase/functions/add-domain/index.ts` | **CREATE** | Replace add-vercel-domain |
| `supabase/functions/verify-domain-txt/index.ts` | **UPDATE** | Standardize to _lovable |

---

## Summary

This rewrite will:

1. **Delete ~1,750 lines** of redundant code (8+ components)
2. **Simplify from 7 tabs to 2 sections**
3. **Remove dangerous nameserver recommendations**
4. **Standardize on single IP** (185.158.133.1)
5. **Sync panel_domains with panels table**
6. **Auto-verify domains** (no manual button spam)
7. **Consistent branding** (_lovable prefix for TXT)
8. **One custom domain per panel** (MVP constraint)

The result will be a clean, user-friendly domain management experience that panel owners can actually use without confusion or risk of breaking their email.

