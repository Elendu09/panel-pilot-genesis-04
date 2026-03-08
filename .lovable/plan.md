

# Plan: Domain Uniqueness, Notification Flow Audit & Transaction Status Sync

## 3 Areas to Fix

---

### 1. Domain Uniqueness Enforcement

**Current state**: `panel_domains` has a unique index on `domain` column (`idx_panel_domains_domain_unique`) — so the DB already prevents the same domain from being used twice. However, neither the `add-vercel-domain` edge function nor `DomainSettings.tsx` checks for this before inserting, leading to cryptic DB errors.

**Fixes**:

**`supabase/functions/add-vercel-domain/index.ts`**: Before upserting, query `panel_domains` to check if `domain` is already used by a *different* `panel_id`. If so, return a clear error: "This domain is already connected to another panel."

**`src/pages/panel/DomainSettings.tsx`** (`handleAddDomain`, line ~283): Before inserting, query `panel_domains` for existing domain. Show clear error if taken.

**`src/components/onboarding/OnboardingDomainStep.tsx`** (`handleDomainSubmit`, line ~143): The edge function will now handle this, but add client-side error message mapping for the "already in use" error.

**One custom domain per panel** is already enforced in `DomainSettings.tsx` (line 254: `if (domains.length > 0)`). The onboarding flow also only allows one domain. No change needed here.

---

### 2. Notification Flow Audit & Gaps

**Currently working notifications**:
- ✅ Subscription activated (payment-webhook)
- ✅ Panel owner deposit (payment-webhook)
- ✅ Commission paid (payment-webhook)
- ✅ Buyer deposit (payment-webhook → buyer_notifications)
- ✅ Buyer order placed (buyer-order → buyer_notifications)
- ✅ Admin fund add/deduct (admin-panel-ops → panel_notifications)
- ✅ Manual transfer pending (ManualTransferDialog)
- ✅ Provider synced (DB trigger `notify_on_provider_sync`)
- ✅ New order received (DB trigger `notify_on_new_order`)
- ✅ Payment failed (payment-webhook → buyer_notifications)

**Missing notifications**:
- ❌ **Panel owner not notified on new buyer order** — `buyer-order` only creates `buyer_notifications` for the buyer, not `panel_notifications` for the panel owner. The DB trigger `notify_on_new_order` exists in functions list but there are no triggers in the database (per config: "There are no triggers in the database"). **This is a gap.**
- ❌ **Subscription upgrade/downgrade** — Only admin-initiated changes create notifications. When a user self-upgrades via billing, no notification is created.
- ❌ **Ad purchase** — When a panel owner buys an ad, no notification is created for confirmation.
- ❌ **Failed payment notification for panel owner** — payment-webhook only sends to `buyer_notifications` on failure, not `panel_notifications`.

**Fixes**:

**`supabase/functions/buyer-order/index.ts`** (~line 313): After buyer notification insert, add `panel_notifications` insert for the panel owner with title "New Order Received" and order details.

**`supabase/functions/payment-webhook/index.ts`**: 
- On failed payment with `txPanelId`, also insert into `panel_notifications` for the panel owner.
- The subscription, deposit, and commission notifications already exist.

**`src/components/billing/SubscriptionPlans.tsx` or equivalent**: After successful self-upgrade payment, add a notification. (This is handled by the webhook flow already when payment completes — the webhook creates the "Subscription Activated" notification. This is actually fine.)

**Ad purchase notification**: Find where ad purchases happen and add notification insert.

---

### 3. Transaction History Real-time Status Updates

**Current state**: TransactionHistory already has a realtime UPDATE subscription (lines 75-90) that updates status in-place and shows a toast. The `getStatusColor` function (line 146) already maps completed→green, pending→yellow, failed→red. Both mobile and desktop views already show colored status badges.

**What's actually working**: The realtime listener correctly handles status transitions. When the `payment-webhook` updates a transaction from `pending` to `completed` or `failed`, the UI will update via the realtime channel.

**Gap found**: The payment-webhook updates `transactions.status` to `completed` but this happens in the webhook flow. If the status update doesn't propagate through Supabase Realtime (e.g., if Realtime is not enabled on the `transactions` table), the UI won't update.

**Fix**: Verify Realtime is enabled. The code is correct — no UI changes needed. Add a periodic poll fallback (every 30s) for pending transactions to catch missed realtime events.

---

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/add-vercel-domain/index.ts` | Check domain uniqueness across panels before upsert |
| `src/pages/panel/DomainSettings.tsx` | Check domain uniqueness before insert in `handleAddDomain` |
| `src/components/onboarding/OnboardingDomainStep.tsx` | Map "already in use" error from edge function |
| `supabase/functions/buyer-order/index.ts` | Add panel owner notification on new order |
| `supabase/functions/payment-webhook/index.ts` | Add panel owner notification on failed buyer payment |
| `src/components/billing/TransactionHistory.tsx` | Add polling fallback for pending transactions |

