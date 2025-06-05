import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Play, Pause, Square, Volume2, VolumeOff, FileText, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { useToast } from '../ui/use-toast';
import { 
  startVoiceRecording,
  convertSpeechToText,
  createVoiceActivityDetector,
  SpeechToTextResponse
} from '../../lib/elevenlabs';

interface VoiceToTextProps {
  onTranscriptionComplete?: (text: string) => void;
  onAudioRecorded?: (audioBlob: Blob) => void;
  placeholder?: string;
  maxDuration?: number; // in seconds
  autoSubmit?: boolean;
}

export function VoiceToText({ 
  onTranscriptionComplete,
  onAudioRecorded,
  placeholder = "Click the microphone to start recording your voice...",
  maxDuration = 300, // 5 minutes default
  autoSubmit = false
}: VoiceToTextProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceDetectorRef = useRef<any>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (voiceDetectorRef.current) {
        voiceDetectorRef.current.stop();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setRecordingTime(0);
      setTranscription('');
      setRecordedAudio(null);
      setAudioUrl('');

      const mediaRecorder = await startVoiceRecording();
      if (!mediaRecorder) {
        throw new Error('Could not start recording');
      }

      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = mediaRecorder.stream;

      // Set up voice activity detection
      voiceDetectorRef.current = createVoiceActivityDetector(
        mediaRecorder.stream,
        setIsVoiceActive
      );
      voiceDetectorRef.current.start();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        onAudioRecorded?.(audioBlob);

        if (autoSubmit) {
          transcribeAudio(audioBlob);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Start recording timer
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsVoiceActive(false);

      if (voiceDetectorRef.current) {
        voiceDetectorRef.current.stop();
        voiceDetectorRef.current = null;
      }

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      toast({
        title: "Recording Stopped",
        description: `Recorded ${recordingTime} seconds of audio`,
      });
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const transcribeAudio = async (audioBlob?: Blob) => {
    const targetBlob = audioBlob || recordedAudio;
    if (!targetBlob) {
      toast({
        title: "No Audio",
        description: "Please record audio first",
        variant: "destructive"
      });
      return;
    }

    setIsTranscribing(true);
    try {
      // Convert to File for the API
      const audioFile = new File([targetBlob], 'recording.webm', { type: 'audio/webm' });
      
      const response: SpeechToTextResponse = await convertSpeechToText({
        audio_file: audioFile,
        language: 'en-US',
        response_format: 'text'
      });

      setTranscription(response.text);
      onTranscriptionComplete?.(response.text);

      toast({
        title: "Transcription Complete",
        description: "Your speech has been converted to text",
      });
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast({
        title: "Transcription Error",
        description: "Could not convert speech to text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `voice-recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRecordedAudio(file);
      setAudioUrl(URL.createObjectURL(file));
      transcribeAudio(file);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeOff className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Voice to Text</h3>
            <p className="text-sm text-gray-400">Record and transcribe your speech</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recording Controls */}
        <div className="flex justify-center">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gradient-to-br from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
              }`}
            >
              {isRecording ? (
                <Square className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </Button>

            {/* Voice Activity Indicator */}
            {isRecording && (
              <motion.div
                className={`absolute -inset-2 rounded-full border-2 ${
                  isVoiceActive ? 'border-green-400' : 'border-gray-600'
                }`}
                animate={{
                  scale: isVoiceActive ? [1, 1.1, 1] : 1,
                  opacity: isVoiceActive ? [0.7, 1, 0.7] : 0.3
                }}
                transition={{ repeat: isVoiceActive ? Infinity : 0, duration: 1 }}
              />
            )}
          </motion.div>
        </div>

        {/* Recording Status */}
        <div className="text-center space-y-2">
          {isRecording ? (
            <div>
              <p className="text-green-400 font-medium">Recording...</p>
              <p className="text-2xl font-mono text-white">{formatTime(recordingTime)}</p>
              <p className="text-sm text-gray-400">
                {isVoiceActive ? '🎤 Voice detected' : '🔇 Listening...'}
              </p>
              <div className="w-32 h-1 bg-gray-700 rounded-full mx-auto mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(recordingTime / maxDuration) * 100}%` }}
                />
              </div>
            </div>
          ) : recordedAudio ? (
            <div>
              <p className="text-blue-400 font-medium">Recording Ready</p>
              <p className="text-lg text-white">{formatTime(recordingTime)} recorded</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-400">{placeholder}</p>
              <p className="text-sm text-gray-500">Max duration: {formatTime(maxDuration)}</p>
            </div>
          )}
        </div>

        {/* Audio Playback */}
        {audioUrl && (
          <div className="space-y-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onVolumeChange={(e) => setVolume((e.target as HTMLAudioElement).volume)}
            />

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={playAudio}
                disabled={!audioUrl}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={downloadAudio}
                disabled={!audioUrl}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.volume = audioRef.current.volume > 0 ? 0 : 1;
                    }
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  {getVolumeIcon()}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    if (audioRef.current) {
                      audioRef.current.volume = newVolume;
                    }
                  }}
                  className="w-16 h-1 bg-gray-700 rounded-lg appearance-none slider"
                />
              </div>
            </div>
          </div>
        )}

        {/* Transcription */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium">Transcription</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => transcribeAudio()}
                disabled={!recordedAudio || isTranscribing}
              >
                {isTranscribing ? <LoadingSpinner size="sm" /> : <FileText className="w-4 h-4" />}
                {isTranscribing ? 'Transcribing...' : 'Transcribe'}
              </Button>

              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Upload Audio
                  </span>
                </Button>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600 min-h-32">
            {isTranscribing ? (
              <div className="flex items-center justify-center h-24">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-400 mt-2">Converting speech to text...</p>
                </div>
              </div>
            ) : transcription ? (
              <div>
                <p className="text-white whitespace-pre-wrap">{transcription}</p>
                <div className="flex justify-end mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(transcription);
                      toast({
                        title: "Copied",
                        description: "Transcription copied to clipboard",
                      });
                    }}
                  >
                    Copy Text
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24">
                <p className="text-gray-500 text-center">
                  Transcribed text will appear here after recording and processing
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setRecordedAudio(null);
              setAudioUrl('');
              setTranscription('');
              setRecordingTime(0);
            }}
            variant="outline"
            className="flex-1"
            disabled={isRecording}
          >
            Clear All
          </Button>
          {transcription && onTranscriptionComplete && (
            <Button
              onClick={() => onTranscriptionComplete(transcription)}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Use Transcription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 