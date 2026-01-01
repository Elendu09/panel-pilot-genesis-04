-- Add columns to track provider price and markup for automatic price adjustments
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS provider_price numeric,
ADD COLUMN IF NOT EXISTS markup_percent numeric DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_services_provider_price ON public.services(provider_price);

COMMENT ON COLUMN public.services.provider_price IS 'Original price from the provider per 1K';
COMMENT ON COLUMN public.services.markup_percent IS 'Markup percentage applied to calculate selling price';