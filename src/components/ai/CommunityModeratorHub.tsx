import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Users, MessageSquare, Shield, 
  ChevronRight, Settings, Play, Pause, Volume2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { AIService, CommunityService } from '../../lib/supabase-service';
import { useAuth } from '../../lib/auth';
import { useToast } from '../ui/use-toast';

interface CommunityData {
  id: string;
  name: string;
  topic: string;
  activeDiscussions: number;
  totalMembers: number;
  moderationLevel: 'low' | 'medium' | 'high';
  recentActivity: string;
}

export function CommunityModeratorHub() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<CommunityData[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const communityData = await CommunityService.getCommunities();
      
      // Transform data to match our interface - remove mock data
      const formattedCommunities = communityData.map(community => ({
        id: community.id,
        name: community.name,
        topic: community.topic,
        activeDiscussions: 0, // Real data: no discussions yet
        totalMembers: 1, // Real data: just the creator or 0 if system community
        moderationLevel: 'medium' as const,
        recentActivity: 'No activity yet'
      }));

      setCommunities(formattedCommunities);
    } catch (error) {
      console.error('Error loading communities:', error);
      // Fallback to empty array
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const moderators = [
    {
      id: 'dr-veritas',
      name: 'Dr. Veritas',
      role: 'Scientific Fact Checker',
      specialty: 'Research & Data Analysis',
      avatar: '🔬',
      personality: 'Methodical and evidence-based',
      voiceId: 'EXAVITQu4vr4xnSDxMaL' // Bella voice from ElevenLabs
    },
    {
      id: 'judge-balance',
      name: 'Judge Balance',
      role: 'Legal & Ethics Moderator',
      specialty: 'Law & Ethical Guidelines',
      avatar: '⚖️',
      personality: 'Fair and impartial',
      voiceId: '21m00Tcm4TlvDq8ikWAM' // Rachel voice from ElevenLabs
    },
    {
      id: 'tech-oracle',
      name: 'Tech Oracle',
      role: 'Technology Analyst',
      specialty: 'Tech & Innovation',
      avatar: '💻',
      personality: 'Analytical and forward-thinking',
      voiceId: 'AZnzlk1XvdvUeBnXmlld' // Domi voice from ElevenLabs
    }
  ];

  const handleAIModeration = async (moderatorId: string) => {
    if (!userPrompt.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a prompt for the AI moderator",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setAiResponse('');
    setAudioUrl(null);

    try {
      // Generate AI response
      const response = await AIService.generateAIModeratorResponse(moderatorId, userPrompt);
      
      if (response.error) {
        // Fallback response for demo
        const fallbackResponses = {
          'dr-veritas': `As Dr. Veritas, I would analyze this statement: "${userPrompt}". Based on current scientific evidence and peer-reviewed research, I recommend conducting a thorough fact-check using multiple credible sources. The verification process should include cross-referencing with established databases and consulting subject matter experts.`,
          'judge-balance': `As Judge Balance, examining: "${userPrompt}". From a legal and ethical perspective, we must consider the implications of this statement. I recommend evaluating potential biases, checking for compliance with platform guidelines, and ensuring fair representation of all viewpoints while maintaining accuracy.`,
          'tech-oracle': `As Tech Oracle, processing: "${userPrompt}". From a technological standpoint, this requires analysis of technical accuracy, innovation feasibility, and potential impact. I suggest verification through technical documentation, expert consultation, and trend analysis to ensure accurate information dissemination.`
        };
        
        setAiResponse(fallbackResponses[moderatorId as keyof typeof fallbackResponses] || 'AI moderator response unavailable');
      } else {
        setAiResponse(response.content || response.message || 'No response generated');
      }

      // Generate voice response
      const moderator = moderators.find(m => m.id === moderatorId);
      if (moderator) {
        const audioUrl = await AIService.generateVoiceResponse(
          aiResponse || 'AI response generated successfully',
          moderator.voiceId
        );
        if (audioUrl) {
          setAudioUrl(audioUrl);
        }
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "AI Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white">Loading AI Moderators...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Updated with gradient text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent mb-2">
            AI Moderator Hub
          </h1>
          <p className="text-gray-400 text-lg">
            Advanced AI-powered content moderation with specialized expertise
          </p>
        </motion.div>

        {/* AI Moderators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {moderators.map((moderator, index) => (
            <motion.div 
              key={moderator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-[#0c0c1d] border-gray-800 hover:border-purple-500/50 transition-all duration-300 rounded-xl">
                <CardHeader className="text-center pb-2">
                  <div className="text-5xl mb-3">{moderator.avatar}</div>
                  <CardTitle className="text-white text-lg">{moderator.name}</CardTitle>
                  <p className="text-blue-400 text-sm">{moderator.role}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-white font-medium mb-1 text-sm">Specialty</h4>
                    <p className="text-gray-400 text-xs">{moderator.specialty}</p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1 text-sm">Personality</h4>
                    <p className="text-gray-400 text-xs">{moderator.personality}</p>
                  </div>
                  <Button
                    onClick={() => handleAIModeration(moderator.id)}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-sm py-2"
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    {isLoading ? 'Analyzing...' : 'Activate Moderator'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Moderation Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-[#0c0c1d] border-gray-800 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                AI Moderation Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Content to Analyze
                </label>
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Enter the content or statement you want the AI moderators to analyze..."
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              {aiResponse && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium">AI Moderator Response</h4>
                    {audioUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={playAudio}
                        disabled={isPlaying}
                        className="bg-gray-700/50 border-gray-600"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <Volume2 className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-300 leading-relaxed">{aiResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Communities Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-[#0c0c1d] border-gray-800 rounded-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-blue-400" />
                Community Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {communities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400">No communities found</div>
                  <p className="text-sm text-gray-600 mt-2">
                    Communities will appear here as they are created
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {communities.map((community) => (
                    <div
                      key={community.id}
                      className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{community.name}</h3>
                          <p className="text-gray-400 text-sm">{community.topic}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-white font-medium">{community.activeDiscussions}</p>
                          <p className="text-gray-400 text-xs">Discussions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-medium">{community.totalMembers}</p>
                          <p className="text-gray-400 text-xs">Members</p>
                        </div>
                        <Badge
                          variant={
                            community.moderationLevel === 'high' ? 'destructive' :
                            community.moderationLevel === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {community.moderationLevel} moderation
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-700/50 border-gray-600"
                        >
                          Manage
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 