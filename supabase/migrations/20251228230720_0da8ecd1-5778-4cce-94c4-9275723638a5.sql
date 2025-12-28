-- Add blog_enabled column to panels table
ALTER TABLE public.panels ADD COLUMN IF NOT EXISTS blog_enabled BOOLEAN DEFAULT false;

-- Add blog_enabled column to panel_settings for more granular control
ALTER TABLE public.panel_settings ADD COLUMN IF NOT EXISTS blog_enabled BOOLEAN DEFAULT false;

-- Create function to auto-enable blog when first post is published
CREATE OR REPLACE FUNCTION public.auto_enable_blog_on_first_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'published'
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    -- Check if this is the first published post for this panel
    IF NOT EXISTS (
      SELECT 1 FROM public.blog_posts 
      WHERE panel_id = NEW.panel_id 
      AND status = 'published' 
      AND id != NEW.id
    ) THEN
      -- Auto-enable blog for the panel
      UPDATE public.panels SET blog_enabled = true WHERE id = NEW.panel_id;
      UPDATE public.panel_settings SET blog_enabled = true WHERE panel_id = NEW.panel_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-enabling blog
DROP TRIGGER IF EXISTS trigger_auto_enable_blog ON public.blog_posts;
CREATE TRIGGER trigger_auto_enable_blog
  AFTER INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_enable_blog_on_first_post();