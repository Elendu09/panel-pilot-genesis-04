

# Plan: Fix Multi-Panel Bugs, Account-Level Billing, Mobile Responsiveness, and Panel Isolation

## Issues Identified

1. **PanelSwitcher mobile header**: Shows "Switch Panel (2/1)" — tier detection shows max 1 even on Basic plan. The switcher trigger is just an avatar icon with no separator stroke or active panel name below header text.
2. **Account-Level Billing Model**: Currently tier is per-panel (`subscription_tier` on panels table). Need to shift to account-level: account has one plan, all panels inherit features, downgrade locks excess panels.
3. **SubdomainPreview**: Hardcodes `subdomain.smmpilot.online` — ignores `custom_domain`.
4. **OnboardingDomainStep mobile**: "Register new domain" section has width overflow (search input + TLD select don't wrap).
5. **OnboardingDomainStep**: No TXT verification in the onboarding flow — only A/CNAME shown, no TXT step enforced.
6. **Complete step**: Only shows subdomain in summary, not custom domain properly.
7. **GeneralSettings**: Uses `.single()` on line 152 (`panels` query by `owner_id`) — breaks for multi-panel users. Shows "Failed to load settings" error.
8. **New panel data isolation**: When creating a second panel, GeneralSettings and other pages that use `.single()` will fetch wrong panel or crash.

## Changes

### 1. PanelSwitcher — Facebook-style with divider stroke + active panel name

**`src/pages/PanelOwnerDashboard.tsx`** (lines 441-455):
- Add a thin vertical divider (1px border-right, gray) between PanelSwitcher and "HOME OF SMM" text
- Below "HOME OF SMM", add active panel name in `text-[9px]` muted text

**`src/components/panel/PanelSwitcher.tsx`** (line 29):
- Remove early return when `allPanels.length <= 1 && !canCreatePanel()` — always show the switcher on mobile so users see which panel is active

### 2. Account-Level Billing Model

**`src/hooks/usePanel.tsx`**:
- The tier resolution already queries `panel_subscriptions` for the highest tier — this is correct for account-level billing
- Add `resolvedTier` to the return value so components can access it
- Add `lockedPanels` computed property: panels beyond the tier limit (sorted by `created_at` desc) are "locked"
- Expose `isPanel Locked(panelId)` helper

**`src/components/panel/PanelSwitcher.tsx`**:
- Show locked panels with a lock icon and "Upgrade to reactivate" tooltip
- Prevent switching to locked panels

**`src/pages/PanelOwnerDashboard.tsx`**:
- If active panel is locked (after downgrade), show a banner: "This panel is locked. Upgrade your plan to reactivate."

### 3. SubdomainPreview — detect custom domain

**`src/components/panel/SubdomainPreview.tsx`**:
- Accept optional `customDomain` prop
- If `customDomain` is set and non-empty, use `https://{customDomain}` as `storefrontUrl` instead of subdomain URL
- Update URL bar display and iframe src accordingly

**`src/pages/panel/PanelOverview.tsx`**:
- Pass `panel.custom_domain` to `SubdomainPreview`

### 4. OnboardingDomainStep mobile responsiveness

**`src/components/onboarding/OnboardingDomainStep.tsx`** (lines 448-469):
- Change the domain search input + TLD select from `flex gap-2` to `flex flex-col sm:flex-row gap-2`
- Make TLD select `w-full sm:w-[100px]`
- Add `overflow-hidden` to the parent container

### 5. OnboardingDomainStep — add TXT verification display

**`src/components/onboarding/OnboardingDomainStep.tsx`**:
- The TXT record IS already shown (lines 369-385) when `verificationToken` is set
- The issue is that `handleDomainSubmit` calls `add-vercel-domain` which may not always return a verification token
- Add a fallback: if no token returned, generate one client-side (`crypto.randomUUID().slice(0,12)`) and display it
- The "Check DNS" button already calls `verify-domain-dns` with the expected TXT value

### 6. Complete step — show custom domain in summary

**`src/pages/panel/PanelOnboardingV2.tsx`** (lines 1062-1076):
- Already handles this correctly — shows `customDomain` when `domainType !== 'subdomain'`
- No change needed here

### 7. GeneralSettings — fix `.single()` for multi-panel

**`src/pages/panel/GeneralSettings.tsx`** (lines 148-152):
- Replace `.eq('owner_id', profile.id).single()` with active panel resolution:
  - First get `active_panel_id` from profile
  - Query panel by ID if available, otherwise get first completed panel
- This ensures multi-panel users always load settings for the correct active panel

### 8. Panel data isolation — audit other pages using `.single()` on panels

Search for other pages that query `panels` with `owner_id` + `.single()` and fix them to use `active_panel_id` or the panel context.

**Files to search and fix**:
- `src/pages/panel/GeneralSettings.tsx` — confirmed broken (line 152)
- Other panel pages that may have the same pattern

## Files to Change

| File | Change |
|------|--------|
| `src/pages/PanelOwnerDashboard.tsx` | Add divider stroke + active panel name in mobile header; add locked panel banner |
| `src/components/panel/PanelSwitcher.tsx` | Always show on mobile; show lock icon for locked panels; display active panel name in collapsed mode |
| `src/hooks/usePanel.tsx` | Expose `resolvedTier`; add `lockedPanels` and `isPanelLocked` helpers |
| `src/components/panel/SubdomainPreview.tsx` | Accept `customDomain` prop; use custom domain URL when available |
| `src/pages/panel/PanelOverview.tsx` | Pass `custom_domain` to SubdomainPreview |
| `src/components/onboarding/OnboardingDomainStep.tsx` | Fix mobile layout for "register new domain"; ensure TXT token fallback |
| `src/pages/panel/GeneralSettings.tsx` | Replace `.single()` with active panel resolution |
| Any other panel pages with `.single()` on `panels` | Same fix pattern |

