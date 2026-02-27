

# Plan: Fix Theme Sync, Translation Errors, and Payment Balance/Subscription Issues

## Issue 1: Theme Sync Conflict on Tenant Storefront

Both `ThemeProvider` (from `use-theme.tsx`) and `BuyerThemeProvider` (from `BuyerThemeContext.tsx`) independently modify `document.documentElement.classList`, causing a race condition. When the page loads, `ThemeProvider` sets the theme based on `localStorage['smm-tenant-theme-${panelId}']`, then `BuyerThemeProvider` overwrites it based on `localStorage['buyer-theme-${panelId}']`. These fight each other.

**Fix in `src/contexts/BuyerThemeContext.tsx`**: Synchronize with the `ThemeProvider` by listening for the `theme-change` custom event (already dispatched by `use-theme.tsx` line 116). When the main `ThemeProvider` changes theme, `BuyerThemeProvider` should update its internal state to match. Also, when `BuyerThemeProvider` toggles theme, it should update the `ThemeProvider`'s localStorage key too.

**Fix in `src/hooks/use-theme.tsx`**: In the tenant storefront context, listen for `BuyerThemeProvider` changes as well. The simplest approach: make `BuyerThemeProvider.toggleThemeMode()` dispatch the same `theme-change` event so both contexts stay in sync.

## Issue 2: Missing Translation Key

`buyer.about.defaultDescription` is used in `BuyerAbout.tsx` but doesn't exist in `src/lib/platform-translations.ts`.

**Fix in `src/lib/platform-translations.ts`**: Add the missing key after line 196:
```typescript
'buyer.about.defaultDescription': 'We are a professional social media marketing service provider, helping businesses and individuals grow their online presence with high-quality, affordable services.',
```

## Issue 3: Transaction Metadata Not Stored (ROOT CAUSE of balance/subscription failures)

**Critical bug** in `supabase/functions/process-payment/index.ts` line 193:
```typescript
...(orderId ? { metadata: { orderId } } : {})
```
This ONLY stores metadata when there's an `orderId`. For deposit and subscription payments (which have no orderId), the metadata passed from the client (`{ type: 'subscription', plan: 'basic' }` or `{ type: 'panel_deposit' }`) is **never saved** to the transaction record.

When the webhook fires and reads `tx.metadata`, it gets `null` or `{}`. So:
- `txMetadata?.type === 'subscription'` → false → subscription never activates
- The deposit falls through to `client_users` lookup → user not found → falls through to panel owner check → this part works IF the owner_id matches, but without metadata it's fragile

**Fix in `supabase/functions/process-payment/index.ts`** line 193: Always merge client-provided metadata:
```typescript
metadata: {
  ...(metadata || {}),
  ...(orderId ? { orderId } : {}),
}
```

## Issue 4: Webhook Transaction Lookup by `tx_ref` Instead of `id`

For Flutterwave, the webhook extracts `transactionId = event.data?.tx_ref` (line 94). The `process-payment` function sets `tx_ref` as the transaction ID when initializing Flutterwave (need to verify this). But the webhook then does `UPDATE transactions WHERE id = transactionId`. If `tx_ref` doesn't match the UUID `id`, the lookup fails silently.

**Fix**: The webhook already has a fallback to search by `external_id` (line 387-395). Need to ensure `process-payment` stores the `tx_ref` as `external_id` in the transaction record, OR passes the transaction UUID as `tx_ref` to Flutterwave. Let me verify this is already handled. The `transactionIdToUse` UUID is used as `tx_ref` for Flutterwave (need to confirm in the gateway-specific code).

## Summary of All Changes

| File | Change |
|------|--------|
| `supabase/functions/process-payment/index.ts` | Fix metadata storage: always save client metadata to transaction record |
| `src/lib/platform-translations.ts` | Add missing `buyer.about.defaultDescription` key |
| `src/contexts/BuyerThemeContext.tsx` | Sync with ThemeProvider via `theme-change` event listener |
| `src/hooks/use-theme.tsx` | Listen for buyer theme changes to stay in sync |
| Edge function redeployment | Redeploy `process-payment` with metadata fix |

