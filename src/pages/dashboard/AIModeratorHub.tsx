import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Bot, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Video,
  MessageCircle,
  Brain,
  Mic,
  User,
  Settings,
  Zap,
  Star,
  Trophy
} from 'lucide-react';
import { TavusAvatar } from '../../components/ai/TavusAvatar';
import { 
  AI_MODERATOR_PERSONAS, 
  createModeratorVideo, 
  getVideoStatus,
  ModeratorVideoRequest 
} from '../../lib/tavus';
import { 
  generateModeratorVoice,
  VOICE_PERSONAS 
} from '../../lib/elevenlabs';
import { format } from 'date-fns';

interface ModeratorDemo {
  id: string;
  moderator: keyof typeof AI_MODERATOR_PERSONAS;
  scenario: string;
  user_message: string;
  ai_response: {
    video_url?: string;
    audio_url?: string;
    text: string;
    created_at: string;
    status: 'generating' | 'completed' | 'error';
  };
}

const AI_MODERATOR_PROFILES = [
  {
    key: 'health' as const,
    name: 'Dr. Sarah Chen',
    title: 'Medical Expert',
    expertise: 'Health, Medicine, Biology',
    personality: 'Professional, caring, evidence-focused',
    color: 'from-green-500 to-teal-500',
    specialties: ['Clinical Research', 'Public Health'],
    experience: '15+ years in clinical medicine and research'
  },
  {
    key: 'politics' as const,
    name: 'Professor Marcus Williams',
    title: 'Political Analyst',
    expertise: 'Politics, Economics, History',
    personality: 'Scholarly, balanced, diplomatic',
    color: 'from-blue-500 to-indigo-500',
    specialties: ['Constitutional Law', 'Electoral Systems'],
    experience: '20+ years in political science and policy analysis'
  },
  {
    key: 'technology' as const,
    name: 'Tech Expert Sam Rivera',
    title: 'Technology Specialist',
    expertise: 'Technology, AI, Cryptocurrency',
    personality: 'Enthusiastic, cutting-edge, accessible',
    color: 'from-purple-500 to-pink-500',
    specialties: ['Artificial Intelligence', 'Blockchain'],
    experience: '12+ years in tech innovation and AI research'
  },
  {
    key: 'general' as const,
    name: 'Dr. Alex Thompson',
    title: 'Environmental Scientist',
    expertise: 'Climate, Environment, Energy',
    personality: 'Passionate, scientific, solutions-oriented',
    color: 'from-yellow-500 to-orange-500',
    specialties: ['Climate Science', 'Environmental Policy'],
    experience: '18+ years in climate research and environmental advocacy'
  }
];

