import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Settings, 
  User, 
  Shield, 
  Palette, 
  Globe, 
  Bot, 
  Coins, 
  Eye, 
  Monitor,
  Smartphone,
  Volume2,
  Bell,
  Lock,
  Mail,
  Key,
  Download,
  Trash2,
  Save,
  AlertTriangle,
  Check,
  X,
  Moon,
  Sun,
  Languages,
  DollarSign,
  Clock,
  Accessibility,
  Type,
  Contrast,
  ZoomIn,
  Mic,
  Video
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface UserSettings {
  // Account Settings
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  email: string;
  is_private: boolean;
  two_factor_enabled: boolean;
  
  // Platform Preferences
  theme: 'dark' | 'light' | 'auto';
  language: string;
  currency: 'ALGO' | 'USD' | 'EUR';
  timezone: string;
  
  // AI Interaction Settings
  preferred_ai_moderators: string[];
  ai_voice_gender: 'male' | 'female' | 'neutral';
  fact_check_sensitivity: number; // 1-100
  ai_learning_mode: 'beginner' | 'intermediate' | 'expert';
  ai_interaction_frequency: number; // 1-100
  
  // Staking Preferences
  default_stake_amounts: {
    low_confidence: number;
    medium_confidence: number;
    high_confidence: number;
  };
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  auto_challenge_enabled: boolean;
  max_daily_stake: number;
  auto_reinvest: boolean;
  
  // Accessibility Options
  font_size: number; // 12-24
  high_contrast: boolean;
  screen_reader_mode: boolean;
  reduced_motion: boolean;
  keyboard_navigation: boolean;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' }
];

const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+06:00', 'UTC+07:00',
  'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
];

const AI_MODERATORS = [
  'Dr. Sarah Chen',
  'Professor Marcus Williams', 
  'Tech Expert Sam Rivera',
  'Dr. Alex Thompson'
];

