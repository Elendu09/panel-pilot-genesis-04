

# Plan: Integration Page Overhaul + OAuth System Fixes + Profile Updates

## Overview

This plan addresses multiple areas:
1. **Replace emoji icons with proper SVG icons** in the Integrations page
2. **Verify and fix each OAuth integration** (Google, Telegram, VK, Discord)
3. **Fix OAuth callback redirect** (should go to `/auth/callback` not storefront)
4. **Implement proper Telegram and Facebook integrations** with their specific flows
5. **Handle OAuth success/failure flows** in signup/signin
6. **Update buyer profile and dashboard** for OAuth users (show avatar, connected provider)

---

## Part 1: Replace Emoji Icons with SVG Icons

### Problem
The current Integrations page uses emojis like `🔵`, `✈️`, `💬` for icons which look unprofessional and inconsistent.

### Solution
Create proper SVG icon components for each integration and use them instead of emojis.

### Icons Needed (OAuth Providers)

| Provider | Current | New Icon |
|----------|---------|----------|
| Google | `🔵` | Google colored SVG (from BuyerAuth.tsx) |
| Telegram | `✈️` | TelegramIcon from SocialIcons.tsx |
| VK | `🔷` | VKIcon from SocialIcons.tsx |
| Discord | `💬` | DiscordIcon from SocialIcons.tsx |

### Icons Needed (Service Integrations)

| Service | Current | New Icon |
|---------|---------|----------|
| Telegram Bot | `✈️` | TelegramIcon |
| WhatsApp | `💬` | WhatsAppIcon |
| GetButton | `🔘` | Custom SVG |
| Zendesk | `🎧` | Custom SVG |
| Tidio | `💭` | Custom SVG |
| Smartsupp | `📹` | Custom SVG |
| Crisp | `💬` | Custom SVG |
| Jivochat | `🗨️` | Custom SVG |
| Facebook Chat | `📱` | FacebookIcon |
| Google Analytics | `📊` | Custom SVG (Google colors) |
| Google Tag Manager | `🏷️` | Custom SVG |
| Yandex.Metrika | `📈` | Custom SVG |
| OneSignal | `🔔` | Custom SVG |
| Getsitecontrol | `📝` | Custom SVG |
| Beamer | `📣` | Custom SVG |
| Announcements | `📢` | Lucide Megaphone |
| Custom Code | `🔧` | Lucide Code |

### Implementation

Create a new file `src/components/icons/IntegrationIcons.tsx` with all needed SVG icons, then update `Integrations.tsx` to use React components instead of emoji strings.

```tsx
// Example structure
interface OAuthProvider {
  id: string;
  name: string;
  icon: React.ReactNode; // Changed from string
  color: string;
  setupUrl: string;
  instructions: string[];
}

const oauthProviders: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google OAuth',
    icon: <GoogleIcon className="w-5 h-5" />,
    color: 'from-red-500 to-yellow-500',
    // ...
  },
  // ...
];
```

---

## Part 2: Fix OAuth Callback Flow

### Current Issue
The OAuth callback redirects to `/auth/callback` on the storefront which is correct, but there's a potential issue with panel ID not being stored.

### Fix in BuyerOAuthCallback.tsx

```tsx
// Current code reads from localStorage
const panelId = localStorage.getItem('buyer_panel_id') || '';

// Problem: This might be empty
// Fix: Get panelId from JWT payload
const payload = JSON.parse(atob(token));
const session = {
  buyerId: buyerId,
  panelId: payload.panel, // Use from token, not localStorage
  token: token,
  expiresAt: payload.exp
};
```

### Fix in BuyerAuth.tsx
Store panel ID before OAuth redirect:

```tsx
const handleOAuthLogin = (provider: EnabledOAuthProvider) => {
  // Store panel ID for callback
  localStorage.setItem('buyer_panel_id', panelId);
  // ... rest of OAuth redirect
};
```

---

## Part 3: Fix Telegram OAuth Integration

### How Telegram Login Works
Telegram uses a **widget-based** authentication, not a standard OAuth code flow:
1. Panel owner creates a bot with @BotFather
2. Bot owner sets the domain via @BotFather: `/setdomain`
3. Telegram Login Widget is embedded on the auth page
4. User clicks widget, authenticates via Telegram app
5. Widget returns user data + hash directly to callback

### Implementation

#### 3.1 Update Telegram OAuth in BuyerAuth.tsx

