ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS buyer_id uuid REFERENCES public.client_users(id) ON DELETE SET NULL;
ALTER TABLE public.support_tickets ALTER COLUMN user_id DROP NOT NULL;