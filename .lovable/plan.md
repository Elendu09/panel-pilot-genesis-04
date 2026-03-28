

# Plan: Hero Text "Launch", Custom Domain Security, Subdomain Auto-fill, and Live Chat Fixes

## 1. Change Hero Text to "Launch" (keep CTA button as "Create Panel")

Update `home.title.line1` in all 10 languages in `platform-translations.ts` to use "Launch" equivalents. The `home.cta.create` key stays unchanged ("Create panel", "Crear panel", etc.).

| Language | Current `home.title.line1` | New value |
|----------|---------------------------|-----------|
| EN | "Create Your Own" | "Launch Your Own" |
| ES | "Crea tu propio" | "Lanza tu propio" |
| PT | "Crie seu próprio" | "Lance seu próprio" |
| AR | "أنشئ" | "أطلق" |
| TR | "Kendi" | "Kendi" (line2 changes: "smm panelinizi başlatın") |
| RU | "Создайте свою" | "Запустите свою" |
| FR | "Créez votre propre" | "Lancez votre propre" |
| DE | "Erstellen Sie Ihr eigenes" | "Starten Sie Ihr eigenes" |
| ZH | "创建您自己的" | "启动您自己的" |
| HI | "अपना खुद का" | "अपना खुद का" (line2 changes: "SMM पैनल लॉन्च करें") |

**File**: `src/lib/platform-translations.ts` — update only `home.title.line1` (and line2 for TR/HI where verb is in line2).

---

## 2. Fix Custom Domain Security — Prevent Unauthorized Domain Loading

**Root cause**: `useTenant.tsx` has aggressive fallback searches (PRIORITY 4 and the extracted subdomain fallback) that match ANY domain's first segment against existing panel subdomains. If someone adds `mypanel.com` to Vercel and `mypanel` matches a panel subdomain, it loads that panel's full storefront + auth — even though the domain was never configured in the platform.

**Security fix in `useTenant.tsx`**:

1. **Remove PRIORITY 4** (lines 432-444) — fallback subdomain search for non-platform domains. This is dangerous because it matches arbitrary custom domains to panels by extracting their hostname prefix.

2. **Remove the extracted subdomain fallback** (lines 446-466) — same issue, tries `hostname.split('.')[0]` as subdomain.

3. **For custom domains (PRIORITY 0, 2, 3)**: Only serve the panel if the domain is explicitly registered:
   - PRIORITY 0: `custom_domain` column match — keep but add a verification check
   - PRIORITY 2: `panels.custom_domain` OR match — keep  
   - PRIORITY 3: `panel_domains` table with `verification_status = 'verified'` — already correct

4. **After removing fallbacks**: If no panel found for a custom domain, show "Panel not found" (existing behavior) instead of accidentally matching a panel.

**File**: `src/hooks/useTenant.tsx`

---

## 3. Fix Subdomain Auto-fill in Onboarding Domain Step

**Root cause**: `PanelOnboarding.tsx` line 124-131 has a `useEffect` that auto-generates subdomain from `panelName` whenever `subdomain` is empty. When the user navigates to the domain step, if subdomain is `''`, it fills in a generated value (e.g., first letters of panel name).

**Fix**: Change the condition to only auto-generate on the Name step (step 1), not when the user reaches the Domain step. Add a flag `hasManuallyEditedSubdomain` or simply remove the auto-generate effect and let the subdomain input start empty.

Simpler fix: Only run auto-generate when the current step is the name step, not on the domain step. Or add a `useRef` flag that tracks whether the user has already visited the domain step.

**File**: `src/pages/panel/PanelOnboarding.tsx` — gate the auto-generate `useEffect` with a step check or remove auto-generation entirely so the subdomain input starts blank.

---

## 4. Fix Live Chat — Messages Not Sending

**Root cause**: Two bugs:

**Bug A**: `handleCreateChatSession` is called in the edge function dispatch (line 425) but the function is **never defined** in `buyer-auth/index.ts`. This means `handleStartChat()` always fails with a runtime error.

**Fix**: Add the `handleCreateChatSession` function to `buyer-auth/index.ts` that:
- Validates `buyerId` and `panelId`
- Inserts into `chat_sessions` using service role
- Returns the created session

**Bug B**: In `BuyerSupport.tsx` lines 575-583, after `await handleStartChat()`, `selectedChat` is still `null` because React state hasn't updated yet. So `handleSendChatMessage()` returns early (line 316: `if (!chatInput.trim() || !selectedChat) return`).

**Fix**: Make `handleStartChat` return the session, then pass it directly to a modified send function:

```typescript
const handleStartChat = async (): Promise<ChatSession | null> => {
  // ... create session via edge function ...
  const session = fnData.session;
  setChatSessions(prev => [session, ...prev]);
  setSelectedChat(session);
  return session;
};

// In send flow:
const handleSendWithSession = async (session: ChatSession) => {
  // Send via edge function (RLS bypass) not direct supabase insert
};
```

**Bug C**: `handleSendChatMessage` uses direct `supabase.from('chat_messages').insert(...)` which hits RLS since buyer uses custom auth. Must route through edge function.

**Fix**: Add a `send-chat-message` action to `buyer-auth/index.ts` and call it from the frontend instead of direct insert.

**Quick reply chips**: Add pre-defined quick reply buttons above the input area:
```tsx
const quickReplies = [
  { label: '💰 Deposit Issue', text: 'I need help with a deposit' },
  { label: '📦 Order Issue', text: 'I have an issue with my order' },
  { label: '💳 Transaction', text: 'I need help with a transaction' },
  { label: '🔑 Account', text: 'I need help with my account' },
];
```

Show these when no messages exist or as a persistent row above the input.

**Files**: `supabase/functions/buyer-auth/index.ts`, `src/pages/buyer/BuyerSupport.tsx`

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/platform-translations.ts` | Update `home.title.line1` to "Launch" in all 10 languages |
| `src/hooks/useTenant.tsx` | Remove PRIORITY 4 and extracted subdomain fallback (security fix) |
| `src/pages/panel/PanelOnboarding.tsx` | Gate subdomain auto-generate to not fill on domain step |
| `supabase/functions/buyer-auth/index.ts` | Add `handleCreateChatSession` + `handleSendChatMessage` functions |
| `src/pages/buyer/BuyerSupport.tsx` | Fix send flow (await session before send), add quick reply chips, route messages through edge function |

