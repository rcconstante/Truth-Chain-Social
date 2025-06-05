import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  Brain, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  Eye,
  Mic,
  MicOff
} from 'lucide-react';
import { 
  createModeratorVideo, 
  analyzeDiscussionForModeration,
  AI_MODERATOR_PERSONAS,
  ModeratorVideoRequest 
} from '../../lib/tavus';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface AIModeratorSystemProps {
  postId?: string;
  postContent?: string;
  discussionContent?: string;
  topic?: keyof typeof AI_MODERATOR_PERSONAS;
  onAnalysisComplete?: (analysis: any) => void;
}

interface ModeratorAnalysis {
  needsModeration: boolean;
  confidence: number;
  suggestions: string[];
  moderatorResponse?: string;
  factCheckResults?: any[];
  credibilityScore?: number;
}

export function AIModeratorSystem({ 
  postId, 
  postContent = '', 
  discussionContent = '', 
  topic = 'general',
  onAnalysisComplete 
}: AIModeratorSystemProps) {
  const { user } = useAuth();
  const [selectedModerator, setSelectedModerator] = useState<keyof typeof AI_MODERATOR_PERSONAS>(topic);
  const [moderatorVideo, setModeratorVideo] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ModeratorAnalysis | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [interactionHistory, setInteractionHistory] = useState<any[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const speechRecognition = useRef<any>(null);

  useEffect(() => {
    loadInteractionHistory();
    setupSpeechRecognition();
  }, [postId]);

  const loadInteractionHistory = async () => {
    if (!postId) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_interactions')
        .select(`
          *,
          ai_moderators (name, personality)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setInteractionHistory(data);
      }
    } catch (error) {
      console.error('Failed to load interaction history:', error);
    }
  };

  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = true;
      speechRecognition.current.interimResults = true;
      speechRecognition.current.lang = 'en-US';
      
      speechRecognition.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        // Handle speech input for real-time fact-checking
        handleSpeechInput(transcript);
      };
    }
  };

  const handleSpeechInput = async (transcript: string) => {
    if (transcript.length > 20) { // Only analyze substantial speech
      await analyzeContent(transcript, 'voice_input');
    }
  };

  const startListening = () => {
    if (speechRecognition.current) {
      setIsListening(true);
      speechRecognition.current.start();
    }
  };

  const stopListening = () => {
    if (speechRecognition.current) {
      setIsListening(false);
      speechRecognition.current.stop();
    }
  };

  const analyzeContent = async (content: string = postContent, analysisType: string = 'post_analysis') => {
    setIsAnalyzing(true);
    
    try {
      console.log('🤖 Starting AI analysis for:', selectedModerator);
      
      // Perform content analysis
      const moderationResult = await analyzeDiscussionForModeration(content, selectedModerator);
      
      // Enhanced analysis with fact-checking
      const enhancedAnalysis: ModeratorAnalysis = {
        ...moderationResult,
        factCheckResults: await performFactCheck(content),
        credibilityScore: calculateCredibilityScore(content, moderationResult)
      };
      
      setAnalysis(enhancedAnalysis);
      
      // Generate AI moderator video response if needed
      if (enhancedAnalysis.needsModeration || enhancedAnalysis.confidence < 70) {
        await generateModeratorResponse(content, enhancedAnalysis, analysisType);
      }
      
      // Record AI interaction
      await recordAIInteraction(content, enhancedAnalysis, analysisType);
      
      // Callback to parent component
      if (onAnalysisComplete) {
        onAnalysisComplete(enhancedAnalysis);
      }
      
    } catch (error) {
      console.error('❌ AI analysis failed:', error);
      setAnalysis({
        needsModeration: false,
        confidence: 0,
        suggestions: ['Analysis temporarily unavailable'],
        moderatorResponse: 'I apologize, but I\'m unable to analyze this content right now. Please try again later.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performFactCheck = async (content: string): Promise<any[]> => {
    // Simulate fact-checking against known databases
    // In production, this would integrate with fact-checking APIs
    const factCheckResults = [
      {
        claim: content.substring(0, 100) + '...',
        status: Math.random() > 0.3 ? 'verified' : 'disputed',
        sources: ['Source 1', 'Source 2'],
        confidence: Math.random() * 100
      }
    ];
    
    return factCheckResults;
  };

  const calculateCredibilityScore = (content: string, analysis: any): number => {
    let score = 50; // Base score
    
    // Adjust based on analysis confidence
    score += (analysis.confidence - 50) * 0.5;
    
    // Adjust based on content characteristics
    if (content.includes('research shows') || content.includes('study')) score += 10;
    if (content.includes('I think') || content.includes('maybe')) score -= 5;
    if (content.length > 200) score += 5; // Detailed content
    
    return Math.max(0, Math.min(100, score));
  };

  const generateModeratorResponse = async (
    content: string, 
    analysis: ModeratorAnalysis, 
    moderationType: string
  ) => {
    setVideoLoading(true);
    
    try {
      console.log('🎬 Generating moderator video...');
      
      const moderatorRequest: ModeratorVideoRequest = {
        topic: selectedModerator,
        discussion_content: analysis.moderatorResponse || 'Let me provide some guidance on this topic.',
        post_content: content,
        moderation_type: moderationType as any
      };
      
      const videoResult = await createModeratorVideo(moderatorRequest);
      
      if (videoResult.video_url) {
        setModeratorVideo(videoResult.video_url);
        console.log('✅ Moderator video generated:', videoResult.video_url);
      } else {
        // Fallback to text-only response
        console.log('📝 Using text-only response');
      }
      
    } catch (error) {
      console.error('❌ Video generation failed:', error);
    } finally {
      setVideoLoading(false);
    }
  };

  const recordAIInteraction = async (content: string, analysis: ModeratorAnalysis, interactionType: string) => {
    if (!user?.id) return;
    
    try {
      // Get moderator ID from database
      const { data: moderator } = await supabase
        .from('ai_moderators')
        .select('id')
        .eq('name', AI_MODERATOR_PERSONAS[selectedModerator].name)
        .single();
      
      if (moderator) {
        await supabase
          .from('ai_interactions')
          .insert({
            moderator_id: moderator.id,
            post_id: postId,
            user_id: user.id,
            interaction_type: interactionType,
            content: analysis.moderatorResponse || 'AI analysis completed',
            video_url: moderatorVideo
          });
      }
      
      // Refresh interaction history
      await loadInteractionHistory();
      
    } catch (error) {
      console.error('Failed to record AI interaction:', error);
    }
  };

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const moderator = AI_MODERATOR_PERSONAS[selectedModerator];

  return (
    <div className="space-y-6">
      {/* AI Moderator Selection */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Moderation System</h3>
              <p className="text-gray-400 text-sm">Expert AI analysis and fact-checking</p>
            </div>
          </div>

          {/* Moderator Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {Object.entries(AI_MODERATOR_PERSONAS).map(([key, persona]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedModerator(key as keyof typeof AI_MODERATOR_PERSONAS)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedModerator === key
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-purple-400'
                }`}
              >
                <div className="font-medium text-sm">{persona.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {persona.expertise.slice(0, 2).join(', ')}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Analysis Controls */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => analyzeContent(postContent)}
              disabled={isAnalyzing || !postContent}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Content</span>
                </div>
              )}
            </Button>

            <Button
              onClick={isListening ? stopListening : startListening}
              variant="outline"
              className={`border-gray-600 ${isListening ? 'bg-red-500/20 border-red-500' : ''}`}
            >
              {isListening ? (
                <div className="flex items-center gap-2">
                  <MicOff className="w-4 h-4" />
                  <span>Stop Listening</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span>Voice Analysis</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Analysis Summary */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-purple-500/30">
                      <AvatarImage src={`/ai-avatar-${selectedModerator}.jpg`} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {moderator.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-white">{moderator.name}</h4>
                      <p className="text-sm text-gray-400">{moderator.personality}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge 
                      variant={analysis.needsModeration ? "destructive" : "default"}
                      className="bg-opacity-20"
                    >
                      {analysis.needsModeration ? (
                        <><AlertTriangle className="w-3 h-3 mr-1" /> Needs Review</>
                      ) : (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Approved</>
                      )}
                    </Badge>
                    
                    <Badge variant="outline" className="border-purple-500/30">
                      {analysis.confidence}% Confidence
                    </Badge>
                  </div>
                </div>

                {/* Credibility Score */}
                {analysis.credibilityScore && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">Credibility Score</span>
                      <span className="text-sm text-white">{analysis.credibilityScore.toFixed(1)}/100</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          analysis.credibilityScore >= 70 ? 'bg-green-500' :
                          analysis.credibilityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${analysis.credibilityScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* AI Response */}
                {analysis.moderatorResponse && (
                  <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30 mb-4">
                    <p className="text-white leading-relaxed">{analysis.moderatorResponse}</p>
                  </div>
                )}

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-white mb-2">Suggestions:</h5>
                    <ul className="space-y-1">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fact Check Results */}
                {analysis.factCheckResults && analysis.factCheckResults.length > 0 && (
                  <div>
                    <h5 className="font-medium text-white mb-2">Fact Check Results:</h5>
                    <div className="space-y-2">
                      {analysis.factCheckResults.map((result, index) => (
                        <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge 
                              variant={result.status === 'verified' ? 'default' : 'destructive'}
                              className="bg-opacity-20"
                            >
                              {result.status === 'verified' ? 'Verified' : 'Disputed'}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {result.confidence.toFixed(1)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-1">{result.claim}</p>
                          <p className="text-xs text-gray-400">
                            Sources: {result.sources.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Response */}
            {(moderatorVideo || videoLoading) && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Play className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">AI Moderator Response</h4>
                      <p className="text-sm text-gray-400">Video analysis and guidance</p>
                    </div>
                  </div>

                  {videoLoading ? (
                    <div className="flex items-center justify-center h-48 bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <motion.div
                          className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full mx-auto mb-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-gray-400">Generating AI response video...</p>
                      </div>
                    </div>
                  ) : moderatorVideo ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        src={moderatorVideo}
                        className="w-full h-48 bg-gray-800 rounded-lg object-cover"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        controls
                      />
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={isPlaying ? pauseVideo : playVideo}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={toggleMute}
                          className="border-gray-600"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        
                        <span className="text-sm text-gray-400 ml-auto">
                          AI Analysis by {moderator.name}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction History */}
      {interactionHistory.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Previous AI Interactions
            </h4>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {interactionHistory.map((interaction, index) => (
                <div key={interaction.id} className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      {interaction.ai_moderators?.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(interaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{interaction.content}</p>
                  {interaction.video_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-gray-600"
                      onClick={() => setModeratorVideo(interaction.video_url)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Response
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 