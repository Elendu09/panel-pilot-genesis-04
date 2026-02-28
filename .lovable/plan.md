


# Plan: Customer List View Redesign + Grid View Toggle + Ads Maximization Strategy

## 1. Customer List — Redesign Table View + Add Grid/Card View Toggle ✅

### A. View Toggle — DONE
- Added `viewMode` state (`'table' | 'grid'`) to `CustomerManagement.tsx`
- Toggle UI with Table/Grid icons next to "All Customers" heading

### B. Improved Table View — DONE
- Added "Orders" column with sortable header
- Added "Joined" column showing relative time
- Online indicator dot already present

### C. CustomerGridCard Component — DONE
- New file: `src/components/customers/CustomerGridCard.tsx`
- Cards show avatar with online dot, VIP badge, status, balance, spent, orders, last active, joined date
- Full actions dropdown (view, edit, pricing, balance, email, suspend, delete)
- VIP customers get ring highlight

## 2. Ads Maximization — DONE ✅

### A. Ad Reach Visibility — DONE
- Added `adReachMap` showing WHERE each ad type appears (Marketplace, Chat Inbox, Storefront, etc.)
- "Ad Placements" section shown below metrics on each My Ads card

### B. Ad Statistics Enhancement — DONE
- Added CPC (Cost per Click) metric
- Added CPM (Cost per 1000 Views) metric
- Added MiniSparkline showing impression trend over time

### C. Cross-Panel Reach Indicator — DONE
- Fetches active panel count from `panels` table
- Shows "Active across X panels" card in Purchase tab
