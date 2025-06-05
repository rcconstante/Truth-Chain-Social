import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Award, 
  History,
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  PiggyBank,
  Target,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { blockchainStakingService } from '../../lib/blockchain-staking';
import { useAuth } from '../../lib/auth';
import AlgorandService from '../../lib/algorand-service';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  blockchain_tx_id?: string;
  related_post_id?: string;
}

interface WalletStats {
  totalBalance: number;
  totalStaked: number;
  totalEarned: number;
  totalLost: number;
  successfulStakes: number;
  failedStakes: number;
  activeChallenges: number;
}

export function WalletDashboard() {
  const { user } = useAuth();
  const [walletStats, setWalletStats] = useState<WalletStats>({
    totalBalance: 0,
    totalStaked: 0,
    totalEarned: 0,
    totalLost: 0,
    successfulStakes: 0,
    failedStakes: 0,
    activeChallenges: 0
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stakingHistory, setStakingHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (user?.id) {
      loadWalletData();
    }
  }, [user?.id, selectedTimeframe]);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadWalletStats(),
        loadTransactionHistory(),
        loadStakingHistory()
      ]);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletStats = async () => {
    if (!user?.id) return;

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('algo_balance, total_stakes, successful_challenges, accuracy_rate, algo_address, wallet_connected')
      .eq('id', user.id)
      .single();

    let currentBalance = profile?.algo_balance || 0;

    // If user has connected wallet, fetch real-time balance
    if (profile?.algo_address && profile.wallet_connected) {
      try {
        const realTimeBalance = await AlgorandService.getAccountBalance(profile.algo_address);
        
        // CRITICAL FIX: Only update if real balance exists or database balance is 0
        if (realTimeBalance > 0) {
          console.log(`📊 Real-time balance: ${realTimeBalance} ALGO (updating database)`);
          currentBalance = realTimeBalance;
          
          // Update database with real balance
          await supabase
            .from('profiles')
            .update({ algo_balance: realTimeBalance })
            .eq('id', user.id);
        } else if (currentBalance > 0) {
          console.log(`⚠️ Testnet wallet unfunded but database has ${currentBalance} ALGO - keeping database balance`);
          // Keep existing database balance
        } else {
          console.log(`📊 Both testnet and database show 0 balance`);
          currentBalance = 0;
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch real-time balance, using database balance:', error);
      }
    }

    // Get transaction summary for stakes calculation
    const { data: stakes } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .in('type', ['verification_stake', 'challenge_stake', 'stake']);

    const totalStaked = stakes?.reduce((sum, stake) => sum + Math.abs(stake.amount), 0) || 0;

    // Get transaction summary for earnings/losses
    const { data: transactionSummary } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', user.id);

    // Calculate stats
    let totalEarned = 0;
    let totalLost = 0;
    let successfulStakes = 0;
    let failedStakes = 0;

    transactionSummary?.forEach(tx => {
      if (tx.type === 'reward' && tx.amount > 0) {
        totalEarned += tx.amount;
        successfulStakes++;
      } else if (tx.type === 'penalty' && tx.amount < 0) {
        totalLost += Math.abs(tx.amount);
        failedStakes++;
      }
    });

    // Get active challenges
    const { data: challenges } = await supabase
      .from('post_challenges')
      .select('id')
      .eq('challenger_id', user.id)
      .eq('status', 'pending');

    setWalletStats({
      totalBalance: currentBalance,
      totalStaked: totalStaked,
      totalEarned,
      totalLost,
      successfulStakes,
      failedStakes,
      activeChallenges: challenges?.length || 0
    });
  };

  const loadTransactionHistory = async () => {
    if (!user?.id) return;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Apply timeframe filter
    if (selectedTimeframe !== 'all') {
      const days = selectedTimeframe === 'week' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      query = query.gte('created_at', cutoffDate.toISOString());
    }

    const { data, error } = await query;
    
    if (!error && data) {
      setTransactions(data);
    }
  };

  const loadStakingHistory = async () => {
    if (!user?.id) return;

    const stakingData = await blockchainStakingService.getUserStakingHistory(user.id, 20);
    setStakingHistory(stakingData);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'stake': return <ArrowDownLeft className="w-4 h-4 text-red-400" />;
      case 'reward': return <ArrowUpRight className="w-4 h-4 text-green-400" />;
      case 'challenge': return <Target className="w-4 h-4 text-orange-400" />;
      case 'penalty': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'withdrawal': return <Send className="w-4 h-4 text-blue-400" />;
      default: return <Coins className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-green-400';
    if (amount < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount.toFixed(2)} ALGO`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProfitLoss = () => {
    return walletStats.totalEarned - walletStats.totalLost;
  };

  const getWinRate = () => {
    const total = walletStats.successfulStakes + walletStats.failedStakes;
    return total > 0 ? (walletStats.successfulStakes / total) * 100 : 0;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadWalletData();
      setLastRefresh(new Date());
      
      // Sync wallet balance through auth hook
      if (user?.profile?.algo_address) {
        const { useAuth } = await import('../../lib/auth');
        // Note: This would need to be called from parent component
        console.log('✅ Wallet data refreshed');
      }
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAlgoExplorerUrl = (txId?: string) => {
    if (!txId) return 'https://testnet.algoexplorer.io/';
    
    // Handle simulation transaction IDs
    if (txId.startsWith('SIM')) {
      return 'https://testnet.algoexplorer.io/';
    }
    
    return `https://testnet.algoexplorer.io/tx/${txId}`;
  };

  const openAlgoExplorer = (txId?: string) => {
    window.open(getAlgoExplorerUrl(txId), '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">💰 Wallet & Transactions</h2>
          <p className="text-gray-400 mt-1">Manage your ALGO and track all transactions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">Last updated</p>
            <p className="text-sm text-white">{lastRefresh.toLocaleTimeString()}</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-purple-600 hover:bg-purple-700 text-white border-none"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Balance</p>
                <p className="text-2xl font-bold text-white">
                  {walletStats.totalBalance < 0.001 ? '0.000' : walletStats.totalBalance.toFixed(6)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">ALGO</p>
                  {user?.profile?.wallet_connected && (
                    <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                      Algorand Testnet
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Staked</p>
                <p className="text-2xl font-bold text-white">
                  {walletStats.totalStaked.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">ALGO</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <PiggyBank className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br border ${
          getProfitLoss() >= 0 
            ? 'from-green-900/20 to-green-800/20 border-green-500/30' 
            : 'from-red-900/20 to-red-800/20 border-red-500/30'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Profit/Loss</p>
                <p className={`text-2xl font-bold ${
                  getProfitLoss() >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {getProfitLoss() >= 0 ? '+' : ''}{getProfitLoss().toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">ALGO</p>
              </div>
              <div className={`p-3 rounded-lg ${
                getProfitLoss() >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {getProfitLoss() >= 0 ? 
                  <TrendingUp className="w-6 h-6 text-green-400" /> :
                  <TrendingDown className="w-6 h-6 text-red-400" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-2xl font-bold text-white">
                  {getWinRate().toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {walletStats.successfulStakes}/{walletStats.successfulStakes + walletStats.failedStakes}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Award className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction History */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5" />
                <span>Transaction History</span>
              </div>
              <div className="flex gap-2">
                {(['week', 'month', 'all'] as const).map((timeframe) => (
                  <Button
                    key={timeframe}
                    size="sm"
                    variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className="border-gray-600"
                  >
                    {timeframe === 'all' ? 'All' : timeframe === 'week' ? '7d' : '30d'}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No transactions found for this period
                </div>
              ) : (
                transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => tx.blockchain_tx_id && openAlgoExplorer(tx.blockchain_tx_id)}
                    className={`flex items-center justify-between p-3 bg-gray-800/50 rounded-lg transition-all ${
                      tx.blockchain_tx_id 
                        ? 'cursor-pointer hover:bg-gray-800/70 hover:scale-[1.02]' 
                        : ''
                    }`}
                    title={tx.blockchain_tx_id ? 'Click to view on Algorand Explorer' : ''}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700/50 rounded-lg">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {tx.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(tx.created_at)}
                        </p>
                        {tx.blockchain_tx_id && (
                          <div className="flex items-center gap-1">
                            <p className="text-xs text-gray-500">
                              {tx.blockchain_tx_id.substring(0, 8)}...
                            </p>
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getTransactionColor(tx.type, tx.amount)}`}>
                        {formatAmount(tx.amount)}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Staking Performance */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <span>Staking Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Active Stakes</p>
                  <p className="text-lg font-bold text-white">{stakingHistory.length}</p>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400">Active Challenges</p>
                  <p className="text-lg font-bold text-orange-400">{walletStats.activeChallenges}</p>
                </div>
              </div>

              {/* Recent Stakes */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Stakes</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stakingHistory.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      No staking history found
                    </div>
                  ) : (
                    stakingHistory.map((stake, index) => (
                      <div key={stake.id || index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                        <div>
                          <p className="text-xs font-medium text-white">
                            {stake.event_type.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(stake.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {stake.amount.toFixed(2)} ALGO
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-12 bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </Button>
            <Button variant="outline" className="h-12 border-gray-600">
              <Send className="w-4 h-4 mr-2" />
              Withdraw ALGO
            </Button>
            <Button variant="outline" className="h-12 border-gray-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
            <Button 
              variant="outline" 
              className="h-12 border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
              onClick={() => window.open('https://testnet.algoexplorer.io/', '_blank')}
            >
              <Search className="w-4 h-4 mr-2" />
              Algo Explorer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 