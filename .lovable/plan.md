
# Implementation Plan: Integration Fixes + DNS Configuration + Icon Backgrounds

## Summary

This plan addresses four critical issues:
1. **TenantHead not injected on public Storefront** - Integrations don't work on homepage
2. **TXT verification uses `_smmpilot`** - Should be `_homeofsmm` for brand consistency
3. **Integration icon backgrounds don't match brand colors** - Visual inconsistency
4. **FloatingChatWidget already fixed** - Verified working with AI chat enabled by default

---

## Part 1: Add TenantHead to Storefront.tsx

**File:** `src/pages/Storefront.tsx`

**Change 1: Add import (line 4)**
```typescript
import { TenantHead } from '@/components/tenant/TenantHead';
```

**Change 2: Add TenantHead after BuyerHomepageSchemas (after line 296)**
```tsx
{/* Inject TenantHead for service integrations (GA, GTM, Crisp, custom code, etc.) */}
<TenantHead />
```

This ensures all configured integrations (Google Analytics, GTM, Yandex.Metrika, Crisp, Tidio, Zendesk, Facebook Chat, custom code, etc.) are injected into the public storefront pages for all themes.

---

## Part 2: Update TXT Record Naming to `_homeofsmm`

### File 1: `src/lib/hosting-config.ts`

**Change lines 41-44:**
```typescript
{
  type: 'TXT',
  host: '_homeofsmm',
  value: `homeofsmm-verify=${verificationToken}`,
  description: 'Verifies domain ownership for your panel',
  required: true,
},
```

### File 2: `supabase/functions/verify-domain-txt/index.ts`

**Change line 30:**
```typescript
const verificationHost = `_homeofsmm.${domain}`;
```

**Change line 111:**
```typescript
const expectedValue = `homeofsmm-verify=${panel_id}`;
```

**Change line 170-173:**
```typescript
verification_host: `_homeofsmm.${domain}`,
message: isVerified 
  ? "Domain ownership verified via TXT record" 
  : `TXT record not found. Add a TXT record for _homeofsmm.${domain} with value: ${expectedValue}`,
```

---

## Part 3: Fix Integration Icon Background Colors

**File:** `src/pages/panel/Integrations.tsx`

Update the OAuth providers section (lines 90-143) to use proper brand colors:

| Provider | Current | Official Brand | Fix |
|----------|---------|----------------|-----|
| Google | `from-red-500 to-yellow-500` | White background | `bg-white border border-gray-200` |
| Telegram | `from-sky-500 to-blue-600` | #26A5E4 | Keep (close match) ✅ |
| VK | `from-blue-600 to-blue-700` | #0077FF | `bg-[#0077FF]` |
| Discord | `from-indigo-500 to-purple-600` | #5865F2 | `bg-[#5865F2]` |

**Updated oauthProviders array:**
```typescript
const oauthProviders: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google OAuth',
    icon: <GoogleIcon className="w-5 h-5" />,
    color: 'bg-white border border-gray-200', // White background for colorful G
    setupUrl: 'https://console.cloud.google.com/apis/credentials',
    instructions: [...]
  },
  {
    id: 'telegram',
    name: 'Telegram OAuth',
    icon: <TelegramIcon className="w-5 h-5" />,
    color: 'bg-[#26A5E4]', // Official Telegram blue
    setupUrl: 'https://core.telegram.org/widgets/login',
    instructions: [...]
  },
  {
    id: 'vk',
    name: 'VK OAuth',
    icon: <VKIcon className="w-5 h-5" />,
    color: 'bg-[#0077FF]', // Official VK blue
    setupUrl: 'https://vk.com/apps?act=manage',
    instructions: [...]
  },
  {
    id: 'discord',
    name: 'Discord OAuth',
    icon: <DiscordIcon className="w-5 h-5" />,
    color: 'bg-[#5865F2]', // Official Discord blurple
    setupUrl: 'https://discord.com/developers/applications',
    instructions: [...]
  }
];
```

**Update Service Integrations colors (lines 162-360):**

