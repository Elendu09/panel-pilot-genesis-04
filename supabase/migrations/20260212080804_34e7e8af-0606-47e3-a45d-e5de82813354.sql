CREATE OR REPLACE FUNCTION public.lookup_email_by_username(p_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email
  FROM profiles
  WHERE LOWER(username) = LOWER(p_username)
  LIMIT 1;
  RETURN v_email;
END;
$$;