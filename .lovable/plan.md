

# Plan: Support Email Visibility, Service ID Stability, and 50+ Payment Methods

## 1. Support Email Configuration for Contact Us Page

**Current state**: Panel owners CAN already configure their support email in General Settings (`supportEmail` field, saved to `panel_settings.contact_info.email`). The BuyerContact page reads it from `panel_settings_public.contact_info`. The hardcoded email was already removed.

**Issue**: The `contact_info` object in GeneralSettings only saves `{ email: settings.supportEmail }` — no phone, address, or website fields are exposed for panel owners to configure.

**Fix**: Add phone, address, and website fields to the GeneralSettings contact section so panel owners can fully configure what appears on the tenant Contact Us page.

**Files**: `src/pages/panel/GeneralSettings.tsx`

---

## 2. Service ID (display_order) Stability Confirmation

**Current state**: `display_order` is the stable service ID assigned at import time. `sort_order` (added recently) controls visual ordering for drag-and-drop. The tenant API (`buyer-api`) uses `display_order` as the service identifier.

**Concern**: "Does sort_order/display_order spoil service IDs for providers?"

**Answer**: No — `display_order` is never changed by drag-and-drop (that updates `sort_order`). When users add another provider, new services get `MAX(display_order) + 1` onwards. The tenant API (`/api/v2`) uses the database UUID `id` for order placement and `display_order` as the human-readable ID — both remain stable. No code changes needed here.

---

## 3. Add 50+ Payment Gateways for Panel Owner Configuration

**Current count**: 20 gateways across 5 categories. Target: 70+ gateways.

**Approach**: Add gateways to the `paymentGateways` object in `PaymentMethods.tsx` and create corresponding icons in `PaymentIcons.tsx`. Each gateway needs: id, name, Icon component, regions, fee, docsUrl.

### New gateways to add (50+ organized by category):

**Cards & Global (add ~8)**:
- Adyen, Checkout.com, Worldpay, Authorize.net, 2Checkout (Verifone), Mollie, dLocal, Rapyd

**Regional (add ~15)**:
- Mercado Pago (LATAM), Iyzico (Turkey), Paymob (MENA), Xendit (SEA), Midtrans (Indonesia), GCash (Philippines), GrabPay (SEA), Opay (Africa), Moov Money (Africa), Chipper Cash (Africa), Paga (Nigeria), Remita (Nigeria), Interswitch (Nigeria), MTN MoMo (Africa), Safaricom M-Pesa (East Africa)

**E-Wallets (add ~8)**:
- Neteller, WebMoney, Payoneer, Alipay, WeChat Pay, Revolut, Venmo, Zelle

**Bank (add ~5)**:
- Wire Transfer, iDEAL (Netherlands), Bancontact (Belgium), Boleto (Brazil), PIX (Brazil)

**Crypto (add ~10)**:
- Plisio, CoinPayments, TripleA, BitPay, Blockonomics, OpenNode, MixPay, Cryptocloud, Oxapay, SpicePay

**BNPL / Alternative (new category, add ~5)**:
- Klarna, Afterpay/Clearpay, Tabby (MENA), Tamara (MENA), Sezzle

### Implementation:

1. **PaymentIcons.tsx**: Add `GenericPaymentIcon`-based icons for each new gateway (use colored rectangles with initials — keeps file size manageable). Add all to `getPaymentIcon` map.

2. **PaymentMethods.tsx**: Add new category `bnpl` and expand all existing categories with the new gateways. Each entry follows existing pattern:
```typescript
{ id: "adyen", name: "Adyen", Icon: AdyenIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://docs.adyen.com" }
```

3. **Configuration dialog**: Already works generically (API Key + Secret Key). No changes needed — all gateways use the same config dialog.

4. **process-payment edge function**: No changes needed — buyer payment gateway resolution already reads from `panels.settings.payments.enabledMethods` dynamically. Any gateway the panel owner configures with API keys will be passed through.

### Pre-existing bug fixes before adding:

- **Config dialog secret key handling**: Currently all gateways show "API Key" + "Secret Key". Some gateways need different field labels (e.g., Coinbase only needs API Key, Paystack needs Secret Key, Razorpay needs Key ID + Key Secret). Add per-gateway field label customization.
- **Test connection**: Only supports stripe/paypal/coinbase. For unsupported gateways, it already shows "simulated" — this is acceptable.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/GeneralSettings.tsx` | Add phone, address, website fields to contact section |
| `src/components/payment/PaymentIcons.tsx` | Add 50+ new gateway icon components and update `getPaymentIcon` map |
| `src/pages/panel/PaymentMethods.tsx` | Add 50+ gateways to categories, add `bnpl` category, add per-gateway field labels |

