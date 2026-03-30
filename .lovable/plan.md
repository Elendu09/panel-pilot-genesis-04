

# Plan: Fix Payment Methods Review, Wire Transfer, Icons, and Verify Previous Implementations

## Issues Found

### 1. Wire Transfer Should Be Manual, Not API-Based
- **Problem**: `wiretransfer` is in the `bank` category (line 174) which shows API key fields when configuring. The setup steps say "No API keys needed" but the config dialog still shows API Key/Secret Key inputs.
- **Fix**: Remove `wiretransfer` from the `bank` array entirely. It belongs as a pre-built manual payment template. Add a "Wire Transfer" quick-add button in the Manual Methods section that pre-fills the manual form with wire transfer defaults.

### 2. Payment Icons Are All Generic Letter-Based (Not Official)
- **Problem**: All 130+ icons in `PaymentIconsExtended.tsx` use `createBrandIcon()` which renders colored rectangles with 2-letter initials (e.g., "AD" for Adyen, "KL" for Klarna). These are not official payment brand icons.
- **Fix**: Replace generic icons with proper SVG path-based icons for the most recognizable gateways. For gateways where official SVGs are impractical to embed, improve the visual quality with better styling (rounded logos, gradient fills, proper brand colors). For the top ~30 most-used gateways (Klarna, Affirm, Alipay, WeChat Pay, Apple Pay, Google Pay, etc.), create proper SVG icons with recognizable brand marks.

### 3. Gateways Missing Setup Steps and Field Labels
- **Problem**: Many gateways in the list (e.g., `benefit`, `stcpay`, `accept_paymob`, `cellulant`, `dpo_group`, `hubtel`, `flywire`, `boku`, `moov`, `chipper`, `paga`, `remita`, `interswitch`, `gcash`, `grabpay`, `opay`, `dana`, `ovo`, `shopeepay`, `truemoney`, `promptpay`, `kakaopay`, `aupay`, `momo_vn`, `zalopay`, `linepay`, `konbini`, `paypay`, most e-wallets, most BNPL, some crypto) have NO entry in `gatewayFieldLabels` or `gatewaySetupSteps`. When opened, they show generic "API Key / Public Key" and "Secret Key" with no setup guidance.
- **Fix**: Add proper `gatewayFieldLabels` and `gatewaySetupSteps` entries for ALL gateways that are missing them. Gateways like Zelle, UPI, PromptPay, Konbini that don't use traditional API keys should either be moved to manual or have their config dialog adapted (no API key required, just account details).

### 4. Non-API Gateways Wrongly Requiring API Keys
Several payment methods don't have merchant APIs and shouldn't require API keys:
- **Zelle** — P2P, no merchant API
- **Venmo** — uses PayPal SDK (should reference PayPal config)
- **UPI** — varies by aggregator; should note "Configure via Razorpay/PayU"
- **PromptPay** — QR-based, no direct API
- **Konbini** — convenience store, uses Stripe
- **Apple Pay / Google Pay / Samsung Pay** — use underlying gateway (Stripe/Adyen)

**Fix**: For pass-through methods (Apple Pay, Google Pay, Samsung Pay, Konbini, Venmo), update setup steps to clearly state "Requires Stripe/PayPal/Adyen — configure the underlying gateway first." For truly manual methods (Zelle, UPI direct), move to manual category or mark field2 as optional with a note.

### 5. Orders Management Bulk Select Mobile Issue (from images)
- **Problem**: The screenshots show orders selected with an "Action..." dropdown overlapping on mobile. The bulk action bar needs the same `overflow-x-auto scrollbar-hide` treatment as customer management.
- **Fix**: Already addressed in the previous plan's implementation — verify it's working. If the orders management bulk bar still overflows, apply same horizontal scroll fix.

### 6. Customer Management Bulk Select Mobile (from images)
- Screenshots show the bulk select still potentially overflowing. Verify the `overflow-x-auto` fix was applied correctly.

---

## Implementation Details

### File: `src/pages/panel/PaymentMethods.tsx`

1. **Remove `wiretransfer` from `bank` array** (line 174). Add a "Wire Transfer" quick-template button in the Manual Methods section.

2. **Add missing `gatewayFieldLabels`** for ~40 gateways that currently lack them: `benefit`, `stcpay`, `thawani`, `accept_paymob`, `ipay_africa`, `cellulant`, `dpo_group`, `hubtel`, `aza_finance`, `flywire`, `boku`, `gcash`, `grabpay`, `opay`, `moov`, `chipper`, `paga`, `remita`, `interswitch`, `dana`, `ovo`, `shopeepay`, `truemoney`, `promptpay`, `aupay`, `momo_vn`, `zalopay`, `linepay`, `konbini`, `paypay`, `alipay`, `wechatpay`, `revolut`, `payoneer`, `webmoney`, `paysera`, `paysafecard`, `cashapp`, `applepay`, `googlepay`, `samsungpay`, `amazonpay`, `shoppay`, `afterpay`, `sezzle`, `zip`, `splitit`, `laybuy`, `openpay_bnpl`, `atome`, `hoolah`, `pace`, `blockonomics`, `opennode`, `mixpay`, `cryptocloud`, `spicepay`, `confirmo`, `speed`, `gourl`, `b2binpay`, `coinremitter`, `spectrocoin`, `simplex`, `ramp`, `sardine`.

3. **Add missing `gatewaySetupSteps`** for the same ~40 gateways.

4. **Mark pass-through gateways** (Apple Pay, Google Pay, Samsung Pay, Shop Pay) with a special note in their setup steps: "This method requires an underlying gateway (Stripe, Adyen, etc.) to be configured first."

### File: `src/components/payment/PaymentIconsExtended.tsx`

Replace the top ~30 most-used generic letter icons with proper SVG path icons for recognizable brands: Apple Pay, Google Pay, Klarna, Alipay, WeChat Pay, Revolut, Venmo, Cash App, Samsung Pay, Amazon Pay, Shop Pay, Affirm, Afterpay, PIX, iDEAL, Bancontact, Boleto, BitPay, and others where simple recognizable SVG paths exist.

### File: `src/pages/panel/OrdersManagement.tsx`
- Verify mobile bulk action bar responsiveness; apply `overflow-x-auto` if not already done.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/PaymentMethods.tsx` | Remove wiretransfer from bank array; add Wire Transfer manual template; add ~40 missing gatewayFieldLabels and gatewaySetupSteps entries; mark pass-through gateways |
| `src/components/payment/PaymentIconsExtended.tsx` | Replace top ~30 generic letter icons with proper SVG brand icons |
| `src/pages/panel/OrdersManagement.tsx` | Verify/fix mobile bulk action overflow |

