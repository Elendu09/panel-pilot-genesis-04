-- Create function to cleanup expired domain verification tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_domain_verifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete expired verification records (older than expires_at or 7 days if no expires_at)
  DELETE FROM domain_verifications 
  WHERE expires_at < NOW() 
     OR (expires_at IS NULL AND created_at < NOW() - INTERVAL '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Also clear verification tokens from panel_domains that are already verified
  UPDATE panel_domains 
  SET verification_token = NULL, 
      txt_verification_record = NULL
  WHERE verification_status = 'verified' 
    AND (verification_token IS NOT NULL OR txt_verification_record IS NOT NULL);
  
  RETURN deleted_count;
END;
$$;

-- Create index for faster cleanup queries
CREATE INDEX IF NOT EXISTS idx_domain_verifications_expires_at 
ON domain_verifications(expires_at) 
WHERE expires_at IS NOT NULL;

-- Run initial cleanup
SELECT public.cleanup_expired_domain_verifications();