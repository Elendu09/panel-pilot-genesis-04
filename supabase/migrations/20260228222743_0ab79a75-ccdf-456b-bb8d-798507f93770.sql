
CREATE TABLE public.ad_analytics_daily (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  panel_id UUID NOT NULL REFERENCES public.panels(id) ON DELETE CASCADE,
  ad_id UUID REFERENCES public.provider_ads(id) ON DELETE SET NULL,
  ad_type TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(panel_id, ad_type, date)
);

ALTER TABLE public.ad_analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Panel owners can read their ad analytics"
  ON public.ad_analytics_daily
  FOR SELECT
  USING (panel_id IN (
    SELECT p.id FROM panels p
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE pr.user_id = auth.uid()
  ));

CREATE POLICY "System can insert ad analytics"
  ON public.ad_analytics_daily
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update ad analytics"
  ON public.ad_analytics_daily
  FOR UPDATE
  USING (true);
