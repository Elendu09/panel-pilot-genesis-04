-- Register the new multi-currency payment providers added in Task #4.
-- Only providers with full process-payment + payment-webhook implementations
-- (including signature verification) are registered here. The remaining
-- gateways listed in payment-gateway-currencies.ts will be added in a
-- follow-up once their backends are implemented end-to-end, to avoid
-- exposing payment paths that hard-fail at checkout.

INSERT INTO platform_payment_providers (provider_name, display_name, category, is_enabled, config, supports_subscriptions, fee_percentage, fixed_fee)
VALUES
  -- SE Asia (implemented)
  ('toyyibpay', 'toyyibPay',  'local',  false, '{}', false, 1.0, 0),
  ('billplz',   'Billplz',    'local',  false, '{}', false, 1.0, 0),
  ('xendit',    'Xendit',     'local',  false, '{}', false, 2.5, 0),
  ('midtrans',  'Midtrans',   'local',  false, '{}', false, 2.0, 0),
  -- Africa (implemented)
  ('squad',     'Squad',      'local',  false, '{}', false, 1.4, 0),
  ('lenco',     'Lenco',      'local',  false, '{}', false, 1.4, 0)
ON CONFLICT (provider_name) DO NOTHING;
