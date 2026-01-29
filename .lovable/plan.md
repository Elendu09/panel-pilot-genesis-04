
# Comprehensive Enhancement Plan: Customer Management, Provider API, Payment Separation & More

---

## Overview

This plan addresses the following improvements:

1. **Customer Overview Toggle - Persist in Supabase** - Store preference in panel settings instead of localStorage
2. **Provider API Errors - Enhanced Debugging & Fix** - Improve error handling and ensure all services are returned
3. **Payment Management Page Enhancement** - Separate payment methods view, add analytics, and improve approve/reject flow
4. **Customer Balance Updates** - Verify and fix balance update functionality
5. **Separate Payment Systems** - Panel Owner Billing vs Tenant Payment Methods (critical fix)

---

## Issue 1: Customer Overview Toggle - Supabase Persistence

**Current State:**
The toggle saves to `localStorage` (line 142-148 in `CustomerManagement.tsx`). This doesn't sync across devices or sessions.

**Solution:**
Store the preference in `panels.settings.ui.customerOverviewVisible` JSONB field.

**Files to Modify:**
| File | Change |
|------|--------|
| `src/pages/panel/CustomerManagement.tsx` | Replace localStorage with Supabase panel settings persistence |

**Implementation:**
```tsx
// Remove localStorage approach
// Add state that reads from panel.settings.ui.customerOverviewVisible
const [showOverview, setShowOverview] = useState(() => {
  const settings = panel?.settings as any;
  return settings?.ui?.customerOverviewVisible === true;
});

// Update Supabase on toggle change
const handleToggleOverview = async (value: boolean) => {
  setShowOverview(value);
  
  if (!panel?.id) return;
  
  try {
    const currentSettings = (panel.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      ui: {
        ...(currentSettings.ui || {}),
        customerOverviewVisible: value
      }
    };
    
    await supabase
      .from('panels')
      .update({ settings: updatedSettings })
      .eq('id', panel.id);
      
    refreshPanel();
  } catch (error) {
    console.error('Error saving overview preference:', error);
  }
};

// Sync state when panel loads
useEffect(() => {
  const settings = panel?.settings as any;
  setShowOverview(settings?.ui?.customerOverviewVisible === true);
}, [panel?.settings]);
```

---

## Issue 2: Provider API Errors - Enhanced Debugging & Fix

**Current State:**
Edge functions `provider-services` and `sync-provider-services` have 30-second timeout implemented, but users report errors when testing provider connections.

**Analysis:**
Looking at the `provider-services/index.ts` code (lines 327-362), the timeout and error handling is already in place. The issue may be:
1. Invalid URL formats from users
2. Providers requiring POST instead of GET
3. Response parsing issues for non-standard API responses

**Solution:**
Enhance error handling with more detailed logging and support both GET/POST methods. Also add better JSON parsing with fallback.

**Files to Modify:**
| File | Change |
|------|--------|
| `supabase/functions/provider-services/index.ts` | Add POST method fallback, better JSON parsing, detailed error messages |
| `supabase/functions/sync-provider-services/index.ts` | Same enhancements |

**Implementation:**
```typescript
// Enhanced fetch with GET/POST fallback
let response: Response;
let lastError: any = null;

// Try GET first
try {
  const getUrl = new URL(apiEndpoint);
  getUrl.searchParams.set('key', apiKey);
  getUrl.searchParams.set('action', action);
  
  response = await fetch(getUrl.toString(), {
    method: 'GET',
    headers: { 'User-Agent': 'SMM-Panel/2.0', 'Accept': 'application/json' },
    signal: controller.signal
  });
} catch (getError: any) {
  lastError = getError;
  
  // Try POST as fallback (some providers require POST)
  try {
    const postBody = new URLSearchParams();
    postBody.set('key', apiKey);
    postBody.set('action', action);
    
    response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'SMM-Panel/2.0'
      },
      body: postBody,
      signal: controller.signal
    });
  } catch (postError) {
    throw lastError; // Throw original GET error
  }
}

// Enhanced JSON parsing with fallback
let data;
const responseText = await response.text();
try {
  data = JSON.parse(responseText);
} catch {
  // Some providers return array wrapped in extra characters
  const cleaned = responseText.trim().replace(/^\[|\]$/g, '');
  try {
    data = JSON.parse(`[${cleaned}]`);
  } catch {
    throw new Error(`Invalid JSON response from provider: ${responseText.slice(0, 200)}`);
  }
}

// Handle error responses from provider
if (data?.error) {
  throw new Error(`Provider error: ${data.error}`);
}
```

---

## Issue 3: Customer Balance Updates - Verification

