CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT 
  id, user_id, email, full_name, avatar_url, username, role,
  balance, total_spent, is_active,
  onboarding_step, onboarding_completed_at, theme_preference, active_panel_id,
  created_at, updated_at, email_verified_at,
  mfa_verified,
  mfa_backup_codes
FROM public.profiles;

GRANT SELECT ON public.profiles_safe TO authenticated;
GRANT SELECT ON public.profiles_safe TO anon;