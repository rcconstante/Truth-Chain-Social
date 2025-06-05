import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX,
  Users,
  UserPlus,
  MessageCircle,
  Phone,
  PhoneOff,
  Play,
  Pause,
  Settings,
  Crown,
  Shield,
  Star,
  Plus,
  Send,
  Bot,
  Sparkles,
  Loader,
  Square,
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { 
  AI_MODERATOR_PERSONAS, 
  initializeAIModeratorPersonas,
  createAIModeratorPersona,
  PersonaCreationResponse,
  createConversationSession,
  endConversation,
  createTavusEmbedUrl
} from '../../lib/tavus';
import { 
  generateModeratorVoice,
  VOICE_PERSONAS 
} from '../../lib/elevenlabs';
import { format } from 'date-fns';
import { Label } from '../../components/ui/label';

interface VoiceRoom {
  id: string;
  title: string;
  topic: string;
  host_id: string;
  host_name: string;
  participants: Participant[];
  ai_moderator?: keyof typeof AI_MODERATOR_PERSONAS;
  is_active: boolean;
  max_participants: number;
  created_at: string;
  description: string;
  is_public: boolean;
}

interface Participant {
  id: string;
  user_id: string;
  username: string;
  is_speaking: boolean;
  is_muted: boolean;
  is_video_on: boolean;
  joined_at: string;
  avatar_url?: string;
  reputation_score: number;
}

interface DebateMessage {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
  ai_response?: {
    video_url?: string;
    audio_url?: string;
    text: string;
    moderator: string;
    persona_id?: string;
  };
}

const AI_MODERATOR_OPTIONS = [
  {
    key: 'health' as const,
    name: 'Dr. Sarah Chen',
    expertise: 'Health, Medicine, Biology',
    avatar: '/avatars/sarah-chen.jpg',
    personality: 'Professional, caring, evidence-focused',
    color: 'from-green-500 to-teal-500'
  },
  {
    key: 'politics' as const,
    name: 'Professor Marcus Williams', 
    expertise: 'Politics, Economics, History',
    avatar: '/avatars/marcus-williams.jpg',
    personality: 'Scholarly, balanced, diplomatic',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    key: 'technology' as const,
    name: 'Tech Expert Sam Rivera',
    expertise: 'Technology, AI, Cryptocurrency', 
    avatar: '/avatars/sam-rivera.jpg',
    personality: 'Enthusiastic, cutting-edge, accessible',
    color: 'from-purple-500 to-pink-500'
  },
  {
    key: 'general' as const,
    name: 'Dr. Alex Thompson',
    expertise: 'Climate, Environment, Energy',
    avatar: '/avatars/alex-thompson.jpg', 
    personality: 'Passionate, scientific, solutions-oriented',
    color: 'from-yellow-500 to-orange-500'
  }
];

