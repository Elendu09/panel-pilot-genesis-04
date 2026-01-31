
# Comprehensive Implementation Plan

## Summary of All Changes

This plan addresses all requested features in a complete, production-ready manner:

| # | Feature | Scope | Priority |
|---|---------|-------|----------|
| 1 | Real Fast Order Funnel Analytics Tracking | New tracking system + analytics update | High |
| 2 | Security Enforcement Middleware | Edge function rate limiting + IP blocking | High |
| 3 | Automatic Notifications for Manual Deposits | Process-payment + panel owner alerts | High |

---

## Part 1: Real Fast Order Funnel Analytics Tracking

### Current State
- The Fast Order funnel currently uses **simulated multipliers** (e.g., `stats.activeUsers * 3`)
- No actual event tracking exists for page visits, service selections, or checkout attempts

### Solution Architecture

**Create an analytics events tracking system:**

```text
┌─────────────────────────────────────────────────────────────────┐
│  FAST ORDER FLOW                                                 │
├─────────────┬──────────────┬───────────────┬───────────────────┤
│ Page Visit  │  Selection   │   Checkout    │    Complete       │
│ (Step 1)    │  (Step 2-3)  │   (Step 5)    │    (Order)        │
└─────────────┴──────────────┴───────────────┴───────────────────┘
        ↓             ↓              ↓               ↓
   Track Event   Track Event    Track Event    Order Created
        ↓             ↓              ↓               ↓
┌───────────────────────────────────────────────────────────────┐
│                   panel_analytics_events                       │
│   (panel_id, event_type, metadata, session_id, created_at)    │
└───────────────────────────────────────────────────────────────┘
```

### Database Changes

**Create new table via migration:**

```sql
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES panels(id),
  event_type TEXT NOT NULL, -- 'fast_order_visit', 'service_select', 'checkout_start', 'checkout_complete'
  session_id TEXT, -- Browser session ID for unique visitor tracking
  buyer_id UUID REFERENCES client_users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_events_panel ON analytics_events(panel_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_date ON analytics_events(created_at);
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/use-analytics-tracking.tsx` | Hook to track events with session ID |
| `supabase/functions/track-analytics-event/index.ts` | Edge function to record events |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/FastOrder.tsx` | Add event tracking for page visit and step changes |
| `src/components/storefront/FastOrderSection.tsx` | Track service selection events |
| `src/pages/panel/Analytics.tsx` | Replace simulated data with real event queries |
| `src/lib/analytics-utils.ts` | Add buildFastOrderFunnel function |
| `supabase/config.toml` | Add new edge function configuration |

### Implementation Details

**1. Analytics Tracking Hook (`src/hooks/use-analytics-tracking.tsx`):**

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate or retrieve session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
};

export function useAnalyticsTracking(panelId: string | undefined) {
  const trackedEvents = useRef(new Set<string>());
  
  const trackEvent = useCallback(async (
    eventType: string, 
    metadata: Record<string, any> = {}
  ) => {
    if (!panelId) return;
    
    // Deduplicate same event within session
    const eventKey = `${eventType}-${JSON.stringify(metadata)}`;
    if (trackedEvents.current.has(eventKey)) return;
    trackedEvents.current.add(eventKey);
    
    try {
      await supabase.from('analytics_events').insert({
        panel_id: panelId,
        event_type: eventType,
        session_id: getSessionId(),
        metadata
      });
    } catch (err) {
      console.log('Analytics track error:', err);
    }
  }, [panelId]);
  
  return { trackEvent, sessionId: getSessionId() };
}
```

**2. Fast Order Page Tracking:**

```typescript
// In FastOrder.tsx - track page visit on mount
useEffect(() => {
  if (panel?.id) {
    trackEvent('fast_order_visit', { step: 1 });
  }
}, [panel?.id]);

// Track step changes
useEffect(() => {
  if (panel?.id && currentStep > 1) {
    const stepNames = ['network', 'category', 'service', 'order', 'payment', 'complete'];
    trackEvent(`fast_order_step`, { step: currentStep, stepName: stepNames[currentStep - 1] });
  }
}, [currentStep, panel?.id]);
```

