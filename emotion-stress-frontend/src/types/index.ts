/**
 * Multimodal Emotion-Aware Digital Therapy Assistant - Domain Types
 * Academic Research Prototype & Clinical-Safety-Compliant Schema
 */

export type StressLevel = 'low' | 'moderate' | 'high';
export type Language = 'en' | 'si' | 'ta';

export interface StressEstimate {
  level: StressLevel;
  score: number; // 0 - 100 percentage
  confidence: number; // 0.0 - 1.0
  trend: 'increasing' | 'stable' | 'decreasing';
  lastUpdated: string;
  disclaimer: string;
}

export interface EmotionProbability {
  neutral: number;
  joy: number;
  sadness: number;
  fear_anxiety: number;
  anger: number;
  surprise?: number;
  disgust?: number;
}

export interface ModalityAvailability {
  text: boolean;
  audio: boolean;
  video: boolean;
  keystroke: boolean;
  history: boolean;
}

export interface KeystrokeMetrics {
  dwellTimeMs: number; // Avg key press duration (ms)
  flightTimeMs: number; // Avg duration between consecutive keypresses (ms)
  wpm: number; // Rolling words per minute estimate
  backspaceCount: number; // Backspace/deletion frequency
  pauseCount: number; // Count of pauses > 1500ms
  cadenceConsistency: number; // 0 to 1 consistency score
  lastMeasured: string;
}

export interface AudioSignalMetrics {
  volumeDb: number;
  pitchHz: number;
  speechRate: number; // Estimated syllables or words per sec
  jitter: number;
  silenceRatio: number;
  recordingDurationSeconds: number;
}

export interface FacialSignalMetrics {
  faceDetected: boolean;
  headPose: { pitch: number; yaw: number; roll: number };
  eyeBlinkRate: number;
  browFurrowScore: number;
  smileProbability: number;
  gazeAversionScore: number;
}

export interface MultimodalPayload {
  sessionId: string;
  timestamp: string;
  text?: string;
  modalities: ModalityAvailability;
  keystrokeFeatures?: Partial<KeystrokeMetrics>;
  audioFeatures?: Partial<AudioSignalMetrics>;
  videoFeatures?: Partial<FacialSignalMetrics>;
  historicalContext?: {
    avgWeeklyStress: number;
    dominantRecentMood: string;
  };
}

export interface MessageAudio {
  url?: string;
  durationSeconds?: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  stressSnapshot?: {
    score: number;
    level: StressLevel;
  };
  detectedEmotions?: Partial<EmotionProbability>;
  activeModalities?: ModalityAvailability;
  audio?: MessageAudio;
  isStreaming?: boolean;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  durationMinutes: number;
  summary: string;
  avgStressLevel: StressLevel;
  avgStressScore: number;
  dominantMood: 'Calm' | 'Neutral' | 'Stressed' | 'Low mood';
  messageCount: number;
}

export interface MoodRecord {
  id: string;
  day: string;
  date: string;
  moodScore: number; // 1 (Low) to 5 (Calm)
  label: 'Calm' | 'Neutral' | 'Stressed' | 'Low mood';
  estimatedStress: number; // 0 - 100
}

export interface TrustedContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notifyOnCrisis: boolean;
}

export interface SupportResource {
  id: string;
  country: string;
  countryCode: string;
  name: string;
  phone: string;
  sms?: string;
  website?: string;
  type: 'crisis' | 'mental_health' | 'youth' | 'text_line' | 'general';
  available: string;
  description: string;
}

export type InterventionType = 'none' | 'breathing' | 'grounding' | 'safety';

export type SafetyRiskLevel = 'normal' | 'potential_concern' | 'high_safety_risk';

/**
 * Explicit separation between StressEstimate and SafetyRiskAssessment
 */
export interface SafetyRiskAssessment {
  isTriggered: boolean;
  riskLevel: SafetyRiskLevel;
  triggerReason?: string;
  timestamp: string;
  requiresCrisisResources: boolean;
  userAcknowledged: boolean;
}

export interface SensorPermissionState {
  camera: 'prompt' | 'granted' | 'denied' | 'unavailable';
  microphone: 'prompt' | 'granted' | 'denied' | 'unavailable';
}

export interface UserProfile {
  name: string;
  avatarUrl?: string;
  preferredName: string;
  country: string;
  themePreference: 'light' | 'dark' | 'system';
  trustedContact: TrustedContact;
  /** ISO 3166-1 alpha-2 country code for preferred crisis helpline region (e.g. 'LK', 'US') */
  preferredCrisisRegion?: string;
}

export interface PrivacyConsent {
  allowCamera: boolean;
  allowMicrophone: boolean;
  allowKeystrokeAnalysis: boolean;
  allowHistoricalStorage: boolean;
  allowAnonymousResearchData: boolean;
  lastConsentDate: string;
}

/**
 * Typed WebSocket Server/Client Message Contracts
 */
export type ServerMessage =
  | {
      type: 'METRICS_UPDATE';
      stress: StressEstimate;
      emotions: EmotionProbability;
      safety?: SafetyRiskAssessment;
    }
  | {
      type: 'AI_REPLY';
      messageId: string;
      replyText: string;
      suggestedAction?: InterventionType;
      activeModalities?: ModalityAvailability;
      stressSnapshot?: { score: number; level: StressLevel };
      detectedEmotions?: Partial<EmotionProbability>;
    }
  | {
      type: 'STREAM_TOKEN';
      messageId: string;
      token: string;
    }
  | {
      type: 'SAFETY_ALERT';
      safety: SafetyRiskAssessment;
    }
  | {
      type: 'ERROR';
      message: string;
    }
  | {
      type: 'PONG';
    };

export type ClientMessage =
  | {
      type: 'CLIENT_MESSAGE';
      payload: MultimodalPayload;
    }
  | {
      type: 'PING';
    };
