# Plan: Fix Data Leaks, Missing Filters & Billing Page Enhancements

## Critical Issues Found

### Issue 1: Transaction data leak — no `panel_id` filter (SECURITY BUG)

`**PaymentMethods.tsx` line 158**: Fetches ALL transactions across all panels:

```typescript
const { data: transactions } = await supabase
  .from('transactions')
  .select('*')
  .order('created_at', { ascending: false });
```

Missing `.eq('panel_id', panel.id)`. This means top depositors, recent transactions, and payment method usage stats are calculated from **all panels' data**, not just the current panel.

`**Analytics.tsx` lines 211-216 and 249-253**: Same issue — transactions fetched without `panel_id` filter. Revenue calculations, deposit metrics, and period comparisons include data from other panels.

**Fix**: Add `.eq('panel_id', panel.id)` to all transaction queries in both files.

### Issue 2: `PaymentMethods.tsx` calls `refreshAvailableGateways()` twice (line 435-436)

```typescript
await refreshAvailableGateways();
await refreshAvailableGateways(); // duplicate
```

**Fix**: Remove the duplicate call.



### Issue 4: Billing page `QuickDeposit` doesn't pass selected gateway

`QuickDeposit` component uses `useAdminPaymentGateways()` to fetch admin-configured gateways, correctly selecting from them. The `handleDeposit` in Billing passes the `method` string from `QuickDeposit` to `process-payment`. This works correctly but the default `selectedMethod` is hardcoded to `"stripe"` (line 28 of QuickDeposit.tsx), which may not exist in admin gateways.

**Fix**: Change default `selectedMethod` from `"stripe"` to `""` add in admin payment to set default for subscription and others can still work for quick deposit in billing page `useEffect`.

### Issue 5: `Analytics.tsx` previous period transactions also missing `panel_id` filter

Line 249-253 fetches previous period transactions without panel filter, corrupting period-over-period comparison metrics.

**Fix**: Add `.eq('panel_id', panel.id)` filter.

## Summary of Changes


| File                                      | Change                                                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/pages/panel/PaymentMethods.tsx`      | Add `.eq('panel_id', panel.id)` to transactions query; remove duplicate `refreshAvailableGateways()` call |
| `src/pages/panel/Analytics.tsx`           | Add `.eq('panel_id', panel.id)` to both current and previous period transaction queries                   |
| `src/pages/panel/Billing.tsx`             | Import and add `TransactionHistory` component below deposit/commission grid                               |
| `src/components/billing/QuickDeposit.tsx` | Change default `selectedMethod` from `"stripe"` to `""`                                                   |
