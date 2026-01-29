
# Plan: Fix TGRef Theme Mobile Language Selector Page Shrink Issue

## Problem Analysis

From the screenshot, when clicking the language selector on mobile in the TGRef theme, the page shrinks/breaks. This is caused by:

1. **Dropdown width overflow**: The `DropdownMenuContent` has `className="w-56"` (224px fixed width)
2. **Alignment issue**: Using `align="end"` positions the dropdown to the right edge of the trigger, which on mobile can push the dropdown outside the viewport
3. **Font-mono styling**: TGRef theme uses monospace fonts which can affect width calculations
4. **No overflow constraints**: The dropdown can exceed viewport bounds, causing horizontal scroll and page shrink

## Root Cause

In `src/components/buyer/LanguageSelector.tsx` line 108:
```tsx
<DropdownMenuContent 
  align="end" 
  side="bottom" 
  sideOffset={8} 
  className="w-56 max-h-80 overflow-y-auto bg-popover border border-border shadow-lg z-[100]"
>
```

The fixed `w-56` width combined with `align="end"` causes the dropdown to extend past the right edge of the viewport on narrow mobile screens.

## Solution

### Fix 1: Add viewport-safe width constraints to LanguageSelector

Update the DropdownMenuContent to:
- Add `max-w-[calc(100vw-1rem)]` to prevent horizontal overflow
- Change alignment from `align="end"` to `align="start"` on mobile (or keep `align="end"` but add collision padding)
- Add `collisionPadding={8}` prop to Radix to prevent edge overflow

**File:** `src/components/buyer/LanguageSelector.tsx`

```tsx
<DropdownMenuContent 
  align="end" 
  side="bottom" 
  sideOffset={8}
  collisionPadding={16}
  className="w-56 max-w-[calc(100vw-2rem)] max-h-80 overflow-y-auto bg-popover border border-border shadow-lg z-[100]"
>
```

### Fix 2: Add modal prop to prevent scroll/focus issues

Add `modal={false}` to the DropdownMenu root to prevent scroll locking that can cause layout shifts:

```tsx
<DropdownMenu modal={false}>
```

### Fix 3: Add overflow-x-hidden to the page wrapper

In the TGRef theme wrapper, add overflow constraints to prevent horizontal scrolling when dropdowns open:

**File:** `src/components/buyer-themes/BuyerThemeTGRef.tsx`

Add to the wrapper div:
```tsx
<div className={cn(
  "buyer-theme-tgref buyer-theme-wrapper min-h-screen overflow-x-hidden",
  className
)}>
```

### Fix 4: Ensure navigation container doesn't clip dropdown portal

The ThemeNavigation already has `overflow-visible` on the mobile container, but ensure the header itself doesn't create a stacking context that clips the portal.

**File:** `src/components/buyer-themes/shared/ThemeNavigation.tsx`

Ensure the header has proper z-index and overflow handling:
```tsx
<header className="overflow-visible">
  <nav className="relative z-50 overflow-visible" ...>
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/buyer/LanguageSelector.tsx` | Add `modal={false}`, `collisionPadding={16}`, and `max-w-[calc(100vw-2rem)]` to prevent viewport overflow |
| `src/components/buyer-themes/BuyerThemeTGRef.tsx` | Add `overflow-x-hidden` to wrapper div |
| `src/components/buyer-themes/shared/ThemeNavigation.tsx` | Ensure header has `overflow-visible` class |

## Technical Details

### Why this fixes the issue:

1. **collisionPadding**: Radix UI's DropdownMenu supports `collisionPadding` which prevents the dropdown from being positioned too close to viewport edges

2. **max-w constraint**: Limits dropdown width to viewport minus padding, preventing horizontal overflow

3. **overflow-x-hidden on wrapper**: Prevents any accidental horizontal scroll that could cause the "shrink" effect

4. **modal={false}**: Prevents scroll locking behavior that can interfere with layout on mobile

## Testing Checklist

After implementation:
- [ ] Open TGRef theme storefront on mobile (or mobile viewport in browser)
- [ ] Click language selector - page should NOT shrink
- [ ] Dropdown should appear within viewport bounds
- [ ] Selecting a language should work correctly
- [ ] Hamburger menu should still work correctly
- [ ] Test on other themes to ensure no regression
