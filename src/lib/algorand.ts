import algosdk from 'algosdk';

// Algorand Configuration with your provided credentials
export const ALGORAND_CONFIG = {
  // API Configuration
  token: '98D9CE80660AD243893D56D9F125CD2D',
  headers: { 'X-Algo-api-token': '98D9CE80660AD243893D56D9F125CD2D' },
  
  // Network endpoints
  mainnet: {
    server: 'https://mainnet-api.4160.nodely.io',
    indexer: 'https://mainnet-idx.4160.nodely.io',
    port: 443
  },
  testnet: {
    server: 'https://testnet-api.4160.nodely.io',
    indexer: 'https://testnet-idx.4160.nodely.io',
    port: 443
  },
  
  // Default to testnet for development
  network: 'testnet' as 'mainnet' | 'testnet',
  
  // Smart contract configuration
  truthStakingAppId: 0, // Will be set after deployment
  
  // Staking parameters
  minStakeAmount: 1000000, // 1 ALGO in microAlgos
  challengeFee: 100000,    // 0.1 ALGO in microAlgos
  
  // Faucet for testnet
  faucet: 'https://bank.testnet.algorand.network/',
  
  // Legacy compatibility
  server: 'https://testnet-api.4160.nodely.io',
  port: 443,
  explorer: 'https://testnet.algoexplorer.io',
};

// Create Algod client
export function createAlgodClient() {
  const config = ALGORAND_CONFIG.network === 'mainnet' 
    ? ALGORAND_CONFIG.mainnet 
    : ALGORAND_CONFIG.testnet;
    
  return new algosdk.Algodv2(
    ALGORAND_CONFIG.headers,
    config.server,
    config.port
  );
}

// Create Indexer client
export function createIndexerClient() {
  const config = ALGORAND_CONFIG.network === 'mainnet' 
    ? ALGORAND_CONFIG.mainnet 
    : ALGORAND_CONFIG.testnet;
    
  return new algosdk.Indexer(
    ALGORAND_CONFIG.headers,
    config.indexer,
    config.port
  );
}

// Legacy algod client for backward compatibility
export const algodClient = createAlgodClient();

// Account info interface
export interface AccountInfo {
  address: string;
  balance: number;
  assets: Array<{
    'asset-id': number;
    amount: number;
  }>;
  'min-balance': number;
  round: number;
}

// Get account information
export async function getAccountInfo(address: string): Promise<AccountInfo> {
  const algodClient = createAlgodClient();
  
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return {
      address: accountInfo.address,
      balance: Number(accountInfo.amount),
      assets: (accountInfo.assets || []).map((asset: any) => ({
        'asset-id': asset['asset-id'],
        amount: Number(asset.amount)
      })),
      'min-balance': Number(accountInfo.minBalance),
      round: Number(accountInfo.round)
    };
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw new Error('Failed to fetch account information');
  }
}

