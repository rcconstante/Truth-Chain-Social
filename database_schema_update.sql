-- Add new columns to the posts table (safe for existing tables)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_fact_check_score INTEGER,
ADD COLUMN IF NOT EXISTS ai_sources TEXT[];

-- Add missing columns that might not exist (safe for existing tables)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS truth_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verifications INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS challenges INTEGER DEFAULT 0;

-- Update verification_status enum to include new statuses (safe for existing columns)
DO $$
BEGIN
    ALTER TABLE posts ALTER COLUMN verification_status TYPE TEXT;
EXCEPTION
    WHEN others THEN
        -- Column might already be TEXT type, ignore error
        NULL;
END $$;

-- Update any existing posts to have default values (safe for existing data)
UPDATE posts 
SET 
  truth_score = COALESCE(truth_score, 50),
  upvotes = COALESCE(upvotes, 0),
  downvotes = COALESCE(downvotes, 0),
  comments_count = COALESCE(comments_count, 0),
  verifications = COALESCE(verifications, 0),
  challenges = COALESCE(challenges, 0)
WHERE truth_score IS NULL 
   OR upvotes IS NULL 
   OR downvotes IS NULL 
   OR comments_count IS NULL 
   OR verifications IS NULL 
   OR challenges IS NULL;

-- Create storage bucket for images (safe for existing buckets)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true) 
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for storage bucket (safe for existing policies)
DO $$
BEGIN
    -- Public Access policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public Access'
    ) THEN
        CREATE POLICY "Public Access" ON storage.objects 
        FOR SELECT USING (bucket_id = 'images');
    END IF;

    -- Authenticated can upload policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated can upload'
    ) THEN
        CREATE POLICY "Authenticated can upload" ON storage.objects 
        FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
    END IF;

    -- Users can update own uploads policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update own uploads'
    ) THEN
        CREATE POLICY "Users can update own uploads" ON storage.objects 
        FOR UPDATE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    -- Users can delete own uploads policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can delete own uploads'
    ) THEN
        CREATE POLICY "Users can delete own uploads" ON storage.objects 
        FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- Create post_votes table if it doesn't exist (to fix the 406 error)
CREATE TABLE IF NOT EXISTS post_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Enable RLS on post_votes table
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for post_votes (safe for existing policies)
DO $$
BEGIN
    -- Users can view all votes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'post_votes' 
        AND policyname = 'Users can view votes'
    ) THEN
        CREATE POLICY "Users can view votes" ON post_votes 
        FOR SELECT USING (true);
    END IF;

    -- Users can create their own votes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'post_votes' 
        AND policyname = 'Users can vote'
    ) THEN
        CREATE POLICY "Users can vote" ON post_votes 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Users can update their own votes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'post_votes' 
        AND policyname = 'Users can update own votes'
    ) THEN
        CREATE POLICY "Users can update own votes" ON post_votes 
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Users can delete their own votes
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'post_votes' 
        AND policyname = 'Users can delete own votes'
    ) THEN
        CREATE POLICY "Users can delete own votes" ON post_votes 
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$; 