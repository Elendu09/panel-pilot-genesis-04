
# Plan: Fix Integration Injection, Theme Name Display & Language Selector

## Issues Identified

### Issue 1: WhatsApp Floating Icon Not Showing
**Root Cause:** The `FloatingChatWidget` fetches settings from `panel_settings` table using columns like `floating_chat_whatsapp`, but when WhatsApp is configured via the Integrations page, it saves to the `integrations` JSONB column as `integrations.whatsapp.phone`.

The widget only reads from:
- `floating_chat_whatsapp` (old column)
- `floating_chat_telegram` (old column)
- etc.

But integrations saves to:
- `integrations.whatsapp.phone`
- `integrations.whatsapp.enabled`

**Fix:** Update `FloatingChatWidget.tsx` to also check the `integrations` JSONB column for social platforms.

### Issue 2: Custom HTML Code Not Rendering
**Root Cause:** The integration stores a full HTML document with `<!DOCTYPE html>`, `<html>`, `<head>`, `<style>`, and `<body>` tags. The `TenantHead.tsx` injects this directly using `createContextualFragment()`, but injecting a full document inside an existing document creates invalid HTML.

**Fix:** Strip the outer HTML structure and extract only the inline content (styles + body content) before injecting.

### Issue 3: Theme Name Not Showing in Panel Dashboard
**Root Cause:** The code at line 882-884 reads `panelSettings?.buyer_theme` from `panel_settings` table, but:
1. The `buyer_theme` is also stored in `panels.buyer_theme` column
2. The selected theme from Design Customization is stored in `panels.custom_branding.selectedTheme`

The current code only checks `panel_settings.buyer_theme`, missing `panels.buyer_theme`.

**Fix:** Update the theme label logic to check multiple sources in priority order:
1. `panelData?.custom_branding?.selectedTheme`
2. `panelData?.buyer_theme`
3. `panelSettings?.buyer_theme`
4. Default to 'default'

### Issue 4: Language Selector Shrinking in TGRef Theme
**Root Cause:** The TGRef theme uses `font-mono` class on the main container, which can affect the sizing of child components. The `LanguageSelector` dropdown trigger button uses `size="icon"` with fixed sizing that may conflict with the mono font metrics.

**Fix:** Add `shrink-0` class to the LanguageSelector button to prevent flex shrinking.

---

## Implementation Plan

### Part 1: Fix FloatingChatWidget to Read from Integrations JSONB

**File:** `src/components/storefront/FloatingChatWidget.tsx`

Update the `fetchSettings` function (around line 304) to also read from the `integrations` column:

```typescript
// Fetch settings from database if panelId is provided
useEffect(() => {
  if (panelId) {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('panel_settings')
        .select('floating_chat_enabled, floating_chat_whatsapp, floating_chat_telegram, floating_chat_messenger, floating_chat_discord, floating_chat_custom_url, floating_chat_custom_label, floating_chat_position, floating_chat_message, integrations')
        .eq('panel_id', panelId)
        .single();

      if (data) {
        // Check integrations JSONB for social platforms (new integration system)
        const integrations = data.integrations as Record<string, any> || {};
        
        setSettings({
          enabled: data.floating_chat_enabled || false,
          // Priority: floating_chat columns > integrations JSONB
          whatsapp: data.floating_chat_whatsapp || integrations.whatsapp?.phone || '',
          telegram: data.floating_chat_telegram || integrations.telegram?.username || '',
          messenger: data.floating_chat_messenger || integrations.messenger?.username || '',
          discord: data.floating_chat_discord || integrations.discord?.invite_url || '',
          customUrl: data.floating_chat_custom_url || '',
          customLabel: data.floating_chat_custom_label || 'Live Chat',
          position: (data.floating_chat_position as 'bottom-right' | 'bottom-left') || 'bottom-right',
          message: data.floating_chat_message || integrations.whatsapp?.message || 'Need help? Chat with us!'
        });
      }
    };
    fetchSettings();
  }
  // ... rest
}, [panelId, ...]);
```

### Part 2: Fix Custom HTML Code Injection

**File:** `src/components/tenant/TenantHead.tsx`

Update the custom head code injection (around line 349) to sanitize HTML:

