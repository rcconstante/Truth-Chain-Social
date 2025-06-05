import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { CreatePostCard } from '../../components/dashboard/CreatePostCard';
import { PostCard } from '../../components/dashboard/PostCard';
import { PostService, UserService } from '../../lib/supabase-service';
import { useAuth } from '../../lib/auth';
import { 
  TrendingUp, DollarSign, CheckCircle, Eye, MessageCircle,
  Plus, Users, Target, Award, Sparkles, X, Loader2
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { OnboardingFlow } from '../../components/onboarding/OnboardingFlow';
import { supabase } from '../../lib/supabase';

interface UserMetrics {
  truthScore: number;
  earnings: number;
  verifiedPosts: number;
  totalStaked: number;
  communityRank: number;
  successRate: number;
  totalPosts: number;
}

interface DatabasePost {
  id: string;
  content: string;
  user_id: string;
  stake_amount: number;
  upvotes: number;
  downvotes: number;
  comments_count: number;
  verifications: number;
  challenges: number;
  truth_score: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url?: string;
  } | null;
}

export function AlgorandDashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DatabasePost[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
      loadDashboardData();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();
      
      if (!profile?.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    loadDashboardData(); // Refresh data after onboarding
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading dashboard data...');
      
      // Load all posts from database with user profiles
      const { data: fetchedPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          user_id,
          stake_amount,
          upvotes,
          downvotes,
          comments_count,
          verifications,
          challenges,
          truth_score,
          created_at,
          profiles!user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) {
        console.error('❌ Error fetching posts:', postsError);
        throw postsError;
      }

      console.log('📦 Fetched posts:', fetchedPosts?.length || 0);
      
      // Transform the data to match our interface
      const transformedPosts: DatabasePost[] = (fetchedPosts || []).map(post => ({
        ...post,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      }));
      
      setPosts(transformedPosts);
      
      // Load user metrics from database
      if (user?.id) {
        console.log('👤 Loading user metrics for:', user.id);
        
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('reputation_score, algo_balance')
          .eq('id', user.id)
          .single();
        
        // Get user's posts to calculate metrics
        const { data: userPosts } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id);
        
        // Calculate real metrics
        const verifiedPosts = userPosts?.filter(p => p.verification_status === 'verified').length || 0;
        const totalStaked = userPosts?.reduce((sum, p) => sum + p.stake_amount, 0) || 0;
        const successRate = userPosts?.length ? (verifiedPosts / userPosts.length) * 100 : 0;
        
        const calculatedMetrics: UserMetrics = {
          truthScore: profile?.reputation_score ? profile.reputation_score / 10 : 5.0, // Convert to 0-10 scale
          earnings: profile?.algo_balance || 0,
          verifiedPosts: verifiedPosts,
          totalPosts: userPosts?.length || 0,
          totalStaked: totalStaked,
          communityRank: Math.max(1, Math.floor(Math.random() * 100)), // TODO: Calculate from database
          successRate: successRate
        };
        
        console.log('📊 Calculated metrics:', calculatedMetrics);
        setUserMetrics(calculatedMetrics);
      }
      
    } catch (err: any) {
      console.error('❌ Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    console.log('🎉 Post created, refreshing dashboard...');
    setShowCreateModal(false);
    loadDashboardData(); // Refresh all data including user metrics
  };

  const handlePostRefresh = () => {
    console.log('🔄 Refreshing posts after interaction...');
    loadDashboardData();
  };

  const convertToPostCardFormat = (post: DatabasePost) => ({
    id: post.id,
    content: post.content,
    user: {
      username: post.profiles?.username || 'Anonymous',
      avatar_url: post.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.profiles?.username || 'anonymous'}`
    },
    stake_amount: post.stake_amount,
    challenge_pool: post.stake_amount, // For now, use stake_amount as challenge pool
    upvotes: post.upvotes || 0,
    downvotes: post.downvotes || 0,
    comments_count: post.comments_count || 0,
    truth_score: post.truth_score || 50,
    created_at: post.created_at,
    user_id: post.user_id, // This is crucial for interactions!
    challenges: post.challenges || 0
  });

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (loading && !userMetrics) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Loader2 className="w-12 h-12 text-purple-400" />
          </motion.div>
          <p className="text-gray-400 text-lg">Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

    return (
      <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
            Welcome back, {user?.profile?.username || 'Truth Seeker'}!
          </h1>
          <p className="text-gray-400 text-lg">
            Track your impact and discover truth from the community
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">Truth Score</p>
                    <p className="text-3xl font-bold text-white">
                      {userMetrics ? userMetrics.truthScore.toFixed(1) : '0.0'}/10
                    </p>
                    <p className="text-green-400 text-sm">
                      {userMetrics?.verifiedPosts || 0} verified posts
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-400 text-sm font-medium">ALGO Balance</p>
                    <p className="text-3xl font-bold text-white">
                      {userMetrics ? userMetrics.earnings.toFixed(2) : '0.00'} Ⱥ
                    </p>
                    <p className="text-blue-400 text-sm">Wallet balance</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">Verified Posts</p>
                    <p className="text-3xl font-bold text-white">
                      {userMetrics ? userMetrics.verifiedPosts : 0}
                    </p>
                    <p className="text-purple-400 text-sm">
                      of {userMetrics ? userMetrics.totalPosts : 0} total
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">Total Staked</p>
                    <p className="text-3xl font-bold text-white">
                      {userMetrics ? userMetrics.totalStaked.toFixed(1) : '0.0'} Ⱥ
                    </p>
                    <p className="text-yellow-400 text-sm">On your posts</p>
                  </div>
                  <Target className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">
                  #{userMetrics ? userMetrics.communityRank : '—'}
                </p>
                <p className="text-gray-400">Community Rank</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">
                  {userMetrics ? userMetrics.successRate.toFixed(1) : '0.0'}%
                </p>
                <p className="text-gray-400">Success Rate</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">{posts.length}</p>
                <p className="text-gray-400">Community Posts</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Community Feed Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Community Truth Feed
            </h2>
            <p className="text-gray-400">Latest posts from the community</p>
          </div>
          
          {/* Posts Feed */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mr-3" />
              <div className="text-gray-400">Loading community posts...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-red-400 mb-4">Error: {error}</div>
              <Button onClick={loadDashboardData} variant="outline">
                Try Again
              </Button>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard 
                    post={convertToPostCardFormat(post)} 
                    onRefresh={handlePostRefresh}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-6">
                Be the first to share a truth statement with the community!
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </div>
          )}
        </motion.div>
          </div>
          
      {/* Floating Create Post Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl shadow-purple-500/30"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </motion.div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-2xl max-h-[90vh] relative"
          >
            <div className="relative overflow-hidden rounded-2xl">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="ghost"
                className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gray-800/90 hover:bg-gray-700/90 backdrop-blur-sm z-10 border border-gray-600/50"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <CreatePostCard onPostCreated={handlePostCreated} />
              </div>
          </div>
          </motion.div>
        </div>
      )}
      </DashboardLayout>
    );
}