**3. Updated Analytics Query (`src/pages/panel/Analytics.tsx`):**

```typescript
// Fetch fast order funnel data from real events
const { data: funnelEvents } = await supabase
  .from('analytics_events')
  .select('event_type, session_id')
  .eq('panel_id', panel.id)
  .in('event_type', ['fast_order_visit', 'fast_order_step', 'checkout_complete'])
  .gte('created_at', startDate.toISOString())
  .lte('created_at', endDate.toISOString());

// Build funnel from real data
const fastOrderFunnel = buildFastOrderFunnel(funnelEvents || [], orders || []);
```

**4. Funnel Builder Function (`src/lib/analytics-utils.ts`):**

```typescript
export function buildFastOrderFunnel(
  events: { event_type: string; session_id: string }[],
  orders: { id: string }[]
): FunnelStage[] {
  // Count unique sessions at each stage
  const visitors = new Set(
    events.filter(e => e.event_type === 'fast_order_visit').map(e => e.session_id)
  ).size;
  
  const selections = new Set(
    events.filter(e => e.event_type === 'fast_order_step' && e.metadata?.step >= 3)
      .map(e => e.session_id)
  ).size;
  
  const checkouts = new Set(
    events.filter(e => e.event_type === 'fast_order_step' && e.metadata?.step >= 5)
      .map(e => e.session_id)
  ).size;
  
  const completed = orders.length; // Actual orders placed
  
  return [
    { name: 'Visitors', count: visitors, percentage: 100, dropOff: 0 },
    { 
      name: 'Selections', 
      count: selections, 
      percentage: visitors > 0 ? (selections / visitors) * 100 : 0,
      dropOff: calculateDropOffRate(visitors, selections)
    },
    { 
      name: 'Checkout', 
      count: checkouts, 
      percentage: visitors > 0 ? (checkouts / visitors) * 100 : 0,
      dropOff: calculateDropOffRate(selections, checkouts)
    },
    { 
      name: 'Completed', 
      count: completed, 
      percentage: visitors > 0 ? (completed / visitors) * 100 : 0,
      dropOff: calculateDropOffRate(checkouts, completed)
    },
  ];
}
```

---

## Part 2: Security Enforcement Middleware

### Current State
- SecuritySettings.tsx saves configurations to `panels.settings.security`
- No actual enforcement of rate limiting, IP blocking, or CAPTCHA in auth flows

### Solution Architecture

**Add enforcement to the `buyer-auth` edge function:**

```text
┌─────────────────────────────────────────────────────────────────┐
│  LOGIN REQUEST                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Check IP Allowlist/Blocklist                                │
│     ↓                                                           │
│  2. Check Country Blocklist                                     │
│     ↓                                                           │
│  3. Check Rate Limit (requests/minute)                          │
│     ↓                                                           │
│  4. Check Failed Attempts (CAPTCHA required?)                   │
│     ↓                                                           │
│  5. Proceed with Authentication                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/buyer-auth/index.ts` | Add security enforcement middleware |
| `src/pages/panel/SecuritySettings.tsx` | Add status indicators showing enforcement is active |

### Implementation Details

**1. Enhanced Buyer Auth with Security Enforcement:**

```typescript
// In buyer-auth/index.ts - Add after line 15

// Load panel security settings for enforcement
async function loadSecuritySettings(supabase: any, panelId: string) {
  const { data: panel } = await supabase
    .from('panels')
    .select('settings')
    .eq('id', panelId)
    .single();
    
  return panel?.settings?.security || {};
}

// IP blocking check
function isIpBlocked(clientIp: string, settings: any): boolean {
  const blockedIps = (settings.ipBlocklist || '').split(',').map((ip: string) => ip.trim()).filter(Boolean);
  const allowedIps = (settings.ipAllowlist || '').split(',').map((ip: string) => ip.trim()).filter(Boolean);
  
  // If allowlist exists and IP not in it, block
  if (allowedIps.length > 0 && !allowedIps.includes(clientIp)) {
    return true;
  }
  
  // If IP in blocklist, block
  if (blockedIps.includes(clientIp)) {
    return true;
  }
  
  return false;
}

// Rate limit check with panel-specific limits
function checkPanelRateLimit(
  identifier: string, 
  settings: any
): { allowed: boolean; remainingTime?: number } {
  const maxRequests = settings.rateLimit || 60;
  const lockoutMinutes = parseInt(settings.lockoutDuration || '15');
  const lockoutMs = lockoutMinutes * 60 * 1000;
  
  // ... rate limiting logic using panel-specific settings ...
}

// Add to login handler:
// 1. Load security settings: const security = await loadSecuritySettings(supabase, panelId);
// 2. Check IP: if (isIpBlocked(clientIp, security)) return error
// 3. Check rate limit: if (!checkPanelRateLimit(email, security).allowed) return error
// 4. If captchaEnabled && failedAttempts > captchaThreshold: require CAPTCHA
```

