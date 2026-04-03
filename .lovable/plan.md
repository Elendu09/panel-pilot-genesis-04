

# Plan: Integrate AI into Live Chat, Fix Chat History Saving, and Fix Tenant Ticket Errors

## Issues Found

### 1. "Continue with AI" Opens a Separate FloatingChatWidget Modal (Wrong)
**Current**: When user clicks "Continue with AI" (line 816), it opens `FloatingChatWidget` in a full-screen overlay. This is a completely separate AI chat — not integrated into the live chat conversation. Messages sent to AI don't appear in the live chat history, and the user loses context.

**Fix**: Replace the modal approach with an inline AI mode inside the live chat itself. When "Continue with AI" is clicked, set a flag (`aiMode = true`). Messages typed while in AI mode are:
1. Saved to `chat_messages` as normal (so panel owner sees them in history)
2. Also sent to `ai-chat-reply` edge function for an AI response
3. AI responses are saved as `chat_messages` with `sender_type: 'ai'` (new type) so they appear in the conversation thread
4. A "Continue with Human" button lets the user switch back to waiting for a human reply

This keeps everything in one conversation thread, visible to both tenant user and panel owner.

### 2. Chat History Not Saving / Not Visible in Archived
**Current**: The `list-chat-sessions` handler returns ALL sessions (both active and closed). The archived filter on the tenant side checks for `status === 'closed' || status === 'archived'`, which should work. However, messages may not persist correctly because:
- The `end-chat` action sets `status: 'closed'` but the `updated_at` column may not exist on `chat_sessions` (the original schema doesn't include it)
- The `handleEndChat` edge function may silently fail if the `updated_at` column doesn't exist

**Fix**: Verify and add `updated_at` column if missing. Also ensure the session list query in `list-chat-sessions` returns sessions ordered properly. Add a `last_message_at` update when ending chat.

### 3. Tenant Ticket Errors
**Current**: The `handleResolveTicket` function (line 347) uses `supabase.from('support_tickets').update()` directly — this is the authenticated Supabase client but the tenant buyer uses custom auth (no Supabase JWT), so this will fail with RLS. Also, the `create-support-ticket` action uses `sender: 'user'` but the ticket view dialog checks `msg.sender === 'buyer'` for styling.

**Fix**: 
- Route `handleResolveTicket` through `buyer-auth` edge function
- Normalize sender field: use `'buyer'` consistently in both creation and display
- Add error handling for panel notification insert (line 271) — `panel_notifications` may have RLS blocking anonymous inserts

### 4. `sender_type: 'ai'` Support in Database
**Current**: The `chat_messages` table has a CHECK constraint: `sender_type IN ('visitor', 'owner')`. Adding AI messages requires adding `'ai'` as a valid sender type.

**Fix**: Alter the CHECK constraint to allow `'ai'` as a sender_type.

### 5. Panel Owner Sees AI Messages in Chat
When a tenant uses AI mode, the panel owner should see those messages in `ChatInbox.tsx` with a distinct AI badge, so they know the context.

---

## Implementation Details

### Database Migration
```sql
-- Allow 'ai' sender_type in chat_messages
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_sender_type_check 
  CHECK (sender_type IN ('visitor', 'owner', 'ai'));

-- Ensure updated_at column exists on chat_sessions
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
```

### Edge Function Changes (`buyer-auth`)
- Add `send-ai-chat-message` action: receives user message, saves it as `visitor` message, calls `ai-chat-reply` function internally, saves AI response as `sender_type: 'ai'`, returns both messages
- Fix `create-support-ticket`: change `sender: 'user'` to `sender: 'buyer'` for consistency

### Tenant Live Chat (`BuyerSupport.tsx`)
- Remove the `FloatingChatWidget` modal overlay for AI
- Add `aiMode` state boolean
- When `aiMode` is true, messages go through `send-ai-chat-message` action
- Show "Continue with Human" button when in AI mode
- Show "Continue with AI" button when in human mode
- AI messages render with a robot avatar and distinct styling
- All messages (visitor, owner, AI) remain in one thread

### Panel Owner Chat (`ChatInbox.tsx`)
- Update `ChatMessages` component to handle `sender_type: 'ai'` with a robot icon and "AI Assistant" label
- No functional changes needed — panel owner already sees all messages via realtime subscription

### Ticket Sender Normalization
- Fix `handleResolveTicket` to route through edge function
- Fix sender field mismatch (`'user'` vs `'buyer'`)

---

## Files to Modify

| File | Changes |
|------|---------|
| Database migration | Add `'ai'` to `chat_messages` sender_type CHECK; add `updated_at` to `chat_sessions` |
| `supabase/functions/buyer-auth/index.ts` | Add `send-ai-chat-message` action; fix ticket sender field |
| `src/pages/buyer/BuyerSupport.tsx` | Replace FloatingChatWidget modal with inline AI mode; fix `handleResolveTicket` to use edge function; normalize sender checks |
| `src/pages/panel/ChatInbox.tsx` | Add AI message styling with robot avatar in `ChatMessages` component |
| `supabase/functions/ai-chat-reply/index.ts` | No changes needed — already functional |

