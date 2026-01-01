-- Create reading_goals table
CREATE TABLE IF NOT EXISTS public.reading_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    year integer NOT NULL,
    goal integer NOT NULL DEFAULT 12,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, year)
);

-- Enable RLS
ALTER TABLE public.reading_goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own goals" 
ON public.reading_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
ON public.reading_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.reading_goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.reading_goals FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reading_goals_updated_at
    BEFORE UPDATE ON public.reading_goals
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
