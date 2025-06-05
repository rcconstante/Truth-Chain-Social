import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Calendar, TrendingUp, Eye, MessageCircle, 
  Share2, Edit, Trash2, Plus, Filter, Search, MoreVertical, Loader2, X, Coins
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PostService, TruthPost } from '../../lib/supabase-service';
import { useAuth } from '../../lib/auth';
import { PostCard } from '../../components/dashboard/PostCard';
import { useNavigate } from 'react-router-dom';
import { CreatePostCard } from '../../components/dashboard/CreatePostCard';
import { supabase } from '../../lib/supabase';
import { MOCK_FINISHED_THREADS } from '../../lib/mockData';

export function MyPosts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<TruthPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'staked' | 'pending' | 'resolved' | 'finished'>('all');
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalStaked: 0,
    avgTruthScore: 0,
    activeChallenges: 0
  });

  useEffect(() => {
    if (user?.id) {
      loadUserPosts();
      loadStats();
    }
  }, [user]);

  // Add real-time synchronization
  useEffect(() => {
    if (!user?.id) return;

    // Listen for transaction completion events to refresh data
    const handleTransactionComplete = () => {
      console.log('🔄 Transaction completed, refreshing MyPosts data...');
      loadUserPosts();
      loadStats();
    };

    // Listen for custom events from post interactions
    window.addEventListener('transactionCompleted', handleTransactionComplete);

    // Auto-refresh every 30 seconds when component is active
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadUserPosts();
        loadStats();
      }
    }, 30000);

    return () => {
      window.removeEventListener('transactionCompleted', handleTransactionComplete);
      clearInterval(refreshInterval);
    };
  }, [user?.id]);

  const loadUserPosts = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch posts with real-time vote and comment counts
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          stake_amount,
          verification_status,
          created_at,
          profiles:user_id (username, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Convert to TruthPost format with actual data
      const realPosts: TruthPost[] = (posts || []).map(post => ({
        id: post.id,
        content: post.content,
        image_url: null, // Default for missing field
        author: (post.profiles as any)?.username || 'Anonymous',
        stakeAmount: Number(post.stake_amount) || 0,
        status: post.verification_status || 'pending',
        expires_at: null, // Default for missing field
        truthScore: 50, // Default value
        ai_fact_check_score: null, // Default for missing field
        ai_sources: null, // Default for missing field
        verifications: 0, // Default value
        challenges: 0, // Default value
        totalStaked: Number(post.stake_amount) || 0,
        createdAt: post.created_at,
        category: 'General', // Default value
        tags: [], // Default value
        user_id: user.id,
        upvotes: 0, // Default value
        downvotes: 0, // Default value
        comments_count: 0 // Default value
      }));

      // Add mock finished threads for demonstration
      const mockFinishedPosts: TruthPost[] = MOCK_FINISHED_THREADS.map(thread => ({
        id: thread.id,
        content: thread.content,
        image_url: thread.image_url,
        author: thread.author,
        stakeAmount: thread.stakeAmount,
        status: thread.status,
        expires_at: thread.expires_at,
        truthScore: thread.truthScore,
        ai_fact_check_score: thread.ai_fact_check_score,
        ai_sources: thread.ai_sources,
        verifications: thread.verifications,
        challenges: thread.challenges,
        totalStaked: thread.totalStaked,
        createdAt: thread.createdAt,
        category: thread.category,
        tags: thread.tags,
        user_id: user.id, // Assign to current user for demo
        upvotes: thread.upvotes,
        downvotes: thread.downvotes,
        comments_count: thread.comments_count
      }));

      // Combine real posts with mock finished threads
      const allPosts = [...realPosts, ...mockFinishedPosts].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPosts(allPosts);
    } catch (err: any) {
      console.error('Error loading user posts:', err);
      setError('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const { data: userPosts } = await supabase
        .from('posts')
        .select('stake_amount, truth_score, challenges')
        .eq('user_id', user.id);

      if (userPosts) {
        const totalStaked = userPosts.reduce((sum, post) => sum + (post.stake_amount || 0), 0);
        const avgTruthScore = userPosts.length > 0 
          ? userPosts.reduce((sum, post) => sum + (post.truth_score || 0), 0) / userPosts.length 
          : 0;
        const activeChallenges = userPosts.reduce((sum, post) => sum + (post.challenges || 0), 0);

        setStats({
          totalPosts: userPosts.length,
          totalStaked,
          avgTruthScore,
          activeChallenges
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handlePostCreated = () => {
    setShowCreateModal(false);
    loadUserPosts();
    loadStats();
  };

  const handlePostRefresh = () => {
    loadUserPosts();
    loadStats();
  };

  const convertToPostCardFormat = (post: TruthPost) => ({
    id: post.id,
    content: post.content,
    image_url: post.image_url,
    user: {
      username: post.author,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`
    },
    stake_amount: post.stakeAmount,
    challenge_pool: post.totalStaked,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    comments_count: post.comments_count,
    truth_score: post.truthScore,
    verification_status: post.status,
    expires_at: post.expires_at,
    ai_fact_check_score: post.ai_fact_check_score,
    ai_sources: post.ai_sources,
    created_at: post.createdAt,
    user_id: user?.id || '',
    challenges: post.challenges,
    verifications: post.verifications
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'challenged': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'finished': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'expired': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filterPosts = (posts: TruthPost[]) => {
    switch (selectedFilter) {
      case 'staked':
        return posts.filter(post => post.stakeAmount > 0);
      case 'pending':
        return posts.filter(post => post.status === 'pending');
      case 'resolved':
        return posts.filter(post => ['verified', 'challenged'].includes(post.status));
      case 'finished':
        return posts.filter(post => post.status === 'finished');
      default:
        return posts;
    }
  };

  const filteredPosts = filterPosts(posts);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white">Loading your posts...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-400" />
              My Posts
            </h1>
            <p className="text-gray-400 mt-1">Manage and track your truth posts</p>
          </div>
          
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Post
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalPosts}</div>
              <div className="text-sm text-gray-400">Total Posts</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalStaked.toFixed(1)} Ⱥ</div>
              <div className="text-sm text-gray-400">Total Staked</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.avgTruthScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Avg Truth Score</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.activeChallenges}</div>
              <div className="text-sm text-gray-400">Active Challenges</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="flex gap-2">
                {[
                  { key: 'all', label: 'All Posts' },
                  { key: 'staked', label: 'Staked' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'resolved', label: 'Resolved' },
                  { key: 'finished', label: 'Finished' }
                ].map(filter => (
                  <Button
                    key={filter.key}
                    variant={selectedFilter === filter.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.key as any)}
                    className={selectedFilter === filter.key ? 'bg-purple-600' : ''}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-400">Loading your posts...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-red-400 mb-4">Error: {error}</div>
              <Button onClick={loadUserPosts} variant="outline">
                Try Again
              </Button>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
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
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-8 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
                <p className="text-gray-400 mb-6">
                  Start sharing your truth claims with the community!
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
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
      </AnimatePresence>
    </DashboardLayout>
  );
} 