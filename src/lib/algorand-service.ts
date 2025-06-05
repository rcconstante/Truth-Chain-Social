import { PeraWalletConnect } from '@perawallet/connect';
import { supabase } from './supabase';
import AlgorandBlockchainService from './algorand-blockchain';

const ALGORAND_TESTNET_API = 'https://testnet-api.algonode.cloud';

interface AlgorandAccount {
  address: string;
  amount: number; // microAlgos
  'min-balance': number;
  'apps-total-extra-pages'?: number;
  'apps-total-schema'?: any;
  assets?: any[];
  'created-apps'?: any[];
  'created-assets'?: any[];
  participation?: any;
  'reward-base'?: number;
  rewards?: number;
  round: number;
  status: string;
  'total-apps-opted-in'?: number;
  'total-assets-opted-in'?: number;
  'total-box-bytes'?: number;
  'total-boxes'?: number;
}

// Enhanced Algorand Service for better sync
class AlgorandService {
  private static instance: AlgorandService;
  private peraWallet: PeraWalletConnect | null = null;

  constructor() {
    this.initializeWallet();
  }

  static getInstance(): AlgorandService {
    if (!AlgorandService.instance) {
      AlgorandService.instance = new AlgorandService();
    }
    return AlgorandService.instance;
  }

  private initializeWallet() {
    try {
      this.peraWallet = new PeraWalletConnect({
        shouldShowSignTxnToast: false,
      });
    } catch (error) {
      console.error('Failed to initialize Pera Wallet:', error);
    }
  }

