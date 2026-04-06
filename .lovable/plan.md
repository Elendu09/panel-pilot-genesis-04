

# Plan: Fix Shopping Cart Tab Layout, AI Markdown Rendering, Webhook 404, and Currency in Deposits

## 1. Shopping Cart Mass Order / Repeat Tab Positioning

**Problem**: The `TabsContent` for "bulk" and "repeat" tabs are being pushed below the viewport. The `Tabs` container uses `flex-1 flex flex-col` but the tab content needs explicit height constraints to fill the available space above, not below.

**Fix**: Add `min-h-0` to the `Tabs` container and `h-0 flex-1` to the bulk/repeat `TabsContent` so flexbox allocates space from the top. The `ScrollArea` inside already handles overflow.

**File**: `src/components/buyer/ShoppingCart.tsx`
- Line 234: Add `min-h-0` to `Tabs` className
- Lines 431, 446: Change `TabsContent` className to include `h-0` so content anchors to the top of available space

---

## 2. AI Response Markdown Rendering (Bold, Paragraphs, Lists)

**Problem**: AI responses use `**bold**`, bullet points, and numbered lists, but both `BuyerSupport.tsx` (line 1077) and `ChatInbox.tsx` (line 713) render with `<p className="whitespace-pre-wrap">{msg.content}</p>` — raw text that shows literal `**` asterisks instead of bold formatting.

**Fix**: 
- Install `react-markdown` package
- Create a small `ChatMarkdown` component that renders AI messages through `ReactMarkdown` with `prose prose-sm` styling
- Use it for `sender_type === 'ai'` messages in both files; keep plain text rendering for visitor/owner messages

**Files**: 
- `package.json` — add `react-markdown`
- `src/components/chat/ChatMarkdown.tsx` — new component
- `src/pages/buyer/BuyerSupport.tsx` — replace `<p>` with `<ChatMarkdown>` for AI messages (2 locations around lines 1077 and 1160)
- `src/pages/panel/ChatInbox.tsx` — replace `<p>` with `<ChatMarkdown>` for AI messages (line 713)

---

## 3. Panel Owner Webhook Test Returns 404

**Problem**: The `testWebhook` function in `use-webhooks.tsx` (line 131) calls `webhook-notify` edge function with `{ event, payload, webhookUrl }` — but the edge function requires a `webhookId` parameter (line 156: "Webhook ID is required"). When no `webhookId` is sent, it returns 400. The panel owner's API Management page only has a URL input, not an `admin_webhooks` table record.

**Fix**: Update the `webhook-notify` edge function to support a `webhookUrl` fallback when `webhookId` is not provided. If `webhookUrl` is passed directly (for panel owner webhook testing), skip the `admin_webhooks` lookup and send directly to that URL. This restores the original direct-URL test flow for panel owners while keeping the admin webhook system intact.

**File**: `supabase/functions/webhook-notify/index.ts` — lines 155-160: instead of returning error when no `webhookId`, check if `webhookUrl` was provided in the body and use it directly.

Also update `use-webhooks.tsx` to pass `webhookUrl` in the body correctly (it currently does, but the edge function ignores it).

---

## 4. Currency Integration in Tenant Add Funds (BuyerDeposit)

**Problem**: `BuyerDeposit.tsx` hardcodes USD (`$` symbols, `currency: 'usd'` on line 514). The `CurrencyContext` is already used in New Order but not in the deposit page.

**Fix**:
- Import `useCurrency` in `BuyerDeposit.tsx`
- Replace `$` hardcoded symbols with `currencyConfig.symbol`
- Pass selected `currency` code to `process-payment` edge function instead of hardcoded `'usd'`
- Display amounts using `formatPrice` from currency context
- Add `CurrencySelector` dropdown next to the "Add Funds" header so buyers can choose their deposit currency
- In the payment record and process-payment call, include the currency code and the conversion rate so panel owner sees the USD equivalent

**Panel Owner Visibility**: In the panel owner's transaction history / billing page, show the original currency alongside the USD equivalent using the exchange rate at time of deposit. This is display-only — the stored amount remains in USD for consistency.

**Files**:
- `src/pages/buyer/BuyerDeposit.tsx` — integrate `useCurrency`, dynamic currency display, pass currency to payment
- `src/components/billing/QuickDeposit.tsx` — same currency integration for panel owner deposits (this uses admin gateways, keep USD default but allow selection)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/buyer/ShoppingCart.tsx` | Add `min-h-0` to Tabs, `h-0` to bulk/repeat TabsContent |
| `src/components/chat/ChatMarkdown.tsx` | New — ReactMarkdown wrapper for AI messages |
| `src/pages/buyer/BuyerSupport.tsx` | Use ChatMarkdown for AI sender_type messages |
| `src/pages/panel/ChatInbox.tsx` | Use ChatMarkdown for AI sender_type messages |
| `supabase/functions/webhook-notify/index.ts` | Support direct `webhookUrl` fallback when no `webhookId` |
| `src/pages/buyer/BuyerDeposit.tsx` | Integrate CurrencyContext, dynamic symbols, pass currency to payment |
| `package.json` | Add `react-markdown` dependency |

