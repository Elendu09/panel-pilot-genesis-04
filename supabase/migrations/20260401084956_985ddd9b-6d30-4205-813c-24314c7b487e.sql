
-- Add rating column to chat_sessions
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS rating integer;

-- RLS: Panel owners can INSERT chat messages into sessions they own
CREATE POLICY "Panel owners can insert chat messages"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (session_id IN (SELECT id FROM public.chat_sessions WHERE public.is_panel_owner(panel_id)));

-- RLS: Panel owners can UPDATE chat messages (mark as read)
CREATE POLICY "Panel owners can update chat messages"
ON public.chat_messages FOR UPDATE TO authenticated
USING (session_id IN (SELECT id FROM public.chat_sessions WHERE public.is_panel_owner(panel_id)));

-- RLS: Panel owners can UPDATE chat sessions (close, update last_message_at)
CREATE POLICY "Panel owners can update chat sessions"
ON public.chat_sessions FOR UPDATE TO authenticated
USING (public.is_panel_owner(panel_id));
