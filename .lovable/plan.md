

# Comprehensive Fix Plan: Contact Email, Transaction Visibility, Theme Sync, and Support Enhancement

---

## Issues Identified (6 Total)

### Issue 1: Contact Email Default
The platform contact email needs to default to "support@homeofsmm.com".

### Issue 2: Ad Purchase Transactions Not Visible in Billing
**Root Cause (CRITICAL):** The `transactions` table RLS policy requires `user_id` to match the current user's profile ID. However, the ad purchase code in `ProviderAds.tsx` (line 267) inserts transactions with only `panel_id` and NO `user_id`. The SELECT policy also filters by `user_id`, so even the `TransactionHistory` component (which queries by `panel_id`) cannot see them because RLS blocks the rows.

Fix requires:
1. Adding `user_id` (profile ID) to the ad purchase transaction insert
2. Updating the RLS SELECT policy to also allow viewing by `panel_id` (for panel owners)

### Issue 3: Hero Incomplete Text / Theme Not Syncing with Design Customization
**Root Cause:** The onboarding saves hardcoded strings in `custom_branding.heroTitle` ("Boost Your Social Media Presence"), but the theme homepages (SMMStay, AliPanel, etc.) read `customization.heroTitle` from `BuyerThemeWrapper`. The issue is that `BuyerThemeWrapper` line 190 sets:
```
heroTitle: branding.heroTitle || '',
```
If `heroTitle` is an empty string or if it was not saved during onboarding (for older panels), it falls back to `''`, causing incomplete display. The themes then try to split this into animated words and non-animated words, leading to broken rendering.

The real fix: The onboarding `custom_branding` already has the right content (added in previous edit), but the `BuyerThemeWrapper` fallback chain and the `DesignCustomization` defaults need to stay in sync. The themes should fall back to a sensible default title if none is set, rather than empty string.

### Issue 4: Text/Background Error on All Themes Until Dark/Light Mode Toggle
**Root Cause (CRITICAL):** There is a race condition between TWO theme providers that both modify `document.documentElement`:

1. `ThemeProvider` (use-theme.tsx, line 331 in TenantRouter) - Sets `<html>` to "dark" based on `localStorage['smm-panel-theme']`
2. `BuyerThemeProvider` (BuyerThemeContext.tsx) - Also sets `<html>` to dark/light based on buyer preference

On initial load, `ThemeProvider` runs first and may set a stale value. Then `BuyerThemeProvider` runs and sets the correct value. But each theme wrapper component (e.g., `BuyerThemeSMMStay`) ALSO wraps children in `<div className={themeMode === 'light' ? 'light' : 'dark'}>`, creating a nested scope.

The problem: `ThemeProvider` sets `<html class="dark">` but if `BuyerThemeProvider` hasn't applied yet, the Tailwind `dark:` utilities on outer elements respond to the wrong state. Additionally, the theme wrapper CSS uses hardcoded colors (`--theme-background: #000000`) that don't change with light/dark mode.

**Fix:** Make the `ThemeProvider` in TenantRouter use the panel's `defaultThemeMode` directly as its default, AND ensure `BuyerThemeProvider` applies synchronously before first paint. Also ensure theme wrapper components apply their light mode CSS variables correctly.

### Issue 5: Enhance Buyer Support Page
Add chat inbox integration, FAQ section, and "Talk to Human" sync with panel owner's live support (ChatInbox).

### Issue 6: Ads Banner Text
Already fixed in previous edit (FreeTierBanner). Verify it's applied.

---

## Implementation Plan

### Part 1: Contact Email Default

**File:** `src/pages/buyer/BuyerContact.tsx`

Add default contact email "support@homeofsmm.com" when no panel contact info is configured. In the `contactMethods` array construction, add a fallback:

```typescript
// If no email is configured in panel settings, show default platform email
const defaultEmail = 'support@homeofsmm.com';
const emailValue = contactInfo.email || defaultEmail;
```

Ensure the Email contact method always shows with the fallback.

---

### Part 2: Fix Ad Transaction Visibility (RLS + Missing user_id)

