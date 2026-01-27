

# Plan: Fix API Management URLs & Verify All Integrations

## Summary of Findings

Based on code analysis and documentation review:

### API URL Issues

| File | Current Issue | Required Fix |
|------|--------------|--------------|
| `src/pages/buyer/BuyerAPI.tsx` | Line 26-28: Falls back to Supabase URL `https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/buyer-api` | Use tenant subdomain with `/api/v2` |
| `src/pages/docs/DocsHub.tsx` | Line 425: Shows `/api/v1` in example | Update to `/api/v2` for consistency |

### Integration Icons Status: All Verified

All 21 integration icons have official brand colors and SVG paths:
- Google (multi-color), Telegram (#26A5E4), VK (#0077FF), Discord (#5865F2)
- WhatsApp (#25D366), Facebook (#1877F2), Google Analytics (#F9AB00/#E37400)
- GTM (#8AB4F8/#4285F4/#246FDB), Yandex (#FC3F1D), OneSignal (#E54B4D)
- Zendesk (#03363D), Tidio (#0066FF), Smartsupp (#F26322), Crisp (#7C3AED)
- JivoChat (green gradient), GetButton (multi-color), Beamer (#7C3AED)
- GetSiteControl (#14B8A6), Intercom (#1F8DED), LiveChat (#FF5100), Tawk.to (#03A84E)

---

## Implementation Details

### Part 1: Fix BuyerAPI.tsx Base URL

**File:** `src/pages/buyer/BuyerAPI.tsx`

**Current Code (lines 26-28):**
```typescript
const apiBaseUrl = panel?.custom_domain 
  ? `https://${panel.custom_domain}/api/v2`
  : `https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/buyer-api`;
```

**Fixed Code:**
```typescript
const apiBaseUrl = panel?.custom_domain 
  ? `https://${panel.custom_domain}/api/v2`
  : panel?.subdomain 
    ? `https://${panel.subdomain}.smmpilot.online/api/v2`
    : "https://yourpanel.smmpilot.online/api/v2";
```

This ensures:
- Custom domain uses `/api/v2` endpoint
- Subdomain fallback uses same `/api/v2` path
- No Supabase URL is ever exposed to customers

### Part 2: Fix DocsHub.tsx API Example

**File:** `src/pages/docs/DocsHub.tsx`

**Current Code (line 425):**
```typescript
"https://yourpanel.homeofsmm.com/api/v1"
```

**Fixed Code:**
```typescript
"https://yourpanel.homeofsmm.com/api/v2"
```

This aligns documentation examples with the actual API version (v2) used across the platform.

### Part 3: Enhance APIManagement.tsx Clarity

**File:** `src/pages/panel/APIManagement.tsx`

The current implementation at lines 91-96 is correct:
```typescript
const apiBaseUrl = panel?.custom_domain 
  ? `https://${panel.custom_domain}` 
  : panel?.subdomain 
    ? `https://${panel.subdomain}.smmpilot.online`
    : "https://yourpanel.smmpilot.online";
```

**Enhancement:** Add an info card explaining the API structure after the header (after line 366):

```typescript
{/* API Info Card */}
<Card className="glass-card border-blue-500/20">
  <CardContent className="p-4">
    <div className="flex items-start gap-4">
      <div className="p-2 rounded-lg bg-blue-500/10">
        <Globe className="w-5 h-5 text-blue-500" />
      </div>
      <div>
        <h3 className="font-semibold mb-1">Your API Endpoint</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Use this base URL for all API requests. All endpoints use POST method with form-data or JSON body.
        </p>
        <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono">
          {apiBaseUrl}/api/v2
        </code>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## API URL Structure (Final)

After these fixes, the API structure will be:

**For Tenant Storefronts (Buyer API):**
```
https://the-owlet.com/api/v2
https://{subdomain}.smmpilot.online/api/v2
```

**For Panel Owners (Management API):**
```
https://{custom_domain}/api/v2
https://{subdomain}.smmpilot.online/api/v2
```

Both use `/api/v2` as the standard SMM panel endpoint format.

---

## Files to Modify

| File | Line(s) | Change |
|------|---------|--------|
| `src/pages/buyer/BuyerAPI.tsx` | 26-28 | Replace Supabase URL fallback with subdomain-based URL |
| `src/pages/docs/DocsHub.tsx` | 425 | Change `/api/v1` to `/api/v2` |
| `src/pages/panel/APIManagement.tsx` | After 366 | Add API info card for better clarity |

---

## Integration Verification Results

All integrations are properly configured:

**Chat Widgets (Body Injection):**
- Tidio, Zendesk, Smartsupp, JivoChat, GetButton, GetSiteControl
- Facebook Chat, Intercom, LiveChat, Tawk.to

**Analytics (Head Injection):**
- Google Analytics, Google Tag Manager, Yandex.Metrika

**Notifications:**
- Beamer, OneSignal

**Social Platforms (Floating Widget):**
- WhatsApp, Telegram, Messenger, Discord

**Auth Page Protection:** Custom code injection is skipped on `/auth`, `/login`, `/signup` routes

---

## Summary

This plan will:
1. **Remove Supabase URL from Buyer API page** - Use proper subdomain-based URLs with `/api/v2`
2. **Fix DocsHub example** - Update from `/api/v1` to `/api/v2` for consistency
3. **Enhance Panel Owner API page** - Add clear API endpoint info card
4. **Verify all integration icons** - All 21 icons confirmed with official brand colors

