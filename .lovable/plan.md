
# Plan: Comprehensive Fix for Integrations, Domain DNS, Icons & FloatingChatWidget

## Summary of Issues Found

### Issue 1: FloatingChatWidget Not Showing
**Root Cause:** The widget IS rendered in `Storefront.tsx` (lines 303 & 308), but it relies on fetching settings from `panel_settings` via the `panelId` prop. The issue is likely the fetch returning `floating_chat_enabled: false` by default for most panels.

**Solution:** The visibility logic was already fixed (line 374 shows `hasAnyChatOption` includes `enableAI`), but we need to verify the widget is visible when `enableAI=true` (default).

### Issue 2: Service Integrations Not Injecting on Storefront
**Root Cause:** `TenantHead` component (which contains all integration injection logic) is **NOT rendered in Storefront.tsx**. It's only rendered in `BuyerLayout.tsx` (line 176) for authenticated buyer pages.

**Impact:** Google Analytics, Facebook Chat, Crisp, Custom Code, and all other integrations are ONLY injected when users are logged in to their buyer dashboard, NOT on the public storefront homepage.

**Solution:** Add `<TenantHead />` to `Storefront.tsx` so integrations work on public pages.

### Issue 3: DNS IP Address (76.76.21.21)
**Clarification:** Vercel uses Anycast networking, meaning different IPs can serve the same domain based on geographic location. `76.76.21.21` is Vercel's **official recommended A record IP** for apex domains.

Your current subdomain might resolve to a different IP because:
- Subdomains use CNAME records (which Vercel manages dynamically)
- Anycast routing may show different IPs in different regions

