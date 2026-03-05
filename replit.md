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

## Replit-Specific Changes Made

1. **index.html** — Added Replit domains to `isDev` check to prevent visibility hiding
2. **src/lib/tenant-domain-config.ts** — Added Replit to `DEV_PATTERNS`
3. **src/pages/TenantRouter.tsx** — Added Replit to `isDevDomain` check + restored visibility for dev domains
4. **vite.config.ts** — Replit-compatible config (host 0.0.0.0, port 5000, allowedHosts: true)
5. **server/index.ts** — Express server replacing Supabase Edge Functions
6. **package.json** — Dev script uses `concurrently` to run both servers
