

# Plan: Fix Domain Edge Error & Mobile Padding

## Issues Found

### 1. Edge Function Not Deployed
The `add-vercel-domain` function had no logs — it wasn't deployed. I've now deployed both `add-vercel-domain` and `verify-domain-dns`. This alone should fix the edge error the user encountered.

However, there's still a potential DB issue: the `panel_domains` table has a unique constraint on `(panel_id, domain)` and a FK on `panel_id → panels(id)`. If `panelId` is a valid UUID but the panel record hasn't been created yet (race condition in onboarding), the FK will fail. The client-side guard (line 124-128) handles the missing `panelId` case, but we should also handle the FK violation gracefully in the edge function.

### 2. Mobile Width/Padding Issue — "Register New Domain" Option
When "I want to register a new domain" is selected, the `DomainRegistrarLinks` component renders cards with `flex items-center justify-between gap-4`. On narrow mobile screens, the registrar card layout (name/description + "Register" button) can overflow horizontally because there's no `overflow-hidden` on the expanding container and the content isn't constrained.

## Changes

### `supabase/functions/add-vercel-domain/index.ts`
- Add graceful error handling for the `panel_domains` upsert — if FK violation occurs, still return the DNS records and verification token (just log the DB error instead of failing)
- The upsert currently silently ignores errors in the manual path (line 77-89) but in the Vercel path (line 146-162), the `insertError` is logged but execution continues — this is fine
- For the manual path: wrap the upsert in try/catch and still return success with DNS records

### `src/components/onboarding/OnboardingDomainStep.tsx`
- Add `overflow-hidden` to the "register-new" expanded content container (line 592)
- Add `min-w-0` to the registrar content area to prevent text overflow

### `src/components/onboarding/DomainRegistrarLinks.tsx`
- Make registrar cards responsive: stack vertically on mobile (`flex-col sm:flex-row`)
- Ensure button doesn't force horizontal overflow

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/add-vercel-domain/index.ts` | Graceful FK error handling on upsert |
| `src/components/onboarding/OnboardingDomainStep.tsx` | Add `overflow-hidden` on register-new container |
| `src/components/onboarding/DomainRegistrarLinks.tsx` | Responsive card layout for mobile |

