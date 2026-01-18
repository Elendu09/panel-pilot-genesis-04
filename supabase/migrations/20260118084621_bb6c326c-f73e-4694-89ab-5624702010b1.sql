-- Add panel_id column to transactions table if not exists
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS panel_id uuid REFERENCES panels(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_panel_id ON transactions(panel_id);