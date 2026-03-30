-- Add MFA columns to client_users table for tenant 2FA
ALTER TABLE public.client_users
  ADD COLUMN IF NOT EXISTS mfa_secret TEXT,
  ADD COLUMN IF NOT EXISTS mfa_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mfa_backup_codes JSONB DEFAULT '[]'::jsonb;

-- Update the client_users_safe view to exclude mfa_secret
DROP VIEW IF EXISTS public.client_users_safe;
CREATE VIEW public.client_users_safe AS
SELECT
  id, email, full_name, username, balance, avatar_url,
  is_active, is_banned, ban_reason, banned_at,
  is_vip, vip_since, panel_id, created_at, updated_at,
  total_spent, custom_discount, referral_code, referral_count,
  referred_by, preferred_language, timezone, low_balance_threshold,
  oauth_provider, last_login_at, last_login_device,
  last_login_ip, last_login_location,
  invoice_company_name, invoice_vat_id, invoice_address,
  mfa_verified, mfa_backup_codes
FROM public.client_users;