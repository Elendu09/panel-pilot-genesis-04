-- Create promo_codes table for discount system
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_amount NUMERIC DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_panel_code UNIQUE (panel_id, code)
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Panel owners can manage their promo codes
CREATE POLICY "Panel owners can manage promo codes"
ON public.promo_codes
FOR ALL
USING (panel_id IN (
  SELECT panels.id FROM panels
  WHERE panels.owner_id IN (
    SELECT profiles.id FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
));

-- Public can view active promo codes for validation
CREATE POLICY "Public can view active promo codes"
ON public.promo_codes
FOR SELECT
USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Create index for fast code lookup
CREATE INDEX idx_promo_codes_panel_code ON public.promo_codes(panel_id, code);
CREATE INDEX idx_promo_codes_active ON public.promo_codes(panel_id, is_active) WHERE is_active = true;