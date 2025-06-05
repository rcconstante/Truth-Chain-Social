import { ALGORAND_CONFIG } from './algorand';

export interface MockTruthPost {
  id: string;
  content: string;
  author: string;
  stakeAmount: number;
  totalStaked: number;
  verifications: number;
  challenges: number;
  status: 'pending' | 'verified' | 'challenged' | 'resolved';
  createdAt: string;
  txId: string;
  explorerUrl: string;
  category?: string;
  truthScore?: number;
}

export const demoWalletAddresses = [
  'TRUTH123SEEKER456VALIDATOR789BLOCKCHAIN012ALGORAND345DEMO567890',
  'SPACE789EXPLORER123SCIENTIST456RESEARCH789COSMOS012TRUTH345678',
  'AUTO456ANALYST789TESLA123GIGAFACTORY456INDIA789PREDICTION012345',
  'CRYPTO987EXPERT654BITCOIN321PREDICTION098INSTITUTIONAL765432',
  'TECH567INNOVATOR234APPLE890VISION123PRO456ANNOUNCEMENT789012',
  'HEALTH345RESEARCHER678COVID901VACCINE234EFFECTIVENESS567890',
  'CLIMATE123SCIENTIST456WARMING789DATA012TEMPERATURE345RECORDS'
];

export const mockTruthPosts: MockTruthPost[] = [
  {
    id: 'post_btc_100k_2024',
    content: 'Bitcoin will reach $100,000 by the end of 2024 based on institutional adoption trends, ETF approvals, and the upcoming halving event reducing supply.',
    author: demoWalletAddresses[0],
    stakeAmount: 5.0,
    totalStaked: 12.5,
    verifications: 3,
    challenges: 1,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    txId: 'BTC100K2024PREDICTION123456789ABCDEF012345678901234567890',
    explorerUrl: `${ALGORAND_CONFIG.explorer}/tx/BTC100K2024PREDICTION123456789ABCDEF012345678901234567890`,
    category: 'Cryptocurrency',
    truthScore: 75
  },
  {
    id: 'post_jwst_trappist',
    content: 'The James Webb Space Telescope has discovered organic molecules in the atmosphere of TRAPPIST-1e, providing the strongest evidence yet for potential habitability.',
    author: demoWalletAddresses[1],
    stakeAmount: 3.0,
    totalStaked: 8.5,
    verifications: 5,
    challenges: 0,
    status: 'verified',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    txId: 'JWSTTRAPPIST1DISCOVERY456789012345ABCDEF678901234567890',
    explorerUrl: `${ALGORAND_CONFIG.explorer}/tx/JWSTTRAPPIST1DISCOVERY456789012345ABCDEF678901234567890`,
    category: 'Space Science',
    truthScore: 92
  },
  {
    id: 'post_tesla_india',
    content: 'Tesla will announce a new Gigafactory in India during Q2 2024, as confirmed by recent regulatory filings and government meetings with Elon Musk.',
    author: demoWalletAddresses[2],
    stakeAmount: 2.5,
    totalStaked: 4.0,
    verifications: 1,
    challenges: 2,
    status: 'challenged',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    txId: 'TESLAINDIAGIGAFACTORY789012345678ABCDEF90123456789012',
    explorerUrl: `${ALGORAND_CONFIG.explorer}/tx/TESLAINDIAGIGAFACTORY789012345678ABCDEF90123456789012`,
    category: 'Automotive',
    truthScore: 45
  },
  {
    id: 'post_ethereum_pos',
    content: 'Ethereum\'s transition to Proof of Stake has reduced its energy consumption by 99.5%, making it one of the most environmentally sustainable blockchains.',
    author: demoWalletAddresses[3],
    stakeAmount: 4.2,
    totalStaked: 15.8,
    verifications: 7,
    challenges: 0,
    status: 'verified',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    txId: 'ETHEREUMPOSENERGYSAVING234567890123ABCDEF456789012345',
    explorerUrl: `${ALGORAND_CONFIG.explorer}/tx/ETHEREUMPOSENERGYSAVING234567890123ABCDEF456789012345`,
    category: 'Blockchain',
    truthScore: 95
  },
  {
    id: 'post_apple_vision_pro',
    content: 'Apple Vision Pro will be available in international markets including UK, Germany, and Japan starting March 2024, with a starting price of $3,499.',
    author: demoWalletAddresses[4],
    stakeAmount: 1.8,
    totalStaked: 6.3,
    verifications: 4,
    challenges: 1,
    status: 'pending',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    txId: 'APPLEVISIONPROINTERNATIONAL567890123ABCDEF456789012345',
    explorerUrl: `${ALGORAND_CONFIG.explorer}/tx/APPLEVISIONPROINTERNATIONAL567890123ABCDEF456789012345`,
    category: 'Technology',
    truthScore: 68
  },
  {
    id: 'post_covid_vaccine_effectiveness',
    content: 'Latest studies show COVID-19 mRNA vaccines maintain 85% effectiveness against severe disease after 12 months, even against new variants.',
    author: demoWalletAddresses[5],
    stakeAmount: 3.5,
    totalStaked: 11.2,
    verifications: 6,
    challenges: 1,
    status: 'verified',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    txId: 'COVIDVACCINEEFFECTIVENESS890123ABCDEF456789012345678',
    explorerUrl: `${ALGORAND_CONFIG.explorer}/tx/COVIDVACCINEEFFECTIVENESS890123ABCDEF456789012345678`,
    category: 'Health',
    truthScore: 88
  },
  {
    id: 'post_climate_temperature',
    content: '2024 is on track to be the hottest year on record, with global average temperatures 1.3°C above pre-industrial levels according to NASA data.',
    author: demoWalletAddresses[6],
    stakeAmount: 2.2,
    totalStaked: 7.8,
    verifications: 5,
    challenges: 0,
    status: 'verified',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    txId: 'CLIMATETEMPERATURERECORD2024123ABCDEF456789012345678',
    explorerUrl: `${ALGORAND_CONFIG.explorer}/tx/CLIMATETEMPERATURERECORD2024123ABCDEF456789012345678`,
    category: 'Climate',
    truthScore: 94
  }
];

