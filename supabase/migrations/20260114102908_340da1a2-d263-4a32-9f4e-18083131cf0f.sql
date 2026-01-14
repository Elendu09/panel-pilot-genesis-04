-- Add password_hash column to panel_team_members for team member authentication
ALTER TABLE public.panel_team_members 
ADD COLUMN IF NOT EXISTS password_hash TEXT;