ALTER TABLE public.services ADD COLUMN IF NOT EXISTS dripfeed_available boolean DEFAULT false;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'Default';