import { create } from 'zustand';
import {
  EmotionProbability,
  InterventionType,
  KeystrokeMetrics,
  Language,
  Message,
  ModalityAvailability,
  MoodRecord,
  PrivacyConsent,
  SafetyRiskAssessment,
  Session,
  StressEstimate,
  StressLevel,
  UserProfile,
} from '@/types';
import {
  getStressLevelFromScore,
  INITIAL_MOOD_HISTORY,
  INITIAL_SESSIONS,
} from '@/lib/constants';

interface StressStoreState {
  // Session & Identity
  currentSessionId: string;
  userProfile: UserProfile;
  privacyConsent: PrivacyConsent;
  theme: 'light' | 'dark' | 'system';
  language: Language;
  isDemoMode: boolean;
  isTtsEnabled: boolean;

  // Real-time Multimodal Metrics
  stressEstimate: StressEstimate;
  emotionProbabilities: EmotionProbability;
  activeModalities: ModalityAvailability;
  keystrokeMetrics: KeystrokeMetrics;

  // Conversational State
  messages: Message[];
  isAiTyping: boolean;

  // Interventions & Explicit Safety State (Separated from Stress)
  activeIntervention: InterventionType;
  safetyState: SafetyRiskAssessment;

  // Historical Records
  sessions: Session[];
  moodHistory: MoodRecord[];

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  toggleDemoMode: (enabled?: boolean) => void;
  toggleTts: (enabled?: boolean) => void;
  setModality: (modality: keyof ModalityAvailability, enabled: boolean) => void;
  updateStressEstimate: (estimate: Partial<StressEstimate>) => void;
  updateEmotionProbabilities: (probabilities: Partial<EmotionProbability>) => void;
  updateKeystrokeMetrics: (metrics: Partial<KeystrokeMetrics>) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Message;
  updateMessageContent: (id: string, content: string) => void;
  updateLastUserMessageContent: (content: string) => void;
  updateStreamingMessage: (id: string, chunk: string) => void;
  setAiTyping: (typing: boolean) => void;
  setIntervention: (intervention: InterventionType) => void;
  triggerSafetyProtocol: (safety: Partial<SafetyRiskAssessment>) => void;
  acknowledgeSafety: () => void;
  updatePrivacyConsent: (consent: Partial<PrivacyConsent>) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  addMoodRecord: (record: Omit<MoodRecord, 'id'>) => void;
  loadSession: (session: Session) => void;
  createNewSession: () => void;
  clearMessages: () => void;
  clearHistory: () => void;
}

const DEFAULT_STRESS: StressEstimate = {
  level: 'moderate',
  score: 42,
  confidence: 0.88,
  trend: 'stable',
  lastUpdated: '2026-08-20T14:30:00.000Z',
  disclaimer: 'Based on active modalities (Text & Keystroke Dynamics). Estimates may vary.',
};

const DEFAULT_EMOTIONS: EmotionProbability = {
  neutral: 48,
  joy: 21,
  sadness: 14,
  fear_anxiety: 10,
  anger: 7,
};

const DEFAULT_KEYSTROKE: KeystrokeMetrics = {
  dwellTimeMs: 112,
  flightTimeMs: 148,
  wpm: 58,
  backspaceCount: 3,
  pauseCount: 1,
  cadenceConsistency: 0.86,
  lastMeasured: '2026-08-20T14:30:00.000Z',
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-welcome-1',
    sender: 'assistant',
    content:
      "Hello Alex. I'm your MindCare AI wellbeing assistant. How are you feeling today? We can chat, reflect on your week, or try a guided exercise whenever you need a calming moment.",
    timestamp: '2026-08-20T14:30:00.000Z',
    stressSnapshot: { score: 38, level: 'moderate' },
    activeModalities: { text: true, audio: false, video: false, keystroke: true, history: true },
  },
];