**2. CAPTCHA Verification (Optional - for panels that enable it):**

```typescript
async function verifyCaptcha(token: string, provider: string): Promise<boolean> {
  if (provider === 'hcaptcha') {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${Deno.env.get('HCAPTCHA_SECRET')}&response=${token}`
    });
    const result = await response.json();
    return result.success;
  }
  // Add reCAPTCHA support similarly
  return false;
}
```

**3. Logging Security Events:**

```typescript
// Log blocked attempts for audit
async function logSecurityEvent(supabase: any, panelId: string, event: string, details: any) {
  await supabase.from('audit_logs').insert({
    panel_id: panelId,
    action: event,
    resource_type: 'security',
    details
  });
}
```

---

## Part 3: Automatic Notifications for Pending Manual Deposits

### Current State
- Manual deposits create `pending_verification` transactions
- Panel owners must manually check the Transactions & History tab
- No automatic notification when new manual deposits arrive

### Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│  BUYER CREATES MANUAL DEPOSIT                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  process-payment edge function                                  │
│     ↓                                                           │
│  Creates transaction (status: pending_verification)            │
│     ↓                                                           │
│  Calls send-notification edge function                          │
│     ↓                                                           │
│  Panel owner receives:                                          │
│    • In-app notification (panel_notifications table)            │
│    • Email notification (if configured)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/process-payment/index.ts` | Add notification call for manual deposits |
| `supabase/functions/send-notification/index.ts` | Add `pending_deposit` notification type |

### Implementation Details

**1. Update process-payment for manual deposits (lines 1069-1094):**

```typescript
case 'manual_transfer':
default: {
  if (gateway.startsWith('manual_') || gateway === 'manual_transfer') {
    // Update status to pending_verification
    await supabase
      .from('transactions')
      .update({ status: 'pending_verification' })
      .eq('id', transactionIdToUse);
    
    console.log(`[process-payment] Manual transfer ${transactionIdToUse} status set to pending_verification`);
    
    // === NEW: Notify panel owner about pending deposit ===
    // Get panel owner
    const { data: panelOwner } = await supabase
      .from('panels')
      .select('owner_id, name')
      .eq('id', panelId)
      .single();
    
    if (panelOwner?.owner_id) {
      // Get buyer info for notification
      const { data: buyer } = await supabase
        .from('client_users')
        .select('email, full_name')
        .eq('id', buyerId)
        .single();
      
      const buyerName = buyer?.full_name || buyer?.email || 'A customer';
      
      // Create notification
      await supabase.from('panel_notifications').insert({
        panel_id: panelId,
        user_id: panelOwner.owner_id,
        type: 'warning',
        title: 'New Deposit Pending Verification',
        message: `${buyerName} submitted a manual deposit of $${amount.toFixed(2)} via ${gateway}. Please verify and approve.`,
        is_read: false
      });
      
      console.log(`[process-payment] Notification sent to panel owner for pending deposit`);
      
      // Optional: Get owner email for email notification
      const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', panelOwner.owner_id)
        .single();
      
      if (ownerProfile?.email) {
        // Call send-notification for email
        await supabase.functions.invoke('send-notification', {
          body: {
            panelId,
            userId: panelOwner.owner_id,
            type: 'pending_deposit',
            title: 'New Deposit Pending Verification',
            message: `${buyerName} submitted a manual deposit of $${amount.toFixed(2)}. Log in to approve.`,
            sendEmail: true,
            emailTo: ownerProfile.email,
            metadata: {
              transactionId: transactionIdToUse,
              amount,
              buyerEmail: buyer?.email
            }
          }
        });
      }
    }
    // === END NEW ===
    
    return new Response(
      JSON.stringify({ 
        success: true,
        gateway: gateway,
        requiresManualTransfer: true,
        transactionId: transactionIdToUse,
        amount,
        currency: currency.toUpperCase(),
        config: gatewayConfig,
        message: 'Please complete the transfer manually. Your balance will be credited once payment is confirmed.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  // ...
}
```

