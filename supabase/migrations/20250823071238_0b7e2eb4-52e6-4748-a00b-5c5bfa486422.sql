-- Update user_role enum to include admin and panel_owner roles
ALTER TYPE user_role RENAME TO user_role_old;
CREATE TYPE user_role AS ENUM ('admin', 'panel_owner');

-- Update profiles table to use new enum
ALTER TABLE profiles 
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE user_role USING (
    CASE role::text
      WHEN 'super_admin' THEN 'admin'::user_role
      WHEN 'buyer' THEN 'panel_owner'::user_role
      WHEN 'panel_owner' THEN 'panel_owner'::user_role
      ELSE 'panel_owner'::user_role
    END
  ),
  ALTER COLUMN role SET DEFAULT 'panel_owner'::user_role;

-- Drop old enum
DROP TYPE user_role_old;