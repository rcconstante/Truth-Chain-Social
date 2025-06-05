import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TruthReminder } from '../ui/truth-reminder';
import {
  ChevronUp, ChevronDown, MessageCircle, CheckCircle, Flag, AlertCircle, Coins
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AlgorandService, { AlgorandServiceClass } from '../../lib/algorand-service';
import { useAuth } from '../../lib/auth';

interface PostInteractionsProps {
  post: {
    id: string;
    user_id: string;
    upvotes: number;
    downvotes: number;
    comments_count: number;
    challenges: number;
    stake_amount: number;
    verifications?: number;
  };
  onRefresh?: () => void;
}

export const PostInteractions: React.FC<PostInteractionsProps> = ({ post, onRefresh }) => {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [challengeReason, setChallengeReason] = useState('');
  const [challengeAmount, setChallengeAmount] = useState('');
  const [verificationAmount, setVerificationAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [hasWallet, setHasWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Local state for immediate UI updates
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(post.downvotes);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count);
  const [localChallenges, setLocalChallenges] = useState(post.challenges);
  const [localStakeAmount, setLocalStakeAmount] = useState(post.stake_amount);

  useEffect(() => {
    if (user) {
      fetchUserVote();
      fetchUserBalance();
      checkWalletConnection();
      if (showComments) {
        fetchComments();
      }
    }
  }, [user, post.id, showComments]);

  // Sync local state with props when they change
  useEffect(() => {
    setLocalUpvotes(post.upvotes);
    setLocalDownvotes(post.downvotes);
    setLocalCommentsCount(post.comments_count);
    setLocalChallenges(post.challenges);
    setLocalStakeAmount(post.stake_amount);
  }, [post]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchUserBalance = async () => {
    if (!user) return;
    
    try {
      // Get current balance from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('algo_balance, algo_address')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserBalance(profile.algo_balance || 0);
        
        // Sync real-time balance if wallet is connected
        if (profile?.algo_address) {
          try {
            const realTimeBalance = await AlgorandService.getAccountBalance(profile.algo_address);
            
            // CRITICAL FIX: Only update if real balance exists
            if (realTimeBalance > 0) {
              // Update database with real balance
              await supabase
                .from('profiles')
                .update({ algo_balance: realTimeBalance })
                .eq('id', user.id);
              setUserBalance(realTimeBalance);
            } else if (profile.algo_balance > 0) {
              console.log(`⚠️ Keeping database balance ${profile.algo_balance} ALGO (testnet wallet unfunded)`);
              // Keep database balance, don't overwrite with 0
              setUserBalance(profile.algo_balance);
            }
          } catch (error) {
            console.warn('⚠️ Failed to sync real-time balance:', error);
            setUserBalance(profile.algo_balance || 0);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  const fetchUserVote = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('post_votes')
        .select('vote_type')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();
      
      setUserVote(data?.vote_type || null);
    } catch (error) {
      console.error('Error fetching user vote:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching comments:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load comments. Please try again.'
        });
      } else {
        setComments(data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user || loading) {
      console.log('❌ Cannot vote: No user or loading');
      return;
    }
    
    console.log('🗳️ Attempting to vote:', { 
      voteType, 
      postId: post.id, 
      userId: user.id,
      userEmail: user.email,
      currentVote: userVote,
      timestamp: new Date().toISOString()
    });
    
    setLoading(true);
    
    // Immediately update local state for better UX
    const wasVoting = userVote === voteType;
    const oldVote = userVote;
    
    if (wasVoting) {
      // Removing vote
      setUserVote(null);
      if (voteType === 'upvote') {
        setLocalUpvotes(prev => Math.max(0, prev - 1));
      } else {
        setLocalDownvotes(prev => Math.max(0, prev - 1));
      }
    } else {
      // Adding or changing vote
      setUserVote(voteType);
      if (voteType === 'upvote') {
        setLocalUpvotes(prev => prev + 1);
        if (oldVote === 'downvote') {
          setLocalDownvotes(prev => Math.max(0, prev - 1));
        }
      } else {
        setLocalDownvotes(prev => prev + 1);
        if (oldVote === 'upvote') {
          setLocalUpvotes(prev => Math.max(0, prev - 1));
        }
      }
    }
    
    try {
      // First check if user has existing vote
      console.log('🔍 Checking for existing vote...');
      const { data: existingVote, error: checkError } = await supabase
        .from('post_votes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Error checking existing vote:', checkError);
        throw checkError;
      }
      
      console.log('📊 Existing vote check result:', existingVote);
      
      if (existingVote && existingVote.vote_type === voteType) {
        // Remove vote
        console.log('🗑️ Removing existing vote...');
        const { error } = await supabase
          .from('post_votes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('❌ Error removing vote:', error);
          throw error;
        }
        
        setNotification({
          type: 'info',
          message: 'Vote removed'
        });
        console.log('✅ Vote removed successfully');
      } else {
        // Add or update vote
        console.log('➕ Adding/updating vote...');
        
        // Delete existing vote first if it exists
        if (existingVote) {
          await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', post.id)
            .eq('user_id', user.id);
        }
        
        // Insert new vote
        const { error } = await supabase
          .from('post_votes')
          .insert({
            post_id: post.id,
            user_id: user.id,
            vote_type: voteType
          });
          
        if (error) {
          console.error('❌ Error adding vote:', error);
          throw error;
        }
        
        setNotification({
          type: 'success',
          message: `Post ${voteType}d successfully!`
        });
        console.log('✅ Vote added successfully');
      }
      
      // Refresh the data
      console.log('🔄 Refreshing data...');
      onRefresh?.();
      await fetchUserVote(); // Refetch user vote to confirm
      
    } catch (error: any) {
      console.error('❌ Vote error details:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        supabaseError: error
      });
      
      // Revert local state on error
      if (wasVoting) {
        setUserVote(voteType);
        if (voteType === 'upvote') {
          setLocalUpvotes(prev => prev + 1);
        } else {
          setLocalDownvotes(prev => prev + 1);
        }
      } else {
        setUserVote(oldVote);
        if (voteType === 'upvote') {
          setLocalUpvotes(prev => Math.max(0, prev - 1));
          if (oldVote === 'downvote') {
            setLocalDownvotes(prev => prev + 1);
          }
        } else {
          setLocalDownvotes(prev => Math.max(0, prev - 1));
          if (oldVote === 'upvote') {
            setLocalUpvotes(prev => prev + 1);
          }
        }
      }
      
      let errorMessage = 'Failed to vote. ';
      if (error.code === '42501') {
        errorMessage += 'Permission denied. Please check your authentication.';
      } else if (error.code === '23503') {
        errorMessage += 'Data relationship error. Please refresh and try again.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim() || loading) return;
    
    setLoading(true);
    
    // Immediately update local state for better UX
    setLocalCommentsCount(prev => prev + 1);
    
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        });
      
      if (error) throw error;
      
      setNewComment('');
      setNotification({
        type: 'success',
        message: 'Comment added successfully!'
      });
      await fetchComments();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      
      // Revert local state on error
      setLocalCommentsCount(prev => Math.max(0, prev - 1));
      
      setNotification({
        type: 'error',
        message: error.message || 'Failed to add comment. Please check your permissions and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!user || !verificationAmount || loading) return;
    
    // Check wallet connection first
    if (!hasWallet) {
      setNotification({
        type: 'error',
        message: 'Please connect your Pera Algorand wallet first to verify posts'
      });
      setShowVerification(false);
      return;
    }
    
    // Prevent self-verification at function level
    if (user.id === post.user_id) {
      setNotification({
        type: 'error',
        message: 'You cannot verify your own post'
      });
      return;
    }
    
    // Validate stake amount
    const stakeValidation = AlgorandServiceClass.validateStakeAmount(verificationAmount);
    if (!stakeValidation.isValid) {
      setNotification({
        type: 'error',
        message: stakeValidation.error || 'Invalid stake amount'
      });
      return;
    }
    
    const amount = stakeValidation.numericAmount;
    
    setLoading(true);
    
    try {
      // Check if user has already staked on this post to prevent 409 error
      const { data: existingVerification } = await supabase
        .from('post_verifications')
        .select('id')
        .eq('post_id', post.id)
        .eq('verifier_id', user.id)
        .eq('verification_type', 'support')
        .single();

      if (existingVerification) {
        setNotification({
          type: 'error',
          message: 'You have already verified this post'
        });
        setLoading(false);
        return;
      }

      // Check if user has sufficient balance
      const balanceCheck = await AlgorandServiceClass.canUserStake(user.id, amount);
      if (!balanceCheck.canStake) {
        setNotification({
          type: 'error',
          message: `Insufficient balance. You have ${balanceCheck.currentBalance.toFixed(3)} ALGO but need ${amount} ALGO`
        });
        setLoading(false);
        return;
      }

      // Process the stake transaction first
      const stakeResult = await AlgorandServiceClass.processStake(
        user.id,
        post.id,
        amount,
        'verification'
      );
      
      if (stakeResult.success) {
        // CREATE VERIFICATION RECORD IN DATABASE - with better error handling
        try {
          const { error: verificationError } = await supabase
            .from('post_verifications')
            .insert({
              post_id: post.id,
              verifier_id: user.id,
              stake_amount: amount,
              verification_type: 'support',
              status: 'active'
            });

          if (verificationError) {
            if (verificationError.code === '23505') {
              setNotification({
                type: 'error',
                message: 'You have already verified this post'
              });
              setLoading(false);
              return;
            }
            console.warn('⚠️ Failed to create verification record:', verificationError);
          } else {
            console.log('✅ Verification record created successfully');
          }
        } catch (verificationRecordError) {
          console.warn('⚠️ Error creating verification record:', verificationRecordError);
        }

        // Trigger balance refresh event
        window.dispatchEvent(new CustomEvent('transactionCompleted', {
          detail: { 
            type: 'verification', 
            amount: amount,
            txId: stakeResult.txId,
            newBalance: stakeResult.newBalance
          }
        }));

        setUserBalance(stakeResult.newBalance || 0);
        
        // Update UI optimistically
        const newVerifications = (post.verifications || 0) + 1;
        
        setNotification({
          type: 'success',
          message: `🎉 Real blockchain verification complete! TxID: ${stakeResult.txId?.substring(0, 8)}...`
        });

        // Update post stats atomically
        await supabase.rpc('increment_post_stats', {
          post_id: post.id,
          stake_increment: amount,
          verification_increment: 1,
          challenge_increment: 0
        });
        
        onRefresh?.();
        console.log(`✅ Verification complete! New balance: ${stakeResult.newBalance} ALGO`);
      } else {
        setNotification({
          type: 'error',
          message: `❌ Verification failed: ${stakeResult.error}`
        });
      }
    } catch (error: any) {
      console.error('Error creating verification:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to create verification. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = async () => {
    if (!user || !challengeAmount || loading) return;
    
    // Check wallet connection first
    if (!hasWallet) {
      setNotification({
        type: 'error',
        message: 'Please connect your Pera Algorand wallet first to challenge posts'
      });
      setShowChallenge(false);
      return;
    }
    
    // Prevent self-challenging at function level
    if (user.id === post.user_id) {
      setNotification({
        type: 'error',
        message: 'You cannot challenge your own post'
      });
      return;
    }
    
    // Validate stake amount
    const stakeValidation = AlgorandServiceClass.validateStakeAmount(challengeAmount);
    if (!stakeValidation.isValid) {
      setNotification({
        type: 'error',
        message: stakeValidation.error || 'Invalid stake amount'
      });
      return;
    }
    
    const amount = stakeValidation.numericAmount;
    
    setLoading(true);
    
    try {
      // Check if user has already challenged this post to prevent 409 error
      const { data: existingChallenge } = await supabase
        .from('post_verifications')
        .select('id')
        .eq('post_id', post.id)
        .eq('verifier_id', user.id)
        .eq('verification_type', 'challenge')
        .single();

      if (existingChallenge) {
        setNotification({
          type: 'error',
          message: 'You have already challenged this post'
        });
        setLoading(false);
        return;
      }

      // Check if user has sufficient balance
      const balanceCheck = await AlgorandServiceClass.canUserStake(user.id, amount);
      if (!balanceCheck.canStake) {
        setNotification({
          type: 'error',
          message: `Insufficient balance. You have ${balanceCheck.currentBalance.toFixed(3)} ALGO but need ${amount} ALGO`
        });
        setLoading(false);
        return;
      }

      // Process the stake transaction first
      const stakeResult = await AlgorandServiceClass.processStake(
        user.id,
        post.id,
        amount,
        'challenge'
      );

      if (stakeResult.success) {
        // CREATE CHALLENGE RECORD IN DATABASE - with better error handling
        try {
          const { error: challengeError } = await supabase
            .from('post_verifications')
            .insert({
              post_id: post.id,
              verifier_id: user.id,
              stake_amount: Number(amount),
              verification_type: 'challenge',
              status: 'active'
            });

          if (challengeError) {
            if (challengeError.code === '23505') {
              setNotification({
                type: 'error',
                message: 'You have already challenged this post'
              });
              setLoading(false);
              return;
            }
            console.warn('⚠️ Failed to create challenge record:', challengeError);
          } else {
            console.log('✅ Challenge record created successfully');
          }
        } catch (challengeRecordError) {
          console.warn('⚠️ Error creating challenge record:', challengeRecordError);
        }

        // ADD CHALLENGE COMMENT TO POST
        try {
          const { error: commentError } = await supabase
            .from('comments')
            .insert({
              post_id: post.id,
              user_id: user.id,
              content: `🚨 CHALLENGE: ${challengeReason.trim()} [Staked ${amount} ALGO]`,
              created_at: new Date().toISOString()
            });

          if (commentError) {
            console.warn('⚠️ Failed to add challenge comment:', commentError);
          } else {
            console.log('✅ Challenge comment added successfully');
            // Update local comments count
            setLocalCommentsCount(prev => prev + 1);
            // Refresh comments if they're visible
            if (showComments) {
              fetchComments();
            }
          }
        } catch (commentAddError) {
          console.warn('⚠️ Error adding challenge comment:', commentAddError);
        }

        // Trigger balance refresh event
        window.dispatchEvent(new CustomEvent('transactionCompleted', {
          detail: { 
            type: 'challenge', 
            amount: Number(amount),
            txId: stakeResult.txId,
            newBalance: stakeResult.newBalance
          }
        }));

        setUserBalance(stakeResult.newBalance || 0);
        
        setNotification({
          type: 'success',
          message: stakeResult.txId?.startsWith('SIM') 
            ? `✅ Challenge stake processed! Your challenge comment has been posted.`
            : `🎉 Real blockchain challenge complete! TxID: ${stakeResult.txId?.substring(0, 8)}... Your challenge comment has been posted.`
        });

        // Update post stats atomically
        await supabase.rpc('increment_post_stats', {
          post_id: post.id,
          stake_increment: 0, // Challenges don't add to the support pool
          verification_increment: 0,
          challenge_increment: 1
        });

        // Clear challenge form
        setChallengeReason('');
        setChallengeAmount('');
        setShowChallenge(false);
        
        onRefresh?.();
        console.log(`✅ Challenge complete! New balance: ${stakeResult.newBalance} ALGO`);
      } else {
        setNotification({
          type: 'error',
          message: `❌ Challenge failed: ${stakeResult.error}`
        });
      }
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to create challenge. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time wallet connection check
  const checkWalletConnection = async () => {
    if (!user?.id) {
      setHasWallet(false);
      return;
    }
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_connected, algo_address, wallet_address')
        .eq('id', user.id)
        .single();

      const isConnected = profile?.wallet_connected && (profile?.algo_address || profile?.wallet_address);
      setHasWallet(isConnected);
      setWalletAddress(profile?.algo_address || profile?.wallet_address || null);
      
      console.log('🔗 Wallet Connection Status:', { 
        isConnected, 
        address: profile?.algo_address || profile?.wallet_address,
        wallet_connected: profile?.wallet_connected 
      });
    } catch (error) {
      console.error('❌ Error checking wallet connection:', error);
      setHasWallet(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <span className="text-gray-300">Sign in to interact with posts</span>
        </div>
      </div>
    );
  }

  const isOwnPost = user.id === post.user_id;

  return (
    <div className="space-y-4">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 p-3 rounded-lg border ${
              notification.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : notification.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main interaction buttons */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 light:bg-gray-50 rounded-lg border border-gray-200 dark:border-gray-700/50 light:border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Upvote */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVote('upvote')}
            disabled={loading || isOwnPost}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors border ${
              userVote === 'upvote'
                ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                : 'bg-white dark:bg-gray-700/50 light:bg-white text-gray-700 dark:text-gray-300 light:text-gray-700 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 border-gray-300 dark:border-gray-600/50 light:border-gray-300'
            } ${isOwnPost ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isOwnPost ? "You can't vote on your own post" : 'Upvote this post'}
          >
            <ChevronUp className="w-4 h-4" />
            <span>{localUpvotes}</span>
          </motion.button>

          {/* Downvote */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleVote('downvote')}
            disabled={loading || isOwnPost}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors border ${
              userVote === 'downvote'
                ? 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                : 'bg-white dark:bg-gray-700/50 light:bg-white text-gray-700 dark:text-gray-300 light:text-gray-700 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 border-gray-300 dark:border-gray-600/50 light:border-gray-300'
            } ${isOwnPost ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isOwnPost ? "You can't vote on your own post" : 'Downvote this post'}
          >
            <ChevronDown className="w-4 h-4" />
            <span>{localDownvotes}</span>
          </motion.button>

          {/* Comments */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-700/50 light:bg-white text-gray-700 dark:text-gray-300 light:text-gray-700 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-300 dark:border-gray-600/50 light:border-gray-300 transition-colors"
            title="View and add comments"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{localCommentsCount}</span>
          </motion.button>

          {/* Verification/Support */}
          {!isOwnPost && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowVerification(!showVerification)}
              disabled={!hasWallet}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors border ${
                hasWallet 
                  ? 'bg-white dark:bg-gray-700/50 light:bg-white text-gray-700 dark:text-gray-300 light:text-gray-700 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 border-gray-300 dark:border-gray-600/50 light:border-gray-300'
                  : 'bg-gray-200 dark:bg-gray-800/50 light:bg-gray-200 text-gray-500 border-gray-300 dark:border-gray-700/50 light:border-gray-300 cursor-not-allowed'
              }`}
              title={hasWallet ? "Stake ALGO to verify/support this post" : "Connect your wallet to verify posts"}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Verify</span>
            </motion.button>
          )}

          {/* Challenge */}
          {!isOwnPost && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowChallenge(!showChallenge)}
              disabled={!hasWallet}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors border ${
                hasWallet 
                  ? 'bg-white dark:bg-gray-700/50 light:bg-white text-gray-700 dark:text-gray-300 light:text-gray-700 hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400 border-gray-300 dark:border-gray-600/50 light:border-gray-300'
                  : 'bg-gray-200 dark:bg-gray-800/50 light:bg-gray-200 text-gray-500 border-gray-300 dark:border-gray-700/50 light:border-gray-300 cursor-not-allowed'
              }`}
              title={hasWallet ? "Challenge this post's accuracy" : "Connect your wallet to challenge posts"}
            >
              <Flag className="w-4 h-4" />
              <span>Challenge ({localChallenges})</span>
            </motion.button>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          {/* Verification and Challenge counts */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-green-600 dark:text-green-400">✓ {post.verifications || 0} verified</span>
            <span className="text-orange-600 dark:text-orange-400">⚔ {localChallenges} challenged</span>
          </div>
        </div>
      </div>

      {/* Wallet connection prompt */}
      {!hasWallet && !isOwnPost && (showVerification || showChallenge) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-400">Wallet Connection Required</h3>
              <p className="text-yellow-300 text-sm mt-1">
                Please connect your Algorand wallet to stake ALGO and interact with posts. 
                Visit your profile to connect your wallet and get testnet ALGO.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Verification form */}
      {showVerification && hasWallet && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-green-500/10 rounded-lg border border-green-500/30"
        >
          <TruthReminder type="verify" className="mb-4" />
          
          <h3 className="font-semibold text-green-400 mb-3">✅ Verify & Support This Post</h3>
          <p className="text-gray-300 text-sm mb-3">
            Stake ALGO to verify the accuracy of this post. If the post is later proven true, you'll earn rewards!
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={verificationAmount}
                onChange={(e) => setVerificationAmount(e.target.value)}
                placeholder="Verification stake (ALGO)"
                className="flex-1 p-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                min="0.1"
                step="0.1"
                max={userBalance}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleVerification}
                disabled={loading || !verificationAmount || parseFloat(verificationAmount) > userBalance}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Staking...' : 'Stake & Verify'}
              </motion.button>
            </div>
            <div className="text-xs text-green-300 bg-green-500/5 p-2 rounded">
              💡 <strong>How it works:</strong> Your stake supports the post's credibility. If proven accurate, you earn a share of challenge rewards. If proven false, you lose your stake.
            </div>
            <div className="text-xs text-gray-400">
              Available balance: {AlgorandServiceClass.formatAlgoAmount(userBalance)} ALGO
            </div>
          </div>
        </motion.div>
      )}

      {/* Challenge form */}
      {showChallenge && hasWallet && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30"
        >
          <TruthReminder type="challenge" className="mb-4" />
          
          <h3 className="font-semibold text-orange-400 mb-3">⚔️ Challenge This Post</h3>
          <div className="space-y-3">
            <textarea
              value={challengeReason}
              onChange={(e) => setChallengeReason(e.target.value)}
              placeholder="Explain why you believe this post is false or misleading..."
              className="w-full p-3 bg-gray-800/50 border border-orange-500/30 rounded-lg resize-none text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
              rows={3}
            />
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={challengeAmount}
                onChange={(e) => setChallengeAmount(e.target.value)}
                placeholder="Stake amount (ALGO)"
                className="flex-1 p-2 bg-gray-800/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                min="0.1"
                step="0.1"
                max={userBalance}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleChallenge}
                disabled={loading || !challengeReason.trim() || !challengeAmount || parseFloat(challengeAmount) > userBalance}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Creating...' : 'Challenge'}
              </motion.button>
            </div>
            <div className="text-xs text-gray-400">
              Available balance: {AlgorandServiceClass.formatAlgoAmount(userBalance)} ALGO
            </div>
          </div>
        </motion.div>
      )}

      {/* Comments section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30"
        >
          <h3 className="font-semibold text-blue-400 mb-3">💬 Comments</h3>
          
          {/* Comment form */}
          <div className="flex space-x-3 mb-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-2 bg-gray-800/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComment}
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Adding...' : 'Comment'}
            </motion.button>
          </div>

          {/* Comments list */}
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-blue-400 text-center py-4">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles?.username}`}
                      alt={comment.profiles?.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium text-blue-400">{comment.profiles?.username}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}; 