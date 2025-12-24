-- Add theme_preference column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system';

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.theme_preference IS 'User theme preference: dark, light, or system';