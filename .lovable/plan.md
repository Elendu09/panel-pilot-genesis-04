

# Plan: Panel Switcher Stroke, Multi-Panel `.single()` Audit Fix, Security Hardening

## 1. PanelSwitcher — Round Stroke Ring + Panel Number Detection

**`src/components/panel/PanelSwitcher.tsx`**:
- Add a circular grey stroke ring around the avatar (like the uploaded image showing a round border/ring around the profile picture) using `ring-2 ring-gray-400` or a custom border
- In the dropdown items, show panel number labels: "Panel 1", "Panel 2" etc., determined by sorting `allPanels` by `created_at` ascending and using the index + 1
- In collapsed mode trigger, add a subtle rotate/switch icon indicator around the avatar ring

**`src/pages/PanelOwnerDashboard.tsx`**:
- Ensure the mobile header PanelSwitcher avatar also gets the round stroke ring styling

## 2. Fix Remaining `.single()` Queries for Multi-Panel Support

Files that still use `.single()` on `owner_id` queries (will break for multi-panel users):

| File | Line | Fix |
|------|------|-----|
| `src/pages/panel/Integrations.tsx` | 462 | Replace `.single()` with active_panel_id resolution pattern |
| `src/pages/panel/DomainSettings.tsx` | 94 | Uses `.maybeSingle()` — but doesn't filter by `active_panel_id`. Add filter. |

All other panel pages (SecuritySettings, SEOSettings, DesignCustomization, GeneralSettings, PanelOverview, ChatInbox) were already fixed in the previous iteration.

## 3. Security Settings — Replace Fake Data with Real Data + Functional Features

**`src/pages/panel/SecuritySettings.tsx`**:

### Fake data to replace:
- **Line 370**: `device` uses hardcoded array `['Chrome on Windows', 'Safari on macOS'...]` — extract from user-agent or store in client_users
- **Line 373**: `location` uses hardcoded array `['United States', 'Germany'...]` — needs real IP geolocation or stored location
- **Lines 380-397**: `securityAlerts` is entirely hardcoded sample data — replace with alerts from `audit_logs` filtered by failed actions

### Functional features to implement:
- **Backup codes** (line 533-540): Currently generates codes with `Math.random()` but only stores in state. Fix: persist backup codes to `panels.settings.security.backupCodes` on generate, and also save on `handleSave`
- **Download backup codes** (line 543-551): Already functional (creates blob download) — keep as-is
- **Session revoke** (line 497-521): Currently just removes from local state array. Should call `supabase.auth.admin.signOut()` or at minimum log the action. The audit log insert IS there but the actual revocation is fake. Add a note that true session revocation requires admin API.
- **Security alerts**: Derive from `audit_logs` — filter for failed logins, new device patterns, settings changes
- **IP/Device/Location**: Store `last_login_ip`, `last_login_device`, `last_login_location` on `client_users` table (need migration). For panel owner sessions, use `navigator.userAgent` for device detection.

### Edge function for security scan:
- Create `security-scan` edge function that checks: password policy compliance, 2FA status, session count, recent failed logins count, and returns a real-time score
- The current score calculation is purely client-side from settings toggles — this is acceptable but should also factor in actual incident data

## 4. Database Migration

Add columns to `client_users` for real device/location tracking:
- `last_login_ip text`
- `last_login_device text`  
- `last_login_location text`

## 5. Security Audit Log Enhancement

Create `security-audit` edge function to:
- Log login attempts with IP, device, location
- Detect suspicious patterns (multiple failed attempts)
- Generate real security alerts stored in a new `security_alerts` table or in `panel_notifications`

## Files to Change

| File | Change |
|------|--------|
| `src/components/panel/PanelSwitcher.tsx` | Add ring stroke around avatar; show panel numbers (Panel 1, Panel 2) |
| `src/pages/PanelOwnerDashboard.tsx` | Ring stroke on mobile header switcher avatar |
| `src/pages/panel/Integrations.tsx` | Fix `.single()` → active_panel_id resolution |
| `src/pages/panel/DomainSettings.tsx` | Add active_panel_id filter to panel query |
| `src/pages/panel/SecuritySettings.tsx` | Replace fake sessions/alerts data with real audit_log-derived data; persist backup codes; real device detection via navigator.userAgent |
| New migration | Add `last_login_ip`, `last_login_device`, `last_login_location` to `client_users` |
| `supabase/functions/security-audit/index.ts` | New edge function for login event logging with IP/device/location |

