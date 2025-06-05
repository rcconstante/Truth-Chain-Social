import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Settings, Trophy, Star, Target, Shield, 
  Edit, Save, Camera, Mail, Phone, MapPin, Calendar,
  Award, Coins, TrendingUp, Eye, MessageCircle, Palette,
  Globe, Bot, Lock, Key, Bell, Volume2, Accessibility,
  Type, Contrast, Languages, Monitor, Smartphone, Mic,
  DollarSign, Clock, Download, Trash2, AlertTriangle,
  Check, X, Moon, Sun, ZoomIn, Video
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';
import { Textarea } from '../../components/ui/textarea';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useToast } from '../../components/ui/use-toast';
import { useAuth } from '../../lib/auth';
import { useTheme } from '../../contexts/ThemeContext';
import { getAccountInfo, formatBalance } from '../../lib/algorand';

interface UserSettings {
  // Profile Settings
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  email: string;
  is_private: boolean;
  
  // Platform Preferences  
  theme: 'dark' | 'light' | 'auto';
  language: string;
  currency: 'ALGO' | 'USD' | 'EUR';
  timezone: string;
  
  // AI & Voice Settings
  preferred_ai_moderators: string[];
  ai_voice_gender: 'male' | 'female' | 'neutral';
  fact_check_sensitivity: number;
  ai_learning_mode: 'beginner' | 'intermediate' | 'expert';
  
  // Staking Preferences
  default_stake_amounts: {
    low_confidence: number;
    medium_confidence: number; 
    high_confidence: number;
  };
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  auto_challenge_enabled: boolean;
  max_daily_stake: number;
  
  // Security & Privacy
  two_factor_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  data_sharing: boolean;
  
  // Accessibility
  font_size: number;
  high_contrast: boolean;
  reduced_motion: boolean;
  screen_reader_mode: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' }
];

const AI_MODERATORS = [
  'Dr. Sarah Chen',
  'Professor Marcus Williams',
  'Tech Expert Sam Rivera', 
  'Dr. Alex Thompson'
];

