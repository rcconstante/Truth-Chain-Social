import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Users, Volume2, Headphones, Radio, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { VoiceToText } from './VoiceToText';
import { AudioDebateGenerator } from './AudioDebateGenerator';
import { 
  getAvailableVoices,
  speakText,
  VOICE_PERSONAS,
  generateModeratorVoice
} from '../../lib/elevenlabs';

interface VoiceStudioStats {
  totalRecordings: number;
  totalTranscriptions: number;
  totalDebates: number;
  favoriteVoice: string;
}

export function VoiceStudioHub() {
  const [availableVoices, setAvailableVoices] = useState<Array<{
    voice_id: string;
    name: string;
    description?: string;
    category?: string;
  }>>([]);
  
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [selectedTestVoice, setSelectedTestVoice] = useState<keyof typeof VOICE_PERSONAS>('general');
  const [testText, setTestText] = useState('Welcome to TruthChain Voice Studio. This is a demonstration of our AI voice synthesis capabilities.');
  const [stats, setStats] = useState<VoiceStudioStats>({
    totalRecordings: 0,
    totalTranscriptions: 0,
    totalDebates: 0,
    favoriteVoice: 'Dr. Veritas Voice'
  });

  useEffect(() => {
    loadAvailableVoices();
    loadStats();
  }, []);

  const loadAvailableVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const voices = await getAvailableVoices();
      setAvailableVoices(voices);
    } catch (error) {
      console.error('Error loading voices:', error);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const loadStats = () => {
    // Load stats from localStorage or API
    const savedStats = localStorage.getItem('truthchain-voice-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  };

  const saveStats = (newStats: Partial<VoiceStudioStats>) => {
    const updatedStats = { ...stats, ...newStats };
    setStats(updatedStats);
    localStorage.setItem('truthchain-voice-stats', JSON.stringify(updatedStats));
  };

  const handleTranscriptionComplete = (text: string) => {
    console.log('Transcription completed:', text);
    saveStats({ totalTranscriptions: stats.totalTranscriptions + 1 });
  };

  const handleAudioRecorded = (audioBlob: Blob) => {
    console.log('Audio recorded:', audioBlob);
    saveStats({ totalRecordings: stats.totalRecordings + 1 });
  };

  const testVoice = async () => {
    try {
      await speakText(testText, selectedTestVoice);
    } catch (error) {
      console.error('Error testing voice:', error);
    }
  };

  const playWelcomeMessage = async () => {
    const welcomeText = "Welcome to TruthChain Voice Studio! Here you can record your voice, create transcriptions, and generate AI-powered debates. Let's build truth through conversation.";
    await speakText(welcomeText, 'general');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <Mic className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Voice Studio
          </h1>
          <p className="text-gray-400 mt-2">
            Powered by ElevenLabs AI Voice Technology
          </p>
          <Button
            onClick={playWelcomeMessage}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Play Welcome Message
          </Button>
        </motion.div>
      </div>

      {/* Voice Studio Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <Mic className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalRecordings}</div>
            <div className="text-sm text-gray-400">Voice Recordings</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <Radio className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalTranscriptions}</div>
            <div className="text-sm text-gray-400">Transcriptions</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalDebates}</div>
            <div className="text-sm text-gray-400">Audio Debates</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <Headphones className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white text-sm">{stats.favoriteVoice}</div>
            <div className="text-sm text-gray-400">Favorite Voice</div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="voice-to-text" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
          <TabsTrigger value="voice-to-text">Voice to Text</TabsTrigger>
          <TabsTrigger value="audio-debates">Audio Debates</TabsTrigger>
          <TabsTrigger value="voice-test">Voice Testing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="voice-to-text" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <VoiceToText
              onTranscriptionComplete={handleTranscriptionComplete}
              onAudioRecorded={handleAudioRecorded}
              placeholder="Record your truth claim or argument using voice..."
              maxDuration={600} // 10 minutes
              autoSubmit={false}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="audio-debates" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AudioDebateGenerator />
          </motion.div>
        </TabsContent>

        <TabsContent value="voice-test" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Voice Testing Studio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Personas */}
                <div>
                  <h4 className="text-white font-medium mb-4">AI Moderator Voices</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(VOICE_PERSONAS).map(([key, voice]) => (
                      <Card
                        key={key}
                        className={`cursor-pointer transition-all ${
                          selectedTestVoice === key
                            ? 'bg-blue-600/20 border-blue-500'
                            : 'bg-gray-800/30 border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => setSelectedTestVoice(key as keyof typeof VOICE_PERSONAS)}
                      >
                        <CardContent className="p-4">
                          <h5 className="text-white font-medium text-sm">{voice.name}</h5>
                          <p className="text-gray-400 text-xs mt-1">{voice.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                              Stability: {voice.stability}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                              Style: {voice.style}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Test Text Input */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Test Text
                  </label>
                  <textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Enter text to test the selected voice..."
                    rows={4}
                    className="w-full p-3 bg-gray-800/50 border border-gray-600 text-white rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Test Button */}
                <div className="text-center">
                  <Button
                    onClick={testVoice}
                    disabled={!testText.trim()}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Test {VOICE_PERSONAS[selectedTestVoice].name}
                  </Button>
                </div>

                {/* Voice Characteristics */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-3">Selected Voice Characteristics</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-400 text-sm">Stability</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${VOICE_PERSONAS[selectedTestVoice].stability * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300">{VOICE_PERSONAS[selectedTestVoice].stability}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Similarity</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${VOICE_PERSONAS[selectedTestVoice].similarity_boost * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300">{VOICE_PERSONAS[selectedTestVoice].similarity_boost}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Style</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${VOICE_PERSONAS[selectedTestVoice].style * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-300">{VOICE_PERSONAS[selectedTestVoice].style}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Speaker Boost</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: VOICE_PERSONAS[selectedTestVoice].use_speaker_boost ? '100%' : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-gray-300">
                        {VOICE_PERSONAS[selectedTestVoice].use_speaker_boost ? 'On' : 'Off'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="text-white">Voice Studio Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Available Voices */}
                <div>
                  <h4 className="text-white font-medium mb-4">Available ElevenLabs Voices</h4>
                  {isLoadingVoices ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-400">Loading available voices...</p>
                    </div>
                  ) : availableVoices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableVoices.slice(0, 12).map((voice) => (
                        <div
                          key={voice.voice_id}
                          className="bg-gray-800/30 rounded-lg p-3 border border-gray-600"
                        >
                          <h5 className="text-white font-medium text-sm">{voice.name}</h5>
                          {voice.description && (
                            <p className="text-gray-400 text-xs mt-1">{voice.description}</p>
                          )}
                          {voice.category && (
                            <span className="inline-block text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded mt-2">
                              {voice.category}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No voices available</p>
                      <Button
                        onClick={loadAvailableVoices}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Retry Loading
                      </Button>
                    </div>
                  )}
                </div>

                {/* Statistics */}
                <div>
                  <h4 className="text-white font-medium mb-4">Usage Statistics</h4>
                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-400">{stats.totalRecordings}</div>
                        <div className="text-sm text-gray-400">Voice Recordings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">{stats.totalTranscriptions}</div>
                        <div className="text-sm text-gray-400">Text Transcriptions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">{stats.totalDebates}</div>
                        <div className="text-sm text-gray-400">Audio Debates</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-400 text-sm">{stats.favoriteVoice}</div>
                        <div className="text-sm text-gray-400">Favorite Voice</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reset Data */}
                <div>
                  <h4 className="text-white font-medium mb-4">Data Management</h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        saveStats({
                          totalRecordings: 0,
                          totalTranscriptions: 0,
                          totalDebates: 0,
                          favoriteVoice: 'Dr. Veritas Voice'
                        });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Reset Statistics
                    </Button>
                    <Button
                      onClick={loadAvailableVoices}
                      variant="outline"
                      size="sm"
                    >
                      Refresh Voices
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 