**File 1:** `src/pages/panel/ProviderAds.tsx` (line 267)

Add `user_id` from the authenticated profile to the transaction insert:

```typescript
// Get the profile ID for the current user
const { data: profileData } = await supabase
  .from('profiles')
  .select('id')
  .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
  .single();

await supabase.from('transactions').insert({
  panel_id: panel.id,
  user_id: profileData?.id,  // ADD THIS
  type: 'ad_purchase',       // Use specific type instead of 'debit'
  amount: price,
  status: 'completed',
  description: `Ad purchase: ${tier.ad_type} (${duration})`,
  payment_method: 'balance'
});
```

**Database:** Update RLS policy on `transactions` table to also allow panel owners to view transactions by `panel_id`:

```sql
-- Drop existing select policy
DROP POLICY IF EXISTS "Users can view their transactions" ON transactions;

-- Create new policy that allows viewing by user_id OR panel ownership
CREATE POLICY "Users can view their transactions" ON transactions FOR SELECT
USING (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR
  panel_id IN (SELECT id FROM panels WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
```

Also update INSERT policy to allow panel owners to insert with panel_id:

```sql
DROP POLICY IF EXISTS "Users can create transactions" ON transactions;

CREATE POLICY "Users can create transactions" ON transactions FOR INSERT
WITH CHECK (
  user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  OR
  panel_id IN (SELECT id FROM panels WHERE owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);
```

---

### Part 3: Fix Theme Sync - Hero Text & Design Customization Integration

**File:** `src/components/buyer-themes/BuyerThemeWrapper.tsx` (line 190)

Change the heroTitle fallback from empty string to a sensible default:

```typescript
heroTitle: branding.heroTitle || 'Boost Your Social Media Presence',
heroSubtitle: branding.heroSubtitle || 'Get real followers, likes, and views at the lowest prices.',
heroBadgeText: branding.heroBadgeText || '#1 SMM Panel',
```

Also ensure `heroAnimatedTextStyle` uses the theme-specific default:

```typescript
heroAnimatedTextStyle: branding.heroAnimatedTextStyle || getThemeDefaultAnimationStyle(themeKey),
heroAnimatedTextPosition: branding.heroAnimatedTextPosition || 'last',
```

This requires importing `getThemeDefaultAnimationStyle` and passing `themeKey` into the customization memo.

---

### Part 4: Fix Theme Dark/Light Mode Race Condition

**Root Cause Fix:** The `ThemeProvider` in TenantRouter should use the panel's theme mode instead of hardcoded "dark".

**File:** `src/pages/TenantRouter.tsx` (line 331)

Change:
```typescript
<ThemeProvider defaultTheme="dark" storageKey="smm-panel-theme">
```
To:
```typescript
<ThemeProvider defaultTheme={panelDefaultTheme} storageKey={`smm-tenant-theme-${panel.id}`}>
```

Using a panel-specific storage key prevents cross-contamination between different tenant sites and the panel owner dashboard.

**File:** Each theme wrapper (BuyerThemeDefault, BuyerThemeSMMStay, BuyerThemeAliPanel, etc.)

The theme wrappers all have CSS like:
```css
.buyer-theme-smmstay {
  --theme-background: #000000;
  background: var(--theme-background);
  color: var(--theme-text);
}
```

These hardcoded values only work for dark mode. For light mode support, add light mode CSS overrides:

```css
.light .buyer-theme-smmstay,
.buyer-theme-smmstay.light-mode {
  --theme-background: #FFFFFF;
  --theme-surface: #F8F9FA;
  --theme-text: #1A1A2E;
  --theme-muted: #6B7280;
}
```

This needs to be done for each theme that supports light mode (all except SMMVisit which is light-only).

---

### Part 5: Enhance Buyer Support Page

**File:** `src/pages/buyer/BuyerSupport.tsx`

Add three new sections:

#### 5.1 FAQ Section
Add a collapsible FAQ section above the ticket kanban using Accordion component. FAQs will be fetched from panel's `custom_branding.faqs` array (already stored in the database from Design Customization).

