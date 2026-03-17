

# Plan: Fix Order Visibility, Service ID Mapping, Subscription Detection, and Plan Locking

## Issues Found

### 1. Orders missing from "My Orders" after Fast Order payment
- Orders created with `paymentType === 'direct'` get status `awaiting_payment`
- When the payment completes (via manual payment flow), nothing transitions the order from `awaiting_payment` to `pending`/`processing`
- The `BuyerOrders` kanban only shows `pending`, `in_progress`, `completed` columns — `awaiting_payment` orders are in "other" but may be overlooked
- **Root fix**: After direct payment completes, transition order status to `pending` and trigger provider forwarding. Also add `awaiting_payment` as a visible kanban column.

### 2. Provider Service ID mismatch in Services Management
- During import, `display_order` is set to `originalIndex` (0-indexed position in the provider's response array), NOT the provider's actual service ID
- The provider returns `service: 12`, but if it's the 3rd item in the array, `display_order` = 2
- The UI shows `display_order` as "Panel ID" which confuses panel owners
- **Root fix**: Set `display_order` to the provider's actual service ID number during import. Show `provider_service_id` prominently in the services table as the provider-side identifier.

### 3. Subscription transactions stored as `type: 'deposit'`
- `process-payment` line 391: `const txType = orderId ? 'order_payment' : 'deposit'` — ignores metadata.type
- All subscription payments get `type: 'deposit'` in the database
- Transaction history shows subscriptions as "deposit"
- Onboarding verification fallback queries `type = 'subscription'` which never matches
- **Root fix**: Set `txType = metadata?.type === 'subscription' ? 'subscription' : (orderId ? 'order_payment' : 'deposit')`

### 4. Onboarding payment verification fails
- The polling fallback at line 291 searches for `type = 'subscription'` but transactions are stored as `type = 'deposit'`
- Even with localStorage txId, the `process-payment` verify-payment action should work — but the gateway may not be verifying correctly if the return URL doesn't include the transaction_id
- **Root fix**: Fix the transaction type (issue 3) AND also add the verify-payment call to the polling loop (currently it only queries the DB directly, doesn't call the edge function to trigger gateway verification)

### 5. Billing page doesn't lock plans after upgrade
- All plans remain clickable after a paid upgrade
- Users can accidentally initiate another upgrade, leaving the previous subscription as pending
- **Root fix**: Disable plans that are lower than or equal to the current plan. Show "Current Plan" for the active tier. Show expiry date and disable downgrades during active billing period.

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/process-payment/index.ts` | Fix transaction type: use `metadata.type` for subscription transactions |
| `supabase/functions/buyer-order/index.ts` | Add order status transition after direct payment completion |
| `supabase/functions/sync-provider-services/index.ts` | Set `display_order` to provider's service ID number, not array index |
| `src/pages/buyer/BuyerOrders.tsx` | Add `awaiting_payment` and `processing` to kanban columns |
| `src/pages/panel/PanelOnboardingV2.tsx` | Fix verification polling: call verify-payment edge function + search for `type = 'deposit'` as fallback |
| `src/pages/panel/Billing.tsx` | Lock plans: disable plans ≤ current tier during active subscription period |
| `src/components/services/DraggableServiceItem.tsx` | Show `provider_service_id` as primary ID badge for imported services |
| `src/components/storefront/FastOrderSection.tsx` | After direct payment completes, call an endpoint to transition order from `awaiting_payment` to `pending` |

## Implementation Details

**Transaction type fix** (process-payment):
```typescript
// Line 391: Replace
const txType = orderId ? 'order_payment' : 'deposit';
// With
const txType = metadata?.type === 'subscription' ? 'subscription' 
  : (orderId ? 'order_payment' : 'deposit');
```

**Onboarding verification fix** (PanelOnboardingV2):
- In polling loop, call `process-payment` verify-payment with txId (triggers gateway API check)
- Change fallback query from `.eq('type', 'subscription')` to `.in('type', ['subscription', 'deposit']).eq('metadata->>type', 'subscription')`

**Plan locking** (Billing.tsx):
- Compare plan tiers numerically: free=0, basic=1, pro=2
- Disable button for all plans ≤ current tier
- Show "Downgrade" label (disabled) for lower plans
- Show expiry countdown for active paid plans

**Service display_order fix** (sync-provider-services):
- Change `display_order: originalIndex` to `display_order: parseInt(serviceId) || originalIndex`
- This makes the panel ID match the provider's service number

**Order lifecycle for direct payments**:
- Add a `complete-order-payment` action to `buyer-order` or `buyer-api` that: transitions status from `awaiting_payment` to `pending`, deducts balance, and triggers provider forwarding
- FastOrderSection: after manual payment proof is submitted and approved, call this action

