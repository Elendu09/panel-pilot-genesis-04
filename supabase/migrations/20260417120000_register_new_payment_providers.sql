-- Register the new multi-currency payment providers added in Task #4
-- (SE Asia, additional African, and additional global gateways).

INSERT INTO platform_payment_providers (provider_name, display_name, category, is_enabled, config, supports_subscriptions, fee_percentage, fixed_fee)
VALUES
  -- SE Asia
  ('toyyibpay', 'toyyibPay',  'local',  false, '{}', false, 1.0, 0),
  ('billplz',   'Billplz',    'local',  false, '{}', false, 1.0, 0),
  ('senangpay', 'senangPay',  'local',  false, '{}', false, 2.0, 0),
  ('ipay88',    'iPay88',     'local',  false, '{}', false, 2.0, 0),
  ('xendit',    'Xendit',     'local',  false, '{}', false, 2.5, 0),
  ('midtrans',  'Midtrans',   'local',  false, '{}', false, 2.0, 0),
  ('omise',     'Omise',      'local',  false, '{}', false, 3.65, 0),
  ('dragonpay', 'DragonPay',  'local',  false, '{}', false, 1.5, 0),
  ('vnpay',     'VNPay',      'local',  false, '{}', false, 1.5, 0),
  ('momo',      'MoMo',       'local',  false, '{}', false, 2.0, 0),
  ('gcash',     'GCash',      'local',  false, '{}', false, 2.0, 0),
  ('2c2p',      '2C2P',       'local',  false, '{}', false, 2.5, 0),
  -- Africa
  ('squad',     'Squad',      'local',  false, '{}', false, 1.4, 0),
  ('lenco',     'Lenco',      'local',  false, '{}', false, 1.4, 0)
ON CONFLICT (provider_name) DO NOTHING;
