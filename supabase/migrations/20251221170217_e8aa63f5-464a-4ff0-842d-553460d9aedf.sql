-- Add display_order and image_url columns to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url text;

-- Create index for display_order for faster ordering
CREATE INDEX IF NOT EXISTS idx_services_display_order ON public.services(panel_id, display_order);

-- Add low_balance_threshold to panel_settings
ALTER TABLE public.panel_settings
ADD COLUMN IF NOT EXISTS low_balance_threshold numeric DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS low_balance_alert_enabled boolean DEFAULT true;

-- Create platform_fees table for tracking admin commissions/deductions
CREATE TABLE IF NOT EXISTS public.platform_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id uuid REFERENCES public.panels(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  fee_percentage numeric NOT NULL DEFAULT 5.00,
  fee_amount numeric NOT NULL,
  order_amount numeric NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on platform_fees
ALTER TABLE public.platform_fees ENABLE ROW LEVEL SECURITY;

-- Platform fees policies
CREATE POLICY "Panel owners can view their fees" ON public.platform_fees
  FOR SELECT USING (
    panel_id IN (
      SELECT panels.id FROM panels
      WHERE panels.owner_id IN (
        SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage all fees" ON public.platform_fees
  FOR ALL USING (is_admin())
  WITH CHECK (is_admin());

-- Create balance_alerts table for notification history
CREATE TABLE IF NOT EXISTS public.balance_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id uuid REFERENCES public.panels(id) ON DELETE CASCADE,
  alert_type text NOT NULL DEFAULT 'low_balance',
  threshold numeric NOT NULL,
  current_balance numeric NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on balance_alerts
ALTER TABLE public.balance_alerts ENABLE ROW LEVEL SECURITY;

-- Balance alerts policies
CREATE POLICY "Panel owners can view their alerts" ON public.balance_alerts
  FOR SELECT USING (
    panel_id IN (
      SELECT panels.id FROM panels
      WHERE panels.owner_id IN (
        SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Panel owners can update their alerts" ON public.balance_alerts
  FOR UPDATE USING (
    panel_id IN (
      SELECT panels.id FROM panels
      WHERE panels.owner_id IN (
        SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert alerts" ON public.balance_alerts
  FOR INSERT WITH CHECK (true);