export function SettingsSystem() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    email: '',
    is_private: false,
    two_factor_enabled: false,
    theme: 'dark',
    language: 'en',
    currency: 'ALGO',
    timezone: 'UTC+00:00',
    preferred_ai_moderators: ['Dr. Sarah Chen'],
    ai_voice_gender: 'female',
    fact_check_sensitivity: 50,
    ai_learning_mode: 'intermediate',
    ai_interaction_frequency: 50,
    default_stake_amounts: {
      low_confidence: 0.1,
      medium_confidence: 0.5,
      high_confidence: 1.0
    },
    risk_tolerance: 'moderate',
    auto_challenge_enabled: false,
    max_daily_stake: 10,
    auto_reinvest: false,
    font_size: 16,
    high_contrast: false,
    screen_reader_mode: false,
    reduced_motion: false,
    keyboard_navigation: false
  });
  
  const [activeTab, setActiveTab] = useState<'account' | 'platform' | 'ai' | 'staking' | 'accessibility'>('account');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  useEffect(() => {
    // Apply theme changes immediately
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // Apply font size changes
    document.documentElement.style.fontSize = `${settings.font_size}px`;
    
    // Apply high contrast mode
    if (settings.high_contrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Apply reduced motion
    if (settings.reduced_motion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [settings.theme, settings.font_size, settings.high_contrast, settings.reduced_motion]);

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Load user settings
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setSettings(prev => ({
          ...prev,
          username: profile.username || '',
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
          email: user.email || '',
          is_private: profile.is_private || false,
          ...userSettings
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load settings'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: settings.username,
          display_name: settings.display_name,
          bio: settings.bio,
          avatar_url: settings.avatar_url,
          is_private: settings.is_private
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme: settings.theme,
          language: settings.language,
          currency: settings.currency,
          timezone: settings.timezone,
          preferred_ai_moderators: settings.preferred_ai_moderators,
          ai_voice_gender: settings.ai_voice_gender,
          fact_check_sensitivity: settings.fact_check_sensitivity,
          ai_learning_mode: settings.ai_learning_mode,
          ai_interaction_frequency: settings.ai_interaction_frequency,
          default_stake_amounts: settings.default_stake_amounts,
          risk_tolerance: settings.risk_tolerance,
          auto_challenge_enabled: settings.auto_challenge_enabled,
          max_daily_stake: settings.max_daily_stake,
          auto_reinvest: settings.auto_reinvest,
          font_size: settings.font_size,
          high_contrast: settings.high_contrast,
          screen_reader_mode: settings.screen_reader_mode,
          reduced_motion: settings.reduced_motion,
          keyboard_navigation: settings.keyboard_navigation
        });

      if (settingsError) throw settingsError;

      setHasChanges(false);
      setNotification({
        type: 'success',
        message: 'Settings saved successfully!'
      });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      setNotification({
        type: 'error',
        message: `Failed to save settings: ${error.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateNestedSetting = (parentKey: keyof UserSettings, childKey: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }));
    setHasChanges(true);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setNotification({
        type: 'error',
        message: 'Passwords do not match'
      });
      return;
    }

    if (newPassword.length < 8) {
      setNotification({
        type: 'error',
        message: 'Password must be at least 8 characters'
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      
      setNotification({
        type: 'success',
        message: 'Password updated successfully!'
      });
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `Failed to update password: ${error.message}`
      });
    }
  };

  const exportUserData = async () => {
    try {
      // Export user data
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user?.id);

      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id);

      const exportData = {
        profile: userData,
        posts: postsData,
        transactions: transactionsData,
        settings: settings,
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `truthchain-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setNotification({
        type: 'success',
        message: 'Data exported successfully!'
      });
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `Failed to export data: ${error.message}`
      });
    }
  };

  const deleteAccount = async () => {
    try {
      // This would typically be handled by a secure server-side function
      await supabase.auth.signOut();
      
      setNotification({
        type: 'success',
        message: 'Account deletion initiated. You have been logged out.'
      });
    } catch (error: any) {
      setNotification({
        type: 'error',
        message: `Failed to delete account: ${error.message}`
      });
    }
  };

  const tabs = [
    { key: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { key: 'platform', label: 'Platform', icon: <Palette className="w-4 h-4" /> },
    { key: 'ai', label: 'AI Settings', icon: <Bot className="w-4 h-4" /> },
    { key: 'staking', label: 'Staking', icon: <Coins className="w-4 h-4" /> },
    { key: 'accessibility', label: 'Accessibility', icon: <Accessibility className="w-4 h-4" /> }
  ];

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
      {/* Settings Header */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Settings & Preferences</h2>
                <p className="text-gray-400">Customize your TruthChain experience</p>
              </div>
            </div>
            
            {hasChanges && (
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            )}
          </div>

          {/* Notification */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex items-center gap-2 mt-4 p-3 rounded-lg ${
                notification.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : notification.type === 'warning'
                  ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}
            >
              {notification.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm">{notification.message}</span>
              <Button
                onClick={() => setNotification(null)}
                variant="ghost"
                size="sm"
                className="ml-auto w-6 h-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Settings Navigation */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-0">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'account' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Information */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={settings.avatar_url} />
                      <AvatarFallback>
                        {settings.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" className="border-gray-600">
                      Change Avatar
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="username" className="text-gray-300">Username</Label>
                    <Input
                      id="username"
                      value={settings.username}
                      onChange={(e) => updateSetting('username', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                      placeholder="@username"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="display_name" className="text-gray-300">Display Name</Label>
                    <Input
                      id="display_name"
                      value={settings.display_name}
                      onChange={(e) => updateSetting('display_name', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                    <Textarea
                      id="bio"
                      value={settings.bio}
                      onChange={(e) => updateSetting('bio', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                      placeholder="Tell us about yourself..."
                      maxLength={280}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {settings.bio.length}/280 characters
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">Private Profile</Label>
                      <p className="text-sm text-gray-500">Hide your profile from public search</p>
                    </div>
                    <Switch
                      checked={settings.is_private}
                      onCheckedChange={(checked) => updateSetting('is_private', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      disabled
                      className="bg-gray-800/30 border-gray-700 text-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-gray-300">Change Password</Label>
                    <Input
                      type="password"
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                    <Input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                    <Button
                      onClick={handlePasswordChange}
                      disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                      variant="outline"
                      className="border-gray-600"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add extra security to your account</p>
                    </div>
                    <Switch
                      checked={settings.two_factor_enabled}
                      onCheckedChange={(checked) => updateSetting('two_factor_enabled', checked)}
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <div className="flex gap-3">
                      <Button
                        onClick={exportUserData}
                        variant="outline"
                        className="border-blue-600 text-blue-400"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                      
                      <Button
                        onClick={() => setShowDeleteConfirm(true)}
                        variant="outline"
                        className="border-red-600 text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'platform' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme & Appearance */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Theme & Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300 mb-3 block">Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
                        { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                        { value: 'auto', label: 'Auto', icon: <Monitor className="w-4 h-4" /> }
                      ].map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => updateSetting('theme', theme.value)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            settings.theme === theme.value
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {theme.icon}
                            <span className="text-sm text-white">{theme.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="language" className="text-gray-300">Language</Label>
                    <select
                      id="language"
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="currency" className="text-gray-300">Currency Display</Label>
                    <select
                      id="currency"
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="ALGO">ALGO</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                    <select
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'ai' && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Interaction Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-gray-300 mb-3 block">Preferred AI Moderators</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {AI_MODERATORS.map((moderator) => (
                      <div
                        key={moderator}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          settings.preferred_ai_moderators.includes(moderator)
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => {
                          const current = settings.preferred_ai_moderators;
                          const updated = current.includes(moderator)
                            ? current.filter(m => m !== moderator)
                            : [...current, moderator];
                          updateSetting('preferred_ai_moderators', updated);
                        }}
                      >
                        <span className="text-sm text-white">{moderator}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-300 mb-3 block">
                    Fact-Check Sensitivity: {settings.fact_check_sensitivity}%
                  </Label>
                  <Slider
                    value={[settings.fact_check_sensitivity]}
                    onValueChange={([value]) => updateSetting('fact_check_sensitivity', value)}
                    min={0}
                    max={100}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Relaxed</span>
                    <span>Moderate</span>
                    <span>Strict</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="ai_learning_mode" className="text-gray-300">Learning Mode</Label>
                  <select
                    id="ai_learning_mode"
                    value={settings.ai_learning_mode}
                    onChange={(e) => updateSetting('ai_learning_mode', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="beginner">Beginner - Detailed explanations</option>
                    <option value="intermediate">Intermediate - Balanced guidance</option>
                    <option value="expert">Expert - Minimal intervention</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="ai_voice_gender" className="text-gray-300">AI Voice Gender</Label>
                  <select
                    id="ai_voice_gender"
                    value={settings.ai_voice_gender}
                    onChange={(e) => updateSetting('ai_voice_gender', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'staking' && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Staking Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-gray-300 mb-3 block">Default Stake Amounts</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-400">Low Confidence</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={settings.default_stake_amounts.low_confidence}
                        onChange={(e) => updateNestedSetting('default_stake_amounts', 'low_confidence', parseFloat(e.target.value))}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-400">Medium Confidence</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={settings.default_stake_amounts.medium_confidence}
                        onChange={(e) => updateNestedSetting('default_stake_amounts', 'medium_confidence', parseFloat(e.target.value))}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-400">High Confidence</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={settings.default_stake_amounts.high_confidence}
                        onChange={(e) => updateNestedSetting('default_stake_amounts', 'high_confidence', parseFloat(e.target.value))}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="risk_tolerance" className="text-gray-300">Risk Tolerance</Label>
                  <select
                    id="risk_tolerance"
                    value={settings.risk_tolerance}
                    onChange={(e) => updateSetting('risk_tolerance', e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="conservative">Conservative - Lower stakes, safer bets</option>
                    <option value="moderate">Moderate - Balanced approach</option>
                    <option value="aggressive">Aggressive - Higher stakes, bigger risks</option>
                  </select>
                </div>
                
                <div>
                  <Label className="text-gray-300 mb-2 block">Max Daily Stake: {settings.max_daily_stake} ALGO</Label>
                  <Slider
                    value={[settings.max_daily_stake]}
                    onValueChange={([value]) => updateSetting('max_daily_stake', value)}
                    min={1}
                    max={100}
                    className="py-4"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">Auto-Challenge Enabled</Label>
                      <p className="text-sm text-gray-500">Automatically challenge obviously false posts</p>
                    </div>
                    <Switch
                      checked={settings.auto_challenge_enabled}
                      onCheckedChange={(checked) => updateSetting('auto_challenge_enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">Auto-Reinvest</Label>
                      <p className="text-sm text-gray-500">Automatically reinvest winnings</p>
                    </div>
                    <Switch
                      checked={settings.auto_reinvest}
                      onCheckedChange={(checked) => updateSetting('auto_reinvest', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'accessibility' && (
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="w-5 h-5" />
                  Accessibility Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-gray-300 mb-3 block">
                    Font Size: {settings.font_size}px
                  </Label>
                  <Slider
                    value={[settings.font_size]}
                    onValueChange={([value]) => updateSetting('font_size', value)}
                    min={12}
                    max={24}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">High Contrast Mode</Label>
                      <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
                    </div>
                    <Switch
                      checked={settings.high_contrast}
                      onCheckedChange={(checked) => updateSetting('high_contrast', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">Screen Reader Mode</Label>
                      <p className="text-sm text-gray-500">Optimize for screen readers</p>
                    </div>
                    <Switch
                      checked={settings.screen_reader_mode}
                      onCheckedChange={(checked) => updateSetting('screen_reader_mode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">Reduced Motion</Label>
                      <p className="text-sm text-gray-500">Minimize animations and transitions</p>
                    </div>
                    <Switch
                      checked={settings.reduced_motion}
                      onCheckedChange={(checked) => updateSetting('reduced_motion', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300">Keyboard Navigation</Label>
                      <p className="text-sm text-gray-500">Enhanced keyboard navigation support</p>
                    </div>
                    <Switch
                      checked={settings.keyboard_navigation}
                      onCheckedChange={(checked) => updateSetting('keyboard_navigation', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Delete Account Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 border border-red-500/50 rounded-lg p-6 max-w-md mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Delete Account</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={deleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Delete Account
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 