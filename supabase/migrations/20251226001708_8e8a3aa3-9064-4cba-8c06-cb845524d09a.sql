-- Add ban columns to client_users table
ALTER TABLE public.client_users 
  ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS banned_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS ban_reason text;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_users_is_banned ON public.client_users(is_banned);

-- Add comment for documentation
COMMENT ON COLUMN public.client_users.is_banned IS 'Whether the user is banned from the panel';
COMMENT ON COLUMN public.client_users.banned_at IS 'Timestamp when user was banned';
COMMENT ON COLUMN public.client_users.ban_reason IS 'Reason for banning the user';