// Tavus AI Video Integration for TruthChain
// API Documentation: https://docs.tavus.io/

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

// For development - in production, move API keys to server-side
const TAVUS_API_KEY = getEnvVar('VITE_TAVUS_API_KEY') || getEnvVar('REACT_APP_TAVUS_API_KEY') || 'ff82fe8d0eae4fcd9c9cfcbd89cbd3e7';
const TAVUS_BASE_URL = 'https://tavusapi.com';

// Tavus API Headers
const TAVUS_HEADERS = {
  'x-api-key': TAVUS_API_KEY,
  'Content-Type': 'application/json',
};

// Persona Creation Interface
export interface PersonaCreationRequest {
  persona_name: string;
  default_replica_id: string;
  system_prompt: string;
  context: string;
}

export interface PersonaCreationResponse {
  persona_id: string;
  persona_name: string;
  status: 'created' | 'processing' | 'ready' | 'failed';
  created_at: string;
}

// AI Moderator Personas for Different Topics
export const AI_MODERATOR_PERSONAS = {
  science: {
    name: 'Dr. Veritas',
    personality: 'Expert scientist focused on empirical evidence and peer-reviewed research',
    avatar_style: 'professional_scientist',
    expertise: ['scientific method', 'research validation', 'data analysis'],
    replica_id: 'rf4703150052',
    system_prompt: `Your responses will be spoken out, so avoid any formatting or stage directions.
    You are Dr. Veritas, a distinguished scientist and fact-checker who specializes in scientific truth verification.
    You have a calm, authoritative demeanor with deep expertise in the scientific method, peer review, and empirical evidence.
    When moderating discussions, you focus on data quality, research methodology, and evidence-based conclusions.
    Always maintain scientific rigor while being accessible to general audiences.
    Reference specific studies and data when relevant, and acknowledge uncertainty when evidence is limited.`,
    context: `Dr. Veritas is moderating scientific discussions on TruthChain, a platform dedicated to truth verification through community debate and AI assistance.
    Users post claims that need scientific validation, and Dr. Veritas helps guide discussions toward evidence-based conclusions.
    The goal is to educate users about scientific thinking while fact-checking claims in real-time.`
  },
  politics: {
    name: 'Judge Balance',
    personality: 'Impartial political analyst focused on facts over opinions',
    avatar_style: 'professional_judge',
    expertise: ['political fact-checking', 'policy analysis', 'constitutional law'],
    replica_id: 'rf4703150052',
    system_prompt: `Your responses will be spoken out, so avoid any formatting or stage directions.
    You are Judge Balance, an impartial political analyst who specializes in separating political facts from partisan opinions.
    You maintain strict neutrality, focusing on verifiable information, policy impacts, and constitutional principles.
    Your tone is measured and judicial, acknowledging multiple perspectives while emphasizing factual accuracy.
    Always cite credible sources and distinguish between factual claims and opinion-based arguments.
    Avoid taking partisan positions while still being able to fact-check specific claims.`,
    context: `Judge Balance moderates political discussions on TruthChain, helping users navigate partisan debates with factual clarity.
    The platform encourages evidence-based political discourse, and Judge Balance ensures discussions remain factual and productive.
    Users often debate policy claims, election information, and political statements that need verification.`
  },
  health: {
    name: 'Dr. MedCheck',
    personality: 'Medical professional emphasizing evidence-based healthcare information',
    avatar_style: 'medical_professional',
    expertise: ['medical research', 'clinical studies', 'health policy'],
    replica_id: 'rf4703150052',
    system_prompt: `Your responses will be spoken out, so avoid any formatting or stage directions.
    You are Dr. MedCheck, a medical professional who specializes in evidence-based healthcare fact-checking.
    You have extensive knowledge of medical research, clinical trials, and health policy.
    Your approach is compassionate but rigorous, always emphasizing peer-reviewed medical evidence.
    You're careful to distinguish between preliminary research and established medical consensus.
    Always encourage users to consult healthcare professionals for personal medical decisions.`,
    context: `Dr. MedCheck moderates health-related discussions on TruthChain, helping users navigate medical misinformation.
    The platform sees many health claims that need professional verification, especially during health crises.
    Dr. MedCheck helps users understand medical research quality and distinguish reliable health information from misinformation.`
  },
  technology: {
    name: 'Tech Oracle',
    personality: 'Technology expert focused on technical accuracy and innovation trends',
    avatar_style: 'tech_professional',
    expertise: ['software engineering', 'AI research', 'cybersecurity'],
    replica_id: 'rf4703150052',
    system_prompt: `Your responses will be spoken out, so avoid any formatting or stage directions.
    You are Tech Oracle, a technology expert who specializes in verifying tech-related claims and explaining complex technology concepts.
    You have deep knowledge of software engineering, AI research, cybersecurity, and emerging technologies.
    Your style is knowledgeable but accessible, able to break down complex technical concepts for general audiences.
    You stay current with technology trends while maintaining skepticism about hype and marketing claims.
    Always distinguish between proven technology capabilities and speculative future developments.`,
    context: `Tech Oracle moderates technology discussions on TruthChain, helping users understand and verify tech-related claims.
    The platform sees discussions about AI capabilities, cybersecurity threats, software features, and technology predictions.
    Tech Oracle helps separate legitimate technical information from tech hype and misinformation.`
  },
  general: {
    name: 'Truth Guardian',
    personality: 'General fact-checker with focus on critical thinking and source verification',
    avatar_style: 'professional_moderator',
    expertise: ['fact-checking', 'source verification', 'logical reasoning'],
    replica_id: 'rf4703150052',
    system_prompt: `Your responses will be spoken out, so avoid any formatting or stage directions.
    You are Truth Guardian, a skilled fact-checker and critical thinking expert who moderates general discussions.
    You excel at source verification, logical reasoning, and identifying common fallacies and biases.
    Your approach is methodical and educational, teaching users how to think critically about information.
    You're skilled at breaking down complex claims into verifiable components and guiding productive debates.
    You maintain neutrality while helping users develop better information literacy skills.`,
    context: `Truth Guardian moderates general discussions on TruthChain, covering topics that don't fit specific expertise areas.
    The platform needs versatile moderation for diverse claims spanning multiple domains.
    Truth Guardian focuses on teaching critical thinking skills and information verification methods.`
  }
};

