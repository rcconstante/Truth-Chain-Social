import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Play, Pause, Volume2, Download, Plus, Trash2, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useToast } from '../ui/use-toast';
import { 
  generateAudioDebate,
  AudioDebateConfig,
  VOICE_PERSONAS,
  generateModeratorVoice
} from '../../lib/elevenlabs';

interface Participant {
  id: string;
  name: string;
  voice_persona: keyof typeof VOICE_PERSONAS;
  position: 'for' | 'against' | 'neutral';
  color: string;
}

const PARTICIPANT_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500'
];

export function AudioDebateGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [topic, setTopic] = useState('');
  const [moderatorPersona, setModeratorPersona] = useState<keyof typeof VOICE_PERSONAS>('general');
  const [debateStyle, setDebateStyle] = useState<'formal' | 'casual' | 'academic'>('formal');
  const [duration, setDuration] = useState(10);
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'Alex',
      voice_persona: 'science',
      position: 'for',
      color: PARTICIPANT_COLORS[0]
    },
    {
      id: '2',
      name: 'Jordan',
      voice_persona: 'politics',
      position: 'against',
      color: PARTICIPANT_COLORS[1]
    }
  ]);

  const [generatedDebate, setGeneratedDebate] = useState<{
    segments: Array<{
      participant: string;
      audio_url: string;
      text: string;
      start_time: number;
      duration: number;
    }>;
    total_duration: number;
  } | null>(null);

  const [currentSegment, setCurrentSegment] = useState(0);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  const { toast } = useToast();

  const addParticipant = () => {
    if (participants.length >= 6) {
      toast({
        title: "Maximum Participants",
        description: "You can have up to 6 participants in a debate",
        variant: "destructive"
      });
      return;
    }

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: `Speaker ${participants.length + 1}`,
      voice_persona: 'general',
      position: 'neutral',
      color: PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length]
    };

    setParticipants([...participants, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length <= 2) {
      toast({
        title: "Minimum Participants",
        description: "You need at least 2 participants for a debate",
        variant: "destructive"
      });
      return;
    }
    setParticipants(participants.filter(p => p.id !== id));
  };

  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const generateDebate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a debate topic",
        variant: "destructive"
      });
      return;
    }

    if (participants.length < 2) {
      toast({
        title: "Not Enough Participants",
        description: "You need at least 2 participants for a debate",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const config: AudioDebateConfig = {
        topic: topic.trim(),
        participants: participants.map(p => ({
          name: p.name,
          voice_persona: p.voice_persona,
          position: p.position
        })),
        moderator_persona: moderatorPersona,
        duration_minutes: duration,
        style: debateStyle
      };

      const result = await generateAudioDebate(config);
      
      if (result.status === 'success') {
        setGeneratedDebate({
          segments: result.segments,
          total_duration: result.total_duration
        });

        // Preload audio elements
        const audioEls: { [key: string]: HTMLAudioElement } = {};
        result.segments.forEach((segment, index) => {
          const audio = new Audio(segment.audio_url);
          audioEls[index.toString()] = audio;
        });
        setAudioElements(audioEls);

        toast({
          title: "Debate Generated!",
          description: `Created ${result.segments.length} audio segments`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate debate');
      }
    } catch (error) {
      console.error('Error generating debate:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate audio debate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const playDebate = async () => {
    if (!generatedDebate || generatedDebate.segments.length === 0) return;

    if (isPlaying) {
      // Pause current audio
      Object.values(audioElements).forEach(audio => {
        audio.pause();
      });
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    
    try {
      for (let i = 0; i < generatedDebate.segments.length; i++) {
        if (!isPlaying) break; // User stopped playback
        
        setCurrentSegment(i);
        const audio = audioElements[i.toString()];
        
        if (audio) {
          await new Promise<void>((resolve, reject) => {
            audio.onended = () => resolve();
            audio.onerror = () => reject(new Error('Audio playback error'));
            audio.play().catch(reject);
          });
        }
        
        // Brief pause between segments
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error playing debate:', error);
      toast({
        title: "Playback Error",
        description: "Could not play audio debate",
        variant: "destructive"
      });
    } finally {
      setIsPlaying(false);
      setCurrentSegment(0);
    }
  };

  const downloadDebate = () => {
    if (!generatedDebate) return;

    // Create a simple text transcript for download
    const transcript = generatedDebate.segments.map((segment, index) => 
      `[${Math.floor(segment.start_time / 60)}:${(segment.start_time % 60).toString().padStart(2, '0')}] ${segment.participant}: ${segment.text}`
    ).join('\n\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debate-transcript-${topic.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'for': return 'text-green-400 bg-green-400/20';
      case 'against': return 'text-red-400 bg-red-400/20';
      case 'neutral': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Audio Debate Generator</h3>
            <p className="text-sm text-gray-400">Create AI-powered voice debates</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Debate Topic *
            </label>
            <Input
              value={topic}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
              placeholder="Enter the debate topic or question..."
              className="bg-gray-800/50 border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Debate Style
              </label>
              <select
                value={debateStyle}
                onChange={(e) => setDebateStyle(e.target.value as 'formal' | 'casual' | 'academic')}
                className="w-full p-2 bg-gray-800/50 border border-gray-600 text-white rounded-md"
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="academic">Academic</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Moderator Voice
              </label>
              <select
                value={moderatorPersona}
                onChange={(e) => setModeratorPersona(e.target.value as keyof typeof VOICE_PERSONAS)}
                className="w-full p-2 bg-gray-800/50 border border-gray-600 text-white rounded-md"
              >
                {Object.entries(VOICE_PERSONAS).map(([key, voice]) => (
                  <option key={key} value={key}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Duration (minutes)
              </label>
              <Input
                type="number"
                value={duration}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(parseInt(e.target.value) || 10)}
                min="5"
                max="30"
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">Participants</h4>
            <Button
              onClick={addParticipant}
              variant="outline"
              size="sm"
              disabled={participants.length >= 6}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Participant
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/30 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${participant.color}`} />
                    <span className="text-white font-medium">Participant {index + 1}</span>
                  </div>
                  {participants.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(participant.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <Input
                    value={participant.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      updateParticipant(participant.id, { name: e.target.value })
                    }
                    placeholder="Participant name"
                    className="bg-gray-700/50 border-gray-600 text-white text-sm"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={participant.voice_persona}
                      onChange={(e) => 
                        updateParticipant(participant.id, { 
                          voice_persona: e.target.value as keyof typeof VOICE_PERSONAS 
                        })
                      }
                      className="p-2 bg-gray-700/50 border border-gray-600 text-white rounded text-sm"
                    >
                      {Object.entries(VOICE_PERSONAS).map(([key, voice]) => (
                        <option key={key} value={key}>
                          {voice.name.replace(' Voice', '')}
                        </option>
                      ))}
                    </select>

                    <select
                      value={participant.position}
                      onChange={(e) => 
                        updateParticipant(participant.id, { 
                          position: e.target.value as 'for' | 'against' | 'neutral' 
                        })
                      }
                      className="p-2 bg-gray-700/50 border border-gray-600 text-white rounded text-sm"
                    >
                      <option value="for">For</option>
                      <option value="against">Against</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPositionColor(participant.position)}`}>
                      {participant.position.charAt(0).toUpperCase() + participant.position.slice(1)} the topic
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <Button
            onClick={generateDebate}
            disabled={isGenerating || !topic.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Generating Debate...</span>
              </>
            ) : (
              'Generate Audio Debate'
            )}
          </Button>
        </div>

        {/* Generated Debate Player */}
        {generatedDebate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Generated Debate</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={playDebate}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause' : 'Play All'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadDebate}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Segment List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {generatedDebate.segments.map((segment, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      currentSegment === index && isPlaying
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-700/30 border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {segment.participant}
                        </span>
                        <span className="text-xs text-gray-400">
                          {Math.floor(segment.start_time / 60)}:{(segment.start_time % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const audio = audioElements[index.toString()];
                          if (audio) {
                            audio.currentTime = 0;
                            audio.play();
                          }
                        }}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-300">{segment.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  Total Duration: {Math.floor(generatedDebate.total_duration / 60)}:{(generatedDebate.total_duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
} 