// TruthChain Voice AI Service
// Integrates ElevenLabs for speech-to-text, text-to-speech, and real-time voice interactions

import { supabase } from './supabase';
import { AI_MODERATOR_PERSONAS } from './tavus';

// ElevenLabs Configuration
const ELEVENLABS_API_KEY = 'your-elevenlabs-api-key'; // Replace with actual key
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Voice AI Configuration
export const VOICE_CONFIG = {
  speechToText: {
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 3
  },
  textToSpeech: {
    voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam voice from ElevenLabs
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.2,
      use_speaker_boost: true
    }
  }
};

// Voice Moderator Personas (mapped to ElevenLabs voices)
export const VOICE_MODERATORS = {
  'Dr. Sarah Chen': {
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella - professional female
    personality: 'calm, professional, educational',
    speaking_rate: 1.0,
    pitch: 0.0
  },
  'Professor Marcus Williams': {
    voice_id: 'ErXwobaYiN019PkySvjV', // Antoni - scholarly male
    personality: 'authoritative, balanced, thoughtful',
    speaking_rate: 0.9,
    pitch: -0.1
  },
  'Tech Expert Sam Rivera': {
    voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam - enthusiastic male
    personality: 'energetic, accessible, cutting-edge',
    speaking_rate: 1.1,
    pitch: 0.1
  },
  'Dr. Alex Thompson': {
    voice_id: 'ThT5KcBeYPX3keUQqHPh', // Dorothy - passionate female
    personality: 'passionate, solutions-oriented, scientific',
    speaking_rate: 1.0,
    pitch: 0.0
  }
};

// Enhanced Voice Moderator mapping
const VOICE_MODERATOR_MAPPING: Record<string, keyof typeof VOICE_MODERATORS> = {
  science: 'Dr. Alex Thompson',
  politics: 'Professor Marcus Williams',
  health: 'Dr. Sarah Chen',
  technology: 'Tech Expert Sam Rivera',
  general: 'Dr. Sarah Chen'
};

// Voice interaction types
export interface VoiceInteraction {
  id: string;
  type: 'post_creation' | 'comment' | 'fact_check' | 'moderation' | 'debate';
  content: string;
  audioUrl?: string;
  transcript?: string;
  confidence?: number;
  language: string;
  createdAt: Date;
}

export interface VoiceAnalysisResult {
  transcript: string;
  confidence: number;
  factCheckResults: any[];
  moderatorResponse?: string;
  audioResponseUrl?: string;
  needsModeration: boolean;
}

export interface VoiceRoomSession {
  id: string;
  roomId: string;
  hostId: string;
  participants: string[];
  speakers: string[];
  isRecording: boolean;
  transcript: string;
  aiModerationActive: boolean;
}

