

# Plan: Fix Social Icon Fill Colors in Light Mode, Fix Bulk Action Mobile Responsiveness

## Issues

### 1. Previous Plans Verification
All 10 previously discussed plans appear to have been implemented based on code analysis. The key changes (promo code server validation, mass order textarea rewrite, service ID display fix, dashboard panelId fix, SEO meta cleanup, cart edge function routing, theme isolation) are all present in the codebase.

### 2. Social Icon SVG Fill in Light Mode
**Problem**: The icons use `fill="currentColor"` which inherits from the CSS `color` property. The render sites (BuyerNewOrder, FastOrderSection, BuyerServices, ServicesManagement) already pass `className="text-white"` to the icon components. However, in `BuyerServices.tsx` line 496, when a category pill is **active**, the icon gets `text-current` instead of `text-white` — on a `bg-primary` background with `text-primary-foreground`, this might render correctly. 

The real issue is likely in places where the icon is rendered **without** `text-white` on a colored background. Looking at the network pill rendering and service list items — the icon sits inside a colored `bgColor` container but in some cases inherits `text-foreground` (which is black in light mode) instead of `text-white`. Need to audit all icon render sites and ensure every icon inside a colored background div has explicit `text-white`.

**Fix**: Search all buyer/storefront pages for icon renders that lack `text-white` when placed on colored backgrounds. The main suspects are category pills in service lists and any icon that uses `fill="currentColor"` without explicit white text class.

### 3. Customer Management Bulk Toolbar — Mobile Overflow (Screenshot 1)
**Problem**: `BulkActionToolbar.tsx` uses `max-w-fit` which on a 420px screen causes the toolbar to extend beyond viewport despite `w-[calc(100vw-1.5rem)]`. The `overflow-x-auto scrollbar-hide` should allow horizontal scrolling, but the container itself may be too wide and the page stretches.

**Fix**: Change the outer container to use `max-w-[calc(100vw-2rem)]` instead of `max-w-fit`, ensuring it never exceeds screen width. Reduce button sizes on mobile (`h-7 w-7` instead of `h-8 w-8`), reduce gaps and padding further. This forces scrolling within the toolbar rather than page overflow.

### 4. Orders Management Bulk Bar — Mobile Layout (Screenshot 2)  
**Problem**: The orders bulk bar at line 665 uses `max-w-lg` (32rem = 512px) which exceeds 420px viewport. The `flex-col sm:flex-row` layout works but the inner content with Select + Button + Close is too wide on mobile.

**Fix**: Change `max-w-lg` to `max-w-[calc(100vw-2rem)]`. The Select dropdown should take full width on mobile. Reduce padding from `p-3` to `p-2` on mobile.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/customers/BulkActionToolbar.tsx` | Change `max-w-fit` → `max-w-[calc(100vw-2rem)]`; reduce mobile button sizes to `h-7 w-7`; reduce padding |
| `src/pages/panel/OrdersManagement.tsx` | Change bulk bar `max-w-lg` → `max-w-[calc(100vw-2rem)]`; reduce mobile padding |
| `src/pages/buyer/BuyerServices.tsx` | Ensure all icon renders on colored backgrounds use `text-white` explicitly |
| `src/components/storefront/FastOrderSection.tsx` | Audit and fix any icon renders missing `text-white` on colored backgrounds |
| `src/pages/buyer/BuyerNewOrder.tsx` | Audit and fix any icon renders missing `text-white` on colored backgrounds |
| `src/pages/panel/ServicesManagement.tsx` | Fix line 2537 where category icon in sidebar lacks `text-white` |

