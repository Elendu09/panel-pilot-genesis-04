-- Add service_name column to orders table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'service_name'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN service_name text;
  END IF;
END $$;

-- Backfill service_name from services table where missing
UPDATE public.orders o
SET service_name = s.name
FROM public.services s
WHERE o.service_id = s.id
  AND o.service_name IS NULL;