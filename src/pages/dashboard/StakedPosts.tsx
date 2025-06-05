import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../lib/auth';
import { Loader2, Star, TrendingUp, Shield, CheckCircle, Flag, Coins } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PostCard } from '../../components/dashboard/PostCard';

interface StakedPost {
  id: string;
  post: any; // Use any for now since Supabase returns complex nested structure
  stake_amount: number;
  verification_type: 'support' | 'challenge';
  created_at: string;
  status: string;
}

export function StakedPosts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stakedPosts, setStakedPosts] = useState<StakedPost[]>([]);
  const [filter, setFilter] = useState<'all' | 'support' | 'challenge'>('all');

  useEffect(() => {
    if (user?.id) {
      loadStakedPosts();
    }
  }, [user?.id]);

  const loadStakedPosts = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('🔍 Loading staked posts for user:', user.id);
      
      // Fetch posts where user has verification/challenge stakes
      const { data, error } = await supabase
        .from('post_verifications')
        .select(`
          id,
          stake_amount,
          verification_type,
          created_at,
          status,
          post:post_id (
            id,
            content,
            user_id,
            stake_amount,
            upvotes,
            downvotes,
            comments_count,
            verifications,
            challenges,
            created_at,
            profiles:user_id (
              username,
              avatar_url
            )
          )
        `)
        .eq('verifier_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading staked posts:', error);
        throw error;
      }

      console.log('✅ Loaded staked posts:', data?.length || 0);
      
      // Process the data to handle nested structure and convert for PostCard
      const processedData = await Promise.all(data?.map(async (item) => {
        const post = Array.isArray(item.post) ? item.post[0] : item.post;
        const profile = Array.isArray(post?.profiles) ? post.profiles[0] : post?.profiles;
        
        // Calculate actual challenge pool for this post
        const { data: challengeData } = await supabase
          .from('post_verifications')
          .select('stake_amount')
          .eq('post_id', post.id)
          .eq('verification_type', 'challenge')
          .eq('status', 'active');
        
        const challenge_pool = challengeData?.reduce((sum, challenge) => sum + challenge.stake_amount, 0) || 0;
        
        return {
          ...item,
          post: {
            ...post,
            user: {
              username: profile?.username || 'Unknown User',
              avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`
            },
            truth_score: 75, // Better default truth score
            challenge_pool: challenge_pool, // Real challenge pool calculation
            challenges: post?.challenges || 0,
            verifications: post?.verifications || 0
          }
        };
      }) || []);
      
      setStakedPosts(processedData);
    } catch (error) {
      console.error('Error loading staked posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = stakedPosts.filter(stake => {
    if (filter === 'all') return true;
    return stake.verification_type === filter;
  });

  const getSupportTotal = () => stakedPosts
    .filter(s => s.verification_type === 'support')
    .reduce((sum, s) => sum + s.stake_amount, 0);

  const getChallengeTotal = () => stakedPosts
    .filter(s => s.verification_type === 'challenge')
    .reduce((sum, s) => sum + s.stake_amount, 0);

  const getTotalStaked = () => getSupportTotal() + getChallengeTotal();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Staked Posts</h1>
          <p className="text-gray-400">
            Posts you've staked ALGO on to support or challenge
          </p>
        </motion.div>

        {/* Staking Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Total Staked</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {getTotalStaked().toFixed(2)} ALGO
            </div>
          </div>
          
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-300">Verifications</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {getSupportTotal().toFixed(2)} ALGO
            </div>
          </div>
          
          <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-orange-300">Challenges</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {getChallengeTotal().toFixed(2)} ALGO
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="border-gray-600"
          >
            All ({stakedPosts.length})
          </Button>
          <Button
            variant={filter === 'support' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('support')}
            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Verified ({stakedPosts.filter(s => s.verification_type === 'support').length})
          </Button>
          <Button
            variant={filter === 'challenge' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('challenge')}
            className="border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
          >
            <Flag className="w-4 h-4 mr-1" />
            Challenged ({stakedPosts.filter(s => s.verification_type === 'challenge').length})
          </Button>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mr-3" />
              <div className="text-gray-400">Loading staked posts...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-white mb-4">
                {filter === 'all' ? 'No Staked Posts Yet' : `No ${filter === 'support' ? 'Verified' : 'Challenged'} Posts`}
              </h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {filter === 'all' 
                  ? "You haven't staked on any posts yet. Start exploring the community feed to find posts worth supporting or challenging."
                  : `You haven't ${filter === 'support' ? 'verified' : 'challenged'} any posts yet.`
                }
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/dashboard/feed')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Explore Community Posts
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((stake) => (
                <div key={stake.id} className="relative">
                  {/* Stake Info Badge - Moved to top-right to avoid blocking username */}
                  <div className="absolute top-4 right-4 z-30">
                    <Badge 
                      variant="outline" 
                      className={`${
                        stake.verification_type === 'support' 
                          ? 'border-green-500/50 bg-green-500/20 text-green-300 backdrop-blur-sm shadow-lg' 
                          : 'border-orange-500/50 bg-orange-500/20 text-orange-300 backdrop-blur-sm shadow-lg'
                      }`}
                    >
                      {stake.verification_type === 'support' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Flag className="w-3 h-3 mr-1" />
                      )}
                      <span className="text-xs font-medium">
                        {stake.stake_amount.toFixed(2)} ALGO {stake.verification_type === 'support' ? 'Verified' : 'Challenged'}
                      </span>
                    </Badge>
                  </div>
                  
                  {/* Post Card */}
                  <PostCard 
                    post={stake.post} 
                    onRefresh={loadStakedPosts}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 