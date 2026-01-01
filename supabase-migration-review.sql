-- Add review column to books table
ALTER TABLE IF EXISTS public.books 
ADD COLUMN IF NOT EXISTS review text;
