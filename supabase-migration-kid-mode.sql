-- Çocuk Modu için Profil Tablosuna Yeni Alanlar Ekleme
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS avatar_id TEXT DEFAULT 'astro',
ADD COLUMN IF NOT EXISTS kid_level INTEGER DEFAULT 1;

-- Okuma İlerlemesine Macera Verileri Ekleme
ALTER TABLE public.reading_progress
ADD COLUMN IF NOT EXISTS emoji_mood TEXT,
ADD COLUMN IF NOT EXISTS voice_summary_url TEXT;

-- Ödül Marketi için Tablo Oluşturma
CREATE TABLE IF NOT EXISTS public.kid_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    icon TEXT,
    is_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Politikaları
ALTER TABLE public.kid_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own kid rewards"
ON public.kid_rewards FOR ALL
USING (auth.uid() = user_id);
