-- SIMPLIFIED FIX: Remove all existing policies and create clean ones
-- This avoids "already exists" errors

-- 1. DISABLE RLS temporarily to clear everything
ALTER TABLE public.post_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_challenges DISABLE ROW LEVEL SECURITY;

-- 2. ENABLE RLS with clean slate
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_challenges ENABLE ROW LEVEL SECURITY;

-- 3. CREATE SIMPLE, PERMISSIVE POLICIES

-- POST_VOTES: Allow everyone to read, authenticated to write
CREATE POLICY "allow_all_select" ON public.post_votes FOR SELECT USING (true);
CREATE POLICY "allow_auth_insert" ON public.post_votes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_auth_update" ON public.post_votes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_auth_delete" ON public.post_votes FOR DELETE TO authenticated USING (true);

-- COMMENTS: Allow everyone to read, authenticated to write
CREATE POLICY "allow_all_select" ON public.comments FOR SELECT USING (true);
CREATE POLICY "allow_auth_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_auth_update" ON public.comments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_auth_delete" ON public.comments FOR DELETE TO authenticated USING (true);

-- POSTS: Allow everyone to read, authenticated to write
CREATE POLICY "allow_all_select" ON public.posts FOR SELECT USING (true);
CREATE POLICY "allow_auth_insert" ON public.posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_auth_update" ON public.posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_auth_delete" ON public.posts FOR DELETE TO authenticated USING (true);

-- POST_CHALLENGES: Allow everyone to read, authenticated to write  
CREATE POLICY "allow_all_select" ON public.post_challenges FOR SELECT USING (true);
CREATE POLICY "allow_auth_insert" ON public.post_challenges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_auth_update" ON public.post_challenges FOR UPDATE TO authenticated USING (true);
CREATE POLICY "allow_auth_delete" ON public.post_challenges FOR DELETE TO authenticated USING (true);

-- 4. ENSURE TABLES EXIST WITH CORRECT STRUCTURE
CREATE TABLE IF NOT EXISTS public.post_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. CREATE OR REPLACE TRIGGER FUNCTIONS
CREATE OR REPLACE FUNCTION increment_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE public.posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE public.posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE public.posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- 6. DROP AND RECREATE TRIGGERS
DROP TRIGGER IF EXISTS update_post_vote_stats ON public.post_votes;
CREATE TRIGGER update_post_vote_stats 
  AFTER INSERT OR DELETE ON public.post_votes 
  FOR EACH ROW EXECUTE FUNCTION increment_post_stats();

-- 7. GRANT PERMISSIONS
GRANT ALL ON public.post_votes TO authenticated;
GRANT ALL ON public.comments TO authenticated;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.post_challenges TO authenticated; 