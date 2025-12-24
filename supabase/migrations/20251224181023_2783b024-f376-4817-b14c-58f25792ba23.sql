-- Create chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  visitor_name TEXT,
  visitor_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'owner')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat sessions policies
CREATE POLICY "Panel owners can view their chat sessions"
ON public.chat_sessions FOR SELECT
USING (panel_id IN (
  SELECT id FROM panels WHERE owner_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Panel owners can update their chat sessions"
ON public.chat_sessions FOR UPDATE
USING (panel_id IN (
  SELECT id FROM panels WHERE owner_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Anyone can create chat sessions"
ON public.chat_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can view their own sessions by visitor_id"
ON public.chat_sessions FOR SELECT
USING (true);

-- Chat messages policies
CREATE POLICY "Panel owners can view messages in their sessions"
ON public.chat_messages FOR SELECT
USING (session_id IN (
  SELECT id FROM chat_sessions WHERE panel_id IN (
    SELECT id FROM panels WHERE owner_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
));

CREATE POLICY "Anyone can insert messages"
ON public.chat_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Panel owners can update messages"
ON public.chat_messages FOR UPDATE
USING (session_id IN (
  SELECT id FROM chat_sessions WHERE panel_id IN (
    SELECT id FROM panels WHERE owner_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
));

CREATE POLICY "Public can view messages in their sessions"
ON public.chat_messages FOR SELECT
USING (true);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;

-- Create indexes for performance
CREATE INDEX idx_chat_sessions_panel_id ON public.chat_sessions(panel_id);
CREATE INDEX idx_chat_sessions_visitor_id ON public.chat_sessions(visitor_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Update trigger for chat sessions
CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();