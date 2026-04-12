

# Plan: Buyer Onboarding Tour Enhancement, Theme Light/Dark Fix, Bulk Selector Mobile Fix

## 1. Enhance Buyer Onboarding Tour with Auto-Start + Bottom Nav Page Highlighting

**Problem**: The tour exists but never auto-starts (auto-start code is commented out). Bottom nav items in buyer dashboard don't get highlighted during tour steps like panel dashboard does.

**Changes in `src/components/buyer/BuyerOnboardingTour.tsx`**:
- Uncomment auto-start logic (line 138) so first-time buyers see the tour automatically
- Add a `useEffect` that, on each step with a `selector`, programmatically scrolls/highlights the matching bottom nav item by adding a temporary `data-tour-active` attribute
- Enhance the welcome step with buyer's name from `useBuyerAuth`
- Add a profile-specific step (profile page) to make it a "profile tour"

**Changes in `src/pages/buyer/BuyerLayout.tsx`**:
- Add `data-tour` attributes to each bottom nav `<Link>` matching the tour selectors, so the spotlight correctly highlights them
- Ensure tour selectors match the actual bottom nav href patterns (currently `[href='/dashboard']` etc. -- verify these match)

## 2. Fix Light/Dark Mode Conflict Between ThemeProvider and BuyerThemeContext

**Problem**: Both `ThemeProvider` (in `use-theme.tsx`) and `BuyerThemeProvider` (in `BuyerThemeContext.tsx`) fight over `document.documentElement` class. When ThemeProvider runs its effect (line 81-98 of use-theme.tsx), it removes and re-adds classes, potentially overriding BuyerThemeProvider's choice. This causes design customization colors (which are scoped via `.dark .buyer-theme-wrapper` and `.light .buyer-theme-wrapper` CSS selectors in `color-utils.ts`) to break.

**Root cause**: ThemeProvider fetches admin's theme from `profiles` table (line 56-78) and applies it globally. On buyer pages, BuyerThemeProvider sets the theme but ThemeProvider can override it moments later.

**Fix in `src/hooks/use-theme.tsx`**:
- Add a check: if the current route is a buyer/tenant page (detect via `buyer-theme-wrapper` class or a context flag), skip applying theme to DOM -- let BuyerThemeProvider handle it
- Or: scope ThemeProvider's DOM effect to only apply when NOT inside a BuyerThemeProvider

**Fix in `src/contexts/BuyerThemeContext.tsx`**:
- Dispatch a `buyer-theme-active` event on mount and cleanup on unmount
- ThemeProvider listens for this and defers DOM manipulation when buyer theme is active

**Fix in `src/lib/color-utils.ts`**:
- Ensure CSS selectors for light mode use `:root.light .buyer-theme-wrapper` specificity to prevent being overridden by the global theme class race

## 3. Fix Bulk Selector UI for Mobile/Tablet in Customer & Order Management

**Problem (Image 1 - Customer Management)**: The `BulkActionToolbar` at `bottom-20` overlaps with bottom nav on mobile. Toolbar buttons are too small and not properly centered.

**Problem (Image 2 - Order Management)**: The bulk action bar at `bottom-20` with the select dropdown and "Apply" button is cut off and not properly padded on mobile.

**Fix in `src/components/customers/BulkActionToolbar.tsx`**:
- Change `bottom-20` to `bottom-24` to clear the bottom nav properly
- Add `px-4` padding and ensure the toolbar is centered with proper `max-w-[calc(100vw-2rem)]`
- Increase button sizes on mobile from `h-7 w-7` to `h-9 w-9` for better tap targets
- Add label text below icons on tablet+ (`sm:` breakpoint)

**Fix in `src/pages/panel/OrdersManagement.tsx`** (lines 670-710):
- Change `bottom-20` to `bottom-24` on the bulk action bar
- Improve mobile layout: stack the "X selected" label, select dropdown, and "Apply" button vertically on very small screens
- Add proper padding `px-4` and ensure the bar doesn't overflow
- Increase the select and button heights for better mobile tappability

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/buyer/BuyerOnboardingTour.tsx` | Auto-start for first-time buyers; add profile step; enhance welcome with buyer name |
| `src/pages/buyer/BuyerLayout.tsx` | Add `data-tour` attributes to bottom nav links for spotlight targeting |
| `src/hooks/use-theme.tsx` | Add buyer-theme-active guard to prevent overriding buyer theme |
| `src/contexts/BuyerThemeContext.tsx` | Dispatch buyer-theme-active flag on mount/unmount |
| `src/lib/color-utils.ts` | Strengthen CSS specificity for light/dark scoping |
| `src/components/customers/BulkActionToolbar.tsx` | Fix positioning, padding, button sizes for mobile |
| `src/pages/panel/OrdersManagement.tsx` | Fix bulk action bar mobile positioning and sizing |

