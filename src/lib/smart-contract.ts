// TruthChain Smart Contract Integration
// Handles interactions with the deployed truth staking smart contract

import algosdk from 'algosdk';
import { createAlgodClient, createIndexerClient, ALGORAND_CONFIG } from './algorand';

// Smart Contract Configuration (will be updated after deployment)
export let SMART_CONTRACT_CONFIG = {
  APP_ID: 0, // Will be set after deployment
  APP_ADDRESS: '', // Will be set after deployment
  CREATOR_ADDRESS: '',
  NETWORK: 'testnet' as const,
  EXPLORER_URL: ''
};

// Try to load deployed contract config
try {
  const deployedConfig = require('./smart-contract-config');
  if (deployedConfig.TRUTHCHAIN_CONTRACT) {
    SMART_CONTRACT_CONFIG = deployedConfig.TRUTHCHAIN_CONTRACT;
  }
} catch (error) {
  console.warn('Smart contract not yet deployed. Use deployment script to deploy.');
}

// Method names (must match smart contract)
export const CONTRACT_METHODS = {
  INITIALIZE: 'initialize',
  CREATE_POST: 'create_post',
  STAKE_ON_POST: 'stake_post',
  CHALLENGE_POST: 'challenge_post',
  AI_VERDICT: 'ai_verdict',
  RESOLVE_DISPUTE: 'resolve_dispute',
  CLAIM_REWARDS: 'claim_rewards',
  UPDATE_REPUTATION: 'update_reputation'
} as const;

// Post status enum
export enum PostStatus {
  ACTIVE = 0,
  VERIFIED = 1,
  DISPUTED = 2,
  RESOLVED = 3
}

// Interface definitions
export interface TruthPost {
  id: string;
  content: string;
  creator: string;
  stakeAmount: number;
  timestamp: number;
  status: PostStatus;
  verificationDeadline: number;
  totalSupport: number;
  totalChallenge: number;
  aiVerdict?: boolean;
  finalVerdict?: boolean;
}

export interface UserStats {
  reputation: number;
  totalStaked: number;
  postsCreated: number;
  successfulStakes: number;
}

export interface StakeTransaction {
  postId: string;
  amount: number;
  isChallenge: boolean;
  timestamp: number;
}

// Helper function to encode method calls
function encodeMethodCall(method: string, ...args: any[]): Uint8Array[] {
  const methodArg = new TextEncoder().encode(method);
  const encodedArgs = args.map(arg => {
    if (typeof arg === 'string') {
      return new TextEncoder().encode(arg);
    } else if (typeof arg === 'number') {
      return algosdk.encodeUint64(arg);
    } else if (arg instanceof Uint8Array) {
      return arg;
    } else {
      return new TextEncoder().encode(String(arg));
    }
  });
  
  return [methodArg, ...encodedArgs];
}

// Get box storage key for post data
function getPostBoxKey(postId: string, keySuffix: string): string {
  return `post_${postId}_${keySuffix}`;
}

// Smart Contract Interaction Class
export class TruthStakingContract {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;

  constructor() {
    this.algodClient = createAlgodClient();
    this.indexerClient = createIndexerClient();
  }

  // Check if contract is deployed
  isDeployed(): boolean {
    return SMART_CONTRACT_CONFIG.APP_ID > 0;
  }

  // Get contract status
  async getContractStatus(): Promise<any> {
    if (!this.isDeployed()) {
      throw new Error('Smart contract not deployed');
    }

    try {
      const appInfo = await this.algodClient.getApplicationByID(SMART_CONTRACT_CONFIG.APP_ID).do();
      return {
        id: appInfo.id,
        params: appInfo.params
      };
    } catch (error) {
      console.error('Error getting contract status:', error);
      throw new Error('Failed to get contract status');
    }
  }

  // Opt user into the smart contract
  async optInUser(userAddress: string, privateKey: string): Promise<string> {
    if (!this.isDeployed()) {
      throw new Error('Smart contract not deployed');
    }

    try {
      const suggestedParams = await this.algodClient.getTransactionParams().do();

      const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
        sender: userAddress,
        appIndex: SMART_CONTRACT_CONFIG.APP_ID,
        suggestedParams
      });

      const signedTxn = algosdk.signTransaction(optInTxn, algosdk.mnemonicToSecretKey(privateKey).sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn.blob).do();
      
