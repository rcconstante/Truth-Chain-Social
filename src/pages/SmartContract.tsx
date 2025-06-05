import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Coins, TrendingUp, AlertCircle } from 'lucide-react';
import { TruthStakingContract } from '../components/smart-contract/TruthStakingContract';
import { AlgorandWallet } from '../components/algorand/AlgorandWallet';
import { getAccountInfo, formatBalance } from '../lib/algorand';

export function SmartContract() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Load balance when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      loadWalletBalance();
    } else {
      setWalletBalance(0);
    }
  }, [walletAddress]);

  const loadWalletBalance = async () => {
    if (!walletAddress) return;
    
    setIsLoadingBalance(true);
    try {
      const accountInfo = await getAccountInfo(walletAddress);
      setWalletBalance(accountInfo.balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      setWalletBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleAccountChange = (address: string | null) => {
    setWalletAddress(address);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      {/* Bolt.new Badge */}
      <a 
        href="https://bolt.new" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed top-4 right-4 z-50 hover:scale-110 transition-all duration-300 group"
      >
        <div className="relative">
          <img
            src="/white_circle_360x360.png"
            alt="Bolt.new"
            className="w-16 h-16 drop-shadow-2xl group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse scale-110"></div>
        </div>
      </a>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Smart Contract Interface</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Stake ALGO tokens on truth claims, challenge false information, and earn rewards through 
            our decentralized verification system powered by Algorand blockchain.
          </p>
        </motion.div>

        {/* Wallet Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <AlgorandWallet 
            onAccountChange={handleAccountChange}
            className="max-w-md mx-auto"
          />
        </motion.div>

        {/* Wallet Status */}
        {walletAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold">Wallet Connected</h3>
                    <p className="text-gray-400 text-sm">
                      {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {isLoadingBalance ? '...' : formatBalance(walletBalance)}
                  </div>
                  <div className="text-gray-400 text-sm">Available Balance</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Smart Contract Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TruthStakingContract 
            userAddress={walletAddress || undefined}
            walletBalance={walletBalance} // Already in microAlgos from getAccountInfo
            className="mb-8"
          />
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <Shield className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Secure & Transparent</h3>
            <p className="text-gray-400 text-sm">
              All transactions are recorded on the Algorand blockchain, ensuring complete transparency 
              and immutability of truth staking activities.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">Earn Rewards</h3>
            <p className="text-gray-400 text-sm">
              Stake on true claims and challenge false ones to earn ALGO rewards. Build your reputation 
              through accurate truth verification.
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <AlertCircle className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
            <p className="text-gray-400 text-sm">
              Our integrated Tavus and ElevenLabs AI moderators provide additional verification, 
              ensuring fair dispute resolution.
            </p>
          </div>
        </motion.div>

        {/* Getting Started Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 border border-blue-700/50"
        >
          <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Getting Started with Truth Staking
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">1</div>
              <h4 className="text-white font-medium mb-1">Connect Wallet</h4>
              <p className="text-gray-300 text-sm">Connect your Algorand wallet to start interacting with the smart contract</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">2</div>
              <h4 className="text-white font-medium mb-1">Opt-In</h4>
              <p className="text-gray-300 text-sm">Opt-in to the TruthChain smart contract to enable staking features</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">3</div>
              <h4 className="text-white font-medium mb-1">Create Posts</h4>
              <p className="text-gray-300 text-sm">Submit truth claims with ALGO stakes to build your reputation</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto">4</div>
              <h4 className="text-white font-medium mb-1">Earn Rewards</h4>
              <p className="text-gray-300 text-sm">Stake on true claims and challenge false ones to earn ALGO rewards</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 