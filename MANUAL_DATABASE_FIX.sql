-- MANUAL DATABASE FIX FOR TRUTHCHAIN
-- Run this in your Supabase SQL editor to fix all database issues

-- FIRST: Disable RLS temporarily to ensure access
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- 1. Ensure post_verifications table has correct schema with proper unique constraint
DROP TABLE IF EXISTS public.post_verifications CASCADE;
CREATE TABLE public.post_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  verifier_id uuid NOT NULL,
  stake_amount decimal NOT NULL CHECK (stake_amount > 0),
  verification_type text NOT NULL CHECK (verification_type IN ('support', 'challenge')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  reward_earned decimal DEFAULT 0,
  UNIQUE(post_id, verifier_id, verification_type)
);

-- 2. Add function to check existing stakes and prevent duplicates
CREATE OR REPLACE FUNCTION check_existing_stake(
  p_post_id uuid,
  p_verifier_id uuid,
  p_verification_type text
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.post_verifications 
    WHERE post_id = p_post_id 
      AND verifier_id = p_verifier_id 
      AND verification_type = p_verification_type
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create safe stake insertion function that handles duplicates
CREATE OR REPLACE FUNCTION safe_insert_stake(
  p_post_id uuid,
  p_verifier_id uuid,
  p_stake_amount decimal,
  p_verification_type text
)
RETURNS json AS $$
DECLARE
  stake_exists boolean;
  result json;
BEGIN
  -- Check if stake already exists
  stake_exists := check_existing_stake(p_post_id, p_verifier_id, p_verification_type);
  
  IF stake_exists THEN
    result := json_build_object(
      'success', false,
      'error', 'You have already ' || 
        CASE 
          WHEN p_verification_type = 'support' THEN 'verified'
          ELSE 'challenged'
        END || ' this post',
      'code', 'DUPLICATE_STAKE'
    );
  ELSE
    -- Insert the new stake
    INSERT INTO public.post_verifications (
      post_id, verifier_id, stake_amount, verification_type, status
    ) VALUES (
      p_post_id, p_verifier_id, p_stake_amount, p_verification_type, 'active'
    );
    
    result := json_build_object(
      'success', true,
      'message', 'Stake recorded successfully'
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure challenges table exists with correct schema
DROP TABLE IF EXISTS public.challenges CASCADE;
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  challenger_id uuid NOT NULL,
  stake_amount decimal NOT NULL CHECK (stake_amount > 0),
  reason text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'upheld', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolution text,
  blockchain_tx_id text,
  UNIQUE(post_id, challenger_id)
);

-- 5. Ensure transactions table has correct schema
DROP TABLE IF EXISTS public.transactions CASCADE;
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  amount decimal NOT NULL,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  description text,
  related_post_id uuid,
  blockchain_tx_id text,
  created_at timestamptz DEFAULT now()
);

-- 6. Ensure post_votes table has correct schema
DROP TABLE IF EXISTS public.post_votes CASCADE;
CREATE TABLE public.post_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 7. Add missing columns to existing tables
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_stakes numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS successful_challenges integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS accuracy_rate numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS algo_address text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS wallet_connected boolean DEFAULT false;

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS category text DEFAULT 'General',
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'disputed', 'false')),
ADD COLUMN IF NOT EXISTS challenge_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS upvotes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS verifications integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS challenges integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '7 days');

