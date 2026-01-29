
# Comprehensive Enhancement Plan: Customer Management, Analytics, API, Design & Payments

---

## Overview

This plan addresses the following improvements:

1. **Customer Overview show/hide toggle** - Default to hidden
2. **Remove Live Orders from Analytics** - Clean up the Analytics page
3. **Fix API base URL for tenant (subdomain/custom domain)** - Production fix for global SMM providers
4. **Visual effects for Customer Management table** - Enhance rows/columns styling
5. **Hide dark mode switch for SMMVisit theme** - Prevent dark mode in SMMVisit
6. **Recent deposits debugging** - Verify Supabase sync and reference generation
7. **Panel Payment Management enhancement** - Add "All" filter, search bar, combine analytics with approve/reject

---

## Issue 1: Customer Overview Show/Hide Toggle

**Current State:**
`CustomerOverview` component is always visible on the Customer Management page.

**Solution:**
Add a toggle switch in the header area that shows/hides the `CustomerOverview` component. Default state: **hidden**. Save preference to localStorage.

**Files to Modify:**
| File | Change |
|------|--------|
| `src/pages/panel/CustomerManagement.tsx` | Add state for `showOverview`, toggle switch, and conditional render |

**Implementation:**
```tsx
// Add state with localStorage persistence
const [showOverview, setShowOverview] = useState(() => {
  return localStorage.getItem('customer_overview_visible') === 'true';
});

// Toggle handler
const handleToggleOverview = (value: boolean) => {
  setShowOverview(value);
  localStorage.setItem('customer_overview_visible', String(value));
};

// In JSX header area - add switch
<div className="flex items-center gap-2">
  <Switch checked={showOverview} onCheckedChange={handleToggleOverview} />
  <Label>Show Overview</Label>
</div>

// Conditional render
{showOverview && <CustomerOverview customers={customers} onSelectCustomer={...} />}
```

---

## Issue 2: Remove Live Orders from Analytics

**Current State:**
Analytics page has a "Live Orders" tab (lines 1094-1160) that shows `liveOrdersWithService` data.

**Solution:**
Remove the "Live Orders" tab from the Analytics page. Orders are already managed in the Orders Management page.

**Files to Modify:**
| File | Change |
|------|--------|
| `src/pages/panel/Analytics.tsx` | Remove "orders" tab and related state/fetch logic |

**Changes:**
1. Remove `liveOrdersWithService` state
2. Remove the fetch logic for live orders (lines 204-215)
3. Remove the "Orders" tab trigger
4. Remove the "orders" TabsContent section (lines 1094-1160)

---

## Issue 3: Fix API Base URL for Tenant (Subdomain/Custom Domain)

**Root Cause Analysis:**
When a panel owner tries to test their provider using their tenant's API URL (e.g., `mypanel.smmpilot.online/api/v2`), it fails because:

1. The Vercel rewrite rule `{ "source": "/api/v2/:path*", "destination": "https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/:path*" }` is present
2. However, the edge functions `provider-services` and `sync-provider-services` call external provider APIs directly

**The Real Issue:**
Looking at `ProviderManagement.tsx`, the provider's `api_endpoint` is the EXTERNAL provider URL (e.g., `https://smmrush.com/api/v2`), not the tenant's own API.

The issue is likely that:
1. When fetching provider services, the edge function makes a request to the provider's API endpoint
2. If CORS or network issues occur, it fails

**Checking `sync-provider-services` (lines 340-356):**
```typescript
const url = new URL(provider.api_endpoint);
url.searchParams.set('key', provider.api_key);
url.searchParams.set('action', 'services');

const response = await fetch(url.toString(), {
  method: 'GET',
  headers: { 'User-Agent': 'SMM-Panel/2.0' },
});
```

This is correct - it fetches from the external provider. The issue might be:
1. Invalid provider URL format
2. Missing timeout handling
3. Error responses not properly caught

**Solution:**
Enhance error handling and add timeout to provider API calls. Also ensure the Vercel rewrite includes all necessary headers.

