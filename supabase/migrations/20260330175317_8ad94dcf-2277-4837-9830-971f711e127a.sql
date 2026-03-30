
ALTER TABLE public.panel_subscriptions 
  ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS pending_downgrade text DEFAULT NULL;