| Service | Current | Official | Fix |
|---------|---------|----------|-----|
| WhatsApp | `from-green-500 to-emerald-600` | #25D366 | `bg-[#25D366]` |
| Facebook | `from-blue-600 to-blue-700` | #1877F2 | `bg-[#1877F2]` |
| Zendesk | `from-emerald-500 to-teal-600` | #03363D | `bg-[#03363D]` |
| Tidio | `from-blue-400 to-blue-600` | #0066FF | `bg-[#0066FF]` |
| Smartsupp | `from-yellow-500 to-orange-600` | #F26322 | `bg-[#F26322]` |
| Crisp | `from-purple-500 to-pink-600` | #7C3AED | `bg-[#7C3AED]` |
| JivoChat | `from-green-400 to-cyan-600` | #1AAD19 | `bg-[#1AAD19]` |
| OneSignal | `from-red-500 to-pink-600` | #E54B4D | `bg-[#E54B4D]` |
| Google Analytics | `from-orange-500 to-yellow-600` | #F9AB00 | Keep ✅ |
| Yandex.Metrika | `from-red-500 to-red-600` | #FC3F1D | `bg-[#FC3F1D]` |
| Beamer | `from-purple-500 to-violet-600` | #7C3AED | `bg-[#7C3AED]` |
| GetSiteControl | `from-teal-500 to-cyan-600` | #14B8A6 | `bg-[#14B8A6]` |

---

## Part 4: Vercel DNS IP Confirmation

**No changes needed.** The current IP `76.76.21.21` is correct:
- It's Vercel's official recommended A record IP for apex domains
- Subdomains may resolve to different IPs due to Anycast networking
- Custom domains should still use `76.76.21.21` (A record) and `cname.vercel-dns.com` (CNAME)

---

## Files to Modify

| File | Lines | Changes |
|------|-------|---------|
| `src/pages/Storefront.tsx` | 4, 296 | Add TenantHead import and render |
| `src/lib/hosting-config.ts` | 41-44 | Change `_smmpilot` → `_homeofsmm` |
| `supabase/functions/verify-domain-txt/index.ts` | 30, 111, 170-173 | Change TXT verification naming |
| `src/pages/panel/Integrations.tsx` | 90-360 | Update all background colors to brand colors |

---

## Technical Details

### Why TenantHead on Storefront Matters

Currently, `TenantHead` only renders in `BuyerLayout.tsx` (authenticated pages). This means:
- ❌ Google Analytics NOT tracking on homepage
- ❌ Facebook Chat NOT appearing on homepage  
- ❌ Crisp Chat NOT loading on homepage
- ❌ Custom head code NOT injected on homepage

After fix:
- ✅ All integrations work on public storefront for ALL themes (ThemeOne through SMMVisit)

### How Integrations Flow

```text
Panel Owner configures integration in /panel/integrations
     ↓
Saves to panel_settings.integrations JSONB
     ↓
TenantHead.tsx fetches panel_settings
     ↓
Injects scripts to <head> or <body>
     ↓
Integration appears on storefront
```

### Subdomain → Custom Domain Upgrade Flow

When a user upgrades from free to Pro:

1. **Free tier**: `demo.smmpilot.online` (instant, no DNS config)
2. **Pro upgrade**: User adds `smmking.com`
3. **System generates**: Verification token (panel_id)
4. **User adds DNS**:
   - A @ → 76.76.21.21
   - CNAME www → cname.vercel-dns.com
   - TXT _homeofsmm → homeofsmm-verify={panel_id}
5. **User clicks Verify** → System checks DNS
6. **If verified** → Add domain to Vercel via API
7. **Vercel provisions SSL** → Domain active
8. **Both URLs work**: `demo.smmpilot.online` and `smmking.com`

---

## Summary

This implementation will:
1. ✅ **Enable all integrations on public storefront** across all themes
2. ✅ **Standardize TXT verification** to `_homeofsmm` brand
3. ✅ **Fix icon backgrounds** to match official brand colors
4. ✅ **Confirm Vercel IP** is correct (76.76.21.21)
