
-- Add missing columns to transactions table
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS external_id text DEFAULT NULL;

-- Fix handle_new_user to capture username from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, avatar_url, username)
  VALUES (
    NEW.id, NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url',''),
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$;

-- Add unique constraint on username to prevent duplicates (for referral system)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_unique'
  ) THEN
    -- First clean up any existing duplicates by appending random suffix
    WITH dupes AS (
      SELECT id, username, ROW_NUMBER() OVER (PARTITION BY LOWER(username) ORDER BY created_at) as rn
      FROM profiles
      WHERE username IS NOT NULL AND username != ''
    )
    UPDATE profiles SET username = profiles.username || '_' || SUBSTRING(profiles.id::text, 1, 4)
    FROM dupes
    WHERE profiles.id = dupes.id AND dupes.rn > 1;

    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);
  END IF;
END $$;
