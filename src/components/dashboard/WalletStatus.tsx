import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../lib/auth';

export function WalletStatus() {
  const { user, walletConnected, walletAddress } = useAuth();

  if (!user) return null;

  // Get wallet info from user profile for accuracy
  const profileWalletConnected = user.profile?.wallet_connected || false;
  const profileWalletAddress = user.profile?.algo_address;
  
  // Use profile data as source of truth
  const isConnected = profileWalletConnected && profileWalletAddress;
  const displayAddress = profileWalletAddress;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
        isConnected
          ? 'bg-green-500/10 text-green-400 border-green-500/20'
          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      }`}
    >
      <Wallet className="w-4 h-4" />
      <div className="flex-1 min-w-0">
        <div className="font-medium">
          {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
        </div>
        {isConnected && displayAddress && (
          <div className="text-xs opacity-75 truncate">
            {displayAddress.slice(0, 8)}...{displayAddress.slice(-6)}
          </div>
        )}
      </div>
      {isConnected ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
    </motion.div>
  );
} 