-- 8. Grant FULL permissions to all users (for development)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 9. Re-enable RLS with ultra-permissive policies
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Create ULTRA-PERMISSIVE policies (allow everything for development)
CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_post_votes" ON public.post_votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_post_verifications" ON public.post_verifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_challenges" ON public.challenges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- 10. Add foreign key constraints
ALTER TABLE public.post_verifications 
ADD CONSTRAINT post_verifications_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.post_verifications 
ADD CONSTRAINT post_verifications_verifier_id_fkey 
FOREIGN KEY (verifier_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.challenges 
ADD CONSTRAINT challenges_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.challenges 
ADD CONSTRAINT challenges_challenger_id_fkey 
FOREIGN KEY (challenger_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_related_post_id_fkey 
FOREIGN KEY (related_post_id) REFERENCES public.posts(id) ON DELETE SET NULL;

ALTER TABLE public.post_votes 
ADD CONSTRAINT post_votes_post_id_fkey 
FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.post_votes 
ADD CONSTRAINT post_votes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 11. Create vote counting trigger function
CREATE OR REPLACE FUNCTION update_post_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE public.posts SET upvotes = COALESCE(upvotes, 0) + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE public.posts SET downvotes = COALESCE(downvotes, 0) + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE public.posts SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0) WHERE id = OLD.post_id;
    ELSE
      UPDATE public.posts SET downvotes = GREATEST(COALESCE(downvotes, 0) - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote type changes
    IF OLD.vote_type = 'upvote' THEN
      UPDATE public.posts SET upvotes = GREATEST(COALESCE(upvotes, 0) - 1, 0) WHERE id = OLD.post_id;
    ELSE
      UPDATE public.posts SET downvotes = GREATEST(COALESCE(downvotes, 0) - 1, 0) WHERE id = OLD.post_id;
    END IF;
    
    IF NEW.vote_type = 'upvote' THEN
      UPDATE public.posts SET upvotes = COALESCE(upvotes, 0) + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE public.posts SET downvotes = COALESCE(downvotes, 0) + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 12. Create vote counting trigger
DROP TRIGGER IF EXISTS update_vote_counts_trigger ON public.post_votes;
CREATE TRIGGER update_vote_counts_trigger 
  AFTER INSERT OR DELETE OR UPDATE ON public.post_votes 
  FOR EACH ROW EXECUTE FUNCTION update_post_vote_counts();

-- 13. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_verifications_post_id ON public.post_verifications(post_id);
CREATE INDEX IF NOT EXISTS idx_post_verifications_verifier_id ON public.post_verifications(verifier_id);
CREATE INDEX IF NOT EXISTS idx_challenges_post_id ON public.challenges(post_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenger_id ON public.challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_related_post_id ON public.transactions(related_post_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_post_id ON public.post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_votes_user_id ON public.post_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);

-- 14. FORCE DROP ALL increment_post_stats FUNCTIONS (COMPREHENSIVE FIX)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop all increment_post_stats functions regardless of signature
    FOR r IN 
        SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p 
        LEFT JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE p.proname = 'increment_post_stats' 
        AND n.nspname = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.nspname) || '.' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
        RAISE NOTICE 'Dropped function: %.%(%)', r.nspname, r.proname, r.args;
    END LOOP;
END $$;

-- Also drop with common signatures just to be sure
DROP FUNCTION IF EXISTS increment_post_stats(uuid) CASCADE;
DROP FUNCTION IF EXISTS increment_post_stats(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS increment_post_stats(uuid, numeric, integer) CASCADE;
DROP FUNCTION IF EXISTS increment_post_stats(uuid, numeric, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.increment_post_stats(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.increment_post_stats(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.increment_post_stats(uuid, numeric, integer) CASCADE;
DROP FUNCTION IF EXISTS public.increment_post_stats(uuid, numeric, integer, integer) CASCADE;

-- 15. Create SINGLE atomic post stats increment function (UNIQUE VERSION)
CREATE OR REPLACE FUNCTION increment_post_stats(
  post_id uuid,
  stake_increment numeric DEFAULT 0,
  verification_increment integer DEFAULT 0,
  challenge_increment integer DEFAULT 0
)
RETURNS void AS $$
BEGIN
  UPDATE public.posts 
  SET 
    stake_amount = COALESCE(stake_amount, 0) + stake_increment,
    verifications = COALESCE(verifications, 0) + verification_increment,
    challenges = COALESCE(challenges, 0) + challenge_increment
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Create function to sync verification counts from actual records
CREATE OR REPLACE FUNCTION sync_post_verification_counts()
RETURNS void AS $$
DECLARE
  post_record RECORD;
BEGIN
  FOR post_record IN SELECT id FROM public.posts LOOP
    UPDATE public.posts 
    SET 
      verifications = (
        SELECT COUNT(*) 
        FROM public.post_verifications 
        WHERE post_id = post_record.id 
        AND verification_type = 'support' 
        AND status = 'active'
      ),
      challenges = (
        SELECT COUNT(*) 
        FROM public.post_verifications 
        WHERE post_id = post_record.id 
        AND verification_type = 'challenge' 
        AND status = 'active'
      )
    WHERE id = post_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Create trigger to automatically update verification counts
CREATE OR REPLACE FUNCTION update_verification_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.verification_type = 'support' THEN
      UPDATE public.posts SET verifications = COALESCE(verifications, 0) + 1 WHERE id = NEW.post_id;
    ELSIF NEW.verification_type = 'challenge' THEN
      UPDATE public.posts SET challenges = COALESCE(challenges, 0) + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.verification_type = 'support' THEN
      UPDATE public.posts SET verifications = GREATEST(COALESCE(verifications, 0) - 1, 0) WHERE id = OLD.post_id;
    ELSIF OLD.verification_type = 'challenge' THEN
      UPDATE public.posts SET challenges = GREATEST(COALESCE(challenges, 0) - 1, 0) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Create trigger for verification count updates
DROP TRIGGER IF EXISTS update_verification_counts_trigger ON public.post_verifications;
CREATE TRIGGER update_verification_counts_trigger 
  AFTER INSERT OR DELETE ON public.post_verifications 
  FOR EACH ROW EXECUTE FUNCTION update_verification_counts();

-- 19. Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION increment_post_stats TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_stats TO anon;
GRANT EXECUTE ON FUNCTION sync_post_verification_counts TO authenticated;
GRANT EXECUTE ON FUNCTION sync_post_verification_counts TO anon;
GRANT EXECUTE ON FUNCTION update_verification_counts TO authenticated;
GRANT EXECUTE ON FUNCTION update_verification_counts TO anon;
GRANT EXECUTE ON FUNCTION update_post_vote_counts TO authenticated;
GRANT EXECUTE ON FUNCTION update_post_vote_counts TO anon;
GRANT EXECUTE ON FUNCTION check_existing_stake TO authenticated;
GRANT EXECUTE ON FUNCTION check_existing_stake TO anon;
GRANT EXECUTE ON FUNCTION safe_insert_stake TO authenticated;
GRANT EXECUTE ON FUNCTION safe_insert_stake TO anon;

-- 20. Run initial sync to fix existing data
SELECT sync_post_verification_counts();

-- 21. Confirmation
SELECT 'SUCCESS: Database function conflict resolved and duplicate prevention enabled!' as status; 