// Video Generation Request Interface
export interface VideoGenerationRequest {
  script: string;
  persona_id?: string;
  voice_id?: string;
  background?: string;
  title?: string;
  callback_url?: string;
}

// Video Generation Response Interface
export interface VideoGenerationResponse {
  video_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  created_at: string;
  estimated_completion?: string;
}

// AI Moderator Video Request
export interface ModeratorVideoRequest {
  topic: keyof typeof AI_MODERATOR_PERSONAS;
  discussion_content: string;
  post_content: string;
  community_context?: string;
  moderation_type: 'introduction' | 'analysis' | 'summary' | 'ruling';
}

// Debate Summary Request
export interface DebateSummaryRequest {
  debate_transcript: string;
  participants: string[];
  topic: string;
  key_arguments: string[];
  resolution?: string;
}

// Create AI Moderator Video
export async function createModeratorVideo(request: ModeratorVideoRequest): Promise<VideoGenerationResponse> {
  const persona = AI_MODERATOR_PERSONAS[request.topic];
  
  // Generate contextual script based on moderation type
  let script = '';
  
  switch (request.moderation_type) {
    case 'introduction':
      script = `Hello, I'm ${persona.name}, your AI moderator for ${request.topic} discussions. 
                I'll be helping ensure our debate about "${request.post_content}" stays factual and productive. 
                My role is to ${persona.system_prompt.toLowerCase()} 
                Let's maintain a respectful dialogue focused on truth and evidence.`;
      break;
      
    case 'analysis':
      script = `${persona.system_prompt} 
                The claim being discussed is: "${request.post_content}"
                Based on my analysis of the discussion so far: ${request.discussion_content}
                Here are the key points we should consider...`;
      break;
      
    case 'summary':
      script = `As ${persona.name}, let me summarize our discussion about "${request.post_content}".
                The main arguments presented were: ${request.discussion_content}
                Based on the evidence and expert analysis, here's what we can conclude...`;
      break;
      
    case 'ruling':
      script = `After careful analysis of all evidence and arguments regarding "${request.post_content}",
                I, ${persona.name}, provide this assessment: ${request.discussion_content}
                This conclusion is based on ${persona.expertise.join(', ')} and verifiable sources.`;
      break;
  }

  const videoRequest: VideoGenerationRequest = {
    script: script,
    persona_id: persona.replica_id,
    title: `${persona.name} - ${request.moderation_type} - ${request.topic}`,
    background: 'professional_studio'
  };

  return await generateVideo(videoRequest);
}

