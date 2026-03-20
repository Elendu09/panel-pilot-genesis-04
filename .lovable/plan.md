

# Plan: Fix Missing Order History, Deposit History, Coinbase Deprecation, and Payment Config

## Issue 1: Orders from Fast Order not showing in "My Orders"

**Root cause**: `BuyerOrders.tsx` fetches via `buyer-api` with `buyer.api_key`. Many buyers (especially guest-created) have no `api_key`. The fallback direct query hits RLS and returns nothing.

The `handleGetOrders` function in `buyer-api` works correctly — the problem is authentication. When `api_key` is null, the code falls through to a direct Supabase query which fails due to RLS.

**Fix**: In `BuyerOrders.tsx`, use the `__buyer_id_auth__` path (already supported by buyer-api) as fallback when `api_key` is missing. This mirrors what `LiveOrderTracker` does.

## Issue 2: Deposit history empty in tenant "Add Funds" page

**Root cause**: `BuyerDeposit.tsx` calls `buyer-auth` with `action: 'transactions'`, but `buyer-auth` has NO `transactions` case — it falls to `default: return { error: 'Invalid action' }`. The function silently returns an error which is caught but not shown.

**Fix**: Add a `transactions` case to `buyer-auth/index.ts` that queries the `transactions` table for the buyer's records (all types: deposits, order payments, etc., as user selected "All payments").

## Issue 3: Coinbase Commerce "charge creation has been deprecated"

**Root cause**: The `process-payment` edge function uses `POST https://api.commerce.coinbase.com/charges` which Coinbase has deprecated. The replacement is `POST https://api.commerce.coinbase.com/checkouts`.

**Fix**: Replace the `/charges` endpoint with `/checkouts` in `process-payment/index.ts`. The checkout API uses the same `X-CC-Api-Key` header but has slightly different request/response structure:
- Request: same fields but uses `requested_info` instead of some charge-specific fields
- Response: checkout URL is at `data.hosted_url` (same as charges)

## Issue 4: Payment method config flexibility

Already addressed in previous iterations — multiple field name fallbacks exist. No additional changes needed.

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/buyer-auth/index.ts` | Add `transactions` case to fetch all buyer transactions |
| `supabase/functions/process-payment/index.ts` | Replace deprecated Coinbase `/charges` with `/checkouts` |
| `src/pages/buyer/BuyerOrders.tsx` | Use `__buyer_id_auth__` fallback when no API key |

## Implementation Details

### buyer-auth: Add transactions handler

```typescript
case 'transactions':
  return await handleTransactions(supabaseAdmin, body);

async function handleTransactions(supabase, body) {
  const { buyerId, panelId } = body;
  if (!buyerId || !panelId) return jsonResponse({ error: 'Missing buyerId or panelId' });
  
  // Verify buyer belongs to panel
  const { data: buyer } = await supabase.from('client_users')
    .select('id').eq('id', buyerId).eq('panel_id', panelId).single();
  if (!buyer) return jsonResponse({ error: 'Invalid buyer' });
  
  // Fetch ALL transaction types for this buyer
  const { data: transactions } = await supabase.from('transactions')
    .select('*')
    .or(`buyer_id.eq.${buyerId},user_id.eq.${buyerId}`)
    .eq('panel_id', panelId)
    .order('created_at', { ascending: false })
    .limit(100);
  
  return jsonResponse({ transactions: transactions || [] });
}
```

### Coinbase: Switch to Checkouts API

```typescript
// Replace /charges with /checkouts
const checkoutResponse = await fetch('https://api.commerce.coinbase.com/checkouts', {
  method: 'POST',
  headers: {
    'X-CC-Api-Key': coinbaseApiKey,
    'X-CC-Version': '2018-03-22',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: `Deposit - ${panelName}`,
    description: `Account deposit of $${amount}`,
    pricing_type: 'fixed_price',
    local_price: { amount: amount.toString(), currency: currency.toUpperCase() },
    requested_info: [],
    metadata: { panelId, buyerId, transactionId },
  }),
});
// Response structure same: data.hosted_url for redirect
```

### BuyerOrders: Fallback auth

```typescript
// If no API key, use buyerId+panelId direct auth
const buyerApiKey = buyer.api_key || localStorage.getItem('buyer_api_key');
const authBody = buyerApiKey 
  ? { key: buyerApiKey, action: 'get-orders' }
  : { key: '__buyer_id_auth__', action: 'get-orders', buyerId: buyer.id, panelId: panel?.id };
```

