-- Add referral system columns to client_users table
ALTER TABLE public.client_users 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.client_users(id),
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_discount NUMERIC DEFAULT 0;

-- Create index on referral_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_users_referral_code ON public.client_users(referral_code);

-- Create function to generate unique referral code on insert
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto referral code generation
DROP TRIGGER IF EXISTS trigger_generate_referral_code ON public.client_users;
CREATE TRIGGER trigger_generate_referral_code
BEFORE INSERT ON public.client_users
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();

-- Create referral_rewards table to track rewards
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID REFERENCES public.panels(id),
  referrer_id UUID NOT NULL REFERENCES public.client_users(id),
  referred_id UUID NOT NULL REFERENCES public.client_users(id),
  order_id UUID REFERENCES public.orders(id),
  order_amount NUMERIC NOT NULL,
  reward_percentage NUMERIC DEFAULT 5.00,
  reward_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on referral_rewards
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policy for panel owners to view their referral rewards
CREATE POLICY "Panel owners can view their referral rewards"
ON public.referral_rewards
FOR SELECT
USING (panel_id IN (
  SELECT panels.id FROM panels
  WHERE panels.owner_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
));