// Generate Debate Summary Video
export async function createDebateSummaryVideo(request: DebateSummaryRequest): Promise<VideoGenerationResponse> {
  const script = `
    Welcome to the Truth Debate Summary. I'm your AI moderator reviewing the debate on: "${request.topic}".
    
    Participants: ${request.participants.join(', ')}
    
    Key Arguments Presented:
    ${request.key_arguments.map((arg, index) => `${index + 1}. ${arg}`).join('\n')}
    
    Debate Analysis:
    ${request.debate_transcript}
    
    ${request.resolution ? `Resolution: ${request.resolution}` : 'The debate remains ongoing pending additional evidence.'}
    
    Remember, truth emerges through open dialogue and evidence-based reasoning.
  `;

  const videoRequest: VideoGenerationRequest = {
    script: script,
    title: `Debate Summary: ${request.topic}`,
    background: 'debate_studio'
  };

  return await generateVideo(videoRequest);
}

// Core Video Generation Function
export async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch(`${TAVUS_BASE_URL}/v2/videos`, {
      method: 'POST',
      headers: TAVUS_HEADERS,
      body: JSON.stringify({
        script: request.script,
        persona_id: request.persona_id || 'default',
        voice_id: request.voice_id || 'default',
        background: request.background || 'professional',
        title: request.title || 'TruthChain AI Moderator',
        callback_url: request.callback_url
      })
    });

    if (!response.ok) {
      throw new Error(`Tavus API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      video_id: data.video_id || data.id,
      status: data.status || 'queued',
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url,
      duration: data.duration,
      created_at: data.created_at || new Date().toISOString(),
      estimated_completion: data.estimated_completion
    };
  } catch (error) {
    console.error('Error generating Tavus video:', error);
    throw new Error('Failed to generate AI moderator video');
  }
}

// Get Video Status
export async function getVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch(`${TAVUS_BASE_URL}/v2/videos/${videoId}`, {
      method: 'GET',
      headers: TAVUS_HEADERS
    });

    if (!response.ok) {
      throw new Error(`Tavus API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      video_id: data.video_id || data.id,
      status: data.status,
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url,
      duration: data.duration,
      created_at: data.created_at,
      estimated_completion: data.estimated_completion
    };
  } catch (error) {
    console.error('Error fetching video status:', error);
    throw new Error('Failed to fetch video status');
  }
}

