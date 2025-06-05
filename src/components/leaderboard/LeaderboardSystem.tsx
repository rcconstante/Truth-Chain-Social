import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  Coins, 
  Brain, 
  Target, 
  Users,
  Award,
  Crown,
  Zap,
  Timer
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface LeaderboardEntry {
  user_id: string;
  score: number;
  rank: number;
  category: string;
  period: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
    reputation_score: number;
    total_stakes: number;
    accuracy_rate: number;
  };
}

interface LeaderboardStats {
  totalParticipants: number;
  totalStaked: number;
  averageAccuracy: number;
  activeUsers: number;
}

type LeaderboardCategory = 'earnings' | 'accuracy' | 'challenges' | 'contributions' | 'expertise' | 'rising_stars';
type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

export function LeaderboardSystem() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('earnings');
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('monthly');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [stats, setStats] = useState<LeaderboardStats>({
    totalParticipants: 0,
    totalStaked: 0,
    averageAccuracy: 0,
    activeUsers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const categories: Record<LeaderboardCategory, { label: string; icon: React.ReactNode; description: string }> = {
    earnings: {
      label: 'Top Earners',
      icon: <Coins className="w-4 h-4" />,
      description: 'Highest ALGO profits this period'
    },
    accuracy: {
      label: 'Truth Masters',
      icon: <Target className="w-4 h-4" />,
      description: 'Best truth accuracy percentage'
    },
    challenges: {
      label: 'Challenge Champions',
      icon: <Medal className="w-4 h-4" />,
      description: 'Most successful dispute resolutions'
    },
    contributions: {
      label: 'Community Leaders',
      icon: <Users className="w-4 h-4" />,
      description: 'Highest quality community participation'
    },
    expertise: {
      label: 'Domain Experts',
      icon: <Brain className="w-4 h-4" />,
      description: 'Recognized specialists by topic'
    },
    rising_stars: {
      label: 'Rising Stars',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Biggest reputation gains this period'
    }
  };

  useEffect(() => {
    loadLeaderboardData();
    
    // Also initialize leaderboard data on first load if empty
    initializeLeaderboardIfEmpty();

    // Listen for wallet balance updates
    const handleWalletUpdate = () => {
      console.log('🔄 Wallet updated, refreshing leaderboard...');
      loadLeaderboardData();
    };

    const handleTransactionComplete = () => {
      console.log('🔄 Transaction completed, refreshing leaderboard...');
      loadLeaderboardData();
    };

    // Add event listeners for real-time updates
    window.addEventListener('walletBalanceUpdated', handleWalletUpdate);
    window.addEventListener('transactionCompleted', handleTransactionComplete);

    // Auto-refresh every 30 seconds for real-time sync
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing leaderboard for real-time sync...');
      loadLeaderboardData();
    }, 30000);

    return () => {
      window.removeEventListener('walletBalanceUpdated', handleWalletUpdate);
      window.removeEventListener('transactionCompleted', handleTransactionComplete);
      clearInterval(interval);
    };
  }, [selectedCategory, selectedPeriod]);

  const initializeLeaderboardIfEmpty = async () => {
    try {
      // Check if any leaderboard data exists for this category/period
      const { count } = await supabase
        .from('leaderboards')
        .select('id', { count: 'exact' })
        .eq('category', selectedCategory)
        .eq('period', selectedPeriod);

      if (!count || count === 0) {
        console.log('No leaderboard data exists, initializing...');
        await generateLeaderboardFromProfiles();
      }
    } catch (error) {
      console.log('Error checking leaderboard data, will generate fresh data');
      await generateLeaderboardFromProfiles();
    }
  };

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchLeaderboard(),
        fetchUserRank(),
        fetchLeaderboardStats()
      ]);
    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
      // Fallback to generating from profiles
      await generateLeaderboardFromProfiles();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboards')
        .select(`
          *,
          profiles (
            username,
            avatar_url,
            reputation_score,
            total_stakes,
            accuracy_rate
          )
        `)
        .eq('category', selectedCategory)
        .eq('period', selectedPeriod)
        .order('rank', { ascending: true })
        .limit(50);

      if (!error && data && data.length > 0) {
        setLeaderboardData(data);
      } else {
        console.log('No leaderboard data found, generating from profiles...');
        await generateLeaderboardFromProfiles();
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Always fallback to generating from profiles
      await generateLeaderboardFromProfiles();
    }
  };

  const generateLeaderboardFromProfiles = async () => {
    try {
      console.log('Generating leaderboard from profiles...');
      
      // Fetch ALL profiles, including those with 0 values
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, reputation_score, total_stakes, accuracy_rate, created_at')
        .not('username', 'is', null)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found');
        setLeaderboardData([]);
        return;
      }

      console.log(`Found ${profiles.length} profiles for leaderboard`);

      // Generate leaderboard entries based on category, ensuring all users appear
      const leaderboardEntries = await Promise.all(profiles.map(async (profile) => {
        let score = 0;
        
        switch (selectedCategory) {
          case 'earnings':
            // Get real transaction data for accurate earnings calculation
            try {
              const { data: transactions } = await supabase
                .from('transactions')
                .select('amount, type')
                .eq('user_id', profile.id)
                .in('type', ['verification_stake', 'challenge_stake', 'reward']);
              
              const totalStaked = transactions
                ?.filter(tx => ['verification_stake', 'challenge_stake'].includes(tx.type))
                ?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;
              
              const totalEarned = transactions
                ?.filter(tx => tx.type === 'reward')
                ?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
              
              score = Math.max(0, totalStaked + totalEarned);
              
              // Update profile total_stakes if different
              if (totalStaked !== (profile.total_stakes || 0)) {
                await supabase
                  .from('profiles')
                  .update({ total_stakes: totalStaked })
                  .eq('id', profile.id);
                profile.total_stakes = totalStaked;
              }
            } catch (txError) {
              console.warn('Error fetching transactions for user:', profile.id, txError);
              score = Math.max(0, profile.total_stakes || 0);
            }
            break;
          case 'accuracy':
            score = Math.max(0, Math.round((profile.accuracy_rate || 0) * 100));
            break;
          case 'challenges':
            score = Math.max(0, Math.floor((profile.reputation_score || 100) / 20));
            break;
          case 'contributions':
            score = Math.max(0, Math.floor((profile.reputation_score || 100) / 5));
            break;
          case 'expertise':
            score = Math.max(0, profile.reputation_score || 100);
            break;
          case 'rising_stars':
            // For rising stars, give newer users a boost
            const daysOld = profile.created_at ? 
              Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 30;
            const newUserBoost = Math.max(0, 30 - daysOld) * 2;
            score = Math.max(0, Math.floor((profile.reputation_score || 100) / 10) + newUserBoost);
            break;
          default:
            score = Math.max(0, profile.reputation_score || 100);
        }

        return {
          user_id: profile.id,
          score,
          category: selectedCategory,
          period: selectedPeriod,
          updated_at: new Date().toISOString(),
          profiles: {
            username: profile.username,
            avatar_url: profile.avatar_url || '',
            reputation_score: profile.reputation_score || 100,
            total_stakes: profile.total_stakes || 0,
            accuracy_rate: profile.accuracy_rate || 1.0
          }
        };
      }));

      // Sort by score (descending) and assign ranks
      const sortedEntries = leaderboardEntries
        .sort((a, b) => b.score - a.score)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      console.log(`Generated ${sortedEntries.length} leaderboard entries`);

      // Try to insert/update leaderboard data in database
      try {
        const { error: upsertError } = await supabase
          .from('leaderboards')
          .upsert(
            sortedEntries.map(entry => ({
              user_id: entry.user_id,
              score: entry.score,
              rank: entry.rank,
              category: entry.category,
              period: entry.period,
              updated_at: entry.updated_at
            })),
            { 
              onConflict: 'user_id,category,period',
              ignoreDuplicates: false 
            }
          );

        if (upsertError) {
          console.warn('Failed to save leaderboard to database:', upsertError);
        } else {
          console.log('Successfully saved leaderboard to database');
        }
      } catch (dbError) {
        console.warn('Database leaderboard save failed:', dbError);
      }

      // Always show the generated data regardless of database save success
      setLeaderboardData(sortedEntries);

    } catch (error) {
      console.error('Failed to generate leaderboard from profiles:', error);
      setLeaderboardData([]);
    }
  };

  const fetchUserRank = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('leaderboards')
      .select(`
        *,
        profiles (
          username,
          avatar_url,
          reputation_score,
          total_stakes,
          accuracy_rate
        )
      `)
      .eq('category', selectedCategory)
      .eq('period', selectedPeriod)
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setUserRank(data);
    } else {
      setUserRank(null);
    }
  };

  const fetchLeaderboardStats = async () => {
    // Get participant count
    const { count: totalParticipants } = await supabase
      .from('leaderboards')
      .select('user_id', { count: 'exact' })
      .eq('category', selectedCategory)
      .eq('period', selectedPeriod);

    // Get total staked amount
    const { data: stakingData } = await supabase
      .from('profiles')
      .select('total_stakes');

    const totalStaked = stakingData?.reduce((sum, profile) => sum + (profile.total_stakes || 0), 0) || 0;

    // Get average accuracy
    const { data: accuracyData } = await supabase
      .from('profiles')
      .select('accuracy_rate')
      .not('accuracy_rate', 'is', null);

    const averageAccuracy = accuracyData && accuracyData.length > 0 
      ? accuracyData.reduce((sum, profile) => sum + profile.accuracy_rate, 0) / accuracyData.length
      : 0;

    // Get active users (posted in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: activeUsers } = await supabase
      .from('posts')
      .select('user_id', { count: 'exact' })
      .gte('created_at', sevenDaysAgo.toISOString());

    setStats({
      totalParticipants: totalParticipants || 0,
      totalStaked,
      averageAccuracy,
      activeUsers: activeUsers || 0
    });
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-black';
    if (rank <= 10) return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white';
    return 'bg-gray-600 text-white';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4" />;
    if (rank === 2) return <Trophy className="w-4 h-4" />;
    if (rank === 3) return <Medal className="w-4 h-4" />;
    if (rank <= 10) return <Star className="w-4 h-4" />;
    return <Award className="w-4 h-4" />;
  };

  const formatScore = (score: number, category: LeaderboardCategory) => {
    switch (category) {
      case 'earnings':
        return `${score.toFixed(2)} ALGO`;
      case 'accuracy':
      case 'contributions':
      case 'expertise':
        return `${score.toFixed(1)}%`;
      case 'challenges':
      case 'rising_stars':
        return score.toString();
      default:
        return score.toFixed(1);
    }
  };

  const getCategoryDescription = (entry: LeaderboardEntry) => {
    const profile = entry.profiles;
    if (!profile) return '';

    switch (selectedCategory) {
      case 'earnings':
        return `${profile.total_stakes.toFixed(1)} ALGO staked`;
      case 'accuracy':
        return `${profile.reputation_score} reputation`;
      case 'challenges':
        return `${profile.accuracy_rate.toFixed(1)}% accuracy`;
      default:
        return `Rep: ${profile.reputation_score}`;
    }
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
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">TruthChain Leaderboards</h2>
                <p className="text-gray-400">Compete for truth, earn recognition</p>
              </div>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{stats.totalParticipants}</div>
              <div className="text-xs text-gray-400">Total Participants</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{stats.totalStaked.toFixed(0)}</div>
              <div className="text-xs text-gray-400">ALGO Staked</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{stats.averageAccuracy.toFixed(1)}%</div>
              <div className="text-xs text-gray-400">Average Accuracy</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{stats.activeUsers}</div>
              <div className="text-xs text-gray-400">Active Users (7d)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Selection */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Leaderboard Categories</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateLeaderboardFromProfiles()}
                disabled={isLoading}
                className="border-gray-600 hover:border-purple-400"
              >
                {isLoading ? 'Refreshing...' : 'Refresh Rankings'}
              </Button>
              {(['weekly', 'monthly', 'all_time'] as const).map((period) => (
                <Button
                  key={period}
                  size="sm"
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  onClick={() => setSelectedPeriod(period)}
                  className="border-gray-600"
                >
                  {period === 'all_time' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(categories).map(([category, config]) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category as LeaderboardCategory)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedCategory === category
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-purple-400'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {config.icon}
                  <span className="font-medium">{config.label}</span>
                </div>
                <p className="text-xs text-gray-400">{config.description}</p>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Rank Card */}
      {userRank && (
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-blue-500/30">
                  <AvatarImage 
                    src={userRank.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userRank.profiles?.username || 'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`} 
                  />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {userRank.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-white">Your Ranking</h4>
                  <p className="text-sm text-gray-400">{getCategoryDescription(userRank)}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`mb-2 ${getRankBadgeColor(userRank.rank)}`}>
                  <div className="flex items-center gap-1">
                    {getRankIcon(userRank.rank)}
                    <span>#{userRank.rank}</span>
                  </div>
                </Badge>
                <div className="text-lg font-bold text-white">
                  {formatScore(userRank.score, selectedCategory)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard List */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {categories[selectedCategory].icon}
            <span>{categories[selectedCategory].label}</span>
            <Badge variant="outline" className="ml-auto">
              {selectedPeriod.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <AnimatePresence>
              {leaderboardData.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="flex flex-col items-center gap-4">
                    <Trophy className="w-16 h-16 text-gray-600 opacity-50" />
                    <div>
                      <p className="text-lg font-medium">Building leaderboard...</p>
                      <p className="text-sm text-gray-500 mt-1">Rankings will appear as users participate</p>
                    </div>
                    <Button
                      onClick={generateLeaderboardFromProfiles}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Refresh Rankings
                    </Button>
                  </div>
                </div>
              ) : (
                leaderboardData.map((entry, index) => (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      entry.user_id === user?.id
                        ? 'bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/20'
                        : 'bg-gray-800/50 border-gray-700/30 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Badge className={getRankBadgeColor(entry.rank)}>
                        <div className="flex items-center gap-1">
                          {getRankIcon(entry.rank)}
                          <span>#{entry.rank}</span>
                        </div>
                      </Badge>
                      
                      <Avatar className="w-10 h-10 border border-gray-600">
                        <AvatarImage 
                          src={entry.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.profiles?.username || 'user'}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                          {entry.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {entry.profiles?.username || 'Anonymous'}
                          {entry.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">You</Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-400">
                          {getCategoryDescription(entry)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {formatScore(entry.score, selectedCategory)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Updated {new Date(entry.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 