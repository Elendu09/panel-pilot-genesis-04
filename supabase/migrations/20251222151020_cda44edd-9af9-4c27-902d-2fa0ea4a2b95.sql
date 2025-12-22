-- Insert worldofsmm and famsup as platform providers
INSERT INTO public.platform_providers (name, api_endpoint, api_key, is_active, commission_percentage, description)
VALUES 
  ('WorldOfSMM', 'https://worldofsmm.com/api/v2', 'PLACEHOLDER_API_KEY', true, 5.00, 'Premium SMM services provider with high quality services'),
  ('FamSup', 'https://famsup.com/api/v2', 'PLACEHOLDER_API_KEY', true, 5.00, 'Reliable SMM panel API with fast delivery')
ON CONFLICT DO NOTHING;

-- Create function to auto-create notifications for various events
CREATE OR REPLACE FUNCTION public.create_panel_notification(
  p_panel_id uuid,
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO panel_notifications (panel_id, user_id, title, message, type)
  VALUES (p_panel_id, p_user_id, p_title, p_message, p_type)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger function for new orders
CREATE OR REPLACE FUNCTION public.notify_on_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  panel_owner_id uuid;
BEGIN
  -- Get the panel owner
  SELECT owner_id INTO panel_owner_id
  FROM panels
  WHERE id = NEW.panel_id;
  
  IF panel_owner_id IS NOT NULL THEN
    PERFORM create_panel_notification(
      NEW.panel_id,
      panel_owner_id,
      'New Order Received',
      format('Order #%s for $%s has been placed', NEW.order_number, NEW.price::text),
      'info'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for completed payments
CREATE OR REPLACE FUNCTION public.notify_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_user_id uuid;
BEGIN
  -- Only notify on completed payments
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get user_id from profile
    SELECT id INTO profile_user_id
    FROM profiles
    WHERE id = NEW.user_id;
    
    IF profile_user_id IS NOT NULL THEN
      PERFORM create_panel_notification(
        NULL,
        profile_user_id,
        'Payment Received',
        format('Payment of $%s has been processed successfully', NEW.amount::text),
        'info'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for provider sync
CREATE OR REPLACE FUNCTION public.notify_on_provider_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  panel_owner_id uuid;
BEGIN
  -- Only notify when sync_status changes to 'synced'
  IF NEW.sync_status = 'synced' AND (OLD.sync_status IS NULL OR OLD.sync_status != 'synced') THEN
    SELECT owner_id INTO panel_owner_id
    FROM panels
    WHERE id = NEW.panel_id;
    
    IF panel_owner_id IS NOT NULL THEN
      PERFORM create_panel_notification(
        NEW.panel_id,
        panel_owner_id,
        'Provider Synced',
        format('Provider "%s" has been synchronized. Balance: $%s', NEW.provider_name, COALESCE(NEW.balance, 0)::text),
        'info'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_order();

DROP TRIGGER IF EXISTS trigger_notify_payment ON transactions;
CREATE TRIGGER trigger_notify_payment
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_payment();

DROP TRIGGER IF EXISTS trigger_notify_provider_sync ON provider_integrations;
CREATE TRIGGER trigger_notify_provider_sync
  AFTER INSERT OR UPDATE ON provider_integrations
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_provider_sync();