-- Create client_custom_prices table for per-customer service pricing
CREATE TABLE IF NOT EXISTS public.client_custom_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES panels(id) ON DELETE CASCADE,
  client_id UUID REFERENCES client_users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  custom_price NUMERIC,
  discount_percent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(panel_id, client_id, service_id)
);

-- Enable RLS
ALTER TABLE public.client_custom_prices ENABLE ROW LEVEL SECURITY;

-- Panel owners can manage custom prices for their panel's clients
CREATE POLICY "Panel owners can manage client custom prices"
ON public.client_custom_prices
FOR ALL
USING (
  panel_id IN (
    SELECT panels.id FROM panels
    WHERE panels.owner_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  panel_id IN (
    SELECT panels.id FROM panels
    WHERE panels.owner_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
    )
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_client_custom_prices_updated_at
  BEFORE UPDATE ON public.client_custom_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();