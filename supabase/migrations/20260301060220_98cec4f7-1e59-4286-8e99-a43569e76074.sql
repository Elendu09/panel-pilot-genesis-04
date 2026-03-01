ALTER TABLE public.client_users 
  ADD COLUMN IF NOT EXISTS last_login_ip text,
  ADD COLUMN IF NOT EXISTS last_login_device text,
  ADD COLUMN IF NOT EXISTS last_login_location text;