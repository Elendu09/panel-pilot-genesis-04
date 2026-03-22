INSERT INTO platform_payment_providers (provider_name, display_name, category, is_enabled, config, supports_subscriptions, fee_percentage, fixed_fee)
VALUES 
  ('korapay', 'Kora Pay', 'local', false, '{}', true, 1.4, 0),
  ('heleket', 'Heleket', 'crypto', false, '{}', false, 1.0, 0)
ON CONFLICT (provider_name) DO NOTHING;