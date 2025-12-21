-- Create app_role enum for proper role management
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'moderator', 'support');

-- Create user_roles table (separate from profiles as per security requirements)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Create function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_any_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Create platform_settings table
CREATE TABLE public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}',
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_settings
CREATE POLICY "Admins can view platform settings"
ON public.platform_settings
FOR SELECT
USING (public.is_any_admin(auth.uid()));

CREATE POLICY "Super admins can manage platform settings"
ON public.platform_settings
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Create admin_webhooks table
CREATE TABLE public.admin_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    secret TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    last_status INTEGER,
    failure_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_webhooks
ALTER TABLE public.admin_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_webhooks
CREATE POLICY "Admins can view webhooks"
ON public.admin_webhooks
FOR SELECT
USING (public.is_any_admin(auth.uid()));

CREATE POLICY "Super admins can manage webhooks"
ON public.admin_webhooks
FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Create system_health_logs table
CREATE TABLE public.system_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system_health_logs
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_health_logs
CREATE POLICY "Admins can view system health logs"
ON public.system_health_logs
FOR SELECT
USING (public.is_any_admin(auth.uid()));

CREATE POLICY "System can insert health logs"
ON public.system_health_logs
FOR INSERT
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_webhooks_updated_at
BEFORE UPDATE ON public.admin_webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, category, description) VALUES
('general', '{"platform_name": "SMM Panel Pro", "platform_description": "Professional Social Media Marketing Platform", "contact_email": "admin@example.com", "maintenance_mode": false}', 'general', 'General platform settings'),
('users', '{"allow_registration": true, "email_verification": true, "default_balance": 0, "max_panels_per_user": 5}', 'users', 'User management settings'),
('payments', '{"commission_rate": 5, "min_deposit": 10, "max_deposit": 10000, "currency": "USD"}', 'payments', 'Payment settings'),
('notifications', '{"email_notifications": true, "push_notifications": false, "sms_notifications": false}', 'notifications', 'Notification settings'),
('security', '{"enforce_2fa": false, "max_login_attempts": 5, "session_timeout": 1440, "ip_whitelist": [], "country_blocklist": [], "block_tor_vpn": false}', 'security', 'Security settings');