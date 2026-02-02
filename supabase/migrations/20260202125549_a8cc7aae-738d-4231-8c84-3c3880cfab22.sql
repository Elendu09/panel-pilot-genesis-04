-- Fix existing direct provider endpoints to use correct /api/v2 path instead of /api/v2/buyer-api
-- Also update platform domain from homeofsmm.com to smmpilot.online for consistency

UPDATE providers 
SET api_endpoint = REPLACE(
  REPLACE(api_endpoint, '/api/v2/buyer-api', '/api/v2'),
  'homeofsmm.com',
  'smmpilot.online'
)
WHERE is_direct = true 
AND (api_endpoint LIKE '%/api/v2/buyer-api%' OR api_endpoint LIKE '%homeofsmm.com%');