import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Trophy, Zap, Clock, Target, Users, 
  Coins, Star, Crown, Medal, Gift, Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChallengeService } from '../../lib/supabase-service';
import { useAuth } from '../../lib/auth';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'accuracy' | 'volume' | 'streak' | 'community' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  reward: number;
  progress: number;
  target: number;
  timeLeft: string;
  participants: number;
  isActive: boolean;
  isCompleted: boolean;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  avatar: string;
}

export function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges');

  useEffect(() => {
    loadChallengesData();
  }, [user]);

  const loadChallengesData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // For now, create static challenges since we don't have a challenges table
      // In a real app, you'd fetch from ChallengeService.getChallenges()
      const challengesData: Challenge[] = [
        {
          id: 'accuracy_master',
          title: 'Accuracy Master',
          description: 'Maintain 95% accuracy across 20 verifications',
          type: 'accuracy',
          difficulty: 'hard',
          reward: 5.0,
          progress: user.profile?.successful_challenges || 0,
          target: 20,
          timeLeft: '5 days',
          participants: 234,
          isActive: true,
          isCompleted: false
        },
        {
          id: 'community_builder',
          title: 'Community Builder',
          description: 'Help verify 50 posts from the community',
          type: 'community',
          difficulty: 'easy',
          reward: 1.0,
          progress: user.profile?.total_stakes || 0,
          target: 50,
          timeLeft: '2 weeks',
          participants: 1250,
          isActive: true,
          isCompleted: false
        },
        {
          id: 'truth_legend',
          title: 'Truth Legend',
          description: 'Reach 100 reputation score',
          type: 'special',
          difficulty: 'legendary',
          reward: 15.0,
          progress: user.profile?.reputation_score || 0,
          target: 100,
          timeLeft: 'No limit',
          participants: 23,
          isActive: true,
          isCompleted: false
        }
      ];
      
      setChallenges(challengesData);
      
      // Generate leaderboard based on user reputation
      const leaderboardData: LeaderboardEntry[] = [
        { rank: 1, username: 'TruthSeeker87', score: 2847, avatar: '🏆' },
        { rank: 2, username: 'VerifyMaster', score: 2634, avatar: '🥈' },
        { rank: 3, username: 'AlgoValidator', score: 2521, avatar: '🥉' },
        { rank: 4, username: user.profile?.username || 'You', score: user.profile?.reputation_score || 100, avatar: '⭐' },
        { rank: 5, username: 'DataValidator', score: 2089, avatar: '📊' },
      ].sort((a, b) => b.score - a.score).map((entry, index) => ({ ...entry, rank: index + 1 }));
      
      setLeaderboard(leaderboardData);
      
    } catch (error) {
      console.error('Error loading challenges data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'legendary': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accuracy': return <Target className="w-5 h-5" />;
      case 'volume': return <Coins className="w-5 h-5" />;
      case 'streak': return <Flame className="w-5 h-5" />;
      case 'community': return <Users className="w-5 h-5" />;
      case 'special': return <Star className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  const activeChallenges = challenges.filter(c => c.isActive && !c.isCompleted);
  const completedChallenges = challenges.filter(c => c.isCompleted);
  const totalRewards = completedChallenges.reduce((sum, c) => sum + c.reward, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white">Loading challenges...</div>
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
              <Shield className="w-6 h-6 text-blue-400" />
              Challenges & Leaderboard
            </h1>
            <p className="text-gray-400 mt-1">Complete challenges to earn rewards and climb the ranks</p>
          </div>
          
          <div className="text-right">
            <p className="text-gray-400 text-sm">Total Earned</p>
            <p className="text-2xl font-bold text-yellow-400">{totalRewards.toFixed(1)} Ⱥ</p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Challenges</p>
                    <p className="text-2xl font-bold text-blue-400">{activeChallenges.length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{completedChallenges.length}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Your Rank</p>
                    <p className="text-2xl font-bold text-purple-400">
                      #{leaderboard.find(entry => entry.username === (user?.profile?.username || 'You'))?.rank || 'N/A'}
                    </p>
                  </div>
                  <Crown className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Your Score</p>
                    <p className="text-2xl font-bold text-yellow-400">{user?.profile?.reputation_score || 0}</p>
                  </div>
                  <Medal className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2"
        >
          <Button
            variant={activeTab === 'challenges' ? 'default' : 'outline'}
            onClick={() => setActiveTab('challenges')}
            className={activeTab === 'challenges' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-800/50 border-gray-600'}
          >
            <Shield className="w-4 h-4 mr-2" />
            Challenges
          </Button>
          <Button
            variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('leaderboard')}
            className={activeTab === 'leaderboard' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-800/50 border-gray-600'}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </Button>
        </motion.div>

        {/* Content based on active tab */}
        {activeTab === 'challenges' ? (
          <div className="space-y-4">
            {activeChallenges.length > 0 ? (
              activeChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900/50 border-gray-700/50 hover:border-gray-600/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(challenge.type)}
                          <div>
                            <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                            <p className="text-gray-400 text-sm">{challenge.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            {challenge.reward} Ⱥ
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{challenge.progress}/{challenge.target}</span>
                        </div>
                        <Progress 
                          value={(challenge.progress / challenge.target) * 100} 
                          className="h-2"
                        />
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{challenge.participants} participants</span>
                          <span>{challenge.timeLeft}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No active challenges</h3>
                <p className="text-gray-400">Check back later for new challenges!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-gray-900/50 border-gray-700/50 ${entry.username === (user?.profile?.username || 'You') ? 'ring-2 ring-purple-500/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{entry.avatar}</div>
                        <div>
                          <h3 className="text-white font-semibold">{entry.username}</h3>
                          <p className="text-gray-400 text-sm">Rank #{entry.rank}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">{entry.score.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 