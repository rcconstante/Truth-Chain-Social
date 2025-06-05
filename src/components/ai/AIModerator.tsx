import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RotateCcw, MessageCircle, Shield, VolumeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useToast } from '../ui/use-toast';
import { 
  AI_MODERATOR_PERSONAS, 
  createModeratorVideo, 
  getVideoStatus,
  ModeratorVideoRequest,
  VideoGenerationResponse,
  detectCommunityTopic,
  analyzeDiscussionForModeration
} from '../../lib/tavus';
import {
  generateModeratorVoice,
  VOICE_PERSONAS,
  VoiceGenerationResponse
} from '../../lib/elevenlabs';

interface AIModeratorProps {
  postContent: string;
  discussionContent?: string;
  moderationType: 'introduction' | 'analysis' | 'summary' | 'ruling';
  onModerationComplete?: (result: any) => void;
  className?: string;
}

export function AIModerator({ 
  postContent, 
  discussionContent = '', 
  moderationType, 
  onModerationComplete,
  className 
}: AIModeratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [videoData, setVideoData] = useState<VideoGenerationResponse | null>(null);
  const [voiceData, setVoiceData] = useState<VoiceGenerationResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [topic, setTopic] = useState<keyof typeof AI_MODERATOR_PERSONAS>('general');
  const [moderationMode, setModerationMode] = useState<'video' | 'voice' | 'both'>('both');
  const { toast } = useToast();

  // Auto-detect topic from content
  useEffect(() => {
    const detectedTopic = detectCommunityTopic(postContent + ' ' + discussionContent);
    setTopic(detectedTopic);
  }, [postContent, discussionContent]);

  // Auto-analyze discussion for moderation needs
  useEffect(() => {
    if (discussionContent && moderationType !== 'introduction') {
      analyzeDiscussionForModeration(discussionContent, topic).then(setAnalysisResult);
    }
  }, [discussionContent, topic, moderationType]);

  const persona = AI_MODERATOR_PERSONAS[topic];

  // Generate moderation script based on type
  const generateModerationScript = () => {
    switch (moderationType) {
      case 'introduction':
        return `Hello, I'm ${persona.name}, your AI moderator for ${topic} discussions. 
                I'll be helping ensure our debate about "${postContent}" stays factual and productive. 
                My role is to ${persona.prompt_template.toLowerCase()} 
                Let's maintain a respectful dialogue focused on truth and evidence.`;
      
      case 'analysis':
        return `${persona.prompt_template} 
                The claim being discussed is: "${postContent}"
                Based on my analysis of the discussion so far: ${discussionContent}
                Here are the key points we should consider...`;
      
      case 'summary':
        return `As ${persona.name}, let me summarize our discussion about "${postContent}".
                The main arguments presented were: ${discussionContent}
                Based on the evidence and expert analysis, here's what we can conclude...`;
      
      case 'ruling':
        return `After careful analysis of all evidence and arguments regarding "${postContent}",
                I, ${persona.name}, provide this assessment: ${discussionContent}
                This conclusion is based on ${persona.expertise.join(', ')} and verifiable sources.`;
    }
  };

  const generateModeratorResponse = async () => {
    setIsGenerating(true);
    const script = generateModerationScript();

    try {
      const promises = [];

      // Generate video if mode includes video
      if (moderationMode === 'video' || moderationMode === 'both') {
        const videoRequest: ModeratorVideoRequest = {
          topic,
          discussion_content: discussionContent,
          post_content: postContent,
          moderation_type: moderationType
        };
        promises.push(createModeratorVideo(videoRequest));
      }

      // Generate voice if mode includes voice
      if (moderationMode === 'voice' || moderationMode === 'both') {
        setIsGeneratingVoice(true);
        promises.push(generateModeratorVoice(script, topic, moderationType));
      }

      const results = await Promise.all(promises);
      
      // Handle video result
      if (moderationMode === 'video' || moderationMode === 'both') {
        const videoResponse = results[0] as VideoGenerationResponse;
        setVideoData(videoResponse);

        // Poll for video completion
        if (videoResponse.video_id) {
          const pollInterval = setInterval(async () => {
            try {
              const status = await getVideoStatus(videoResponse.video_id);
              setVideoData(status);
              
              if (status.status === 'completed') {
                clearInterval(pollInterval);
                toast({
                  title: "AI Video Moderator Ready",
                  description: `${persona.name} video analysis is complete.`,
                });
              } else if (status.status === 'failed') {
                clearInterval(pollInterval);
                throw new Error('Video generation failed');
              }
            } catch (error) {
              clearInterval(pollInterval);
              console.error('Error polling video status:', error);
            }
          }, 5000);
        }
      }

      // Handle voice result
      if (moderationMode === 'voice' || moderationMode === 'both') {
        const voiceResponse = results[moderationMode === 'both' ? 1 : 0] as VoiceGenerationResponse;
        setVoiceData(voiceResponse);
        
        if (voiceResponse.status === 'success') {
          toast({
            title: "AI Voice Moderator Ready",
            description: `${persona.name} voice analysis is ready to play.`,
          });
        }
      }

      onModerationComplete?.({ video: videoData, voice: voiceData });

    } catch (error) {
      console.error('Error generating moderator response:', error);
      toast({
        title: "Moderation Error",
        description: "Could not generate AI moderator response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setIsGeneratingVoice(false);
    }
  };

  const toggleVideoPlayback = () => {
    const video = document.getElementById(`moderator-video-${videoData?.video_id}`) as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleVoicePlayback = () => {
    const audio = document.getElementById(`moderator-audio-${topic}`) as HTMLAudioElement;
    if (audio) {
      if (isPlayingVoice) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlayingVoice(!isPlayingVoice);
    }
  };

  const toggleMute = () => {
    const video = document.getElementById(`moderator-video-${videoData?.video_id}`) as HTMLVideoElement;
    const audio = document.getElementById(`moderator-audio-${topic}`) as HTMLAudioElement;
    
    if (video) video.muted = !isMuted;
    if (audio) audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restartPlayback = () => {
    const video = document.getElementById(`moderator-video-${videoData?.video_id}`) as HTMLVideoElement;
    const audio = document.getElementById(`moderator-audio-${topic}`) as HTMLAudioElement;
    
    if (video) {
      video.currentTime = 0;
      video.play();
      setIsPlaying(true);
    }
    if (audio) {
      audio.currentTime = 0;
      audio.play();
      setIsPlayingVoice(true);
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{persona.name}</h3>
            <p className="text-sm text-gray-400">{persona.personality}</p>
          </div>
          
          {/* Mode Selector */}
          <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setModerationMode('video')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                moderationMode === 'video' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => setModerationMode('voice')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                moderationMode === 'voice' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Voice
            </button>
            <button
              onClick={() => setModerationMode('both')}
              className={`px-3 py-1 text-xs rounded transition-all ${
                moderationMode === 'both' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Both
            </button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Topic and Expertise */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm capitalize">
            {topic} Expert
          </span>
          {persona.expertise.map((skill) => (
            <span key={skill} className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs">
              {skill}
            </span>
          ))}
        </div>

        {/* Moderation Analysis */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-gray-800/50 rounded-lg border border-gray-600"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Discussion Analysis</span>
            </div>
            <div className="text-xs text-gray-300 space-y-1">
              <p>Moderation needed: {analysisResult.needsModeration ? 'Yes' : 'No'}</p>
              <p>Confidence: {(analysisResult.confidence * 100).toFixed(1)}%</p>
              {analysisResult.suggestions.length > 0 && (
                <div>
                  <p className="font-medium">Suggestions:</p>
                  <ul className="list-disc list-inside ml-2">
                    {analysisResult.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Media Player */}
        <div className="space-y-4">
          {/* Video Player (if video mode) */}
          {(moderationMode === 'video' || moderationMode === 'both') && (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {!videoData && !isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-white font-medium mb-2">{persona.name} Video Ready</h4>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    Generate AI video moderation for this {moderationType}
                  </p>
                </div>
              ) : isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-white mt-4">Generating AI Video Response...</p>
                </div>
              ) : videoData?.status === 'completed' && videoData?.video_url ? (
                <>
                  <video
                    id={`moderator-video-${videoData.video_id}`}
                    src={videoData.video_url}
                    poster={videoData.thumbnail_url}
                    className="w-full h-full object-cover"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    controls={false}
                    muted={isMuted}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-white mt-4">Processing Video...</p>
                </div>
              )}
            </div>
          )}

          {/* Voice Player (if voice mode) */}
          {(moderationMode === 'voice' || moderationMode === 'both') && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Voice Moderation</h4>
                  <p className="text-gray-400 text-sm">{VOICE_PERSONAS[topic]?.name || 'AI Voice'}</p>
                </div>
              </div>

              {voiceData?.audio_url && (
                <audio
                  id={`moderator-audio-${topic}`}
                  src={voiceData.audio_url}
                  onPlay={() => setIsPlayingVoice(true)}
                  onPause={() => setIsPlayingVoice(false)}
                  onEnded={() => setIsPlayingVoice(false)}
                  controls={false}
                  muted={isMuted}
                />
              )}

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleVoicePlayback}
                  disabled={!voiceData?.audio_url}
                  className="text-white hover:bg-white/20"
                >
                  {isPlayingVoice ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1 bg-gray-700 rounded-full h-1">
                  <div className="w-0 h-full bg-green-500 rounded-full transition-all duration-1000" />
                </div>

                {isGeneratingVoice && (
                  <LoadingSpinner size="sm" />
                )}
              </div>
            </div>
          )}

          {/* Playback Controls */}
          {(videoData?.video_url || voiceData?.audio_url) && (
            <div className="flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={moderationMode === 'voice' ? toggleVoicePlayback : toggleVideoPlayback}
                  className="text-white hover:bg-white/20"
                >
                  {(isPlaying || isPlayingVoice) ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeOff className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={restartPlayback}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <div className="text-white text-sm">
                {moderationMode} moderation
              </div>
            </div>
          )}
        </div>

        {/* Moderator Response Text */}
        {analysisResult?.moderatorResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg"
          >
            <p className="text-blue-200 text-sm">
              <strong>{persona.name}:</strong> {analysisResult.moderatorResponse}
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={generateModeratorResponse}
            disabled={isGenerating || isGeneratingVoice}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Generating...</span>
              </>
            ) : (
              `Generate ${moderationMode} Moderation`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 