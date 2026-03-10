

# Plan: Trial vs Paid Differentiation, Trial Expiry System, Branding Fixes

## Problem Summary

1. **Trial sets paymentCompleted=true** — clicking "Start Free Trial" marks the onboarding as fully paid, showing the green "Paid" badge. This is wrong: trial should show "Trial" status, not "Paid".
2. **No trial expiry handling** — after 3 days, nothing happens. No reminders, no downgrade, no lock.
3. **Billing page doesn't show trial status** — no banner warning about trial countdown, no way to subscribe from locked panel state.
4. **Terms page describes reselling SMM services** — should describe creating/managing SMM panels (platform-as-a-service).
5. **"SMMPilot" branding** still appears in ~10 files (Helmet titles, meta tags, legal text, 2FA downloads).
6. **Panel Not Found pages** have no "Create Panel" link to homeofsmm.com.

---

## 1. Fix Trial vs Paid State in Onboarding

**Root cause**: `onSkip` callback in `PanelOnboardingV2.tsx` (line 797) sets `paymentCompleted: true` and persists it. The `OnboardingPaymentStep` then shows the "Paid" banner.

**Fix**: Introduce a `trialStarted` state separate from `paymentCompleted`.

### Changes to `PanelOnboardingV2.tsx`:
- Add `trialStarted` state alongside `paymentCompleted`
- `onSkip` sets `trialStarted = true` (NOT `paymentCompleted = true`) and persists `{ trialStarted: true, paymentCompleted: false }` in `onboarding_data`
- `markStepComplete` still fires so user can proceed
- `handlePaymentSuccess` sets `paymentCompleted = true, trialStarted = false`
- Pass both `paymentCompleted` and `trialStarted` to `OnboardingPaymentStep`

### Changes to `OnboardingPaymentStep.tsx`:
- Accept new `trialStarted` prop
- When `trialStarted && !paymentCompleted`: show an amber "Trial Active" banner (not green "Paid") with trial end date, and a "Subscribe Now" button
- When `paymentCompleted`: show green "Paid" banner (existing behavior)
- The "Next" button works in both states (trial or paid)
- Remove setting `subscription_status: 'trial'` as "active" subscription status — keep it as `trial`

---

## 2. Trial Expiry & Reminder System

### A. Trial banner on Panel Dashboard
**New component**: `TrialExpiryBanner.tsx`
- Fetches `panel_subscriptions.trial_ends_at` for the active panel
- If trial is active: shows countdown banner ("Your trial ends in X days — Subscribe now")
- If trial expired: shows urgent red banner ("Trial expired — your panel is locked. Subscribe to continue")
- Renders at the top of panel dashboard layout (`PanelLayout` or `PanelOverview`)

### B. Trial expiry enforcement in `usePanel.tsx`
- When fetching panel data, check if `subscription_status === 'trial'` and `trial_ends_at < now`
- If expired: auto-set `subscription_status` to `expired` and `subscription_tier` to `free`
- Mark panel as locked until payment is made

### C. Billing page trial awareness
**Changes to `Billing.tsx`**:
- Show trial badge on "Current Plan" card when `subscription_status === 'trial'`
- Add trial countdown banner at the top with "Subscribe Now" button that triggers `handleUpgrade`
- After trial expiry, the plan cards show "Subscribe" instead of "Upgrade" for the plan they were trialing

---

## 3. Billing Page as Subscription Hub for Locked Panels

Currently if a panel is locked (downgrade or trial expiry), there's no way to subscribe from the billing page.

**Changes to `Billing.tsx`**:
- Detect if panel is locked via `isPanelLocked` from `usePanel`
- Show prominent "Panel Locked" alert with subscribe action
- Plan cards remain functional for subscription even when locked

---

## 4. Terms of Service Rewrite

The Terms page currently describes Home of SMM as an "intermediary between SMM service providers and end users" (reselling). It should describe it as a **platform for creating and managing SMM panels**.

**Changes to `Terms.tsx`**:
- Section 1: "Home of SMM is a platform that enables entrepreneurs to create, manage, and operate their own Social Media Marketing (SMM) panels"
- Section 2: Replace service list with panel creation features — panel setup, service management, team management, payment integration, custom domains, analytics
- Section 3: User responsibilities for panel owners (managing their own buyers, service quality, compliance)
- Section 4: Platform fees, subscription billing, trial periods
- Section 5: Platform availability, uptime commitments
- Section 6: Liability for panel operations vs platform infrastructure
- All references to "SMMPilot" replaced with "Home of SMM"

---

## 5. Branding: Replace "SMMPilot" with "Home of SMM"

Files to update (Helmet titles, meta tags, text content):
| File | Change |
|------|--------|
| `src/pages/Terms.tsx` | Title, canonical, all body text |
| `src/pages/Privacy.tsx` | Title, canonical |
| `src/pages/panel/Billing.tsx` | Helmet title |
| `src/pages/panel/TransactionHistoryPage.tsx` | Helmet title |
| `src/pages/panel/SecuritySettings.tsx` | Helmet title |
| `src/pages/panel/GeneralSettings.tsx` | Helmet title |
| `src/pages/admin/AdminOverview.tsx` | Helmet title |
| `src/pages/admin/PlatformSettings.tsx` | Default settings values |
| `src/components/auth/TwoFactorSetup.tsx` | Backup codes header |
| `src/hooks/use-webhooks.tsx` | Test webhook message |

---

## 6. Panel Not Found — Add "Create Panel" Link

**Changes to `Storefront.tsx`** (Panel Not Found block) and `FastOrder.tsx`:
- Add a "Create Your Own Panel" button/link pointing to `https://homeofsmm.com/auth`
- Styled as secondary action below the error message

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/billing/TrialExpiryBanner.tsx` | **Create** — trial countdown + expiry alert |
| `src/components/onboarding/OnboardingPaymentStep.tsx` | **Modify** — add `trialStarted` prop, show trial vs paid states |
| `src/pages/panel/PanelOnboardingV2.tsx` | **Modify** — separate `trialStarted` from `paymentCompleted` |
| `src/pages/panel/Billing.tsx` | **Modify** — trial awareness, locked panel subscription |
| `src/pages/panel/PanelOverview.tsx` | **Modify** — render `TrialExpiryBanner` |
| `src/hooks/usePanel.tsx` | **Modify** — trial expiry check |
| `src/pages/Terms.tsx` | **Modify** — full rewrite for panel-creation platform |
| `src/pages/Privacy.tsx` | **Modify** — branding fix |
| `src/pages/Storefront.tsx` | **Modify** — add create panel link |
| `src/pages/FastOrder.tsx` | **Modify** — add create panel link |
| ~8 more files | **Modify** — "SMMPilot" → "Home of SMM" in titles/meta |

