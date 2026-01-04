-- Add refill and cancel tracking columns to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS refill_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cancel_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS average_time TEXT;

-- Create order_refills table for tracking refill requests
CREATE TABLE IF NOT EXISTS public.order_refills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  external_refill_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on order_refills
ALTER TABLE public.order_refills ENABLE ROW LEVEL SECURITY;

-- Panel owners can manage refills for their orders
CREATE POLICY "Panel owners can manage order refills"
ON public.order_refills
FOR ALL
USING (panel_id IN (
  SELECT p.id FROM panels p
  JOIN profiles pr ON p.owner_id = pr.id
  WHERE pr.user_id = auth.uid()
));

-- Buyers can view their own refill requests
CREATE POLICY "Buyers can view their order refills"
ON public.order_refills
FOR SELECT
USING (order_id IN (
  SELECT id FROM orders WHERE buyer_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
));

-- System can insert refills
CREATE POLICY "System can insert refills"
ON public.order_refills
FOR INSERT
WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_refills_order_id ON public.order_refills(order_id);
CREATE INDEX IF NOT EXISTS idx_order_refills_panel_id ON public.order_refills(panel_id);
CREATE INDEX IF NOT EXISTS idx_services_refill_cancel ON public.services(refill_available, cancel_available);