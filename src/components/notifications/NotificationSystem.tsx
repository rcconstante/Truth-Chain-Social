import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Bell, 
  BellOff, 
  Check, 
  X, 
  Settings, 
  Volume2, 
  VolumeX,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Clock,
  TrendingUp,
  Coins,
  MessageCircle,
  Award,
  AlertTriangle,
  Sparkles,
  Crown,
  Target,
  Users,
  Brain
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { voiceAIService } from '../../lib/voice-ai-service';
import { useAuth } from '../../lib/auth';

interface Notification {
  id: string;
  type: 'staking' | 'social' | 'ai' | 'moderation' | 'achievement';
  category: string;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  expires_at?: string;
  action_url?: string;
  sender?: {
    username: string;
    avatar_url?: string;
  };
}

interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  voice_enabled: boolean;
  video_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  categories: {
    staking: boolean;
    social: boolean;
    ai: boolean;
    moderation: boolean;
    achievement: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
  priority_filter: 'all' | 'medium' | 'high' | 'urgent';
}

const NOTIFICATION_TYPES = {
  staking: {
    icon: <Coins className="w-4 h-4" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  social: {
    icon: <Users className="w-4 h-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  ai: {
    icon: <Brain className="w-4 h-4" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  moderation: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  },
  achievement: {
    icon: <Award className="w-4 h-4" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  }
};

export function NotificationSystem() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    voice_enabled: false,
    video_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    categories: {
      staking: true,
      social: true,
      ai: true,
      moderation: true,
      achievement: true
    },
    frequency: 'immediate',
    priority_filter: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'staking' | 'social' | 'ai'>('all');
  
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadPreferences();
      setupRealTimeSubscription();
      requestNotificationPermission();
    }
  }, [user?.id]);

  useEffect(() => {
    // Update unread count
    const unread = notifications.filter(n => !n.is_read).length;
    setUnreadCount(unread);

    // Update document title with unread count
    if (unread > 0) {
      document.title = `(${unread}) TruthChain Social`;
    } else {
      document.title = 'TruthChain Social';
    }
  }, [notifications]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:sender_id (
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const setupRealTimeSubscription = () => {
    if (!user?.id) return;

    const subscription = supabase
      .channel(`notifications_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, async (payload) => {
        const newNotification = payload.new as Notification;
        
        // Add to notifications list
        setNotifications(prev => [newNotification, ...prev]);
        
        // Handle notification based on preferences
        await handleNewNotification(newNotification);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleNewNotification = async (notification: Notification) => {
    // Check if notifications are enabled for this category
    if (!preferences.categories[notification.type as keyof typeof preferences.categories]) {
      return;
    }

    // Check quiet hours
    if (isQuietHours()) {
      return;
    }

    // Check priority filter
    if (!shouldShowByPriority(notification.priority)) {
      return;
    }

    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors
      });
    }

    // Show browser notification
    if (preferences.push_enabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.id,
        data: notification
      });
    }

    // Voice notification
    if (preferences.voice_enabled && notification.priority === 'urgent') {
      await playVoiceNotification(notification);
    }

    // Email notification (handled server-side)
    if (preferences.email_enabled && notification.priority === 'high') {
      await sendEmailNotification(notification);
    }
  };

  const isQuietHours = (): boolean => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const shouldShowByPriority = (priority: string): boolean => {
    const priorityLevels = { low: 0, medium: 1, high: 2, urgent: 3 };
    const filterLevels = { all: 0, medium: 1, high: 2, urgent: 3 };
    
    return priorityLevels[priority as keyof typeof priorityLevels] >= 
           filterLevels[preferences.priority_filter as keyof typeof filterLevels];
  };

  const playVoiceNotification = async (notification: Notification) => {
    try {
      const voiceMessage = `Urgent notification: ${notification.title}. ${notification.message}`;
      await voiceAIService.generateAIVoiceResponse(voiceMessage, 'general', 'moderation');
    } catch (error) {
      console.error('Failed to play voice notification:', error);
    }
  };

  const sendEmailNotification = async (notification: Notification) => {
    try {
      await supabase.functions.invoke('send-email-notification', {
        body: {
          user_id: user?.id,
          notification_id: notification.id,
          email: user?.email
        }
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);

    try {
      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user?.id,
          ...updated
        });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(n => !n.is_read);
        break;
      case 'staking':
      case 'social':
      case 'ai':
        filtered = filtered.filter(n => n.type === selectedFilter);
        break;
    }

    return filtered;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="relative">
      {/* Notification Bell */}
      <div className="relative">
        <Button
          onClick={() => setShowNotifications(!showNotifications)}
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-800/50 transition-all duration-200"
        >
          <Bell className="w-5 h-5 text-gray-300" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-xs font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </motion.div>
          )}
        </Button>
      </div>

      {/* Enhanced Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            ref={notificationsPanelRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-[420px] max-h-[500px] z-50"
          >
            <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700/50 shadow-2xl backdrop-blur-xl">
              <CardHeader className="pb-3 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Notifications
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowSettings(!showSettings)}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-purple-500/20 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    {unreadCount > 0 && (
                      <Button
                        onClick={markAllAsRead}
                        variant="ghost"
                        size="sm"
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                </div>

                {/* Enhanced Filter Tabs */}
                <div className="flex gap-1 mt-4 p-1 bg-gray-800/50 rounded-lg">
                  {[
                    { key: 'all', label: 'All', icon: <Bell className="w-3 h-3" /> },
                    { key: 'unread', label: 'Unread', icon: <Eye className="w-3 h-3" /> },
                    { key: 'staking', label: 'Stakes', icon: <Coins className="w-3 h-3" /> },
                    { key: 'social', label: 'Social', icon: <Users className="w-3 h-3" /> },
                    { key: 'ai', label: 'AI', icon: <Brain className="w-3 h-3" /> }
                  ].map((tab) => (
                    <Button
                      key={tab.key}
                      onClick={() => setSelectedFilter(tab.key as any)}
                      variant={selectedFilter === tab.key ? 'default' : 'ghost'}
                      size="sm"
                      className={`text-xs h-8 px-3 flex-1 transition-all ${
                        selectedFilter === tab.key 
                          ? 'bg-purple-600 text-white shadow-lg' 
                          : 'hover:bg-gray-700/50 text-gray-400'
                      }`}
                    >
                      {tab.icon}
                      <span className="ml-1.5">{tab.label}</span>
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Enhanced Settings Panel */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-gray-700/50 p-4 bg-gradient-to-r from-purple-900/10 to-blue-900/10"
                    >
                      <h4 className="font-semibold text-white mb-4 text-lg">Preferences</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30">
                            <span className="text-sm text-gray-300 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email
                            </span>
                            <Button
                              onClick={() => updatePreferences({ email_enabled: !preferences.email_enabled })}
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-12 rounded-full ${
                                preferences.email_enabled 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              {preferences.email_enabled ? 'ON' : 'OFF'}
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30">
                            <span className="text-sm text-gray-300 flex items-center gap-2">
                              <Smartphone className="w-4 h-4" />
                              Push
                            </span>
                            <Button
                              onClick={() => updatePreferences({ push_enabled: !preferences.push_enabled })}
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-12 rounded-full ${
                                preferences.push_enabled 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              {preferences.push_enabled ? 'ON' : 'OFF'}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30">
                            <span className="text-sm text-gray-300 flex items-center gap-2">
                              {preferences.voice_enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                              Voice
                            </span>
                            <Button
                              onClick={() => updatePreferences({ voice_enabled: !preferences.voice_enabled })}
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-12 rounded-full ${
                                preferences.voice_enabled 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              {preferences.voice_enabled ? 'ON' : 'OFF'}
                            </Button>
                          </div>
                          
                          <div className="pt-1">
                            <label className="text-xs text-gray-400 mb-1 block">Priority Filter</label>
                            <select
                              value={preferences.priority_filter}
                              onChange={(e) => updatePreferences({ priority_filter: e.target.value as any })}
                              className="w-full p-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-xs text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            >
                              <option value="all">All Notifications</option>
                              <option value="medium">Medium+ Priority</option>
                              <option value="high">High+ Priority</option>
                              <option value="urgent">Urgent Only</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced Notifications List */}
                <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400 text-lg font-medium">No notifications found</p>
                      <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredNotifications.map((notification, index) => {
                        const typeConfig = NOTIFICATION_TYPES[notification.type as keyof typeof NOTIFICATION_TYPES];
                        
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ 
                              backgroundColor: 'rgba(139, 92, 246, 0.08)',
                              scale: 1.02,
                              transition: { duration: 0.2 }
                            }}
                            className={`p-4 border-l-4 cursor-pointer rounded-r-lg transition-all duration-200 ${
                              notification.is_read 
                                ? 'bg-gray-800/20 border-l-gray-600 opacity-75' 
                                : `bg-gray-800/40 ${typeConfig.borderColor} shadow-lg`
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <motion.div 
                                className={`p-2 rounded-lg ${typeConfig.bgColor} ${typeConfig.color}`}
                                whileHover={{ scale: 1.1 }}
                              >
                                {typeConfig.icon}
                              </motion.div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className={`font-semibold text-sm ${
                                    notification.is_read ? 'text-gray-400' : 'text-white'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <Badge className={`text-xs px-2 py-1 ${getPriorityColor(notification.priority)}`}>
                                    {notification.priority.toUpperCase()}
                                  </Badge>
                                </div>
                                
                                <p className={`text-sm ${
                                  notification.is_read ? 'text-gray-500' : 'text-gray-300'
                                } mb-3 leading-relaxed`}>
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(notification.created_at)}
                                  </span>
                                  
                                  {notification.sender && (
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-5 h-5 border border-gray-600">
                                        <AvatarImage src={notification.sender.avatar_url} />
                                        <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500 to-pink-500">
                                          {notification.sender.username.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-gray-500 font-medium">
                                        {notification.sender.username}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                {!notification.is_read && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="w-7 h-7 p-0 hover:bg-green-500/20 text-green-400"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                  variant="ghost"
                                  size="sm"
                                  className="w-7 h-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio element for notification sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
} 