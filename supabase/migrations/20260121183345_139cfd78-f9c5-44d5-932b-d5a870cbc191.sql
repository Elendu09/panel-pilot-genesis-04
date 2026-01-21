-- Create platform_docs table for documentation management
CREATE TABLE platform_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_popular BOOLEAN DEFAULT false,
  read_time TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  table_of_contents JSONB DEFAULT '[]',
  related_docs TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_docs ENABLE ROW LEVEL SECURITY;

-- Public can view published docs
CREATE POLICY "Public can view published docs"
ON platform_docs FOR SELECT
USING (status = 'published');

-- Admins can manage all docs
CREATE POLICY "Admins can manage docs"
ON platform_docs FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create indexes
CREATE INDEX idx_platform_docs_category ON platform_docs(category);
CREATE INDEX idx_platform_docs_slug ON platform_docs(slug);
CREATE INDEX idx_platform_docs_popular ON platform_docs(is_popular) WHERE is_popular = true;