```tsx
// For Telegram, use the Telegram Login Widget script
case 'telegram':
  // Inject Telegram widget script
  const script = document.createElement('script');
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.setAttribute('data-telegram-login', provider.clientId); // Bot username
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-auth-url', `${callbackUrl}&panel_id=${panelId}`);
  script.setAttribute('data-request-access', 'write');
  document.body.appendChild(script);
  return;
```

#### 3.2 Update oauth-callback Edge Function for Telegram

The current function has basic Telegram handling but needs:
- Proper HMAC-SHA256 hash verification using bot token
- Better error messages

```typescript
// Verify Telegram hash
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

async function verifyTelegramHash(
  data: URLSearchParams, 
  botToken: string
): Promise<boolean> {
  const hash = data.get('hash');
  if (!hash) return false;
  
  // Build data check string (sorted params without hash)
  const checkArr = [];
  for (const [key, value] of data.entries()) {
    if (key !== 'hash') checkArr.push(`${key}=${value}`);
  }
  checkArr.sort();
  const dataCheckString = checkArr.join('\n');
  
  // SHA256 of bot token as secret key
  const encoder = new TextEncoder();
  const keyData = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(botToken)
  );
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(dataCheckString)
  );
  
  const computedHash = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return computedHash === hash;
}
```

---

## Part 4: Fix Facebook Chat Integration

### How Facebook Messenger Plugin Works
Facebook Chat plugin is NOT OAuth for login - it's for customer chat on storefront.

### Current Config (Correct)
The current implementation correctly treats Facebook as a **service integration** (chat widget), not OAuth. The `page_id` and `code` fields allow panel owners to paste their Messenger plugin code.

### Storefront Injection
Need to update TenantHead.tsx to inject Facebook SDK and chat plugin when enabled:

```tsx
// In TenantHead.tsx - inject enabled integrations
useEffect(() => {
  if (!panelSettings?.integrations) return;
  
  const integrations = panelSettings.integrations;
  
  // Facebook Chat Plugin
  if (integrations.facebook_chat?.enabled && integrations.facebook_chat?.code) {
    const div = document.createElement('div');
    div.innerHTML = integrations.facebook_chat.code;
    document.body.appendChild(div);
    
    // Load Facebook SDK if not already
    if (!window.FB) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      document.body.appendChild(script);
    }
  }
  
  // Google Analytics
  if (integrations.google_analytics?.enabled && integrations.google_analytics?.code) {
    const scriptContainer = document.createElement('div');
    scriptContainer.innerHTML = integrations.google_analytics.code;
    document.head.appendChild(scriptContainer);
  }
  
  // Custom head code
  if (integrations.custom_head_code?.enabled && integrations.custom_head_code?.code) {
    const range = document.createRange();
    const fragment = range.createContextualFragment(integrations.custom_head_code.code);
    document.head.appendChild(fragment);
  }
}, [panelSettings]);
```

---

## Part 5: OAuth Success/Failure Flows

### Current Flow Analysis

**Success Flow:**
1. User clicks OAuth button on BuyerAuth.tsx
2. Redirected to provider (Google/Discord/VK)
3. Provider redirects to edge function `/oauth-callback`
4. Edge function creates/finds buyer, generates JWT
5. Redirects to `{returnUrl}/auth/callback?token=...`
6. BuyerOAuthCallback.tsx stores session, redirects to /dashboard

**Failure Flow:**
1. If error occurs in edge function, redirects to `{returnUrl}/auth?error=...`
2. BuyerAuth.tsx should display this error

### Required Fixes

#### 5.1 Display OAuth Errors in BuyerAuth.tsx

```tsx
// At start of component, check for error param
useEffect(() => {
  const errorParam = searchParams.get('error');
  if (errorParam) {
    toast.error(`Sign in failed: ${errorParam}`);
    // Clear the error from URL
    navigate('/auth', { replace: true });
  }
}, [searchParams]);
```

#### 5.2 Better Error Handling in BuyerOAuthCallback.tsx

```tsx
// Add more specific error messages
if (!token || !buyerId) {
  setErrorMessage('Authentication data missing. Please try again.');
  setStatus('error');
  return;
}

try {
  const payload = JSON.parse(atob(token));
  
  // Validate token structure
  if (!payload.exp || !payload.sub || !payload.panel) {
    throw new Error('Invalid authentication token');
  }
  
  // Check if token is already expired
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Authentication token has expired');
  }
  
  // ... rest of processing
} catch (err) {
  console.error('OAuth callback processing error:', err);
  setErrorMessage(err.message || 'Failed to complete authentication');
  setStatus('error');
}
```

