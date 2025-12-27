-- =============================================
-- BUYER ENHANCEMENT TABLES & COLUMNS
-- =============================================

-- 1. Buyer Favorites Table
CREATE TABLE IF NOT EXISTS public.buyer_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.client_users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(buyer_id, service_id)
);

ALTER TABLE public.buyer_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own favorites" ON public.buyer_favorites
  FOR SELECT USING (true);

CREATE POLICY "Buyers can manage their own favorites" ON public.buyer_favorites
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Buyer Notifications Table
CREATE TABLE IF NOT EXISTS public.buyer_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.client_users(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'order_update', 'low_balance', 'announcement', 'referral')),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.buyer_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own notifications" ON public.buyer_notifications
  FOR SELECT USING (true);

CREATE POLICY "Buyers can update their own notifications" ON public.buyer_notifications
  FOR UPDATE USING (true);

CREATE POLICY "System can insert notifications" ON public.buyer_notifications
  FOR INSERT WITH CHECK (true);

-- 3. Service Reviews Table
CREATE TABLE IF NOT EXISTS public.service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.client_users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(buyer_id, order_id)
);

ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible reviews" ON public.service_reviews
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Buyers can create reviews" ON public.service_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Panel owners can manage reviews" ON public.service_reviews
  FOR ALL USING (panel_id IN (
    SELECT id FROM panels WHERE owner_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  ));

-- 4. Add VIP and preference columns to client_users
ALTER TABLE public.client_users 
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vip_since TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS low_balance_threshold NUMERIC DEFAULT 5.00;

-- 5. Add tracking columns to orders
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 6. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE buyer_notifications;
ALTER TABLE buyer_notifications REPLICA IDENTITY FULL;

-- 7. Enable realtime for orders (for tracking updates)
ALTER TABLE orders REPLICA IDENTITY FULL;

-- 8. Create function to get service average rating
CREATE OR REPLACE FUNCTION public.get_service_avg_rating(p_service_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0)
  FROM public.service_reviews
  WHERE service_id = p_service_id AND is_visible = true;
$$;

-- 9. Create function to notify buyer on order status change
CREATE OR REPLACE FUNCTION public.notify_buyer_order_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO buyer_notifications (buyer_id, panel_id, type, title, message, order_id)
    VALUES (
      NEW.buyer_id,
      NEW.panel_id,
      'order_update',
      'Order Status Updated',
      format('Your order #%s is now %s', NEW.order_number, REPLACE(NEW.status::text, '_', ' ')),
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for order status notifications
DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_buyer_order_update();