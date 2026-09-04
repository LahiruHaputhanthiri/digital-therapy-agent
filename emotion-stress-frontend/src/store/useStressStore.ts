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
  rawLogs: import('@/types').ChatLogItem[];

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
  loadChatHistory: (logs: import('@/types').ChatLogItem[]) => void;
  setMessages: (messages: Message[]) => void;
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

function formatSessionDate(isoString?: string): string {
  if (!isoString) return 'Recent';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  } catch {
    return 'Recent';
  }
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-welcome-1',
    sender: 'assistant',
    content:
      "Hello. I'm your MindCare AI wellbeing assistant. How are you feeling today? We can chat, reflect on your week, or try a guided exercise whenever you need a calming moment.",
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

  sessions: [],
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

  rawLogs: [],

  loadSession: (session) =>
    set((state) => {
      const matchingLog = state.rawLogs.find((l) => `sess-${l.id}` === session.id);
      let sessionMessages: Message[] = state.messages;

      if (matchingLog) {
        const msgs: Message[] = [];
        if (matchingLog.user_message && matchingLog.user_message.trim()) {
          msgs.push({
            id: `hist-u-${matchingLog.id}`,
            sender: 'user',
            content: matchingLog.user_message,
            timestamp: matchingLog.timestamp || new Date().toISOString(),
            activeModalities: { text: true, audio: false, video: false, keystroke: true, history: true },
          });
        }
        if (matchingLog.ai_response && matchingLog.ai_response.trim()) {
          msgs.push({
            id: `hist-a-${matchingLog.id}`,
            sender: 'assistant',
            content: matchingLog.ai_response,
            timestamp: matchingLog.timestamp || new Date().toISOString(),
            stressSnapshot: {
              score: session.avgStressScore,
              level: session.avgStressLevel,
            },
            detectedEmotions: {
              [session.dominantMood.toLowerCase()]: 85,
            },
            activeModalities: { text: true, audio: false, video: false, keystroke: true, history: true },
          });
        }
        sessionMessages = msgs;
      }

      return {
        currentSessionId: session.id,
        messages: sessionMessages,
        stressEstimate: {
          level: session.avgStressLevel,
          score: session.avgStressScore,
          confidence: 0.95,
          trend: 'stable',
          lastUpdated: new Date().toISOString(),
          disclaimer: `Viewing archive for "${session.title}".`,
        },
      };
    }),

  createNewSession: () =>
    set({
      currentSessionId: `sess-new-${Date.now()}`,
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

  loadChatHistory: (logs) => {
    if (!logs || logs.length === 0) {
      set({ sessions: [], rawLogs: [] });
      return;
    }

    const restoredMessages: Message[] = [];
    const dynamicSessions: Session[] = [];
    const dynamicMoodHistory: MoodRecord[] = [];

    // Chronological messages reconstruction
    logs.forEach((log) => {
      const rawScore = log.stress_score !== undefined && log.stress_score !== null ? log.stress_score : 0.35;
      const normalizedScore = Math.round(rawScore <= 1.0 ? rawScore * 100 : rawScore);
      const emotionLabel = log.detected_emotion || 'neutral';
      const stressLvl = getStressLevelFromScore(normalizedScore);

      if (log.user_message && log.user_message.trim()) {
        restoredMessages.push({
          id: `hist-u-${log.id}`,
          sender: 'user',
          content: log.user_message,
          timestamp: log.timestamp || new Date().toISOString(),
          activeModalities: { text: true, audio: false, video: false, keystroke: true, history: true },
        });
      }

      if (log.ai_response && log.ai_response.trim()) {
        restoredMessages.push({
          id: `hist-a-${log.id}`,
          sender: 'assistant',
          content: log.ai_response,
          timestamp: log.timestamp || new Date().toISOString(),
          stressSnapshot: {
            score: normalizedScore,
            level: stressLvl,
          },
          detectedEmotions: {
            [emotionLabel]: 85,
          },
          activeModalities: { text: true, audio: false, video: false, keystroke: true, history: true },
        });
      }

      // Generate Session card item for sidebar
      const cleanUserMsg = log.user_message ? log.user_message.replace(/^🎤\s*"?|"?$/g, '').trim() : '';
      const sessionTitle = cleanUserMsg
        ? cleanUserMsg.length > 36
          ? `${cleanUserMsg.slice(0, 36)}...`
          : cleanUserMsg
        : `Therapy Check-in #${log.id}`;

      const sessionSummary = log.ai_response
        ? log.ai_response.length > 80
          ? `${log.ai_response.slice(0, 80)}...`
          : log.ai_response
        : 'Reflective therapeutic check-in completed.';

      const dominantMoodStr: 'Calm' | 'Neutral' | 'Stressed' | 'Low mood' =
        normalizedScore <= 34 ? 'Calm' : normalizedScore <= 64 ? 'Neutral' : 'Stressed';

      dynamicSessions.unshift({
        id: `sess-${log.id}`,
        title: sessionTitle,
        date: formatSessionDate(log.timestamp),
        durationMinutes: Math.max(4, Math.min(25, Math.round((log.user_message?.length || 30) / 8))),
        summary: sessionSummary,
        avgStressLevel: stressLvl,
        avgStressScore: normalizedScore,
        dominantMood: dominantMoodStr,
        messageCount: 2,
      });

      // Construct dynamic mood history record
      try {
        const logDate = new Date(log.timestamp || Date.now());
        const dayLabel = logDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = (log.timestamp || new Date().toISOString()).split('T')[0];

        dynamicMoodHistory.push({
          id: `mood-${log.id}`,
          day: dayLabel,
          date: dateStr,
          moodScore: Math.max(1, Math.min(5, Math.round(5 - (normalizedScore / 25)))),
          label: dominantMoodStr,
          estimatedStress: normalizedScore,
        });
      } catch {
        // Ignore date parsing issues
      }
    });

    set({
      rawLogs: logs,
      messages: restoredMessages.length > 0 ? restoredMessages : undefined,
      sessions: dynamicSessions,
      moodHistory: dynamicMoodHistory.length > 0 ? dynamicMoodHistory.slice(-7) : undefined,
      currentSessionId: dynamicSessions.length > 0 ? dynamicSessions[0].id : 'sess-current',
    });
  },

  setMessages: (messages) => set({ messages }),

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
