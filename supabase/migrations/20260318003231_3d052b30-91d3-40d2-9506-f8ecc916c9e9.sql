-- Fix orders.service_id: CASCADE -> SET NULL (preserve orders when services deleted)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_service_id_fkey;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_service_id_fkey
  FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;

-- Fix service_reviews.service_id: CASCADE -> SET NULL (preserve reviews when services deleted)
ALTER TABLE public.service_reviews DROP CONSTRAINT IF EXISTS service_reviews_service_id_fkey;
ALTER TABLE public.service_reviews
  ADD CONSTRAINT service_reviews_service_id_fkey
  FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;