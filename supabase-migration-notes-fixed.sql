-- Migration: Create book_notes table
-- Run this in Supabase SQL Editor

-- 1. Create note_type enum
DO $$ BEGIN
    CREATE TYPE note_type AS ENUM ('quote', 'thought', 'summary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create book_notes table
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

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS book_notes_user_id_idx ON book_notes(user_id);
CREATE INDEX IF NOT EXISTS book_notes_book_id_idx ON book_notes(book_id);
CREATE INDEX IF NOT EXISTS book_notes_type_idx ON book_notes(note_type);

-- 4. Enable RLS
ALTER TABLE book_notes ENABLE ROW LEVEL SECURITY;

-- 5. Create policy (drop if exists, then create)
DROP POLICY IF EXISTS "Users can manage own notes" ON book_notes;
CREATE POLICY "Users can manage own notes"
  ON book_notes FOR ALL
  USING (auth.uid() = user_id);

-- 6. Add trigger (drop if exists, then create)
DROP TRIGGER IF EXISTS update_book_notes_updated_at ON book_notes;
CREATE TRIGGER update_book_notes_updated_at
  BEFORE UPDATE ON book_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
