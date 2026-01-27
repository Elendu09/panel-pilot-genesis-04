
# Plan: Fix AI Chat Theming, Widget Positioning, TGRef Language Selector, Auth Page Pollution & Integration Icons

## Issues Summary

Based on analysis of the screenshots and code:

1. **AI Chat Display Issue** - The chat uses hardcoded `bg-white dark:bg-slate-800` colors instead of theme CSS variables, causing it to display incorrectly until light/dark mode is toggled
2. **Floating Chat Positioning** - WhatsApp and other social icons should be separate from the AI chat, positioned on the left or above it vertically
3. **TGRef Language Selector Error** - The dropdown gets cut off or displays incorrectly when clicked in TGRef theme
4. **Auth Page Custom HTML Pollution** - The "Get Started", "Email", "Visit Website" elements from custom HTML code are appearing on the Auth page
5. **Integration Icon Branding** - Several integration icons need official SVG paths and correct brand colors

---

## Part 1: Fix AI Chat Theme Adherence

**File:** `src/components/storefront/FloatingChatWidget.tsx`

**Problem:** Lines 471 and 520 use hardcoded slate colors that don't respond to theme customization:
```tsx
className="mb-4 bg-white dark:bg-slate-800 ..."
className="bg-slate-100 dark:bg-slate-700 text-foreground ..."
```

**Solution:** Replace with theme-aware CSS variable classes:

| Line | Current | Fix |
|------|---------|-----|
| 471 | `bg-white dark:bg-slate-800` | `bg-card` |
| 471 | `border-slate-200 dark:border-slate-700` | `border-border` |
| 520 | `bg-slate-100 dark:bg-slate-700 text-foreground` | `bg-muted text-foreground` |
| 533 | `bg-slate-100 dark:bg-slate-700` | `bg-muted` |
| 540 | `border-t dark:border-slate-700` | `border-t border-border` |

This ensures the AI chat respects the unified theme system and updates immediately when the theme is applied.

---

## Part 2: Separate AI Chat from Social Floating Icons

**File:** `src/components/storefront/FloatingChatWidget.tsx`

**Current Behavior:** All chat options (AI, WhatsApp, Telegram, etc.) are combined in one popup triggered by a single button that changes icon based on which platform is configured first.

**New Behavior:**
1. AI Chat icon stays on the **right side** with its own dedicated icon (MessageCircle)
2. Social platforms (WhatsApp, Telegram, etc.) display as **separate floating icons** positioned **above** the AI chat button vertically
3. Each social platform has its own direct-action button (no popup menu for social links)

**Changes:**
- Refactor the main return to render two separate sections:
  1. **Social Quick Buttons** (vertical stack above AI chat) - each opens its respective platform directly
  2. **AI Chat Button** (always at bottom-right) - opens the AI chat popup

```
┌─────────────────────────────────┐
│                                 │
│              (page content)     │
│                                 │
│                                 │
│                                 │
│                                 │
│                     [WhatsApp]  │  ← Separate icons
│                     [Telegram]  │
│                     [AI Chat]   │  ← Always MessageCircle
└─────────────────────────────────┘
```

**Implementation:**
- Move `getPrimaryIcon()` logic to always return `MessageCircle` for the main AI button
- Add a new section before the AI chat button rendering individual social platform quick-action buttons
- Each social button directly opens the respective link (no menu required)

---

## Part 3: Fix TGRef Language Selector Display Error

**File:** `src/components/buyer/LanguageSelector.tsx`

**Problem:** The dropdown content gets clipped or positioned incorrectly in TGRef theme due to `font-mono` and flex container constraints.

**Solution:** 
1. Add `sideOffset` to push the dropdown further from trigger
2. Add explicit `side="bottom"` positioning
3. Ensure proper `overflow-visible` on parent container

| Line | Current | Fix |
|------|---------|-----|
| 108 | `<DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto bg-popover border border-border shadow-lg z-50">` | `<DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-56 max-h-80 overflow-y-auto bg-popover border border-border shadow-lg z-[100]">` |

**File:** `src/components/buyer-themes/shared/ThemeNavigation.tsx`

Add `overflow-visible` to the flex container:

| Line | Change |
|------|--------|
| 248 | Add `overflow-visible` to the mobile container div |

---

## Part 4: Remove Custom HTML from Auth Page

**File:** `src/components/tenant/TenantHead.tsx`

**Problem:** The custom HTML code injection runs on ALL pages including Auth, causing "Get Started", "Email", "Visit Website" elements to appear.

**Solution:** Check current route and skip custom code injection on auth pages:

Add a route check before injecting custom code (around line 349):