// Format address for display
export function formatAddress(address: string, length: number = 8): string {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

// Format balance from microAlgos to ALGO
export function formatBalance(microAlgos: number): string {
  return (microAlgos / 1000000).toFixed(6);
}

// Convert ALGO to microAlgos
export function algoToMicroAlgo(algo: number): number {
  return Math.round(algo * 1000000);
}

// Convert microAlgos to ALGO
export function microAlgoToAlgo(microAlgos: number): number {
  return microAlgos / 1000000;
}

// Legacy utility functions for backward compatibility
export const microAlgosToAlgos = microAlgoToAlgo;
export const algosToMicroAlgos = algoToMicroAlgo;

// Truth Staking Smart Contract Interface
export interface TruthStake {
  postId: string;
  staker: string;
  amount: number;
  isChallenge: boolean;
  timestamp: number;
  resolved: boolean;
}

// Transaction types for TruthChain
export enum TransactionType {
  CREATE_POST = 'create_post',
  VERIFY_POST = 'verify_post',
  CHALLENGE_POST = 'challenge_post',
  CLAIM_REWARD = 'claim_reward'
}

export interface PostTransaction {
  action: TransactionType;
  content?: string;
  postId?: string;
  verdict?: boolean;
  timestamp: number;
  metadata?: any;
}

// Legacy: Create payment transaction (backward compatibility)
export async function createPaymentTransaction(params: {
  from: string;
  to: string;
  amount: number; // in ALGOs
  note?: string;
}): Promise<algosdk.Transaction> {
  try {
    const algodClient = createAlgodClient();
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: params.from,
      receiver: params.to,
      amount: algoToMicroAlgo(params.amount),
      note: params.note ? new TextEncoder().encode(params.note) : undefined,
      suggestedParams
    });

    return txn;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Legacy: Create post transaction (backward compatibility)
export async function createPostTransaction(
  from: string,
  escrowAddress: string,
  stakeAmount: number,
  content: string
): Promise<algosdk.Transaction> {
  const note: PostTransaction = {
    action: TransactionType.CREATE_POST,
    content,
    timestamp: Date.now()
  };

  return createPaymentTransaction({
    from,
    to: escrowAddress,
    amount: stakeAmount,
    note: JSON.stringify(note)
  });
}

// Legacy: Create verification transaction (backward compatibility)
export async function createVerificationTransaction(
  from: string,
  escrowAddress: string,
  stakeAmount: number,
  postId: string,
  verdict: boolean
): Promise<algosdk.Transaction> {
  const note: PostTransaction = {
    action: TransactionType.VERIFY_POST,
    postId,
    verdict,
    timestamp: Date.now()
  };

  return createPaymentTransaction({
    from,
    to: escrowAddress,
    amount: stakeAmount,
    note: JSON.stringify(note)
  });
}

// Legacy: Submit signed transaction (backward compatibility)
export async function submitTransaction(signedTxn: Uint8Array) {
  try {
    const algodClient = createAlgodClient();
    const response = await algodClient.sendRawTransaction(signedTxn).do();
    const txId = response.txid;
    const confirmation = await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    return {
      txId,
      confirmation,
      explorerUrl: `${ALGORAND_CONFIG.explorer}/tx/${txId}`
    };
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
}

// Create truth staking transaction
export async function createTruthStakeTransaction(
  staker: string,
  postId: string,
  amount: number,
  isChallenge: boolean = false
): Promise<algosdk.Transaction> {
  const algodClient = createAlgodClient();
  
  try {
    const params = await algodClient.getTransactionParams().do();
    
    // For now, create a simple payment transaction
    // In production, this would be an application call to the smart contract
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: staker,
      receiver: staker, // Self-payment for now, will be smart contract address
      amount: amount,
      note: new Uint8Array(Buffer.from(JSON.stringify({
        type: 'truth_stake',
        postId,
        isChallenge,
        timestamp: Date.now()
      }))),
      suggestedParams: params,
    });
    
    return txn;
  } catch (error) {
    console.error('Error creating truth stake transaction:', error);
    throw new Error('Failed to create staking transaction');
  }
}

// Verify truth stake transaction
export async function verifyTruthStakeTransaction(txId: string): Promise<boolean> {
  const indexerClient = createIndexerClient();
  
  try {
    const txnInfo = await indexerClient.lookupTransactionByID(txId).do();
    
    // Verify transaction was confirmed
    if (txnInfo.transaction.confirmedRound) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}

// Get account transaction history
export async function getAccountTransactions(
  address: string,
  limit: number = 50
): Promise<any[]> {
  const indexerClient = createIndexerClient();
  
  try {
    const txns = await indexerClient
      .lookupAccountTransactions(address)
      .limit(limit)
      .do();
      
    return txns.transactions || [];
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    throw new Error('Failed to fetch transaction history');
  }
}

// Check network status
export async function checkNetworkStatus(): Promise<{
  health: boolean;
  round: number;
  timeSinceLastRound: number;
}> {
  const algodClient = createAlgodClient();
  
  try {
    const status = await algodClient.status().do();
    return {
      health: true,
      round: Number(status.lastRound),
      timeSinceLastRound: Number(status.timeSinceLastRound)
    };
  } catch (error) {
    console.error('Network status check failed:', error);
    return {
      health: false,
      round: 0,
      timeSinceLastRound: 0
    };
  }
} 