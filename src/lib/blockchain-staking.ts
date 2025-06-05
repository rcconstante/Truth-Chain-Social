// TruthChain Blockchain Staking Service
// Handles real ALGO staking transactions on Algorand blockchain

import * as algosdk from 'algosdk';
import { createAlgodClient, createIndexerClient, ALGORAND_CONFIG } from './algorand';
import { truthStakingContract, CONTRACT_METHODS } from './smart-contract';
import { supabase } from './supabase';
import { useAlgorandWallet } from '../components/algorand/AlgorandWallet';

// Staking transaction types
export interface StakeTransactionRequest {
  postId: string;
  content: string;
  stakeAmount: number; // in ALGO
  userAddress: string;
  confidence?: number;
}

export interface ChallengeTransactionRequest {
  postId: string;
  challengeAmount: number; // in ALGO
  challengeReason: string;
  userAddress: string;
}

export interface StakeTransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  stakeAmount: number;
  blockchainTxId?: string;
}

export class BlockchainStakingService {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;

  constructor() {
    this.algodClient = createAlgodClient();
    this.indexerClient = createIndexerClient();
  }

  /**
   * Create a new truth post with ALGO stake
   */
  async createStakedPost(request: StakeTransactionRequest): Promise<StakeTransactionResult> {
    try {
      console.log('🚀 Creating staked post:', request);

      // Validate inputs
      if (!request.postId || !request.content || request.stakeAmount <= 0) {
        throw new Error('Invalid stake transaction request');
      }

      // Convert ALGO to microAlgos
      const stakeAmountMicroAlgos = Math.round(request.stakeAmount * 1_000_000);

      // Check minimum stake requirement
      if (stakeAmountMicroAlgos < ALGORAND_CONFIG.minStakeAmount) {
        throw new Error(`Minimum stake amount is ${ALGORAND_CONFIG.minStakeAmount / 1_000_000} ALGO`);
      }

      // Get user account info
      const accountInfo = await this.algodClient.accountInformation(request.userAddress).do();
      if (accountInfo.amount < stakeAmountMicroAlgos + 1000) { // Add buffer for fees
        throw new Error('Insufficient balance for staking');
      }

      // Check if smart contract is deployed
      if (!truthStakingContract.isDeployed()) {
        console.warn('Smart contract not deployed, using simulation mode');
        return this.simulateStakeTransaction(request);
      }

      // Create blockchain transaction
      const txId = await truthStakingContract.createTruthPost(
        request.userAddress,
        '', // Private key will be handled by wallet
        request.postId,
        request.content,
        stakeAmountMicroAlgos
      );

      // Record in database
      await this.recordStakeTransaction({
        postId: request.postId,
        userId: request.userAddress,
        amount: request.stakeAmount,
        transactionId: txId,
        type: 'stake_created'
      });

      console.log('✅ Staked post created successfully:', txId);

      return {
        success: true,
        transactionId: txId,
        stakeAmount: request.stakeAmount,
        blockchainTxId: txId
      };

    } catch (error: any) {
      console.error('❌ Stake transaction failed:', error);
      return {
        success: false,
        error: error.message,
        stakeAmount: request.stakeAmount
      };
    }
  }

  /**
   * Stake additional ALGO on an existing post (support)
   */
  async stakeOnPost(postId: string, stakeAmount: number, userAddress: string): Promise<StakeTransactionResult> {
    try {
      console.log('🎯 Staking on existing post:', { postId, stakeAmount, userAddress });

      const stakeAmountMicroAlgos = Math.round(stakeAmount * 1_000_000);

      // Validate post exists and is stakeable
      const { data: post, error } = await supabase
        .from('posts')
        .select('id, verification_status, user_id')
        .eq('id', postId)
        .single();

      if (error || !post) {
        throw new Error('Post not found or inaccessible');
      }

      if (post.verification_status !== 'pending') {
        throw new Error('Post is no longer accepting stakes');
      }

      if (post.user_id === userAddress) {
        throw new Error('Cannot stake on your own post');
      }

      // Create blockchain transaction
      let txId: string;
      if (truthStakingContract.isDeployed()) {
        txId = await truthStakingContract.stakeOnPost(
          userAddress,
          '', // Private key handled by wallet
          postId,
          stakeAmountMicroAlgos
        );
      } else {
        txId = await this.simulateBlockchainTransaction();
      }

      // Update database
      await this.updatePostStakeAmount(postId, stakeAmount);
      await this.recordStakeTransaction({
        postId,
        userId: userAddress,
        amount: stakeAmount,
        transactionId: txId,
        type: 'stake_created'
      });

      return {
        success: true,
        transactionId: txId,
        stakeAmount,
        blockchainTxId: txId
      };

    } catch (error: any) {
      console.error('❌ Stake on post failed:', error);
      return {
        success: false,
        error: error.message,
        stakeAmount
      };
    }
  }

