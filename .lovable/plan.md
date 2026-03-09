

# Plan: Domain Edge Function Check, Legal Content Updates & Marketplace Refinement

## 1. Domain Edge Functions — Already Production-Ready

After reviewing `add-vercel-domain/index.ts`, `verify-domain-dns/index.ts`, and `hosting-config.ts`:

- All DNS records point to Vercel (`76.76.21.21`, `cname.vercel-dns.com`) — no Replit references
- Both edge functions are registered in `supabase/config.toml` with `verify_jwt = false`
- The `add-vercel-domain` function reads Vercel credentials (`vercel_token`, `vercel_project_id`, `vercel_team_id`) from `platform_config` table — if not set, it falls back to manual DNS instructions (which is what the "Edge Function returned a non-2xx status code" error in your screenshot likely means)
- **Action needed**: You need to add your Vercel API token and project ID to the `platform_config` table in Supabase. Without these, the function can't register domains on Vercel automatically. The fallback still works for manual DNS setup, but the error toast is misleading.

**Fix**: Make the edge function return a 200 even in manual mode (it already does — the error in the screenshot may be a different issue). I'll add better error handling so the "manual mode" path doesn't surface as an error to the user.

## 2. Update Terms of Service — Make SMM-Specific

Current ToS uses generic "digital marketing assistance tools" language. Update to explicitly describe what the panel does: **social media marketing (SMM) services** — likes, followers, views, comments, engagement services.

### Changes to `src/lib/legal-content.ts`:

**Terms of Service updates:**
- Section 1 (Intro): "Our platform provides social media marketing (SMM) services including likes, followers, views, comments, and engagement services"
- Section 2 (Service Description): Replace generic list with SMM-specific services — Social Media Growth, Engagement Services, Content Promotion, Analytics & Tracking
- Section 4 (Usage Guidelines): Add SMM-specific usage rules (account links, no stolen accounts, platform compliance)
- Section 5 (Payment): Keep as-is (already accurate)
- Section 6 (Delivery): Add SMM-specific delivery notes (gradual delivery, drop protection policies)

**Privacy Policy update:**
- Section 2 (Information Collected → Account Information): Add `Full name` to the list alongside email and username

## 3. Add "Direct Providers" Quick Action to Services Management

The user's screenshot (from socpanel.com reference) shows 3 quick action cards: "Add service", "Import services", "Direct providers". Currently `ServicesManagement.tsx` has buttons in a toolbar but no quick action cards like the reference image.

### Changes to `src/pages/panel/ServicesManagement.tsx`:
- Add a row of 3 quick action cards below the header, above the toolbar:
  - **Add Service** (Plus icon) → opens the add service dialog
  - **Import Services** (Download icon) → opens the import dialog
  - **Direct Providers** (Flame/Zap icon) → navigates to `/panel/providers?tab=marketplace`
- Style: compact dark cards with icons, similar to the uploaded reference image

### Changes to `src/pages/panel/ProviderManagement.tsx`:
- Accept `?tab=marketplace` URL param to auto-select the marketplace tab when navigating from services page

## 4. Marketplace Tab — Show Only Qualified Panels + Ranked Ad Panels

Current behavior: The "HomeOfSMM Panels" section shows ALL active panels without ads. User wants:

**Ranked panels with ads (numbered 1st, 2nd, 3rd with crown icons):**
- Only panels with active **marketplace-type** ads show with rank numbers and crown icons
- These appear at the top with their ad badges

**Non-ad panels below (no numbers):**
- Only show panels that meet quality criteria:
  - Have at least 1 active service (`service_count > 0`)
  - Have customers (need to query `client_users` count)
  - OR are top performing (high order volume)
- Do NOT show every panel — filter out empty/inactive ones

### Changes to `src/pages/panel/ProviderManagement.tsx`:

**`fetchDirectProviders` update:**
- Also fetch `client_users` count per panel to determine if panel has customers
- Also fetch order count from `orders` table to determine top performers
- Filter non-ad panels: only include if `service_count > 0` AND (`customer_count > 0` OR `order_count > 10`)

**Marketplace tab UI update:**
- Remove the separate "Sponsored", "Top", "Best", "Featured" sections — merge into ONE ranked list at the top
- Ad panels get numbered ranks (1, 2, 3...) with crown icons, sorted by ad priority then spend
- Below that: "Other Providers" section (no numbers) showing only qualified non-ad panels
- Style each ranked item like the socpanel.com reference: rank number + crown icon + panel name + "Connected" badge if connected + currency badge + service tags

---

## Files to Change

| File | Changes |
|------|---------|
| `src/lib/legal-content.ts` | Update ToS to be SMM-specific, add "Name" to privacy policy |
| `src/pages/panel/ServicesManagement.tsx` | Add 3 quick action cards (Add Service, Import, Direct Providers) |
| `src/pages/panel/ProviderManagement.tsx` | Accept tab URL param, merge ad sections into ranked list, filter non-ad panels by quality criteria, fetch customer/order counts |
| `supabase/functions/add-vercel-domain/index.ts` | Minor: improve error messaging for manual mode fallback |

