import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ExternalLink, RefreshCw, Copy, AlertCircle } from 'lucide-react';
import { PeraWalletConnect } from '@perawallet/connect';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useToast } from '../ui/use-toast';
import { 
  getAccountInfo, 
  formatAddress, 
  formatBalance, 
  ALGORAND_CONFIG 
} from '../../lib/algorand';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import AlgorandService from '../../lib/algorand-service';

// Initialize Pera Wallet
const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: false,
});

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  isLoading: boolean;
}

interface AlgorandWalletProps {
  onAccountChange?: (address: string | null) => void;
  className?: string;
}

export function AlgorandWallet({ onAccountChange, className }: AlgorandWalletProps) {
  const { user } = useAuth();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    isLoading: false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Auto-refresh balance every 30 seconds when connected
  useEffect(() => {
    if (walletState.isConnected && walletState.address) {
      const interval = setInterval(() => {
        refreshBalance();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [walletState.isConnected, walletState.address]);

  // Listen for wallet events
  useEffect(() => {
    // Set up disconnect handler
    if (peraWallet.connector) {
      peraWallet.connector.on('disconnect', handleDisconnect);
    }
  }, []);

  // Enhanced refresh balance function
  const refreshBalance = async () => {
    if (!walletState.address || !user?.id) return;
    
    setWalletState(prev => ({ ...prev, isLoading: true }));
    try {
      console.log('🔄 Refreshing wallet balance...');
      
      // Get real balance from blockchain
      const realBalance = await AlgorandService.getAccountBalance(walletState.address);
      console.log(`📊 Real blockchain balance: ${realBalance} ALGO`);
      
      // Sync with database
      const syncResult = await AlgorandService.syncWalletBalance(user.id, walletState.address);
      
      if (syncResult.success) {
        // Update local state with synced balance
        setWalletState(prev => ({
          ...prev,
          balance: syncResult.balance
        }));
        
        // Trigger global balance refresh for other components
        window.dispatchEvent(new CustomEvent('walletBalanceUpdated', { 
          detail: { balance: syncResult.balance, address: walletState.address } 
        }));
        
        console.log(`✅ Balance refreshed: ${syncResult.balance} ALGO`);
        
        toast({
          title: "✅ Balance Updated",
          description: `Current balance: ${syncResult.balance.toFixed(3)} ALGO`,
        });
      } else {
        console.error('❌ Failed to sync balance:', syncResult.error);
        toast({
          title: "❌ Sync Failed",
          description: syncResult.error || "Failed to refresh balance",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error refreshing balance:', error);
      toast({
        title: "❌ Refresh Failed",
        description: "Could not refresh wallet balance",
        variant: "destructive"
      });
    } finally {
      setWalletState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Listen for transaction completion events
  useEffect(() => {
    const handleTransactionComplete = () => {
      console.log('🔔 Transaction completed, refreshing balance...');
      refreshBalance();
    };

    const handleWalletUpdate = (event: any) => {
      if (event.detail?.balance !== undefined) {
        setWalletState(prev => ({ ...prev, balance: event.detail.balance }));
      }
    };

    window.addEventListener('transactionCompleted', handleTransactionComplete);
    window.addEventListener('walletBalanceUpdated', handleWalletUpdate);

    return () => {
      window.removeEventListener('transactionCompleted', handleTransactionComplete);
      window.removeEventListener('walletBalanceUpdated', handleWalletUpdate);
    };
  }, []);

  // Auto-refresh balance periodically
  useEffect(() => {
    if (!walletState.address || !user?.id) return;

    // Initial load
    refreshBalance();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(refreshBalance, 30000);

    return () => clearInterval(interval);
  }, [walletState.address, user?.id]);

  const checkConnection = async () => {
    try {
      const accounts = await peraWallet.reconnectSession();
      if (accounts.length > 0) {
        await handleAccountConnected(accounts[0]);
      }
    } catch (error) {
      console.log('No existing session found');
    }
  };

  const handleAccountConnected = async (address: string) => {
    setWalletState(prev => ({ ...prev, isLoading: true, address }));
    
    try {
      const accountInfo = await getAccountInfo(address);
      setWalletState({
        isConnected: true,
        address,
        balance: accountInfo.balance,
        isLoading: false
      });
      
      onAccountChange?.(address);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${formatAddress(address)}`,
      });
    } catch (error) {
      console.error('Error fetching account info:', error);
      setWalletState(prev => ({ 
        ...prev, 
        isLoading: false,
        balance: 0 
      }));
      
      toast({
        title: "Connection Warning",
        description: "Wallet connected but couldn't fetch balance. Please try refreshing.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: 0,
      isLoading: false
    });
    onAccountChange?.(null);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      const accounts = await peraWallet.connect();
      if (accounts.length > 0) {
        await handleAccountConnected(accounts[0]);
      }
    } catch (error: any) {
      console.error('Connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    peraWallet.disconnect();
    handleDisconnect();
  };

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const openFaucet = () => {
    window.open(ALGORAND_CONFIG.faucet, '_blank');
  };

  const handleManualRefresh = () => {
    refreshBalance();
  };

  if (!walletState.isConnected) {
    return (
      <Card className={`bg-gray-900/50 border-gray-700 ${className}`}>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-white">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-400 text-sm">
            Connect your Pera Wallet to start staking on truth posts
          </div>
          
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Connecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Connect Pera Wallet
              </div>
            )}
          </Button>
          
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Testnet</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gray-900/50 border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            Connected
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnectWallet}
            className="text-gray-400 hover:text-white"
          >
            Disconnect
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Address Display */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Wallet Address</label>
          <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
            <span className="font-mono text-sm text-white">
              {formatAddress(walletState.address!)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">ALGO Balance</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={walletState.balance}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-bold text-white"
            >
              {formatBalance(walletState.balance)} ALGO
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Low Balance Warning */}
        {walletState.balance < 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <div className="text-sm">
              <p className="text-yellow-200">Low balance detected</p>
              <p className="text-yellow-300/80">Get testnet ALGO from the faucet</p>
            </div>
          </motion.div>
        )}

        {/* Testnet Faucet Link */}
        <Button
          variant="outline"
          onClick={openFaucet}
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Get Testnet ALGO
        </Button>
        
        {/* Network Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-700">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-400">Algorand Testnet</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for using wallet state in other components
export function useAlgorandWallet() {
  const [address, setAddress] = useState<string | null>(null);
  
  return {
    address,
    setAddress,
    isConnected: !!address,
    peraWallet
  };
} 