**Current State:**
Looking at `CustomerManagement.tsx` lines 505-542, the `handleBalanceAdjust` function:
1. Updates `client_users.balance` in Supabase ✓
2. Creates a transaction record ✓
3. Updates local state ✓

**Analysis:**
The code is correct. The issue may be that the real-time subscription at lines 169-228 listens for changes but may not trigger an immediate refresh.

**Verification:**
The real-time subscription (line 202-217) handles `UPDATE` events and properly updates the balance from the new payload. This should work correctly.

**Potential Issue:**
The transaction insert at line 522-528 may fail due to RLS if the user_id doesn't match properly. The transaction is logged with the customer's ID but may need panel_id for proper RLS.

**Solution:**
Add `panel_id` to the transaction insert for proper RLS handling.

**Files to Modify:**
| File | Change |
|------|--------|
| `src/pages/panel/CustomerManagement.tsx` | Add panel_id to transaction insert |

**Implementation:**
```typescript
// Line 522-528 - Add panel_id
await supabase.from('transactions').insert({
  panel_id: panel.id, // Add this
  user_id: selectedCustomer.id,
  buyer_id: selectedCustomer.id, // Also add buyer_id for proper association
  amount: balanceAction === 'add' ? amount : -amount,
  type: balanceAction === 'add' ? 'deposit' : 'withdrawal',
  description: balanceReason || `Balance ${balanceAction} by panel owner`,
  status: 'completed'
});
```

---

## Issue 4: Separate Payment Systems - CRITICAL FIX

**Root Cause Analysis:**
The user reports that their panel owner billing page shows the SAME payment methods as their tenant/buyer deposit page. This is incorrect because:

1. **Admin Payment Providers (`platform_payment_providers`)** - Used for platform-level billing (panel owner subscriptions, panel owner deposits)
2. **Panel Payment Settings (`panels.settings.payments`)** - Used for buyer/tenant deposits

**The Problem:**
Looking at `Billing.tsx` (lines 117-122) and `QuickDeposit.tsx` (lines 25-28), both use `useAvailablePaymentGateways` which:
1. Fetches from `platform_payment_providers` (admin-controlled)
2. Fetches from `panels.settings.payments` (panel owner configured)
3. Returns the **intersection** of both

This is WRONG for panel owner billing. Panel owners should see admin-configured payment providers for their own subscription/billing payments - NOT their panel's configured buyer payment methods.

**Solution:**
Create separate hooks:
1. `useAdminPaymentGateways` - For panel owner billing (fetches only from `platform_payment_providers`)
2. Keep `useAvailablePaymentGateways` - For buyer/tenant deposits (current logic is correct for buyers)

**Files to Modify:**
| File | Change |
|------|--------|
| `src/hooks/useAdminPaymentGateways.tsx` | NEW - Hook for admin-controlled gateways only |
| `src/pages/panel/Billing.tsx` | Use `useAdminPaymentGateways` instead of `useAvailablePaymentGateways` |
| `src/components/billing/QuickDeposit.tsx` | Use `useAdminPaymentGateways` |

**New Hook Implementation:**
```typescript
// src/hooks/useAdminPaymentGateways.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminGateway = {
  id: string;
  displayName: string;
  category?: string | null;
  feePercentage?: number | null;
  fixedFee?: number | null;
  config?: Record<string, any>;
};

export const useAdminPaymentGateways = () => {
  const [loading, setLoading] = useState(true);
  const [gateways, setGateways] = useState<AdminGateway[]>([]);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_payment_providers")
        .select("*")
        .eq("is_enabled", true);

      if (error) throw error;

      const mapped: AdminGateway[] = (data || []).map((p) => ({
        id: p.provider_name,
        displayName: p.display_name,
        category: p.category,
        feePercentage: p.fee_percentage,
        fixedFee: p.fixed_fee,
        config: p.config || {}
      }));

      // Sort alphabetically
      mapped.sort((a, b) => a.displayName.localeCompare(b.displayName));
      setGateways(mapped);
    } catch (error) {
      console.error("Error fetching admin payment gateways:", error);
      setGateways([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { gateways, loading, refresh };
};
```

**Update Billing.tsx:**
```typescript
// Replace this:
import { useAvailablePaymentGateways } from '@/hooks/useAvailablePaymentGateways';

// With:
import { useAdminPaymentGateways } from '@/hooks/useAdminPaymentGateways';

// And update usage:
const { gateways: availableGateways, loading: gatewaysLoading } = useAdminPaymentGateways();
```

**Update QuickDeposit.tsx:**
```typescript
// Same replacement - use admin gateways for panel owner deposits
import { useAdminPaymentGateways } from '@/hooks/useAdminPaymentGateways';

export const QuickDeposit = ({ onDeposit, loading }: QuickDepositProps) => {
  const { gateways, loading: gatewaysLoading } = useAdminPaymentGateways();
  // ... rest of component
};
```

