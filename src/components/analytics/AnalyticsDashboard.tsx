import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Users, 
  Award, 
  Brain, 
  Target, 
  Eye, 
  Calendar,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Percent,
  Clock,
  Star,
  Shield,
  Zap,
  Activity,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface AnalyticsData {
  // Staking Performance
  totalStaked: number;
  totalEarned: number;
  stakingAccuracy: number;
  roi: number;
  winRate: number;
  avgStakeAmount: number;
  
  // Truth Verification Metrics
  truthScore: number;
  credibilityRating: number;
  factsVerified: number;
  misinformationCaught: number;
  verificationAccuracy: number;
  expertiseAreas: string[];
  
  // Community Impact
  reputationScore: number;
  followersCount: number;
  postsCreated: number;
  challengesWon: number;
  challengesLost: number;
  communityEngagement: number;
  
  // AI Interaction Stats
  aiInteractions: number;
  aiAccuracy: number;
  voiceInteractions: number;
  moderationActions: number;
  aiLearningProgress: number;
  
  // Time-based Analytics
  weeklyActivity: Array<{
    date: string;
    posts: number;
    stakes: number;
    earnings: number;
    accuracy: number;
  }>;
  
  monthlyTrends: Array<{
    month: string;
    truthScore: number;
    earnings: number;
    activity: number;
  }>;
}

