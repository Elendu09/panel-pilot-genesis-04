

# Plan: Multi-Panel Architecture — ✅ Implemented

## Architecture

```text
User → Profile (active_panel_id) → N Panels
  Free: 1 panel
  Basic: 2 panels (1 registered + 1 free)  
  Pro: 5 panels (1 registered + 4 free)
```

## Changes Made

### Database
- Added `active_panel_id` (uuid, FK to panels) to `profiles` table
- Index on `profiles.active_panel_id`

### `src/hooks/usePanel.tsx`
- Fetches ALL panels for owner (not `.single()`)
- Selects active panel via `profile.active_panel_id` or first completed panel
- Exports `switchPanel()`, `canCreatePanel()`, `getMaxPanels()`, `allPanels`
- `PANEL_LIMITS` constant: free=1, basic=2, pro=5

### `src/components/panel/PanelSwitcher.tsx`
- Dropdown panel switcher (Facebook-style)
- Shows all panels with active indicator
- "Create New Panel" option (gated by tier limit)
- Collapsed mode for narrow sidebar
- Reloads page on switch to refresh all data

### `src/pages/PanelOwnerDashboard.tsx`
- Integrated PanelSwitcher in sidebar footer
- Works in both expanded and collapsed sidebar states

### `src/pages/panel/PanelOnboarding.tsx`
- Supports `?new=true` query param to skip redirect-to-panel check
- Uses `.maybeSingle()` with subdomain filter instead of `.single()`
- Sets `active_panel_id` on profile after panel creation

### `src/pages/Auth.tsx`
- Checks for `onboarding_completed = true` panels specifically
