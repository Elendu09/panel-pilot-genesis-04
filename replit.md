# HOME OF SMM - SMM Panel SaaS Platform

## Overview

Multi-tenant SMM (Social Media Marketing) panel SaaS platform. Panel owners can create and sell social media marketing services (followers, likes, views, etc.) to buyers. The platform handles white-label storefronts, provider API integration, payment processing, and admin management.

## Architecture

- **Frontend**: React + Vite (TypeScript, TailwindCSS, shadcn/ui) on port 5000
- **Backend**: Express.js server on port 3001 — serves all functions at `/functions/v1/*`
- **Database/Auth**: Supabase (existing project at `tooudgubuhxjbbvzjcgx.supabase.co`)
- **Domain routing**: Multi-tenant — `homeofsmm.com` shows platform, `{name}.homeofsmm.com` shows buyer storefront

## Key Files

- `server/index.ts` — Express server hosting 30+ API routes (replaces Supabase Edge Functions)
- `vite.config.ts` — Vite config (port 5000, allowedHosts: true, proxy /functions/v1 to port 3001)
- `src/integrations/supabase/client.ts` — Supabase client (uses anon key for auth + DB queries)
- `src/hooks/useTenant.tsx` — Multi-tenant domain detection
- `src/lib/tenant-domain-config.ts` — Domain classification (platform vs tenant vs dev)
- `src/pages/TenantRouter.tsx` — Root router that chooses between platform App and tenant storefronts

## Development

```bash
npm run dev   # Starts both Express server (port 3001) and Vite (port 5000) concurrently
```

## Environment Variables Required

- `SUPABASE_URL` — Supabase project URL (set)
- `SUPABASE_ANON_KEY` — Supabase anon/publishable key (set)
- `SUPABASE_SERVICE_ROLE_KEY` — **Required for server-side admin DB operations** (user must provide)
- `STRIPE_SECRET_KEY` — Optional: for Stripe payment processing
- `LOVABLE_API_KEY` — Optional: for AI features (Gemini via ai.gateway.lovable.dev)

## Platform Domains

- `homeofsmm.com` — Main platform
- `smmpilot.online` — Secondary platform domain
- `{subdomain}.homeofsmm.com` — Tenant panel storefronts

## Admin Pages Architecture

Admin pages use the `/functions/v1/admin-data` Express endpoint (service role key) to bypass Supabase RLS policies. This ensures admins see all data regardless of row-level security restrictions.

**Admin-data endpoint actions:**
- `get_panels` — All panels with owner/subscription/service/provider counts
- `get_panel_stats` — Per-panel service/order/client counts
- `get_overview_stats` — Dashboard stats (panels, users, revenue, security score, activity, deposits)
- `get_transactions` — All transactions with panel/owner joins, platform fees
- `get_health` — Real-time system health (DB latency, auth status, health logs)
- `get_tickets` — Support tickets with user/panel joins
- `get_quick_replies` — Quick reply templates from platform_settings

**Admin pages updated to use admin-data:**
- `AdminOverview.tsx` — Dashboard stats and activity
- `PanelManagement.tsx` — Panel listing, stats, and finance metrics
- `SystemHealth.tsx` — Real service health checks (no more mock data)
- `PaymentManagement.tsx` — Transactions and panel data
- `SupportTickets.tsx` — Tickets and quick replies
- `UserManagement.tsx` — All users listing, details, status toggle, editing

**Admin-data endpoint actions (additional):**
- `get_users` — All profiles (bypasses RLS)
- `get_user_details` — User roles and panels by userId/profileId
- `update_user` — Update profile fields (full_name, balance, is_active)
- `get_panel_finance` — Panel deposits, order amounts, profit

**Pages still using direct Supabase client (no RLS issues):**
- `SecuritySettings.tsx` — Uses supabase.functions.invoke('update-security-settings')
- `PlatformSettings.tsx` — Reads platform_settings table (admin RLS)
- Other admin pages with admin-accessible tables

## Panel Owner Dashboard Fixes (Session)

- **Service Import (T001)**: Fixed `provider_id` storing 'direct' string (now `null`); added fallback lookup when `provider_service_ref` is null during upsert
- **Service Sync/Disable (T002)**: Resync flow auto-disables services no longer available from provider; uses batch `update...in()` query
- **Revenue Stats (T003)**: PanelOverview calculates orders/revenue from full orders table (paginated sum), unaffected by service deletion
- **Conversion Rate (T004)**: Uses completed order count from ALL orders (not just last 20 realtime)
- **Order Stat Cards (T005)**: OrdersManagement shows Total Orders, Pending, Total Order Amount, Profit from Orders
- **Email Width (T006)**: Order details dialog responsive grid + `break-all` on email
- **Admin Finance Metrics (T007)**: Admin PanelManagement finance tab shows Total Revenue (Deposits), Total Order Amount, Profit from Orders via `get_panel_finance` admin-data action

## Payment & Subscription Fixes (Session)

- **Subscription Verification**: `process-payment` verify-payment now handles `subscription` type — updates `panels.subscription_tier` and upserts `panel_subscriptions` when payment is verified
- **Duplicate Notifications Fixed**: Removed direct `panel_notifications.insert` from manual payment handler in `process-payment`; `send-notification` already creates the in-app notification
- **Manual Payment Image Upload**: Upload proof section in `BuyerDeposit.tsx` only shown after user clicks "I've Made the Transfer"
- **Trial/Onboarding Subscription**: `PanelOnboarding.tsx` now creates a `panel_subscriptions` row (free plan) when panel is created
- **Service Tier Limits**: `ServicesManagement.tsx` enforces service count limits based on subscription tier (free:1, basic:10, pro:unlimited) using DB count query

## Replit-Specific Changes Made

1. **index.html** — Added Replit domains to `isDev` check to prevent visibility hiding
2. **src/lib/tenant-domain-config.ts** — Added Replit to `DEV_PATTERNS`
3. **src/pages/TenantRouter.tsx** — Added Replit to `isDevDomain` check + restored visibility for dev domains
4. **vite.config.ts** — Replit-compatible config (host 0.0.0.0, port 5000, allowedHosts: true)
5. **server/index.ts** — Express server replacing Supabase Edge Functions + admin-data endpoint
6. **package.json** — Dev script uses `concurrently` to run both servers
