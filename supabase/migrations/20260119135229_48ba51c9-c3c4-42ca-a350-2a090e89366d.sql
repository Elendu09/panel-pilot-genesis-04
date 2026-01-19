-- Fix: Remove foreign key constraint that causes deposit errors
-- The transactions.user_id can reference either profiles.id (panel owners) or client_users.id (buyers)
-- This constraint was causing "Failed to create transaction" errors for buyer deposits

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- Add index for performance since we removed the FK
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

-- Add buyer_id column for explicit buyer reference (optional but clearer)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES client_users(id);

-- Create index for buyer lookups
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);