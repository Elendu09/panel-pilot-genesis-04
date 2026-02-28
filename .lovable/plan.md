

# Plan: Fix 7 Issues — API Webhooks, Mobile Responsiveness, Customer Detail, Notifications, Panel Switcher, New Panel Redirect, TXT Verification

## 1. API Webhook Configuration — Make It Functional + Add FAQ

**Problem**: The webhook configuration in `APIManagement.tsx` is purely UI — `saveWebhookConfig()` (line 380) just shows a toast but doesn't persist anything. The webhook URL and selected events are local state only. Audit logs tab works (reads from `api_logs` table). The edge function `webhook-notify` exists for sending.

**Fix** in `src/pages/panel/APIManagement.tsx`:
- Store webhook config in `panel_settings` (JSONB field) — save/load `webhookUrl`, `webhookEnabled`, `selectedEvents` to `panel_settings.webhook_config`
- Update `saveWebhookConfig` to actually upsert to `panel_settings`
- Add `useEffect` to load saved config on mount
- Add a step-by-step FAQ/guide section inside the webhooks tab explaining: what webhooks are, how to set up an endpoint, how to configure events, how to test
- The test webhook button already calls `sendTestWebhook` which invokes the edge function — this works

## 2. Mobile Width Fix — Transaction History + Promo Button Padding

**Problem (Transaction History)**: The card at `TransactionHistory.tsx` line 261 uses `bg-card/60` but the table on desktop (`hidden md:block`) and mobile timeline have no explicit `overflow-x-hidden` or `max-w-full` constraint. On mobile, the amount text with long numbers can cause overflow.

**Fix** in `src/components/billing/TransactionHistory.tsx`:
- Add `overflow-x-hidden` to the root Card
- Add `w-full max-w-full` to the card and content areas
- Ensure the mobile timeline cards use `overflow-hidden` on the description text

**Problem (Promo button)**: The "Create Promo" button in `PromoManagement.tsx` line 272 has default padding, needs reducing for mobile.

**Fix** in `src/pages/panel/PromoManagement.tsx`:
- Change button to `<Button className="gap-2 px-3 md:px-4" size="sm">` for reduced padding on mobile

## 3. Desktop Bulk Select Overflow — Customer Page

**Problem**: The `BulkActionToolbar` (line 45-47 of `BulkActionToolbar.tsx`) uses `fixed bottom-6 left-1/2 -translate-x-1/2` with a flex row of 8+ buttons. On desktop/tablet, this bar doesn't have `max-w-[calc(100vw-2rem)]` or overflow handling, causing it to break out of container.

**Fix** in `src/components/customers/BulkActionToolbar.tsx`:
- Add `max-w-[calc(100vw-2rem)]` and `overflow-x-auto` to the inner div
- Add `flex-wrap` for tablet breakpoints or use `scrollbar-hide` pattern

## 4. Customer Detail Page — Reduce Fragment/Card Sizes & Curves

**Problem**: The `CustomerDetailPage.tsx` Sheet at line 338 uses `sm:max-w-xl`. The stats cards (lines 375-412) use `text-xl font-bold` and the cards have no rounded corners configured. The overall layout feels large.

**Fix** in `src/components/customers/CustomerDetailPage.tsx`:
- Reduce Sheet width to `sm:max-w-md`
- Reduce stats card padding from `p-3` to `p-2.5`
- Reduce text sizes from `text-xl` to `text-lg`
- Add `rounded-xl` to all stat cards
- Reduce Avatar from `h-10 w-10` to `h-9 w-9`
- Reduce border widths (border-2 → border)
- Tighten spacing in the form sections

## 5. Notification Type Detection Fix

**Problem**: The `notify_on_payment` database function (line ~831 in DB functions) creates notifications with `type: 'info'` and title `'Payment Received'` for ALL payment status changes. When a user pays for ads or subscription, it still shows "Payment Received" instead of the correct type.

The real issue is in `use-notifications.tsx` `mapDbTypeToNotificationType` (line 17-27) — it maps correctly. But the INSERT at `ManualTransferDialog.tsx` and the DB trigger `notify_on_payment` both set `type: 'info'` instead of `'payment'`.

Additionally, the `getActionUrlFromType` function (lines 29-54) checks title text for routing. The ad purchase notifications need to route to `/panel/promote` but there's no check for "ad" or "promotion" in the title.