  // Enhanced balance sync with event broadcasting
  async syncWalletBalance(userId: string, walletAddress: string): Promise<{
    success: boolean;
    balance: number;
    error?: string;
  }> {
    try {
      console.log('🔄 Syncing wallet balance for:', walletAddress);
      
      // Get real blockchain balance
      const realBalance = await this.getAccountBalance(walletAddress);
      console.log(`📊 Blockchain balance: ${realBalance} ALGO`);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          algo_balance: realBalance,
          wallet_address: walletAddress,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Broadcast balance update event
      this.broadcastBalanceUpdate(realBalance, walletAddress);

      return {
        success: true,
        balance: realBalance
      };
    } catch (error) {
      console.error('❌ Balance sync failed:', error);
      return {
        success: false,
        balance: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Enhanced transaction processing with sync
  async processTransaction(userId: string, transaction: {
    type: 'verification_stake' | 'challenge_stake' | 'reward' | 'refund';
    amount: number;
    post_id?: string;
    description: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Processing transaction:', transaction);

      // Insert transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: transaction.type,
          amount: transaction.amount,
          status: 'completed',
          description: transaction.description,
          related_post_id: transaction.post_id,
          created_at: new Date().toISOString()
        });

      if (txError) {
        throw txError;
      }

      // Update user's total stakes if it's a staking transaction
      if (['verification_stake', 'challenge_stake'].includes(transaction.type)) {
        await this.updateUserTotalStakes(userId);
      }

      // Broadcast transaction completion
      this.broadcastTransactionComplete();

      return { success: true };
    } catch (error) {
      console.error('❌ Transaction processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update user's total stakes based on transaction history
  private async updateUserTotalStakes(userId: string): Promise<void> {
    try {
      // Calculate total stakes from transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .in('type', ['verification_stake', 'challenge_stake'])
        .eq('status', 'completed');

      const totalStakes = transactions?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

      // Update profile
      await supabase
        .from('profiles')
        .update({ total_stakes: totalStakes })
        .eq('id', userId);

      console.log(`✅ Updated total stakes for user ${userId}: ${totalStakes} ALGO`);
    } catch (error) {
      console.error('❌ Failed to update total stakes:', error);
    }
  }

  // Broadcast events for real-time updates
  private broadcastBalanceUpdate(balance: number, address: string): void {
    const event = new CustomEvent('walletBalanceUpdated', {
      detail: { balance, address }
    });
    window.dispatchEvent(event);
    console.log('📡 Broadcasted balance update:', { balance, address });
  }

  private broadcastTransactionComplete(): void {
    const event = new CustomEvent('transactionCompleted');
    window.dispatchEvent(event);
    console.log('📡 Broadcasted transaction completion');
  }

  // Get account balance from Algorand blockchain
  async getAccountBalance(address: string): Promise<number> {
    try {
      // For demo purposes, return a simulated balance
      // In production, this would call the actual Algorand API
      const simulatedBalance = Math.random() * 1000 + 100; // 100-1100 ALGO
      console.log(`💰 Account ${address} balance: ${simulatedBalance.toFixed(3)} ALGO`);
      return parseFloat(simulatedBalance.toFixed(3));
    } catch (error) {
      console.error('❌ Failed to get account balance:', error);
      return 0;
    }
  }

  // Force refresh all components
  async forceGlobalRefresh(userId?: string): Promise<void> {
    try {
      console.log('🔄 Forcing global refresh...');
      
      if (userId) {
        // Get user's wallet address
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', userId)
          .single();

        if (profile?.wallet_address) {
          await this.syncWalletBalance(userId, profile.wallet_address);
        }
      }

      // Broadcast multiple update events
      this.broadcastTransactionComplete();
      window.dispatchEvent(new CustomEvent('globalRefreshRequired'));
      
      console.log('✅ Global refresh completed');
    } catch (error) {
      console.error('❌ Global refresh failed:', error);
    }
  }

  // Sync user reputation and accuracy
  async syncUserReputation(userId: string): Promise<void> {
    try {
      // Get user's verification history
      const { data: verifications } = await supabase
        .from('post_verifications')
        .select('verification_type, created_at')
        .eq('verifier_id', userId);

      const totalVerifications = verifications?.length || 0;
      const successfulVerifications = verifications?.filter(v => v.verification_type === 'support').length || 0;
      
      const accuracy = totalVerifications > 0 ? successfulVerifications / totalVerifications : 1.0;
      const reputation = Math.min(1000, 100 + (totalVerifications * 5) + (accuracy * 200));

      // Update profile
      await supabase
        .from('profiles')
        .update({
          accuracy_rate: accuracy,
          reputation_score: Math.round(reputation)
        })
        .eq('id', userId);

      console.log(`✅ Updated reputation for user ${userId}: ${reputation} (${(accuracy * 100).toFixed(1)}% accuracy)`);
    } catch (error) {
      console.error('❌ Failed to sync user reputation:', error);
    }
  }

  /**
   * Connect wallet WITHOUT automatic balance syncing
   */
  static async connectWallet(userId: string, walletAddress: string): Promise<{ 
    success: boolean; 
    error?: string; 
  }> {
    try {
      // Validate address
      if (!this.isValidAlgorandAddress(walletAddress)) {
        return { 
          success: false, 
          error: 'Invalid Algorand address format' 
        };
      }

      // Update database WITHOUT changing balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          algo_address: walletAddress,
          wallet_connected: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Database update error:', updateError);
        return { 
          success: false, 
          error: `Failed to update database: ${updateError.message}` 
        };
      }

      console.log(`✅ Wallet connected successfully: ${walletAddress} (balance preserved)`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error connecting wallet:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to connect wallet' 
      };
    }
  }

  /**
   * Check if user has sufficient balance for staking - READ ONLY
   */
  static async canUserStake(userId: string, amount: number): Promise<{ 
    canStake: boolean; 
    currentBalance: number; 
    error?: string; 
  }> {
    try {
      // Get user's current balance from database ONLY
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('algo_balance')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return { canStake: false, currentBalance: 0, error: 'User profile not found' };
      }

      // Use database balance only - no syncing
      const databaseBalance = profile.algo_balance || 0;

      return {
        canStake: databaseBalance >= amount,
        currentBalance: databaseBalance
      };
    } catch (error: any) {
      console.error('❌ Error checking stake ability:', error);
      return { 
        canStake: false, 
        currentBalance: 0, 
        error: error.message || 'Failed to check balance' 
      };
    }
  }

  /**
   * Process staking transaction WITHOUT changing wallet balance
   */
  static async processStake(
    userId: string, 
    postId: string, 
    amount: number, 
    type: 'verification' | 'challenge'
  ): Promise<{ success: boolean; error?: string; txId?: string; newBalance?: number }> {
    try {
      console.log(`🔥 Processing ${type} stake: ${amount} ALGO for user ${userId} (balance preserved)`);
      
      // Get user's wallet address
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('algo_balance, algo_address')
        .eq('id', userId)
        .single();

      if (fetchError || !profile) {
        return { success: false, error: 'Failed to fetch user profile' };
      }

      if (!profile.algo_address) {
        return { success: false, error: 'No wallet connected. Please connect your Algorand wallet first.' };
      }

      // Check if user has sufficient balance in database
      const databaseBalance = profile.algo_balance || 0;
      if (databaseBalance < amount) {
        return {
          success: false,
          error: `Insufficient balance. You have ${databaseBalance.toFixed(3)} ALGO but need ${amount} ALGO`
        };
      }

      console.log(`💰 Database balance: ${databaseBalance} ALGO - sufficient for ${amount} ALGO stake`);

      // 🚀 SEND BLOCKCHAIN TRANSACTION (simulation mode)
      console.log('🚀 Initiating blockchain transaction...');
      const blockchainResult = await AlgorandBlockchainService.sendStakeTransaction(
        profile.algo_address,
        amount,
        postId,
        type
      );

      if (!blockchainResult.success) {
        return {
          success: false,
          error: blockchainResult.error || 'Blockchain transaction failed'
        };
      }

      console.log(`✅ Blockchain transaction successful! TxID: ${blockchainResult.txId}`);
      
      // 💰 DEDUCT FROM DATABASE BALANCE ONLY
      const newDatabaseBalance = databaseBalance - amount;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          algo_balance: newDatabaseBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.warn('⚠️ Failed to update database balance:', updateError);
      } else {
        console.log(`✅ Database balance updated: ${newDatabaseBalance} ALGO`);
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: type === 'verification' ? 'verification_stake' : 'challenge_stake',
          amount: -amount,
          status: 'completed',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} stake for post - TxID: ${blockchainResult.txId}`,
          related_post_id: postId,
          blockchain_tx_id: blockchainResult.txId,
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        console.warn('⚠️ Failed to record transaction in database:', transactionError);
      }

      console.log(`🎯 STAKE COMPLETED! New database balance: ${newDatabaseBalance} ALGO | TxID: ${blockchainResult.txId}`);
      
      return { 
        success: true, 
        txId: blockchainResult.txId,
        newBalance: newDatabaseBalance
      };

    } catch (error: any) {
      console.error('❌ Error processing stake:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to process stake' 
      };
    }
  }

  /**
   * Validate Algorand address format
   */
  static isValidAlgorandAddress(address: string): boolean {
    // Basic Algorand address validation
    // Real implementation should use proper Algorand SDK validation
    return address.length === 58 && /^[A-Z2-7]+$/.test(address);
  }

  /**
   * Get testnet faucet URL for funding
   */
  static getTestnetFaucetUrl(): string {
    return 'https://testnet.algoexplorer.io/dispenser';
  }

  /**
   * Format ALGO amount for display
   */
  static formatAlgoAmount(amount: number, decimals: number = 3): string {
    return amount.toFixed(decimals);
  }

  /**
   * Validate and format stake amount
   */
  static validateStakeAmount(amount: string): { isValid: boolean; numericAmount: number; error?: string } {
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount)) {
      return { isValid: false, numericAmount: 0, error: 'Invalid amount format' };
    }
    
    if (numericAmount <= 0) {
      return { isValid: false, numericAmount: 0, error: 'Amount must be greater than 0' };
    }
    
    if (numericAmount < 0.1) {
      return { isValid: false, numericAmount: 0, error: 'Minimum stake is 0.1 ALGO' };
    }
    
    if (numericAmount > 1000) {
      return { isValid: false, numericAmount: 0, error: 'Maximum stake is 1000 ALGO' };
    }
    
    return { isValid: true, numericAmount };
  }
}

// Export singleton instance
const algorandServiceInstance = AlgorandService.getInstance();

// Export both the class (for static methods) and instance (for instance methods)
export { AlgorandService as AlgorandServiceClass };
export default algorandServiceInstance; 