export function AIModeratorHub() {
  const [selectedModerator, setSelectedModerator] = useState<keyof typeof AI_MODERATOR_PERSONAS>('health');
  const [demoScenario, setDemoScenario] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [moderationType, setModerationTypes] = useState<'introduction' | 'analysis' | 'summary' | 'ruling'>('analysis');
  const [demos, setDemos] = useState<ModeratorDemo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);

  // Demo scenarios for different topics
  const demoScenarios = {
    science: "Recent study claims that a new AI model can predict earthquakes with 95% accuracy. Researchers at MIT used machine learning to analyze seismic data patterns.",
    politics: "New policy proposal suggests implementing universal basic income of $1000 per month for all citizens. Supporters claim it will reduce poverty, critics worry about inflation.",
    health: "Latest research indicates that drinking 8 glasses of green tea daily can reduce heart disease risk by 40%. Study followed 10,000 participants over 5 years.",
    technology: "Breakthrough quantum computer achieves 1000-qubit milestone, potentially breaking current encryption methods. Tech companies rush to develop quantum-resistant security.",
    general: "Social media platform announces new fact-checking algorithm that uses blockchain verification. Claims to reduce misinformation by 80% through community consensus."
  };

  useEffect(() => {
    setDemoScenario(demoScenarios[selectedModerator]);
    loadSampleDemos();
  }, [selectedModerator]);

  const loadSampleDemos = () => {
    const sampleDemos: ModeratorDemo[] = [
      {
        id: '1',
        moderator: 'health',
        scenario: 'Health Fact-Check',
        user_message: 'I read that taking 10 grams of vitamin C daily can cure COVID-19. Is this true?',
        ai_response: {
          text: 'As Dr. Sarah Chen, I need to address this health claim with evidence-based analysis. While vitamin C supports immune function, there is no scientific evidence that megadoses can cure COVID-19.',
          created_at: new Date().toISOString(),
          status: 'completed',
          video_url: 'demo-video-url',
          audio_url: 'demo-audio-url'
        }
      },
      {
        id: '2',
        moderator: 'politics',
        scenario: 'Political Analysis',
        user_message: 'There was widespread voter fraud in the 2020 election that changed the results.',
        ai_response: {
          text: 'As Professor Marcus Williams, I must examine this political claim objectively. Multiple audits, recounts, and court decisions found no evidence of widespread fraud that would have changed the election results.',
          created_at: new Date().toISOString(),
          status: 'completed',
          video_url: 'demo-video-url',
          audio_url: 'demo-audio-url'
        }
      }
    ];

    setDemos(sampleDemos);
  };

  const handleCustomDemo = () => {
    if (customInput.trim()) {
      setDemoScenario(customInput.trim());
    }
  };

  const generateCustomDemo = async () => {
    if (!customInput.trim()) return;

    setIsGenerating(true);
    
    try {
      // Create fallback demo immediately for better UX
      const fallbackDemo: ModeratorDemo = {
        id: Date.now().toString(),
        moderator: selectedModerator,
        scenario: `Custom analysis: "${customInput}"`,
        user_message: customInput,
        ai_response: {
          text: `As ${AI_MODERATOR_PROFILES.find(p => p.key === selectedModerator)?.name}, I want to address your statement: "${customInput}". Let me provide some evidence-based perspective on this topic.`,
          created_at: new Date().toISOString(),
          status: 'generating'
        }
      };

      // Add demo immediately
      setDemos(prev => [fallbackDemo, ...prev]);

      try {
        // Attempt to generate actual video and audio
        const moderatorRequest: ModeratorVideoRequest = {
          topic: selectedModerator,
          discussion_content: 'User has made a claim that requires fact-checking and analysis.',
          post_content: customInput,
          moderation_type: 'analysis'
        };

        const script = `As ${AI_MODERATOR_PROFILES.find(p => p.key === selectedModerator)?.name}, I want to address your statement: "${customInput}". Let me provide some evidence-based perspective on this topic.`;
        
        // Try video generation
        let videoUrl = undefined;
        let audioUrl = undefined;

        try {
          const videoResponse = await createModeratorVideo(moderatorRequest);
          videoUrl = videoResponse.video_url;
        } catch (videoError) {
          console.warn('Video generation failed, continuing with audio only:', videoError);
        }

        try {
          const voiceResponse = await generateModeratorVoice(script, selectedModerator, 'analysis');
          audioUrl = voiceResponse.audio_url;
        } catch (audioError) {
          console.warn('Audio generation failed:', audioError);
        }

        // Update the demo with generated content
        setDemos(prev => prev.map(demo => 
          demo.id === fallbackDemo.id 
            ? {
                ...demo,
                ai_response: {
                  ...demo.ai_response,
                  video_url: videoUrl,
                  audio_url: audioUrl,
                  status: 'completed'
                }
              }
            : demo
        ));

        if (!videoUrl && !audioUrl) {
          // If both failed, mark as completed with text only
          setDemos(prev => prev.map(demo => 
            demo.id === fallbackDemo.id 
              ? {
                  ...demo,
                  ai_response: {
                    ...demo.ai_response,
                    status: 'completed'
                  }
                }
              : demo
          ));
        }

      } catch (error) {
        console.error('Error generating AI content:', error);
        // Update status to completed even if API calls failed
        setDemos(prev => prev.map(demo => 
          demo.id === fallbackDemo.id 
            ? {
                ...demo,
                ai_response: {
                  ...demo.ai_response,
                  status: 'completed'
                }
              }
            : demo
        ));
      }

      setCustomInput('');

    } catch (error) {
      console.error('Error generating AI demo:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const playVideo = (videoId: string) => {
    setActiveVideo(videoId);
    setActiveAudio(null);
  };

  const playAudio = (audioId: string) => {
    setActiveAudio(audioId);
    setActiveVideo(null);
  };

  const stopAll = () => {
    setActiveVideo(null);
    setActiveAudio(null);
  };

  const selectedProfile = AI_MODERATOR_PROFILES.find(p => p.key === selectedModerator);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Bot className="w-10 h-10 text-purple-400" />
            AI Moderator Hub
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Experience TruthChain's advanced AI moderation powered by{' '}
            <span className="text-blue-400 font-semibold">Tavus video avatars</span> and{' '}
            <span className="text-green-400 font-semibold">ElevenLabs voice AI</span>.{' '}
            Our expert moderators provide real-time fact-checking and evidence-based analysis.
          </p>
        </motion.div>

        {/* Integration Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                Technology Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="text-white font-medium">Tavus AI Video Avatars</h4>
                      <p className="text-gray-400 text-sm">Realistic AI moderators with custom personalities</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-green-400" />
                    <div>
                      <h4 className="text-white font-medium">ElevenLabs Voice AI</h4>
                      <p className="text-gray-400 text-sm">Natural voice synthesis with emotional intelligence</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-white font-medium">Advanced NLP</h4>
                      <p className="text-gray-400 text-sm">Context-aware fact-checking and analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <div>
                      <h4 className="text-white font-medium">Expert Personas</h4>
                      <p className="text-gray-400 text-sm">Specialized knowledge for different domains</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Moderator Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle>Select AI Moderator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(AI_MODERATOR_PERSONAS).map(([key, persona]) => (
                  <motion.button
                    key={key}
                    onClick={() => setSelectedModerator(key as keyof typeof AI_MODERATOR_PERSONAS)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedModerator === key
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedModerator === key ? 'bg-purple-500' : 'bg-gray-500'
                      }`} />
                      <h3 className="text-white font-medium">{persona.name}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{persona.personality}</p>
                    <div className="flex flex-wrap gap-1">
                      {persona.expertise.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Demo Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle>Demo Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Moderation Type
                </label>
                <div className="flex gap-2">
                  {(['introduction', 'analysis', 'summary', 'ruling'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={moderationType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setModerationTypes(type)}
                      className={moderationType === type ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Demo Scenario
                </label>
                <div className="space-y-2">
                  <textarea
                    value={demoScenario}
                    onChange={(e) => setDemoScenario(e.target.value)}
                    className="w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 resize-none"
                    placeholder="Enter a claim or statement for the AI moderator to analyze..."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Custom Input
                </label>
                <div className="flex gap-2">
                  <Input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter your own scenario..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <Button onClick={handleCustomDemo} variant="outline">
                    Use Custom
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live AI Moderator Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Live AI Moderator Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {demoScenario && (
                <TavusAvatar
                  topic={selectedModerator}
                  content={demoScenario}
                  moderationType={moderationType}
                  onVideoReady={(videoUrl) => {
                    console.log('✅ Tavus video ready:', videoUrl);
                  }}
                  className="w-full"
                />
              )}
              
              {!demoScenario && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-gray-400 text-lg mb-2">No Scenario Selected</h3>
                  <p className="text-gray-500">
                    Please enter a demo scenario above to see the AI moderator in action.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Video,
              title: "HD Video Avatars",
              description: "Realistic AI moderators with lifelike expressions and gestures",
              color: "text-blue-400"
            },
            {
              icon: Mic,
              title: "Natural Voice",
              description: "Human-like speech synthesis with emotional intelligence",
              color: "text-green-400"
            },
            {
              icon: Brain,
              title: "Context Awareness",
              description: "Understands nuance and context in complex discussions",
              color: "text-purple-400"
            },
            {
              icon: MessageCircle,
              title: "Real-time Analysis",
              description: "Instant fact-checking and evidence-based responses",
              color: "text-yellow-400"
            },
            {
              icon: User,
              title: "Expert Personas",
              description: "Specialized knowledge for science, politics, health, and more",
              color: "text-pink-400"
            },
            {
              icon: Settings,
              title: "Customizable",
              description: "Adjust personality, expertise, and moderation style",
              color: "text-cyan-400"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <Card className="bg-gray-800/30 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="p-6 text-center">
                  <feature.icon className={`w-8 h-8 ${feature.color} mx-auto mb-3`} />
                  <h3 className="text-white font-medium mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Response Gallery */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-purple-400" />
              AI Moderation Examples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {demos.map((demo) => {
                const moderatorProfile = AI_MODERATOR_PROFILES.find(p => p.key === demo.moderator);
                
                return (
                  <motion.div
                    key={demo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-700 rounded-lg p-4 space-y-4"
                  >
                    {/* User Message */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">User</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(demo.ai_response.created_at), 'MMM d, HH:mm')}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm bg-gray-800/30 p-3 rounded-lg">
                          {demo.user_message}
                        </p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 bg-gradient-to-br ${moderatorProfile?.color} rounded-full flex items-center justify-center`}>
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium text-sm">{moderatorProfile?.name}</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            AI Moderator
                          </Badge>
                          {demo.ai_response.status === 'generating' && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs animate-pulse">
                              Generating...
                            </Badge>
                          )}
                        </div>
                        
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-3">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {demo.ai_response.text}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            {demo.ai_response.video_url && demo.ai_response.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => playVideo(demo.id)}
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                              >
                                <Video className="w-3 h-3 mr-1" />
                                Tavus Video
                              </Button>
                            )}
                            
                            {demo.ai_response.audio_url && demo.ai_response.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => playAudio(demo.id)}
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                              >
                                <Volume2 className="w-3 h-3 mr-1" />
                                ElevenLabs Voice
                              </Button>
                            )}
                            
                            {(activeVideo === demo.id || activeAudio === demo.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={stopAll}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              >
                                <Pause className="w-3 h-3 mr-1" />
                                Stop
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Technical Integration Details */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-400" />
              Technical Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-400" />
                  Tavus AI Implementation
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Real-time video generation</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Custom avatar personalities</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">4 Experts</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Contextual expressions</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Professional backgrounds</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Studio Quality</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-green-400" />
                  ElevenLabs Integration
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Voice synthesis quality</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Premium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Real-time processing</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Fast</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Emotional intelligence</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Advanced</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Language support</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">20+ Languages</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 