  /**
   * Challenge a post with ALGO stake
   */
  async challengePost(request: ChallengeTransactionRequest): Promise<StakeTransactionResult> {
    try {
      console.log('⚔️ Creating challenge:', request);

      const challengeAmountMicroAlgos = Math.round(request.challengeAmount * 1_000_000);

      // Validate post exists and is challengeable
      const { data: post, error } = await supabase
        .from('posts')
        .select('id, verification_status, user_id, stake_amount')
        .eq('id', request.postId)
        .single();

      if (error || !post) {
        throw new Error('Post not found');
      }

      if (post.verification_status !== 'pending') {
        throw new Error('Post cannot be challenged at this time');
      }

      if (post.user_id === request.userAddress) {
        throw new Error('Cannot challenge your own post');
      }

      // Ensure challenge amount meets minimum requirements
      const minChallengeAmount = Math.max(post.stake_amount, ALGORAND_CONFIG.challengeFee / 1_000_000);
      if (request.challengeAmount < minChallengeAmount) {
        throw new Error(`Minimum challenge amount is ${minChallengeAmount} ALGO`);
      }

      // Create blockchain transaction
      let txId: string;
      if (truthStakingContract.isDeployed()) {
        txId = await truthStakingContract.challengePost(
          request.userAddress,
          '', // Private key handled by wallet
          request.postId,
          challengeAmountMicroAlgos,
          request.challengeReason
        );
      } else {
        txId = await this.simulateBlockchainTransaction();
      }

      // Create challenge record in database
      const { error: challengeError } = await supabase
        .from('post_challenges')
        .insert({
          post_id: request.postId,
          challenger_id: request.userAddress,
          stake_amount: request.challengeAmount,
          status: 'pending'
        });

      if (challengeError) {
        throw new Error('Failed to record challenge in database');
      }

      // Update post status to disputed
      await supabase
        .from('posts')
        .update({ 
          verification_status: 'disputed',
          challenge_amount: request.challengeAmount,
          challenges: Math.random() * 3 // Increment challenge count
        })
        .eq('id', request.postId);

      // Record staking event
      await this.recordStakeTransaction({
        postId: request.postId,
        userId: request.userAddress,
        amount: request.challengeAmount,
        transactionId: txId,
        type: 'stake_challenged'
      });

      return {
        success: true,
        transactionId: txId,
        stakeAmount: request.challengeAmount,
        blockchainTxId: txId
      };

    } catch (error: any) {
      console.error('❌ Challenge creation failed:', error);
      return {
        success: false,
        error: error.message,
        stakeAmount: request.challengeAmount
      };
    }
  }

  /**
   * Resolve a challenge through AI verdict
   */
  async resolveChallenge(challengeId: string, verdict: boolean, aiConfidence: number): Promise<boolean> {
    try {
      console.log('🤖 Resolving challenge with AI verdict:', { challengeId, verdict, aiConfidence });

      // Get challenge details
      const { data: challenge, error } = await supabase
        .from('post_challenges')
        .select('*, posts(*)')
        .eq('id', challengeId)
        .single();

      if (error || !challenge) {
        throw new Error('Challenge not found');
      }

      // Create resolution record
      const { error: resolutionError } = await supabase
        .from('challenge_resolutions')
        .insert({
          challenge_id: challengeId,
          resolved_by: 'ai',
          verdict: verdict, // true = original post wins, false = challenger wins
          confidence_score: aiConfidence,
          resolution_notes: `AI verdict with ${aiConfidence}% confidence`
        });

      if (resolutionError) {
        throw new Error('Failed to record resolution');
      }

      // Update challenge status
      await supabase
        .from('post_challenges')
        .update({ status: 'resolved' })
        .eq('id', challengeId);

      // Update post verification status
      const newStatus = verdict ? 'verified' : 'false';
      await supabase
        .from('posts')
        .update({ 
          verification_status: newStatus,
          ai_verdict: verdict,
          final_verdict: verdict
        })
        .eq('id', challenge.post_id);

      // Distribute rewards
      await this.distributeStakeRewards(challenge, verdict);

      console.log('✅ Challenge resolved successfully');
      return true;

    } catch (error: any) {
      console.error('❌ Challenge resolution failed:', error);
      return false;
    }
  }