---

## Part 6: Update Profile for OAuth Users

### Current Issue
The BuyerProfile page doesn't show:
- OAuth-connected provider info
- User's avatar from OAuth (stored in `avatar_url`)
- Option to link additional OAuth providers

### Required Updates to BuyerProfile.tsx

#### 6.1 Display Avatar from OAuth

```tsx
// Update the Avatar component
<Avatar className="w-20 h-20 border-4 border-primary/20">
  {buyer?.avatar_url ? (
    <AvatarImage src={buyer.avatar_url} alt={profileData.name} />
  ) : null}
  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
    {profileData.name.charAt(0).toUpperCase()}
  </AvatarFallback>
</Avatar>
```

#### 6.2 Show Connected OAuth Provider

```tsx
// Add section showing OAuth connection
{buyer?.oauth_provider && (
  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        {buyer.oauth_provider === 'google' && <GoogleIcon className="w-5 h-5" />}
        {buyer.oauth_provider === 'discord' && <DiscordIcon className="w-5 h-5" />}
        {buyer.oauth_provider === 'vk' && <VKIcon className="w-5 h-5" />}
        {buyer.oauth_provider === 'telegram' && <TelegramIcon className="w-5 h-5" />}
      </div>
      <div>
        <p className="font-medium">Connected via {buyer.oauth_provider}</p>
        <p className="text-sm text-muted-foreground">
          You signed up using {buyer.oauth_provider}
        </p>
      </div>
    </div>
    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500">
      <CheckCircle className="w-3 h-3 mr-1" />
      Connected
    </Badge>
  </div>
)}
```

#### 6.3 Hide Password Section for OAuth Users

```tsx
// Only show password change for non-OAuth users
{!buyer?.oauth_provider && (
  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Key className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="font-medium">Password</p>
        <p className="text-sm text-muted-foreground">Change your account password</p>
      </div>
    </div>
    <ChangePasswordDialog />
  </div>
)}
```

---

## Part 7: Update BuyerAuthContext for OAuth

### Add oauth_provider and avatar_url to BuyerUser interface

```typescript
interface BuyerUser {
  // ... existing fields
  oauth_provider: string | null;
  oauth_provider_id: string | null;
  avatar_url: string | null;
}
```

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/icons/IntegrationIcons.tsx` | Create | SVG icons for all integrations |
| `src/pages/panel/Integrations.tsx` | Modify | Replace emoji icons with SVG components |
| `src/pages/buyer/BuyerAuth.tsx` | Modify | Add Telegram widget, show OAuth errors |
| `src/pages/buyer/BuyerOAuthCallback.tsx` | Modify | Better error handling, fix panelId |
| `src/pages/buyer/BuyerProfile.tsx` | Modify | Show avatar, OAuth provider, hide password for OAuth users |
| `src/contexts/BuyerAuthContext.tsx` | Modify | Add oauth_provider/avatar_url to interface |
| `src/components/tenant/TenantHead.tsx` | Modify | Inject enabled service integrations (analytics, chat) |
| `supabase/functions/oauth-callback/index.ts` | Modify | Add proper Telegram hash verification |

---

## Integration Verification Checklist

| Integration | Type | Status | Notes |
|-------------|------|--------|-------|
| Google OAuth | OAuth | ✅ Works | Standard flow implemented |
| Discord OAuth | OAuth | ✅ Works | Standard flow implemented |
| VK OAuth | OAuth | ✅ Works | Standard flow implemented |
| Telegram OAuth | OAuth | ⚠️ Needs Fix | Widget-based auth, needs implementation |
| Telegram Bot | Service | ✅ Works | For notifications, not auth |
| WhatsApp Button | Service | ✅ Works | Floating button widget |
| Facebook Chat | Service | ⚠️ Needs Injection | SDK needs to be injected in storefront |
| Google Analytics | Service | ⚠️ Needs Injection | Code needs to be injected in head |
| Custom Head Code | Service | ⚠️ Needs Injection | Code needs to be injected in head |

---

## Summary

This comprehensive plan will:
1. **Professionalize the UI** with proper SVG icons instead of emojis
2. **Fix Telegram OAuth** with proper widget-based authentication
3. **Enable service integrations** by injecting scripts into storefront head
4. **Improve OAuth error handling** for better user experience
5. **Enhance buyer profile** to show OAuth connection details and avatar
6. **Maintain security** with proper hash verification for Telegram

