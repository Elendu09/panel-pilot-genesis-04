-- =====================================================
-- SERVICE CATEGORIES TABLE WITH PERSISTENT ORDERING
-- Fixes: Category drag-drop not persisting, 70+ categories issue
-- =====================================================

-- Create service_categories table for per-panel category management
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID NOT NULL REFERENCES panels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  icon_key TEXT DEFAULT 'other',
  color TEXT DEFAULT '#6B7280',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  service_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(panel_id, slug)
);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_categories
CREATE POLICY "Panel owners can manage their categories" 
  ON public.service_categories FOR ALL 
  USING (panel_id IN (
    SELECT panels.id FROM panels 
    WHERE panels.owner_id IN (
      SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
    )
  ));

CREATE POLICY "Public can view active categories" 
  ON public.service_categories FOR SELECT 
  USING (is_active = true AND panel_id IN (
    SELECT panels.id FROM panels WHERE panels.status = 'active'
  ));

-- Add category_id to services table for proper foreign key relationship
ALTER TABLE public.services 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_panel_position ON public.service_categories(panel_id, position);

-- Add unique constraint to prevent duplicate service imports
-- Using a conditional unique index to handle NULL values properly
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_services_panel_provider_unique'
  ) THEN
    CREATE UNIQUE INDEX idx_services_panel_provider_unique 
      ON public.services(panel_id, provider_service_id, provider_id) 
      WHERE provider_service_id IS NOT NULL AND provider_id IS NOT NULL;
  END IF;
END $$;

-- Function to auto-update service_count in service_categories
CREATE OR REPLACE FUNCTION public.update_category_service_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old category count if exists
  IF OLD IS NOT NULL AND OLD.category_id IS NOT NULL THEN
    UPDATE service_categories 
    SET service_count = (
      SELECT COUNT(*) FROM services 
      WHERE category_id = OLD.category_id AND is_active = true
    ),
    updated_at = now()
    WHERE id = OLD.category_id;
  END IF;
  
  -- Update new category count if exists
  IF NEW IS NOT NULL AND NEW.category_id IS NOT NULL THEN
    UPDATE service_categories 
    SET service_count = (
      SELECT COUNT(*) FROM services 
      WHERE category_id = NEW.category_id AND is_active = true
    ),
    updated_at = now()
    WHERE id = NEW.category_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for service count updates
DROP TRIGGER IF EXISTS trigger_update_category_service_count ON services;
CREATE TRIGGER trigger_update_category_service_count
  AFTER INSERT OR UPDATE OR DELETE ON services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_category_service_count();

-- Function to sync categories from services (for initial setup)
CREATE OR REPLACE FUNCTION public.sync_panel_categories(p_panel_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_cat RECORD;
BEGIN
  -- Get distinct categories from services for this panel
  FOR v_cat IN 
    SELECT DISTINCT category, COUNT(*) as svc_count
    FROM services 
    WHERE panel_id = p_panel_id AND is_active = true
    GROUP BY category
    ORDER BY COUNT(*) DESC
  LOOP
    -- Insert or update category
    INSERT INTO service_categories (panel_id, name, slug, icon_key, position, service_count)
    VALUES (
      p_panel_id,
      INITCAP(REPLACE(v_cat.category::text, '_', ' ')),
      v_cat.category::text,
      v_cat.category::text,
      v_count,
      v_cat.svc_count
    )
    ON CONFLICT (panel_id, slug) DO UPDATE SET
      service_count = EXCLUDED.service_count,
      updated_at = now();
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;