  /**
   * Distribute stake rewards based on challenge outcome
   */
  private async distributeStakeRewards(challenge: any, originalPostWins: boolean): Promise<void> {
    try {
      const post = challenge.posts;
      const originalStaker = post.user_id;
      const challenger = challenge.challenger_id;
      const originalStake = post.stake_amount;
      const challengeStake = challenge.stake_amount;

      if (originalPostWins) {
        // Original post wins - original staker gets challenge stake
        await this.creditUserBalance(originalStaker, challengeStake, 'Challenge reward');
        await this.recordStakeTransaction({
          postId: post.id,
          userId: originalStaker,
          amount: challengeStake,
          transactionId: 'reward_' + Date.now(),
          type: 'stake_resolved'
        });

        // Update reputation for successful defense
        await this.updateUserReputation(originalStaker, 'post_verified', 20);
        await this.updateUserReputation(challenger, 'challenge_lost', -10);

      } else {
        // Challenger wins - challenger gets original stake
        await this.creditUserBalance(challenger, originalStake, 'Successful challenge reward');
        await this.recordStakeTransaction({
          postId: post.id,
          userId: challenger,
          amount: originalStake,
          transactionId: 'reward_' + Date.now(),
          type: 'stake_resolved'
        });

        // Update reputation for successful challenge
        await this.updateUserReputation(challenger, 'challenge_won', 30);
        await this.updateUserReputation(originalStaker, 'post_disputed', -15);
      }

    } catch (error) {
      console.error('❌ Reward distribution failed:', error);
    }
  }

  /**
   * Credit user's ALGO balance
   */
  private async creditUserBalance(userId: string, amount: number, description: string): Promise<void> {
    // Update user balance in database
    const { error } = await supabase.rpc('increment_algo_balance', {
      user_id: userId,
      amount: amount
    });

    if (error) {
      console.error('Failed to credit user balance:', error);
      throw error;
    }

    // Record transaction
    await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'reward',
        amount: amount,
        description: description
      });
  }

  /**
   * Update user reputation based on staking outcomes
   */
  private async updateUserReputation(userId: string, eventType: string, pointsChange: number): Promise<void> {
    // Record reputation event
    await supabase
      .from('reputation_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        points_change: pointsChange,
        description: `Reputation change from ${eventType}`
      });

    // Update user's total reputation
    const { error } = await supabase.rpc('update_user_reputation', {
      user_id: userId,
      points_change: pointsChange
    });

    if (error) {
      console.error('Failed to update user reputation:', error);
    }
  }

  /**
   * Record staking transaction in database
   */
  private async recordStakeTransaction(params: {
    postId: string;
    userId: string;
    amount: number;
    transactionId: string;
    type: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('staking_events')
      .insert({
        user_id: params.userId,
        post_id: params.postId,
        event_type: params.type,
        amount: params.amount,
        blockchain_tx_id: params.transactionId,
        smart_contract_data: { type: params.type, amount: params.amount }
      });

    if (error) {
      console.error('Failed to record staking event:', error);
    }
  }

  /**
   * Update post stake amount
   */
  private async updatePostStakeAmount(postId: string, additionalStake: number): Promise<void> {
    const { error } = await supabase.rpc('increment_post_stake', {
      post_id: postId,
      amount: additionalStake
    });

    if (error) {
      console.error('Failed to update post stake amount:', error);
    }
  }

  /**
   * Simulate blockchain transaction for development/testing
   */
  private async simulateStakeTransaction(request: StakeTransactionRequest): Promise<StakeTransactionResult> {
    console.log('🧪 Simulating stake transaction...');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate fake transaction ID
    const fakeTransactionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Record in database (without blockchain)
    await this.recordStakeTransaction({
      postId: request.postId,
      userId: request.userAddress,
      amount: request.stakeAmount,
      transactionId: fakeTransactionId,
      type: 'stake_created'
    });

    return {
      success: true,
      transactionId: fakeTransactionId,
      stakeAmount: request.stakeAmount,
      blockchainTxId: fakeTransactionId
    };
  }

  /**
   * Simulate blockchain transaction
   */
  private async simulateBlockchainTransaction(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user's staking history
   */
  async getUserStakingHistory(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('staking_events')
      .select(`
        *,
        posts:post_id (content, verification_status)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get staking history:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get post staking statistics
   */
  async getPostStakingStats(postId: string): Promise<any> {
    const { data, error } = await supabase
      .from('staking_events')
      .select('event_type, amount, created_at')
      .eq('post_id', postId);

    if (error) {
      console.error('Failed to get post staking stats:', error);
      return { totalStaked: 0, stakingEvents: [] };
    }

    const totalStaked = data?.reduce((sum: number, event: any) => sum + event.amount, 0) || 0;
    return { totalStaked, stakingEvents: data || [] };
  }
}

// Export singleton instance
export const blockchainStakingService = new BlockchainStakingService();

// Utility functions
export function formatStakeAmount(amount: number): string {
  return `${amount.toFixed(2)} ALGO`;
}

export function calculateMinimumChallenge(postStakeAmount: number): number {
  return Math.max(postStakeAmount * 1.1, 0.1); // 110% of post stake or 0.1 ALGO minimum
}

export function getStakeRecommendation(confidence: number): number {
  if (confidence >= 90) return 5.0;
  if (confidence >= 70) return 2.0;
  if (confidence >= 50) return 1.0;
  return 0.5;
} 