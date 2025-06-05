import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Coins,
  Send,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useToast } from '../ui/use-toast';
import { 
  truthStakingContract, 
  PostStatus, 
  getPostStatusText, 
  getPostStatusColor,
  formatReputationScore,
  TruthPost,
  UserStats
} from '../../lib/smart-contract';
import { useAlgorandWallet } from '../algorand/AlgorandWallet';
import { formatBalance } from '../../lib/algorand';

interface TruthStakingContractProps {
  userAddress?: string;
  walletBalance?: number;
  className?: string;
}

export function TruthStakingContract({ 
  userAddress, 
  walletBalance = 0, 
  className 
}: TruthStakingContractProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    reputation: 500,
    totalStaked: 0,
    postsCreated: 0,
    successfulStakes: 0
  });
  const [contractStatus, setContractStatus] = useState<any>(null);
  
  // Post creation state
  const [newPostContent, setNewPostContent] = useState('');
  const [stakeAmount, setStakeAmount] = useState('1.0');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // Challenge state
  const [challengePostId, setChallengePostId] = useState('');
  const [challengeAmount, setChallengeAmount] = useState('0.5');
  const [challengeReason, setChallengeReason] = useState('');
  const [isChallengingPost, setIsChallengingPost] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (userAddress) {
      loadUserData();
    }
    loadContractStatus();
  }, [userAddress]);

  const loadUserData = async () => {
    if (!userAddress) return;

    try {
      const [optedIn, stats] = await Promise.all([
        truthStakingContract.isUserOptedIn(userAddress),
        truthStakingContract.getUserStats(userAddress)
      ]);

      setIsOptedIn(optedIn);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadContractStatus = async () => {
    try {
      if (truthStakingContract.isDeployed()) {
        const status = await truthStakingContract.getContractStatus();
        setContractStatus(status);
      }
    } catch (error) {
      console.error('Error loading contract status:', error);
    }
  };

  const handleOptIn = async () => {
    if (!userAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Algorand wallet first",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, we would need the user's private key
    // For now, show a message about the process
    toast({
      title: "Opt-In Required",
      description: "To use smart contract features, you need to opt-in first. This requires signing a transaction.",
      variant: "default"
    });
  };

  const handleCreatePost = async () => {
    if (!userAddress || !newPostContent.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter post content and connect wallet",
        variant: "destructive"
      });
      return;
    }

    const stakeAmountMicroAlgos = Math.round(parseFloat(stakeAmount) * 1_000_000);
    if (stakeAmountMicroAlgos < 1_000_000) {
      toast({
        title: "Minimum Stake",
        description: "Minimum stake is 1 ALGO",
        variant: "destructive"
      });
      return;
    }

    if (stakeAmountMicroAlgos > walletBalance - 100_000) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough ALGO for stake and transaction fees",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingPost(true);

    try {
      // Generate unique post ID
      const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In a real implementation, this would call the smart contract
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Truth Post Created!",
        description: `Post "${postId}" created with ${stakeAmount} ALGO stake`,
      });

      // Reset form
      setNewPostContent('');
      setStakeAmount('1.0');
      
      // Reload user data
      loadUserData();
      
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create truth post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleChallengePost = async () => {
    if (!userAddress || !challengePostId.trim() || !challengeReason.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all challenge fields",
        variant: "destructive"
      });
      return;
    }

    const challengeAmountMicroAlgos = Math.round(parseFloat(challengeAmount) * 1_000_000);
    if (challengeAmountMicroAlgos < 100_000) {
      toast({
        title: "Minimum Challenge",
        description: "Minimum challenge amount is 0.1 ALGO",
        variant: "destructive"
      });
      return;
    }

    setIsChallengingPost(true);

    try {
      // In a real implementation, this would call the smart contract
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Challenge Submitted!",
        description: `Post "${challengePostId}" challenged with ${challengeAmount} ALGO`,
      });

      // Reset form
      setChallengePostId('');
      setChallengeAmount('0.5');
      setChallengeReason('');
      
      loadUserData();
      
    } catch (error) {
      console.error('Error challenging post:', error);
      toast({
        title: "Challenge Failed",
        description: "Failed to challenge post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChallengingPost(false);
    }
  };

  if (!truthStakingContract.isDeployed()) {
    return (
      <Card className={`bg-gray-900/50 border-gray-700 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Smart Contract Not Deployed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">Contract Deployment Required</h3>
            <p className="text-gray-400 mb-4">
              The TruthChain smart contract needs to be deployed to Algorand Testnet before you can stake on truth posts.
            </p>
            <div className="bg-gray-800/50 rounded-lg p-4 text-left">
              <h4 className="text-white font-medium mb-2">Deployment Steps:</h4>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Navigate to the <code className="bg-gray-700 px-1 rounded">smart-contracts/</code> directory</li>
                <li>Install Python dependencies: <code className="bg-gray-700 px-1 rounded">pip install -r requirements.txt</code></li>
                <li>Deploy the contract: <code className="bg-gray-700 px-1 rounded">python deploy.py new</code></li>
                <li>Fund the deployment account with testnet ALGO</li>
                <li>Complete the deployment process</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Contract Status */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            TruthChain Smart Contract
            <div className="ml-auto flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Active</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contractStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Contract ID</span>
                </div>
                <div className="text-white font-mono">{contractStatus.id || 'Not deployed'}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Total Stakes</span>
                </div>
                <div className="text-white font-semibold">0 ALGO</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Total Posts</span>
                </div>
                <div className="text-white font-semibold">0</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Stats */}
      {userAddress && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Truth Staking Stats
              {!isOptedIn && (
                <Button
                  onClick={handleOptIn}
                  size="sm"
                  className="ml-auto bg-blue-600 hover:bg-blue-700"
                >
                  Opt-In Required
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{formatReputationScore(userStats.reputation)}</div>
                <div className="text-sm text-gray-400">Reputation Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{formatBalance(userStats.totalStaked)}</div>
                <div className="text-sm text-gray-400">Total Staked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{userStats.postsCreated}</div>
                <div className="text-sm text-gray-400">Posts Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{userStats.successfulStakes}</div>
                <div className="text-sm text-gray-400">Successful Stakes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Truth Post */}
      {userAddress && isOptedIn && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5" />
              Create Truth Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Truth Claim *
              </label>
              <Textarea
                value={newPostContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPostContent(e.target.value)}
                placeholder="Enter your truth claim that you're willing to stake ALGO on..."
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-400 mt-1">
                {newPostContent.length}/500 characters
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Stake Amount (ALGO) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max={formatBalance(walletBalance - 100_000)}
                value={stakeAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStakeAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="1.0"
              />
              <div className="text-xs text-gray-400 mt-1">
                Minimum: 1 ALGO | Available: {formatBalance(walletBalance - 100_000)} ALGO
              </div>
            </div>

            <Button
              onClick={handleCreatePost}
              disabled={isCreatingPost || !newPostContent.trim() || parseFloat(stakeAmount) < 1}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isCreatingPost ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating Post...</span>
                </>
              ) : (
                `Stake ${stakeAmount} ALGO on Truth`
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Challenge Post */}
      {userAddress && isOptedIn && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Challenge Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Post ID to Challenge *
              </label>
              <Input
                value={challengePostId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChallengePostId(e.target.value)}
                placeholder="post_1234567890_abcdef123"
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Challenge Amount (ALGO) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={challengeAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChallengeAmount(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white"
                placeholder="0.5"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Challenge Reason *
              </label>
              <Textarea
                value={challengeReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setChallengeReason(e.target.value)}
                placeholder="Explain why you believe this post is false or misleading..."
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                rows={2}
                maxLength={200}
              />
            </div>

            <Button
              onClick={handleChallengePost}
              disabled={isChallengingPost || !challengePostId.trim() || !challengeReason.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              {isChallengingPost ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Submitting Challenge...</span>
                </>
              ) : (
                `Challenge with ${challengeAmount} ALGO`
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-gray-800/30 border-gray-600">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-white font-medium mb-2">How Truth Staking Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="flex flex-col items-center">
                <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
                <p><strong>1. Stake on Truth</strong><br />Post claims and stake ALGO tokens on their truthfulness</p>
              </div>
              <div className="flex flex-col items-center">
                <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
                <p><strong>2. Community Challenges</strong><br />Others can challenge false claims with counter-stakes</p>
              </div>
              <div className="flex flex-col items-center">
                <TrendingUp className="w-8 h-8 text-blue-400 mb-2" />
                <p><strong>3. AI Moderation</strong><br />AI moderators resolve disputes and distribute rewards</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 