```typescript
// Custom Head Code - inject raw HTML/scripts (sanitized)
if (integrations.custom_head_code?.enabled && integrations.custom_head_code?.code) {
  try {
    let code = integrations.custom_head_code.code;
    
    // Sanitize: Remove full HTML document structure if present
    // Extract only the content that should be injected
    if (code.includes('<!DOCTYPE') || code.includes('<html')) {
      // Extract style tags
      const styleMatches = code.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      const styles = styleMatches.join('\n');
      
      // Extract body content
      const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : '';
      
      // For head injection, only inject styles
      if (styles) {
        const styleRange = document.createRange();
        const styleFragment = styleRange.createContextualFragment(styles);
        document.head.appendChild(styleFragment);
      }
      
      // For body content, inject into body
      if (bodyContent.trim()) {
        const bodyRange = document.createRange();
        const bodyFragment = bodyRange.createContextualFragment(bodyContent);
        document.body.appendChild(bodyFragment);
      }
    } else {
      // Normal code injection
      const range = document.createRange();
      const fragment = range.createContextualFragment(code);
      document.head.appendChild(fragment);
    }
  } catch (e) {
    console.error('Failed to inject custom head code:', e);
  }
}
```

### Part 3: Fix Theme Name Display in Panel Dashboard

**File:** `src/pages/panel/PanelOverview.tsx`

Update the theme label logic (lines 872-886):

```typescript
<Badge variant="outline" className="text-xs bg-primary/10 border-primary/30">
  {(() => {
    const themeLabels: Record<string, string> = {
      default: 'Default Theme',
      dark_gradient: 'Default Theme',
      theme_one: 'Default Theme',
      alipanel: 'AliPanel Style',
      theme_alipanel: 'AliPanel Style',
      flysmm: 'FlySMM Style',
      theme_flysmm: 'FlySMM Style',
      smmstay: 'SMMStay Style',
      theme_smmstay: 'SMMStay Style',
      tgref: 'TGRef Style',
      theme_tgref: 'TGRef Style',
      smmvisit: 'SMMVisit Style',
      theme_smmvisit: 'SMMVisit Style',
    };
    // Check multiple sources in priority order
    const customBranding = panelData?.custom_branding as any;
    const panelSettings = panelData?.panel_settings as any;
    const selectedTheme = 
      customBranding?.selectedTheme || 
      panelData?.buyer_theme || 
      panelSettings?.buyer_theme || 
      'default';
    return themeLabels[selectedTheme] || 'Default Theme';
  })()}
</Badge>
```

### Part 4: Fix Language Selector Shrinking

**File:** `src/components/buyer/LanguageSelector.tsx`

Update the button to prevent flex shrinking (line 100):

```typescript
<Button 
  variant="ghost" 
  size="icon" 
  className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 flex-shrink-0" 
  title="Change language"
>
```

**File:** `src/components/buyer-themes/shared/ThemeNavigation.tsx`

Also update the container to prevent shrinking (line 250):

```tsx
<div className="flex md:hidden items-center gap-2">
  {/* Mobile Language Selector */}
  <div className="shrink-0">
    <LanguageSelector />
  </div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/storefront/FloatingChatWidget.tsx` | Add `integrations` column to query and read WhatsApp/Telegram from integrations JSONB |
| `src/components/tenant/TenantHead.tsx` | Sanitize custom HTML code before injection - extract styles and body content separately |
| `src/pages/panel/PanelOverview.tsx` | Fix theme name display to check multiple sources |
| `src/components/buyer/LanguageSelector.tsx` | Add `shrink-0` class to prevent button shrinking |
| `src/components/buyer-themes/shared/ThemeNavigation.tsx` | Wrap LanguageSelector in container with `shrink-0` |

---

## Technical Details

### Integration Data Flow

**Current (Broken):**
```
Integrations Page → saves to panel_settings.integrations JSONB
FloatingChatWidget → reads from panel_settings.floating_chat_* columns
Result: Widget doesn't see integrations data ❌
```

**Fixed:**
```
Integrations Page → saves to panel_settings.integrations JSONB
FloatingChatWidget → reads from BOTH floating_chat_* AND integrations JSONB
Result: Widget shows WhatsApp/Telegram icons ✅
```

### Custom Code Sanitization

**Current (Broken):**
```html
<!-- User pastes full HTML document -->
<!DOCTYPE html>
<html>
<head><style>...</style></head>
<body><a class="get-btn">...</a></body>
</html>

<!-- Injected directly → Invalid nested document structure -->
```

**Fixed:**
```html
<!-- Extract and inject separately -->
<style>...</style>  → injected into <head>
<a class="get-btn">...</a>  → injected into <body>
```

### Theme Name Resolution Priority

```
1. panelData.custom_branding.selectedTheme (Design Customization UI)
2. panelData.buyer_theme (panels table)
3. panelSettings.buyer_theme (panel_settings table)
4. 'default' (fallback)
```

---

## Summary

This plan will:
1. **Fix WhatsApp floating icon** by reading from integrations JSONB
2. **Fix custom HTML rendering** by sanitizing and splitting injection
3. **Fix theme name display** by checking multiple data sources
4. **Fix language selector shrinking** by adding flex-shrink prevention classes
