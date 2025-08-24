-- Create enum types for the SMM panel system
CREATE TYPE public.user_role AS ENUM ('super_admin', 'panel_owner', 'buyer');
CREATE TYPE public.panel_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE public.service_category AS ENUM ('instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'linkedin', 'telegram', 'other');
CREATE TYPE public.order_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled', 'partial');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.theme_type AS ENUM ('dark_gradient', 'professional', 'vibrant');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  avatar_url TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create panels table for panel owners
CREATE TABLE public.panels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  domain TEXT,
  theme_type theme_type DEFAULT 'dark_gradient',
  custom_branding JSONB,
  status panel_status DEFAULT 'pending',
  monthly_revenue DECIMAL(10,2) DEFAULT 0.00,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category service_category NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER DEFAULT 10000,
  is_active BOOLEAN DEFAULT true,
  provider_id TEXT,
  estimated_time TEXT,
  features JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  status order_status DEFAULT 'pending',
  start_count INTEGER DEFAULT 0,
  remains INTEGER DEFAULT 0,
  progress DECIMAL(5,2) DEFAULT 0.00,
  provider_order_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount DECIMAL(10,4) NOT NULL,
  type TEXT NOT NULL, -- 'deposit', 'order', 'refund'
  status payment_status DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create providers table for API integrations
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert profile" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for panels
CREATE POLICY "Panel owners can manage their panels" ON public.panels
  FOR ALL USING (owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view active panels" ON public.panels
  FOR SELECT USING (status = 'active');

-- Create RLS policies for services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Panel owners can manage their services" ON public.services
  FOR ALL USING (panel_id IN (SELECT id FROM public.panels WHERE owner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Create RLS policies for orders
CREATE POLICY "Users can view their orders" ON public.orders
  FOR SELECT USING (buyer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (buyer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create RLS policies for transactions
CREATE POLICY "Users can view their transactions" ON public.transactions
  FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
BEGIN
  order_num := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_panels_updated_at
  BEFORE UPDATE ON public.panels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();