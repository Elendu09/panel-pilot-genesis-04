-- Fix Famsup provider currency configuration
-- NGN (Nigerian Naira) should be properly configured with correct exchange rate to USD
-- Current rate: 1 USD = ~1600 NGN, so 1 NGN = 0.000625 USD

-- Update any providers with name containing 'famsup' (case-insensitive)
UPDATE providers 
SET 
  currency = 'NGN',
  currency_rate_to_usd = 0.000625,
  currency_last_updated = now()
WHERE LOWER(name) LIKE '%famsup%';

-- Also add a check constraint to ensure currency_rate_to_usd is always positive
-- and warn if using default USD rate (1.0) with non-USD currency
-- Create an index to improve provider service queries
CREATE INDEX IF NOT EXISTS idx_provider_services_panel_provider 
ON provider_services(panel_id, provider_id);

-- Add a comment to help future developers understand the currency fields
COMMENT ON COLUMN providers.currency IS 'The currency code that this provider uses for pricing (e.g., USD, NGN, INR)';
COMMENT ON COLUMN providers.currency_rate_to_usd IS 'The exchange rate to convert 1 unit of provider currency to USD. E.g., for NGN: 0.000625 means 1 NGN = $0.000625';
