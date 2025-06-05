import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Loader2, 
  RefreshCw, 
  Bot,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { 
  createModeratorVideo, 
  getVideoStatus,
  AI_MODERATOR_PERSONAS,
  ModeratorVideoRequest,
  VideoGenerationResponse 
} from '../../lib/tavus';
import { useToast } from '../ui/use-toast';

interface TavusAvatarProps {
  topic: keyof typeof AI_MODERATOR_PERSONAS;
  content: string;
  moderationType: 'introduction' | 'analysis' | 'summary' | 'ruling';
  onVideoReady?: (videoUrl: string) => void;
  autoStart?: boolean;
  className?: string;
}

export function TavusAvatar({ 
  topic, 
  content, 
  moderationType, 
  onVideoReady,
  autoStart = false,
  className 
}: TavusAvatarProps) {
  const [videoData, setVideoData] = useState<VideoGenerationResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  const persona = AI_MODERATOR_PERSONAS[topic];

  useEffect(() => {
    if (autoStart) {
      generateVideo();
    }
    
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [autoStart]);

  const generateVideo = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const request: ModeratorVideoRequest = {
        topic,
        discussion_content: '',
        post_content: content,
        moderation_type: moderationType
      };
      
      console.log('🎬 Generating Tavus video for:', persona.name);
      const response = await createModeratorVideo(request);
      
      setVideoData(response);
      
      // Start polling for video completion
      if (response.video_id) {
        const interval = setInterval(async () => {
          try {
            const status = await getVideoStatus(response.video_id);
            setVideoData(status);
            
            if (status.status === 'completed' && status.video_url) {
              clearInterval(interval);
              setPollInterval(null);
              onVideoReady?.(status.video_url);
              
              toast({
                title: "AI Avatar Ready! 🎬",
                description: `${persona.name} has finished generating the video analysis.`,
              });
            } else if (status.status === 'failed') {
              clearInterval(interval);
              setPollInterval(null);
              throw new Error('Video generation failed');
            }
          } catch (error) {
            clearInterval(interval);
            setPollInterval(null);
            console.error('Error polling video status:', error);
          }
        }, 3000);
        
        setPollInterval(interval);
      }
      
    } catch (error: any) {
      console.error('❌ Tavus video generation failed:', error);
      setError(error.message || 'Failed to generate video');
      
      toast({
        title: "Video Generation Failed",
        description: "Could not generate AI avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleVideoLoad = () => {
    console.log('✅ Tavus video loaded successfully');
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('❌ Video playback error:', e);
    setError('Video playback failed');
  };

  return (
    <Card className={`bg-gradient-to-br from-gray-900/90 to-black/90 border border-purple-500/30 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{persona.name}</h3>
            <p className="text-sm text-gray-400">{persona.personality}</p>
          </div>
          
          {/* Status Badge */}
          <Badge 
            variant="outline" 
            className={`${
              videoData?.status === 'completed' ? 'border-green-500/50 text-green-400' :
              videoData?.status === 'processing' ? 'border-yellow-500/50 text-yellow-400' :
              videoData?.status === 'failed' ? 'border-red-500/50 text-red-400' :
              'border-gray-500/50 text-gray-400'
            }`}
          >
            {videoData?.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
            {videoData?.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {videoData?.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {!videoData && <Sparkles className="w-3 h-3 mr-1" />}
            
            {videoData?.status || 'Ready'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <AnimatePresence mode="wait">
            {!videoData && !isGenerating ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <Avatar className="w-20 h-20 mb-4 ring-4 ring-purple-500/30">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}`} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-lg font-bold">
                    {persona.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h4 className="text-white font-medium mb-2">{persona.name}</h4>
                <p className="text-gray-400 text-sm text-center mb-4 px-4">
                  Ready to generate AI video for {moderationType}
                </p>
                <Button 
                  onClick={generateVideo}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Video
                </Button>
              </motion.div>
            ) : isGenerating || (videoData && videoData.status !== 'completed') ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mb-4"
                />
                <h4 className="text-white font-medium mb-2">Generating AI Video...</h4>
                <p className="text-gray-400 text-sm text-center px-4">
                  {persona.name} is analyzing and creating response
                </p>
                {videoData?.estimated_completion && (
                  <p className="text-purple-400 text-xs mt-2">
                    ETA: {new Date(videoData.estimated_completion).toLocaleTimeString()}
                  </p>
                )}
              </motion.div>
            ) : videoData?.status === 'completed' && videoData?.video_url ? (
              <motion.div
                key="video"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0"
              >
                <video
                  ref={videoRef}
                  src={videoData.video_url}
                  poster={videoData.thumbnail_url}
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onLoadedData={handleVideoLoad}
                  onError={handleVideoError}
                  controls={false}
                  muted={isMuted}
                />
                
                {/* Custom Video Controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={togglePlayback}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={restartVideo}
                        className="text-white hover:bg-white/20"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-white text-sm font-medium">
                      {persona.name}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
                <h4 className="text-white font-medium mb-2">Generation Failed</h4>
                <p className="text-gray-400 text-sm text-center mb-4 px-4">
                  {error}
                </p>
                <Button 
                  onClick={generateVideo}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Video Info */}
        {videoData && (
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400 text-sm font-medium">
                {moderationType.charAt(0).toUpperCase() + moderationType.slice(1)} Mode
              </span>
              {videoData.duration && (
                <span className="text-gray-400 text-xs">
                  Duration: {Math.round(videoData.duration)}s
                </span>
              )}
            </div>
            <p className="text-gray-300 text-sm">
              AI-generated response for: "{content.substring(0, 100)}..."
            </p>
          </div>
        )}

        {/* Generate New Video Button */}
        {!isGenerating && !error && (
          <Button
            onClick={generateVideo}
            variant="outline"
            className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            disabled={isGenerating}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate New Response
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 