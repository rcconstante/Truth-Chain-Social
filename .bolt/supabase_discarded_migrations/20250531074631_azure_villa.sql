/*
  # Create posts and related tables

  This migration creates the necessary tables for the post system including:
  
  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `stake_amount` (numeric)
      - `confidence_score` (integer)
      - `tags` (text[])
      - `truth_score` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `post_votes`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references profiles)
      - `vote_type` (text)
      - `created_at` (timestamp)
    
    - `post_challenges`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `challenger_id` (uuid, references profiles)
      - `stake_amount` (numeric)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create posts table
CREATE TABLE public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    stake_amount numeric NOT NULL DEFAULT 0,
    confidence_score integer NOT NULL DEFAULT 50,
    tags text[] DEFAULT ARRAY[]::text[],
    truth_score numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create post_votes table
CREATE TABLE public.post_votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vote_type text NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Create post_challenges table
CREATE TABLE public.post_challenges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    challenger_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stake_amount numeric NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'resolved')),
    created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts are viewable by everyone"
    ON public.posts FOR SELECT
    USING (true);

CREATE POLICY "Users can create posts"
    ON public.posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
    ON public.posts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone"
    ON public.post_votes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can vote"
    ON public.post_votes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Challenges policies
CREATE POLICY "Challenges are viewable by everyone"
    ON public.post_challenges FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create challenges"
    ON public.post_challenges FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = challenger_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
    ON public.comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON public.comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to posts table
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();