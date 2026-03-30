

# Plan: Fix Drip Feed Visibility, Service Types in Management, Dashboard Stats, Fast Order Price/ID, Cart Mobile, Mass Order, and Add 130+ Payment Methods

## Issues Identified

1. **Drip feed toggle not visible**: In both `BuyerNewOrder.tsx` (line 779) and `FastOrderSection.tsx` (line 1321), the drip feed section is wrapped in `{selectedService && (selectedService as any).dripfeed_available && (...)}`. Most services don't have `dripfeed_available = true` in the database, so the toggle never shows. The toggle itself exists and works — the condition gate is too strict.
2. **Service types not visible in ServicesManagement**: `serviceType` and `dripfeedAvailable` are fetched (lines 668-669) but never displayed in the service list/table UI.
3. **Dashboard shows 0 orders**: `BuyerDashboard.tsx` queries `supabase.from('orders')` directly (line 109-117) with `buyer_id` filter. Tenant buyers use custom auth (not Supabase auth), so there's no `auth.uid()` — RLS blocks the query silently returning 0 rows. Must use `buyer-api` edge function instead.
4. **Fast order service ID shows "—"**: Line 1197 shows `service.display_order || service.displayOrder || '—'`. The services loaded from `useUnifiedServices` may not include `display_order`. Need to ensure it's included.
5. **Fast order price stays at $0.00**: `totalPrice` (line 356) depends on `selectedService.price` being set. If `price` is 0 or missing from the service object, it stays 0.
6. **Cart not mobile responsive**: The `SheetContent` is `w-full sm:max-w-lg` which is fine, but the inner checkout button row and bulk tabs may overflow on 420px.
7. **Mass order**: Already exists at `/bulk-order` with `BuyerBulkOrder.tsx` and has `BulkAddForm` in cart. User says they can't see it — likely needs better navigation visibility. The cart's "Bulk Add" tab IS the mass order feature.
8. **Payment methods**: Currently 70 gateways. Need 130+ more to reach 200+.

---

## 1. Fix Dashboard Order Stats — Use Edge Function

**File**: `src/pages/buyer/BuyerDashboard.tsx`

Replace direct Supabase query (lines 109-117) with `buyer-api` edge function call using `action: 'orders'` with `buyerId` + `panelId` verification. This bypasses RLS and returns actual orders. Calculate stats from the response.

---

## 2. Fix Drip Feed Visibility — Always Show Toggle When Service Selected

**Files**: `src/pages/buyer/BuyerNewOrder.tsx`, `src/components/storefront/FastOrderSection.tsx`

Change the condition from `(selectedService as any).dripfeed_available` to always show the toggle when a service is selected. The toggle is already gated by `dripFeedEnabled` state. If the provider doesn't support drip feed, the order will simply not include drip feed params (runs <= 1 is already handled).

---

## 3. Show Service Type & Drip Feed in ServicesManagement

**File**: `src/pages/panel/ServicesManagement.tsx`

Add `serviceType` and `dripfeedAvailable` as visible columns/badges in the service table. Show service type as a badge (e.g., "Poll", "Subscription", "Default") and a drip feed icon when `dripfeedAvailable` is true.

---

## 4. Fix Fast Order Service ID Display

**File**: `src/components/storefront/FastOrderSection.tsx`

The service cards show `service.display_order || service.displayOrder || '—'`. Ensure the `useUnifiedServices` hook returns `display_order` and that the Service interface includes it. If the field is coming as `displayOrder` from the hook, normalize it.

---

## 5. Fix Fast Order Price at $0.00

**File**: `src/components/storefront/FastOrderSection.tsx`

The `totalPrice` calculation at line 356 uses `selectedService.price`. The services from `useUnifiedServices` may have the price field correctly. Debug: ensure the `Service` interface's `price` field is populated from the query. Add a fallback: if `selectedService.price` is 0, check `selectedService.rate` or calculate from the effective buyer price.

---

## 6. Fix Cart Mobile Responsiveness

**File**: `src/components/buyer/ShoppingCart.tsx`

- The TabsList `grid-cols-3` at 420px can be tight — reduce text size on mobile
- The checkout button row (lines 400-422) with Clear + Checkout buttons should stack vertically on very small screens
- Add `overflow-x-auto` to any overflowing containers

