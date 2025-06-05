// ElevenLabs Voice AI Integration for TruthChain
// API Documentation: https://docs.elevenlabs.io/

// Environment variable handling for different React setups
const getEnvVar = (name: string): string | undefined => {
  // Try Vite style first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name];
  }
  // Try Create React App style
  if (typeof window !== 'undefined' && (window as any).process?.env) {
    return (window as any).process.env[name];
  }
  return undefined;
};

const ELEVENLABS_API_KEY = getEnvVar('VITE_ELEVENLABS_API_KEY') || getEnvVar('REACT_APP_ELEVENLABS_API_KEY') || 'sk_9d9c705e58e23803568c19660f6020564ee088e35e77eb6c';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// ElevenLabs API Headers
const ELEVENLABS_HEADERS = {
  'xi-api-key': ELEVENLABS_API_KEY,
  'Content-Type': 'application/json',
};

// Voice Models for Different AI Moderator Personas
export const VOICE_PERSONAS = {
  science: {
    voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam - professional, clear
    name: 'Dr. Veritas Voice',
    description: 'Professional scientific narrator voice',
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  },
  politics: {
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella - authoritative, balanced
    name: 'Judge Balance Voice', 
    description: 'Authoritative political analysis voice',
    stability: 0.6,
    similarity_boost: 0.8,
    style: 0.2,
    use_speaker_boost: true
  },
  health: {
    voice_id: 'ErXwobaYiN019PkySvjV', // Antoni - calm, trustworthy
    name: 'Dr. MedCheck Voice',
    description: 'Calm medical professional voice',
    stability: 0.7,
    similarity_boost: 0.7,
    style: 0.1,
    use_speaker_boost: true
  },
  technology: {
    voice_id: 'VR6AewLTigWG4xSOukaG', // Josh - modern, tech-savvy
    name: 'Tech Oracle Voice',
    description: 'Modern technology expert voice',
    stability: 0.4,
    similarity_boost: 0.8,
    style: 0.3,
    use_speaker_boost: true
  },
  general: {
    voice_id: 'TxGEqnHWrfWFTfGW9XjX', // Brian - versatile, neutral
    name: 'Truth Guardian Voice',
    description: 'Neutral moderator voice',
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.15,
    use_speaker_boost: true
  }
};

// Voice Generation Request Interface
export interface VoiceGenerationRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  output_format?: 'mp3_44100_128' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000';
}

// Voice Generation Response Interface
export interface VoiceGenerationResponse {
  audio_url?: string;
  audio_blob?: Blob;
  duration?: number;
  status: 'success' | 'error';
  error?: string;
}

// Speech-to-Text Request Interface
export interface SpeechToTextRequest {
  audio_file: File | Blob;
  model?: 'whisper-1';
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

// Speech-to-Text Response Interface
export interface SpeechToTextResponse {
  text: string;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }>;
  language?: string;
  duration?: number;
}

// Audio Debate Configuration
export interface AudioDebateConfig {
  topic: string;
  participants: Array<{
    name: string;
    voice_persona: keyof typeof VOICE_PERSONAS;
    position: 'for' | 'against' | 'neutral';
  }>;
  moderator_persona: keyof typeof VOICE_PERSONAS;
  duration_minutes: number;
  style: 'formal' | 'casual' | 'academic';
}