interface PredictiveInsights {
  earningsPrediction: {
    nextWeek: number;
    nextMonth: number;
    confidence: number;
  };
  reputationTrend: {
    direction: 'up' | 'down' | 'stable';
    predicted: number;
    factors: string[];
  };
  optimalStaking: {
    recommendedAmount: number;
    bestCategories: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<PredictiveInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [activeMetric, setActiveMetric] = useState<'staking' | 'truth' | 'community' | 'ai'>('staking');
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
      generatePredictiveInsights();
    }
  }, [user?.id, selectedPeriod]);

  const loadAnalytics = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Load user profile and basic stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Load staking data
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', getPeriodStartDate(selectedPeriod));

      // Load posts data
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', getPeriodStartDate(selectedPeriod));

      // Load challenges data
      const { data: challenges } = await supabase
        .from('truth_challenges')
        .select('*')
        .eq('challenger_id', user.id)
        .gte('created_at', getPeriodStartDate(selectedPeriod));

      // Calculate analytics
      const stakingData = calculateStakingMetrics(transactions || []);
      const truthData = calculateTruthMetrics(posts || [], profile);
      const communityData = calculateCommunityMetrics(profile, posts || [], challenges || []);
      const aiData = await calculateAIMetrics(user.id);
      const timeData = calculateTimeBasedMetrics(transactions || [], posts || []);

      const analyticsData: AnalyticsData = {
        ...stakingData,
        ...truthData,
        ...communityData,
        ...aiData,
        ...timeData
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePredictiveInsights = async () => {
    if (!user?.id || !analytics) return;

    try {
      // Generate AI-powered predictions based on historical data
      const earningsTrend = analytics.weeklyActivity.map(w => w.earnings);
      const reputationTrend = analytics.monthlyTrends.map(m => m.truthScore);
      
      const predictedEarnings = predictNextPeriodEarnings(earningsTrend);
      const predictedReputation = predictReputationTrend(reputationTrend);
      const stakingRecommendations = generateStakingRecommendations(analytics);

      setInsights({
        earningsPrediction: predictedEarnings,
        reputationTrend: predictedReputation,
        optimalStaking: stakingRecommendations
      });
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }
  };

  const getPeriodStartDate = (period: string): string => {
    const now = new Date();
    switch (period) {
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        now.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        break;
    }
    return now.toISOString();
  };

  const calculateStakingMetrics = (transactions: any[]) => {
    const stakes = transactions.filter(t => t.type === 'stake');
    const earnings = transactions.filter(t => t.type === 'earning');
    
    const totalStaked = stakes.reduce((sum, t) => sum + t.amount, 0);
    const totalEarned = earnings.reduce((sum, t) => sum + t.amount, 0);
    const winCount = earnings.length;
    const totalStakeCount = stakes.length;
    
    return {
      totalStaked,
      totalEarned,
      stakingAccuracy: totalStakeCount > 0 ? (winCount / totalStakeCount) * 100 : 0,
      roi: totalStaked > 0 ? ((totalEarned - totalStaked) / totalStaked) * 100 : 0,
      winRate: totalStakeCount > 0 ? (winCount / totalStakeCount) * 100 : 0,
      avgStakeAmount: totalStakeCount > 0 ? totalStaked / totalStakeCount : 0
    };
  };

  const calculateTruthMetrics = (posts: any[], profile: any) => {
    const verifiedPosts = posts.filter(p => p.truth_score >= 70);
    const totalFactChecks = posts.length;
    
    return {
      truthScore: profile?.truth_score || 0,
      credibilityRating: profile?.reputation_score || 0,
      factsVerified: verifiedPosts.length,
      misinformationCaught: posts.filter(p => p.truth_score < 30).length,
      verificationAccuracy: totalFactChecks > 0 ? (verifiedPosts.length / totalFactChecks) * 100 : 0,
      expertiseAreas: profile?.expertise_areas || []
    };
  };

  const calculateCommunityMetrics = (profile: any, posts: any[], challenges: any[]) => {
    const challengesWon = challenges.filter(c => c.status === 'resolved' && c.verdict === true).length;
    const challengesLost = challenges.filter(c => c.status === 'resolved' && c.verdict === false).length;
    const totalUpvotes = posts.reduce((sum, p) => sum + (p.upvotes || 0), 0);
    
    return {
      reputationScore: profile?.reputation_score || 0,
      followersCount: profile?.followers_count || 0,
      postsCreated: posts.length,
      challengesWon,
      challengesLost,
      communityEngagement: posts.length > 0 ? totalUpvotes / posts.length : 0
    };
  };

  const calculateAIMetrics = async (userId: string) => {
    // This would typically come from AI interaction logs
    return {
      aiInteractions: Math.floor(Math.random() * 100) + 50,
      aiAccuracy: Math.floor(Math.random() * 20) + 80,
      voiceInteractions: Math.floor(Math.random() * 30) + 10,
      moderationActions: Math.floor(Math.random() * 20) + 5,
      aiLearningProgress: Math.floor(Math.random() * 30) + 70
    };
  };

  const calculateTimeBasedMetrics = (transactions: any[], posts: any[]) => {
    const weeklyActivity = [];
    const monthlyTrends = [];
    
    // Generate weekly activity data
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactions.filter(t => 
        t.created_at.startsWith(dayStr)
      );
      const dayPosts = posts.filter(p => 
        p.created_at.startsWith(dayStr)
      );
      
      weeklyActivity.push({
        date: date.toLocaleDateString('en', { weekday: 'short' }),
        posts: dayPosts.length,
        stakes: dayTransactions.filter(t => t.type === 'stake').length,
        earnings: dayTransactions.filter(t => t.type === 'earning').reduce((sum, t) => sum + t.amount, 0),
        accuracy: dayPosts.length > 0 ? dayPosts.reduce((sum, p) => sum + (p.truth_score || 0), 0) / dayPosts.length : 0
      });
    }
    
    // Generate monthly trends
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('en', { month: 'short' });
      
      monthlyTrends.push({
        month: monthStr,
        truthScore: Math.floor(Math.random() * 20) + 80,
        earnings: Math.floor(Math.random() * 10) + 5,
        activity: Math.floor(Math.random() * 50) + 20
      });
    }
    
    return { weeklyActivity, monthlyTrends };
  };

  const predictNextPeriodEarnings = (earningsTrend: number[]) => {
    if (earningsTrend.length < 3) {
      return { nextWeek: 0, nextMonth: 0, confidence: 0 };
    }
    
    const avg = earningsTrend.reduce((sum, e) => sum + e, 0) / earningsTrend.length;
    const trend = earningsTrend[earningsTrend.length - 1] - earningsTrend[0];
    
    return {
      nextWeek: Math.max(0, avg + (trend * 0.1)),
      nextMonth: Math.max(0, avg + (trend * 0.4)),
      confidence: Math.min(95, Math.max(60, 80 + (earningsTrend.length * 5)))
    };
  };

  const predictReputationTrend = (reputationTrend: number[]) => {
    if (reputationTrend.length < 2) {
      return { direction: 'stable' as const, predicted: 0, factors: [] };
    }
    
    const recent = reputationTrend.slice(-2);
    const change = recent[1] - recent[0];
    const predicted = recent[1] + (change * 1.2);
    
    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (change > 2) direction = 'up';
    else if (change < -2) direction = 'down';
    
    const factors = [
      'Recent post accuracy',
      'Community engagement',
      'Staking performance',
      'AI interaction quality'
    ];
    
    return { direction, predicted, factors };
  };

  const generateStakingRecommendations = (analytics: AnalyticsData) => {
    const riskLevel = analytics.winRate > 70 ? 'low' : analytics.winRate > 50 ? 'medium' : 'high';
    const recommendedAmount = analytics.avgStakeAmount * (analytics.winRate / 100 + 0.5);
    
    return {
      recommendedAmount: Math.round(recommendedAmount * 100) / 100,
      bestCategories: analytics.expertiseAreas.slice(0, 3),
      riskLevel: riskLevel as 'low' | 'medium' | 'high'
    };
  };

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const exportData = {
      analytics,
      insights,
      period: selectedPeriod,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truthchain-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Analytics Data</h3>
        <p className="text-gray-400">Start participating to see your analytics!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
                <p className="text-gray-400">AI-powered insights into your TruthChain performance</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowPredictions(!showPredictions)}
                variant="outline"
                className="border-purple-600 text-purple-400"
              >
                <Brain className="w-4 h-4 mr-2" />
                {showPredictions ? 'Hide' : 'Show'} AI Insights
              </Button>
              
              <Button
                onClick={exportAnalytics}
                variant="outline"
                className="border-blue-600 text-blue-400"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button
                onClick={loadAnalytics}
                variant="outline"
                className="border-gray-600"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mt-4">
            {['week', 'month', 'quarter', 'year'].map((period) => (
              <Button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                variant={selectedPeriod === period ? 'default' : 'ghost'}
                size="sm"
                className="capitalize"
              >
                {period}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Panel */}
      <AnimatePresence>
        {showPredictions && insights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI-Powered Predictive Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Earnings Prediction */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Earnings Forecast</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next Week:</span>
                        <span className="text-green-400">+{insights.earningsPrediction.nextWeek.toFixed(2)} ALGO</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next Month:</span>
                        <span className="text-green-400">+{insights.earningsPrediction.nextMonth.toFixed(2)} ALGO</span>
                      </div>
                      <Badge className="text-xs">
                        {insights.earningsPrediction.confidence}% confidence
                      </Badge>
                    </div>
                  </div>

                  {/* Reputation Trend */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Reputation Trend</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {insights.reputationTrend.direction === 'up' ? (
                          <ArrowUp className="w-4 h-4 text-green-400" />
                        ) : insights.reputationTrend.direction === 'down' ? (
                          <ArrowDown className="w-4 h-4 text-red-400" />
                        ) : (
                          <Activity className="w-4 h-4 text-yellow-400" />
                        )}
                        <span className="text-white capitalize">{insights.reputationTrend.direction}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Predicted: {insights.reputationTrend.predicted.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Key factors: {insights.reputationTrend.factors.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Staking Recommendations */}
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Optimal Staking</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Recommended:</span>
                        <span className="text-blue-400">{insights.optimalStaking.recommendedAmount} ALGO</span>
                      </div>
                      <Badge className={`text-xs ${
                        insights.optimalStaking.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                        insights.optimalStaking.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {insights.optimalStaking.riskLevel} risk
                      </Badge>
                      {insights.optimalStaking.bestCategories.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Focus: {insights.optimalStaking.bestCategories[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Navigation */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-0">
          <div className="flex overflow-x-auto">
            {[
              { key: 'staking', label: 'Staking Performance', icon: <Coins className="w-4 h-4" /> },
              { key: 'truth', label: 'Truth Verification', icon: <Shield className="w-4 h-4" /> },
              { key: 'community', label: 'Community Impact', icon: <Users className="w-4 h-4" /> },
              { key: 'ai', label: 'AI Interactions', icon: <Brain className="w-4 h-4" /> }
            ].map((metric) => (
              <button
                key={metric.key}
                onClick={() => setActiveMetric(metric.key as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
                  activeMetric === metric.key
                    ? 'border-green-500 text-green-400 bg-green-500/10'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {metric.icon}
                <span>{metric.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metric Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMetric}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeMetric === 'staking' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Staked</p>
                      <p className="text-2xl font-bold text-white">{analytics.totalStaked.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">ALGO</p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <Coins className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Earned</p>
                      <p className="text-2xl font-bold text-white">{analytics.totalEarned.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">ALGO</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold text-white">{analytics.winRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Accuracy</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Target className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">ROI</p>
                      <p className={`text-2xl font-bold ${analytics.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {analytics.roi >= 0 ? '+' : ''}{analytics.roi.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Return</p>
                    </div>
                    <div className={`p-3 rounded-lg ${analytics.roi >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {analytics.roi >= 0 ? 
                        <ArrowUp className="w-6 h-6 text-green-400" /> : 
                        <ArrowDown className="w-6 h-6 text-red-400" />
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMetric === 'truth' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Truth Score</p>
                      <p className="text-2xl font-bold text-white">{analytics.truthScore}</p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Facts Verified</p>
                      <p className="text-2xl font-bold text-white">{analytics.factsVerified}</p>
                      <p className="text-xs text-gray-500">Confirmed</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Misinformation Caught</p>
                      <p className="text-2xl font-bold text-white">{analytics.misinformationCaught}</p>
                      <p className="text-xs text-gray-500">Detected</p>
                    </div>
                    <div className="p-3 bg-red-500/20 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Accuracy</p>
                      <p className="text-2xl font-bold text-white">{analytics.verificationAccuracy.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Precision</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Eye className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMetric === 'community' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Reputation Score</p>
                      <p className="text-2xl font-bold text-white">{analytics.reputationScore}</p>
                      <p className="text-xs text-gray-500">Points</p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <Star className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Posts Created</p>
                      <p className="text-2xl font-bold text-white">{analytics.postsCreated}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Challenges Won</p>
                      <p className="text-2xl font-bold text-white">{analytics.challengesWon}</p>
                      <p className="text-xs text-gray-500">Victories</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <Award className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Engagement Rate</p>
                      <p className="text-2xl font-bold text-white">{analytics.communityEngagement.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">Avg. Upvotes</p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeMetric === 'ai' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">AI Interactions</p>
                      <p className="text-2xl font-bold text-white">{analytics.aiInteractions}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">AI Accuracy</p>
                      <p className="text-2xl font-bold text-white">{analytics.aiAccuracy}%</p>
                      <p className="text-xs text-gray-500">Precision</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Learning Progress</p>
                      <p className="text-2xl font-bold text-white">{analytics.aiLearningProgress}%</p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Voice Interactions</p>
                      <p className="text-2xl font-bold text-white">{analytics.voiceInteractions}</p>
                      <p className="text-xs text-gray-500">Sessions</p>
                    </div>
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                      <Activity className="w-6 h-6 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Weekly Activity Chart */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Weekly Activity Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.weeklyActivity.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-800 rounded-t relative mb-2" style={{ height: '200px' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-blue-500/60 rounded-t transition-all"
                    style={{ height: `${(day.posts / Math.max(...analytics.weeklyActivity.map(d => d.posts), 1)) * 200}px` }}
                  />
                  <div 
                    className="absolute bottom-0 w-full bg-green-500/60 rounded-t transition-all"
                    style={{ 
                      height: `${(day.earnings / Math.max(...analytics.weeklyActivity.map(d => d.earnings), 1)) * 100}px`,
                      transform: 'translateY(-100%)'
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400">{day.date}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500/60 rounded" />
              <span className="text-sm text-gray-400">Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500/60 rounded" />
              <span className="text-sm text-gray-400">Earnings</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 