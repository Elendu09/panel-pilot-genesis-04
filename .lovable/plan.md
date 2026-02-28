

# Plan: Fix Multi-Panel Tier Detection

## Problem Found
`getMaxPanels()` in `usePanel.tsx` determines panel limits by reading `subscription_tier` from the `panels` table. However, as discovered in the DomainSettings fix, `panels.subscription_tier` can be `null` even for paid users (the billing system updates `panel_subscriptions` but may not always update `panels.subscription_tier`). This means a Basic or Pro user could be blocked from creating additional panels.

## Fix

### `src/hooks/usePanel.tsx` — Fetch actual tier from `panel_subscriptions`
- In `fetchPanels`, after fetching panels, also query `panel_subscriptions` for any active subscription matching any of the user's panel IDs
- Use the highest active subscription's `plan_type` to determine the tier, falling back to `panels.subscription_tier`
- Store the resolved highest tier in state so `getMaxPanels` and `canCreatePanel` use it

### `src/pages/panel/PanelOnboarding.tsx` — Set `subscription_tier: 'free'` for new panels
- Line 292-308: Add `subscription_tier: 'free'` to the insert so additional panels explicitly get 'free' tier instead of `null`

## Files to Change

| File | Change |
|------|--------|
| `src/hooks/usePanel.tsx` | Query `panel_subscriptions` for active plans; use resolved tier in `getMaxPanels` |
| `src/pages/panel/PanelOnboarding.tsx` | Add explicit `subscription_tier: 'free'` to panel insert |

