

# Plan: Transaction Redesign, Customer Mobile Fix, Panel Name Sync, Add Customer Validation

## 1. Transaction History — Remove Duplicate Title + Redesign Stats + Tabs

**`src/pages/panel/TransactionHistoryPage.tsx`**
- Remove the page-level `<h1>Transaction History</h1>` block (lines 21-27) since `TransactionHistory` component already has its own CardTitle "Transaction History" — this eliminates the duplicate

**`src/components/billing/TransactionHistory.tsx`**
- **Stats cards**: Replace "Total In / Total Out / Net" with "Total / Completed / Failed" using counts:
  - Total = all transactions count
  - Completed = transactions where `status === 'completed'` or `!status`, with green color
  - Failed = transactions where `status === 'failed'`, with red color
- **Tab redesign**: Replace the `TabsList` with pill-style filter buttons using colored dots/indicators:
  - All (neutral), Deposits (green dot), Subs (blue dot), Commission (purple dot), Ads (amber dot)
  - Use `Button` variants with colored left-border or dot indicators instead of generic Tabs
- **Status colors**: Ensure consistent color coding: green = completed, yellow/amber = pending, red = failed
- **Mobile responsiveness**: Ensure the summary stats grid uses `grid-cols-3` on mobile with smaller text

## 2. Customer Page — Mobile List/Grid Toggle + Desktop Table Fix

**`src/pages/panel/CustomerManagement.tsx`**
- **Mobile view toggle**: Add a List/Grid toggle visible only on mobile (`md:hidden`) near the search bar area (line ~882-892). On mobile:
  - "List" mode = current table-style compact rows (lines 1182-1233)
  - "Grid" mode = `CustomerMobileCard` grid layout
- Add state `mobileViewMode: 'list' | 'grid'` (default: 'list')
- **Desktop table fix**: The desktop table (line 984) has `hidden md:block` — this is correct. But when `viewMode === 'grid'`, the grid also has `hidden md:grid`. The issue is that on mobile, neither table nor grid shows when `viewMode === 'table'` because the mobile section (line 1182) always shows regardless of viewMode. This is actually correct — mobile always shows the mobile-specific view. The user wants a toggle on mobile to switch between list and grid.
- **Desktop "all" filter unresponsiveness**: The stat cards set `statusFilter` which filters `filteredCustomers`. Verify the table renders all `filteredCustomers` — it does. The issue might be that buttons in dropdown actions don't work. Check `handleViewDetails` — it opens a Sheet. This should work. No code bug found here; the existing actions work.

## 3. Panel Name Not Updating on Storefront — Initial Load Sync

**`src/hooks/useTenant.tsx`** (line ~487-491)
- The realtime handler (line 560-561) correctly syncs `companyName` with `panel.name`, but the **initial data fetch** at line 487-491 does NOT sync:
  ```
  custom_branding: branding && typeof branding === 'object' ? branding as DesignCustomization : undefined,
  ```
- Fix: When building `resolvedPanel`, also sync `companyName`:
  ```
  const syncedBranding = branding && typeof branding === 'object'
    ? { ...branding, companyName: panelData.name } as DesignCustomization
    : undefined;
  ```
- This ensures that even if `custom_branding.companyName` was set to an old name, the initial load always uses `panelData.name`

## 4. Add Customer Dialog — Enhanced Design

**`src/components/customers/AddCustomerDialog.tsx`**
- Make dialog responsive: change `sm:max-w-lg` to `sm:max-w-xl` for more breathing room
- Add step indicator (1/2 dots) for form vs success states
- Add avatar preview with initials next to the name field
- Improve credential section: add a colored info banner explaining auto-generation
- Better mobile layout: stack grid-cols-2 fields to grid-cols-1 on very small screens
- Add input validation visual feedback (red border on invalid email)
- The edge function `panel-customers` works correctly — it hashes passwords, checks duplicates, and creates the user. No backend fix needed.

## 5. Buyer API URL — Custom Domain Support

**`src/pages/panel/APIManagement.tsx`** (lines 114-119)
- Current logic already handles custom domain:
  ```
  const buyerApiUrl = panel?.custom_domain
    ? `https://${panel.custom_domain}/api/v2`
    : panel?.subdomain
      ? `https://${panel.subdomain}.smmpilot.online/api/v2`
      : `https://yourpanel.smmpilot.online/api/v2`;
  ```
- This is correct. Custom domain takes priority, subdomain falls back to `.smmpilot.online`. No change needed here.

## Files to Change

| File | Change |
|------|--------|
| `src/pages/panel/TransactionHistoryPage.tsx` | Remove duplicate "Transaction History" heading |
| `src/components/billing/TransactionHistory.tsx` | Replace stats with Total/Completed/Failed counts; redesign tabs with colored pill buttons; ensure mobile responsiveness |
| `src/pages/panel/CustomerManagement.tsx` | Add mobile List/Grid toggle (`md:hidden`); use `mobileViewMode` state |
| `src/hooks/useTenant.tsx` | Sync `companyName` with `panelData.name` on initial fetch (line ~487) |
| `src/components/customers/AddCustomerDialog.tsx` | Enhanced responsive design with step indicator, avatar preview, better mobile layout |

