-- Add currency fields to providers table
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS currency_rate_to_usd NUMERIC(16,6) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS currency_last_updated TIMESTAMPTZ DEFAULT now();

-- Add currency fields to provider_services table
ALTER TABLE public.provider_services 
ADD COLUMN IF NOT EXISTS raw_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(16,6);

-- Add cost_usd to services table for normalized cost tracking
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS cost_usd NUMERIC(16,6);

-- Create currency_rates table for global exchange rate management
CREATE TABLE IF NOT EXISTS public.currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code TEXT UNIQUE NOT NULL,
  currency_name TEXT NOT NULL,
  rate_to_usd NUMERIC(16,6) NOT NULL,
  is_auto_updated BOOLEAN DEFAULT true,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

-- Currency rates are readable by all authenticated users
CREATE POLICY "Currency rates are readable by authenticated users"
ON public.currency_rates FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify currency rates
CREATE POLICY "Admins can manage currency rates"
ON public.currency_rates FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Seed common currencies
INSERT INTO public.currency_rates (currency_code, currency_name, rate_to_usd) VALUES
  ('USD', 'US Dollar', 1.0),
  ('NGN', 'Nigerian Naira', 0.00062),
  ('INR', 'Indian Rupee', 0.012),
  ('PKR', 'Pakistani Rupee', 0.0036),
  ('EUR', 'Euro', 1.08),
  ('GBP', 'British Pound', 1.26),
  ('BRL', 'Brazilian Real', 0.20),
  ('RUB', 'Russian Ruble', 0.011),
  ('IDR', 'Indonesian Rupiah', 0.000063),
  ('PHP', 'Philippine Peso', 0.018),
  ('BDT', 'Bangladeshi Taka', 0.0091),
  ('VND', 'Vietnamese Dong', 0.000041),
  ('TRY', 'Turkish Lira', 0.029),
  ('EGP', 'Egyptian Pound', 0.020),
  ('KES', 'Kenyan Shilling', 0.0077),
  ('ZAR', 'South African Rand', 0.054),
  ('AED', 'UAE Dirham', 0.27),
  ('SAR', 'Saudi Riyal', 0.27),
  ('MYR', 'Malaysian Ringgit', 0.21),
  ('THB', 'Thai Baht', 0.028)
ON CONFLICT (currency_code) DO UPDATE SET
  rate_to_usd = EXCLUDED.rate_to_usd,
  last_updated_at = now();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_currency_rates_code ON public.currency_rates(currency_code);

-- Create function to recalculate cost_usd when exchange rate changes
CREATE OR REPLACE FUNCTION public.recalculate_provider_costs(p_provider_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_currency_rate NUMERIC(16,6);
  v_updated_count INTEGER;
BEGIN
  -- Get provider's current exchange rate
  SELECT currency_rate_to_usd INTO v_currency_rate
  FROM providers WHERE id = p_provider_id;
  
  IF v_currency_rate IS NULL OR v_currency_rate = 0 THEN
    v_currency_rate := 1.0;
  END IF;
  
  -- Update provider_services cost_usd
  UPDATE provider_services
  SET cost_usd = provider_rate * v_currency_rate,
      updated_at = now()
  WHERE provider_id = p_provider_id;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN v_updated_count;
END;
$$;