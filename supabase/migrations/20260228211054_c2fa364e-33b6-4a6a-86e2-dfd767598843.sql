-- Add active_panel_id to profiles for multi-panel support
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_panel_id uuid REFERENCES public.panels(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_active_panel_id ON public.profiles(active_panel_id);

-- Comment for documentation
COMMENT ON COLUMN public.profiles.active_panel_id IS 'Currently active panel for multi-panel switching. NULL means use first panel.';