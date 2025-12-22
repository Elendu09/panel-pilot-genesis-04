-- Create platform_providers table for admin-managed providers (worldofsmm, famsup, etc.)
CREATE TABLE public.platform_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  commission_percentage NUMERIC DEFAULT 5.00,
  balance NUMERIC DEFAULT 0.00,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending',
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_providers ENABLE ROW LEVEL SECURITY;

-- Super admins can manage platform providers
CREATE POLICY "Super admins can manage platform providers"
ON public.platform_providers
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can view platform providers
CREATE POLICY "Admins can view platform providers"
ON public.platform_providers
FOR SELECT
USING (is_any_admin(auth.uid()));

-- Panel owners can view active platform providers
CREATE POLICY "Panel owners can view active platform providers"
ON public.platform_providers
FOR SELECT
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_platform_providers_updated_at
BEFORE UPDATE ON public.platform_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for panel_notifications
ALTER TABLE public.panel_notifications REPLICA IDENTITY FULL;

-- Allow system to insert notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.panel_notifications;
CREATE POLICY "System can insert notifications"
ON public.panel_notifications
FOR INSERT
WITH CHECK (true);

-- Allow system to delete notifications
DROP POLICY IF EXISTS "Users can delete their notifications" ON public.panel_notifications;
CREATE POLICY "Users can delete their notifications"
ON public.panel_notifications
FOR DELETE
USING (user_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Enable realtime for orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;