import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { 
  Sword, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Coins, 
  Scale, 
  Brain,
  Users,
  Clock,
  TrendingUp,
  Shield,
  Gavel
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { blockchainStakingService, calculateMinimumChallenge } from '../../lib/blockchain-staking';
import { useAuth } from '../../lib/auth';

interface ChallengePostSystemProps {
  post: {
    id: string;
    content: string;
    user_id: string;
    stake_amount: number;
    verification_status: string;
    truth_score?: number;
    challenges?: number;
    upvotes?: number;
    downvotes?: number;
  };
  onChallengeCreated?: () => void;
}

interface Challenge {
  id: string;
  challenger_id: string;
  stake_amount: number;
  status: string;
  created_at: string;
  profiles?: {
    username: string;
    reputation_score: number;
  };
}

interface ChallengeResolution {
  id: string;
  challenge_id: string;
  resolved_by: string;
  verdict: boolean;
  confidence_score: number;
  resolution_notes: string;
  votes_for: number;
  votes_against: number;
}

export function ChallengePostSystem({ post, onChallengeCreated }: ChallengePostSystemProps) {
  const { user } = useAuth();
  const [isChallengingMode, setIsChallengingMode] = useState(false);
  const [challengeAmount, setChallengeAmount] = useState(0);
  const [challengeReason, setChallengeReason] = useState('');
  const [challengeEvidence, setChallengeEvidence] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [resolutions, setResolutions] = useState<ChallengeResolution[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  const minChallengeAmount = calculateMinimumChallenge(post.stake_amount);

  useEffect(() => {
    setChallengeAmount(minChallengeAmount);
    loadChallenges();
  }, [post.id, minChallengeAmount]);

  const loadChallenges = async () => {
    try {
      const { data: challengesData, error } = await supabase
        .from('post_challenges')
        .select(`
          *,
          profiles (username, reputation_score)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });

      if (!error && challengesData) {
        setChallenges(challengesData);
        
        // Load resolutions for resolved challenges
        const resolvedChallengeIds = challengesData
          .filter(c => c.status === 'resolved')
          .map(c => c.id);
        
        if (resolvedChallengeIds.length > 0) {
          const { data: resolutionsData } = await supabase
            .from('challenge_resolutions')
            .select('*')
            .in('challenge_id', resolvedChallengeIds);
          
          if (resolutionsData) {
            setResolutions(resolutionsData);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  };

  const handleCreateChallenge = async () => {
    if (!user?.id) {
      setNotification({
        type: 'error',
        message: 'You must be logged in to challenge posts'
      });
      return;
    }

    if (user.id === post.user_id) {
      setNotification({
        type: 'error',
        message: 'You cannot challenge your own post'
      });
      return;
    }

    if (!challengeReason.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide a reason for your challenge'
      });
      return;
    }

    if (challengeAmount < minChallengeAmount) {
      setNotification({
        type: 'error',
        message: `Minimum challenge amount is ${minChallengeAmount.toFixed(2)} ALGO`
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check user balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('algo_balance, algo_address')
        .eq('id', user.id)
        .single();

      if (!profile || profile.algo_balance < challengeAmount) {
        throw new Error(`Insufficient balance! You need ${challengeAmount} ALGO to challenge this post.`);
      }

      // Create blockchain challenge transaction
      const challengeResult = await blockchainStakingService.challengePost({
        postId: post.id,
        challengeAmount: challengeAmount,
        challengeReason: challengeReason,
        userAddress: profile.algo_address || user.id
      });

      if (!challengeResult.success) {
        throw new Error(challengeResult.error || 'Failed to create blockchain challenge');
      }

      // Update user balance
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('successful_challenges')
        .eq('id', user.id)
        .single();

      await supabase
        .from('profiles')
        .update({ 
          algo_balance: profile.algo_balance - challengeAmount,
          successful_challenges: (currentProfile?.successful_challenges || 0) + 1
        })
        .eq('id', user.id);

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'challenge',
          amount: -challengeAmount,
          description: `Challenge: "${challengeReason.substring(0, 50)}..."`,
          related_post_id: post.id,
          blockchain_tx_id: challengeResult.transactionId
        });

      // Reset form
      setChallengeReason('');
      setChallengeEvidence('');
      setIsChallengingMode(false);
      
      setNotification({
        type: 'success',
        message: `🗡️ Challenge created successfully! Staked ${challengeAmount} ALGO.`
      });

      // Reload challenges
      await loadChallenges();
      
      if (onChallengeCreated) {
        onChallengeCreated();
      }

    } catch (error: any) {
      console.error('Challenge creation failed:', error);
      setNotification({
        type: 'error',
        message: `Failed to create challenge: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteOnResolution = async (challengeId: string, voteFor: boolean) => {
    if (!user?.id) {
      setNotification({
        type: 'error',
        message: 'You must be logged in to vote'
      });
      return;
    }

    setIsVoting(true);

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('resolution_votes')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        setNotification({
          type: 'warning',
          message: 'You have already voted on this resolution'
        });
        return;
      }

      // Get user reputation for weighted voting
      const { data: profile } = await supabase
        .from('profiles')
        .select('reputation_score')
        .eq('id', user.id)
        .single();

      const voteWeight = Math.max(1, Math.floor((profile?.reputation_score || 100) / 100));

      // Record vote
      await supabase
        .from('resolution_votes')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          vote_for: voteFor,
          vote_weight: voteWeight
        });

      // Get current vote count
      const { data: currentResolution } = await supabase
        .from('challenge_resolutions')
        .select('votes_for, votes_against')
        .eq('challenge_id', challengeId)
        .single();

      const currentCount = voteFor 
        ? (currentResolution?.votes_for || 0)
        : (currentResolution?.votes_against || 0);

      // Update resolution vote counts
      await supabase
        .from('challenge_resolutions')
        .update(voteFor ? 
          { votes_for: currentCount + voteWeight } : 
          { votes_against: currentCount + voteWeight }
        )
        .eq('challenge_id', challengeId);

      setNotification({
        type: 'success',
        message: `Vote recorded! Your vote weight: ${voteWeight}`
      });

      // Reload challenges to update vote counts
      await loadChallenges();

    } catch (error: any) {
      console.error('Voting failed:', error);
      setNotification({
        type: 'error',
        message: `Failed to record vote: ${error.message}`
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getResolutionForChallenge = (challengeId: string) => {
    return resolutions.find(r => r.challenge_id === challengeId);
  };

  const canChallenge = () => {
    return user?.id && 
           user.id !== post.user_id && 
           post.verification_status === 'pending' &&
           !challenges.some(c => c.challenger_id === user.id && c.status === 'pending');
  };

  const getChallengeStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getVerificationStatusBadge = () => {
    switch (post.verification_status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">Pending Verification</Badge>;
      case 'verified':
        return <Badge variant="outline" className="border-green-500/30 text-green-400">Verified</Badge>;
      case 'disputed':
        return <Badge variant="outline" className="border-red-500/30 text-red-400">Under Challenge</Badge>;
      case 'false':
        return <Badge variant="outline" className="border-red-500/30 text-red-400">Disputed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Challenge System Header */}
      <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Sword className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Truth Challenge System</h3>
                <p className="text-gray-400 text-sm">Stake ALGO to challenge questionable claims</p>
              </div>
            </div>
            {getVerificationStatusBadge()}
          </div>

          {/* Post Challenge Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{post.stake_amount}</div>
              <div className="text-xs text-gray-400">ALGO Staked</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{challenges.length}</div>
              <div className="text-xs text-gray-400">Active Challenges</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{post.upvotes || 0}</div>
              <div className="text-xs text-gray-400">Support Votes</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{post.truth_score || 0}</div>
              <div className="text-xs text-gray-400">Truth Score</div>
            </div>
          </div>

          {/* Challenge Actions */}
          {canChallenge() && (
            <div className="flex gap-3">
              <Button
                onClick={() => setIsChallengingMode(!isChallengingMode)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Sword className="w-4 h-4 mr-2" />
                Challenge This Post
              </Button>
              
              <Button
                variant="outline"
                className="border-gray-600"
                disabled
              >
                <Scale className="w-4 h-4 mr-2" />
                Request Expert Review
              </Button>
            </div>
          )}

          {!canChallenge() && user?.id && (
            <div className="text-sm text-gray-400">
              {user.id === post.user_id ? 
                "You cannot challenge your own post" :
                post.verification_status !== 'pending' ?
                "This post is no longer accepting challenges" :
                "You have already challenged this post"
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Challenge Creation Form */}
      <AnimatePresence>
        {isChallengingMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gray-900/50 border-red-500/30">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Create Challenge
                </h4>

                {/* Notification */}
                {notification && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                      notification.type === 'success' 
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                        : notification.type === 'warning'
                        ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                        : notification.type === 'info'
                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{notification.message}</span>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {/* Challenge Amount */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Challenge Stake Amount (ALGO)
                    </label>
                    <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                      <Slider
                        value={[challengeAmount]}
                        onValueChange={([value]) => setChallengeAmount(value)}
                        min={minChallengeAmount}
                        max={Math.max(post.stake_amount * 2, 10)}
                        step={0.1}
                        className="py-4"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xl font-bold text-white">
                          {challengeAmount.toFixed(1)} ALGO
                        </span>
                        <span className="text-sm text-gray-400">
                          Min: {minChallengeAmount.toFixed(1)} ALGO
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Challenge Reason */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Reason for Challenge
                    </label>
                    <Textarea
                      placeholder="Explain why you believe this post contains false information. Be specific and provide reasoning..."
                      value={challengeReason}
                      onChange={(e) => setChallengeReason(e.target.value)}
                      className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {challengeReason.length}/500 characters
                    </div>
                  </div>

                  {/* Supporting Evidence */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Supporting Evidence (Optional)
                    </label>
                    <Textarea
                      placeholder="Provide links, citations, or additional evidence to support your challenge..."
                      value={challengeEvidence}
                      onChange={(e) => setChallengeEvidence(e.target.value)}
                      className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500"
                      maxLength={300}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCreateChallenge}
                      disabled={isSubmitting || !challengeReason.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          <span>Creating Challenge...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sword className="w-4 h-4" />
                          <span>Stake {challengeAmount.toFixed(1)} ALGO & Challenge</span>
                        </div>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setIsChallengingMode(false)}
                      className="border-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Challenges List */}
      {challenges.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              Active Challenges ({challenges.length})
            </h4>

            <div className="space-y-4">
              {challenges.map((challenge) => {
                const resolution = getResolutionForChallenge(challenge.id);
                
                return (
                  <div key={challenge.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                          <Sword className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {challenge.profiles?.username || 'Anonymous Challenger'}
                          </div>
                          <div className="text-sm text-gray-400">
                            Rep: {challenge.profiles?.reputation_score || 0} • 
                            Staked: {challenge.stake_amount} ALGO
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={getChallengeStatusColor(challenge.status)}>
                        {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Challenge Details */}
                    <div className="text-sm text-gray-300 mb-3">
                      Challenge created {new Date(challenge.created_at).toLocaleDateString()}
                    </div>

                    {/* Resolution Information */}
                    {resolution && (
                      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-medium text-white">
                              AI Resolution
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              Confidence: {resolution.confidence_score}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-300 mb-3">
                          {resolution.resolution_notes}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-sm text-gray-300">{resolution.votes_for}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-gray-300">{resolution.votes_against}</span>
                            </div>
                          </div>
                          
                          {user?.id && challenge.status === 'resolved' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVoteOnResolution(challenge.id, true)}
                                disabled={isVoting}
                                className="border-green-500/30 hover:bg-green-500/10"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Agree
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVoteOnResolution(challenge.id, false)}
                                disabled={isVoting}
                                className="border-red-500/30 hover:bg-red-500/10"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Disagree
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 