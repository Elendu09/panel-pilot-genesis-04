
# Fix Plan: Fast Order "Panel Not Found" Error + Services Visibility

## Problem 1: Fast Order Page -- "Panel Not Found" Error (Screenshot)

**Root Cause:** `FastOrder.tsx` (line 398-402) queries the **`panels` base table** with **`.single()`**. The `panels` table has RLS that only allows **panel owners** to read it. Buyers and anonymous users are blocked by RLS, so `.single()` returns 0 rows and throws `"JSON object requested, multiple (or no) rows returned"`.

**Fix:**
- Change `supabase.from('panels')` to `supabase.from('panels_public')` (the secure public view)
- Change `.single()` to `.maybeSingle()`
- This matches how `useTenant.tsx` already correctly queries panel data

## Problem 2: Services Page and New Order Show No Services

**Database check result:** Your panel `Oshasmm` (id: `8366c7ed...`) has **0 services** in the database -- not just 0 active, but 0 total. This means the services were either never imported successfully, or were deleted. The code is working correctly (the `useUnifiedServices` hook and RLS policies are fine).

**This is a data issue, not a code bug.** You need to re-import services via your Service Management or Provider sync. The code already handles this correctly.

**Code improvement (preventive):** The `useUnifiedServices` hook filters by `is_active = true` but does NOT filter by `is_hidden = false`. This should be added for consistency with FastOrder's query, preventing hidden services from appearing on buyer pages.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/FastOrder.tsx` | Line 399: Change `'panels'` to `'panels_public'`, Line 402: Change `.single()` to `.maybeSingle()` |
| `src/hooks/useUnifiedServices.tsx` | Add `.eq('is_hidden', false)` filter to the services query for consistency |

## Technical Details

**FastOrder.tsx fix (lines 398-402):**
```
// Before (broken):
.from('panels').select(...).eq('id', resolvedPanelId).single()

// After (fixed):
.from('panels_public').select(...).eq('id', resolvedPanelId).maybeSingle()
```

**useUnifiedServices.tsx fix (add filter after `is_active`):**
```
.eq('is_active', true)
.eq('is_hidden', false)  // Add this line
```
