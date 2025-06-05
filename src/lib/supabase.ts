import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase configuration:', {
  url: supabaseUrl ? 'SET' : 'MISSING',
  key: supabaseAnonKey ? 'SET' : 'MISSING',
  urlValue: supabaseUrl
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Supabase connection test:', { success: !error, error });
}).catch(err => {
  console.error('Supabase connection failed:', err);
});

export type Profile = {
  id: string;
  username: string;
  bio: string;
  avatar_url: string;
  reputation_score: number;
  algo_balance: number;
  algo_address?: string | null;
  total_stakes: number;
  successful_challenges: number;
  accuracy_rate: number;
  onboarding_completed?: boolean;
  wallet_connected?: boolean;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  stake_amount: number;
  challenge_amount: number;
  verification_status: 'pending' | 'verified' | 'disputed' | 'false';
  created_at: string;
  updated_at: string;
};

export type Challenge = {
  id: string;
  post_id: string;
  challenger_id: string;
  stake_amount: number;
  reason: string;
  status: 'pending' | 'resolved' | 'winner_original' | 'winner_challenger';
  created_at: string;
  updated_at: string;
};