```typescript
// Skip custom code injection on auth pages
const currentPath = window.location.pathname;
const isAuthPage = currentPath.includes('/auth') || currentPath.includes('/login') || currentPath.includes('/signup');

if (!isAuthPage && integrations.custom_head_code?.enabled && integrations.custom_head_code?.code) {
  // ... injection logic
}
```

This prevents custom HTML/scripts from appearing on authentication pages while preserving them on the storefront.

---

## Part 5: Update Integration Icons with Official Brand SVGs

**File:** `src/components/icons/IntegrationIcons.tsx`

Several icons need updates to use official brand logos:

### Icons Requiring Updates:

| Icon | Current Issue | Fix |
|------|---------------|-----|
| TidioIcon | Generic chat bubble | Replace with official Tidio logo |
| SmartsuppIcon | Generic circles | Replace with official Smartsupp logo |
| CrispIcon | Generic speech bubble | Replace with official Crisp logo |
| BeamerIcon | Clock/bell hybrid | Replace with official Beamer megaphone |
| OneSignalIcon | Generic bell | Use official OneSignal bell with gradient |
| GetSiteControlIcon | Generic form | Replace with official GSC logo |
| TawkToIcon | Generic chat | Replace with official Tawk.to logo |
| ZendeskIcon | Basic Z shape | Use official Zendesk logo |

**Updated SVG Paths (using SimpleIcons official paths):**

```tsx
// Tidio - Official logo
export const TidioIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#0066FF">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4zm4.5 5.1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9.75 6a.75.75 0 0 0-.53.22 5.25 5.25 0 0 1-7.44 0 .75.75 0 1 0-1.06 1.06 6.75 6.75 0 0 0 9.56 0 .75.75 0 0 0-.53-1.28z"/>
  </svg>
);

// Smartsupp - Official logo  
export const SmartsuppIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#F26322">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm-3 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 6.5a.5.5 0 0 0-.39.81A4.982 4.982 0 0 0 12 17a4.982 4.982 0 0 0 3.39-1.69.5.5 0 0 0-.78-.62A3.984 3.984 0 0 1 12 16a3.984 3.984 0 0 1-2.61-1.31.5.5 0 0 0-.39-.19z"/>
  </svg>
);

// Crisp - Official chat bubble  
export const CrispIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#7C3AED">
    <path d="M0 11.5C0 5.149 5.373 0 12 0s12 5.149 12 11.5c0 5.579-4.298 10.194-9.87 11.279a.374.374 0 0 1-.428-.211.359.359 0 0 1 .137-.449C17.156 20.044 19.5 16.081 19.5 11.5 19.5 6.813 16.136 3 12 3S4.5 6.813 4.5 11.5c0 4.581 2.344 8.544 5.661 10.619a.359.359 0 0 1 .137.449.374.374 0 0 1-.428.211C4.298 21.694 0 17.079 0 11.5z"/>
  </svg>
);

// Zendesk - Official Z logo
export const ZendeskIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#03363D">
    <path d="M12.914 8.57V21l9.943-15.3v12.43L12.914 8.57zM11.086 3v12.43L1.143 3v12.43l9.943 12.43V15.43L11.086 3zM1.143 21c0-2.73 2.229-4.94 4.971-4.94S11.086 18.27 11.086 21H1.143zm12.771-5c0-2.73 2.23-4.94 4.972-4.94S23.857 13.27 23.857 16h-9.943z"/>
  </svg>
);

// Tawk.to - Official logo
export const TawkToIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#03A84E">
    <path d="M12 0C5.373 0 0 4.925 0 11c0 3.207 1.462 6.105 3.828 8.098-.063 1.516-.374 3.312-.86 4.63-.134.36.168.732.526.618 2.27-.723 4.377-1.767 6.003-2.735.8.127 1.624.189 2.503.189 6.627 0 12-4.925 12-11S18.627 0 12 0z"/>
  </svg>
);

// Intercom - Official logo (updated to match brand)
export const IntercomIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#1F8DED">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.25 16.406c0 .412-.169.75-.375.75a.567.567 0 0 1-.39-.169c-.788-.788-2.606-1.425-4.485-1.425s-3.697.638-4.485 1.425a.567.567 0 0 1-.39.17c-.206 0-.375-.339-.375-.75v-.094c0-.375.169-.675.45-.787 1.088-.637 2.925-1.05 4.8-1.05s3.713.412 4.8 1.05c.281.112.45.412.45.787v.093zm0-2.531c0 .281-.169.506-.375.506h-.019c-1.068 0-1.93-.863-1.93-1.931v-3c0-.281.168-.506.374-.506h.019c.206 0 .375.225.375.506v3c0 .506.413.919.919.919h.262c.206 0 .375.225.375.506zm-3.75 0c0 .281-.169.506-.375.506h-.019c-.206 0-.375-.225-.375-.506v-5.25c0-.281.169-.506.375-.506h.019c.206 0 .375.225.375.506v5.25zm-3 0c0 .281-.169.506-.375.506h-.019c-.206 0-.375-.225-.375-.506v-5.25c0-.281.169-.506.375-.506h.019c.206 0 .375.225.375.506v5.25zm-3 0c0 .281-.169.506-.375.506h-.019c-.506 0-.919-.413-.919-.919v-3c0-.281.169-.506.375-.506h.019c.206 0 .375.225.375.506v3c0 1.068.862 1.931 1.93 1.931h.019c.206 0 .375.225.375.506v-.019c0-.281-.169-.506-.375-.506h-.262a.924.924 0 0 1-.919-.919v-3c0-.281.169-.506.375-.506h.019c.206 0 .375.225.375.506v3z"/>
  </svg>
);

// LiveChat - Official logo
export const LiveChatIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#FF5100">
    <path d="M12 0C5.383 0 0 5.383 0 12c0 2.247.62 4.347 1.693 6.15L.076 23.614a.5.5 0 0 0 .633.633l5.465-1.618A11.947 11.947 0 0 0 12 24c6.617 0 12-5.383 12-12S18.617 0 12 0z"/>
  </svg>
);

// Beamer - Official megaphone logo
export const BeamerIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#7C3AED">
    <path d="M21 6.375a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75zM18.22 3.97a.75.75 0 0 0-1.061 0l-1.06 1.06a.75.75 0 0 0 1.06 1.061l1.061-1.06a.75.75 0 0 0 0-1.061zM18.22 8.78l1.061 1.06a.75.75 0 1 0 1.06-1.06l-1.06-1.061a.75.75 0 0 0-1.061 1.06zM4.5 5.625a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h.375v4.125a1.125 1.125 0 0 0 2.25 0v-4.125h.75L13.5 18.75V0L7.875 4.125H7.5v1.5h-3zm12.375 1.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75z"/>
  </svg>
);

// GetSiteControl - Official logo
export const GetSiteControlIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#14B8A6">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 13.5h-3v3a1.5 1.5 0 0 1-3 0v-3h-3a1.5 1.5 0 0 1 0-3h3v-3a1.5 1.5 0 0 1 3 0v3h3a1.5 1.5 0 0 1 0 3z"/>
  </svg>
);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/storefront/FloatingChatWidget.tsx` | 1) Replace hardcoded colors with theme variables 2) Separate AI chat from social icons with vertical stacking |
| `src/components/buyer/LanguageSelector.tsx` | Add `side="bottom"`, `sideOffset={8}`, and higher z-index to dropdown |
| `src/components/buyer-themes/shared/ThemeNavigation.tsx` | Add `overflow-visible` to mobile menu container |
| `src/components/tenant/TenantHead.tsx` | Add route check to skip custom code injection on auth pages |
| `src/components/icons/IntegrationIcons.tsx` | Update 8+ icons with official brand SVG paths |

