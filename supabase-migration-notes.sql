-- Migration: Add description to books and create book_notes table
-- Run this in Supabase SQL Editor after the initial schema

-- 1. Add description column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS description text;

-- 2. Create note_type enum
DO $$ BEGIN
    CREATE TYPE note_type AS ENUM ('quote', 'thought', 'summary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create book_notes table
CREATE TABLE IF NOT EXISTS book_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books ON DELETE CASCADE NOT NULL,
  note_type note_type NOT NULL,
  content text NOT NULL,
  page_number int,
  categories text[],
  tags text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Create indexes for book_notes
CREATE INDEX IF NOT EXISTS book_notes_user_id_idx ON book_notes(user_id);
CREATE INDEX IF NOT EXISTS book_notes_book_id_idx ON book_notes(book_id);
CREATE INDEX IF NOT EXISTS book_notes_type_idx ON book_notes(note_type);

-- 5. Enable RLS for book_notes
ALTER TABLE book_notes ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for book_notes
DO $$ BEGIN
    CREATE POLICY "Users can manage own notes"
      ON book_notes FOR ALL
      USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Create trigger for book_notes
CREATE TRIGGER IF NOT EXISTS update_book_notes_updated_at
  BEFORE UPDATE ON book_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
