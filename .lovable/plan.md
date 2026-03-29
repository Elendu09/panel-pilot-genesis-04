

# Plan: Implement 5% Commission for Free Plan, Add FAQ Items, Fix Tenant Auth, Verify API v2

## 1. Auto-Deduct 5% Commission on Completed Orders (Free Plan Only)

**Current state**: The `CommissionTracker` UI exists in Billing but commission is never actually deducted. The `buyer-order` edge function creates orders and deducts buyer balance but never calculates or deducts a platform fee from the panel owner's balance.

**Implementation**:

### Edge Function: `buyer-order/index.ts`
After a successful order is created and balance deducted (around line 280), add commission logic:
- Fetch the panel's `subscription_tier` 
- If tier is `'free'` or null, calculate `commission = verifiedPrice * 0.05`
- Deduct commission from `panels.balance` (panel owner balance)
- Insert a record into `platform_fees` table with `fee_amount`, `fee_percentage: 5`, `order_amount: verifiedPrice`, `order_id`, `panel_id`
- Create a transaction record for the commission deduction so it appears in transaction history

```typescript
// After order creation success, before returning response:
const { data: panelData } = await supabase
  .from('panels')
  .select('subscription_tier, balance')
  .eq('id', panelId)
  .single();

const tier = (panelData?.subscription_tier || 'free').toLowerCase();
if (tier === 'free' || tier === 'trial') {
  const commissionAmount = verifiedPrice * 0.05;
  const newPanelBalance = (panelData?.balance || 0) - commissionAmount;
  
  await supabase.from('panels')
    .update({ balance: newPanelBalance })
    .eq('id', panelId);
  
  await supabase.from('platform_fees').insert({
    panel_id: panelId,
    order_id: order.id,
    order_amount: verifiedPrice,
    fee_amount: commissionAmount,
    fee_percentage: 5,
    description: `5% platform commission on order #${orderNumber}`,
  });
}
```

### Same logic in `buyer-api/index.ts`
Apply identical commission deduction after order creation for API-based orders.

### UI: `CommissionTracker.tsx` + `Billing.tsx`
- Only show `CommissionTracker` when `subscription_tier` is `'free'` or null
- Hide it for Basic/Pro users (no commission for paid plans)

---

## 2. Add 2 New FAQ Items to Homepage

**File**: `src/components/sections/FAQSection.tsx` and `src/pages/Index.tsx` (faqData)

Add these two items to the `faqs` array:

```typescript
{
  question: "Does HOME OF SMM offer API access for automation?",
  answer: "Yes! Every panel on HOME OF SMM comes with a full REST API (v2) that supports automation. Panel owners can share API credentials with developers or third-party tools to automate order placement, check order status, fetch services, and manage balances programmatically. The API follows industry-standard SMM panel API formats for easy integration.",
  iconKey: "globe",
  gradient: "from-teal-500 to-cyan-500"
},
{
  question: "Can I customize the design of my SMM panel?",
  answer: "Absolutely! HOME OF SMM offers extensive design customization options including 5+ pre-built themes, custom colors, fonts, logos, favicons, and full CSS overrides. You can match your brand identity perfectly with custom domains and white-label branding — your customers will never know the panel is powered by HOME OF SMM.",
  iconKey: "target",
  gradient: "from-violet-500 to-purple-500"
}
```

Also add these to the `faqData` in `Index.tsx` for structured data/SEO.

---

## 3. Fix Tenant Auth "Incorrect Password" Issue

**Root cause analysis**: The `verifyPassword` function in `buyer-auth/index.ts` uses PBKDF2 with `atob`/`btoa` for base64 encoding. The issue is likely in the base64 comparison — `btoa(String.fromCharCode(...new Uint8Array(derivedBits)))` can produce inconsistent results across environments due to character encoding edge cases.

**Fix**: Use a constant-time comparison and ensure the base64 encoding/decoding is consistent between hash creation and verification. The `hashPassword` function (line 288) and `verifyPassword` (line 321) must use identical encoding. 

Check specifically:
- Line 307 in `hashPassword`: `btoa(String.fromCharCode(...new Uint8Array(derivedBits)))`
- Line 352 in `verifyPassword`: same pattern

If the salt or hash bytes contain values that `btoa` handles differently, verification fails. Fix by using a hex-based comparison instead of base64, or ensure consistent encoding using a manual base64 encoder.

**Additional fix**: For users whose passwords were hashed with the old implementation, add a re-hash on successful login to ensure future logins work.

**File**: `supabase/functions/buyer-auth/index.ts`

---

## 4. Verify Tenant API Uses `/api/v2`

**Current state**: The `enable-direct-provider` edge function already constructs API endpoints with `/api/v2`. The `panel-api` edge function logs as `/api/v2/panel/...`. The `buyer-api` function handles the actual API logic.

This appears to be correctly implemented. Will verify the frontend calls and the `buyer-api` routing to confirm v2 is used consistently.

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/buyer-order/index.ts` | Add 5% commission deduction for free-plan panels after order creation |
| `supabase/functions/buyer-api/index.ts` | Same commission deduction for API-based orders |
| `src/pages/panel/Billing.tsx` | Only show CommissionTracker for free-plan panels |
| `src/components/sections/FAQSection.tsx` | Add 2 new FAQ items |
| `src/pages/Index.tsx` | Add 2 new FAQ items to structured data |
| `supabase/functions/buyer-auth/index.ts` | Fix PBKDF2 password verification encoding consistency |

