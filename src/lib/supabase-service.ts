import { supabase, type Profile, type Post, type Challenge } from './supabase';

export interface TruthPost {
  id: string;
  content: string;
  image_url?: string | null;
  author: string;
  stakeAmount: number;
  status: 'pending' | 'verified' | 'challenged' | 'expired' | 'finished';
  expires_at?: string | null;
  truthScore: number;
  ai_fact_check_score?: number | null;
  ai_sources?: string[] | null;
  verifications: number;
  challenges: number;
  totalStaked: number;
  createdAt: string;
  category: string;
  tags: string[];
  user_id?: string;
  upvotes: number;
  downvotes: number;
  comments_count: number;
}

export interface UserProfile {
  id: string;
  username: string;
  bio: string;
  reputation_score: number;
  algo_balance: number;
  total_stakes: number;
  successful_challenges: number;
  accuracy_rate: number;
  avatar_url?: string;
}

// User/Profile Services
export class UserService {
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return profile ? {
        id: profile.id,
        username: profile.username,
        bio: profile.bio || '',
        reputation_score: profile.reputation_score || 100,
        algo_balance: profile.algo_balance || 0,
        total_stakes: profile.total_stakes || 0,
        successful_challenges: profile.successful_challenges || 0,
        accuracy_rate: profile.accuracy_rate || 1.0,
        avatar_url: profile.avatar_url
      } : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async createUserProfile(userId: string, profileData: Partial<Profile>): Promise<Profile | null> {
    try {
      console.log('Creating user profile for:', userId, profileData);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: profileData.username || 'Anonymous',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || '',
          reputation_score: 100, // Starting reputation
          algo_balance: 0,
          total_stakes: 0,
          successful_challenges: 0,
          accuracy_rate: 1.0,
          ...profileData
        })
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        
        // If it's an RLS policy error, try with auth context
        if (error.code === '42501' || error.message.includes('row-level security')) {
          console.log('Retrying profile creation with auth context...');
          
          // Get current session to ensure we have auth context
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const { data: retryData, error: retryError } = await supabase
              .from('profiles')
              .upsert({
                id: userId,
                username: profileData.username || 'Anonymous',
                bio: profileData.bio || '',
                avatar_url: profileData.avatar_url || '',
                reputation_score: 100,
                algo_balance: 0,
                total_stakes: 0,
                successful_challenges: 0,
                accuracy_rate: 1.0,
                ...profileData
              }, {
                onConflict: 'id'
              })
              .select()
              .single();
              
            if (retryError) {
              console.error('Retry profile creation failed:', retryError);
              throw retryError;
            }
            
            console.log('Profile created successfully on retry:', retryData);
            return retryData;
          }
        }
        
        throw error;
      }
      
      console.log('Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }
}

// Post Services
export class PostService {
  static async getAllPosts(): Promise<TruthPost[]> {
    try {
      console.log('🔄 Fetching all posts with real-time vote counts...');
      
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          user_id,
          stake_amount,
          truth_score,
          verification_status,
          category,
          tags,
          verifications,
          challenges,
          upvotes,
          downvotes,
          comments_count,
          expires_at,
          ai_fact_check_score,
          ai_sources,
          created_at,
          profiles:user_id (username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching posts:', error);
        throw error;
      }

      console.log(`✅ Fetched ${posts?.length || 0} posts with vote counts`);
      
      return (posts || []).map(post => {
        // Debug log to check vote counts
        console.log(`📊 Post ${post.id}: upvotes=${post.upvotes}, downvotes=${post.downvotes}`);
        
        return {
          id: post.id,
          content: post.content,
          image_url: post.image_url,
          author: (post.profiles as any)?.username || 'Anonymous',
          stakeAmount: Number(post.stake_amount) || 0,
          status: post.verification_status || 'pending',
          expires_at: post.expires_at,
          truthScore: Number(post.truth_score) || 50,
          ai_fact_check_score: post.ai_fact_check_score,
          ai_sources: post.ai_sources,
          verifications: Number(post.verifications) || 0,
          challenges: Number(post.challenges) || 0,
          totalStaked: Number(post.stake_amount) || 0,
          createdAt: post.created_at,
          category: post.category || 'General',
          tags: Array.isArray(post.tags) ? post.tags : [],
          user_id: post.user_id,
          upvotes: Number(post.upvotes) || 0,
          downvotes: Number(post.downvotes) || 0,
          comments_count: Number(post.comments_count) || 0
        };
      });

    } catch (error) {
      console.error('❌ Error fetching posts from database:', error);
      return [];
    }
  }

