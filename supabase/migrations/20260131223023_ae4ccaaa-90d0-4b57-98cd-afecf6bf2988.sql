-- Create analytics events table for funnel tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES panels(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  session_id TEXT,
  buyer_id UUID REFERENCES client_users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_panel_type 
  ON analytics_events(panel_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created 
  ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session 
  ON analytics_events(session_id);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Panel owners can read their own events
CREATE POLICY "Panel owners can read analytics events"
  ON analytics_events FOR SELECT
  USING (
    panel_id IN (
      SELECT id FROM panels 
      WHERE owner_id = auth.uid()
    )
  );

-- Policy: Allow anonymous inserts for tracking (public storefront)
CREATE POLICY "Allow analytics event inserts"
  ON analytics_events FOR INSERT
  WITH CHECK (true);