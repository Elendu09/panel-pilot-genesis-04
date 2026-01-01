-- Add provider_service_id column to services table for tracking original provider IDs
-- This enables re-sync functionality to update services without creating duplicates

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS provider_service_id TEXT;

-- Create index for faster lookups during re-sync
CREATE INDEX IF NOT EXISTS idx_services_provider_service_id ON public.services(provider_service_id);

-- Comment for documentation
COMMENT ON COLUMN public.services.provider_service_id IS 'Original service ID from the provider API, used to prevent duplicate imports during re-sync';