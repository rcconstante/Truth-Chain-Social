import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Users,
  Hash,
  Crown,
  Settings,
  Phone,
  PhoneOff,
  Bot,
  Star,
  Shield,
  MoreVertical,
  UserPlus,
  Eye,
  Loader,
  VolumeOff,
  Play
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { voiceAIService } from '../../lib/voice-ai-service';
import { AIModeratorSystem } from '../ai/AIModeratorSystem';
import { useAuth } from '../../lib/auth';
import { format } from 'date-fns';
import { useToast } from '../ui/use-toast';
import { speakText, VOICE_PERSONAS } from '../../lib/elevenlabs';

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  type: 'topic' | 'community';
  moderator: string;
  moderator_avatar?: string;
  active_users: number;
  total_messages: number;
  is_voice_enabled: boolean;
  category: string;
  topic?: string;
  is_public?: boolean;
  created_by?: string;
  created_at?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  username: string;
  user_reputation: number;
  room_id: string;
  created_at: string;
  avatar_url?: string;
  is_ai_moderated?: boolean;
  mentioned_users?: string[];
  message_type?: string;
  is_ai_generated?: boolean;
}

interface VoiceSession {
  id: string;
  room_id: string;
  host_id: string;
  title: string;
  is_active: boolean;
  max_speakers: number;
  current_speakers: string[];
  recording_url?: string;
  transcript?: string;
  created_at: string;
}

const CHAT_ROOMS: ChatRoom[] = [
  // Topic Rooms (as specified in README.md)
  {
    id: 'politics',
    name: '#politics',
    description: 'Political discussions and fact-checking',
    type: 'topic',
    moderator: 'Professor Marcus Williams',
    moderator_avatar: '/avatars/marcus-williams.jpg',
    active_users: 127,
    total_messages: 15420,
    is_voice_enabled: true,
    category: 'Topic Rooms'
  },
  {
    id: 'health',
    name: '#health',
    description: 'Medical and health information verification',
    type: 'topic',
    moderator: 'Dr. Sarah Chen',
    moderator_avatar: '/avatars/sarah-chen.jpg',
    active_users: 89,
    total_messages: 8934,
    is_voice_enabled: true,
    category: 'Topic Rooms'
  },
  {
    id: 'technology',
    name: '#technology',
    description: 'Tech news, AI, and cryptocurrency discussions',
    type: 'topic',
    moderator: 'Tech Expert Sam Rivera',
    moderator_avatar: '/avatars/sam-rivera.jpg',
    active_users: 203,
    total_messages: 22156,
    is_voice_enabled: true,
    category: 'Topic Rooms'
  },
  {
    id: 'climate',
    name: '#climate',
    description: 'Climate science and environmental discussions',
    type: 'topic',
    moderator: 'Dr. Alex Thompson',
    moderator_avatar: '/avatars/alex-thompson.jpg',
    active_users: 156,
    total_messages: 11873,
    is_voice_enabled: true,
    category: 'Topic Rooms'
  },
  
  // Community Rooms (as specified in README.md)
  {
    id: 'newbies',
    name: '#newbies',
    description: 'Help and guidance for new users',
    type: 'community',
    moderator: 'Community Helpers',
    active_users: 78,
    total_messages: 5623,
    is_voice_enabled: false,
    category: 'Community Rooms'
  },
  {
    id: 'experts',
    name: '#experts',
    description: 'High-reputation user discussions',
    type: 'community',
    moderator: 'Truth Guardians',
    active_users: 45,
    total_messages: 3890,
    is_voice_enabled: true,
    category: 'Community Rooms'
  },
  {
    id: 'challenges',
    name: '#challenges',
    description: 'Active dispute discussions',
    type: 'community',
    moderator: 'Challenge Moderators',
    active_users: 92,
    total_messages: 7234,
    is_voice_enabled: false,
    category: 'Community Rooms'
  },
  {
    id: 'general',
    name: '#general',
    description: 'Off-topic conversations',
    type: 'community',
    moderator: 'Community Team',
    active_users: 234,
    total_messages: 18492,
    is_voice_enabled: false,
    category: 'Community Rooms'
  }
];

