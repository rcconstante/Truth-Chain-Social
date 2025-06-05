import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, TrendingUp, Heart, BookOpen, Brain, Plus, Loader2, 
  Clock, Users, MessageCircle, User, Target, ArrowRight, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { PostCard } from '../../components/dashboard/PostCard';
import { PostService } from '../../lib/supabase-service';
import { useAuth } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';

interface TruthPost {
  id: string;
  content: string;
  author: string;
  stakeAmount: number;
  status: 'pending' | 'verified' | 'challenged' | 'expired' | 'finished';
  truthScore: number;
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

type FeedAlgorithm = 'chronological' | 'trending' | 'personalized' | 'controversial' | 'educational';

const FEED_ALGORITHMS = {
  chronological: {
    label: 'Latest',
    description: 'Most recent posts',
    icon: Clock,
    color: 'text-blue-400'
  },
  trending: {
    label: 'Trending',
    description: 'Popular posts gaining attention',
    icon: TrendingUp,
    color: 'text-green-400'
  },
  personalized: {
    label: 'For You',
    description: 'Based on your interests',
    icon: Heart,
    color: 'text-pink-400'
  },
  controversial: {
    label: 'Debated',
    description: 'Most challenged posts',
    icon: MessageCircle,
    color: 'text-orange-400'
  },
  educational: {
    label: 'Educational',
    description: 'Verified high-quality content',
    icon: BookOpen,
    color: 'text-purple-400'
  }
};

export function HomeFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<TruthPost[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<FeedAlgorithm>('chronological');
  const [loading, setLoading] = useState(true);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<TruthPost[]>([]);

  // Load user interests only once on mount
  useEffect(() => {
    loadUserInterests();
  }, [user?.id]);

  // Load posts when algorithm changes or user changes
  useEffect(() => {
    if (user?.id) {
      loadPosts();
    }
  }, [selectedAlgorithm, user?.id]);

  // Set up real-time refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing feed for real-time updates...');
      loadPosts();
      setLastRefresh(new Date());
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [selectedAlgorithm, user?.id]);

  // Add manual refresh function that posts can call
  const refreshFeed = async () => {
    console.log('🔄 Manual feed refresh requested');
    await loadPosts();
    setLastRefresh(new Date());
  };

  const loadUserInterests = async () => {
    if (!user?.id) return;
    
    try {
      // For now, use static interests - in a real app, fetch from user profile
      setUserInterests(['Technology', 'Science', 'Politics']);
    } catch (error) {
      console.error('Error loading user interests:', error);
      setUserInterests([]);
    }
  };