export const mockUserStats = {
  reputation: 87,
  accuracy: 0.92,
  totalStaked: 23.5,
  totalEarned: 8.2,
  postsCreated: 7,
  verificationsPerformed: 12,
  achievements: [
    { id: 'first_truth', name: 'First Truth', description: 'Created your first truth post', earned: true },
    { id: 'accuracy_master', name: 'Accuracy Master', description: '90%+ accuracy rate', earned: true },
    { id: 'high_stakes', name: 'High Stakes', description: 'Staked 10+ ALGO on a single post', earned: false },
    { id: 'community_verifier', name: 'Community Verifier', description: 'Verified 10+ posts', earned: true },
    { id: 'truth_seeker', name: 'Truth Seeker', description: 'Reached 80+ reputation score', earned: true }
  ]
};

export const categories = [
  'Cryptocurrency',
  'Technology', 
  'Space Science',
  'Health',
  'Climate',
  'Politics',
  'Economics',
  'Automotive',
  'Blockchain',
  'AI/ML'
];

// Demo transaction IDs for realistic blockchain integration
export const generateMockTxId = (prefix: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix.toUpperCase();
  for (let i = 0; i < (58 - prefix.length); i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Utility function to create new posts for demo
export const createDemoPost = (content: string, author: string, stakeAmount: number): MockTruthPost => {
  const txId = generateMockTxId('DEMO');
  return {
    id: `post_${Date.now()}`,
    content,
    author,
    stakeAmount,
    totalStaked: stakeAmount,
    verifications: 0,
    challenges: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    txId,
    explorerUrl: `${ALGORAND_CONFIG.explorer}/tx/${txId}`,
    category: 'General',
    truthScore: 50
  };
};

// Mock AI Fact-Checking Sources
export const AI_FACT_CHECK_SOURCES = [
  'ChatGPT 4.0 Analysis',
  'Google Fact Check Explorer',
  'Reuters Fact Check',
  'AP Fact Check',
  'Snopes.com Verification',
  'PolitiFact Analysis',
  'FactCheck.org Review',
  'BBC Reality Check',
  'Washington Post Fact Checker',
  'Claude 3.5 Sonnet Analysis',
  'Gemini Pro Verification',
  'Perplexity AI Research',
  'OpenAI GPT-4 Analysis',
  'Microsoft Copilot Fact Check'
];

// Mock finished threads with AI fact-checking results
export const MOCK_FINISHED_THREADS = [
  {
    id: 'finished-1',
    content: 'Quantum computing breakthrough: IBM achieves 99.9% error correction fidelity with their new 1000-qubit processor, making fault-tolerant quantum computing commercially viable within 3 years.',
    image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop',
    author: 'QuantumPhysicist',
    stakeAmount: 5.5,
    status: 'finished' as const,
    expires_at: new Date(Date.now() - 345600000).toISOString(), // Expired 4 days ago
    truthScore: 85,
    ai_fact_check_score: 88,
    ai_sources: [
      'IBM Quantum Research Papers',
      'Nature Physics Journal',
      'MIT Technology Review',
      'ChatGPT 4.0 Analysis',
      'Google Fact Check Explorer',
      'BBC Reality Check'
    ],
    verifications: 38,
    challenges: 8,
    totalStaked: 28.3,
    createdAt: new Date(Date.now() - 1296000000).toISOString(), // 15 days ago
    category: 'Technology',
    tags: ['quantum', 'computing', 'breakthrough'],
    upvotes: 187,
    downvotes: 21,
    comments_count: 89,
    user_id: 'demo-user-5',
    verification_status: 'finished'
  }
];

// Generate random AI sources for new posts
export function generateRandomAISources(count: number = 5): string[] {
  const shuffled = [...AI_FACT_CHECK_SOURCES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Generate mock AI fact-check score based on content keywords
export function generateMockAIScore(content: string): number {
  const positiveKeywords = [
    'study', 'research', 'clinical trial', 'peer-reviewed', 'published',
    'university', 'journal', 'scientific', 'data', 'evidence'
  ];
  
  const negativeKeywords = [
    'breaking', 'exclusive', 'leaked', 'insider', 'rumor',
    'sources say', 'anonymous', 'unconfirmed', 'allegedly'
  ];
  
  let score = 50; // Base score
  
  positiveKeywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword)) {
      score += Math.random() * 15 + 5; // Add 5-20 points
    }
  });
  
  negativeKeywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword)) {
      score -= Math.random() * 20 + 10; // Subtract 10-30 points
    }
  });
  
  return Math.max(5, Math.min(95, Math.round(score)));
} 