import { Message, MultimodalPayload, Session, StressEstimate, UserProfile } from '@/types';
import { useStressStore } from '@/store/useStressStore';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = RAW_API_URL.endsWith('/api/v1')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, '')}/api/v1`;

/**
 * Clean HTTP Service Abstraction for FastAPI Backend.
 * All functions prioritize the live backend with graceful fallback to demo mode.
 */
export const ApiService = {
  /**
   * Health check endpoint
   */
  async checkHealth(): Promise<{ status: string; version: string; multimodalSupported: boolean }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
      return await res.json();
    } catch {
      return { status: 'demo_mode', version: '1.0.0-mock', multimodalSupported: true };
    }
  },

  /**
   * Send multimodal interaction frame to FastAPI (/api/v1/therapy/multimodal-chat)
   */
  async processMultimodalTurn(payload: MultimodalPayload): Promise<{
    reply: string;
    transcription?: string;
    stress: StressEstimate;
    emotions: Record<string, number>;
  }> {
    const currentLanguage = useStressStore.getState().language;
    try {
      const canonicalPayload = {
        message: payload.text,
        language: currentLanguage || 'en',
        session_id: payload.sessionId,
        face_image: payload.videoFeatures?.image,
        voice_audio: payload.audioFeatures?.audio,
        stress_level: payload.healthFeatures?.stressLevel,
      };
      const res = await fetch(`${API_BASE_URL}/therapy/multimodal-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(canonicalPayload),
      });
      if (!res.ok) throw new Error(`Backend processing error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      return {
        reply: data.ai_response || data.reply,
        transcription: data.transcription,
        stress: data.stress || {
          level: data.stress_label || 'moderate',
          score: Math.round((data.stress_level || 0.42) * 100),
          confidence: data.emotion_confidence || 0.85,
          trend: 'stable',
          lastUpdated: data.timestamp || new Date().toISOString(),
          disclaimer: 'Academic wellness indicator — not a clinical diagnosis.',
        },
        emotions: data.emotions?.distribution || { neutral: 70 },
      };
    } catch (err) {
      console.warn('[ApiService] Live API call failed, falling back to local simulation:', err);
      // Fallback simulated response
      return {
        reply: getMockResponse(payload.text || '', currentLanguage),
        stress: {
          level: 'moderate',
          score: 42,
          confidence: 0.85,
          trend: 'stable',
          lastUpdated: new Date().toISOString(),
          disclaimer: 'Simulated evaluation mode. Backend disconnected.',
        },
        emotions: { neutral: 52, joy: 20, sadness: 14, fear_anxiety: 10, anger: 4 },
      };
    }
  },

  /**
   * Unified Multimodal Therapy Chat (POST /api/v1/therapy/multimodal-chat)
   */
  async multimodalChat(payload: {
    message?: string;
    face_emotion?: string;
    face_confidence?: number;
    face_image?: string;
    voice_emotion?: string;
    voice_confidence?: number;
    voice_features?: number[];
    voice_audio?: string;
    stress_level?: number;
    language?: 'en' | 'si' | 'ta';
    session_id?: string;
  }): Promise<{
    status: string;
    detected_emotion: string;
    emotion_confidence: number;
    stress_level: number;
    stress_label: string;
    ai_response: string;
    timestamp: string;
    modalities: {
      face?: { emotion: string; confidence: number };
      voice?: { emotion: string; confidence: number };
    };
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/therapy/multimodal-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Backend multimodal-chat error: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Backend multimodal-chat unavailable, using mock response:', err);
      return {
        status: 'mock_success',
        detected_emotion: payload.face_emotion || payload.voice_emotion || 'neutral',
        emotion_confidence: 0.85,
        stress_level: payload.stress_level || 0.42,
        stress_label: 'moderate',
        ai_response: getMockResponse(payload.message || ''),
        timestamp: new Date().toISOString(),
        modalities: {
          face: payload.face_emotion ? { emotion: payload.face_emotion, confidence: payload.face_confidence || 0.85 } : undefined,
          voice: payload.voice_emotion ? { emotion: payload.voice_emotion, confidence: payload.voice_confidence || 0.80 } : undefined,
        },
      };
    }
  },

  /**
   * Fetch past therapy sessions
   */
  async getSessions(): Promise<Session[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/therapy/sessions`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return await res.json();
    } catch {
      return [];
    }
  },

  /**
   * Update user profile settings
   */
  async updateUserProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};