export function ChatSystem() {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom>(CHAT_ROOMS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
    
    // Subscribe to real-time messages
    const subscription = supabase
      .channel(`chat-${selectedRoom.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoom.id}`
        }, 
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedRoom.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading messages for demo
      const demoMessages: ChatMessage[] = [
        {
          id: '1',
          content: `Welcome to ${selectedRoom.name}! This room is moderated by ${selectedRoom.moderator}.`,
          user_id: 'system',
          username: 'TruthChain Bot',
          user_reputation: 1000,
          room_id: selectedRoom.id,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_ai_moderated: true
        },
        {
          id: '2',
          content: `Great discussion happening here! Remember to back up your claims with evidence.`,
          user_id: 'user1',
          username: 'TruthSeeker42',
          user_reputation: 650,
          room_id: selectedRoom.id,
          created_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '3',
          content: selectedRoom.id === 'politics' 
            ? 'The latest fact-check on voting systems is quite comprehensive.'
            : selectedRoom.id === 'health'
            ? 'New research on vaccine efficacy just published in Nature.'
            : selectedRoom.id === 'technology' 
            ? 'AI breakthroughs are happening faster than ever!'
            : selectedRoom.id === 'climate'
            ? 'The IPCC report highlights critical tipping points.'
            : 'This community is growing so fast! Love the energy here.',
          user_id: 'user2',
          username: 'FactChecker',
          user_reputation: 890,
          room_id: selectedRoom.id,
          created_at: new Date(Date.now() - 900000).toISOString()
        }
      ];

      setMessages(demoMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please type a message before sending.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send messages.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingMessage(true);

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      user_id: user.id,
      username: user.email?.split('@')[0] || user.user_metadata?.username || 'User',
      user_reputation: 350,
      room_id: selectedRoom.id,
      created_at: new Date().toISOString()
    };

    try {
      // Add message locally for immediate feedback
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Show success feedback
      toast({
        title: "Message Sent",
        description: `Your message was sent to ${selectedRoom.name}`,
        duration: 2000
      });

      // In a real implementation, this would save to Supabase
      // await supabase.from('chat_messages').insert(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      
      // Remove the message from local state if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== message.id));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getReputationBadge = (reputation: number) => {
    if (reputation >= 900) return { color: 'bg-yellow-500', label: 'Truth Guardian', icon: Crown };
    if (reputation >= 600) return { color: 'bg-purple-500', label: 'Expert', icon: Star };
    if (reputation >= 300) return { color: 'bg-blue-500', label: 'Fact Checker', icon: Shield };
    if (reputation >= 100) return { color: 'bg-green-500', label: 'Truth Seeker', icon: Users };
    return { color: 'bg-gray-500', label: 'Newcomer', icon: Users };
  };

  const getRoomsByCategory = () => {
    const grouped = CHAT_ROOMS.reduce((acc, room) => {
      const category = room.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(room);
      return acc;
    }, {} as Record<string, ChatRoom[]>);
    
    return grouped;
  };

  const roomsByCategory = getRoomsByCategory();

  const speakMessage = async (message: ChatMessage) => {
    if (!isTextToSpeechEnabled) {
      toast({
        title: "Text-to-Speech Disabled",
        description: "Enable text-to-speech in the chat header to use this feature.",
        variant: "destructive"
      });
      return;
    }

    if (speakingMessageId === message.id) {
      // Stop speaking if already speaking this message
      setSpeakingMessageId(null);
      // Note: In a production app, you'd want to stop the audio here
      return;
    }

    try {
      setSpeakingMessageId(message.id);
      
      // Choose voice persona based on room type or message context
      let voicePersona: keyof typeof VOICE_PERSONAS = 'general';
      
      if (selectedRoom.id === 'politics') voicePersona = 'politics';
      else if (selectedRoom.id === 'health') voicePersona = 'health';
      else if (selectedRoom.id === 'technology') voicePersona = 'technology';
      else if (selectedRoom.id === 'science') voicePersona = 'science';
      
      // Prepare text for speech (add context for better narration)
      const speechText = `${message.username} says: ${message.content}`;
      
      await speakText(speechText, voicePersona);
      
      toast({
        title: "🔊 Message Read",
        description: `Speaking message from ${message.username}`,
        duration: 2000
      });
      
    } catch (error) {
      console.error('Error speaking message:', error);
      toast({
        title: "Speech Error",
        description: "Could not read message aloud. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSpeakingMessageId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Room List Sidebar */}
      <div className="lg:col-span-1">
        <Card className="bg-gray-900 border-gray-700 h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <span>Chat Rooms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {Object.entries(roomsByCategory).map(([category, rooms]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  {category}
                </h4>
                <div className="space-y-1">
                  {rooms.map((room) => (
                    <motion.button
                      key={room.id}
                      whileHover={{ x: 2 }}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full text-left p-2 rounded-lg transition-all ${
                        selectedRoom.id === room.id
                          ? 'bg-purple-500/20 border border-purple-500/30'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Hash className="w-3 h-3 text-gray-400" />
                        <span className="font-medium text-white text-sm">{room.name.slice(1)}</span>
                        {room.is_voice_enabled && (
                          <Volume2 className="w-3 h-3 text-green-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          <Users className="w-3 h-3 inline mr-1" />
                          {room.active_users}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3">
        <Card className="bg-gray-900 border-gray-700 h-full flex flex-col">
          {/* Chat Header */}
          <CardHeader className="border-b border-gray-700 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-400" />
                  <span className="text-lg font-bold text-white">{selectedRoom.name.slice(1)}</span>
                  {selectedRoom.is_voice_enabled && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Voice
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {selectedRoom.active_users} online
                </Badge>
                {selectedRoom.is_voice_enabled && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVoiceActive(!isVoiceActive)}
                      className={isVoiceActive ? 'bg-green-500/20 border-green-500' : ''}
                    >
                      {isVoiceActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className={isMuted ? 'bg-red-500/20 border-red-500' : ''}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTextToSpeechEnabled(!isTextToSpeechEnabled)}
                  className={isTextToSpeechEnabled ? 'bg-purple-500/20 border-purple-500' : 'bg-gray-500/20 border-gray-500'}
                  title={isTextToSpeechEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech'}
                >
                  {isTextToSpeechEnabled ? <Play className="w-4 h-4" /> : <VolumeOff className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              {selectedRoom.description} • Moderated by {selectedRoom.moderator}
            </p>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 p-4 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400">Loading messages...</div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => {
                    const reputation = getReputationBadge(message.user_reputation);
                    const ReputationIcon = reputation.icon;
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex gap-3 group hover:bg-gray-800/30 p-2 rounded-lg transition-colors ${message.is_ai_moderated ? 'bg-blue-500/10 border border-blue-500/20' : ''}`}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {message.username.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">{message.username}</span>
                            
                            <div className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${reputation.color}`}>
                              <ReputationIcon className="w-3 h-3" />
                              <span className="text-xs text-white">{reputation.label}</span>
                            </div>
                            
                            {message.is_ai_moderated && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                AI Moderated
                              </Badge>
                            )}
                            
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </span>
                          </div>
                          
                          <p className="text-gray-300 leading-relaxed">{message.content}</p>
                        </div>

                        {/* Text-to-Speech Button */}
                        {isTextToSpeechEnabled && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => speakMessage(message)}
                              disabled={speakingMessageId !== null && speakingMessageId !== message.id}
                              className={`h-8 w-8 p-0 hover:bg-purple-500/20 ${
                                speakingMessageId === message.id 
                                  ? 'bg-purple-500/20 text-purple-400' 
                                  : 'text-gray-400 hover:text-purple-400'
                              }`}
                              title="Read message aloud"
                            >
                              {speakingMessageId === message.id ? (
                                <VolumeOff className="w-4 h-4" />
                              ) : (
                                <Volume2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${selectedRoom.name}...`}
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                maxLength={1000}
                disabled={isSendingMessage}
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSendingMessage}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                {isSendingMessage ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 