export function Profile() {
  const { user, updateProfile, unlinkWallet } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'platform' | 'ai' | 'staking' | 'security' | 'accessibility'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [realAlgoBalance, setRealAlgoBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<UserSettings>({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    email: '',
    is_private: false,
    theme: theme,
    language: 'en',
    currency: 'ALGO',
    timezone: 'UTC+00:00',
    preferred_ai_moderators: ['Dr. Sarah Chen'],
    ai_voice_gender: 'female',
    fact_check_sensitivity: 50,
    ai_learning_mode: 'intermediate',
    default_stake_amounts: {
      low_confidence: 0.1,
      medium_confidence: 0.5,
      high_confidence: 1.0
    },
    risk_tolerance: 'moderate',
    auto_challenge_enabled: false,
    max_daily_stake: 10,
    two_factor_enabled: false,
    email_notifications: true,
    push_notifications: true,
    data_sharing: false,
    font_size: 16,
    high_contrast: false,
    reduced_motion: false,
    screen_reader_mode: false
  });

  useEffect(() => {
    if (user?.profile) {
      setSettings(prev => ({
        ...prev,
        username: user.profile?.username || '',
        display_name: user.profile?.username || '',
        bio: user.profile?.bio || '',
        avatar_url: user.profile?.avatar_url || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('truthchain-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  const saveSettingsToStorage = (newSettings: UserSettings) => {
    localStorage.setItem('truthchain-settings', JSON.stringify(newSettings));
  };

  // Fetch real ALGO balance
  useEffect(() => {
    const fetchRealAlgoBalance = async () => {
      if (!user?.profile?.algo_address) return;
      
      try {
        setLoadingBalance(true);
        const accountInfo = await getAccountInfo(user.profile.algo_address);
        setRealAlgoBalance(accountInfo.balance / 1000000);
      } catch (error) {
        console.error('Error fetching real ALGO balance:', error);
        setRealAlgoBalance(user?.profile?.algo_balance || 0);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchRealAlgoBalance();
  }, [user?.profile?.algo_address, user?.profile?.algo_balance]);

  const handleSave = async () => {
    if (!user?.profile) return;
    
    try {
      setLoading(true);
      const updated = await updateProfile({
        username: settings.username,
        bio: settings.bio,
        avatar_url: settings.avatar_url
      });
      
      if (updated) {
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
    
    // Handle theme changes immediately
    if (key === 'theme') {
      setTheme(value);
    }
  };

  const updateNestedSetting = (parentKey: keyof UserSettings, childKey: string, value: any) => {
    const newSettings = {
      ...settings,
      [parentKey]: {
        ...(settings[parentKey] as any),
        [childKey]: value
      }
    };
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
  };

  // Achievement logic
  const achievements = [
    { 
      id: 'first_truth', 
      name: 'First Truth', 
      description: 'Created your first truth post', 
      icon: '🎯', 
      earned: (user?.profile?.total_stakes || 0) > 0
    },
    { 
      id: 'accuracy_expert', 
      name: 'Accuracy Expert', 
      description: '95%+ accuracy rate with 10+ verifications', 
      icon: '🏹', 
      earned: (user?.profile?.accuracy_rate || 0) >= 0.95 && (user?.profile?.successful_challenges || 0) >= 10
    },
    { 
      id: 'high_stakes', 
      name: 'High Stakes Player', 
      description: 'Staked 50+ ALGO total', 
      icon: '💎', 
      earned: (user?.profile?.total_stakes || 0) >= 50
    },
    { 
      id: 'community_verifier', 
      name: 'Community Verifier', 
      description: 'Successfully verified 25+ posts', 
      icon: '👥', 
      earned: (user?.profile?.successful_challenges || 0) >= 25
    },
    { 
      id: 'truth_master', 
      name: 'Truth Master', 
      description: 'Reached 150+ reputation score', 
      icon: '⭐', 
      earned: (user?.profile?.reputation_score || 0) >= 150
    }
  ];

  const stats = [
    { 
      label: 'Truth Score', 
      value: (user?.profile?.reputation_score || 0).toString(), 
      icon: Star, 
      color: 'text-yellow-400' 
    },
    { 
      label: 'Accuracy Rate', 
      value: user?.profile?.total_stakes && user?.profile?.total_stakes > 0 
        ? `${((user?.profile?.successful_challenges || 0) / (user?.profile?.total_stakes || 1) * 100).toFixed(0)}%`
        : '0%', 
      icon: Target, 
      color: 'text-green-400' 
    },
    { 
      label: 'Total Balance', 
      value: loadingBalance ? 'Loading...' : `${realAlgoBalance.toFixed(3)} Ⱥ`, 
      icon: Coins, 
      color: 'text-blue-400' 
    },
    { 
      label: 'ALGO Balance', 
      value: loadingBalance ? 'Loading...' : `${realAlgoBalance.toFixed(3)} Ⱥ`, 
      icon: Coins, 
      color: 'text-purple-400' 
    }
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, color: 'text-blue-400' },
    { id: 'platform', label: 'Platform', icon: Settings, color: 'text-purple-400' },
    { id: 'ai', label: 'AI & Voice', icon: Bot, color: 'text-green-400' },
    { id: 'staking', label: 'Staking', icon: Coins, color: 'text-yellow-400' },
    { id: 'security', label: 'Security', icon: Shield, color: 'text-red-400' },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility, color: 'text-cyan-400' }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              Profile & Settings
            </h1>
            <p className="text-muted-foreground mt-1">Manage your account, preferences, and achievements</p>
          </div>
          {activeTab === 'profile' && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? `border-purple-500 ${tab.color} bg-purple-500/10`
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Overview */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <User className="w-5 h-5 text-blue-400" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Avatar Section */}
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="w-24 h-24 ring-4 ring-purple-500/30">
                          <AvatarImage src={settings.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${settings.username || 'user'}`} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-2xl">
                            {settings.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button variant="outline" size="sm">
                            <Camera className="w-4 h-4 mr-2" />
                            Change Avatar
                          </Button>
                        )}
                      </div>

                      {/* Profile Fields */}
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                              id="username"
                              value={settings.username}
                              onChange={(e) => updateSetting('username', e.target.value)}
                              disabled={!isEditing}
                              className="bg-background border-border"
                            />
                          </div>
                          <div>
                            <Label htmlFor="display_name">Display Name</Label>
                            <Input
                              id="display_name"
                              value={settings.display_name}
                              onChange={(e) => updateSetting('display_name', e.target.value)}
                              disabled={!isEditing}
                              className="bg-background border-border"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={settings.bio}
                            onChange={(e) => updateSetting('bio', e.target.value)}
                            disabled={!isEditing}
                            className="bg-background border-border"
                            rows={3}
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={settings.email}
                            onChange={(e) => updateSetting('email', e.target.value)}
                            disabled={!isEditing}
                            className="bg-background border-border"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-card border-border">
                        <CardContent className="p-4 text-center">
                          <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                          <div className="text-card-foreground font-bold text-lg">{stat.value}</div>
                          <div className="text-muted-foreground text-sm">{stat.label}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Achievements */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Achievements ({earnedAchievements.length}/{achievements.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-lg border transition-all ${
                            achievement.earned
                              ? 'border-yellow-500/30 bg-yellow-500/10'
                              : 'border-border bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{achievement.icon}</span>
                            <div className="flex-1">
                              <h3 className={`font-semibold ${achievement.earned ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                                {achievement.name}
                              </h3>
                              {achievement.earned && (
                                <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                                  Earned
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm">{achievement.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Platform Tab */}
            {activeTab === 'platform' && (
              <div className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Settings className="w-5 h-5 text-purple-400" />
                      Platform Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label>Theme</Label>
                        <div className="flex gap-2 mt-2">
                          {[
                            { value: 'dark', label: 'Dark', icon: Moon },
                            { value: 'light', label: 'Light', icon: Sun },
                            { value: 'auto', label: 'Auto', icon: Monitor }
                          ].map((theme) => (
                            <button
                              key={theme.value}
                              onClick={() => updateSetting('theme', theme.value)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                settings.theme === theme.value
                                  ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                                  : 'border-border text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <theme.icon className="w-4 h-4" />
                              {theme.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="language">Language</Label>
                        <select
                          id="language"
                          value={settings.language}
                          onChange={(e) => updateSetting('language', e.target.value)}
                          className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="currency">Preferred Currency</Label>
                        <select
                          id="currency"
                          value={settings.currency}
                          onChange={(e) => updateSetting('currency', e.target.value)}
                          className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                        >
                          <option value="ALGO">ALGO</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          value={settings.timezone}
                          onChange={(e) => updateSetting('timezone', e.target.value)}
                          className="w-full mt-2 px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                        >
                          {['UTC-12:00', 'UTC-08:00', 'UTC-05:00', 'UTC+00:00', 'UTC+01:00', 'UTC+08:00', 'UTC+09:00'].map((tz) => (
                            <option key={tz} value={tz}>{tz}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* AI & Voice Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Bot className="w-5 h-5 text-green-400" />
                      AI & Voice Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Preferred AI Moderators</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {AI_MODERATORS.map((moderator) => (
                          <label key={moderator} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                            <input
                              type="checkbox"
                              checked={settings.preferred_ai_moderators.includes(moderator)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateSetting('preferred_ai_moderators', [...settings.preferred_ai_moderators, moderator]);
                                } else {
                                  updateSetting('preferred_ai_moderators', settings.preferred_ai_moderators.filter(m => m !== moderator));
                                }
                              }}
                              className="rounded border-border"
                            />
                            <span className="text-foreground">{moderator}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>AI Voice Gender</Label>
                      <div className="flex gap-2 mt-2">
                        {[
                          { value: 'female', label: 'Female' },
                          { value: 'male', label: 'Male' },
                          { value: 'neutral', label: 'Neutral' }
                        ].map((gender) => (
                          <button
                            key={gender.value}
                            onClick={() => updateSetting('ai_voice_gender', gender.value)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              settings.ai_voice_gender === gender.value
                                ? 'border-green-500 bg-green-500/10 text-green-400'
                                : 'border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {gender.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Fact-Check Sensitivity: {settings.fact_check_sensitivity}%</Label>
                      <Slider
                        value={[settings.fact_check_sensitivity]}
                        onValueChange={([value]) => updateSetting('fact_check_sensitivity', value)}
                        min={0}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>Relaxed</span>
                        <span>Strict</span>
                      </div>
                    </div>

                    <div>
                      <Label>AI Learning Mode</Label>
                      <div className="flex gap-2 mt-2">
                        {[
                          { value: 'beginner', label: 'Beginner' },
                          { value: 'intermediate', label: 'Intermediate' },
                          { value: 'expert', label: 'Expert' }
                        ].map((mode) => (
                          <button
                            key={mode.value}
                            onClick={() => updateSetting('ai_learning_mode', mode.value)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              settings.ai_learning_mode === mode.value
                                ? 'border-green-500 bg-green-500/10 text-green-400'
                                : 'border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Staking Tab */}
            {activeTab === 'staking' && (
              <div className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      Staking Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Default Stake Amounts</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                        {[
                          { key: 'low_confidence', label: 'Low Confidence', color: 'text-red-400' },
                          { key: 'medium_confidence', label: 'Medium Confidence', color: 'text-yellow-400' },
                          { key: 'high_confidence', label: 'High Confidence', color: 'text-green-400' }
                        ].map((confidence) => (
                          <div key={confidence.key}>
                            <Label className={confidence.color}>{confidence.label}</Label>
                            <Input
                              type="number"
                              value={settings.default_stake_amounts[confidence.key as keyof typeof settings.default_stake_amounts]}
                              onChange={(e) => updateNestedSetting('default_stake_amounts', confidence.key, parseFloat(e.target.value) || 0)}
                              className="bg-background border-border mt-1"
                              step="0.1"
                              min="0.1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Risk Tolerance</Label>
                      <div className="flex gap-2 mt-2">
                        {[
                          { value: 'conservative', label: 'Conservative', color: 'text-blue-400' },
                          { value: 'moderate', label: 'Moderate', color: 'text-yellow-400' },
                          { value: 'aggressive', label: 'Aggressive', color: 'text-red-400' }
                        ].map((risk) => (
                          <button
                            key={risk.value}
                            onClick={() => updateSetting('risk_tolerance', risk.value)}
                            className={`px-4 py-2 rounded-lg border transition-all ${
                              settings.risk_tolerance === risk.value
                                ? `border-yellow-500 bg-yellow-500/10 ${risk.color}`
                                : 'border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {risk.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="max_daily_stake">Maximum Daily Stake (ALGO)</Label>
                      <Input
                        id="max_daily_stake"
                        type="number"
                        value={settings.max_daily_stake}
                        onChange={(e) => updateSetting('max_daily_stake', parseFloat(e.target.value) || 0)}
                        className="bg-background border-border mt-2"
                        step="1"
                        min="1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Challenge Posts</Label>
                        <p className="text-sm text-muted-foreground">Automatically challenge suspicious posts</p>
                      </div>
                      <Switch
                        checked={settings.auto_challenge_enabled}
                        onCheckedChange={(checked) => updateSetting('auto_challenge_enabled', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Shield className="w-5 h-5 text-green-400" />
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Wallet Management Section */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-card-foreground flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-400" />
                        Wallet Management
                      </h4>
                      
                      {user?.profile?.algo_address ? (
                        <div className="p-4 bg-background/60 border border-border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-card-foreground flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                Wallet Connected
                              </h5>
                              <p className="text-sm text-muted-foreground mt-1">
                                Your Algorand wallet is linked to your account
                              </p>
                              <p className="text-xs font-mono text-muted-foreground mt-2 p-2 bg-muted/30 rounded">
                                {user.profile.algo_address.slice(0, 12)}...{user.profile.algo_address.slice(-12)}
                              </p>
                            </div>
                            <Button
                              onClick={async () => {
                                const success = await unlinkWallet();
                                if (success) {
                                  toast({
                                    title: "Wallet Unlinked",
                                    description: "Your wallet has been successfully unlinked from your account.",
                                  });
                                  // Refresh user data
                                  window.location.reload();
                                } else {
                                  toast({
                                    title: "Unlink Failed",
                                    description: "Could not unlink wallet. Please try again.",
                                    variant: "destructive"
                                  });
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Unlink Wallet
                            </Button>
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-sm text-blue-400">
                              💡 <strong>Note:</strong> Unlinking your wallet will disable staking features and blockchain transactions. You can reconnect anytime.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                            <div>
                              <h5 className="font-medium text-yellow-400">No Wallet Connected</h5>
                              <p className="text-sm text-muted-foreground mt-1">
                                Connect your Algorand wallet to enable staking and blockchain features
                              </p>
                              <Button
                                onClick={() => {
                                  // Navigate to wallet connection
                                  window.location.href = '/dashboard/wallet';
                                }}
                                className="mt-3 bg-blue-600 hover:bg-blue-700"
                                size="sm"
                              >
                                <Key className="w-4 h-4 mr-2" />
                                Connect Wallet
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch
                        checked={settings.two_factor_enabled}
                        onCheckedChange={(checked) => updateSetting('two_factor_enabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Private Profile</Label>
                        <p className="text-sm text-muted-foreground">Hide your profile from public view</p>
                      </div>
                      <Switch
                        checked={settings.is_private}
                        onCheckedChange={(checked) => updateSetting('is_private', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch
                        checked={settings.email_notifications}
                        onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Browser push notifications</p>
                      </div>
                      <Switch
                        checked={settings.push_notifications}
                        onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Data Sharing</Label>
                        <p className="text-sm text-muted-foreground">Share anonymized data for research</p>
                      </div>
                      <Switch
                        checked={settings.data_sharing}
                        onCheckedChange={(checked) => updateSetting('data_sharing', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                      <Accessibility className="w-5 h-5 text-cyan-400" />
                      Accessibility Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Font Size: {settings.font_size}px</Label>
                      <Slider
                        value={[settings.font_size]}
                        onValueChange={([value]) => updateSetting('font_size', value)}
                        min={12}
                        max={24}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>Small</span>
                        <span>Large</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>High Contrast Mode</Label>
                        <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                      </div>
                      <Switch
                        checked={settings.high_contrast}
                        onCheckedChange={(checked) => updateSetting('high_contrast', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Reduced Motion</Label>
                        <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                      </div>
                      <Switch
                        checked={settings.reduced_motion}
                        onCheckedChange={(checked) => updateSetting('reduced_motion', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Screen Reader Mode</Label>
                        <p className="text-sm text-muted-foreground">Optimize for screen readers</p>
                      </div>
                      <Switch
                        checked={settings.screen_reader_mode}
                        onCheckedChange={(checked) => updateSetting('screen_reader_mode', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Save Button for Non-Profile Tabs */}
        {activeTab !== 'profile' && (
          <div className="flex justify-end">
            <Button 
              onClick={() => {
                toast({
                  title: "Settings saved",
                  description: "Your preferences have been updated successfully",
                });
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 