---

## 7. Mass Order Navigation

Mass order exists at `/bulk-order` and in the cart's "Bulk Add" tab. The user says they can't find it. Add a "Mass Order" link/button in the tenant sidebar navigation if not present. Rename cart's "Bulk Add" tab to "Mass Order" for clarity.

---

## 8. Add 130+ Payment Methods

**File**: `src/pages/panel/PaymentMethods.tsx`

Currently has 70 gateways. Add 130+ more across categories to reach 200+:
- **Cards/Global**: Braintree, PayU, Paytm, CCAvenue, Paddle, Gumroad, FastSpring, Recurly, Chargebee, 2C2P, PayGate, Ebanx, PagSeguro, SafeCharge, Nuvei, BlueSnap, Cybersource, PayFast, Thawani, Tap, Moyasar, HyperPay, Benefit, STC Pay, Fawry, Kashier, Accept (Paymob), iPay Africa, Yoco, Cellulant, DPO Group, Pesapal, Hubtel, AZA Finance, Flywire, Ayden, Boku
- **Regional**: ToyyibPay, Billplz (Malaysia), PayHere (Sri Lanka), Bkash (Bangladesh), SSLCommerz (Bangladesh), eSewa (Nepal), Khalti (Nepal), JazzCash (Pakistan), Easypaisa (Pakistan), Flouci (Tunisia), CinetPay (West Africa), PayDunya (West Africa), Campay (Cameroon), NotchPay (Africa), Wave (West Africa), TigoMoney, Airtel Money, UPI (India), PhonePe (India), Paytm (India), DANA (Indonesia), OVO (Indonesia), ShopeePay (SEA), TrueMoney (Thailand), PromptPay (Thailand), KakaoPay (Korea), Toss Payments (Korea), LINE Pay (Japan/Taiwan), Konbini (Japan), PayPay (Japan), Au PAY (Japan), VNPAY (Vietnam), MoMo (Vietnam), ZaloPay (Vietnam)
- **Crypto**: Utrust, Confirmo, Speed, GoURL, B2BinPay, Coinremitter, NOWNodes, Trocador, Changelly, PayBear, GloBee, CoinsPaid, Spectrocoin, Paybis, Transak, MoonPay, Simplex, Wyre, Ramp, Sardine
- **E-wallets**: PaySera, Skrill 1-Tap, Paysafecard, CashApp, Apple Pay, Google Pay, Samsung Pay, Amazon Pay, Shop Pay
- **Bank**: Trustly, Sofort, Giropay, EPS (Austria), Przelewy24 (Poland), MultiBanco (Portugal), OXXO (Mexico), SPEI (Mexico)
- **BNPL**: Affirm, Zip (QuadPay), PayBright, Splitit, Laybuy, Openpay, Atome, hoolah, Pace

Each gateway entry needs: id, name, Icon component, regions, fee, docsUrl. Add corresponding field labels in `gatewayFieldLabels` for gateways that have specific credential names. Create placeholder icons using `GenericPaymentIcon` where no custom icon exists, but add the gateway's branded initial/abbreviation.

**File**: `src/components/payment/PaymentIconsExtended.tsx`

Add new icon components for the 130+ gateways. Use the existing pattern of colored SVG circle + text abbreviation for each.

**File**: `src/components/storefront/FastOrderSection.tsx`

Update `allPaymentGateways` map to include the new gateways so they render correctly in the tenant checkout flow.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/buyer/BuyerDashboard.tsx` | Use buyer-api edge function for order stats instead of direct query |
| `src/pages/buyer/BuyerNewOrder.tsx` | Show drip feed toggle for all services, not just dripfeed_available |
| `src/components/storefront/FastOrderSection.tsx` | Fix service ID display, price calculation, drip feed toggle, add new payment gateways |
| `src/pages/panel/ServicesManagement.tsx` | Show service_type badge and dripfeed indicator in service list |
| `src/components/buyer/ShoppingCart.tsx` | Mobile responsive fixes, rename "Bulk Add" to "Mass Order" |
| `src/pages/panel/PaymentMethods.tsx` | Add 130+ payment gateways with field labels |
| `src/components/payment/PaymentIconsExtended.tsx` | Add icon components for new gateways |

