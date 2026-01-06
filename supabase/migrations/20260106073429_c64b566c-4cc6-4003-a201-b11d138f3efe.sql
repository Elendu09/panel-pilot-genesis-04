-- Provider sync logs for cron job tracking
CREATE TABLE IF NOT EXISTS public.provider_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES panels(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  services_synced INTEGER DEFAULT 0,
  prices_updated INTEGER DEFAULT 0,
  new_services INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'error'))
);

-- Enable RLS
ALTER TABLE public.provider_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for provider_sync_logs
CREATE POLICY "Panel owners can view their sync logs"
ON public.provider_sync_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE p.id = provider_sync_logs.panel_id
    AND pr.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage sync logs"
ON public.provider_sync_logs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_provider_sync_logs_panel_id ON provider_sync_logs(panel_id);
CREATE INDEX IF NOT EXISTS idx_provider_sync_logs_started_at ON provider_sync_logs(started_at DESC);

-- Add missing columns to provider_services if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_services' AND column_name = 'description') THEN
    ALTER TABLE provider_services ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_services' AND column_name = 'is_dripfeed') THEN
    ALTER TABLE provider_services ADD COLUMN is_dripfeed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_services' AND column_name = 'is_refill') THEN
    ALTER TABLE provider_services ADD COLUMN is_refill BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'provider_services' AND column_name = 'is_cancel') THEN
    ALTER TABLE provider_services ADD COLUMN is_cancel BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add unique constraint to services for proper upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'services_panel_provider_service_ref_unique'
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_panel_provider_service_ref_unique 
    UNIQUE (panel_id, provider_service_ref);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Constraint may already exist or have conflicts, skip
  NULL;
END $$;