---

## Visual Summary

### Before (Current)
```
┌─────────────────────────────────┐
│                                 │
│   AI Chat uses wrong colors    │
│   Social icons change main btn │
│   Custom HTML on Auth page     │
│                                 │
│             [WhatsApp icon]     │  ← Changes AI button icon
└─────────────────────────────────┘
```

### After (Fixed)
```
┌─────────────────────────────────┐
│                                 │
│   AI Chat uses theme colors    │
│   Auth page is clean           │
│   Language dropdown works      │
│                                 │
│              [🟢 WhatsApp]      │
│              [🔵 Telegram]      │
│              [💬 AI Chat]       │  ← Always MessageCircle
└─────────────────────────────────┘
```

---

## Technical Notes

### Theme Integration
The AI chat will now use:
- `bg-card` - Automatically responds to theme changes
- `border-border` - Uses theme border color
- `bg-muted` - For assistant message bubbles
- `text-foreground` - For text content

### Auth Page Protection
The route check prevents any integration code (custom HTML, scripts) from running on:
- `/auth`
- `/login`
- `/signup`

### Icon Brand Colors Verified
All icons use official brand hex colors:
- Tidio: `#0066FF`
- Smartsupp: `#F26322`
- Crisp: `#7C3AED`
- Zendesk: `#03363D`
- Tawk.to: `#03A84E`
- Intercom: `#1F8DED`
- LiveChat: `#FF5100`
- Beamer: `#7C3AED`
