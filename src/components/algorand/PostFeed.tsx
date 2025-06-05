import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink, 
  Clock, 
  Coins,
  User,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useToast } from '../ui/use-toast';
import { formatAddress, formatBalance, ALGORAND_CONFIG } from '../../lib/algorand';

interface TruthPost {
  id: string;
  content: string;
  author: string;
  stakeAmount: number;
  totalStaked: number;
  verifications: number;
  challenges: number;
  status: 'pending' | 'verified' | 'challenged' | 'resolved';
  createdAt: string;
  timeRemaining?: string;
  txId: string;
  explorerUrl?: string;
  truthScore?: number;
}

interface PostFeedProps {
  posts: TruthPost[];
  walletAddress: string | null;
  onVerify?: (postId: string, verdict: boolean, stakeAmount: number) => void;
  isLoading?: boolean;
}

export function PostFeed({ posts, walletAddress, onVerify, isLoading }: PostFeedProps) {
  const [verifyingPost, setVerifyingPost] = useState<string | null>(null);
  const [verifyStakes, setVerifyStakes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const handleVerification = async (postId: string, verdict: boolean) => {
    const stakeAmount = parseFloat(verifyStakes[postId] || '1');
    
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to verify posts.",
        variant: "destructive"
      });
      return;
    }

    if (stakeAmount < 1) {
      toast({
        title: "Invalid Stake",
        description: "Minimum verification stake is 1 ALGO.",
        variant: "destructive"
      });
      return;
    }

    setVerifyingPost(postId);
    
    try {
      await onVerify?.(postId, verdict, stakeAmount);
      
      // Reset stake input
      setVerifyStakes(prev => ({ ...prev, [postId]: '' }));
      
      toast({
        title: "Verification Submitted",
        description: `Staked ${stakeAmount} ALGO on ${verdict ? 'TRUE' : 'FALSE'}`,
      });
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setVerifyingPost(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'challenged': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'resolved': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = (created.getTime() + 24 * 60 * 60 * 1000) - now.getTime(); // 24 hours
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-400">Loading truth posts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Truth Posts Yet</h3>
          <p className="text-gray-400">
            Be the first to create a truth post and stake ALGO on your claim!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {formatAddress(post.author)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(post.status)}`}>
                    {post.status.toUpperCase()}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Post Content */}
                <div className="text-white text-lg leading-relaxed">
                  {post.content}
                </div>

                {/* Post Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {formatBalance(post.stakeAmount)}
                    </div>
                    <div className="text-xs text-gray-400">Original Stake</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      {formatBalance(post.totalStaked)}
                    </div>
                    <div className="text-xs text-gray-400">Total Staked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {post.verifications}
                    </div>
                    <div className="text-xs text-gray-400">Verifications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">
                      {getTimeRemaining(post.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400">Time Left</div>
                  </div>
                </div>

                {/* Verification Section */}
                {walletAddress && post.status === 'pending' && post.author !== walletAddress && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 p-4 bg-gray-800/20 rounded-lg border border-gray-700"
                  >
                    <h4 className="text-sm font-medium text-white">Verify This Claim</h4>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        placeholder="Stake amount"
                        value={verifyStakes[post.id] || ''}
                        onChange={(e) => setVerifyStakes(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      />
                      <span className="text-xs text-gray-400">ALGO</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleVerification(post.id, true)}
                        disabled={verifyingPost === post.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        {verifyingPost === post.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            TRUE
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => handleVerification(post.id, false)}
                        disabled={verifyingPost === post.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {verifyingPost === post.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            FALSE
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Own Post Warning */}
                {walletAddress && post.author === walletAddress && post.status === 'pending' && (
                  <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-200">This is your post - waiting for community verification</span>
                  </div>
                )}

                {/* Transaction Link */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Coins className="w-4 h-4" />
                    TX: {post.txId.slice(0, 8)}...{post.txId.slice(-8)}
                  </div>
                  
                  {post.explorerUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(post.explorerUrl, '_blank')}
                      className="text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 