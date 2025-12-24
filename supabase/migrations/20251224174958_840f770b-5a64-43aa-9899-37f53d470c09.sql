-- Add max_services column to panels table with default 5500
ALTER TABLE public.panels ADD COLUMN IF NOT EXISTS max_services INTEGER DEFAULT 5500;