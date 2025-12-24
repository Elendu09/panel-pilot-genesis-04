-- Add more chat platforms to panel_settings
ALTER TABLE public.panel_settings
ADD COLUMN IF NOT EXISTS floating_chat_messenger TEXT,
ADD COLUMN IF NOT EXISTS floating_chat_discord TEXT,
ADD COLUMN IF NOT EXISTS floating_chat_custom_url TEXT,
ADD COLUMN IF NOT EXISTS floating_chat_custom_label TEXT DEFAULT 'Live Chat',
ADD COLUMN IF NOT EXISTS live_chat_enabled BOOLEAN DEFAULT true;

-- Create canned responses table for quick replies
CREATE TABLE public.canned_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  shortcut TEXT,
  category TEXT DEFAULT 'general',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.canned_responses ENABLE ROW LEVEL SECURITY;

-- RLS policies for canned responses
CREATE POLICY "Panel owners can manage their canned responses"
ON public.canned_responses FOR ALL
USING (panel_id IN (
  SELECT id FROM panels WHERE owner_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
));

-- Create index for quick lookup
CREATE INDEX idx_canned_responses_panel_id ON public.canned_responses(panel_id);
CREATE INDEX idx_canned_responses_shortcut ON public.canned_responses(shortcut);

-- Add trigger for updated_at
CREATE TRIGGER update_canned_responses_updated_at
BEFORE UPDATE ON public.canned_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();