**2. Update send-notification to handle pending_deposit type:**

```typescript
// In send-notification/index.ts - update NotificationType
type NotificationType = 'low_balance' | 'failed_transaction' | 'sync_error' | 
  'service_update' | 'info' | 'warning' | 'error' | 'pending_deposit';

function mapNotificationType(type: NotificationType): string {
  switch (type) {
    case 'pending_deposit':
      return 'warning'; // Show as warning to get attention
    // ... existing cases
  }
}
```

---

## Database Migration Required

**Create migration file: `supabase/migrations/add_analytics_events.sql`**

```sql
-- Create analytics events table for funnel tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES panels(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  session_id TEXT,
  buyer_id UUID REFERENCES client_users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_panel_type 
  ON analytics_events(panel_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created 
  ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session 
  ON analytics_events(session_id);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Panel owners can read their own events
CREATE POLICY "Panel owners can read analytics events"
  ON analytics_events FOR SELECT
  USING (
    panel_id IN (
      SELECT id FROM panels 
      WHERE owner_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Policy: Allow anonymous inserts for tracking (public storefront)
CREATE POLICY "Allow analytics event inserts"
  ON analytics_events FOR INSERT
  WITH CHECK (true);
```

---

## Summary of All Files

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/use-analytics-tracking.tsx` | Analytics event tracking hook |
| `supabase/migrations/[timestamp]_add_analytics_events.sql` | Database migration |

### Files to Modify
| File | Changes |
|------|---------|
| `src/pages/FastOrder.tsx` | Add event tracking for visits and step changes |
| `src/components/storefront/FastOrderSection.tsx` | Track service selection events |
| `src/pages/panel/Analytics.tsx` | Query real events instead of simulated data |
| `src/lib/analytics-utils.ts` | Add `buildFastOrderFunnel` function |
| `supabase/functions/buyer-auth/index.ts` | Add security enforcement (IP, rate limiting, CAPTCHA) |
| `supabase/functions/process-payment/index.ts` | Add panel owner notification for manual deposits |
| `supabase/functions/send-notification/index.ts` | Add `pending_deposit` notification type |
| `src/pages/panel/SecuritySettings.tsx` | Add "Enforcement Active" status indicator |

---

## Implementation Order

1. **Database First**: Create analytics_events table migration
2. **Analytics Tracking Hook**: Create the reusable hook
3. **Fast Order Tracking**: Add tracking to FastOrder.tsx and FastOrderSection.tsx
4. **Analytics Dashboard**: Update to use real event data
5. **Security Enforcement**: Update buyer-auth with IP/rate limiting
6. **Manual Deposit Notifications**: Update process-payment

---

## Technical Notes

### Session ID Tracking
- Uses `sessionStorage` for unique visitor identification
- Persists across page refreshes within same browser session
- New session ID generated per browser tab/session

### Rate Limiting Persistence
- Current edge function uses in-memory Map (resets on cold start)
- For production, consider Redis/KV store for distributed rate limiting
- Current implementation still effective for basic protection

### CAPTCHA Integration
- Requires HCAPTCHA_SECRET or RECAPTCHA_SECRET in Supabase secrets
- Frontend integration needed for CAPTCHA display (future enhancement)
- Can be phased: config storage now, full integration later

### Notification Delivery
- In-app notifications: Immediate via panel_notifications table
- Email notifications: Logged to email_send_logs (requires email provider integration)
- Webhook notifications: Can be added for third-party integrations
