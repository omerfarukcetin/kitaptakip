-- Add starting_page column to reading_plans table
ALTER TABLE IF EXISTS public.reading_plans 
ADD COLUMN IF NOT EXISTS starting_page integer DEFAULT 0;
