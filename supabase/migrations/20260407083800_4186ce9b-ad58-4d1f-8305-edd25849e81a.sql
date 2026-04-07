ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS amount_usd NUMERIC(16,4);