# Fix Language Selector to Display Flag Icons Instead of Text

## Problem
The language selector is displaying text country codes (e.g., "US", "DE") instead of flag emojis on desktop/tablet. This happens because Unicode flag emojis are often rendered as two-letter country codes on systems without proper emoji font support (particularly Windows).

## Solution
Replace emoji flags with inline SVG flag icons that render consistently across all platforms and browsers.

---

## Implementation Plan

### Step 1: Create Flag Icons Component
**File**: `src/components/icons/FlagIcons.tsx`

Create a new component with SVG flag icons for all supported languages:
- 🇺🇸 US (English)
- 🇪🇸 ES (Spanish)
- 🇧🇷 BR (Portuguese)
- 🇫🇷 FR (French)
- 🇩🇪 DE (German)
- 🇸🇦 SA (Arabic)
- 🇹🇷 TR (Turkish)
- 🇷🇺 RU (Russian)
- 🇨🇳 CN (Chinese)
- 🇮🇳 IN (Hindi)

Each flag will be a React component with customizable size props.

---

### Step 2: Update LanguageSelector Component
**File**: `src/components/buyer/LanguageSelector.tsx`

**Changes:**
1. Import the new FlagIcon component
2. Replace the emoji `flag` property with a `FlagComponent` reference
3. Update the dropdown trigger to use `<FlagComponent className="w-5 h-5" />` instead of emoji text
4. Update dropdown menu items to use SVG flags instead of emoji

**Before (line 70):**
```tsx
<span className="text-base sm:text-lg">{currentLanguage?.flag || '🌐'}</span>
```

**After:**
```tsx
{currentLanguage ? (
  <currentLanguage.FlagComponent className="w-5 h-5 rounded-sm" />
) : (
  <Globe className="w-5 h-5" />
)}
```

---

### Step 3: Verify CurrencySelector Remains As-Is
**File**: `src/components/buyer/CurrencySelector.tsx`

The CurrencySelector should continue showing currency codes (USD, EUR, etc.) as text - this is the expected behavior per user requirements. No changes needed.

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/icons/FlagIcons.tsx` | CREATE | New component with SVG flag icons |
| `src/components/buyer/LanguageSelector.tsx` | UPDATE | Use SVG flags instead of emoji |

---

## Technical Details

### FlagIcons.tsx Structure
```tsx
interface FlagProps {
  className?: string;
}

export const FlagUS: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36">
    {/* US flag SVG paths */}
  </svg>
);

// Similar exports for all other flags...

export const flagComponents = {
  en: FlagUS,
  es: FlagES,
  pt: FlagBR,
  fr: FlagFR,
  de: FlagDE,
  ar: FlagSA,
  tr: FlagTR,
  ru: FlagRU,
  zh: FlagCN,
  hi: FlagIN,
};
```

### Updated LanguageSelector languages array
```tsx
const languages = [
  { code: 'en', name: 'English', nativeName: 'English', FlagComponent: FlagUS },
  { code: 'es', name: 'Spanish', nativeName: 'Español', FlagComponent: FlagES },
  // ... etc
];
```

---

## Result After Implementation

| Component | Trigger Button Display | Dropdown Display |
|-----------|----------------------|------------------|
| LanguageSelector | SVG flag icon (e.g., 🇺🇸 as SVG) | Flag + Native name + English name |
| CurrencySelector | Currency code text (e.g., "USD") | Flag + Code + Symbol |

This ensures consistent flag display across all platforms (Windows, Mac, Linux, mobile) without relying on system emoji font support.

---

## Critical Files for Implementation
- `src/components/icons/FlagIcons.tsx` - New file: SVG flag components
- `src/components/buyer/LanguageSelector.tsx` - Core file to modify for flag display
