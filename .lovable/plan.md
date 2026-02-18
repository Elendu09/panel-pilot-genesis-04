

# Fix Plan: Transaction History Page, Transaction Status Updates, and SEO Isolation

## Issue 1: Move Transaction History from Billing to Its Own Page

**Current state:** The Billing page (`src/pages/panel/Billing.tsx`) contains both subscription/balance management AND transaction history. This makes the page cluttered and hard to navigate.

**Plan:**
- Create a new page `src/pages/panel/TransactionHistoryPage.tsx` that wraps the existing `TransactionHistory` component with proper page layout and Helmet tags
- Remove the Transaction History section (lines 509-523) from `Billing.tsx` and update the subtitle to focus on subscriptions and balance
- Add route `"transactions"` in `PanelOwnerDashboard.tsx` routing
- Add "Transactions" nav item to the sidebar in `PanelOwnerDashboard.tsx` (under main navigation, next to Orders)
- Add "Transactions" to `MoreMenu.tsx` for mobile access

## Issue 2: Transaction Approve/Reject Not Updating (Critical RLS Bug)

**Root cause discovered:** The `transactions` table has **NO UPDATE RLS policy**. Only SELECT and INSERT policies exist. When the panel owner clicks "Approve" or "Reject" in `TransactionKanban.tsx`, the `supabase.from('transactions').update({ status: newStatus })` call silently fails because RLS blocks the UPDATE.

The balance IS being credited because the `client_users` table has a proper UPDATE policy for panel owners. But the transaction record stays "pending" forever.

**Fix:** Add a database migration with an UPDATE RLS policy:
```sql
CREATE POLICY "Panel owners can update their buyer transactions"
  ON transactions FOR UPDATE
  USING (
    panel_id IN (
      SELECT panels.id FROM panels
      WHERE panels.owner_id IN (
        SELECT profiles.id FROM profiles
        WHERE profiles.user_id = auth.uid()
      )
    )
  );
```

**Why buyer doesn't see it in "Recent Deposits":** The real-time subscription in `BuyerDeposit.tsx` listens for transaction changes and checks `buyer_id` or `user_id`. Since the UPDATE never actually persists (due to missing RLS policy), the status never changes from "pending" to "completed", so the buyer never gets the "Payment Successful" toast or sees the updated status. Once the RLS fix is applied, the existing real-time subscription code will work correctly.

## Issue 3: SEO -- Same Title/Description on All Pages

**Root cause:** The `index.html` still has a hardcoded `<title>` tag (line 35) and `<meta name="description">` (line 36). In a Vercel-hosted SPA, these are the initial HTML tags that crawlers see. While React Helmet does update them client-side, crawlers (especially non-JS ones like Bing, Ahrefs, Seobility) only see the initial HTML.

The `data-platform-only` attribute only helps with tenant domain cleanup. For the **platform's own pages** (About, Blog, Privacy, etc.), the `<title>` and `<meta name="description">` in `index.html` are NOT removed -- they persist as the "base" values until React Helmet overrides them in the browser. But crawlers that don't execute JS (or have limited JS execution) will always see the homepage title/description.

**This is a fundamental SPA limitation on Vercel** -- without server-side rendering (SSR), all routes serve the same `index.html`. The solution is to make the initial `index.html` tags as generic as possible so they don't conflict:

- Change the `<title>` from the homepage-specific title to a generic brand title: `HOME OF SMM`
- Change the `<meta name="description">` to a shorter generic brand description: `HOME OF SMM - Create, manage, and grow your SMM panel business.`
- Each page's Helmet will then override with its specific title/description for JS-enabled crawlers (Google, most modern crawlers)
- The `<noscript>` block retains the full homepage content for non-JS crawlers visiting the root `/` path

This way, even if a crawler sees the base HTML, it gets a neutral brand name rather than a misleading homepage-specific title on the About or Blog pages.

Additionally, the `Index.tsx` Helmet sets `author`, `publisher`, `copyright`, `language`, `robots`, `revisit-after`, `distribution`, `rating`, `geo.region`, `geo.placename`, `format-detection`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title` -- these are generic tags that duplicate what's in `index.html`. They should be removed from `Index.tsx` Helmet since they're already in `index.html` and don't change per-page. This keeps the Helmet clean and focused on page-specific SEO only.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/panel/TransactionHistoryPage.tsx` | **NEW** -- Standalone page wrapping `TransactionHistory` component |
| `src/pages/panel/Billing.tsx` | Remove Transaction History section (lines 509-523), remove `TransactionHistory` import |
| `src/pages/PanelOwnerDashboard.tsx` | Add route and nav item for `/panel/transactions` |
| `src/pages/panel/MoreMenu.tsx` | Add "Transactions" to mobile more menu |
| `index.html` | Change `<title>` to generic `HOME OF SMM`, change description to generic brand line |
| `src/pages/Index.tsx` | Remove duplicate generic meta tags from Helmet (keep only page-specific SEO tags) |
| **Database migration** | Add UPDATE RLS policy on `transactions` table for panel owners |