**Files to Modify:**
| File | Change |
|------|--------|
| `supabase/functions/sync-provider-services/index.ts` | Add timeout, better error handling, validate URL |
| `supabase/functions/provider-services/index.ts` | Add timeout, better error handling |

**Implementation:**
```typescript
// Add timeout and better error handling
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

try {
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 
      'User-Agent': 'SMM-Panel/2.0',
      'Accept': 'application/json'
    },
    signal: controller.signal
  });
  clearTimeout(timeout);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Provider returned ${response.status}: ${errorText.slice(0, 200)}`);
  }
  // ... rest of logic
} catch (error) {
  clearTimeout(timeout);
  if (error.name === 'AbortError') {
    throw new Error('Provider API timed out after 30 seconds');
  }
  throw error;
}
```

---

## Issue 4: Visual Effects for Customer Management Table

**Current State:**
The customer table uses basic styling without visual effects.

**Solution:**
Add hover effects, gradient backgrounds, subtle animations, and improved row styling.

**Files to Modify:**
| File | Change |
|------|--------|
| `src/pages/panel/CustomerManagement.tsx` | Enhanced table row styling with hover effects, gradients |

**Enhancements:**
1. Hover effect with scale and background gradient
2. Alternating row colors with subtle transparency
3. Status badge glow effects
4. Smooth transitions on all interactive elements

**Implementation:**
```tsx
// Enhanced TableRow styling
<TableRow 
  className={cn(
    "group transition-all duration-200 cursor-pointer",
    "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent",
    "hover:shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]",
    index % 2 === 0 ? "bg-muted/20" : "bg-transparent"
  )}
>
```

---

## Issue 5: Hide Dark Mode Switch for SMMVisit Theme

**Current State:**
Design Customization page shows the dark/light mode toggle for all themes, including SMMVisit which only supports light mode.

**Solution:**
When SMMVisit theme is selected, hide the theme mode switch and display a warning badge.

**Files to Modify:**
| File | Change |
|------|--------|
| `src/pages/panel/DesignCustomization.tsx` | Conditionally hide mode switch when SMMVisit is selected |

**Implementation:**
```tsx
// In the theme mode toggle section
{selectedThemeId !== 'smmvisit' && selectedThemeId !== 'BuyerThemeSMMVisit' ? (
  <div className="flex items-center gap-2">
    <Sun className="w-4 h-4" />
    <Switch 
      checked={customization.themeMode === 'dark'} 
      onCheckedChange={(checked) => handleChange('themeMode', checked ? 'dark' : 'light')}
    />
    <Moon className="w-4 h-4" />
  </div>
) : (
  <Badge variant="outline" className="text-amber-500 border-amber-500/50">
    <Sun className="w-3 h-3 mr-1" /> Light Mode Only
  </Badge>
)}
```

---

## Issue 6: Recent Deposits - Supabase Sync Verification

**Analysis:**
Looking at `BuyerDeposit.tsx`:

1. **Transaction Creation (lines 504-600):** When a user clicks deposit:
   - For automatic gateways: Calls `process-payment` edge function which creates a transaction with `pending` status server-side
   - For manual transfers: Creates a transaction client-side with `pending_verification` status

2. **Reference Generation:** The transaction ID serves as the reference - this is generated:
   - By the edge function for automatic payments (`transactionIdToUse` in `process-payment`)
   - By Supabase auto-generated UUID for manual transfers

3. **Real-time Updates (lines 296-364):** Already has subscription to `transactions` table

4. **Polling Fallback (lines 367-381):** Already polls every 10 seconds when pending transactions exist

**Current Issues Found:**
- Manual transfer creates transaction with `pending_verification` status (not `pending`)
- The polling checks for `status === 'pending'` but manual transfers use `pending_verification`

**Solution:**
Update the polling to also check for `pending_verification` status.

**Files to Modify:**
| File | Change |
|------|--------|
| `src/pages/buyer/BuyerDeposit.tsx` | Fix polling to include `pending_verification` status |

**Implementation:**
```tsx
// Update polling condition (line 373)
const hasPending = transactions.some(t => 
  t.status === 'pending' || t.status === 'pending_verification'
);
```

---

## Issue 7: Panel Payment Management Enhancement

**Current State:**
- Payment Methods page has separate sections for gateway configuration and transaction management
- No "All" filter for payment methods
- No search bar for transactions

**Solution:**
1. Add "All" tab to show all payment methods together
2. Add search bar in UnifiedTransactionManager
3. Combine analytics with approve/reject section for clearer payment overview

**Files to Modify:**
| File | Change |
|------|--------|
| `src/pages/panel/PaymentMethods.tsx` | Add "All" category tab |
| `src/components/billing/UnifiedTransactionManager.tsx` | Add search bar, combine analytics |

**Implementation for PaymentMethods.tsx:**
```tsx
// Add "all" to categories
const categories = ["all", "cards", "regional", "ewallets", "bank", "crypto"] as const;

