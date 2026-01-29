
# Comprehensive Enhancement Plan: Supabase Persistence, Payment Separation, Provider API & More

---

## Overview

This plan addresses all requested improvements:

1. **Customer Overview Toggle - Supabase Persistence** (not localStorage)
2. **Provider API Errors - POST fallback & Better JSON parsing**
3. **Customer Balance Updates - Add panel_id & buyer_id for RLS**
4. **Payment System Separation** - Admin gateways for panel billing vs Panel-configured gateways for buyers
5. **Payment Management Enhancement** - Analytics summary cards
6. **Transaction Manager Analytics** - Add summary stats at top

---

## Issue 1: Customer Overview Toggle - Supabase Persistence

**Current Problem:**
Lines 142-148 in `CustomerManagement.tsx` store the toggle in `localStorage`, which doesn't sync across devices.

**Solution:**
Store in `panels.settings.ui.customerOverviewVisible` and read from panel settings.

**Implementation:**

```tsx
// Replace localStorage approach (lines 142-149)
const [showOverview, setShowOverview] = useState(false);

// Sync with panel settings when loaded
useEffect(() => {
  const settings = panel?.settings as any;
  setShowOverview(settings?.ui?.customerOverviewVisible === true);
}, [panel?.settings]);

// Update toggle handler to save to Supabase
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
  } catch (error) {
    console.error('Error saving overview preference:', error);
  }
};
```

**Files to Modify:**
- `src/pages/panel/CustomerManagement.tsx`

---

## Issue 2: Provider API Errors - Enhanced Handling

**Current Problem:**
Some external SMM providers reject GET requests or return non-standard JSON. The edge function only tries GET.

**Solution:**
Add POST method fallback and advanced JSON cleaning for non-standard responses.

**Implementation for provider-services/index.ts:**

```typescript
// After line 340, add POST fallback
let response: Response;
let lastError: any = null;

// Try GET first (lines 332-341)
try {
  response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SMM-Panel/2.0',
      'Accept': 'application/json',
    },
    signal: controller.signal
  });
} catch (getError: any) {
  lastError = getError;
  
  // Try POST as fallback - many providers require POST
  try {
    const postBody = new URLSearchParams();
    postBody.set('key', apiKey);
    postBody.set('action', action);
    
    response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'SMM-Panel/2.0',
        'Accept': 'application/json'
      },
      body: postBody,
      signal: controller.signal
    });
  } catch (postError) {
    clearTimeout(timeout);
    if (lastError.name === 'AbortError') {
      return new Response(
        JSON.stringify({ error: 'Provider API timed out after 30 seconds' }),
        { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Network error connecting to provider', details: lastError.message }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
clearTimeout(timeout);

// Enhanced JSON parsing (replace line 366)
let data;
const responseText = await response.text();
try {
  data = JSON.parse(responseText);
} catch {
  // Some providers return malformed JSON - try to clean it
  const cleaned = responseText
    .trim()
    .replace(/^\uFEFF/, '') // Remove BOM
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/,\s*}/g, '}') // Fix trailing commas
    .replace(/,\s*]/g, ']');
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error(`Invalid JSON response from provider: ${responseText.slice(0, 200)}`);
  }
}
```

**Files to Modify:**
- `supabase/functions/provider-services/index.ts`
- `supabase/functions/sync-provider-services/index.ts`

---

## Issue 3: Customer Balance Updates - Add panel_id & buyer_id

**Current Problem:**
Lines 522-528 in `CustomerManagement.tsx` insert a transaction without `panel_id` or `buyer_id`, which may fail RLS policies and not trigger proper real-time updates.

**Solution:**
Add `panel_id` and `buyer_id` to the transaction insert.

**Implementation:**

```typescript
// Update lines 522-528
await supabase.from('transactions').insert({
  panel_id: panel.id,           // ADD: Required for RLS
  buyer_id: selectedCustomer.id, // ADD: Required for buyer association
  user_id: selectedCustomer.id,
  amount: balanceAction === 'add' ? amount : -amount,
  type: balanceAction === 'add' ? 'deposit' : 'withdrawal',
  description: balanceReason || `Balance ${balanceAction} by panel owner`,
  status: 'completed'
});
```

**Files to Modify:**
- `src/pages/panel/CustomerManagement.tsx`

---

## Issue 4: Separate Payment Systems - CRITICAL FIX

**The Problem:**
The panel owner's Billing page (`Billing.tsx`) uses `useAvailablePaymentGateways` which fetches payment methods configured by the panel owner for their BUYERS. This is incorrect.

**Correct Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN (Platform Owner)                       │
│  platform_payment_providers table                                │
│  - Controls which gateways panel owners can use for BILLING      │
│  - Used for: Panel owner subscriptions & panel owner deposits    │
└───────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     PANEL OWNER                                  │
│  panels.settings.payments (configured by panel owner)           │
│  - Controls which gateways THEIR BUYERS can use                  │
│  - Used for: Buyer/tenant deposits on storefront                 │
└─────────────────────────────────────────────────────────────────┘
```

**Solution:**
Create a new hook `useAdminPaymentGateways` that ONLY fetches from `platform_payment_providers` table. Use this hook in `Billing.tsx` and `QuickDeposit.tsx` for panel owner billing.

**New Hook Implementation:**

```typescript
// src/hooks/useAdminPaymentGateways.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminGateway = {
  id: string;
  displayName: string;
  category?: string | null;
  feePercentage?: number | null;
  fixedFee?: number | null;
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
      }));

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
// Replace import (line 19)
// FROM: import { useAvailablePaymentGateways } from '@/hooks/useAvailablePaymentGateways';
// TO:
import { useAdminPaymentGateways } from '@/hooks/useAdminPaymentGateways';

