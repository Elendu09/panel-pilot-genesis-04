-- Create buyer_cart table for persistent cart storage
CREATE TABLE public.buyer_cart (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.client_users(id) ON DELETE CASCADE,
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1000,
  target_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(buyer_id, service_id, target_url)
);

-- Enable RLS
ALTER TABLE public.buyer_cart ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buyer_cart
CREATE POLICY "Buyers can view their own cart items"
ON public.buyer_cart
FOR SELECT
USING (true);

CREATE POLICY "Buyers can add items to their cart"
ON public.buyer_cart
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Buyers can update their cart items"
ON public.buyer_cart
FOR UPDATE
USING (true);

CREATE POLICY "Buyers can delete their cart items"
ON public.buyer_cart
FOR DELETE
USING (true);

-- Create index for faster queries
CREATE INDEX idx_buyer_cart_buyer_id ON public.buyer_cart(buyer_id);
CREATE INDEX idx_buyer_cart_panel_id ON public.buyer_cart(panel_id);

-- Add updated_at trigger
CREATE TRIGGER update_buyer_cart_updated_at
BEFORE UPDATE ON public.buyer_cart
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for cart updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.buyer_cart;