```typescript
// Fetch FAQs from panel custom_branding
const faqs = panelCustomization?.faqs || defaultFAQs;

// Default FAQ items
const defaultFAQs = [
  { question: "How long does delivery take?", answer: "Most orders start within minutes..." },
  { question: "How do I add funds?", answer: "Go to the Deposit page..." },
  { question: "What payment methods are accepted?", answer: "We accept various payment methods..." },
  { question: "Can I get a refund?", answer: "Contact support for refund requests..." },
];
```

#### 5.2 Live Chat Integration Tab
Add a "Live Chat" tab alongside the ticket kanban that connects to the existing `chat_sessions` system. When a buyer clicks "Talk to Human" from the floating chat widget, the session appears here AND in the panel owner's ChatInbox.

```typescript
// Tab layout: "Tickets" | "Live Chat" | "FAQ"
<Tabs defaultValue="tickets">
  <TabsList>
    <TabsTrigger value="tickets">Tickets</TabsTrigger>
    <TabsTrigger value="chat">Live Chat</TabsTrigger>
    <TabsTrigger value="faq">FAQ</TabsTrigger>
  </TabsList>
  ...
</Tabs>
```

The Live Chat tab will:
- Show existing chat sessions for the buyer
- Allow sending messages that sync to `chat_sessions` table
- Subscribe to realtime updates from the panel owner (ChatInbox)
- When a buyer opens a chat session, it uses the same `chat_sessions` table that `ChatInbox.tsx` reads from

#### 5.3 Ticket Status Updates
Allow buyers to update ticket status (mark as resolved) and add the panel owner's ChatInbox context actions.

---

## Files to Modify Summary

| File | Changes |
|------|---------|
| `src/pages/buyer/BuyerContact.tsx` | Default email to support@homeofsmm.com |
| `src/pages/panel/ProviderAds.tsx` | Add `user_id` and use `ad_purchase` type for transactions |
| `src/components/buyer-themes/BuyerThemeWrapper.tsx` | Fix heroTitle fallback, add animated text style default |
| `src/pages/TenantRouter.tsx` | Use panel-specific theme storage key, match default theme |
| `src/components/buyer-themes/BuyerThemeDefault.tsx` | Add light mode CSS variables |
| `src/components/buyer-themes/BuyerThemeSMMStay.tsx` | Add light mode CSS variables |
| `src/components/buyer-themes/BuyerThemeAliPanel.tsx` | Add light mode CSS variables |
| `src/components/buyer-themes/BuyerThemeFlySMM.tsx` | Add light mode CSS variables |
| `src/components/buyer-themes/BuyerThemeTGRef.tsx` | Add light mode CSS variables |
| `src/pages/buyer/BuyerSupport.tsx` | Add FAQ section, live chat tab, ticket updates |
| **Database (RLS)** | Update transactions SELECT/INSERT policies for panel_id access |

---

## Technical Notes

### Theme Race Condition Explanation
```
Timeline on initial tenant load:
1. ThemeProvider reads localStorage['smm-panel-theme'] -> sets <html class="dark">
2. BuyerThemeProvider reads localStorage['buyer-theme-{panelId}'] -> sets <html class="dark"> (correct)
3. Theme wrapper renders <div class="dark">...</div>
4. Tailwind dark: utilities resolve against <html> class

Problem: If step 1 sets "light" (from panel owner dashboard visit), 
step 2 hasn't run yet, and the page flashes wrong colors.

Fix: Use panel-specific storage key so tenant theme never conflicts with dashboard theme.
```

### Transaction RLS Fix
The current INSERT policy only checks `user_id`, but ad purchases are panel-level operations. The updated policy allows inserts when the user owns the panel referenced by `panel_id`.

### Live Chat Sync Architecture
```
Buyer clicks "Talk to Human" in FloatingChatWidget
  -> Creates row in chat_sessions (panel_id, buyer_id, status: 'active')
  -> Messages stored in chat_messages table
  -> Panel owner's ChatInbox subscribes to chat_sessions realtime
  -> Both parties see messages via realtime subscription
  -> BuyerSupport "Live Chat" tab shows same sessions
```