// Generate Voice Audio
export async function generateVoiceAudio(request: VoiceGenerationRequest): Promise<VoiceGenerationResponse> {
  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${request.voice_id || VOICE_PERSONAS.general.voice_id}`, {
      method: 'POST',
      headers: ELEVENLABS_HEADERS,
      body: JSON.stringify({
        text: request.text,
        model_id: request.model_id || 'eleven_monolingual_v1',
        voice_settings: request.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      audio_url: audioUrl,
      audio_blob: audioBlob,
      status: 'success'
    };
  } catch (error) {
    console.error('Error generating voice audio:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Generate AI Moderator Voice Response
export async function generateModeratorVoice(
  text: string,
  persona: keyof typeof VOICE_PERSONAS,
  style: 'introduction' | 'analysis' | 'summary' | 'ruling' = 'analysis'
): Promise<VoiceGenerationResponse> {
  const voiceConfig = VOICE_PERSONAS[persona];
  
  // Adjust voice settings based on style
  let voiceSettings = { ...voiceConfig };
  
  switch (style) {
    case 'introduction':
      voiceSettings.stability = Math.min(voiceSettings.stability + 0.2, 1.0);
      voiceSettings.style = Math.max(voiceSettings.style - 0.1, 0.0);
      break;
    case 'analysis':
      // Use default settings
      break;
    case 'summary':
      voiceSettings.similarity_boost = Math.min(voiceSettings.similarity_boost + 0.1, 1.0);
      break;
    case 'ruling':
      voiceSettings.stability = Math.min(voiceSettings.stability + 0.3, 1.0);
      voiceSettings.style = Math.min(voiceSettings.style + 0.2, 1.0);
      break;
  }

  return await generateVoiceAudio({
    text,
    voice_id: voiceConfig.voice_id,
    voice_settings: {
      stability: voiceSettings.stability,
      similarity_boost: voiceSettings.similarity_boost,
      style: voiceSettings.style,
      use_speaker_boost: voiceSettings.use_speaker_boost
    }
  });
}

// Speech-to-Text Conversion (using Web Speech API as fallback)
export async function convertSpeechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
  try {
    // For production, you would use ElevenLabs or OpenAI Whisper API
    // For now, implementing browser Web Speech API fallback
    
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = request.language || 'en-US';

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognition.onend = () => {
        resolve({
          text: finalTranscript.trim(),
          language: request.language || 'en-US'
        });
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.start();
    });
  } catch (error) {
    console.error('Error converting speech to text:', error);
    throw new Error('Failed to convert speech to text');
  }
}

// Start Voice Recording
export async function startVoiceRecording(): Promise<MediaRecorder | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    
    return mediaRecorder;
  } catch (error) {
    console.error('Error starting voice recording:', error);
    return null;
  }
}

// Generate Audio Debate
export async function generateAudioDebate(config: AudioDebateConfig): Promise<{
  debate_audio_url?: string;
  segments: Array<{
    participant: string;
    audio_url: string;
    text: string;
    start_time: number;
    duration: number;
  }>;
  total_duration: number;
  status: 'success' | 'error';
  error?: string;
}> {
  try {
    // Generate opening statement
    const moderatorText = `Welcome to this ${config.style} debate on "${config.topic}". I'm your AI moderator, and today we'll hear perspectives from ${config.participants.map(p => p.name).join(', ')}.`;
    
    const moderatorVoice = await generateModeratorVoice(
      moderatorText,
      config.moderator_persona,
      'introduction'
    );

    const segments = [];
    let currentTime = 0;

    if (moderatorVoice.status === 'success' && moderatorVoice.audio_url) {
      segments.push({
        participant: 'Moderator',
        audio_url: moderatorVoice.audio_url,
        text: moderatorText,
        start_time: currentTime,
        duration: 10 // Estimated duration
      });
      currentTime += 10;
    }

    // Generate participant statements
    for (const participant of config.participants) {
      const participantText = `I'm ${participant.name}, and I ${participant.position === 'for' ? 'support' : participant.position === 'against' ? 'oppose' : 'offer a neutral perspective on'} the topic "${config.topic}". Here's my analysis...`;
      
      const participantVoice = await generateVoiceAudio({
        text: participantText,
        voice_id: VOICE_PERSONAS[participant.voice_persona].voice_id,
        voice_settings: VOICE_PERSONAS[participant.voice_persona]
      });

      if (participantVoice.status === 'success' && participantVoice.audio_url) {
        segments.push({
          participant: participant.name,
          audio_url: participantVoice.audio_url,
          text: participantText,
          start_time: currentTime,
          duration: 15 // Estimated duration
        });
        currentTime += 15;
      }
    }

    return {
      segments,
      total_duration: currentTime,
      status: 'success'
    };
  } catch (error) {
    console.error('Error generating audio debate:', error);
    return {
      segments: [],
      total_duration: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get Available Voices
export async function getAvailableVoices(): Promise<Array<{
  voice_id: string;
  name: string;
  description?: string;
  category?: string;
  language?: string;
}>> {
  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
      method: 'GET',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY }
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.voices?.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      description: voice.description,
      category: voice.category,
      language: voice.language
    })) || [];
  } catch (error) {
    console.error('Error fetching available voices:', error);
    return [];
  }
}

// Text-to-Speech Utility for Quick Announcements
export async function speakText(text: string, persona: keyof typeof VOICE_PERSONAS = 'general'): Promise<void> {
  try {
    const voiceResponse = await generateVoiceAudio({
      text,
      voice_id: VOICE_PERSONAS[persona].voice_id,
      voice_settings: VOICE_PERSONAS[persona]
    });

    if (voiceResponse.status === 'success' && voiceResponse.audio_url) {
      const audio = new Audio(voiceResponse.audio_url);
      await audio.play();
    }
  } catch (error) {
    console.error('Error speaking text:', error);
  }
}

// Real-time Voice Activity Detection
export function createVoiceActivityDetector(stream: MediaStream, callback: (isActive: boolean) => void): {
  start: () => void;
  stop: () => void;
} {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const microphone = audioContext.createMediaStreamSource(stream);
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
  analyser.fftSize = 512;
  microphone.connect(analyser);
  
  let isActive = false;
  let intervalId: number;

  const detectVoiceActivity = () => {
    analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const threshold = 30; // Adjust based on environment
    
    const currentlyActive = average > threshold;
    
    if (currentlyActive !== isActive) {
      isActive = currentlyActive;
      callback(isActive);
    }
  };

  return {
    start: () => {
      intervalId = window.setInterval(detectVoiceActivity, 100);
    },
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      audioContext.close();
    }
  };
} 