export function VoiceRooms() {
  const { user } = useAuth();
  const [activeRooms, setActiveRooms] = useState<VoiceRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<VoiceRoom | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedModerator, setSelectedModerator] = useState<keyof typeof AI_MODERATOR_PERSONAS>('general');
  const [aiVideoResponse, setAiVideoResponse] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isInitializingPersonas, setIsInitializingPersonas] = useState(false);
  const [personaStatus, setPersonaStatus] = useState<string>('AI moderators ready');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [conversationSession, setConversationSession] = useState<{
    conversation_id: string;
    conversation_url: string;
    embed_url: string;
  } | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form states for room creation
  const [roomTitle, setRoomTitle] = useState('');
  const [roomTopic, setRoomTopic] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    loadActiveRooms();
  }, []);

  useEffect(() => {
    if (currentRoom) {
      loadMessages();
      // Subscribe to real-time updates
      const subscription = supabase
        .channel(`voice-room-${currentRoom.id}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'voice_room_messages' },
          () => loadMessages()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadActiveRooms = async () => {
    // Load real rooms from database - for now showing empty state to encourage creation
    setActiveRooms([]);
  };

  const loadMessages = async () => {
    if (!currentRoom || !currentRoom.ai_moderator) return;

    // Start Tavus conversation session
    await startTavusConversation();
  };

  const startTavusConversation = async () => {
    if (!currentRoom?.ai_moderator) return;
    
    setIsLoadingConversation(true);
    
    try {
      console.log('Starting Tavus conversation...');
      
      // Get the replica_id for this AI moderator
      const moderatorInfo = AI_MODERATOR_PERSONAS[currentRoom.ai_moderator];
      const replicaId = moderatorInfo.replica_id;
      
      console.log(`Creating conversation with replica ID: ${replicaId}`);
      
      // Create conversation session using correct Tavus API format
      const session = await createConversationSession(replicaId);
      
      // Create embed URL with options
      const embedUrl = createTavusEmbedUrl(session.conversation_url, {
        autoplay: true,
        controls: true,
        muted: false
      });

      setConversationSession({
        conversation_id: session.conversation_id,
        conversation_url: session.conversation_url,
        embed_url: embedUrl
      });

      console.log('Tavus conversation started:', session);
      setPersonaStatus(`✅ Live conversation with ${moderatorInfo.name}`);
      
    } catch (error) {
      console.error('Error starting Tavus conversation:', error);
      setPersonaStatus('❌ Failed to start AI conversation - Check console for details');
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const endTavusConversation = async () => {
    if (conversationSession) {
      try {
        await endConversation(conversationSession.conversation_id);
        setConversationSession(null);
        setPersonaStatus('Conversation ended');
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
    }
  };

  const createRoom = async () => {
    if (!roomTitle.trim() || !roomTopic.trim()) return;

    try {
    const newRoom: VoiceRoom = {
      id: Date.now().toString(),
      title: roomTitle,
      topic: roomTopic,
        description: roomDescription,
      host_id: user?.id || '',
      host_name: user?.email?.split('@')[0] || 'Host',
        participants: [
          {
        id: '1',
        user_id: user?.id || '',
        username: user?.email?.split('@')[0] || 'Host',
        is_speaking: false,
        is_muted: false,
        is_video_on: true,
        joined_at: new Date().toISOString(),
            reputation_score: 750
          }
        ],
      ai_moderator: selectedModerator,
      is_active: true,
      max_participants: maxParticipants,
        is_public: isPublic,
        created_at: new Date().toISOString()
    };

      setActiveRooms([newRoom, ...activeRooms]);
      setCurrentRoom(newRoom);
      setIsInRoom(true);
    setShowCreateModal(false);
    
    // Reset form
    setRoomTitle('');
    setRoomTopic('');
    setRoomDescription('');
    setMaxParticipants(10);
    setIsPublic(true);
      setSelectedModerator('general');
      
      // Show success message
      setPersonaStatus(`✅ Room created with ${AI_MODERATOR_PERSONAS[selectedModerator].name} as moderator`);
      
    } catch (error) {
      console.error('Error creating room:', error);
      setPersonaStatus('❌ Failed to create room');
    }
  };

  const joinRoom = async (room: VoiceRoom) => {
    setCurrentRoom(room);
    setIsInRoom(true);
    
    // Add user to participants
    const updatedRoom = {
      ...room,
      participants: [...room.participants, {
        id: Date.now().toString(),
        user_id: user?.id || '',
        username: user?.email?.split('@')[0] || 'User',
        is_speaking: false,
        is_muted: false,
        is_video_on: true,
        joined_at: new Date().toISOString(),
        reputation_score: 350
      }]
    };
    
    setCurrentRoom(updatedRoom);
  };

  const leaveRoom = async () => {
    // End Tavus conversation if active
    await endTavusConversation();
    
    setCurrentRoom(null);
    setIsInRoom(false);
    setMessages([]);
    setAiVideoResponse(null);
    setConversationSession(null);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return;

    const message: DebateMessage = {
      id: Date.now().toString(),
      user_id: user?.id || '',
      username: user?.email?.split('@')[0] || 'User',
      content: newMessage.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Note: With direct Tavus conversation, users interact directly with AI
    // No need for separate message handling
  };

  const getReputationBadge = (score: number) => {
    if (score >= 900) return { icon: Crown, color: 'text-yellow-400', label: 'Truth Guardian' };
    if (score >= 600) return { icon: Star, color: 'text-purple-400', label: 'Expert' };
    if (score >= 300) return { icon: Shield, color: 'text-blue-400', label: 'Fact Checker' };
    return { icon: Users, color: 'text-gray-400', label: 'Member' };
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      let audioChunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

        // Convert speech to text (simplified for demo)
        try {
          // In production, you'd use a proper speech-to-text service
          const mockText = "This is a simulated voice message about the topic being discussed.";
          setNewMessage(mockText);
          
          // Automatically send the voice message
          setTimeout(() => {
            sendMessage();
          }, 100);
        } catch (error) {
          console.error('Error processing voice input:', error);
        }
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  if (isInRoom && currentRoom) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-200px)] grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Video/Audio Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Room Header */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{currentRoom.title}</CardTitle>
                    <p className="text-gray-400 text-sm">{currentRoom.topic}</p>
                  </div>
                  <Button
                    onClick={leaveRoom}
                    variant="destructive"
                    size="sm"
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    Leave Room
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* AI Moderator Video Feed - Always Visible */}
              <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="w-6 h-6 text-blue-400" />
                  AI Moderator - {currentRoom.ai_moderator ? AI_MODERATOR_PERSONAS[currentRoom.ai_moderator].name : 'General AI'}
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
                <CardContent className="p-4">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
                  {/* Tavus AI Conversation Interface */}
                  {conversationSession ? (
                    <iframe
                      src={conversationSession.embed_url}
                      className="w-full h-full border-0 rounded-lg"
                      allow="camera; microphone; fullscreen"
                      allowFullScreen
                      title={`AI Conversation with ${currentRoom.ai_moderator ? AI_MODERATOR_PERSONAS[currentRoom.ai_moderator].name : 'AI Moderator'}`}
                    />
                  ) : isLoadingConversation ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white font-medium">Starting AI Conversation...</p>
                        <p className="text-gray-300 text-sm">
                          Connecting to {currentRoom.ai_moderator ? AI_MODERATOR_PERSONAS[currentRoom.ai_moderator].name : 'AI Moderator'}
                        </p>
                      </div>
                    </div>
                    ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                        <div className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bot className="w-12 h-12 text-white" />
                        </div>
                        <p className="text-white font-medium">AI Moderator Ready</p>
                        <p className="text-gray-300 text-sm">
                          {currentRoom.ai_moderator ? AI_MODERATOR_PERSONAS[currentRoom.ai_moderator].name : 'AI Moderator'} is waiting to start the conversation
                        </p>
                        <Button 
                          onClick={startTavusConversation}
                          className="mt-4 bg-blue-600 hover:bg-blue-700"
                          disabled={isLoadingConversation}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Conversation
                        </Button>
                        </div>
                      </div>
                    )}
                  </div>

                {/* AI Status */}
                <div className="flex justify-between items-center bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${conversationSession ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="text-white text-sm">
                      {conversationSession ? 'AI Conversation Active' : 'AI Ready to Talk'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className={`w-4 h-4 ${conversationSession ? 'text-green-400' : 'text-gray-400'}`} />
                    <Mic className={`w-4 h-4 ${conversationSession ? 'text-green-400' : 'text-gray-400'}`} />
                  </div>
                </div>

                {/* Conversation Controls */}
                {conversationSession && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="text-white font-medium text-sm">Live AI Conversation</p>
                          <p className="text-gray-400 text-xs">
                            Talking with {currentRoom.ai_moderator ? AI_MODERATOR_PERSONAS[currentRoom.ai_moderator].name : 'AI Moderator'}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={endTavusConversation}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <PhoneOff className="w-4 h-4 mr-2" />
                        End Chat
                      </Button>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>

            {/* Participants Grid */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Human Participants ({currentRoom.participants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentRoom.participants.map((participant) => {
                    const badge = getReputationBadge(participant.reputation_score);
                    const BadgeIcon = badge.icon;
                    
                    return (
                      <div
                        key={participant.id}
                        className={`relative bg-gray-800 rounded-lg p-3 border ${
                          participant.is_speaking ? 'border-green-500 ring-2 ring-green-500/30' : 'border-gray-700'
                        }`}
                      >
                        <div className="aspect-video bg-gray-900 rounded-lg mb-2 flex items-center justify-center">
                          {participant.is_video_on ? (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {participant.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          ) : (
                            <VideoOff className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-xs truncate">{participant.username}</p>
                            <div className="flex items-center gap-1">
                              <BadgeIcon className={`w-3 h-3 ${badge.color}`} />
                              <span className="text-xs text-gray-400 truncate">{badge.label}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            {participant.is_muted ? (
                              <MicOff className="w-3 h-3 text-red-400" />
                            ) : (
                              <Mic className="w-3 h-3 text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    variant={isMuted ? 'destructive' : 'outline'}
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant={isVideoOn ? 'outline' : 'destructive'}
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant={isSpeaking ? 'default' : 'outline'}
                    onClick={() => setIsSpeaking(!isSpeaking)}
                  >
                    {isSpeaking ? 'Stop Speaking' : 'Request to Speak'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation Status Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-700 h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversation Status
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4">
                {/* Conversation Status */}
                <div className="space-y-4">
                  {conversationSession ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-medium">Live Conversation Active</span>
                        </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-white">
                          🤖 <strong>{currentRoom?.ai_moderator ? AI_MODERATOR_PERSONAS[currentRoom.ai_moderator].name : 'AI Moderator'}</strong>
                        </p>
                        <p className="text-gray-400">
                          Expertise: {currentRoom?.ai_moderator ? AI_MODERATOR_PERSONAS[currentRoom.ai_moderator].expertise.join(', ') : 'General'}
                        </p>
                        <p className="text-gray-400">
                          Topic: {currentRoom?.topic}
                        </p>
                        <div className="mt-3 p-2 bg-gray-800 rounded">
                          <p className="text-xs text-gray-500">Conversation ID:</p>
                          <p className="text-xs text-gray-300 font-mono">{conversationSession.conversation_id}</p>
                          </div>
                            </div>
                        </div>
                  ) : (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="text-center">
                        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-white font-medium mb-2">Ready to Start</p>
                        <p className="text-gray-400 text-sm">
                          Click "Start Conversation" in the video area to begin talking with your AI moderator
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Room Info */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Room Details</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-400">
                        <span className="text-white">Title:</span> {currentRoom?.title}
                      </p>
                      <p className="text-gray-400">
                        <span className="text-white">Topic:</span> {currentRoom?.topic}
                      </p>
                      <p className="text-gray-400">
                        <span className="text-white">Host:</span> {currentRoom?.host_name}
                      </p>
                      <p className="text-gray-400">
                        <span className="text-white">Participants:</span> {currentRoom?.participants.length}/{currentRoom?.max_participants}
                      </p>
                    </div>
                </div>

                  {/* Tips */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2">💡 Tips for Better Conversations</h4>
                    <ul className="text-gray-400 text-xs space-y-1">
                      <li>• Speak clearly and at a normal pace</li>
                      <li>• Ask specific questions about the topic</li>
                      <li>• Share your perspective and listen to AI insights</li>
                      <li>• Use the full-screen option for better experience</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Mic className="w-8 h-8 text-purple-400" />
              Voice Rooms
            </h1>
            <p className="text-gray-400">
              Join live debates with AI moderators and real-time video avatars
            </p>
            {/* Persona Status */}
            <div className="mt-2 flex items-center gap-2">
              {isInitializingPersonas ? (
                <div className="flex items-center gap-2 text-blue-400">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{personaStatus}</span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  AI Status: {personaStatus}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
              disabled={isInitializingPersonas}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
          </div>
        </motion.div>

        {/* Active Rooms */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRooms.map((room) => {
            const moderator = room.ai_moderator ? AI_MODERATOR_PERSONAS[room.ai_moderator] : null;
            
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-1">{room.title}</CardTitle>
                        <p className="text-gray-400 text-sm">{room.topic}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Live
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm">{room.description}</p>
                    
                    {/* AI Moderator */}
                    {moderator && (
                      <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{moderator.name}</p>
                          <p className="text-gray-400 text-xs">{moderator.expertise.join(', ')}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Room Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {room.participants.length}/{room.max_participants}
                        </span>
                        <span className="text-gray-400">
                          Host: {room.host_name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Join Button */}
                    <Button 
                      onClick={() => joinRoom(room)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={room.participants.length >= room.max_participants}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {room.participants.length >= room.max_participants ? 'Room Full' : 'Join Room'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {activeRooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Create Your First AI-Moderated Room</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Start a truth-seeking discussion with our expert AI moderators. Choose from specialized AI personalities 
              trained in science, politics, health, technology, or general fact-checking. Your AI moderator will 
              provide real-time insights, maintain balanced discussions, and help verify claims with evidence-based analysis.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-white font-medium mb-2">Real AI Responses</h4>
                <p className="text-gray-400 text-sm">
                  Powered by Tavus video AI and ElevenLabs voice synthesis for authentic moderator interactions
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-white font-medium mb-2">Voice & Text Input</h4>
                <p className="text-gray-400 text-sm">
                  Communicate through voice messages or text - your AI moderator responds naturally to both
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-white font-medium mb-2">Expert Moderation</h4>
                <p className="text-gray-400 text-sm">
                  Choose AI moderators specialized in your topic for informed, balanced facilitation
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Room
              </Button>
              
              <div className="text-sm text-gray-500">
                <span className="text-green-400">✅ {Object.keys(AI_MODERATOR_PERSONAS).length} AI moderators ready (using Tavus replicas)</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Create Room Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
              >
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Create Voice Room</CardTitle>
                      <Button
                        onClick={() => setShowCreateModal(false)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* Left Column - Basic Info */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-4">Room Details</h3>
                          
                          <div className="space-y-4">
                                                <div>
                              <label className="text-sm font-medium text-white mb-2 block">
                                Room Title *
                              </label>
                              <Input
                                value={roomTitle}
                                onChange={(e) => setRoomTitle(e.target.value)}
                                placeholder="Enter room title..."
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-white mb-2 block">
                                Topic *
                              </label>
                              <Input
                                value={roomTopic}
                                onChange={(e) => setRoomTopic(e.target.value)}
                                placeholder="What will you be debating?"
                                className="bg-gray-800 border-gray-700 text-white"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-white mb-2 block">
                                Description
                              </label>
                              <textarea
                                value={roomDescription}
                                onChange={(e) => setRoomDescription(e.target.value)}
                                placeholder="Brief description of the debate..."
                                className="w-full h-24 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-white mb-2 block">
                                  Max Participants
                                </label>
                                <Input
                                  type="number"
                                  value={maxParticipants}
                                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                                  min={2}
                                  max={20}
                                  className="bg-gray-800 border-gray-700 text-white"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium text-white mb-2 block">
                                  Room Type
                                </label>
                                <select
                                  value={isPublic ? 'public' : 'private'}
                                  onChange={(e) => setIsPublic(e.target.value === 'public')}
                                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                                >
                                  <option value="public">Public</option>
                                  <option value="private">Private</option>
                                </select>
                              </div>
                            </div>
                          </div>
                      </div>
                    </div>

                      {/* Right Column - AI Moderator Selection */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-4">Choose AI Moderator</h3>
                          
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {Object.entries(AI_MODERATOR_PERSONAS).map(([key, persona]) => {
                              const typedKey = key as keyof typeof AI_MODERATOR_PERSONAS;
                              const isSelected = selectedModerator === typedKey;
                              
                              return (
                                <div
                                  key={key}
                                  onClick={() => setSelectedModerator(typedKey)}
                                  className={`
                                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                                    ${isSelected 
                                      ? 'border-blue-500 bg-blue-500/10' 
                                      : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                                    }
                                  `}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-white">{persona.name}</h4>
                                        <p className="text-sm text-gray-400">{persona.personality}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                        Ready
                                      </Badge>
                                      {isSelected && (
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-xs text-gray-400">Expertise:</span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {persona.expertise.map((skill) => (
                                          <Badge 
                                            key={skill}
                                            variant="outline" 
                                            className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30"
                                          >
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-500">
                                      Replica ID: {persona.replica_id}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-gray-700">
                      <Button
                        onClick={() => setShowCreateModal(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={createRoom}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        disabled={!roomTitle.trim() || !roomTopic.trim()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Room
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
} 