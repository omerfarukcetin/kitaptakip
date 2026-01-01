-- Simple Migration: Add description to books table
-- Run this in Supabase SQL Editor

-- 1. Add description column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS description text;

-- That's it! Description field added.
-- (Book notes system can be added later as a separate feature)
