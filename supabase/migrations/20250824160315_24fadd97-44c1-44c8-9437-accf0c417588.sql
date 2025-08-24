
-- Update the user with email "nzubeelendu09@gmail.com" to have admin role
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'nzubeelendu09@gmail.com';

-- If the profile doesn't exist yet, we'll need to insert it manually
-- This handles the case where the user hasn't signed up yet
INSERT INTO profiles (email, role, full_name, user_id)
SELECT 'nzubeelendu09@gmail.com', 'admin'::user_role, 'Admin User', '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'nzubeelendu09@gmail.com'
);