  const loadPosts = async () => {
    if (!user?.id) return;
    
    try {
      console.log(`📊 Loading posts with ${selectedAlgorithm} algorithm...`);
      const databasePosts = await PostService.getAllPosts();
      
      console.log(`🔍 Raw posts from PostService:`, databasePosts.map(p => ({
        id: p.id,
        upvotes: p.upvotes,
        downvotes: p.downvotes
      })));
      
      // Use the posts directly from PostService (they're already in the correct format)
      const truthPosts: TruthPost[] = databasePosts;
      
      // Apply algorithm-specific filtering and sorting
      let filteredPosts = truthPosts;
      switch (selectedAlgorithm) {
        case 'trending':
          filteredPosts = truthPosts
            .sort((a, b) => (b.verifications + b.stakeAmount * 10) - (a.verifications + a.stakeAmount * 10))
            .slice(0, 20);
          break;
        case 'controversial':
          filteredPosts = truthPosts
            .filter(p => p.challenges > 0)
            .sort((a, b) => b.challenges - a.challenges);
          break;
        case 'educational':
          filteredPosts = truthPosts
            .filter(p => p.truthScore >= 70 && p.verifications > 0)
            .sort((a, b) => b.truthScore - a.truthScore);
          break;
        case 'personalized':
          // Simple personalization based on interests
          if (userInterests.length > 0) {
            filteredPosts = truthPosts.filter(p => 
              userInterests.some(interest => 
                p.content.toLowerCase().includes(interest.toLowerCase()) ||
                p.category.toLowerCase().includes(interest.toLowerCase())
              )
            );
          } else {
            filteredPosts = truthPosts;
          }
          filteredPosts = filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default: // chronological
          filteredPosts = truthPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      console.log(`✅ Loaded ${filteredPosts.length} posts for ${selectedAlgorithm} algorithm with vote counts:`, 
        filteredPosts.map(p => ({ id: p.id, upvotes: p.upvotes, downvotes: p.downvotes })));
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const getAlgorithmStats = () => {
    switch (selectedAlgorithm) {
      case 'trending':
        return `${posts.length} trending posts`;
      case 'controversial':
        return `${posts.filter(p => p.challenges > 0).length} contested claims`;
      case 'educational':
        return `${posts.filter(p => p.truthScore >= 70).length} verified truths`;
      case 'personalized':
        return `${posts.length} posts matching your interests`;
      default:
        return `${posts.length} recent posts`;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const formatLastRefresh = () => {
    const now = new Date();
    const diffMinutes = Math.round((now.getTime() - lastRefresh.getTime()) / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    return `${diffMinutes} minutes ago`;
  };

  // Add search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [posts, searchQuery]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Reddit-style Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 dark:bg-gray-900/95 light:bg-white/95 backdrop-blur-xl border-b border-gray-700 dark:border-gray-700 light:border-gray-200 px-4 py-3 -mx-8 mb-6">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <h1 className="text-xl font-bold text-white dark:text-white light:text-gray-900">
              r/TruthChain
            </h1>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search posts, users, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 dark:bg-gray-800/50 light:bg-gray-100 border-gray-600 dark:border-gray-600 light:border-gray-300 text-white dark:text-white light:text-gray-900 placeholder-gray-400 dark:placeholder-gray-400 light:placeholder-gray-500"
              />
            </div>
            
            <Button 
              onClick={() => navigate('/dashboard/my-posts')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-full text-sm"
            >
              Create Post
            </Button>
          </div>
        </div>

        {/* Sort/Filter Tabs */}
        <div className="flex items-center gap-2 px-4 pb-4 border-b border-gray-700 dark:border-gray-700 light:border-gray-200">
          {Object.entries(FEED_ALGORITHMS).map(([key, algorithm]) => {
            const Icon = algorithm.icon;
            const isActive = selectedAlgorithm === key;
            
            return (
              <button
                key={key}
                onClick={() => setSelectedAlgorithm(key as FeedAlgorithm)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800/50 light:text-gray-600 light:hover:text-gray-900 light:hover:bg-gray-100'
                }`}
              >
                <Icon size={14} />
                <span>{algorithm.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Feed */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-400 mr-2" />
              <span className="text-gray-400 dark:text-gray-400 light:text-gray-600">Loading posts...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 dark:bg-gray-800/50 light:bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 dark:text-gray-300 light:text-gray-700 mb-2">
                {searchQuery ? 'No posts found' : 'No posts yet'}
              </h3>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-4">
                {searchQuery 
                  ? `No posts match "${searchQuery}". Try a different search term.`
                  : 'Be the first to share truth with the community'
                }
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => navigate('/dashboard/my-posts')}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Create First Post
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Search Results Info */}
              {searchQuery && (
                <div className="px-4 py-2 bg-gray-800/30 dark:bg-gray-800/30 light:bg-gray-50 rounded-lg mb-4">
                  <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                    Found {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </p>
                </div>
              )}
              
              {/* Posts */}
              <div className="space-y-0 border border-gray-700 dark:border-gray-700 light:border-gray-200 rounded-lg overflow-hidden bg-white dark:bg-gray-800/50 light:bg-white">
                {filteredPosts.map((post, index) => {
                  // Convert TruthPost to PostCard format
                  const postCardData = {
                    id: post.id,
                    content: post.content,
                    user: {
                      username: post.author,
                      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`
                    },
                    stake_amount: post.stakeAmount,
                    challenge_pool: post.totalStaked,
                    upvotes: post.upvotes || 0,
                    downvotes: post.downvotes || 0,
                    comments_count: post.comments_count || 0,
                    truth_score: post.truthScore,
                    created_at: post.createdAt,
                    user_id: post.user_id || '',
                    challenges: post.challenges
                  };

                  return (
                    <PostCard 
                      key={post.id}
                      post={postCardData} 
                      onRefresh={refreshFeed}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Load More */}
        {filteredPosts.length > 0 && !loading && (
          <div className="text-center py-6">
            <Button
              onClick={refreshFeed}
              variant="outline"
              className="border-gray-600 dark:border-gray-600 light:border-gray-300 text-gray-300 dark:text-gray-300 light:text-gray-600 hover:bg-gray-800/50 dark:hover:bg-gray-800/50 light:hover:bg-gray-100"
            >
              Load More Posts
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}