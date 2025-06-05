import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Search, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Coins,
  Hash,
  Calendar,
  User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AlgorandBlockchainService from '../../lib/algorand-blockchain';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  blockchain_tx_id?: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

interface BlockchainTxDetails {
  txId: string;
  amount: number;
  sender: string;
  receiver: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  note?: string;
}

export function TransactionExplorer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [blockchainDetails, setBlockchainDetails] = useState<BlockchainTxDetails | null>(null);
  const [searchTxId, setSearchTxId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  const loadRecentTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .not('blockchain_tx_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading transactions:', error);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchTransaction = async () => {
    if (!searchTxId.trim()) return;
    
    setIsLoadingDetails(true);
    try {
      // Search in database first
      const { data: dbTx, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq('blockchain_tx_id', searchTxId.trim())
        .single();

      if (dbTx) {
        setSelectedTx(dbTx);
      }

      // Get blockchain details
      const blockchainTx = await AlgorandBlockchainService.getTransactionDetails(searchTxId.trim());
      setBlockchainDetails(blockchainTx);

    } catch (error) {
      console.error('Error searching transaction:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const viewTransactionDetails = async (tx: Transaction) => {
    setSelectedTx(tx);
    
    if (tx.blockchain_tx_id) {
      setIsLoadingDetails(true);
      try {
        const blockchainTx = await AlgorandBlockchainService.getTransactionDetails(tx.blockchain_tx_id);
        setBlockchainDetails(blockchainTx);
      } catch (error) {
        console.error('Error fetching blockchain details:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">🔍 TruthChain Explorer</h1>
        <p className="text-gray-400">View real Algorand testnet transactions from TruthChain staking</p>
      </div>

      {/* Search */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchTxId}
              onChange={(e) => setSearchTxId(e.target.value)}
              placeholder="Enter Algorand transaction ID..."
              className="flex-1 p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && searchTransaction()}
            />
            <Button
              onClick={searchTransaction}
              disabled={isLoadingDetails || !searchTxId.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoadingDetails ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No transactions found</div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gray-800/30 border border-gray-700/50 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => viewTransactionDetails(tx)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                        <span className="text-sm text-gray-400">{tx.type.replace('_', ' ')}</span>
                      </div>
                      <span className="text-sm font-mono text-blue-400">
                        {tx.blockchain_tx_id ? formatAddress(tx.blockchain_tx_id) : 'No TxID'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-medium">
                          {Math.abs(tx.amount)} ALGO
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User className="w-3 h-3" />
                        {tx.profiles?.username || 'Unknown'}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTx ? (
              <div className="text-center py-8 text-gray-400">
                Select a transaction to view details
              </div>
            ) : (
              <div className="space-y-4">
                {/* Database Info */}
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <h3 className="font-semibold text-white mb-3">📊 Platform Data</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white">{selectedTx.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white">{Math.abs(selectedTx.amount)} ALGO</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">User:</span>
                      <span className="text-white">{selectedTx.profiles?.username || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge className={getStatusColor(selectedTx.status)}>
                        {selectedTx.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{new Date(selectedTx.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Blockchain Info */}
                {blockchainDetails ? (
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <h3 className="font-semibold text-blue-400 mb-3">⛓️ Blockchain Data</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Transaction ID:</span>
                        <span className="text-blue-400 font-mono text-xs break-all">
                          {blockchainDetails.txId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white">{blockchainDetails.amount} ALGO</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">From:</span>
                        <span className="text-white font-mono text-xs">
                          {formatAddress(blockchainDetails.sender)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">To:</span>
                        <span className="text-white font-mono text-xs">
                          {formatAddress(blockchainDetails.receiver)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Status:</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(blockchainDetails.status)}
                          <span className="text-white">{blockchainDetails.status}</span>
                        </div>
                      </div>
                      {blockchainDetails.blockNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Block:</span>
                          <span className="text-white">#{blockchainDetails.blockNumber}</span>
                        </div>
                      )}
                      {blockchainDetails.note && (
                        <div className="mt-3">
                          <span className="text-gray-400">Note:</span>
                          <p className="text-white text-xs mt-1 p-2 bg-gray-800/50 rounded">
                            {blockchainDetails.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : isLoadingDetails ? (
                  <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 text-center">
                    <div className="text-gray-400">Loading blockchain details...</div>
                  </div>
                ) : selectedTx.blockchain_tx_id ? (
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30 text-center">
                    <div className="text-red-400">Failed to load blockchain details</div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-center">
                    <div className="text-yellow-400">No blockchain transaction ID found</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Network Status */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white">Algorand Testnet</span>
            </div>
            <Button
              onClick={loadRecentTransactions}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 