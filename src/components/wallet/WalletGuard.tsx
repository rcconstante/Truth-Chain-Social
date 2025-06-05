import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, AlertTriangle, Shield, Coins } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAlgorandWallet } from '../algorand/AlgorandWallet';
import { useAuth } from '../../lib/auth';
import { useToast } from '../ui/use-toast';

interface WalletGuardProps {
  children: React.ReactNode;
  action?: string;
  showOverlay?: boolean;
  onWalletConnect?: () => void;
}

export function WalletGuard({ 
  children, 
  action = "perform this action",
  showOverlay = true,
  onWalletConnect 
}: WalletGuardProps) {
  const { isConnected, address, peraWallet } = useAlgorandWallet();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user has wallet linked in their profile
  const hasLinkedWallet = user?.profile?.algo_address;
  
  // User can proceed if they have a linked wallet OR if wallet is currently connected
  const canProceed = hasLinkedWallet || (isConnected && address);

  const handleConnect = async () => {
    try {
      const accounts = await peraWallet.connect();
      if (accounts.length > 0) {
        onWalletConnect?.();
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to your Algorand wallet",
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  // If user can proceed, render children
  if (canProceed) {
    return <>{children}</>;
  }

  // If not showing overlay, return null (don't render anything)
  if (!showOverlay) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="wallet-required-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Card className="bg-gray-900/95 border-gray-700/50 backdrop-blur-xl max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white text-xl">
                Wallet Connection Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-300">
                <p className="mb-4">
                  You need to connect your Algorand wallet to {action}.
                </p>
                
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <Shield className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">Secure & Decentralized</div>
                      <div className="text-xs text-gray-400">Your keys, your control</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <Coins className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">ALGO Testnet</div>
                      <div className="text-xs text-gray-400">Safe testing environment</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">Truth Verification</div>
                      <div className="text-xs text-gray-400">Stake ALGO on truthful content</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleConnect}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Algorand Wallet
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By connecting, you agree to our terms and can start earning rewards for verified truth.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Higher-order component for protecting components that require wallet
export function withWalletGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  action?: string
) {
  return function WalletGuardedComponent(props: P) {
    return (
      <WalletGuard action={action}>
        <WrappedComponent {...props} />
      </WalletGuard>
    );
  };
} 