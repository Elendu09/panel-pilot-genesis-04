
-- Allow 'ai' sender_type in chat_messages
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_sender_type_check 
  CHECK (sender_type IN ('visitor', 'owner', 'ai'));
