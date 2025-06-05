import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Users, FileText, Download, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useToast } from '../ui/use-toast';
import { 
  createDebateSummaryVideo, 
  getVideoStatus,
  DebateSummaryRequest,
  VideoGenerationResponse
} from '../../lib/tavus';

interface DebateSummaryGeneratorProps {
  initialTopic?: string;
  initialParticipants?: string[];
  initialArguments?: string[];
  onVideoGenerated?: (video: VideoGenerationResponse) => void;
}

export function DebateSummaryGenerator({ 
  initialTopic = '',
  initialParticipants = [],
  initialArguments = [],
  onVideoGenerated
}: DebateSummaryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoData, setVideoData] = useState<VideoGenerationResponse | null>(null);
  const [topic, setTopic] = useState(initialTopic);
  const [participants, setParticipants] = useState(initialParticipants.join(', '));
  const [debateTranscript, setDebateTranscript] = useState('');
  const [keyArguments, setKeyArguments] = useState(initialArguments.join('\n'));
  const [resolution, setResolution] = useState('');
  const { toast } = useToast();

  const generateSummaryVideo = async () => {
    if (!topic.trim() || !debateTranscript.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a topic and debate transcript.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const request: DebateSummaryRequest = {
        topic: topic.trim(),
        participants: participants.split(',').map(p => p.trim()).filter(Boolean),
        debate_transcript: debateTranscript.trim(),
        key_arguments: keyArguments.split('\n').map(arg => arg.trim()).filter(Boolean),
        resolution: resolution.trim() || undefined
      };

      const response = await createDebateSummaryVideo(request);
      setVideoData(response);

      // Poll for video completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await getVideoStatus(response.video_id);
          setVideoData(status);
          
          if (status.status === 'completed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            toast({
              title: "Debate Summary Complete!",
              description: "Your AI-generated debate summary video is ready.",
            });
            onVideoGenerated?.(status);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            throw new Error('Video generation failed');
          }
        } catch (error) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          console.error('Error polling video status:', error);
        }
      }, 5000);

    } catch (error) {
      console.error('Error generating debate summary:', error);
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Could not generate debate summary video. Please try again.",
        variant: "destructive"
      });
    }
  };

  const shareVideo = async () => {
    if (videoData?.video_url) {
      try {
        await navigator.share({
          title: `TruthChain Debate Summary: ${topic}`,
          text: `Check out this AI-generated debate summary on TruthChain`,
          url: videoData.video_url
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(videoData.video_url);
        toast({
          title: "Link Copied",
          description: "Video URL copied to clipboard",
        });
      }
    }
  };

  const downloadVideo = () => {
    if (videoData?.video_url) {
      const link = document.createElement('a');
      link.href = videoData.video_url;
      link.download = `debate-summary-${topic.replace(/\s+/g, '-')}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Debate Summary Generator</h3>
            <p className="text-sm text-gray-400">Generate AI video summaries with Tavus</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Debate Topic *
            </label>
            <Input
              value={topic}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
              placeholder="Enter the main topic or claim being debated..."
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Participants (comma-separated)
            </label>
            <Input
              value={participants}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParticipants(e.target.value)}
              placeholder="Alice, Bob, Charlie..."
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Debate Transcript *
            </label>
            <textarea
              value={debateTranscript}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDebateTranscript(e.target.value)}
              placeholder="Paste the full discussion or debate transcript here..."
              rows={6}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 text-white rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Key Arguments (one per line)
            </label>
            <textarea
              value={keyArguments}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setKeyArguments(e.target.value)}
              placeholder="Argument 1&#10;Argument 2&#10;Argument 3..."
              rows={4}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 text-white rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Resolution (optional)
            </label>
            <Input
              value={resolution}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResolution(e.target.value)}
              placeholder="Final verdict or resolution, if any..."
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Video Preview/Status */}
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {!videoData && !isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-white font-medium mb-2">Ready to Generate</h4>
              <p className="text-gray-400 text-sm text-center mb-4">
                Create an AI-powered video summary of your debate
              </p>
              <Button 
                onClick={generateSummaryVideo}
                disabled={!topic.trim() || !debateTranscript.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Generate Summary Video
              </Button>
            </div>
          ) : isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <LoadingSpinner size="lg" />
              <p className="text-white mt-4">Generating Debate Summary...</p>
              <p className="text-gray-400 text-sm mt-2">
                AI is analyzing the discussion and creating your video
              </p>
              {videoData?.estimated_completion && (
                <p className="text-blue-400 text-xs mt-1">
                  ETA: {videoData.estimated_completion}
                </p>
              )}
            </div>
          ) : videoData?.status === 'completed' && videoData?.video_url ? (
            <>
              <video
                src={videoData.video_url}
                poster={videoData.thumbnail_url}
                controls
                className="w-full h-full object-cover"
              />
              
              {/* Video Info Overlay */}
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                  <h4 className="text-white font-medium text-sm">{topic}</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-300">
                    {videoData.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.round(videoData.duration)}s
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {participants.split(',').filter(Boolean).length} participants
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : videoData?.status === 'processing' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <LoadingSpinner size="lg" />
              <p className="text-white mt-4">Processing Video...</p>
              <p className="text-gray-400 text-sm mt-2">
                Your debate summary is being rendered
              </p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-red-400 mb-4 text-2xl">⚠️</div>
              <p className="text-white mb-2">Generation Failed</p>
              <Button 
                onClick={generateSummaryVideo}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Stats & Actions */}
        {videoData?.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  {participants.split(',').filter(Boolean).length}
                </div>
                <div className="text-xs text-gray-400">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">
                  {keyArguments.split('\n').filter(Boolean).length}
                </div>
                <div className="text-xs text-gray-400">Key Arguments</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-pink-400">
                  {videoData.duration ? Math.round(videoData.duration) : '0'}s
                </div>
                <div className="text-xs text-gray-400">Duration</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(videoData.video_url, '_blank')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Full Screen
              </Button>
              <Button
                onClick={shareVideo}
                variant="outline"
                size="sm"
                className="border-gray-600"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={downloadVideo}
                variant="outline"
                size="sm"
                className="border-gray-600"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={generateSummaryVideo}
            disabled={isGenerating || !topic.trim() || !debateTranscript.trim()}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </Button>
          <Button
            onClick={() => {
              setTopic('');
              setParticipants('');
              setDebateTranscript('');
              setKeyArguments('');
              setResolution('');
              setVideoData(null);
            }}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 