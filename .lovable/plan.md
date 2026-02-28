

# Plan: 7 Fixes — Notifications, Customers, Storefront Name, Transactions, API, Shimmer, Balance Layout

## 1. Notification Clear — Add Warning Dialog
**File: `src/components/notifications/NotificationCenter.tsx`**
- Wrap the `clearAll` call (line 150) in an `AlertDialog` confirmation
- Import `AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger` from radix
- Add state `showClearConfirm` and show a destructive warning: "This will permanently delete all notifications. Are you sure?"
- The "Clear" button becomes the trigger; confirm calls `clearAll()`

## 2. Customer Page — Mobile Table View + Remove Card Stroke + Visual Effects
**File: `src/components/customers/CustomerMobileCard.tsx`**
- Remove `border-border/50` from the Card class (removes stroke)
- Add subtle gradient background: `bg-gradient-to-br from-card/80 to-card/40` with `shadow-lg shadow-primary/5`
- Add hover effect and slight scale transform

**File: `src/pages/panel/CustomerManagement.tsx`**
- The table is hidden on mobile (`hidden md:block` at line 984) and grid is also hidden on mobile (`hidden md:grid` at line 1156)
- Mobile only shows `CustomerMobileCard` (line 1182)
- Change mobile section to show a simplified scrollable table instead of cards, matching the screenshot: avatar + name/email, status badge, balance/spent/orders row, last active timestamp
- Keep the card-based approach but redesign to match screenshot layout (name prominent, email below, stats row)
- Remove border stroke from the stats grid divs (`bg-muted/30` → gradient-based)

## 3. Tenant Storefront — Panel Name Not Updating
**Issue**: The `useTenant` realtime subscription correctly updates `panel.name` and `custom_branding`, but the 30s cache can serve stale data on initial load. More critically, some theme components read `customization.companyName` from `custom_branding` which may not have been updated if the user changed the panel name from a place other than GeneralSettings (e.g., onboarding).

**File: `src/hooks/useTenant.tsx`** (line ~553-566)
- In the realtime update handler, also explicitly update `custom_branding.companyName` from `updated.name` to ensure sync:
```
custom_branding: {
  ...(prev.custom_branding || {}),
  ...(updated.custom_branding ? updated.custom_branding : {}),
  companyName: updated.name ?? prev.name, // Always sync
}
```
- This ensures that even if `custom_branding` wasn't updated in the DB, the storefront still shows the new panel name

## 4. Transaction History — Redesign
**File: `src/components/billing/TransactionHistory.tsx`**
- Add summary stats row at top: Total In, Total Out, Net Balance change (calculated from transactions)
- Redesign mobile `TransactionCard`: remove card border, use a timeline-style layout with a colored left indicator line, icon circle, amount right-aligned
- Redesign desktop table: add alternating row colors, row hover gradient effect, type icon in badge
- Add shimmer loading (`<Skeleton themed />`) instead of plain `Loader2` spinner
- Better empty state with illustration-style icon

## 5. API Management — Tenant API Hardcoded Domain
**File: `src/pages/panel/APIManagement.tsx`** (line 115-119)
- The `buyerApiUrl` uses `apiBaseUrl` which resolves to `homeofsmm.com` or `smmpilot.online` depending on current domain
- But the buyer API should use the panel's actual subdomain domain, not the platform root
- Fix: `buyerApiUrl` should be `https://{subdomain}.smmpilot.online/api/v2` using the panel's subdomain directly, not referencing `apiBaseUrl`
- Change line 118 from `${panel.subdomain}.${apiBaseUrl.replace('https://', '')}` to `${panel.subdomain}.smmpilot.online` — actually the logic is correct but the `getPlatformDomain` returns `homeofsmm.com` on production which is wrong for subdomains (subdomains are on `smmpilot.online`)
- Fix: hardcode subdomain suffix to `smmpilot.online` for buyer API since that's where tenant subdomains live

## 6. Panel Dashboard — Replace Spinner with Shimmer Loading
**File: `src/pages/panel/PanelOverview.tsx`** (lines 460-466)
- Replace the `Loader2` spinner with a full shimmer skeleton layout matching the dashboard structure
- Import `Skeleton` component, render themed shimmer blocks for: welcome header card, 4 stats cards grid, quick actions grid, kanban placeholder

## 7. Panel Balance — Reposition Above Subdomain Preview
**File: `src/pages/panel/PanelOverview.tsx`**
- Currently the balance is inside the welcome header card (line 602-614) as part of the right-side action buttons
- Move the balance display OUT of the welcome card and place it as a standalone element BELOW the quick actions and ABOVE the SubdomainPreview section (currently at line 1052)
- Remove the card wrapper (the green gradient border container) — display as a prominent standalone section with just the wallet icon, "Live Balance" indicator, and the dollar amount, without being enclosed in a bordered card
- Position: after quick actions grid, before kanban orders section

## Files to Change

| File | Change |
|------|--------|
| `src/components/notifications/NotificationCenter.tsx` | Add AlertDialog confirmation before clearing all notifications |
| `src/components/customers/CustomerMobileCard.tsx` | Remove border stroke, add gradient/shadow visual effects |
| `src/pages/panel/CustomerManagement.tsx` | Update mobile view to match screenshot design |
| `src/hooks/useTenant.tsx` | Force-sync `companyName` in realtime handler from `updated.name` |
| `src/components/billing/TransactionHistory.tsx` | Redesign with summary stats, timeline mobile cards, shimmer loading |
| `src/pages/panel/APIManagement.tsx` | Fix buyer API URL to use `smmpilot.online` for subdomain resolution |
| `src/pages/panel/PanelOverview.tsx` | Replace loading spinner with shimmer skeleton; move balance above subdomain preview as standalone element |

