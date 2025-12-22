-- Create panel_api_keys table for storing real API keys
CREATE TABLE public.panel_api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create api_logs table for storing real API call logs
CREATE TABLE public.api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_panel_api_keys_panel_id ON public.panel_api_keys(panel_id);
CREATE INDEX idx_api_logs_panel_id ON public.api_logs(panel_id);
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.panel_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for panel_api_keys
CREATE POLICY "Panel owners can manage their API keys"
ON public.panel_api_keys
FOR ALL
USING (
  panel_id IN (
    SELECT p.id FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
)
WITH CHECK (
  panel_id IN (
    SELECT p.id FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

-- RLS policies for api_logs
CREATE POLICY "Panel owners can view their API logs"
ON public.api_logs
FOR SELECT
USING (
  panel_id IN (
    SELECT p.id FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert API logs"
ON public.api_logs
FOR INSERT
WITH CHECK (true);

-- Function to generate a secure API key
CREATE OR REPLACE FUNCTION public.generate_panel_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN 'sk_live_' || encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_panel_api_keys_updated_at
BEFORE UPDATE ON public.panel_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();