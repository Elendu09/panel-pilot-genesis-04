-- Create announcements table for platform-wide announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  target TEXT NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'panel_owners', 'specific')),
  target_panel_ids UUID[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can manage all announcements
CREATE POLICY "Admins can manage announcements"
  ON public.announcements
  FOR ALL
  USING (is_any_admin(auth.uid()))
  WITH CHECK (is_any_admin(auth.uid()));

-- Anyone authenticated can view active announcements
CREATE POLICY "Authenticated users can view active announcements"
  ON public.announcements
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND status = 'active'
  );

-- Enable realtime for announcements
ALTER TABLE public.announcements REPLICA IDENTITY FULL;

-- Create updated_at trigger
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();