-- Add subscription columns to panels table
ALTER TABLE panels ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise'));
ALTER TABLE panels ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE panels ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE panels ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trialing', 'pending'));
ALTER TABLE panels ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Create platform_payment_providers table for admin-configured payment gateways
CREATE TABLE IF NOT EXISTS platform_payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('card', 'crypto', 'bank', 'wallet', 'local')),
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  regions TEXT[] DEFAULT '{}',
  fee_percentage NUMERIC(5,2) DEFAULT 0,
  fixed_fee NUMERIC(10,2) DEFAULT 0,
  supports_subscriptions BOOLEAN DEFAULT false,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_payment_providers ENABLE ROW LEVEL SECURITY;

-- RLS policies for platform_payment_providers
CREATE POLICY "Admins can manage payment providers" ON platform_payment_providers
  FOR ALL USING (is_admin());

CREATE POLICY "Public can view enabled providers" ON platform_payment_providers
  FOR SELECT USING (is_enabled = true);

-- Insert default payment providers with subscription support flags
INSERT INTO platform_payment_providers (provider_name, display_name, category, supports_subscriptions, logo_url) VALUES
  ('stripe', 'Stripe', 'card', true, 'https://cdn.brandfetch.io/idxAg10C0L/theme/dark/symbol.svg'),
  ('paypal', 'PayPal', 'wallet', true, 'https://cdn.brandfetch.io/idQivor5k3/theme/dark/symbol.svg'),
  ('paystack', 'Paystack', 'local', true, 'https://cdn.brandfetch.io/idG1VLJFRq/theme/dark/symbol.svg'),
  ('flutterwave', 'Flutterwave', 'local', true, 'https://cdn.brandfetch.io/id_HQJG7AV/theme/dark/logo.svg'),
  ('polar', 'Polar.sh', 'card', true, NULL),
  ('cryptomus', 'CryptoMus', 'crypto', false, NULL),
  ('coinbase', 'Coinbase Commerce', 'crypto', false, 'https://cdn.brandfetch.io/idXaYPNLlU/theme/dark/symbol.svg'),
  ('razorpay', 'Razorpay', 'local', true, 'https://cdn.brandfetch.io/idMGb10xcj/theme/dark/logo.svg')
ON CONFLICT (provider_name) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_platform_payment_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_platform_payment_providers_updated_at ON platform_payment_providers;
CREATE TRIGGER trigger_update_platform_payment_providers_updated_at
  BEFORE UPDATE ON platform_payment_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_payment_providers_updated_at();