export const useStressStore = create<StressStoreState>((set, get) => ({
  currentSessionId: 'sess-today',
  theme: 'system',
  language: 'en',
  isDemoMode: true,
  isTtsEnabled: true,

  userProfile: {
    name: 'Alex Chen',
    preferredName: 'Alex',
    country: 'US',
    themePreference: 'system',
    preferredCrisisRegion: 'LK',
    trustedContact: {
      name: 'Sarah (Sister)',
      relationship: 'Family Member',
      phone: '+1 (555) 234-5678',
      notifyOnCrisis: false,
    },
  },

  privacyConsent: {
    allowCamera: false,
    allowMicrophone: false,
    allowKeystrokeAnalysis: true,
    allowHistoricalStorage: true,
    allowAnonymousResearchData: true,
    lastConsentDate: '2026-08-20T14:30:00.000Z',
  },

  stressEstimate: DEFAULT_STRESS,
  emotionProbabilities: DEFAULT_EMOTIONS,
  activeModalities: {
    text: true,
    audio: false,
    video: false,
    keystroke: true,
    history: true,
  },
  keystrokeMetrics: DEFAULT_KEYSTROKE,

  messages: INITIAL_MESSAGES,
  isAiTyping: false,

  activeIntervention: 'none',
  safetyState: {
    isTriggered: false,
    riskLevel: 'normal',
    requiresCrisisResources: false,
    timestamp: '2026-08-20T14:30:00.000Z',
    userAcknowledged: false,
  },

  sessions: INITIAL_SESSIONS,
  moodHistory: INITIAL_MOOD_HISTORY,

  setTheme: (theme) => set({ theme }),

  setLanguage: (language: Language) => set({ language }),

  toggleLanguage: () =>
    set((state) => ({
      language: state.language === 'en' ? 'si' : state.language === 'si' ? 'ta' : 'en',
    })),

  toggleDemoMode: (enabled) =>
    set((state) => ({ isDemoMode: enabled !== undefined ? enabled : !state.isDemoMode })),

  toggleTts: (enabled) =>
    set((state) => ({ isTtsEnabled: enabled !== undefined ? enabled : !state.isTtsEnabled })),

  setModality: (modality, enabled) =>
    set((state) => {
      const updatedModalities = {
        ...state.activeModalities,
        [modality]: enabled,
      };

      const activeCount = Object.values(updatedModalities).filter(Boolean).length;
      let disclaimer = 'Text-only privacy mode active. Estimates derived from linguistic context.';
      if (activeCount > 1) {
        const activeNames = Object.entries(updatedModalities)
          .filter(([_, active]) => active)
          .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
          .join(', ');
        disclaimer = `Estimated using active signals: ${activeNames}. Not a clinical diagnosis.`;
      }

      return {
        activeModalities: updatedModalities,
        stressEstimate: {
          ...state.stressEstimate,
          disclaimer,
        },
      };
    }),

  updateStressEstimate: (estimate) =>
    set((state) => {
      const newScore = estimate.score !== undefined ? estimate.score : state.stressEstimate.score;
      const normalizedScore = Math.min(100, Math.max(0, Math.round(newScore)));
      const calculatedLevel: StressLevel = estimate.level ?? getStressLevelFromScore(normalizedScore);

      return {
        stressEstimate: {
          ...state.stressEstimate,
          ...estimate,
          score: normalizedScore,
          level: calculatedLevel,
          lastUpdated: new Date().toISOString(),
        },
      };
    }),

  updateEmotionProbabilities: (probabilities) =>
    set((state) => ({
      emotionProbabilities: {
        ...state.emotionProbabilities,
        ...probabilities,
      },
    })),

  updateKeystrokeMetrics: (metrics) =>
    set((state) => ({
      keystrokeMetrics: {
        ...state.keystrokeMetrics,
        ...metrics,
        lastMeasured: new Date().toISOString(),
      },
    })),

  addMessage: (msg) => {
    const newMessage: Message = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));

    return newMessage;
  },

  updateMessageContent: (id, content) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, content } : m)),
    })),

  updateLastUserMessageContent: (content) =>
    set((state) => {
      const msgs = [...state.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].sender === 'user') {
          msgs[i] = { ...msgs[i], content };
          break;
        }
      }
      return { messages: msgs };
    }),

  updateStreamingMessage: (id, chunk) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + chunk, isStreaming: true } : m
      ),
    })),

  setAiTyping: (isAiTyping) => set({ isAiTyping }),

  setIntervention: (activeIntervention) => set({ activeIntervention }),

  triggerSafetyProtocol: (safety) =>
    set((state) => ({
      safetyState: {
        ...state.safetyState,
        ...safety,
        isTriggered: true,
        riskLevel: safety.riskLevel ?? 'potential_concern',
        triggerReason:
          safety.triggerReason || 'Elevated distress indicators or safety keywords detected.',
        requiresCrisisResources:
          safety.requiresCrisisResources ?? (safety.riskLevel === 'high_safety_risk'),
        timestamp: new Date().toISOString(),
        userAcknowledged: false,
      },
      activeIntervention:
        safety.riskLevel === 'high_safety_risk'
          ? 'safety'
          : state.activeIntervention === 'none'
          ? 'safety'
          : state.activeIntervention,
    })),

  acknowledgeSafety: () =>
    set((state) => ({
      safetyState: {
        ...state.safetyState,
        userAcknowledged: true,
        isTriggered: false,
      },
      activeIntervention: state.activeIntervention === 'safety' ? 'none' : state.activeIntervention,
    })),

  updatePrivacyConsent: (consent) =>
    set((state) => ({
      privacyConsent: {
        ...state.privacyConsent,
        ...consent,
        lastConsentDate: new Date().toISOString(),
      },
    })),

  updateUserProfile: (profile) =>
    set((state) => ({
      userProfile: {
        ...state.userProfile,
        ...profile,
      },
    })),

  addMoodRecord: (record) =>
    set((state) => ({
      moodHistory: [
        ...state.moodHistory,
        {
          ...record,
          id: `mood-${Date.now()}`,
        },
      ],
    })),

  loadSession: (session) =>
    set({
      currentSessionId: session.id,
      stressEstimate: {
        level: session.avgStressLevel,
        score: session.avgStressScore,
        confidence: 0.9,
        trend: 'stable',
        lastUpdated: '2026-08-20T14:30:00.000Z',
        disclaimer: `Viewing archive for "${session.title}".`,
      },
    }),

  createNewSession: () =>
    set({
      currentSessionId: `sess-${Date.now()}`,
      messages: [
        {
          id: `msg-new-${Date.now()}`,
          sender: 'assistant',
          content:
            "I'm here with you. Take a breath and share whatever is on your mind today.",
          timestamp: new Date().toISOString(),
          activeModalities: { text: true, audio: false, video: false, keystroke: true, history: true },
        },
      ],
      activeIntervention: 'none',
      safetyState: {
        isTriggered: false,
        riskLevel: 'normal',
        requiresCrisisResources: false,
        timestamp: new Date().toISOString(),
        userAcknowledged: false,
      },
    }),

  clearMessages: () =>
    set({
      messages: [
        {
          id: `msg-cleared-${Date.now()}`,
          sender: 'system',
          content: 'Session logs cleared. Starting a fresh conversation.',
          timestamp: new Date().toISOString(),
        },
      ],
    }),

  clearHistory: () =>
    set({
      sessions: [],
      moodHistory: [],
    }),
}));