export class VoiceAIService {
  private speechRecognition: any = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  /**
   * Initialize Web Speech API for speech recognition
   */
  private initializeSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (SpeechRecognition) {
        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = VOICE_CONFIG.speechToText.continuous;
        this.speechRecognition.interimResults = VOICE_CONFIG.speechToText.interimResults;
        this.speechRecognition.lang = VOICE_CONFIG.speechToText.language;
        this.speechRecognition.maxAlternatives = VOICE_CONFIG.speechToText.maxAlternatives;
      }
    }
  }

  /**
   * Initialize Web Speech Synthesis API
   */
  private initializeSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  /**
   * Start voice recording for post creation
   */
  async startVoicePostCreation(): Promise<{ stream: MediaStream; sessionId: string }> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionId = `voice_post_${Date.now()}`;
      
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      
      console.log('🎙️ Voice post creation started');
      return { stream, sessionId };
      
    } catch (error) {
      console.error('❌ Failed to start voice recording:', error);
      throw new Error('Microphone access denied or unavailable');
    }
  }

  /**
   * Stop voice recording and process
   */
  async stopVoicePostCreation(): Promise<VoiceInteraction> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording session'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Upload audio to storage
          const uploadedUrl = await this.uploadAudioFile(audioBlob);
          
          // Transcribe audio using ElevenLabs or Web Speech API
          const transcript = await this.transcribeAudio(audioBlob);
          
          // Perform real-time fact-checking
          const analysis = await this.analyzeVoiceContent(transcript);
          
          const interaction: VoiceInteraction = {
            id: `voice_${Date.now()}`,
            type: 'post_creation',
            content: transcript,
            audioUrl: uploadedUrl,
            transcript,
            confidence: analysis.confidence,
            language: 'en-US',
            createdAt: new Date()
          };
          
          console.log('✅ Voice post creation completed');
          resolve(interaction);
          
        } catch (error) {
          console.error('❌ Voice processing failed:', error);
          reject(error);
        }
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  /**
   * Real-time speech-to-text for live discussions
   */
  startRealTimeSpeechToText(
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onFactCheck?: (analysis: VoiceAnalysisResult) => void
  ): void {
    if (!this.speechRecognition) {
      throw new Error('Speech recognition not supported');
    }

    let finalTranscript = '';
    let interimTranscript = '';

    this.speechRecognition.onresult = async (event: any) => {
      interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          onTranscript(transcript, true);
          
          // Perform fact-checking on complete sentences
          if (onFactCheck && transcript.length > 20) {
            const analysis = await this.analyzeVoiceContent(transcript);
            onFactCheck(analysis);
          }
        } else {
          interimTranscript += transcript;
          onTranscript(interimTranscript, false);
        }
      }
    };

    this.speechRecognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.speechRecognition.start();
    console.log('🎙️ Real-time speech recognition started');
  }

  /**
   * Stop real-time speech recognition
   */
  stopRealTimeSpeechToText(): void {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      console.log('🔇 Real-time speech recognition stopped');
    }
  }

  /**
   * Generate AI moderator voice response
   */
  async generateAIVoiceResponse(
    text: string, 
    moderatorName: keyof typeof AI_MODERATOR_PERSONAS,
    responseType: 'fact_check' | 'moderation' | 'analysis' = 'analysis'
  ): Promise<string> {
    try {
      console.log(`🤖 Generating AI voice response from ${moderatorName}`);
      
      // Map moderator name to voice config
      const voiceModerator = VOICE_MODERATOR_MAPPING[moderatorName] || 'Dr. Sarah Chen';
      const voiceConfig = VOICE_MODERATORS[voiceModerator];
      
      // Enhanced text with personality
      const enhancedText = this.enhanceTextForVoice(text, moderatorName, responseType);
      
      // Generate audio using ElevenLabs
      const audioUrl = await this.generateElevenLabsAudio(enhancedText, voiceConfig.voice_id);
      
      console.log('✅ AI voice response generated');
      return audioUrl;
      
    } catch (error: any) {
      console.error('❌ AI voice generation failed:', error);
      
      // Fallback to browser speech synthesis
      return this.generateBrowserSpeech(text);
    }
  }

  /**
   * Analyze voice content for fact-checking and moderation
   */
  async analyzeVoiceContent(transcript: string): Promise<VoiceAnalysisResult> {
    try {
      // Simulate real-time fact-checking
      const factCheckResults = await this.performVoiceFactCheck(transcript);
      
      // Determine if moderation is needed
      const needsModeration = this.detectModerationNeeds(transcript);
      
      // Generate AI moderator response if needed
      let moderatorResponse = '';
      let audioResponseUrl = '';
      
      if (needsModeration || factCheckResults.some(result => result.status === 'disputed')) {
        moderatorResponse = this.generateModerationResponse(transcript, factCheckResults);
        audioResponseUrl = await this.generateAIVoiceResponse(
          moderatorResponse, 
          'general', 
          'fact_check'
        );
      }
      
      return {
        transcript,
        confidence: Math.random() * 40 + 60, // Simulate confidence score
        factCheckResults,
        moderatorResponse,
        audioResponseUrl,
        needsModeration
      };
      
    } catch (error) {
      console.error('❌ Voice content analysis failed:', error);
      return {
        transcript,
        confidence: 0,
        factCheckResults: [],
        needsModeration: false
      };
    }
  }

  /**
   * Create and manage voice room sessions
   */
  async createVoiceRoom(
    roomId: string, 
    hostId: string, 
    aiModerationEnabled: boolean = true
  ): Promise<VoiceRoomSession> {
    try {
      const session: VoiceRoomSession = {
        id: `voice_session_${Date.now()}`,
        roomId,
        hostId,
        participants: [hostId],
        speakers: [],
        isRecording: false,
        transcript: '',
        aiModerationActive: aiModerationEnabled
      };
      
      // Record in database
      await supabase
        .from('voice_sessions')
        .insert({
          id: session.id,
          room_id: roomId,
          host_id: hostId,
          title: 'Voice Discussion',
          is_active: true,
          max_speakers: 10,
          current_speakers: []
        });
      
      console.log('🎤 Voice room created:', session.id);
      return session;
      
    } catch (error) {
      console.error('❌ Voice room creation failed:', error);
      throw error;
    }
  }

  /**
   * Join voice room as participant
   */
  async joinVoiceRoom(sessionId: string, userId: string): Promise<boolean> {
    try {
      // Get current speakers
      const { data: session } = await supabase
        .from('voice_sessions')
        .select('current_speakers')
        .eq('id', sessionId)
        .single();

      const currentSpeakers = session?.current_speakers || [];
      const updatedSpeakers = [...currentSpeakers, userId];

      // Update participants list
      const { error } = await supabase
        .from('voice_sessions')
        .update({
          current_speakers: updatedSpeakers
        })
        .eq('id', sessionId);
      
      if (error) throw error;
      
      console.log('🎙️ User joined voice room:', userId);
      return true;
      
    } catch (error) {
      console.error('❌ Failed to join voice room:', error);
      return false;
    }
  }

  /**
   * Private helper methods
   */
  
  private async uploadAudioFile(audioBlob: Blob): Promise<string> {
    try {
      const fileName = `voice_${Date.now()}.wav`;
      const { data, error } = await supabase.storage
        .from('audio')
        .upload(fileName, audioBlob);
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('audio')
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
      
    } catch (error) {
      console.error('Audio upload failed:', error);
      return URL.createObjectURL(audioBlob); // Fallback to local URL
    }
  }
  
  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    // In production, this would use ElevenLabs or other transcription service
    // For now, return a simulated transcript
    return "This is a simulated transcription of the voice input.";
  }
  
  private async generateElevenLabsAudio(text: string, voiceId: string): Promise<string> {
    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: VOICE_CONFIG.textToSpeech.voice_settings
        })
      });
      
      if (!response.ok) {
        throw new Error('ElevenLabs API request failed');
      }
      
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
      
    } catch (error) {
      console.error('ElevenLabs generation failed:', error);
      throw error;
    }
  }
  
  private generateBrowserSpeech(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Find a suitable voice
      const voices = this.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes('en')) || voices[0];
      if (voice) utterance.voice = voice;
      
      utterance.onend = () => {
        resolve('browser_speech_completed');
      };
      
      utterance.onerror = (error) => {
        reject(error);
      };
      
      this.speechSynthesis.speak(utterance);
    });
  }
  
  private enhanceTextForVoice(
    text: string, 
    moderatorName: keyof typeof AI_MODERATOR_PERSONAS, 
    responseType: string
  ): string {
    const persona = AI_MODERATOR_PERSONAS[moderatorName];
    const voiceModerator = VOICE_MODERATOR_MAPPING[moderatorName] || 'Dr. Sarah Chen';
    const voicePersonality = VOICE_MODERATORS[voiceModerator]?.personality || 'professional';
    
    let enhancedText = '';
    
    switch (responseType) {
      case 'fact_check':
        enhancedText = `As ${voiceModerator}, I need to address some important points about what was just shared. ${text}`;
        break;
      case 'moderation':
        enhancedText = `Let me step in here as your AI moderator, ${voiceModerator}. ${text}`;
        break;
      default:
        enhancedText = `This is ${voiceModerator}. ${text}`;
    }
    
    return enhancedText;
  }
  
  private async performVoiceFactCheck(transcript: string): Promise<any[]> {
    // Simulate fact-checking results
    return [
      {
        claim: transcript.substring(0, 100),
        status: Math.random() > 0.7 ? 'verified' : 'disputed',
        confidence: Math.random() * 40 + 60,
        sources: ['Voice Analysis Database', 'Real-time Fact Check']
      }
    ];
  }
  
  private detectModerationNeeds(transcript: string): boolean {
    const moderationKeywords = ['false', 'lie', 'fake', 'wrong', 'misinformation'];
    return moderationKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword)
    );
  }
  
  private generateModerationResponse(transcript: string, factCheckResults: any[]): string {
    if (factCheckResults.some(result => result.status === 'disputed')) {
      return `I notice some claims in what was just said that may need verification. Let me provide some context to help clarify the facts.`;
    }
    
    if (this.detectModerationNeeds(transcript)) {
      return `I'd like to pause here and suggest we focus on verifiable information. Let's examine the evidence together.`;
    }
    
    return `Thank you for sharing. I'd like to add some additional context to help enrich this discussion.`;
  }
}

// Export singleton instance
export const voiceAIService = new VoiceAIService();

// Utility functions
export function formatVoiceInteractionDuration(duration: number): string {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getVoiceQualityIndicator(confidence: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (confidence >= 90) return 'excellent';
  if (confidence >= 70) return 'good';
  if (confidence >= 50) return 'fair';
  return 'poor';
}

export function isVoiceFeatureSupported(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    (window.speechSynthesis || (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition) &&
    navigator.mediaDevices?.getUserMedia
  );
} 