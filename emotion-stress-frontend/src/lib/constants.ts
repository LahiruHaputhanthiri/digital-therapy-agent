import { MoodRecord, Session, StressLevel } from '@/types';

export const APP_CONFIG = {
  appName: 'MindCare Assistant',
  tagline: 'Multimodal Emotion-Aware Wellbeing Assistant',
  version: '1.0.0-academic',
  disclaimer:
    'MindCare is an academic research prototype and not a licensed clinical diagnostic tool. All stress and emotion evaluations are estimates based on available behavioral signals.',
  keystrokePrivacyNotice:
    'Typing-pattern analysis uses timing information to estimate behavioral signals. Your typed message content is not collected for this analysis.',
  cameraPrivacyNotice:
    'Camera frames are processed in-session for facial expression signal estimation. Raw video is never stored on disk.',
  audioPrivacyNotice:
    'Microphone input is processed during voice interactions to compute acoustic tone signals. Raw audio is not retained without consent.',
};

/**
 * Configurable Stress Level Thresholds
 * Used uniformly across the application rather than hardcoded in multiple components.
 */
export const STRESS_THRESHOLDS = {
  LOW_MAX: 34,
  MODERATE_MAX: 64,
} as const;

export function getStressLevelFromScore(score: number): StressLevel {
  if (score <= STRESS_THRESHOLDS.LOW_MAX) return 'low';
  if (score <= STRESS_THRESHOLDS.MODERATE_MAX) return 'moderate';
  return 'high';
}

export const INITIAL_MOOD_HISTORY: MoodRecord[] = [
  { id: '1', day: 'Mon', date: '2026-08-14', moodScore: 4, label: 'Calm', estimatedStress: 28 },
  { id: '2', day: 'Tue', date: '2026-08-15', moodScore: 3, label: 'Neutral', estimatedStress: 45 },
  { id: '3', day: 'Wed', date: '2026-08-16', moodScore: 2, label: 'Stressed', estimatedStress: 68 },
  { id: '4', day: 'Thu', date: '2026-08-17', moodScore: 3, label: 'Neutral', estimatedStress: 42 },
  { id: '5', day: 'Fri', date: '2026-08-18', moodScore: 4, label: 'Calm', estimatedStress: 31 },
  { id: '6', day: 'Sat', date: '2026-08-19', moodScore: 5, label: 'Calm', estimatedStress: 20 },
  { id: '7', day: 'Sun', date: '2026-08-20', moodScore: 3, label: 'Neutral', estimatedStress: 38 },
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess-today',
    title: 'Midday Mindful Check-in',
    date: 'Today, 2:15 PM',
    durationMinutes: 14,
    summary: 'Explored afternoon cognitive fatigue and performed a 4-7-8 breathing exercise.',
    avgStressLevel: 'moderate',
    avgStressScore: 42,
    dominantMood: 'Neutral',
    messageCount: 8,
  },
  {
    id: 'sess-yesterday',
    title: 'Evening Reflection & Decompression',
    date: 'Yesterday, 8:40 PM',
    durationMinutes: 22,
    summary: 'Discussed project deadlines, recognized tension patterns, and reflected on progress.',
    avgStressLevel: 'low',
    avgStressScore: 24,
    dominantMood: 'Calm',
    messageCount: 14,
  },
  {
    id: 'sess-prev',
    title: 'Stress Signal De-escalation',
    date: 'Aug 16, 11:30 AM',
    durationMinutes: 18,
    summary: 'Detected elevated typing tension; guided through 5-4-3-2-1 grounding exercise.',
    avgStressLevel: 'high',
    avgStressScore: 72,
    dominantMood: 'Stressed',
    messageCount: 12,
  },
];

export const SUGGESTED_PROMPTS = {
  low: [
    'Reflect on my day',
    'Help me maintain this calm focus',
    'Share a gentle thought for the evening',
    'Log a gratitude moment',
  ],
  moderate: [
    'I feel a bit overwhelmed right now',
    'Guide me through a quick breathing exercise',
    'Help me prioritize what is in my control',
    'Can we do a short grounding check-in?',
  ],
  high: [
    'Things feel very intense right now',
    'Please walk me through the 5-4-3-2-1 grounding exercise',
    'I need a quiet space to slow down',
    'Help me pace my thoughts',
  ],
};
