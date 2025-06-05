import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet as WalletIcon, Send, ArrowDownLeft, ArrowUpRight, 
  Copy, ExternalLink, RefreshCw, Settings, QrCode,
  TrendingUp, TrendingDown, Clock, CheckCircle, XCircle,
  Coins, Target, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { AlgorandWallet, useAlgorandWallet } from '../../components/algorand/AlgorandWallet';
import { useToast } from '../../components/ui/use-toast';
import { supabase } from '../../lib/supabase';
import AlgorandService from '../../lib/algorand-service';
import { useAuth } from '../../lib/auth';

interface Transaction {
  id: string;
  type: 'verification_stake' | 'challenge_stake' | 'reward' | 'refund' | 'send' | 'receive';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  description: string;
  related_post_id?: string;
}

export function Wallet() {
  const { address, isConnected, peraWallet } = useAlgorandWallet();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showConnectFirst, setShowConnectFirst] = useState(false);
  const { toast } = useToast();

  // Check for Pera wallet connection on mount
  useEffect(() => {
    checkPeraConnection();
  }, []);

  const checkPeraConnection = async () => {
    try {
      // Check if Pera wallet is connected
      const accounts = await peraWallet?.reconnectSession?.() || [];
      if (accounts.length === 0 && !isConnected) {
        setShowConnectFirst(true);
      } else {
        setShowConnectFirst(false);
      }
    } catch (error) {
      setShowConnectFirst(true);
    }
  };

  // Fetch wallet balance when address changes
  useEffect(() => {
    if (address && isConnected) {
      fetchWalletBalance();
      setShowConnectFirst(false);
    }
  }, [address, isConnected]);

  // Load user transactions and profile
  useEffect(() => {
    if (user?.id && isConnected) {
      loadTransactions();
      loadUserProfile();
    }
  }, [user, isConnected]);

  const loadUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const fetchWalletBalance = async () => {
    if (!address) return;
    
    try {
      const balance = await AlgorandService.getAccountBalance(address);
      setWalletBalance(balance);
      
      // Update database with real-time balance
      if (user?.id) {
        await supabase
          .from('profiles')
          .update({ algo_balance: balance })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const loadTransactions = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      toast({
        title: "Address copied!",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        fetchWalletBalance(),
        loadTransactions(),
        loadUserProfile()
      ]);
      
      toast({
        title: "Wallet refreshed",
        description: "Latest data has been fetched",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to fetch latest data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTransactionIcon = (type: string, amount: number) => {
    switch (type) {
      case 'verification_stake':
        return <Shield className="w-4 h-4 text-green-400" />;
      case 'challenge_stake':
        return <Target className="w-4 h-4 text-orange-400" />;
      case 'reward':
        return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'refund':
        return <ArrowDownLeft className="w-4 h-4 text-blue-400" />;
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      default:
        return <Coins className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalBalance = walletBalance || profile?.algo_balance || 0;
  const totalStaked = transactions
    .filter(tx => (tx.type === 'verification_stake' || tx.type === 'challenge_stake') && tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const totalEarned = transactions
    .filter(tx => tx.type === 'reward' && tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  // If Pera wallet not connected, show connection prompt
  if (showConnectFirst || !isConnected) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <WalletIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Connect Your Pera Wallet</h1>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              To access your TruthChain wallet features, you need to connect your Pera Algorand wallet first. 
              This ensures secure transaction handling and real-time balance synchronization.
            </p>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-yellow-400" />
                <h3 className="text-yellow-300 font-semibold">Security Notice</h3>
              </div>
              <p className="text-yellow-200 text-sm">
                TruthChain requires Pera Wallet for secure Algorand transactions. 
                Make sure you have the Pera Wallet extension installed and create an account before proceeding.
              </p>
            </div>

            <div className="space-y-4">
              <AlgorandWallet 
                onAccountChange={(address) => {
                  if (address) {
                    setShowConnectFirst(false);
                    toast({
                      title: "Wallet Connected!",
                      description: "You can now access all wallet features.",
                    });
                  }
                }}
                className="max-w-md mx-auto"
              />
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <span>Need Pera Wallet?</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://perawallet.app/', '_blank')}
                  className="border-gray-600"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Download Pera Wallet
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <WalletIcon className="w-6 h-6 text-blue-400" />
              Wallet & Transactions
            </h1>
            <p className="text-gray-400 mt-1">Manage your ALGO and track all transactions</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-gray-800/50 border-gray-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800/50 border-gray-600"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Wallet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {totalBalance.toFixed(6)} ALGO
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  ≈ ${(totalBalance * 0.35).toFixed(2)} USD
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {totalEarned.toFixed(6)} ALGO
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  From truth verification rewards
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Staked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {totalStaked.toFixed(6)} ALGO
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Staked for truth verification
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Wallet Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="w-5 h-5 text-blue-400" />
                Algorand Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AlgorandWallet />
              
              {isConnected && address && (
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Connected Address</p>
                    <p className="text-white font-mono">{formatAddress(address)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="bg-gray-700/50 border-gray-600"
                    >
                      {copiedAddress ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gray-700/50 border-gray-600"
                      onClick={() => window.open(`https://testnet.algoexplorer.io/address/${address}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Transaction History */}
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400">Loading transactions...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <WalletIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">No transactions yet</p>
                    <p className="text-sm text-gray-500">Your transaction history will appear here</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(tx.type, tx.amount)}
                        <div>
                          <p className="text-white font-medium">{tx.description}</p>
                          <p className="text-xs text-gray-400">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`font-mono font-bold ${
                            tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(6)} ALGO
                          </p>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(tx.status)}
                            <span className="text-xs text-gray-400 capitalize">{tx.status}</span>
                          </div>
                        </div>
                        
                        {tx.related_post_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-600/50"
                            title="View related post"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
} 