**Fix**:
- In `src/hooks/use-notifications.tsx`: Add routing rules for ad purchases (`lowTitle.includes('ad') || lowTitle.includes('promotion')` → `/panel/promote`)
- In `src/components/billing/ManualTransferDialog.tsx`: Change notification type from `'info'` to `'payment'`
- The DB trigger `notify_on_payment` sets `type: 'info'` — this can't be changed without a migration, so add title-based detection in `getActionUrlFromType` as a workaround

## 6. Panel Switcher — Facebook-Style Mobile Header

**Problem**: The `PanelSwitcher` component exists but is only in the desktop sidebar footer (line 367 of `PanelOwnerDashboard.tsx`). On mobile, there's no panel switcher — the mobile header (lines 441-461) only has the logo, notification, and theme toggle.

**Fix** in `src/pages/PanelOwnerDashboard.tsx`:
- Add `PanelSwitcher` to the mobile header, positioned either left or right of the logo
- Use a compact avatar-only dropdown on mobile (reuse `collapsed` mode from PanelSwitcher)
- Place it on the left side (next to logo) for Facebook-style feel

## 7a. New Panel Creation Redirect Bug

**Problem**: When clicking "Create New Panel" from the PanelSwitcher, it navigates to `/panel/onboarding?new=true`. But the onboarding page (`PanelOnboarding.tsx` line 83-121) reads `isNewPanel` from URL params. The issue is that this page is NOT a route in `PanelOwnerDashboard.tsx` — it's a separate page. However, the dashboard layout wraps all `/panel/*` routes. The onboarding page is accessed via the router in `App.tsx` as a separate route.

Let me check the routing:

The `PanelSwitcher` navigates to `/panel/onboarding?new=true`, but this route may not exist. In `PanelOwnerDashboard.tsx`, there's no route for "onboarding". The onboarding page is likely at the root level in `App.tsx`.

**Fix**: Check that `/panel/onboarding` route exists in `App.tsx`. If not, add it. The `isNewPanel` detection from `useSearchParams` should work.

## 7b. TXT Record Showing "Verified" When Not Verified

**Problem**: The `DNSVerificationProgress` component (line 73-77) sets ALL records to `'verified'` when `data.dns_ok` is true — including TXT. But `dns_ok` means A/CNAME records point correctly, NOT that TXT ownership was verified. So the TXT record shows "Verified" even when the actual `_smmpilot` TXT record hasn't been added at the registrar.

Also, the edge function `domain-health-check` checks TXT records on the root domain (`coouconnect.site`), but the UI tells users to add TXT at `_smmpilot.coouconnect.site`. The function never looks up `_smmpilot.domain` specifically.

**Fix**:
- Update `supabase/functions/domain-health-check/index.ts` to accept `check_type` and `verification_token` params. When `check_type === 'txt'`, resolve `_smmpilot.{domain}` TXT records and check for `smmpilot-verify={token}`. Return `txt_ok: true/false`.
- Update `src/components/domain/DNSVerificationProgress.tsx` to NOT mark TXT as verified based on `dns_ok` — TXT verification should be separate from DNS verification. Only mark TXT as verified if the domain's `verification_status !== 'txt_pending'`.
- In `DomainSettings.tsx` `verifyTxtRecord`, pass `verification_token` to the edge function so it can match the specific token.

## Files to Change

| File | Change |
|------|--------|
| `src/pages/panel/APIManagement.tsx` | Persist webhook config to `panel_settings`; add FAQ guide |
| `src/components/billing/TransactionHistory.tsx` | Add overflow constraints for mobile |
| `src/pages/panel/PromoManagement.tsx` | Reduce "Create Promo" button padding |
| `src/components/customers/BulkActionToolbar.tsx` | Add max-width and overflow handling |
| `src/components/customers/CustomerDetailPage.tsx` | Reduce card sizes, curves, spacing |
| `src/hooks/use-notifications.tsx` | Fix type detection and routing for ads/payments |
| `src/components/billing/ManualTransferDialog.tsx` | Set notification type to 'payment' |
| `src/pages/PanelOwnerDashboard.tsx` | Add PanelSwitcher to mobile header |
| `supabase/functions/domain-health-check/index.ts` | Add TXT-specific verification with subdomain lookup |
| `src/components/domain/DNSVerificationProgress.tsx` | Fix TXT status display logic |
| `src/pages/panel/DomainSettings.tsx` | Pass verification_token to edge function; fix multi-panel `.maybeSingle()` |