// Replace usage (around line 80)
// FROM: const { gateways: availableGateways, loading: gatewaysLoading } = useAvailablePaymentGateways({...});
// TO:
const { gateways: availableGateways, loading: gatewaysLoading } = useAdminPaymentGateways();
```

**Update QuickDeposit.tsx:**

```typescript
// Replace import (line 14)
// FROM: import { useAvailablePaymentGateways } from '@/hooks/useAvailablePaymentGateways';
// TO:
import { useAdminPaymentGateways } from '@/hooks/useAdminPaymentGateways';

// Replace usage (lines 24-28)
// FROM: const { gateways, loading: gatewaysLoading } = useAvailablePaymentGateways({...});
// TO:
const { gateways, loading: gatewaysLoading } = useAdminPaymentGateways();
```

**Files to Create/Modify:**
- `src/hooks/useAdminPaymentGateways.tsx` (NEW)
- `src/pages/panel/Billing.tsx`
- `src/components/billing/QuickDeposit.tsx`

---

## Issue 5: Payment Management Enhancement - Analytics Summary

**Current State:**
`UnifiedTransactionManager.tsx` has search and tabs but no summary analytics.

**Solution:**
Add analytics cards at the top showing Total Deposits, Pending Count, Manual Awaiting, and Total Transactions.

**Implementation:**

```tsx
// Add after search bar (around line 318)
// Calculate analytics
const totalDeposits = transactions
  .filter(t => t.status === 'completed')
  .reduce((sum, t) => sum + t.amount, 0);

const pendingCount = transactions.filter(t => 
  t.status === 'pending' || t.status === 'pending_verification'
).length;

const manualPending = transactions.filter(t => 
  (t.status === 'pending' || t.status === 'pending_verification') && 
  t.is_manual
).length;

// Render analytics cards
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
  <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
    <p className="text-xs text-muted-foreground">Total Deposits</p>
    <p className="text-lg font-bold text-emerald-500">${totalDeposits.toFixed(2)}</p>
  </div>
  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
    <p className="text-xs text-muted-foreground">Pending</p>
    <p className="text-lg font-bold text-amber-500">{pendingCount}</p>
  </div>
  <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
    <p className="text-xs text-muted-foreground">Manual Awaiting</p>
    <p className="text-lg font-bold text-orange-500">{manualPending}</p>
  </div>
  <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
    <p className="text-xs text-muted-foreground">Total Transactions</p>
    <p className="text-lg font-bold">{transactions.length}</p>
  </div>
</div>
```

**Files to Modify:**
- `src/components/billing/UnifiedTransactionManager.tsx`

---

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `src/pages/panel/CustomerManagement.tsx` | Modify | Supabase persistence for overview toggle, add panel_id/buyer_id to balance transaction |
| `src/hooks/useAdminPaymentGateways.tsx` | **CREATE** | New hook for admin-controlled payment gateways |
| `src/pages/panel/Billing.tsx` | Modify | Use `useAdminPaymentGateways` instead of `useAvailablePaymentGateways` |
| `src/components/billing/QuickDeposit.tsx` | Modify | Use `useAdminPaymentGateways` |
| `src/components/billing/UnifiedTransactionManager.tsx` | Modify | Add analytics summary cards |
| `supabase/functions/provider-services/index.ts` | Modify | Add POST fallback, better JSON parsing |
| `supabase/functions/sync-provider-services/index.ts` | Modify | Add POST fallback, better JSON parsing |

---

## Technical Summary

1. **Customer Overview**: Persist to `panels.settings.ui.customerOverviewVisible` in Supabase
2. **Provider API**: Add POST method fallback + advanced JSON cleaning for non-standard responses
3. **Balance Updates**: Include `panel_id` and `buyer_id` in transaction inserts for RLS compliance
4. **Payment Separation**: New `useAdminPaymentGateways` hook fetches from `platform_payment_providers` for panel owner billing
5. **Analytics**: Add summary cards to `UnifiedTransactionManager` showing deposit stats

---

## Testing Checklist

After implementation:
- [ ] Customer Overview toggle persists after page refresh (saved to Supabase)
- [ ] Toggle syncs across different browser sessions/devices
- [ ] Provider import works with providers requiring POST method
- [ ] Provider import handles non-standard JSON responses
- [ ] Adding balance to customer creates proper transaction with panel_id
- [ ] Panel Owner Billing page shows admin-configured gateways (from platform_payment_providers)
- [ ] Panel Owner Payment Methods page shows panel's own configured gateways
- [ ] Buyer Deposit page shows panel-configured gateways (unchanged)
- [ ] Payment analytics show correct totals in UnifiedTransactionManager
