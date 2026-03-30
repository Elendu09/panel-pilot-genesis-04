

# Plan: Enhance Admin Pages, Enable Team Member Invites, Fix Hero Image Across All Themes

## 1. Admin Page Enhancements

### Current State
The admin pages (Overview, Panel Management, User Management, Subscription Management, Revenue Analytics) are functional but could be more polished. The Overview shows a kanban view of panels by status, stats cards, recent activity, and top panels. Panel Management has list/kanban views with edit/suspend capabilities.

### Enhancements
- **AdminOverview**: Add quick-action buttons (approve panel, view user), improve the "Top Panels" section with sparkline mini-charts, add a "Recent Signups" section, and show plan distribution summary (Free/Basic/Pro counts)
- **PanelManagement**: Add bulk actions (approve/suspend multiple), add filtering by plan tier, show tenant user count per panel, add export functionality
- **UserManagement**: Add user activity indicators (last login), add inline balance adjustment, add bulk email capability, improve search with filters (by role, activity status, plan tier)
- **SubscriptionManagement**: Add plan migration stats, add upcoming renewal alerts, show churn rate metric
- **RevenueAnalytics**: Add date range picker, add comparison with previous period, add revenue breakdown by payment method

## 2. Team Management — Remove "Coming Soon", Enable Actual Invites

### Current State
The team invite dialog (lines 396-410 of `TeamManagement.tsx`) has a **hardcoded "Coming Soon" notice** and the submit button is **permanently disabled** (`disabled={true}`). The entire invite infrastructure exists (edge function `team-auth` with `create-member` action, `panel_team_members` table, custom JWT auth) — it's just blocked by the UI.

### Fix
- Remove the "Coming Soon" div (lines 396-402) and the disabled `Coming Soon!` button (lines 403-409)
- Replace with an actual "Add Member" button that calls `handleInvite()` — the function already exists and works (line 286-299)
- Add email validation before submit
- Show loading state while `isInviting` is true

## 3. Hero Image Not Showing in Any Theme

### Root Cause Analysis
**Standard themes (ThemeOne–ThemeFive)**: These pass `customization` to `StorefrontHeroSection`, which reads `customization.enableHeroImage` and `customization.heroImageUrl` (line 129). The `fullCustomization` in `Storefront.tsx` spreads `...design` (which is `panel?.custom_branding`), so these values should be present IF:
1. Panel owner saved them via DesignCustomization (confirmed — saves to `custom_branding` JSON)
2. `useTenant.tsx` fetches `custom_branding` (confirmed — it's in `panelFields`)

The issue is likely that `buyer_theme` is **missing from `panelFields`** in `useTenant.tsx` (line 331-334). Without `buyer_theme`, the theme selection in `Storefront.tsx` falls back to `theme_type` which may select a different theme than intended, causing a mismatch.

**Premium themes (AliPanel, TGRef, FlySMM, SMMStay, SMMVisit)**: These do NOT use `StorefrontHeroSection`. They have custom hero implementations in `src/components/buyer-themes/*/` that completely ignore `enableHeroImage` and `heroImageUrl`. The hero image feature was never propagated to these themes.

### Fix
1. **Add `buyer_theme` to `panelFields`** in `useTenant.tsx` so the correct theme is selected on tenant storefronts
2. **Add hero image support to all premium themes**: Read `customization.enableHeroImage` and `customization.heroImageUrl` in each premium theme's homepage component and render the image alongside hero text (matching the 2-column layout from `StorefrontHeroSection`)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useTenant.tsx` | Add `buyer_theme` to `panelFields` query string (line 331-334) |
| `src/pages/panel/TeamManagement.tsx` | Remove "Coming Soon" block (lines 396-410); replace with functional "Add Member" button calling `handleInvite()` |
| `src/pages/admin/AdminOverview.tsx` | Add plan distribution summary, quick actions, recent signups section |
| `src/pages/admin/PanelManagement.tsx` | Add bulk actions, plan tier filter, tenant count per panel |
| `src/pages/admin/UserManagement.tsx` | Add last-login indicator, improved search filters |
| `src/pages/admin/SubscriptionManagement.tsx` | Add churn rate, renewal alerts |
| `src/pages/admin/RevenueAnalytics.tsx` | Add date range picker, period comparison |
| `src/components/buyer-themes/alipanel/AliPanelHomepage.tsx` | Add hero image rendering from customization |
| `src/components/buyer-themes/tgref/TGRefHomepage.tsx` | Add hero image rendering |
| `src/components/buyer-themes/flysmm/` | Add hero image rendering |
| `src/components/buyer-themes/smmstay/` | Add hero image rendering |
| `src/components/buyer-themes/smmvisit/` | Add hero image rendering |

