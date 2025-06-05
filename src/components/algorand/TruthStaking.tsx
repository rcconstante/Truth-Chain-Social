import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Coins, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useToast } from '../ui/use-toast';
import { 
  createPostTransaction, 
  submitTransaction, 
  ALGORAND_CONFIG 
} from '../../lib/algorand';

interface TruthStakingProps {
  walletAddress: string | null;
  walletBalance: number;
  peraWallet: any;
  onPostCreated?: (postData: any) => void;
}

// Temporary escrow address for demo (in production, this would be a smart contract)
const ESCROW_ADDRESS = 'TESTNET7RGGWDX6JTHC2QO5PD3QF2QMX4YF2QJF2QJF2QJF2QJF2QJF2A';

export function TruthStaking({ 
  walletAddress, 
  walletBalance, 
  peraWallet, 
  onPostCreated 
}: TruthStakingProps) {
  const [content, setContent] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const minStake = 1; // Minimum 1 ALGO stake
  const maxLength = 280; // Twitter-like character limit

  const isValidStake = () => {
    const amount = parseFloat(stakeAmount);
    return amount >= minStake && amount <= walletBalance - 0.1; // Leave 0.1 ALGO for fees
  };

  const isValidContent = () => {
    return content.trim().length > 0 && content.length <= maxLength;
  };

  const canSubmit = () => {
    return walletAddress && isValidContent() && isValidStake() && !isSubmitting;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit()) return;

    setIsSubmitting(true);

    try {
      // Create the transaction
      const txn = await createPostTransaction(
        walletAddress!,
        ESCROW_ADDRESS,
        parseFloat(stakeAmount),
        content.trim()
      );

      // Sign with Pera Wallet
      const signedTxns = await peraWallet.signTransaction([txn] as any);
      
      // Submit to blockchain
      const result = await submitTransaction(signedTxns[0]);

      // Create post data for local state
      const postData = {
        id: result.txId,
        content: content.trim(),
        author: walletAddress,
        stakeAmount: parseFloat(stakeAmount),
        totalStaked: parseFloat(stakeAmount),
        verifications: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        txId: result.txId,
        explorerUrl: result.explorerUrl
      };

      // Notify parent component
      onPostCreated?.(postData);

      // Success feedback
      toast({
        title: "Truth Post Created!",
        description: `Staked ${stakeAmount} ALGO on your truth claim.`,
      });

      // Reset form
      setContent('');
      setStakeAmount('');

    } catch (error: any) {
      console.error('Error creating post:', error);
      
      let errorMessage = 'Failed to create post. Please try again.';
      if (error.message?.includes('cancelled')) {
        errorMessage = 'Transaction was cancelled.';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance for this transaction.';
      }

      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStakeColor = () => {
    const amount = parseFloat(stakeAmount);
    if (!stakeAmount) return 'text-gray-400';
    if (amount < minStake) return 'text-red-400';
    if (amount > walletBalance - 0.1) return 'text-red-400';
    return 'text-green-400';
  };

  if (!walletAddress) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Coins className="w-12 h-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Wallet Required</h3>
          <p className="text-gray-400">
            Connect your Pera Wallet to create truth posts with ALGO stakes
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Coins className="w-5 h-5 text-blue-400" />
          Create Truth Post
        </CardTitle>
        <p className="text-sm text-gray-400">
          Stake ALGO tokens on your truth claim. Higher stakes show confidence.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Input */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-200">
              Your Truth Claim
            </Label>
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share a factual statement that others can verify..."
                className="w-full h-32 p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                maxLength={maxLength}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {content.length}/{maxLength}
              </div>
            </div>
          </div>

          {/* Stake Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="stake" className="text-gray-200">
              Stake Amount (ALGO)
            </Label>
            <div className="relative">
              <Input
                id="stake"
                type="number"
                step="0.1"
                min={minStake}
                max={walletBalance - 0.1}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder={`Minimum ${minStake} ALGO`}
                className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className={`text-sm font-medium ${getStakeColor()}`}>
                  ALGO
                </span>
              </div>
            </div>
            
            {/* Stake Validation Messages */}
            <AnimatePresence>
              {stakeAmount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  {parseFloat(stakeAmount) < minStake && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Minimum stake is {minStake} ALGO
                    </p>
                  )}
                  {parseFloat(stakeAmount) > walletBalance - 0.1 && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Insufficient balance (need {0.1} ALGO for fees)
                    </p>
                  )}
                  {isValidStake() && (
                    <p className="text-sm text-green-400">
                      ✓ Valid stake amount
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Balance Display */}
          <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-400">Available Balance:</span>
            <span className="text-sm font-medium text-white">
              {walletBalance.toFixed(6)} ALGO
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!canSubmit()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Creating Post...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Stake & Post Truth
              </div>
            )}
          </Button>

          {/* Info Panel */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-200 mb-2">How it works:</h4>
            <ul className="text-xs text-blue-300/80 space-y-1">
              <li>• Your ALGO stake shows confidence in your claim</li>
              <li>• Others can verify or challenge your post by staking</li>
              <li>• Accurate claims earn rewards, false ones lose stakes</li>
              <li>• All transactions are recorded on Algorand blockchain</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 