---

## Issue 5: Payment Management Page Enhancement

**Current State:**
The `PaymentMethods.tsx` page has:
- Categories: all, cards, regional, ewallets, bank, crypto (added "all" in previous update)
- `UnifiedTransactionManager` component with search bar

**Enhancements Needed:**
1. Differentiate payment method configuration from transaction analytics
2. Add dedicated analytics section with charts
3. Improve approve/reject flow with better UI

**Solution:**
Restructure the page with clearer sections and add payment analytics chart.

**Files to Modify:**
| File | Change |
|------|--------|
| `src/pages/panel/PaymentMethods.tsx` | Add analytics section, improve layout |
| `src/components/billing/UnifiedTransactionManager.tsx` | Add analytics cards at top |

**Implementation for UnifiedTransactionManager:**
```tsx
// Add analytics summary at top
const totalDeposits = transactions
  .filter(t => t.status === 'completed')
  .reduce((sum, t) => sum + t.amount, 0);

const pendingCount = transactions.filter(t => 
  t.status === 'pending' || t.status === 'pending_verification'
).length;

const manualPending = transactions.filter(t => 
  (t.status === 'pending' || t.status === 'pending_verification') && 
  t.payment_method?.includes('manual')
).length;

// Render analytics cards
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <Card className="bg-card/60">
    <CardContent className="p-4">
      <p className="text-sm text-muted-foreground">Total Deposits</p>
      <p className="text-2xl font-bold text-emerald-500">${totalDeposits.toFixed(2)}</p>
    </CardContent>
  </Card>
  <Card className="bg-card/60">
    <CardContent className="p-4">
      <p className="text-sm text-muted-foreground">Pending</p>
      <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
    </CardContent>
  </Card>
  <Card className="bg-card/60">
    <CardContent className="p-4">
      <p className="text-sm text-muted-foreground">Manual Awaiting</p>
      <p className="text-2xl font-bold text-orange-500">{manualPending}</p>
    </CardContent>
  </Card>
  <Card className="bg-card/60">
    <CardContent className="p-4">
      <p className="text-sm text-muted-foreground">Total Transactions</p>
      <p className="text-2xl font-bold">{transactions.length}</p>
    </CardContent>
  </Card>
</div>
```

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/pages/panel/CustomerManagement.tsx` | Supabase persistence for overview toggle, add panel_id to transaction |
| `src/hooks/useAdminPaymentGateways.tsx` | **NEW** - Hook for admin-controlled payment gateways |
| `src/pages/panel/Billing.tsx` | Use `useAdminPaymentGateways` instead of `useAvailablePaymentGateways` |
| `src/components/billing/QuickDeposit.tsx` | Use `useAdminPaymentGateways` |
| `supabase/functions/provider-services/index.ts` | Add POST fallback, better JSON parsing |
| `supabase/functions/sync-provider-services/index.ts` | Same enhancements |
| `src/components/billing/UnifiedTransactionManager.tsx` | Add analytics cards at top |

---

## Technical Architecture Clarification

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN (Platform Owner)                       │
│  platform_payment_providers table                                │
│  - Manages which gateways are available platform-wide            │
│  - Configures Stripe/PayPal/etc with ADMIN credentials           │
│  - Used for: Panel owner subscriptions & panel owner deposits    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PANEL OWNER                                  │
│  panels.settings.payments                                        │
│  - Configures THEIR OWN Stripe/PayPal/etc credentials            │
│  - Controls which gateways THEIR BUYERS can use                  │
│  - Used for: Buyer/tenant deposits on their storefront           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BUYER (Tenant Customer)                      │
│  Sees only panel-configured gateways (from panel.settings)       │
│  Intersection with platform-enabled providers for validation     │
│  - Deposits go to panel owner's gateway credentials              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Testing Checklist

After implementation:
- [ ] Customer Overview toggle persists across page refreshes (saved to Supabase)
- [ ] Customer Overview toggle syncs across different browser sessions
- [ ] Provider API test shows all services from valid providers
- [ ] Provider API shows clear error messages for invalid URLs/credentials
- [ ] Adding balance to customer in Customer Management updates their balance in real-time
- [ ] Panel Owner Billing page shows admin-configured payment gateways (platform_payment_providers)
- [ ] Panel Owner Payment Methods page shows panel's configured gateways for buyers
- [ ] Buyer/Tenant Deposit page shows panel-configured payment gateways
- [ ] Payment analytics show correct totals and pending counts
- [ ] Manual transactions are prioritized at top of approval queue
