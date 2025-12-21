-- Add username, password_hash, and password_temp columns to client_users table
ALTER TABLE public.client_users 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash text,
ADD COLUMN IF NOT EXISTS password_temp text;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_users_username ON public.client_users(username);