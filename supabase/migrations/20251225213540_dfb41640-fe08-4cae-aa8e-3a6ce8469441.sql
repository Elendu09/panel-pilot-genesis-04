-- Create bulk_operation_jobs table for tracking bulk operations with realtime
CREATE TABLE public.bulk_operation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES public.panels(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total_items INTEGER NOT NULL,
  processed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  target_ids TEXT[] NOT NULL DEFAULT '{}',
  operation_data JSONB DEFAULT '{}',
  error_log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable Row Level Security
ALTER TABLE public.bulk_operation_jobs ENABLE ROW LEVEL SECURITY;

-- Panel owners can manage their own bulk operations
CREATE POLICY "Panel owners can manage their bulk jobs"
ON public.bulk_operation_jobs
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

-- Enable realtime for this table
ALTER TABLE public.bulk_operation_jobs REPLICA IDENTITY FULL;

-- Add indexes for performance
CREATE INDEX idx_bulk_jobs_panel_id ON public.bulk_operation_jobs(panel_id);
CREATE INDEX idx_bulk_jobs_status ON public.bulk_operation_jobs(status);
CREATE INDEX idx_bulk_jobs_created_at ON public.bulk_operation_jobs(created_at DESC);