      await algosdk.waitForConfirmation(this.algodClient, txId.txid, 4);
      return txId.txid;
    } catch (error) {
      console.error('Error opting in user:', error);
      throw new Error('Failed to opt in user');
    }
  }

  // Create a new truth post
  async createTruthPost(
    userAddress: string, 
    privateKey: string, 
    postId: string, 
    content: string, 
    stakeAmount: number
  ): Promise<string> {
    if (!this.isDeployed()) {
      throw new Error('Smart contract not deployed');
    }

    try {
      const suggestedParams = await this.algodClient.getTransactionParams().do();
      
      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: userAddress,
        appIndex: SMART_CONTRACT_CONFIG.APP_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: encodeMethodCall(CONTRACT_METHODS.CREATE_POST, postId, content),
        suggestedParams
      });

      // Create payment transaction for stake
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: userAddress,
        receiver: SMART_CONTRACT_CONFIG.APP_ADDRESS,
        amount: stakeAmount,
        suggestedParams
      });

      // Group transactions
      const txnGroup = [appCallTxn, paymentTxn];
      algosdk.assignGroupID(txnGroup);

      // Sign transactions
      const privateKeyBytes = algosdk.mnemonicToSecretKey(privateKey).sk;
      const signedTxns = txnGroup.map(txn => algosdk.signTransaction(txn, privateKeyBytes));

      // Submit transaction group
      const txId = await this.algodClient.sendRawTransaction(signedTxns.map(s => s.blob)).do();
      await algosdk.waitForConfirmation(this.algodClient, txId.txid, 4);

      return txId.txid;
    } catch (error) {
      console.error('Error creating truth post:', error);
      throw new Error('Failed to create truth post');
    }
  }

  // Stake on an existing post (support)
  async stakeOnPost(
    userAddress: string,
    privateKey: string,
    postId: string,
    stakeAmount: number
  ): Promise<string> {
    if (!this.isDeployed()) {
      throw new Error('Smart contract not deployed');
    }

    try {
      const suggestedParams = await this.algodClient.getTransactionParams().do();

      // Create application call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: userAddress,
        appIndex: SMART_CONTRACT_CONFIG.APP_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: encodeMethodCall(CONTRACT_METHODS.STAKE_ON_POST, postId),
        suggestedParams
      });

      // Create payment transaction for stake
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: userAddress,
        receiver: SMART_CONTRACT_CONFIG.APP_ADDRESS,
        amount: stakeAmount,
        suggestedParams
      });

      // Group and sign transactions
      const txnGroup = [appCallTxn, paymentTxn];
      algosdk.assignGroupID(txnGroup);

      const privateKeyBytes = algosdk.mnemonicToSecretKey(privateKey).sk;
      const signedTxns = txnGroup.map(txn => algosdk.signTransaction(txn, privateKeyBytes));

      // Submit transaction group
      const txId = await this.algodClient.sendRawTransaction(signedTxns.map(s => s.blob)).do();
      await algosdk.waitForConfirmation(this.algodClient, txId.txid, 4);

      return txId.txid;
    } catch (error) {
      console.error('Error staking on post:', error);
      throw new Error('Failed to stake on post');
    }
  }

  // Challenge a post
  async challengePost(
    userAddress: string,
    privateKey: string,
    postId: string,
    challengeAmount: number,
    challengeReason: string
  ): Promise<string> {
    if (!this.isDeployed()) {
      throw new Error('Smart contract not deployed');
    }

    try {
      const suggestedParams = await this.algodClient.getTransactionParams().do();

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: userAddress,
        appIndex: SMART_CONTRACT_CONFIG.APP_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: encodeMethodCall(CONTRACT_METHODS.CHALLENGE_POST, postId, challengeReason),
        suggestedParams
      });

      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: userAddress,
        receiver: SMART_CONTRACT_CONFIG.APP_ADDRESS,
        amount: challengeAmount,
        suggestedParams
      });

      const txnGroup = [appCallTxn, paymentTxn];
      algosdk.assignGroupID(txnGroup);

      const privateKeyBytes = algosdk.mnemonicToSecretKey(privateKey).sk;
      const signedTxns = txnGroup.map(txn => algosdk.signTransaction(txn, privateKeyBytes));

      const txId = await this.algodClient.sendRawTransaction(signedTxns.map(s => s.blob)).do();
      await algosdk.waitForConfirmation(this.algodClient, txId.txid, 4);

      return txId.txid;
    } catch (error) {
      console.error('Error challenging post:', error);
      throw new Error('Failed to challenge post');
    }
  }

  // Submit AI moderator verdict (admin only)
  async submitAIVerdict(
    adminPrivateKey: string,
    postId: string,
    verdict: boolean
  ): Promise<string> {
    if (!this.isDeployed()) {
      throw new Error('Smart contract not deployed');
    }

    try {
      const adminAddress = algosdk.mnemonicToSecretKey(adminPrivateKey).addr;
      const suggestedParams = await this.algodClient.getTransactionParams().do();

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: adminAddress,
        appIndex: SMART_CONTRACT_CONFIG.APP_ID,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: encodeMethodCall(CONTRACT_METHODS.AI_VERDICT, postId, verdict ? 1 : 0),
        suggestedParams
      });

      const signedTxn = algosdk.signTransaction(appCallTxn, algosdk.mnemonicToSecretKey(adminPrivateKey).sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn.blob).do();
      await algosdk.waitForConfirmation(this.algodClient, txId.txid, 4);

      return txId.txid;
    } catch (error) {
      console.error('Error submitting AI verdict:', error);
      throw new Error('Failed to submit AI verdict');
    }
  }

  // Get user statistics from local state (simplified)
  async getUserStats(userAddress: string): Promise<UserStats> {
    if (!this.isDeployed()) {
      return {
        reputation: 500,
        totalStaked: 0,
        postsCreated: 0,
        successfulStakes: 0
      };
    }

    try {
      const accountInfo = await this.algodClient.accountInformation(userAddress).do();
      // Simplified - return default stats for now
      // In production, would parse local state from accountInfo
      
      return {
        reputation: 500, // Default neutral score
        totalStaked: 0,
        postsCreated: 0,
        successfulStakes: 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        reputation: 500,
        totalStaked: 0,
        postsCreated: 0,
        successfulStakes: 0
      };
    }
  }

  // Get post data from box storage (placeholder)
  async getPost(postId: string): Promise<TruthPost | null> {
    if (!this.isDeployed()) {
      throw new Error('Smart contract not deployed');
    }

    try {
      // Placeholder implementation
      // In production, would read from box storage using algodClient.getApplicationBoxByName()
      return null;
    } catch (error) {
      console.error('Error getting post:', error);
      return null;
    }
  }

  // Get contract global state (simplified)
  async getGlobalState(): Promise<any> {
    if (!this.isDeployed()) {
      throw new Error('Smart contract not deployed');
    }

    try {
      const appInfo = await this.algodClient.getApplicationByID(SMART_CONTRACT_CONFIG.APP_ID).do();
      // Return simplified state
      return {
        totalStakes: 0,
        totalPosts: 0,
        contractBalance: 0
      };
    } catch (error) {
      console.error('Error getting global state:', error);
      throw new Error('Failed to get global state');
    }
  }

  // Check if user is opted into the contract
  async isUserOptedIn(userAddress: string): Promise<boolean> {
    if (!this.isDeployed()) {
      return false;
    }

    try {
      const accountInfo = await this.algodClient.accountInformation(userAddress).do();
      // Simplified check
      return true; // Placeholder
    } catch (error) {
      return false;
    }
  }

  // Get transaction history for truth staking (simplified)
  async getUserStakeHistory(userAddress: string, limit: number = 50): Promise<StakeTransaction[]> {
    try {
      // Simplified implementation - return empty array for now
      // In production, would query indexer for application transactions
      return [];
    } catch (error) {
      console.error('Error getting stake history:', error);
      return [];
    }
  }
}

// Export singleton instance
export const truthStakingContract = new TruthStakingContract();

// Utility functions
export function formatReputationScore(score: number): string {
  return `${(score / 10).toFixed(1)}/100`;
}

export function getPostStatusText(status: PostStatus): string {
  switch (status) {
    case PostStatus.ACTIVE:
      return 'Active';
    case PostStatus.VERIFIED:
      return 'Verified';
    case PostStatus.DISPUTED:
      return 'Disputed';
    case PostStatus.RESOLVED:
      return 'Resolved';
    default:
      return 'Unknown';
  }
}

export function getPostStatusColor(status: PostStatus): string {
  switch (status) {
    case PostStatus.ACTIVE:
      return 'text-blue-400';
    case PostStatus.VERIFIED:
      return 'text-green-400';
    case PostStatus.DISPUTED:
      return 'text-yellow-400';
    case PostStatus.RESOLVED:
      return 'text-purple-400';
    default:
      return 'text-gray-400';
  }
} 