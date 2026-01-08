-- Add username column to profiles table for panel owners
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Create unique index for username lookups (within profiles)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;