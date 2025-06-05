/*
  # Complete TruthChain Schema - Core Features Implementation
  
  This migration adds all missing tables for the full TruthChain platform:
  
  1. Enhanced profiles table
  2. Truth staking system
  3. AI moderation system  
  4. Voice features
  5. Chat and communication
  6. Reputation and rewards
  7. Challenge resolution system
*/

-- Add missing columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_stakes numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS successful_challenges integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS accuracy_rate numeric DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS expertise_areas text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS algo_address text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_topics text[] DEFAULT ARRAY[]::text[];

-- Add missing columns to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS category text DEFAULT 'General',
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'disputed', 'false')),
ADD COLUMN IF NOT EXISTS challenge_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_verdict boolean,
ADD COLUMN IF NOT EXISTS final_verdict boolean,
ADD COLUMN IF NOT EXISTS blockchain_tx_id text,
ADD COLUMN IF NOT EXISTS smart_contract_post_id text,
ADD COLUMN IF NOT EXISTS upvotes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS downvotes integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS verifications integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS challenges integer DEFAULT 0;

-- Create transactions table for ALGO tracking
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL CHECK (type IN ('stake', 'reward', 'challenge', 'penalty', 'withdrawal')),
    amount numeric NOT NULL,
    description text,
    related_post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
    blockchain_tx_id text,
    created_at timestamptz DEFAULT now()
);

-- Create AI moderators table
CREATE TABLE IF NOT EXISTS public.ai_moderators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    personality text NOT NULL,
    expertise text[] NOT NULL,
    avatar_style text NOT NULL,
    tavus_persona_id text,
    prompt_template text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Create AI moderator interactions table
CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id uuid REFERENCES public.ai_moderators(id) ON DELETE CASCADE NOT NULL,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    interaction_type text NOT NULL CHECK (interaction_type IN ('introduction', 'analysis', 'summary', 'ruling')),
    content text NOT NULL,
    video_url text,
    audio_url text,
    tavus_video_id text,
    created_at timestamptz DEFAULT now()
);

-- Create chat rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    type text NOT NULL CHECK (type IN ('topic', 'community', 'voice')),
    topic text,
    moderator_id uuid REFERENCES public.ai_moderators(id),
    is_public boolean DEFAULT true,
    max_participants integer,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'ai_response')),
    audio_url text,
    is_ai_generated boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Create voice sessions table
CREATE TABLE IF NOT EXISTS public.voice_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    host_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    max_speakers integer DEFAULT 10,
    current_speakers uuid[] DEFAULT ARRAY[]::uuid[],
    recording_url text,
    transcript text,
    created_at timestamptz DEFAULT now(),
    ended_at timestamptz
);

-- Create challenge resolutions table
CREATE TABLE IF NOT EXISTS public.challenge_resolutions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id uuid REFERENCES public.post_challenges(id) ON DELETE CASCADE NOT NULL,
    resolved_by text NOT NULL CHECK (resolved_by IN ('ai', 'community', 'expert', 'admin')),
    verdict boolean NOT NULL, -- true = original post wins, false = challenger wins
    evidence text,
    confidence_score numeric,
    votes_for integer DEFAULT 0,
    votes_against integer DEFAULT 0,
    resolution_notes text,
    resolved_at timestamptz DEFAULT now()
);

-- Create reputation events table
CREATE TABLE IF NOT EXISTS public.reputation_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_type text NOT NULL CHECK (event_type IN ('post_verified', 'post_disputed', 'challenge_won', 'challenge_lost', 'community_contribution')),
    points_change integer NOT NULL,
    related_post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
    related_challenge_id uuid REFERENCES public.post_challenges(id) ON DELETE SET NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Create truth staking events table (blockchain integration)
CREATE TABLE IF NOT EXISTS public.staking_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    event_type text NOT NULL CHECK (event_type IN ('stake_created', 'stake_challenged', 'stake_resolved', 'rewards_claimed')),
    amount numeric NOT NULL,
    blockchain_tx_id text NOT NULL,
    smart_contract_data jsonb,
    created_at timestamptz DEFAULT now()
);

-- Create notification system table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type text NOT NULL CHECK (type IN ('stake_challenge', 'post_verified', 'reward_earned', 'new_follower', 'mention', 'ai_insight')),
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS public.leaderboards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category text NOT NULL CHECK (category IN ('earnings', 'accuracy', 'challenges', 'contributions', 'expertise', 'rising_stars')),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score numeric NOT NULL,
    rank integer NOT NULL,
    period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'all_time')),
    updated_at timestamptz DEFAULT now()
);

