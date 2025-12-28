-- Create panel_role enum for team member roles
CREATE TYPE panel_role AS ENUM ('panel_admin', 'manager', 'agent');

-- Create panel_team_members table for managing panel staff
CREATE TABLE public.panel_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id UUID REFERENCES panels(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role panel_role NOT NULL DEFAULT 'agent',
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  invited_by UUID,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(panel_id, email)
);

-- Enable RLS
ALTER TABLE public.panel_team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Panel owners can manage their team members
CREATE POLICY "Panel owners can manage team members"
ON public.panel_team_members FOR ALL
USING (panel_id IN (
  SELECT p.id FROM panels p
  JOIN profiles pr ON p.owner_id = pr.id
  WHERE pr.user_id = auth.uid()
))
WITH CHECK (panel_id IN (
  SELECT p.id FROM panels p
  JOIN profiles pr ON p.owner_id = pr.id
  WHERE pr.user_id = auth.uid()
));

-- Policy: Team members can view their own record
CREATE POLICY "Team members can view own record"
ON public.panel_team_members FOR SELECT
USING (email = (SELECT email FROM profiles WHERE user_id = auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_panel_team_members_updated_at
  BEFORE UPDATE ON public.panel_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();