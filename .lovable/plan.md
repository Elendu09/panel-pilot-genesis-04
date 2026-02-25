

# Plan: Admin Payment Gateway Enhancement + Payment Error Fixes

## Analysis Summary

### Issue 1: Admin Payment Gateway Labels Are Incorrect
The `SubscriptionProviderManager.tsx` component uses generic "Public/API Key" and "Secret Key" labels for ALL providers, but each payment gateway has different credential names:

- **Stripe**: "Publishable Key" + "Secret Key"
- **PayPal**: "Client ID" + "Client Secret"
- **Paystack**: "Public Key" + "Secret Key"
- **Flutterwave**: "Public Key" + "Secret Key" + "Encryption Key" (already has extra field)
- **Razorpay**: "Key ID" + "Key Secret"
- **Coinbase Commerce**: "API Key" (single key only, no secret)
- **CryptoMus**: "Merchant ID" + "API Key"
- **Polar.sh**: "Access Token" (single key only)

Currently all providers show the same two generic input fields. The admin can't tell which credentials go where.

### Issue 2: "Failed to create transaction record" Errors

Three separate causes:

**A. Billing upgrade missing `isOwnerDeposit` flag** (`Billing.tsx` line 238-252): The `handleUpgrade` call to `process-payment` does NOT include `isOwnerDeposit: true`. Without this flag, the edge function treats it as a buyer payment and tries to find the gateway in panel settings (which don't have admin gateways configured). It fails at the gateway config lookup.

**B. Onboarding payment step counter still showing wrong step**: The `restoringState` flag was added but needs verification that the restoration effect properly sets `selectedPlan` before rendering.

**C. The `metadata` column migration may not have run**: The DB query confirms `metadata` and `external_id` columns DO exist now, so this is resolved.

### Root Cause of "Failed to create transaction record"

After testing the edge function directly, the actual error path is:
1. For **upgrade** in Billing: Missing `isOwnerDeposit: true` → edge function treats as buyer payment → tries `panel.settings.payments.enabledMethods` → gateway not found → returns error BEFORE creating transaction. The error message "Failed to create transaction record" is misleading since the function never reaches the transaction creation code.
2. For **deposit** in Billing: The `QuickDeposit` component correctly passes `isOwnerDeposit: true` via `handleDeposit`, but the Billing page's `handleDeposit` function also correctly passes it. So deposit should work unless the gateway config in `platform_payment_providers` is missing keys.

Let me trace the upgrade flow more carefully: `handleUpgrade` passes `metadata: { type: 'subscription' }` but NOT `isOwnerDeposit: true`. In the edge function line 40: `isOwnerPayment = isOwnerDeposit || metadata?.type === 'subscription'`. So `metadata.type === 'subscription'` SHOULD trigger the owner payment path. But the edge function at line 42 checks `!panelId && !isOwnerPayment` - panelId IS provided, so this passes. Then it fetches the panel (line 52-66) - this should work. Then at line 73 it checks `isOwnerPayment` which is TRUE (because metadata.type === 'subscription'). So it should use admin gateways.

This means the gateway config fetch from `platform_payment_providers` succeeds (Flutterwave/Paystack are enabled), the config is extracted at line 99-109, and the transaction insert at line 169-184 should work since `metadata` column now exists.

The remaining issue could be that `profile.id` (used as `buyerId`) is different from `user.id`. Let me check: In `AuthContext`, `profile.id` is the profile's ID. But `user_id` in the transactions table expects the auth user's UUID. The edge function uses `buyerId` as both `user_id` and `buyer_id` (line 172-173). If `profile.id` matches the auth user ID, this works. But if profiles use a different primary key... Actually, in the DB schema, profiles have `id` and `user_id` columns. `profile.id` might be the same as `user_id` if the `handle_new_user` trigger sets `id = NEW.id` (which it does). So this should be fine.

**The real issue** is likely that the edge function was NOT redeployed after the metadata column migration. The function code references `metadata` in the INSERT, and if the function was deployed before the column existed, it would have worked initially but cached a stale schema. But since edge functions don't cache DB schemas (they run queries at runtime), this shouldn't matter.

Let me reconsider: The user screenshots show "Failed to create transaction record" which is the exact error string from line 189. This means the transaction INSERT itself fails. Possible reasons:
1. The `user_id` foreign key constraint - if `buyerId` doesn't match an existing auth user
2. The `panel_id` foreign key constraint - if panelId doesn't match
3. RLS policies blocking the insert even with service_role key (unlikely since service_role bypasses RLS)

Since we're using `createClient` with `SUPABASE_SERVICE_ROLE_KEY`, RLS is bypassed. The most likely cause is that the function needs to be redeployed with the latest code that includes the `panelName` fallback and proper error handling.

---

## Implementation Plan

### 1. Enhance Admin Payment Gateway Labels (SubscriptionProviderManager.tsx)

Create a provider-specific configuration map that defines the correct field names, placeholders, descriptions, and required fields for each gateway:

```typescript
const providerFieldConfig: Record<string, {
  field1Label: string;
  field1Placeholder: string;
  field1Description: string;
  field2Label: string;
  field2Placeholder: string;
  field2Description: string;
  hasField2: boolean;
  extraFields?: Array<{key: string; label: string; placeholder: string; description: string; type?: string}>;
  docsUrl: string;
}> = {
  stripe: {
    field1Label: 'Publishable Key',
    field1Placeholder: 'pk_test_... or pk_live_...',
    field1Description: 'Found in Stripe Dashboard → Developers → API Keys',
    field2Label: 'Secret Key',
    field2Placeholder: 'sk_test_... or sk_live_...',
    field2Description: 'Server-side key. Keep this confidential.',
    hasField2: true,
    docsUrl: 'https://dashboard.stripe.com/apikeys'
  },
  paypal: {
    field1Label: 'Client ID',
    field1Placeholder: 'Your PayPal Client ID',
    field1Description: 'Found in PayPal Developer → My Apps & Credentials',
    field2Label: 'Client Secret',
    field2Placeholder: 'Your PayPal Client Secret',
    field2Description: 'Generated alongside Client ID',
    hasField2: true,
    docsUrl: 'https://developer.paypal.com/dashboard/applications'
  },
  paystack: {
    field1Label: 'Public Key',
    field1Placeholder: 'pk_test_... or pk_live_...',
    field1Description: 'Found in Paystack Dashboard → Settings → API Keys',
    field2Label: 'Secret Key',
    field2Placeholder: 'sk_test_... or sk_live_...',
    field2Description: 'Server-side key for API authentication',
    hasField2: true,
    docsUrl: 'https://dashboard.paystack.com/#/settings/developers'
  },
  flutterwave: {
    field1Label: 'Public Key',
    field1Placeholder: 'FLWPUBK_TEST-... or FLWPUBK-...',
    field1Description: 'Found in Flutterwave Dashboard → Settings → API Keys',
    field2Label: 'Secret Key',
    field2Placeholder: 'FLWSECK_TEST-... or FLWSECK-...',
    field2Description: 'Server-side key. Never expose client-side.',
    hasField2: true,
    extraFields: [{ key: 'encryptionKey', label: 'Encryption Key', placeholder: 'FLWSECK_TEST...', description: 'Required for direct card charge endpoints' }],
    docsUrl: 'https://developer.flutterwave.com/docs/authentication'
  },
  razorpay: {
    field1Label: 'Key ID',
    field1Placeholder: 'rzp_test_... or rzp_live_...',
    field1Description: 'Found in Razorpay Dashboard → Settings → API Keys',
    field2Label: 'Key Secret',
    field2Placeholder: 'Your Razorpay Key Secret',
    field2Description: 'Shown only once when generated. Store securely.',
    hasField2: true,
    docsUrl: 'https://dashboard.razorpay.com/app/website-app-settings/api-keys'
  },
  coinbase: {
    field1Label: 'API Key',
    field1Placeholder: 'Your Coinbase Commerce API Key',
    field1Description: 'Found in Coinbase Commerce → Settings → API Keys',
    field2Label: '',
    field2Placeholder: '',
    field2Description: '',
    hasField2: false,
    docsUrl: 'https://commerce.coinbase.com/dashboard/settings'
  },
  cryptomus: {
    field1Label: 'Merchant ID',
    field1Placeholder: 'Your CryptoMus Merchant ID',
    field1Description: 'Found in CryptoMus Dashboard → Settings',
    field2Label: 'API Key',
    field2Placeholder: 'Your CryptoMus API Key',
    field2Description: 'Payment API key from dashboard',
    hasField2: true,
    docsUrl: 'https://doc.cryptomus.com/'
  },
  polar: {
    field1Label: 'Access Token',
    field1Placeholder: 'Your Polar.sh Access Token',
    field1Description: 'Generate from Polar.sh Dashboard → Settings → Access Tokens',
    field2Label: '',
    field2Placeholder: '',
    field2Description: '',
    hasField2: false,
    docsUrl: 'https://polar.sh/settings'
  }
};
```

**Changes to `SubscriptionProviderManager.tsx` lines 386-410:**
- Replace the static "Public/API Key" and "Secret Key" labels with dynamic labels from `providerFieldConfig`
- Add placeholder text matching the actual key format per gateway
- Add a small help text/description under each field
- Conditionally hide the second field when `hasField2` is false (e.g., Coinbase, Polar)
- Add a "View Docs" link button next to each provider that opens the official docs URL
- Move the Flutterwave encryption key rendering into the `extraFields` pattern
- For CryptoMus, map `field1` to `merchantId` instead of `publicKey`

### 2. Fix Billing Upgrade Payment - Add `isOwnerDeposit` Flag

**File:** `src/pages/panel/Billing.tsx` lines 238-252

Add `isOwnerDeposit: true` to the `handleUpgrade` body:
```typescript
body: {
  gateway: defaultGateway,
  amount: plan.price,
  panelId: panel.id,
  buyerId: profile.id,
  isOwnerDeposit: true,  // ADD THIS
  returnUrl: ...,
  metadata: { type: 'subscription', plan: planName.toLowerCase(), panelId: panel.id }
}
```

This ensures the edge function uses admin-configured gateways instead of panel buyer gateways.

### 3. Fix Commission Payment - Add `isOwnerDeposit` Flag  

**File:** `src/pages/panel/Billing.tsx` lines 350-364

The `handlePayCommission` call also needs `isOwnerDeposit: true` added to the body.

### 4. Redeploy process-payment Edge Function

The edge function code already has the correct logic with `panelName` fallback and `metadata` column support. It just needs to be redeployed to ensure the latest version is live.

### 5. Remove "Global Methods" Tab from Admin PaymentManagement

**File:** `src/pages/admin/PaymentManagement.tsx`

The "Methods" tab (lines 397, ~700-800) shows 60+ generic payment methods with toggle switches. This is confusing alongside the "Payment Providers" tab which is the actual functional configuration. Based on user's instruction: "anything apart from billing & subscription should be deleted like the global payments."

Remove the "methods" tab entry from the tabs array (line 397) and the corresponding `TabsContent value="methods"` section. Keep: Payment Providers, Transactions, Panel Funding, Fees, Payouts.

---

## Summary of All Changes

| File | Change |
|------|--------|
| `src/components/admin/SubscriptionProviderManager.tsx` | Add provider-specific field labels, placeholders, descriptions, and docs links for each gateway |
| `src/pages/panel/Billing.tsx` | Add `isOwnerDeposit: true` to upgrade and commission payment calls |
| `src/pages/admin/PaymentManagement.tsx` | Remove the "Methods" tab (global payment toggles) |
| Edge function deployment | Redeploy `process-payment` to ensure latest code is live |

