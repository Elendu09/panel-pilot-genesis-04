
-- Helper function
CREATE OR REPLACE FUNCTION public.is_panel_owner(_panel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.panels p
    JOIN public.profiles pr ON p.owner_id = pr.id
    WHERE p.id = _panel_id AND pr.user_id = auth.uid()
  )
$$;

-- Drop all old chat policies
DROP POLICY IF EXISTS "Public can view their own sessions by visitor_id" ON public.chat_sessions;
DROP POLICY IF EXISTS "Public can view messages in their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Panel owners can view their chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Panel owners can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Panel owners can view messages in their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Service role can insert chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Service role can insert chat sessions" ON public.chat_sessions;

-- Scoped chat policies
CREATE POLICY "Panel owners can view their chat sessions"
ON public.chat_sessions FOR SELECT
USING (public.is_panel_owner(panel_id));

CREATE POLICY "Panel owners can view chat messages"
ON public.chat_messages FOR SELECT
USING (session_id IN (SELECT id FROM public.chat_sessions WHERE public.is_panel_owner(panel_id)));

CREATE POLICY "Service role insert chat messages"
ON public.chat_messages FOR INSERT TO service_role
WITH CHECK (true);

CREATE POLICY "Service role insert chat sessions"
ON public.chat_sessions FOR INSERT TO service_role
WITH CHECK (true);

-- Drop all old client_users policies
DROP POLICY IF EXISTS "Panel owners can manage their clients" ON public.client_users;
DROP POLICY IF EXISTS "Panel owners can view their buyers" ON public.client_users;
DROP POLICY IF EXISTS "Panel owners can update their buyers" ON public.client_users;
DROP POLICY IF EXISTS "Panel owners can insert buyers" ON public.client_users;
DROP POLICY IF EXISTS "Panel owners can delete buyers" ON public.client_users;

-- Scoped client_users policies
CREATE POLICY "Panel owners view buyers"
ON public.client_users FOR SELECT
USING (public.is_panel_owner(panel_id));

CREATE POLICY "Panel owners update buyers"
ON public.client_users FOR UPDATE
USING (public.is_panel_owner(panel_id));

CREATE POLICY "Panel owners insert buyers"
ON public.client_users FOR INSERT
WITH CHECK (public.is_panel_owner(panel_id));

CREATE POLICY "Panel owners delete buyers"
ON public.client_users FOR DELETE
USING (public.is_panel_owner(panel_id));

-- Fix function search_paths
CREATE OR REPLACE FUNCTION public.approve_panel(panel_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.panels SET status = 'active', is_approved = true WHERE id = panel_id;
  INSERT INTO public.panel_templates (panel_id, name, template_data, is_active)
  VALUES (panel_id, 'Default Theme', '{"theme":"dark_gradient","colors":{"primary":"#3b82f6","secondary":"#1e40af"}}', true);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.raw_user_meta_data->>'avatar_url',''));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
