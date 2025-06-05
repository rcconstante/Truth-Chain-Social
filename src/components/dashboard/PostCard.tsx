import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Avatar } from '../ui/avatar';
import { 
  Shield, Coins, Clock, TrendingUp, Eye, ChevronUp, ChevronDown, 
  MessageCircle, Share, Award, MoreHorizontal 
} from 'lucide-react';
import { PostInteractions } from '../post/PostInteractions';
import { PostDetailView } from '../post/PostDetailView';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    image_url?: string | null;
    user: {
      username: string;
      avatar_url?: string;
    };
    stake_amount: number;
    challenge_pool: number;
    upvotes: number;
    downvotes: number;
    comments_count: number;
    truth_score: number;
    verification_status?: string;
    expires_at?: string | null;
    ai_fact_check_score?: number | null;
    ai_sources?: string[] | null;
    created_at: string;
    user_id?: string;
    challenges?: number;
  };
  onRefresh?: () => void;
}

export function PostCard({ post, onRefresh }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);

  const getTruthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTruthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/20';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
    if (score >= 40) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  // Convert post format for PostInteractions component
  const interactionPost = {
    id: post.id,
    user_id: post.user_id || '',
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    comments_count: post.comments_count,
    challenges: post.challenges || 0,
    stake_amount: post.stake_amount,
  };

  // Convert post format for PostDetailView component
  const detailPost = {
    id: post.id,
    content: post.content,
    image_url: post.image_url,
    user: {
      username: post.user.username,
      avatar_url: post.user.avatar_url
    },
    stake_amount: post.stake_amount,
    challenge_pool: post.challenge_pool,
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    comments_count: post.comments_count,
    truth_score: post.truth_score,
    verification_status: post.verification_status || 'pending',
    expires_at: post.expires_at,
    ai_fact_check_score: post.ai_fact_check_score,
    ai_sources: post.ai_sources,
    created_at: post.created_at,
    user_id: post.user_id,
    challenges: post.challenges
  };

  const truncateContent = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening detail view when clicking interactive elements
    if ((e.target as HTMLElement).closest('button')) return;
    setShowDetailView(true);
  };

  const netVotes = post.upvotes - post.downvotes;

  return (
    <>
      <div 
        className="flex bg-white dark:bg-gray-800/50 light:bg-white hover:bg-gray-50 dark:hover:bg-gray-800/70 light:hover:bg-gray-50 border-b border-gray-200 dark:border-gray-700 light:border-gray-200 cursor-pointer transition-colors duration-150"
        onClick={handleCardClick}
      >
        {/* Left Vote Section */}
        <div className="flex flex-col items-center px-2 py-3 bg-gray-50 dark:bg-gray-900/50 light:bg-gray-50 border-r border-gray-200 dark:border-gray-700 light:border-gray-200">
          <button 
            className="p-1 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailView(true);
            }}
            title="Click to upvote this post"
          >
            <ChevronUp size={20} />
          </button>
          
          <span className={`text-sm font-medium px-1 ${
            netVotes > 0 ? 'text-orange-500' : 
            netVotes < 0 ? 'text-blue-500' : 
            'text-gray-500 dark:text-gray-400'
          }`}>
            {netVotes > 0 ? `+${netVotes}` : netVotes}
          </span>
          
          <button 
            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailView(true);
            }}
            title="Click to downvote this post"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-3 py-3">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <Avatar className="w-5 h-5">
              <img 
                src={post.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.username}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`} 
                alt={post.user.username} 
                className="rounded-full" 
              />
            </Avatar>
            <span className="font-medium text-gray-900 dark:text-gray-100 light:text-gray-900">u/{post.user.username}</span>
            <span>•</span>
            <span>{formatTimeAgo(post.created_at)}</span>
            
            {/* Truth Score Badge */}
            <div className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium border ${getTruthScoreBg(post.truth_score)}`}>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span className={getTruthScoreColor(post.truth_score)}>
                  {post.truth_score}%
                </span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-3">
            <p className="text-gray-900 dark:text-gray-100 light:text-gray-900 text-sm leading-normal break-words">
              {truncateContent(post.content)}
            </p>
            
            {/* Image Preview - Landscape Layout */}
            {post.image_url && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 max-w-2xl">
                <img
                  src={post.image_url}
                  alt="Post attachment"
                  className="w-full h-auto max-h-80 object-cover aspect-video bg-gray-100 dark:bg-gray-800"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <button 
              className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailView(true);
              }}
            >
              <MessageCircle size={14} />
              <span>{post.comments_count}</span>
            </button>
            
            <button 
              className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailView(true);
              }}
              title="View staking details"
            >
              <Coins size={14} />
              <span>{post.stake_amount.toFixed(1)} ALGO</span>
            </button>
            
            <button 
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailView(true);
              }}
              title="View challenge pool"
            >
              <TrendingUp size={14} />
              <span>{post.challenge_pool.toFixed(1)} Pool</span>
            </button>
            
            {post.challenges && post.challenges > 0 && (
              <button 
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailView(true);
                }}
                title="View challenges"
              >
                <Award size={14} />
                <span>{post.challenges} challenge{post.challenges !== 1 ? 's' : ''}</span>
              </button>
            )}

            {/* Verification Status Indicator */}
            {post.verification_status && post.verification_status !== 'pending' && (
              <div className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                post.verification_status === 'verified' ? 'bg-green-500/10 text-green-500' :
                post.verification_status === 'challenged' ? 'bg-red-500/10 text-red-500' :
                'bg-gray-500/10 text-gray-500'
              }`}>
                {post.verification_status}
              </div>
            )}
            
            <button className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      <AnimatePresence>
        {showDetailView && (
          <PostDetailView
            post={detailPost}
            onClose={() => setShowDetailView(false)}
            onRefresh={onRefresh}
          />
        )}
      </AnimatePresence>
    </>
  );
}