function getMockResponse(input: string, language: string = 'en'): string {
  const lower = input.toLowerCase();

  if (language === 'si') {
    if (lower.includes('හුස්ම') || lower.includes('breathing')) {
      return 'ඇත්තෙන්ම. අපි එකට සරල 4-4-4 හුස්ම ගැනීමේ ව්‍යායාමයක් කරමු: සෙමින් හුස්ම ගන්න, රඳවා ගන්න, සහ සියලු ආතතිය මුදා හරින්න.';
    }
    if (lower.includes('මහන්සි') || lower.includes('අමාරු') || lower.includes('stress')) {
      return 'එය ඉතා වෙහෙසකර දිනයක් වූ බව පෙනේ. ඔබට හැඟෙන වෙහෙස සාධාරණයි. මම ඔබට සවන් දීමට මෙහි සිටිමි — ඔබේ සිතට බරක් වන දේ මා සමඟ බෙදාගන්න.';
    }
    return 'ඔබේ සිතුවිලි මා සමඟ බෙදාගැනීම ගැන ස්තූතියි. මම ඔබට සවන් දීමට මෙහි සිටිමි. අද දවසේ ඔබේ සිතට දැනෙන ප්‍රධානතම දෙය කුමක්ද?';
  }

  if (language === 'ta') {
    if (lower.includes('மூச்சு') || lower.includes('breathing')) {
      return 'நிச்சயமாக. நாம் ஒன்றாக ஒரு எளிய 4-4-4 மூச்சுப் பயிற்சியைச் செய்வோம்: மெதுவாக மூச்சை உள்ளிழுக்கவும், அடக்கவும், பின் வெளிவிடவும்.';
    }
    if (lower.includes('களைப்பு') || lower.includes('stress')) {
      return 'இது மிகவும் கடினமான நாளாக இருந்திருக்கிறது என்பதைப் புரிந்து கொள்ள முடிகிறது. உங்கள் உணர்வுகளை என்னுடன் தயங்காமல் பகிர்ந்துகொள்ளுங்கள்.';
    }
    return 'உங்கள் எண்ணங்களைப் பகிர்ந்தமைக்கு நன்றி. நான் உங்களுக்கு செவிசாய்க்க இங்கு இருக்கிறேன். உங்கள் மனதில் உள்ளதை என்னுடன் பகிருங்கள்.';
  }

  // English
  if (
    lower.includes('give me a breathing') ||
    lower.includes('breathing exercise') ||
    lower.includes('help me calm down') ||
    lower.includes('what can i do to feel calmer') ||
    lower.includes('how to calm down')
  ) {
    return "Of course. Let's try something small and gentle together. If you're comfortable, we can do a short 4-4-4 Box Breathing exercise: breathing in slowly, holding gently, and releasing all that tension.";
  }

  if (
    lower.includes('exhausted') ||
    lower.includes('tired') ||
    lower.includes('stress') ||
    lower.includes('overwhelm') ||
    lower.includes('burnout') ||
    lower.includes('cant do this') ||
    lower.includes("can't do this") ||
    lower.includes('heavy') ||
    lower.includes('difficult day') ||
    lower.includes('drained')
  ) {
    return "That sounds like it's been a really heavy day, and it makes complete sense that you're feeling exhausted. You don't have to figure everything out or carry it all right now. I'm right here to listen — if you'd like, tell me a little about what's been weighing on you.";
  }

  if (lower.includes('thank') || lower.includes('better')) {
    return "I'm glad to hear that. Acknowledging your own calm moments is a meaningful step. How is your body and mind feeling right now?";
  }

  return "Thank you for sharing that with me. I'm here to listen and explore whatever is on your mind today. How are you feeling in this present moment?";
}
