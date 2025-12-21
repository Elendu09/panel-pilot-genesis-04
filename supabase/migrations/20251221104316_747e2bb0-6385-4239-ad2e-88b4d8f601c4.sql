-- Create plan type enum
CREATE TYPE public.subscription_plan AS ENUM ('free', 'basic', 'pro');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');

-- Create panel_subscriptions table
CREATE TABLE public.panel_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE NOT NULL,
  plan_type subscription_plan NOT NULL DEFAULT 'free',
  price NUMERIC NOT NULL DEFAULT 0.00,
  status subscription_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(panel_id)
);

-- Add balance column to panels table
ALTER TABLE public.panels ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0.00;

-- Enable RLS
ALTER TABLE public.panel_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for panel_subscriptions
CREATE POLICY "Panel owners can view their subscription"
ON public.panel_subscriptions
FOR SELECT
USING (panel_id IN (
  SELECT p.id FROM public.panels p
  JOIN public.profiles pr ON p.owner_id = pr.id
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Panel owners can insert subscription"
ON public.panel_subscriptions
FOR INSERT
WITH CHECK (panel_id IN (
  SELECT p.id FROM public.panels p
  JOIN public.profiles pr ON p.owner_id = pr.id
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Panel owners can update their subscription"
ON public.panel_subscriptions
FOR UPDATE
USING (panel_id IN (
  SELECT p.id FROM public.panels p
  JOIN public.profiles pr ON p.owner_id = pr.id
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all subscriptions"
ON public.panel_subscriptions
FOR ALL
USING (public.is_admin());

-- Add updated_at trigger
CREATE TRIGGER update_panel_subscriptions_updated_at
BEFORE UPDATE ON public.panel_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;