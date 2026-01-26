
# Plan: Complete Integration Verification + SVG Icon Updates + Translation Fixes

## Overview
This plan addresses three major areas:
1. **Integration Icons Fix** - Update all SVG icons to match official brand guidelines
2. **Service Integrations Injection** - Ensure integrations work on tenant storefronts across all themes
3. **Translation Keys Fix** - Add missing translation keys used across all buyer themes

---

## Part 1: Integration Icons - Official Brand SVG Updates

### Current Issues Found
Several icons in `IntegrationIcons.tsx` use generic placeholder designs instead of official brand icons:

| Icon | Current State | Required Fix |
|------|--------------|--------------|
| ZendeskIcon | Generic path design | Use official Zendesk "Z" logo (#03363D) |
| TidioIcon | Generic chat bubble | Use official Tidio logo (blue gradient) |
| SmartsuppIcon | Generic checkmark | Use official Smartsupp chat bubble (#F26322) |
| CrispIcon | Generic speech bubble | Use official Crisp purple logo |
| JivoChatIcon | Generic chat icon | Use official JivoChat green gradient logo |
| GetButtonIcon | Simple circles | Use official GetButton multi-dot logo |
| BeamerIcon | Generic globe icon | Use official Beamer megaphone/bell (#7C3AED) |
| GetSiteControlIcon | Generic form | Use official GetSiteControl logo (#14B8A6) |
| YandexMetrikaIcon | Generic circles | Use official Yandex.Metrika target logo (#FC3F1D) |
| OneSignalIcon | Generic circles | Use official OneSignal bell logo (#E54B4D) |

### File to Update
**`src/components/icons/IntegrationIcons.tsx`**

Replace all placeholder icons with official brand SVG paths from SimpleIcons or brand guidelines.

---

## Part 2: Service Integrations - Storefront Injection

### Current Issue
TenantHead.tsx does NOT inject enabled service integrations (Google Analytics, Facebook Chat, custom code, etc.) into the storefront pages.

### Required Changes

#### 2.1 Update TenantHead.tsx to Inject Scripts

**File:** `src/components/tenant/TenantHead.tsx`

Add a new useEffect that:
1. Fetches panel_settings.integrations JSONB column
2. Loops through enabled integrations
3. Injects scripts/code into `<head>` or `<body>` as appropriate

**Integrations to inject:**

| Integration | Injection Location | Method |
|-------------|-------------------|--------|
| Google Analytics | `<head>` | Parse and inject gtag.js code |
| Google Tag Manager | `<head>` | Inject GTM container script |
| Yandex.Metrika | `<head>` | Inject counter code |
| OneSignal | `<head>` | Inject OneSignal SDK + init |
| Facebook Chat | `<body>` | Inject Messenger plugin HTML |
| Crisp | `<head>` | Inject Crisp loader with website_id |
| Tidio | `<body>` | Inject Tidio script |
| Zendesk | `<body>` | Inject Zendesk widget code |
| Smartsupp | `<body>` | Inject Smartsupp code |
| JivoChat | `<body>` | Inject JivoChat widget |
| GetButton | `<body>` | Inject GetButton code |
| Beamer | `<head>` | Inject Beamer script with product_id |
| GetSiteControl | `<body>` | Inject GSC code |
| Custom Head Code | `<head>` | Inject raw HTML |

**Implementation Pattern:**
```typescript
useEffect(() => {
  const injectIntegrations = async () => {
    if (!panel?.id) return;
    
    const { data } = await supabase
      .from('panel_settings')
      .select('integrations')
      .eq('panel_id', panel.id)
      .single();
    
    if (!data?.integrations) return;
    const integrations = data.integrations as Record<string, any>;
    
    // Google Analytics
    if (integrations.google_analytics?.enabled && integrations.google_analytics?.code) {
      const range = document.createRange();
      const fragment = range.createContextualFragment(integrations.google_analytics.code);
      document.head.appendChild(fragment);
    }
    
    // Crisp Chat
    if (integrations.crisp?.enabled && integrations.crisp?.website_id) {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = integrations.crisp.website_id;
      const script = document.createElement('script');
      script.src = 'https://client.crisp.chat/l.js';
      script.async = true;
      document.head.appendChild(script);
    }
    
    // ... other integrations
  };
  
  injectIntegrations();
}, [panel?.id]);
```

#### 2.2 FloatingChatWidget Integration

The FloatingChatWidget already correctly reads from panel_settings and renders WhatsApp, Telegram, Messenger, Discord buttons. Verify it receives the configuration from all buyer themes.

**Themes to verify receive FloatingChatWidget:**
- AliPanelHomepage.tsx
- FlySMMHomepage.tsx
- SMMStayHomepage.tsx
- SMMVisitHomepage.tsx
- TGRefHomepage.tsx

Check that BuyerThemeWrapper or BuyerLayout includes `<FloatingChatWidget panelId={...} />` for all themes.

---

## Part 3: Translation Keys - Add Missing Keys

### Missing Keys Found in Themes

| Key Used | File | Current State |
|----------|------|---------------|
| `buyer.payment.weAccept` | FlySMMHomepage | NOT in translations |
| `buyer.stats.happyUsers` | FlySMMHomepage, SMMVisitHomepage | NOT in translations |
| `buyer.stats.ordersDone` | FlySMMHomepage | NOT in translations |
| `buyer.howItWorks.howIt` | FlySMMHomepage | NOT in translations |
| `buyer.howItWorks.works` | FlySMMHomepage | NOT in translations |
| `buyer.platforms.allMajor` | TGRefHomepage | NOT in translations |
| `buyer.auth.resetPassword` | SMMVisitHomepage | NOT in translations |

### File to Update
**`src/lib/platform-translations.ts`**

Add the following keys to ALL 10 languages (en, es, pt, ar, tr, ru, fr, de, zh, hi):

**English (en) additions:**
```typescript
// Payment
'buyer.payment.weAccept': 'We accept',

// Stats - additional
'buyer.stats.happyUsers': 'Happy Users',
'buyer.stats.ordersDone': 'Orders Done',

// How It Works - split
'buyer.howItWorks.howIt': 'How It',
'buyer.howItWorks.works': 'Works',

// Platforms - additional
'buyer.platforms.allMajor': 'All major social networks in one place',

// Auth - additional
'buyer.auth.resetPassword': 'Reset Password',
```

**Spanish (es) additions:**
```typescript
'buyer.payment.weAccept': 'Aceptamos',
'buyer.stats.happyUsers': 'Usuarios Felices',
'buyer.stats.ordersDone': 'Pedidos Realizados',
'buyer.howItWorks.howIt': 'Cómo',
'buyer.howItWorks.works': 'Funciona',
'buyer.platforms.allMajor': 'Todas las redes sociales en un solo lugar',
'buyer.auth.resetPassword': 'Restablecer Contraseña',
```

Similar translations needed for: Portuguese, Arabic, Turkish, Russian, French, German, Chinese, Hindi

---

## Part 4: Verification Checklist

### Integration Testing Matrix

| Integration | Config UI | Saves to DB | Injects to Storefront | Works All Themes |
|-------------|-----------|-------------|----------------------|------------------|
| Google OAuth | ✅ | ✅ | N/A (Auth) | ✅ |
| Telegram OAuth | ✅ | ✅ | N/A (Auth) | ✅ |
| VK OAuth | ✅ | ✅ | N/A (Auth) | ✅ |
| Discord OAuth | ✅ | ✅ | N/A (Auth) | ✅ |
| WhatsApp Button | ✅ | ✅ | ⚠️ Verify | ⚠️ Verify |
| Telegram Bot | ✅ | ✅ | N/A (Backend) | ✅ |
| Google Analytics | ✅ | ✅ | ❌ Need to add | ❌ |
| Google Tag Manager | ✅ | ✅ | ❌ Need to add | ❌ |
| Yandex.Metrika | ✅ | ✅ | ❌ Need to add | ❌ |
| Facebook Chat | ✅ | ✅ | ❌ Need to add | ❌ |
| Crisp | ✅ | ✅ | ❌ Need to add | ❌ |
| Tidio | ✅ | ✅ | ❌ Need to add | ❌ |
| Custom Head Code | ✅ | ✅ | ❌ Need to add | ❌ |

### Theme Translation Coverage

| Theme | Uses t() | Fallbacks | Missing Keys |
|-------|----------|-----------|--------------|
| AliPanel | ✅ | ✅ | buyer.features.securePayments (needs check) |
| FlySMM | ✅ | ✅ | 5 keys missing |
| SMMStay | ✅ | ✅ | None |
| SMMVisit | ✅ | ✅ | 2 keys missing |
| TGRef | ✅ | ✅ | 1 key missing |

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/icons/IntegrationIcons.tsx` | Modify | Update all 10+ icons to official brand SVGs |
| `src/components/tenant/TenantHead.tsx` | Modify | Add integration script injection logic |
| `src/lib/platform-translations.ts` | Modify | Add 7 missing keys × 10 languages = 70 translations |
| `src/components/buyer-themes/BuyerThemeWrapper.tsx` | Verify | Ensure FloatingChatWidget is rendered |

---

## Summary

This plan will:
1. **Replace all placeholder icons** with official brand SVG icons matching their brand guidelines
2. **Enable service integrations** by injecting enabled scripts (GA, GTM, Crisp, etc.) into tenant storefronts
3. **Fix all translation errors** by adding 7 missing keys across all 10 supported languages
4. **Verify FloatingChatWidget** renders correctly across all 5 buyer themes