-- Insert default AI moderators
INSERT INTO public.ai_moderators (name, personality, expertise, avatar_style, prompt_template) VALUES
('Dr. Sarah Chen', 'Professional, caring, evidence-focused', ARRAY['health', 'medicine', 'biology'], 'medical_professional', 'As Dr. Sarah Chen, a medical expert, analyze this health claim based on peer-reviewed medical research and clinical evidence.'),
('Professor Marcus Williams', 'Scholarly, balanced, diplomatic', ARRAY['politics', 'economics', 'history'], 'professional_academic', 'As Professor Marcus Williams, provide an impartial analysis of this political claim, focusing on verifiable facts and avoiding partisan bias.'),
('Tech Expert Sam Rivera', 'Enthusiastic, cutting-edge, accessible', ARRAY['technology', 'ai', 'cryptocurrency'], 'tech_professional', 'As Tech Expert Sam Rivera, analyze this technology claim with focus on technical accuracy and current industry standards.'),
('Dr. Alex Thompson', 'Passionate, scientific, solutions-oriented', ARRAY['climate', 'environment', 'energy'], 'environmental_scientist', 'As Dr. Alex Thompson, evaluate this environmental claim based on peer-reviewed climate research and scientific consensus.');

-- Insert default chat rooms
INSERT INTO public.chat_rooms (name, description, type, topic, moderator_id) VALUES
('Politics & Policy', 'Discuss political claims and policy analysis', 'topic', 'politics', (SELECT id FROM ai_moderators WHERE name = 'Professor Marcus Williams')),
('Health & Medicine', 'Medical and health-related truth discussions', 'topic', 'health', (SELECT id FROM ai_moderators WHERE name = 'Dr. Sarah Chen')),
('Technology Hub', 'Tech news, AI, and cryptocurrency discussions', 'topic', 'technology', (SELECT id FROM ai_moderators WHERE name = 'Tech Expert Sam Rivera')),
('Climate & Environment', 'Environmental science and climate change facts', 'topic', 'climate', (SELECT id FROM ai_moderators WHERE name = 'Dr. Alex Thompson')),
('General Discussion', 'Open discussion for all topics', 'community', 'general', NULL),
('Newcomers Lounge', 'Help and guidance for new users', 'community', 'help', NULL);

-- Enable RLS on all new tables
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- AI moderators policies (public read, admin write)
CREATE POLICY "AI moderators are viewable by everyone" ON public.ai_moderators FOR SELECT USING (true);

-- AI interactions policies
CREATE POLICY "AI interactions are viewable by everyone" ON public.ai_interactions FOR SELECT USING (true);
CREATE POLICY "System can create AI interactions" ON public.ai_interactions FOR INSERT WITH CHECK (true);

-- Chat rooms policies
CREATE POLICY "Chat rooms are viewable by everyone" ON public.chat_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create chat rooms" ON public.chat_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Chat messages policies
CREATE POLICY "Chat messages are viewable by everyone" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Voice sessions policies
CREATE POLICY "Voice sessions are viewable by everyone" ON public.voice_sessions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can host voice sessions" ON public.voice_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);

-- Challenge resolutions policies
CREATE POLICY "Challenge resolutions are viewable by everyone" ON public.challenge_resolutions FOR SELECT USING (true);

-- Reputation events policies
CREATE POLICY "Users can view own reputation events" ON public.reputation_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Staking events policies
CREATE POLICY "Users can view own staking events" ON public.staking_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Leaderboards policies
CREATE POLICY "Leaderboards are viewable by everyone" ON public.leaderboards FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_verification_status ON public.posts(verification_status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_staking_events_post_id ON public.staking_events(post_id);
CREATE INDEX IF NOT EXISTS idx_reputation_events_user_id ON public.reputation_events(user_id);

-- Create functions for real-time updates
CREATE OR REPLACE FUNCTION increment_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'upvote' THEN
            UPDATE posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
        ELSIF NEW.vote_type = 'downvote' THEN
            UPDATE posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            UPDATE posts SET upvotes = upvotes - 1 WHERE id = OLD.post_id;
        ELSIF OLD.vote_type = 'downvote' THEN
            UPDATE posts SET downvotes = downvotes - 1 WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post vote statistics
DROP TRIGGER IF EXISTS update_post_vote_stats ON public.post_votes;
CREATE TRIGGER update_post_vote_stats
    AFTER INSERT OR DELETE ON public.post_votes
    FOR EACH ROW
    EXECUTE FUNCTION increment_post_stats();

-- Create function to update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment count
DROP TRIGGER IF EXISTS update_post_comment_count ON public.comments;
CREATE TRIGGER update_post_comment_count
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_count(); 