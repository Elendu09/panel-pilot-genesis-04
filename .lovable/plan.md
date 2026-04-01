

# Plan: Fix Panel Owner Chat Send, Tenant Ticket Flow, Add Conversation Rating/End, Fix Build Error

## Issues

### 1. Panel Owner Cannot Send Chat Messages (RLS Block)
**Root cause**: `chat_messages` INSERT policy is `TO service_role` only (migration `20260212`). Panel owner's `ChatInbox.sendMessage()` (line 414) uses the anon/authenticated Supabase client directly — this gets rejected by RLS.

**Fix**: Add an RLS policy allowing authenticated panel owners to insert chat messages into sessions they own. Also add UPDATE policy for mark-as-read.

```sql
CREATE POLICY "Panel owners can insert chat messages"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (session_id IN (SELECT id FROM public.chat_sessions WHERE public.is_panel_owner(panel_id)));

CREATE POLICY "Panel owners can update chat messages"
ON public.chat_messages FOR UPDATE TO authenticated
USING (session_id IN (SELECT id FROM public.chat_sessions WHERE public.is_panel_owner(panel_id)));

CREATE POLICY "Panel owners can update chat sessions"
ON public.chat_sessions FOR UPDATE TO authenticated
USING (public.is_panel_owner(panel_id));
```

### 2. Tenant Ticket Reply Uses Direct Supabase (RLS Block)
**Root cause**: `BuyerSupport.handleSendMessage()` (line 287) calls `supabase.from('support_tickets').update()` directly. Tenant buyers use custom auth (no Supabase JWT), so this fails silently or errors.

**Fix**: Route ticket reply through `buyer-auth` edge function. Add a `reply-ticket` action that appends the message to the ticket's `messages` JSONB array using the service role.

### 3. Tenant Cannot End/Close Ticket
**Fix**: Add `close-ticket` action to `buyer-auth` edge function. Update ticket status to `closed`. Add "Close Ticket" button in BuyerSupport ticket view dialog.

### 4. Conversation Rating and End Chat
**Fix**: 
- Add `end-chat` and `rate-chat` actions to `buyer-auth` edge function
- `end-chat`: Updates `chat_sessions.status` to `closed`
- `rate-chat`: Adds rating to a `metadata` JSONB column or a separate field
- In BuyerSupport chat UI: Add "End Conversation" button and a 1-5 star rating prompt when conversation ends

### 5. Panel Owner Typing Indicator Error
**Root cause**: `ChatInbox.broadcastTyping()` (line 399) calls `supabase.channel().send()` on a channel that may not be subscribed yet. The channel is only subscribed in the `useEffect` for the selected session, but `broadcastTyping` creates a new channel reference.

**Fix**: Store the typing channel ref and reuse it, or subscribe to the typing channel before broadcasting.

### 6. Build Error in `dns-lookup/index.ts`
**Root cause**: TypeScript union type — `processedResults` items can be either resolved (with `value`) or error (without `value`). Line 261 accesses `.value` without narrowing.

**Fix**: Add explicit type narrowing: `.filter(r => r.status === "resolved" && 'value' in r && r.value)` and cast appropriately.

---

## Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add INSERT/UPDATE policies for panel owners on `chat_messages` and `chat_sessions`; add `rating` column to `chat_sessions` |
| `supabase/functions/buyer-auth/index.ts` | Add `reply-ticket`, `close-ticket`, `end-chat`, `rate-chat` actions |
| `src/pages/buyer/BuyerSupport.tsx` | Route ticket replies through edge function; add End Conversation button with rating UI; add Close Ticket button |
| `src/pages/panel/ChatInbox.tsx` | Fix typing broadcast channel reference; ensure send uses subscribed channel |
| `supabase/functions/dns-lookup/index.ts` | Fix TypeScript union type narrowing on lines 261-262 |