**For custom domains**, users should still configure:
- **A record:** `76.76.21.21` (Vercel's canonical IP)
- **CNAME for www:** `cname.vercel-dns.com`

This is correct and matches Vercel's official documentation.

### Issue 4: TXT Record Naming (`_smmpilot` vs `_homeofsmm`)
**Current State:** Inconsistent naming across files:
- `hosting-config.ts` uses `_smmpilot`
- `tenant-domain-config.ts` uses `_homeofsmm`
- Edge functions use `_homeofsmm`

**Solution:** Rename all to `_homeofsmm` for consistency (matching the platform brand "homeofsmm.com").

### Issue 5: Integration Icons Background Colors
**Problem:** Icons use proper SVG paths, but the background gradients in `Integrations.tsx` don't match official brand colors.

**Example Issue - Google OAuth:**
- Icon: Correct multi-color logo ✅
- Background: `from-red-500 to-yellow-500` ❌ (Not Google's brand colors)

Google's official brand color is solid white background with the colorful "G". The gradient approach doesn't match.

**Solution:** Update all OAuth and Service integration background colors to match official brand guidelines.

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Storefront.tsx` | Add TenantHead | Add `<TenantHead />` to inject integrations on public storefront |
| `src/lib/hosting-config.ts` | Fix TXT naming | Change `_smmpilot` to `_homeofsmm` |
| `supabase/functions/verify-domain-txt/index.ts` | Fix TXT naming | Change `_smmpilot` to `_homeofsmm` |
| `src/pages/panel/DomainSettings.tsx` | Update instructions | Ensure DNS instructions show `_homeofsmm` |
| `src/pages/panel/Integrations.tsx` | Fix icon backgrounds | Update all gradient colors to match brand guidelines |

---

## Part 1: Add TenantHead to Storefront.tsx

This is the **critical fix** for integrations not appearing on the public storefront.

```tsx
// In Storefront.tsx - after existing imports
import { TenantHead } from '@/components/tenant/TenantHead';

// In the return statement, add TenantHead after Helmet
return (
  <>
    <Helmet>
      {/* ... existing helmet content ... */}
    </Helmet>
    <TenantHead />  // ← ADD THIS
    {/* ... rest of component ... */}
  </>
);
```

---

## Part 2: Fix TXT Record Naming to `_homeofsmm`

### hosting-config.ts
Change line 42:
```typescript
// Before:
host: '_smmpilot',
value: `smmpilot-verify=${verificationToken}`,

// After:
host: '_homeofsmm',
value: `homeofsmm-verify=${verificationToken}`,
```

### verify-domain-txt/index.ts
Change line 30:
```typescript
// Before:
const verificationHost = `_smmpilot.${domain}`;

// After:
const verificationHost = `_homeofsmm.${domain}`;
```

---

## Part 3: Fix Integration Icon Background Colors

Update `Integrations.tsx` OAuth providers section (lines 90-143):

| Provider | Current Background | Official Brand Color | New Background |
|----------|-------------------|---------------------|----------------|
| Google | `from-red-500 to-yellow-500` | White with colorful G | `bg-white` (no gradient) |
| Telegram | `from-sky-500 to-blue-600` | #26A5E4 (solid) | `from-sky-400 to-sky-600` ✅ (already close) |
| VK | `from-blue-600 to-blue-700` | #0077FF (solid) | `bg-blue-600` (solid) |
| Discord | `from-indigo-500 to-purple-600` | #5865F2 (solid) | `bg-indigo-500` (solid) |

For service integrations (lines 162-350+):

| Service | Current | Official Brand | Recommendation |
|---------|---------|----------------|----------------|
| WhatsApp | `from-green-500 to-emerald-600` | #25D366 | Keep ✅ |
| Facebook | `from-blue-600 to-blue-700` | #1877F2 | Keep ✅ |
| Google Analytics | `from-orange-500 to-yellow-600` | #F9AB00 + #E37400 | Keep ✅ |
| Zendesk | `from-emerald-500 to-teal-600` | #03363D (dark teal) | `from-teal-600 to-teal-800` |
| Tidio | `from-blue-400 to-blue-600` | #0066FF | Keep ✅ |
| Crisp | `from-purple-500 to-pink-600` | #7C3AED | `from-purple-500 to-purple-700` |
| OneSignal | (missing row) | #E54B4D (coral red) | `from-red-400 to-red-600` |

---

## Part 4: Subdomain to Custom Domain Flow (Reference)

This is for your question about what happens when a user upgrades from subdomain to custom domain:

```text
FREE TIER:
  User creates panel "demo"
  → System creates: demo.smmpilot.online
  → Wildcard DNS *.smmpilot.online → Vercel (automatic)
  → Status: ACTIVE immediately
  → TenantRouter detects hostname, serves panel

PRO TIER UPGRADE:
  User clicks "Add Custom Domain"
  → Enters: smmking.com
  → System generates: verification token (e.g., abc123)
  → Shows DNS instructions:
    • A @ → 76.76.21.21
    • CNAME www → cname.vercel-dns.com
    • TXT _homeofsmm → homeofsmm-verify=abc123
  → User adds records at registrar (Namecheap, GoDaddy, etc.)
  
  User clicks "Verify"
  → System checks DNS via Google DNS-over-HTTPS
  → If A record points to 76.76.21.21 ✅
  → If TXT record contains verification token ✅
  → Call Vercel API to add domain to project
  → Vercel auto-provisions SSL
  → Status: ACTIVE

POST-UPGRADE:
  • demo.smmpilot.online → Still works (optional redirect to custom)
  • smmking.com → Primary domain, same panel
  • www.smmking.com → Redirects to smmking.com (Vercel handles)
```

---

## Summary

This plan will:

1. **Fix service integrations on public storefront** by adding `TenantHead` to `Storefront.tsx`
2. **Standardize TXT verification** to `_homeofsmm` across all files
3. **Confirm Vercel IP is correct** (`76.76.21.21` is official)
4. **Update integration icon backgrounds** to match official brand colors
5. **Ensure FloatingChatWidget visibility** by verifying the AI chat default behavior
