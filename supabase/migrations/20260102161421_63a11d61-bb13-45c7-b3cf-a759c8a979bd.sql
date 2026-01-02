-- Create buyer_themes table for storing panel buyer homepage themes
CREATE TABLE public.buyer_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  theme_key TEXT NOT NULL DEFAULT 'default',
  is_active BOOLEAN DEFAULT true,
  
  -- Color palettes
  dark_palette JSONB DEFAULT '{
    "background": "#0A0A0A",
    "surface": "#121212",
    "primary": "#6366F1",
    "secondary": "#8B5CF6",
    "accent": "#EC4899",
    "text": "#FFFFFF",
    "muted": "#A1A1AA"
  }'::jsonb,
  
  light_palette JSONB DEFAULT '{
    "background": "#FFFFFF",
    "surface": "#F8FAFC",
    "primary": "#6366F1",
    "secondary": "#8B5CF6",
    "accent": "#EC4899",
    "text": "#0F172A",
    "muted": "#64748B"
  }'::jsonb,
  
  -- Typography
  font_family TEXT DEFAULT 'Inter',
  heading_font TEXT DEFAULT 'Inter',
  
  -- Layout config
  layout_config JSONB DEFAULT '{
    "heroStyle": "gradient",
    "cardStyle": "glass",
    "navStyle": "floating",
    "spacing": "comfortable"
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active theme per panel
  CONSTRAINT unique_active_theme_per_panel UNIQUE (panel_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS
ALTER TABLE public.buyer_themes ENABLE ROW LEVEL SECURITY;

-- Panel owners can manage their themes
CREATE POLICY "Panel owners can manage their buyer themes"
ON public.buyer_themes
FOR ALL
USING (
  panel_id IN (
    SELECT p.id FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
)
WITH CHECK (
  panel_id IN (
    SELECT p.id FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

-- Public can view active themes for active panels
CREATE POLICY "Public can view active buyer themes"
ON public.buyer_themes
FOR SELECT
USING (
  is_active = true AND
  panel_id IN (SELECT id FROM panels WHERE status = 'active')
);

-- Add buyer_theme column to panels table
ALTER TABLE public.panels ADD COLUMN IF NOT EXISTS buyer_theme TEXT DEFAULT 'default';

-- Create index for faster lookups
CREATE INDEX idx_buyer_themes_panel_id ON public.buyer_themes(panel_id);
CREATE INDEX idx_buyer_themes_active ON public.buyer_themes(panel_id, is_active) WHERE is_active = true;

-- Updated at trigger
CREATE TRIGGER update_buyer_themes_updated_at
  BEFORE UPDATE ON public.buyer_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();