

# Plan: Update Basic Plan to 3 Panels, Add Billing to Sidebar, Fix Admin Payment Gateway Errors

## Summary of Issues

1. **Basic plan says "2 Panels"** — needs to be "3 Panels" in `HomePricingSection.tsx` and `Pricing.tsx` (and the memory doc says 2 for Basic)
2. **No "Billing" in panel owner sidebar** — The sidebar in `PanelOwnerDashboard.tsx` has `settingsNavigation` array but no Billing entry. The route exists (`/panel/billing`) but isn't in the navigation menu
3. **Team invite enhancement** — Currently team members log in via a separate team login flow. User wants team members to access the panel directly with role-locked pages
4. **Admin payment gateway errors for panel owners** — When panel owners try to upgrade/deposit via `process-payment`, errors occur. The `defaultGateway` picks the first admin gateway alphabetically. The edge function's gateway `switch` only handles ~20 gateways. If admin enables a gateway not in the switch (e.g., `mollie`, `mercadopago`), the flow falls through to `default` case which treats it as manual transfer — causing unexpected behavior instead of an error redirect

## Root Cause of Payment Errors

The `process-payment` edge function (line 530-1668) has a `switch(gateway)` with explicit cases for: `stripe`, `paypal`, `coinbase`, `flutterwave`, `paystack`, `korapay`, `heleket`, `razorpay`, `monnify`, `nowpayments`, `coingate`, `binancepay`, `cryptomus`, `skrill`, `perfectmoney`, `square`, `braintree`, `ach`, `sepa`, `btcpay`, `wise`, and `manual_transfer`.

Any gateway NOT in this list (e.g., `mollie`, `mercadopago`, `checkout_com`, etc.) falls to the `default` case which checks if it starts with `manual_` — if not, it returns `"Unsupported gateway"` error. This is actually correct behavior for unsupported gateways.

The real issue is likely:
- Admin enabled a gateway (e.g., Flutterwave) but the config keys don't match what the edge function expects
- The `gatewayConfig` object maps admin provider config fields to `secretKey`, `apiKey`, `publicKey` etc. (lines 410-422) but the admin may have stored credentials under different field names
- Flutterwave specifically needs `secretKey` (line 760) which maps from `config.secret_key || config.secretKey` in the admin gateway resolution (line 414)

## Implementation Details

### 1. Update Basic Plan: 2 → 3 Panels

**`src/components/sections/HomePricingSection.tsx`** (line 26):
- Change `"2 Panels"` → `"3 Panels"` in Basic plan features

**`src/pages/Pricing.tsx`**: The Pricing page doesn't list panel counts in features. No change needed unless we want to add it.

### 2. Add Billing to Panel Owner Sidebar

**`src/pages/PanelOwnerDashboard.tsx`** (lines 155-166):
- Add `{ name: 'Billing', href: '/panel/billing', icon: DollarSign, tourId: 'billing' }` to `settingsNavigation` array (import `DollarSign` is already imported but as `Wallet` — need to check)
- Actually `CreditCard` is already imported and used for Transactions. Use `Wallet` (already imported via `import`) or add `DollarSign`
- Add it between "Payments" and "Integrations" or as a separate item in `mainNavigation`

### 3. Team Invite Enhancement

Current state: Team management has 3 roles (panel_admin, manager, agent) with email-based invites. Team members log in via `/team-login` with a separate JWT system.

The user wants team members to be "on the panel" with locked pages per role. This requires:
- When a team member logs in, they see the same panel dashboard but with restricted navigation based on their role
- Agent: Can only see Orders (view-only), Services (view-only), Support
- Manager: Orders, Services (edit), Support, Customers
- Admin: Full access

This is a significant feature. For now, add a visual indicator showing which pages each role can access and improve the team invite dialog with clearer permission descriptions. The actual page-locking requires routing guards.

### 4. Fix Admin Payment Gateway Errors

**`supabase/functions/process-payment/index.ts`**:

The key issue is the admin gateway config mapping (lines 410-422). When admin stores credentials via `platform_payment_providers`, the `config` JSON may use different field names than what each gateway case expects.

Add better error logging and a more resilient config resolution:
- Before the switch statement, log the resolved gateway config keys (without values) for debugging
- For Flutterwave specifically: ensure `secretKey` resolution works — the admin config might store it as `secret_key` and the mapping on line 414 already handles this
- Add a catch-all for gateways that have config but no switch case — instead of returning "Unsupported gateway", return a descriptive error saying "This gateway is configured but payment processing is not yet implemented. Please use Stripe, Flutterwave, Paystack, or another supported gateway."
- Ensure the `buyerEmail` is always populated for Flutterwave (it requires customer.email) — if profile lookup returns null, use a fallback

**`src/pages/panel/Billing.tsx`**:
- The `defaultGateway` picks `availableGateways[0]?.id` alphabetically. If the first gateway alphabetically isn't supported by the edge function, payments fail
- Fix: Filter `availableGateways` to only show gateways that have backend support, OR let the user choose which gateway to use for subscription payments (like QuickDeposit does for deposits)
- Better approach: Show a gateway selector when upgrading instead of using the first available one automatically

### 5. Subscription Payment Flow Fix

When `proceedWithGatewayPayment` is called (line 430), it uses `defaultGateway` which is the first admin gateway. If admin configured multiple gateways, the user gets no choice. 

Fix: Add a gateway selection dialog before payment, similar to how QuickDeposit lets users choose.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/sections/HomePricingSection.tsx` | Change "2 Panels" → "3 Panels" in Basic plan features |
| `src/pages/PanelOwnerDashboard.tsx` | Add Billing to `settingsNavigation` array with Wallet icon |
| `src/pages/panel/Billing.tsx` | Add gateway selection dialog for subscription upgrades instead of auto-picking first gateway |
| `supabase/functions/process-payment/index.ts` | Improve error messages for unsupported gateways; add debug logging for config resolution; ensure buyerEmail fallback |
| `src/pages/panel/TeamManagement.tsx` | Enhance role descriptions with page-level access details |

