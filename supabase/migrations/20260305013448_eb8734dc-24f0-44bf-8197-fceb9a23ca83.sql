
-- 1. Add missing columns to providers for sync tracking
ALTER TABLE providers ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'pending';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS last_sync_at timestamptz;

-- 2. Add provider_cost and provider_id to orders (persists cost at order time)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_cost numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_id uuid;

-- 3. Fix services.provider_id: convert text to uuid and add FK
-- First drop existing data that can't cast, then alter
DO $$
BEGIN
  -- Only alter if column is text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'provider_id' AND data_type = 'text'
  ) THEN
    -- Nullify any non-uuid values
    UPDATE services SET provider_id = NULL WHERE provider_id IS NOT NULL AND provider_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    ALTER TABLE services ALTER COLUMN provider_id TYPE uuid USING provider_id::uuid;
  END IF;
END $$;

-- Add FK if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'services_provider_id_fkey' AND table_name = 'services'
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_provider_id_fkey 
      FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL;
  END IF;
END $$;