// List User Videos
export async function listUserVideos(limit: number = 50): Promise<VideoGenerationResponse[]> {
  try {
    const response = await fetch(`${TAVUS_BASE_URL}/v2/videos?limit=${limit}`, {
      method: 'GET',
      headers: TAVUS_HEADERS
    });

    if (!response.ok) {
      throw new Error(`Tavus API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.videos?.map((video: any) => ({
      video_id: video.video_id || video.id,
      status: video.status,
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url,
      duration: video.duration,
      created_at: video.created_at,
      estimated_completion: video.estimated_completion
    })) || [];
  } catch (error) {
    console.error('Error listing videos:', error);
    throw new Error('Failed to list videos');
  }
}

// Delete Video
export async function deleteVideo(videoId: string): Promise<boolean> {
  try {
    const response = await fetch(`${TAVUS_BASE_URL}/v2/videos/${videoId}`, {
      method: 'DELETE',
      headers: TAVUS_HEADERS
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
}

// Real-time Moderation Analysis
export async function analyzeDiscussionForModeration(
  content: string, 
  topic: keyof typeof AI_MODERATOR_PERSONAS
): Promise<{
  needsModeration: boolean;
  confidence: number;
  suggestions: string[];
  moderatorResponse?: string;
}> {
  // This would typically call Tavus API for real-time analysis
  // For now, implementing basic rule-based analysis
  
  const persona = AI_MODERATOR_PERSONAS[topic];
  const words = content.toLowerCase().split(' ');
  
  // Simple moderation rules (in production, this would use AI analysis)
  const flaggedWords = ['fake', 'lie', 'stupid', 'idiot', 'conspiracy'];
  const flaggedCount = words.filter(word => flaggedWords.includes(word)).length;
  
  const needsModeration = flaggedCount > 0 || content.length > 1000;
  const confidence = Math.min(flaggedCount * 0.3 + (content.length > 1000 ? 0.2 : 0), 1);
  
  const suggestions = [];
  if (flaggedCount > 0) {
    suggestions.push('Consider using more respectful language');
  }
  if (content.length > 1000) {
    suggestions.push('Break your argument into smaller, more focused points');
  }
  
  const moderatorResponse = needsModeration 
    ? `As ${persona.name}, I encourage keeping our discussion focused on evidence and facts. ${suggestions.join(' ')}`
    : undefined;

  return {
    needsModeration,
    confidence,
    suggestions,
    moderatorResponse
  };
}

// Community Topic Detection
export function detectCommunityTopic(content: string): keyof typeof AI_MODERATOR_PERSONAS {
  const scienceKeywords = ['research', 'study', 'data', 'experiment', 'scientific', 'peer-reviewed'];
  const politicsKeywords = ['government', 'policy', 'election', 'vote', 'political', 'congress'];
  const healthKeywords = ['medical', 'health', 'doctor', 'disease', 'treatment', 'clinical'];
  const techKeywords = ['software', 'technology', 'AI', 'algorithm', 'code', 'digital'];
  
  const contentLower = content.toLowerCase();
  
  const scores = {
    science: scienceKeywords.filter(keyword => contentLower.includes(keyword)).length,
    politics: politicsKeywords.filter(keyword => contentLower.includes(keyword)).length,
    health: healthKeywords.filter(keyword => contentLower.includes(keyword)).length,
    technology: techKeywords.filter(keyword => contentLower.includes(keyword)).length,
    general: 0
  };
  
  const topTopic = Object.entries(scores).reduce((a, b) => scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b)[0];
  
  return topTopic as keyof typeof AI_MODERATOR_PERSONAS || 'general';
}

// Create AI Moderator Personas
export async function createAIModeratorPersona(
  topic: keyof typeof AI_MODERATOR_PERSONAS
): Promise<PersonaCreationResponse> {
  const moderator = AI_MODERATOR_PERSONAS[topic];
  
  const personaRequest: PersonaCreationRequest = {
    persona_name: moderator.name,
    default_replica_id: moderator.replica_id,
    system_prompt: moderator.system_prompt,
    context: moderator.context
  };

  try {
    const response = await fetch(`${TAVUS_BASE_URL}/v2/personas`, {
      method: 'POST',
      headers: TAVUS_HEADERS,
      body: JSON.stringify(personaRequest)
    });

    if (!response.ok) {
      throw new Error(`Tavus API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      persona_id: data.persona_id || data.id,
      persona_name: data.persona_name || moderator.name,
      status: data.status || 'created',
      created_at: data.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error creating Tavus persona:', error);
    throw new Error(`Failed to create AI moderator persona: ${moderator.name}`);
  }
}

// Create All AI Moderator Personas
export async function initializeAIModeratorPersonas(): Promise<Record<string, PersonaCreationResponse>> {
  const personas: Record<string, PersonaCreationResponse> = {};
  
  for (const topic of Object.keys(AI_MODERATOR_PERSONAS) as Array<keyof typeof AI_MODERATOR_PERSONAS>) {
    try {
      console.log(`Creating persona for ${topic}...`);
      personas[topic] = await createAIModeratorPersona(topic);
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to create persona for ${topic}:`, error);
    }
  }
  
  return personas;
}

// Generate Live Video Response
export async function generateLiveModeratorResponse(
  personaId: string,
  prompt: string,
  context?: string
): Promise<VideoGenerationResponse> {
  try {
    const response = await fetch(`${TAVUS_BASE_URL}/v2/conversations`, {
      method: 'POST',
      headers: TAVUS_HEADERS,
      body: JSON.stringify({
        persona_id: personaId,
        conversation_id: `truthchain_${Date.now()}`,
        properties: {
          max_call_duration: 300, // 5 minutes
          participant_left_timeout: 10,
          enable_recording: true,
          enable_transcription: true
        },
        custom_prompt: prompt,
        context: context
      })
    });

    if (!response.ok) {
      throw new Error(`Tavus API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      video_id: data.conversation_id || data.id,
      status: 'completed',
      video_url: data.conversation_url || data.join_url,
      thumbnail_url: data.thumbnail_url,
      duration: 0,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating live moderator response:', error);
    throw new Error('Failed to generate live AI moderator response');
  }
}

// Create a conversation session with Tavus AI Avatar (Correct API Format)
export async function createConversationSession(
  replicaId?: string
): Promise<{
  conversation_id: string;
  conversation_url: string;
  status: string;
}> {
  try {
    console.log('Creating Tavus conversation with replica ID:', replicaId || 'rf4703150052');
    
    const requestBody = {
      replica_id: replicaId || 'rf4703150052' // Default replica ID from personas
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${TAVUS_BASE_URL}/v2/conversations`, {
      method: 'POST',
      headers: TAVUS_HEADERS,
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', responseText);

    if (!response.ok) {
      let errorMessage = `Tavus API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch {
        errorMessage += ` - ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    
    return {
      conversation_id: data.conversation_id || data.id,
      conversation_url: data.conversation_url || data.join_url,
      status: data.status || 'active'
    };
  } catch (error) {
    console.error('Error creating Tavus conversation:', error);
    throw new Error('Failed to create conversation session');
  }
}

// Get conversation status and details
export async function getConversationStatus(conversationId: string): Promise<{
  conversation_id: string;
  status: string;
  participant_count: number;
  duration: number;
}> {
  try {
    const response = await fetch(`${TAVUS_BASE_URL}/v2/conversations/${conversationId}`, {
      method: 'GET',
      headers: TAVUS_HEADERS
    });

    if (!response.ok) {
      throw new Error(`Tavus API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      conversation_id: data.conversation_id || data.id,
      status: data.status,
      participant_count: data.participant_count || 0,
      duration: data.duration || 0
    };
  } catch (error) {
    console.error('Error fetching conversation status:', error);
    throw new Error('Failed to fetch conversation status');
  }
}

// End a conversation
export async function endConversation(conversationId: string): Promise<boolean> {
  try {
    const response = await fetch(`${TAVUS_BASE_URL}/v2/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: TAVUS_HEADERS
    });

    return response.ok;
  } catch (error) {
    console.error('Error ending conversation:', error);
    return false;
  }
}

// Create Tavus conversation embed URL
export function createTavusEmbedUrl(conversationUrl: string, options?: {
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
}): string {
  const url = new URL(conversationUrl);
  
  if (options?.autoplay) url.searchParams.set('autoplay', 'true');
  if (options?.controls !== false) url.searchParams.set('controls', 'true');
  if (options?.muted) url.searchParams.set('muted', 'true');
  
  // Add embed parameters for iframe
  url.searchParams.set('embed', 'true');
  url.searchParams.set('theme', 'dark');
  
  return url.toString();
} 