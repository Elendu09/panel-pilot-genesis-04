ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS service_name TEXT;

DO $$
BEGIN
  UPDATE public.orders o
  SET service_name = s.name
  FROM public.services s
  WHERE o.service_id = s.id
    AND o.service_name IS NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not backfill service_name: %', SQLERRM;
END $$;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_service_id_fkey;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_service_id_fkey
  FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;