  static async getUserPosts(userId: string): Promise<TruthPost[]> {
    try {
      console.log(`🔄 Fetching posts for user ${userId} with vote counts...`);
      
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          user_id,
          stake_amount,
          truth_score,
          verification_status,
          category,
          tags,
          verifications,
          challenges,
          upvotes,
          downvotes,
          comments_count,
          expires_at,
          ai_fact_check_score,
          ai_sources,
          created_at,
          profiles:user_id (username, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user posts:', error);
        throw error;
      }

      console.log(`✅ Fetched ${posts?.length || 0} user posts with vote counts`);

      return (posts || []).map(post => {
        console.log(`📊 User Post ${post.id}: upvotes=${post.upvotes}, downvotes=${post.downvotes}`);
        
        return {
          id: post.id,
          content: post.content,
          image_url: post.image_url,
          author: (post.profiles as any)?.username || 'Anonymous',
          stakeAmount: Number(post.stake_amount) || 0,
          status: post.verification_status || 'pending',
          expires_at: post.expires_at,
          truthScore: Number(post.truth_score) || 50,
          ai_fact_check_score: post.ai_fact_check_score,
          ai_sources: post.ai_sources,
          verifications: Number(post.verifications) || 0,
          challenges: Number(post.challenges) || 0,
          totalStaked: Number(post.stake_amount) || 0,
          createdAt: post.created_at,
          category: post.category || 'General',
          tags: Array.isArray(post.tags) ? post.tags : [],
          user_id: post.user_id,
          upvotes: Number(post.upvotes) || 0,
          downvotes: Number(post.downvotes) || 0,
          comments_count: Number(post.comments_count) || 0
        };
      });

    } catch (error) {
      console.error('❌ Error fetching user posts from database:', error);
      return [];
    }
  }

  static async createPost(postData: {
    user_id: string;
    content: string;
    stake_amount: number;
    category?: string;
  }): Promise<TruthPost | null> {
    console.log('📦 PostService.createPost called with:', postData);
    
    try {
      console.log('🗄️ Creating post in database...');
      
      // Create post in database
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: postData.user_id,
          content: postData.content,
          stake_amount: postData.stake_amount,
          challenge_amount: 0,
          verification_status: 'pending',
          category: postData.category || 'General'
        })
        .select(`
          *,
          profiles:user_id (username)
        `)
        .single();

      if (error) {
        console.error('❌ Database error creating post:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from database');
      }
      
      console.log('✅ Database post created successfully:', data);
      
      return {
        id: data.id,
        content: data.content,
        author: data.profiles?.username || 'Anonymous',
        stakeAmount: data.stake_amount,
        status: data.verification_status || 'pending',
        truthScore: data.truth_score || 50,
        verifications: data.verifications || 0,
        challenges: data.challenges || 0,
        totalStaked: data.stake_amount,
        createdAt: data.created_at,
        category: data.category || 'General',
        tags: data.tags || [],
        user_id: data.user_id,
        upvotes: 0,
        downvotes: 0,
        comments_count: 0
      };
      
    } catch (error) {
      console.error('❌ PostService.createPost error:', error);
      throw error;
    }
  }

  static async stakeOnPost(postId: string, userId: string, amount: number): Promise<boolean> {
    try {
      // Update post stake amount
      const { error: postError } = await supabase
        .from('posts')
        .update({ 
          challenge_amount: amount 
        })
        .eq('id', postId);

      if (postError) throw postError;

      // Record the stake transaction
      const { error: stakeError } = await supabase
        .from('stakes')
        .insert({
          post_id: postId,
          user_id: userId,
          amount: amount,
          stake_type: 'support'
        });

      if (stakeError) throw stakeError;

      return true;
    } catch (error) {
      console.error('Error staking on post:', error);
      return false;
    }
  }
}

// Challenge Services
export class ChallengeService {
  static async getChallenges(userId?: string): Promise<Challenge[]> {
    try {
      let query = supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('challenger_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
  }

  static async createChallenge(challengeData: {
    post_id: string;
    challenger_id: string;
    stake_amount: number;
    reason: string;
  }): Promise<Challenge | null> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          ...challengeData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      return null;
    }
  }
}

// Wallet/Transaction Services
export class WalletService {
  static async getUserTransactions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  static async createTransaction(transactionData: {
    user_id: string;
    type: 'send' | 'receive' | 'stake' | 'reward';
    amount: number;
    description: string;
    tx_hash?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  }
}

// AI Services with real API integration
export class AIService {
  static async generateAIModeratorResponse(moderatorType: string, prompt: string) {
    try {
      const response = await fetch('/api/ai/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_TAVUS_API_KEY}`
        },
        body: JSON.stringify({
          moderator: moderatorType,
          prompt: prompt
        })
      });

      if (!response.ok) throw new Error('AI service error');
      
      return await response.json();
    } catch (error) {
      console.error('Error generating AI response:', error);
      return { error: 'AI service unavailable' };
    }
  }

  static async generateVoiceResponse(text: string, voiceId: string) {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) throw new Error('Voice generation failed');
      
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Error generating voice:', error);
      return null;
    }
  }
}

// Community Services
export class CommunityService {
  static async getCommunities() {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching communities:', error);
      return [];
    }
  }

  static async createCommunity(communityData: {
    name: string;
    topic: string;
    description: string;
    creator_id: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('communities')
        .insert(communityData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating community:', error);
      return null;
    }
  }
} 