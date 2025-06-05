import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft, Eye, MessageCircle, Share2, Calendar, 
  Clock, Coins, TrendingUp, Shield, AlertTriangle,
  CheckCircle2, XCircle, Bot, ExternalLink, Timer,
  ChevronUp, ChevronDown, Award, MoreHorizontal, X
} from 'lucide-react';
import { PostInteractions } from './PostInteractions';
import { useAuth } from '../../lib/auth';

interface PostDetailViewProps {
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
    verification_status: string;
    expires_at?: string | null;
    ai_fact_check_score?: number | null;
    ai_sources?: string[] | null;
    created_at: string;
    user_id?: string;
    challenges?: number;
  };
  onClose: () => void;
  onRefresh?: () => void;
}

export function PostDetailView({ post, onClose, onRefresh }: PostDetailViewProps) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (post.expires_at) {
      const updateTimeLeft = () => {
        const now = new Date();
        const expiresAt = new Date(post.expires_at!);
        const timeDiff = expiresAt.getTime() - now.getTime();

        if (timeDiff <= 0) {
          setTimeLeft('Expired');
        } else {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h remaining`);
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m remaining`);
          } else {
            setTimeLeft(`${minutes}m remaining`);
          }
        }
      };

      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 60000);
      return () => clearInterval(interval);
    }
  }, [post.expires_at]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

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

  const netVotes = post.upvotes - post.downvotes;

  // Convert post format for PostInteractions component
  const interactionPost = {
    id: post.id,
    user_id: post.user_id || '',
    upvotes: post.upvotes,
    downvotes: post.downvotes,
    comments_count: post.comments_count,
    challenges: post.challenges || 0,
    stake_amount: post.stake_amount,
    verifications: 0,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen p-4 flex items-start justify-center">
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-3xl bg-white dark:bg-gray-800/95 light:bg-white backdrop-blur-xl rounded-lg border border-gray-200 dark:border-gray-700 light:border-gray-200 shadow-xl mt-4 mb-8"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 light:border-gray-200">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Truth Score Badge */}
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium border flex-shrink-0 ${getTruthScoreBg(post.truth_score)}`}>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  <span className={getTruthScoreColor(post.truth_score)}>
                    {post.truth_score}% verified
                  </span>
                </div>
              </div>
              
              {post.expires_at && (
                <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs text-orange-500 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Timer className="w-3 h-3" />
                    <span className="whitespace-nowrap">{timeLeft}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <img src={post.user.avatar_url} alt={post.user.username} className="rounded-full" />
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100 light:text-gray-900">
                  u/{post.user.username}
                </span>
                <span className="text-gray-500 dark:text-gray-400">•</span>
                <span className="text-gray-500 dark:text-gray-400">{formatTimeAgo(post.created_at)}</span>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-6">
              <p className="text-gray-900 dark:text-gray-100 light:text-gray-900 text-lg leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
              
              {/* Image */}
              {post.image_url && (
                <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                  <img
                    src={post.image_url}
                    alt="Post attachment"
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 light:bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Coins className="w-5 h-5" />
                <span className="font-medium">{post.stake_amount.toFixed(1)} ALGO staked</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">{post.challenge_pool.toFixed(1)} ALGO pool</span>
              </div>
              {post.challenges && post.challenges > 0 && (
                <div className="flex items-center gap-2 text-orange-500">
                  <Award className="w-5 h-5" />
                  <span className="font-medium">{post.challenges} challenge{post.challenges !== 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <span className={`text-lg font-bold ${
                  netVotes > 0 ? 'text-orange-500' : 
                  netVotes < 0 ? 'text-blue-500' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {netVotes > 0 ? `+${netVotes}` : netVotes} votes
                </span>
              </div>
            </div>

            {/* AI Fact-Check Results */}
            {post.ai_fact_check_score !== null && post.ai_sources && (
              <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 bg-blue-50/50 dark:bg-blue-900/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Bot className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">AI Fact-Check</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verified against {post.ai_sources.length} sources</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`text-2xl font-bold ${getTruthScoreColor(post.ai_fact_check_score || 0)}`}>
                      {post.ai_fact_check_score}%
                    </div>
                  </div>
                </div>

                {/* Verdict */}
                <div className={`p-3 rounded-lg text-sm ${
                  (post.ai_fact_check_score || 0) >= 80 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : (post.ai_fact_check_score || 0) >= 60
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {(post.ai_fact_check_score || 0) >= 80 ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (post.ai_fact_check_score || 0) >= 60 ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {(post.ai_fact_check_score || 0) >= 80 
                        ? 'Likely Factual'
                        : (post.ai_fact_check_score || 0) >= 60
                        ? 'Partially Verified'
                        : 'Likely False'
                      }
                    </span>
                  </div>
                  <p className="text-xs opacity-90">
                    {(post.ai_fact_check_score || 0) >= 80 
                      ? 'Multiple sources confirm the accuracy of this claim.'
                      : (post.ai_fact_check_score || 0) >= 60
                      ? 'Some sources support this claim, but verification is incomplete.'
                      : 'Multiple sources contradict or question this claim.'
                    }
                  </p>
                </div>

                {/* Sources */}
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sources:</h5>
                  <div className="space-y-1">
                    {post.ai_sources.slice(0, 3).map((source, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate">{source}</span>
                      </div>
                    ))}
                    {post.ai_sources.length > 3 && (
                      <button className="text-xs text-blue-500 hover:text-blue-600">
                        View {post.ai_sources.length - 3} more sources
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Elements - All functionality handled here */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <PostInteractions post={interactionPost} onRefresh={onRefresh} />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 