// Filter logic
const filteredGateways = activeCategory === "all"
  ? Object.values(paymentGateways).flat().filter(g => ...)
  : paymentGateways[activeCategory].filter(g => ...);
```

**Implementation for UnifiedTransactionManager.tsx:**
```tsx
// Add search state
const [searchQuery, setSearchQuery] = useState("");

// Add search input
<Input 
  placeholder="Search by user, amount, or reference..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="max-w-sm"
/>

// Filter transactions
const filteredTransactions = transactions.filter(tx => {
  if (!searchQuery) return true;
  const query = searchQuery.toLowerCase();
  return (
    tx.user_id?.toLowerCase().includes(query) ||
    tx.id?.toLowerCase().includes(query) ||
    tx.amount?.toString().includes(query) ||
    tx.payment_method?.toLowerCase().includes(query)
  );
});

// Sort to show manual first
const sortedTransactions = filteredTransactions.sort((a, b) => {
  // Manual transactions first
  const aIsManual = a.payment_method?.includes('manual');
  const bIsManual = b.payment_method?.includes('manual');
  if (aIsManual && !bIsManual) return -1;
  if (!aIsManual && bIsManual) return 1;
  // Then by date
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
});
```

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/pages/panel/CustomerManagement.tsx` | Add show/hide toggle for overview, enhance table visual effects |
| `src/pages/panel/Analytics.tsx` | Remove Live Orders tab |
| `supabase/functions/sync-provider-services/index.ts` | Add timeout, improve error handling |
| `supabase/functions/provider-services/index.ts` | Add timeout, improve error handling |
| `src/pages/panel/DesignCustomization.tsx` | Hide dark mode switch when SMMVisit is selected |
| `src/pages/buyer/BuyerDeposit.tsx` | Fix polling to include `pending_verification` status |
| `src/pages/panel/PaymentMethods.tsx` | Add "All" category tab for payment methods |
| `src/components/billing/UnifiedTransactionManager.tsx` | Add search bar, sort manual first, combine with analytics |

---

## Implementation Order

1. **Customer Management Overview Toggle** - Quick UI change
2. **Remove Live Orders from Analytics** - Simple removal
3. **Hide Dark Mode for SMMVisit** - Conditional rendering
4. **Fix Deposit Polling** - One-line fix
5. **Payment Methods "All" Tab** - UI enhancement
6. **Transaction Manager Search** - Component enhancement
7. **Customer Table Visual Effects** - CSS/styling
8. **Provider API Error Handling** - Edge function improvements

---

## Testing Checklist

After implementation:
- [ ] Customer Overview is hidden by default, toggle shows/hides it
- [ ] Analytics page no longer has "Live Orders" tab
- [ ] Selecting SMMVisit theme hides the dark mode toggle
- [ ] Manual deposits show as "pending_verification" and poll correctly
- [ ] Payment Methods page has "All" tab showing all gateways
- [ ] Transaction Manager has working search bar
- [ ] Customer table has visual hover effects
- [ ] Provider import works without timeout errors
