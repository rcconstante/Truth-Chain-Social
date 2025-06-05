import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Search, 
  Mic, 
  MicOff, 
  Filter, 
  TrendingUp, 
  Clock, 
  User, 
  Hash, 
  Star, 
  Brain,
  Eye,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Target,
  Award
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { voiceAIService } from '../../lib/voice-ai-service';
import { useAuth } from '../../lib/auth';

interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'topic' | 'evidence';
  title: string;
  content: string;
  relevanceScore: number;
  credibilityScore?: number;
  author?: {
    username: string;
    avatar_url?: string;
    reputation_score: number;
  };
  metadata: {
    created_at: string;
    stake_amount?: number;
    upvotes?: number;
    challenges?: number;
    truth_score?: number;
  };
}

interface SearchFilters {
  type: 'all' | 'posts' | 'users' | 'topics' | 'evidence';
  timeframe: 'all' | 'week' | 'month' | 'year';
  stakeAmount: [number, number];
  truthScore: [number, number];
  userReputation: [number, number];
  sortBy: 'relevance' | 'recent' | 'popular' | 'credibility';
}

export function SearchSystem() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    timeframe: 'all',
    stakeAmount: [0, 100],
    truthScore: [0, 100],
    userReputation: [0, 1000],
    sortBy: 'relevance'
  });
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTrendingTopics();
    loadRecommendedPosts();
    loadSearchHistory();
  }, []);

  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults([]);
    }
  }, [query, filters]);

  const loadTrendingTopics = async () => {
    try {
      // Get trending topics based on recent post activity
      const { data: posts } = await supabase
        .from('posts')
        .select('category, content')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('upvotes', { ascending: false })
        .limit(50);

      if (posts) {
        const topicCounts = new Map<string, number>();
        posts.forEach(post => {
          const words = post.content.toLowerCase().split(/\s+/);
          words.forEach((word: string) => {
            if (word.length > 4) {
              topicCounts.set(word, (topicCounts.get(word) || 0) + 1);
            }
          });
        });

        const trending = Array.from(topicCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([topic]) => topic);

        setTrendingTopics(trending);
      }
    } catch (error) {
      console.error('Failed to load trending topics:', error);
    }
  };

  const loadRecommendedPosts = async () => {
    if (!user?.id) return;

    try {
      // Get user's interaction history to recommend similar posts
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('preferred_topics, expertise_areas')
        .eq('id', user.id)
        .single();

      if (userProfile) {
        const interests = [...(userProfile.preferred_topics || []), ...(userProfile.expertise_areas || [])];
        
        if (interests.length > 0) {
          const { data: posts } = await supabase
            .from('posts')
            .select(`
              id,
              content,
              stake_amount,
              upvotes,
              truth_score,
              created_at,
              profiles!user_id (
                username,
                avatar_url,
                reputation_score
              )
            `)
            .or(interests.map(topic => `content.ilike.%${topic}%`).join(','))
            .order('upvotes', { ascending: false })
            .limit(5);

          if (posts) {
            const recommended = posts.map(post => ({
              id: post.id,
              type: 'post' as const,
              title: post.content.substring(0, 100) + '...',
              content: post.content,
              relevanceScore: 85 + Math.random() * 15,
              credibilityScore: post.truth_score || 75,
              author: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
              metadata: {
                created_at: post.created_at,
                stake_amount: post.stake_amount,
                upvotes: post.upvotes,
                truth_score: post.truth_score
              }
            }));

            setRecommendedPosts(recommended);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load recommended posts:', error);
    }
  };

  const loadSearchHistory = () => {
    const history = localStorage.getItem('truthchain_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history).slice(0, 5));
    }
  };

  const saveSearchQuery = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const history = JSON.parse(localStorage.getItem('truthchain_search_history') || '[]');
    const updatedHistory = [searchQuery, ...history.filter((q: string) => q !== searchQuery)].slice(0, 10);
    localStorage.setItem('truthchain_search_history', JSON.stringify(updatedHistory));
    setSearchHistory(updatedHistory.slice(0, 5));
  };

  const performSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    saveSearchQuery(query);

    try {
      const searchResults: SearchResult[] = [];

      // Search posts
      if (filters.type === 'all' || filters.type === 'posts') {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id,
            content,
            stake_amount,
            upvotes,
            challenges,
            truth_score,
            created_at,
            profiles!user_id (
              username,
              avatar_url,
              reputation_score
            )
          `)
          .or(`content.ilike.%${query}%, category.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (posts) {
          posts.forEach(post => {
            const relevanceScore = calculateRelevanceScore(query, post.content);
            const credibilityScore = calculateCredibilityScore(post);
            
            searchResults.push({
              id: post.id,
              type: 'post',
              title: post.content.substring(0, 100) + '...',
              content: post.content,
              relevanceScore,
              credibilityScore,
              author: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
              metadata: {
                created_at: post.created_at,
                stake_amount: post.stake_amount,
                upvotes: post.upvotes,
                challenges: post.challenges,
                truth_score: post.truth_score
              }
            });
          });
        }
      }

      // Search users
      if (filters.type === 'all' || filters.type === 'users') {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, username, bio, avatar_url, reputation_score, accuracy_rate, created_at')
          .or(`username.ilike.%${query}%, bio.ilike.%${query}%`)
          .limit(10);

        if (users) {
          users.forEach(userProfile => {
            const relevanceScore = calculateRelevanceScore(query, userProfile.username + ' ' + (userProfile.bio || ''));
            
            searchResults.push({
              id: userProfile.id,
              type: 'user',
              title: userProfile.username,
              content: userProfile.bio || 'Truth seeker and community member',
              relevanceScore,
              author: {
                username: userProfile.username,
                avatar_url: userProfile.avatar_url,
                reputation_score: userProfile.reputation_score
              },
              metadata: {
                created_at: userProfile.created_at
              }
            });
          });
        }
      }

      // Apply filters and sorting
      const filteredResults = applyFilters(searchResults);
      setResults(filteredResults);

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateRelevanceScore = (searchQuery: string, content: string): number => {
    const query = searchQuery.toLowerCase();
    const text = content.toLowerCase();
    
    let score = 0;
    
    // Exact match bonus
    if (text.includes(query)) score += 50;
    
    // Word match bonus
    const queryWords = query.split(' ');
    const textWords = text.split(' ');
    const matchedWords = queryWords.filter(qWord => 
      textWords.some(tWord => tWord.includes(qWord))
    );
    score += (matchedWords.length / queryWords.length) * 30;
    
    // Semantic similarity bonus (simplified)
    const semanticKeywords = getSemanticKeywords(query);
    const semanticMatches = semanticKeywords.filter(keyword => text.includes(keyword));
    score += semanticMatches.length * 5;
    
    return Math.min(score, 100);
  };

  const calculateCredibilityScore = (post: any): number => {
    let score = 50; // Base score
    
    // Truth score contribution
    if (post.truth_score) score += (post.truth_score - 50) * 0.5;
    
    // Stake amount influence
    if (post.stake_amount > 1) score += Math.min(post.stake_amount * 2, 20);
    
    // Community engagement
    if (post.upvotes > 5) score += Math.min(post.upvotes, 15);
    if (post.challenges > 0) score -= Math.min(post.challenges * 5, 20);
    
    // Author reputation
    const authorRep = Array.isArray(post.profiles) ? post.profiles[0]?.reputation_score : post.profiles?.reputation_score;
    if (authorRep > 500) score += 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const getSemanticKeywords = (query: string): string[] => {
    const semanticMap: Record<string, string[]> = {
      'climate': ['environment', 'global warming', 'carbon', 'temperature', 'weather'],
      'health': ['medical', 'doctor', 'disease', 'treatment', 'medicine'],
      'politics': ['government', 'election', 'policy', 'vote', 'democracy'],
      'technology': ['AI', 'software', 'digital', 'computer', 'internet'],
      'science': ['research', 'study', 'experiment', 'data', 'evidence']
    };
    
    const keywords: string[] = [];
    Object.entries(semanticMap).forEach(([key, values]) => {
      if (query.toLowerCase().includes(key)) {
        keywords.push(...values);
      }
    });
    
    return keywords;
  };

  const applyFilters = (results: SearchResult[]): SearchResult[] => {
    let filtered = results;

    // Apply timeframe filter
    if (filters.timeframe !== 'all') {
      const cutoffDate = new Date();
      if (filters.timeframe === 'week') cutoffDate.setDate(cutoffDate.getDate() - 7);
      if (filters.timeframe === 'month') cutoffDate.setMonth(cutoffDate.getMonth() - 1);
      if (filters.timeframe === 'year') cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
      
      filtered = filtered.filter(result => 
        new Date(result.metadata.created_at) >= cutoffDate
      );
    }

    // Apply stake amount filter
    filtered = filtered.filter(result => {
      const stakeAmount = result.metadata.stake_amount || 0;
      return stakeAmount >= filters.stakeAmount[0] && stakeAmount <= filters.stakeAmount[1];
    });

    // Apply truth score filter
    filtered = filtered.filter(result => {
      const truthScore = result.credibilityScore || 50;
      return truthScore >= filters.truthScore[0] && truthScore <= filters.truthScore[1];
    });

    // Apply user reputation filter
    filtered = filtered.filter(result => {
      const reputation = result.author?.reputation_score || 100;
      return reputation >= filters.userReputation[0] && reputation <= filters.userReputation[1];
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          return new Date(b.metadata.created_at).getTime() - new Date(a.metadata.created_at).getTime();
        case 'popular':
          return (b.metadata.upvotes || 0) - (a.metadata.upvotes || 0);
        case 'credibility':
          return (b.credibilityScore || 0) - (a.credibilityScore || 0);
        default: // relevance
          return b.relevanceScore - a.relevanceScore;
      }
    });

    return filtered;
  };

  const startVoiceSearch = async () => {
    if (!isVoiceSearch) {
      setIsVoiceSearch(true);
      
      try {
        voiceAIService.startRealTimeSpeechToText(
          (transcript, isFinal) => {
            if (isFinal) {
              setQuery(transcript);
              setIsVoiceSearch(false);
            } else {
              // Show interim results
              setQuery(transcript);
            }
          }
        );
      } catch (error) {
        console.error('Voice search failed:', error);
        setIsVoiceSearch(false);
      }
    } else {
      voiceAIService.stopRealTimeSpeechToText();
      setIsVoiceSearch(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />;
      case 'topic': return <Hash className="w-4 h-4" />;
      case 'evidence': return <ExternalLink className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getCredibilityColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Search className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Truth Discovery</h2>
              <p className="text-gray-400">Find verified information and discover truth in the community</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search posts, users, topics, or evidence..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10 pr-12 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                />
                {isSearching && (
                  <motion.div
                    className="absolute right-3 top-3"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </motion.div>
                )}
              </div>
              
              <Button
                onClick={startVoiceSearch}
                variant="outline"
                className={`h-12 border-gray-600 ${isVoiceSearch ? 'bg-red-500/20 border-red-500' : ''}`}
              >
                {isVoiceSearch ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="h-12 border-gray-600"
              >
                <Filter className="w-5 h-5" />
              </Button>
            </div>

            {/* Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && (searchHistory.length > 0 || trendingTopics.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                >
                  {searchHistory.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Searches</h4>
                      <div className="space-y-1">
                        {searchHistory.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(search)}
                            className="w-full text-left p-2 hover:bg-gray-700/50 rounded text-sm text-gray-300"
                          >
                            <Clock className="w-3 h-3 inline mr-2" />
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {trendingTopics.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Trending Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {trendingTopics.map((topic, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(topic)}
                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs hover:bg-purple-500/30"
                          >
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics Section */}
      {!query && trendingTopics.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {trendingTopics.map((topic, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestionClick(topic)}
                  className="p-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg text-left hover:border-orange-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-orange-400" />
                    <span className="text-white font-medium capitalize">{topic}</span>
                  </div>
                  <p className="text-gray-400 text-xs">#{index + 1} trending</p>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Search Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Content Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Content Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value as any})}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    >
                      <option value="all">All Content</option>
                      <option value="posts">Posts Only</option>
                      <option value="users">Users Only</option>
                      <option value="topics">Topics Only</option>
                      <option value="evidence">Evidence Only</option>
                    </select>
                  </div>

                  {/* Timeframe Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Timeframe</label>
                    <select
                      value={filters.timeframe}
                      onChange={(e) => setFilters({...filters, timeframe: e.target.value as any})}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    >
                      <option value="all">All Time</option>
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                      <option value="year">Past Year</option>
                    </select>
                  </div>

                  {/* Sort By Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                      className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="credibility">Highest Credibility</option>
                    </select>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-end">
                    <Button
                      onClick={() => setFilters({
                        type: 'all',
                        timeframe: 'all',
                        stakeAmount: [0, 100],
                        truthScore: [0, 100],
                        userReputation: [0, 1000],
                        sortBy: 'relevance'
                      })}
                      variant="outline"
                      className="w-full border-gray-600"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommended Posts (when no search query) */}
      {!query && recommendedPosts.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedPosts.map((post) => (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-purple-500/30"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.author?.avatar_url} />
                      <AvatarFallback>{post.author?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{post.author?.username}</span>
                        <Badge variant="outline" className="text-xs">
                          Rep: {post.author?.reputation_score}
                        </Badge>
                        <Badge className={getCredibilityColor(post.credibilityScore)}>
                          {post.credibilityScore?.toFixed(0)}% credible
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{post.title}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{post.metadata.stake_amount} ALGO staked</span>
                        <span>{post.metadata.upvotes} upvotes</span>
                        <span>{new Date(post.metadata.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {query && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle>
              Search Results for "{query}" ({results.length} found)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-400">Try adjusting your search query or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-purple-500/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-700/50 rounded-lg">
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {result.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {result.relevanceScore.toFixed(0)}% match
                          </Badge>
                          {result.credibilityScore && (
                            <Badge className={getCredibilityColor(result.credibilityScore)}>
                              {result.credibilityScore.toFixed(0)}% credible
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-white mb-1">{result.title}</h3>
                        <p className="text-gray-300 text-sm mb-3">{result.content}</p>
                        
                        {result.author && (
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={result.author.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {result.author.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-400">
                              @{result.author.username}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Rep: {result.author.reputation_score}
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {result.metadata.stake_amount && (
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {result.metadata.stake_amount} ALGO
                            </span>
                          )}
                          {result.metadata.upvotes && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {result.metadata.upvotes} upvotes
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(result.metadata.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 