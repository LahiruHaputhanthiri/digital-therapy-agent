import {
  EmotionProbability,
  KeystrokeMetrics,
  ModalityAvailability,
  MultimodalPayload,
  StressEstimate,
  StressLevel,
} from '@/types';

/**
 * Builds a fully-typed `MultimodalPayload` for the FastAPI inference endpoints.
 * Only includes feature blocks for active modalities, so the backend can
 * apply late-fusion weighing correctly.
 */
export function buildMultimodalPayload(params: {
  sessionId: string;
  text?: string;
  modalities: ModalityAvailability;
  keystrokeMetrics?: KeystrokeMetrics;
  audioMetrics?: { volumeDb: number; recordingDurationSeconds: number };
  facialMetrics?: { faceDetected: boolean; smileProbability: number; browFurrowScore: number };
  avgWeeklyStress?: number;
  dominantRecentMood?: string;
}): MultimodalPayload {
  const {
    sessionId,
    text,
    modalities,
    keystrokeMetrics,
    audioMetrics,
    facialMetrics,
    avgWeeklyStress,
    dominantRecentMood,
  } = params;

  return {
    sessionId,
    timestamp: new Date().toISOString(),
    text: modalities.text ? text : undefined,
    modalities,
    keystrokeFeatures: modalities.keystroke && keystrokeMetrics
      ? {
          dwellTimeMs: keystrokeMetrics.dwellTimeMs,
          flightTimeMs: keystrokeMetrics.flightTimeMs,
          wpm: keystrokeMetrics.wpm,
          backspaceCount: keystrokeMetrics.backspaceCount,
          pauseCount: keystrokeMetrics.pauseCount,
          cadenceConsistency: keystrokeMetrics.cadenceConsistency,
        }
      : undefined,
    audioFeatures: modalities.audio && audioMetrics
      ? {
          volumeDb: audioMetrics.volumeDb,
          recordingDurationSeconds: audioMetrics.recordingDurationSeconds,
          // Simulated pitch and silence when real spectral analysis is unavailable
          pitchHz: 165 + Math.random() * 60,
          jitter: 0.015 + Math.random() * 0.01,
          silenceRatio: 0.12 + Math.random() * 0.08,
          speechRate: 3.2 + Math.random() * 1.8,
        }
      : undefined,
    videoFeatures: modalities.video && facialMetrics
      ? {
          faceDetected: facialMetrics.faceDetected,
          smileProbability: facialMetrics.smileProbability,
          browFurrowScore: facialMetrics.browFurrowScore,
          headPose: { pitch: -2 + Math.random() * 4, yaw: -3 + Math.random() * 6, roll: 0 },
          eyeBlinkRate: 14 + Math.floor(Math.random() * 8),
          gazeAversionScore: Math.random() * 0.3,
        }
      : undefined,
    historicalContext: modalities.history
      ? {
          avgWeeklyStress: avgWeeklyStress ?? 38,
          dominantRecentMood: dominantRecentMood ?? 'Neutral',
        }
      : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Standalone Interactive Mock / Demo Engine
//  Provides realistic simulated biometric and affective telemetry
//  when the FastAPI backend is offline. Produces:
//  - Dynamic stress scores (0.20–1.60 index / 10–80%)
//  - Emotion probability distributions for all 7 emotions
//  - Empathetic streaming-style AI responses
//  - Contextual suggested actions (Breathing / Grounding / Safety)
// ─────────────────────────────────────────────────────────────────────────────

export interface MockInferenceResult {
  reply: string;
  streamTokens: string[]; // Pre-tokenized reply chunks for simulated streaming
  stress: StressEstimate;
  emotions: EmotionProbability;
  safetyTriggered: boolean;
  safetyReason?: string;
  suggestedAction?: 'breathing' | 'grounding' | 'safety';
}

/**
 * Stress detection keyword sets with corresponding score deltas and emotion shifts.
 * These simulate a simplified multi-class text classifier for demo purposes.
 */
const KEYWORD_RULES: Array<{
  keywords: string[];
  scoreDelta: number;
  fearDelta: number;
  sadnessDelta: number;
  joyDelta: number;
  angerDelta: number;
  isCrisis?: boolean;
}> = [
  // Crisis / Safety triggers
  {
    keywords: ['suicide', 'kill myself', 'end my life', 'self-harm', 'want to die', 'no point living'],
    scoreDelta: 55, fearDelta: 38, sadnessDelta: 42, joyDelta: -35, angerDelta: 8, isCrisis: true,
  },
  // Acute panic
  {
    keywords: ['panic', 'panic attack', 'terrified', 'cannot breathe', "can't breathe", 'heart racing'],
    scoreDelta: 38, fearDelta: 40, sadnessDelta: 10, joyDelta: -20, angerDelta: 5,
  },
  // High stress / overwhelm
  {
    keywords: ['overwhelmed', 'anxious', 'stress', 'exhausted', 'burnout', 'cannot cope', "can't cope", 'breaking down'],
    scoreDelta: 24, fearDelta: 22, sadnessDelta: 12, joyDelta: -12, angerDelta: 6,
  },
  // Moderate stress
  {
    keywords: ['worried', 'nervous', 'tense', 'frustrated', 'irritated', 'bit stressed', 'hard day'],
    scoreDelta: 14, fearDelta: 12, sadnessDelta: 6, joyDelta: -8, angerDelta: 10,
  },
  // Positive / calm
  {
    keywords: ['happy', 'great', 'calm', 'good', 'peaceful', 'relaxed', 'better now', 'thank you', 'grateful', 'wonderful'],
    scoreDelta: -20, fearDelta: -12, sadnessDelta: -10, joyDelta: 38, angerDelta: -8,
  },
  // Mild positive
  {
    keywords: ['okay', 'fine', 'alright', 'managing', 'getting through'],
    scoreDelta: -8, fearDelta: -4, sadnessDelta: -4, joyDelta: 10, angerDelta: -3,
  },
];

/**
 * Empathetic response templates keyed by stress tier and safety state.
 * Multiple templates per tier provide natural conversational variety.
 */
const RESPONSE_TEMPLATES: Record<string, string[]> = {
  crisis: [
    "I care deeply about your safety right now. You are not alone in this. I've brought up support resources and crisis helplines directly on your screen. Please reach out to someone you trust, or contact a helpline — they are there for you, 24/7.",
    "What you're feeling sounds very painful, and I want you to know that support is available right now. I've surfaced crisis resources on your screen. You matter, and there are people who want to help you through this moment.",
  ],
  high: [
    "It sounds like things are feeling really heavy and overwhelming right now. I'm here with you. Would it help if we took a pause together — maybe try the 5-4-3-2-1 grounding exercise to gently bring you back to this present moment?",
    "I can sense significant distress in what you've shared. That takes courage to express. Let's take this one breath at a time — would you like to try a short guided breathing exercise with me right now?",
    "What you're carrying sounds really difficult. I want to support you through this. Let's slow down a little together — a brief grounding or breathing exercise might help bring some calm right now.",
  ],
  moderate: [
    "I can sense there's some tension in what you're sharing. Take a gentle breath. What feels like the heaviest thought on your mind right now?",
    "That sounds challenging. It's understandable to feel this way. What would feel most helpful right now — talking it through, or trying a quick calming exercise together?",
    "Thank you for sharing that. I'm here to listen and support you. What part of this feels most pressing or urgent for you today?",
    "I hear you. Sometimes just naming what we're feeling can help a little. What's been on your mind the most today?",
  ],
  low: [
    "It sounds like you're in a relatively grounded space right now. That's something to appreciate. What would you like to explore or reflect on today?",
    "I'm glad you're here. It sounds like things are feeling fairly settled. Would you like to reflect on something specific, or just check in?",
    "That's good to hear. A calm moment is a great time to reflect or set an intention. What's been on your mind lately?",
    "I'm with you. You seem to be in a calm space — would you like to explore some thoughts, or perhaps review how your week has been feeling?",
  ],
};

/**
 * Tokenizes a response string into word-level chunks suitable for simulated streaming.
 */
function tokenize(text: string): string[] {
  const words = text.split(' ');
  const tokens: string[] = [];
  let buffer = '';
  words.forEach((word, i) => {
    buffer += (i === 0 ? '' : ' ') + word;
    if (buffer.length >= 4 || i === words.length - 1) {
      tokens.push(buffer + ' ');
      buffer = '';
    }
  });
  return tokens;
}

/**
 * Picks a random item from an array.
 */
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Simulates research-grade multimodal fusion inference for local demo mode.
 *
 * Combines:
 * - Text semantic keyword analysis (simulated NLP)
 * - Keystroke dynamics indicators (backspace rate, flight time, pause count)
 * - Audio volume level contribution
 * - Random biometric jitter to simulate real signal variance
 *
 * Produces stress scores, 7-class emotion distributions, safety flags,
 * empathetic reply text, and streaming token chunks.
 */
export function simulateMultimodalInference(payload: MultimodalPayload): MockInferenceResult {
  const text = (payload.text || '').toLowerCase();

  // Baseline defaults
  let baseScore = 30 + Math.random() * 8; // slight randomization for realism
  let fearAnxiety = 12;
  let sadness = 10;
  let joy = 22;
  let anger = 6;
  let surprise = 8;
  let disgust = 4;
  let neutral = 38;
  let isCrisis = false;
  let safetyReason: string | undefined;

  // 1. Apply text keyword rules
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      baseScore += rule.scoreDelta;
      fearAnxiety += rule.fearDelta;
      sadness += rule.sadnessDelta;
      joy += rule.joyDelta;
      anger += rule.angerDelta;
      if (rule.isCrisis) {
        isCrisis = true;
        safetyReason =
          'Potential crisis indicators detected. Immediate supportive resources have been activated.';
      }
      break; // Apply only the most severe matching rule
    }
  }

  // 2. Keystroke dynamics influence
  if (payload.modalities.keystroke && payload.keystrokeFeatures) {
    const { backspaceCount = 0, flightTimeMs = 0, pauseCount = 0 } = payload.keystrokeFeatures;
    if (backspaceCount > 5 || flightTimeMs > 220 || pauseCount > 2) {
      baseScore += 7;
      fearAnxiety += 5;
      neutral -= 4;
    }
  }

  // 3. Audio volume influence
  if (payload.modalities.audio && payload.audioFeatures) {
    const vol = payload.audioFeatures.volumeDb ?? 0;
    if (vol > 75) { baseScore += 5; anger += 7; }
    if (vol < 25) { baseScore += 4; sadness += 6; }
  }

  // 4. Biometric signal jitter (simulates natural variance in multimodal sensors)
  baseScore += (Math.random() - 0.5) * 6;
  fearAnxiety += (Math.random() - 0.5) * 4;
  joy += (Math.random() - 0.5) * 4;
  surprise += (Math.random() - 0.5) * 3;

  // Clamp score
  baseScore = Math.max(10, Math.min(92, Math.round(baseScore)));

  // Normalize 7-class emotion distribution to sum to 100
  const rawTotal = neutral + joy + sadness + fearAnxiety + anger + surprise + disgust;
  const normNeutral = Math.max(0, Math.round((neutral / rawTotal) * 100));
  const normJoy = Math.max(0, Math.round((joy / rawTotal) * 100));
  const normSadness = Math.max(0, Math.round((sadness / rawTotal) * 100));
  const normFear = Math.max(0, Math.round((fearAnxiety / rawTotal) * 100));
  const normAnger = Math.max(0, Math.round((anger / rawTotal) * 100));
  const normSurprise = Math.max(0, Math.round((surprise / rawTotal) * 100));
  const normDisgust = Math.max(
    0,
    100 - (normNeutral + normJoy + normSadness + normFear + normAnger + normSurprise)
  );

  // Determine stress tier
  let level: StressLevel = 'low';
  if (baseScore > 65) level = 'high';
  else if (baseScore >= 35) level = 'moderate';

  // Construct disclaimer from active modalities
  const activeNames = Object.entries(payload.modalities)
    .filter(([, active]) => active)
    .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
    .join(', ');

  // Select empathetic response
  const templateKey = isCrisis ? 'crisis' : level;
  const replyText = randomFrom(RESPONSE_TEMPLATES[templateKey] ?? RESPONSE_TEMPLATES.low);

  // Determine suggested intervention
  let suggestedAction: MockInferenceResult['suggestedAction'];
  if (isCrisis) suggestedAction = 'safety';
  else if (level === 'high') suggestedAction = 'grounding';
  else if (level === 'moderate') suggestedAction = 'breathing';

  return {
    reply: replyText,
    streamTokens: tokenize(replyText),
    stress: {
      score: baseScore,
      level,
      confidence: 0.84 + Math.random() * 0.1,
      trend: baseScore > 50 ? 'increasing' : baseScore < 30 ? 'decreasing' : 'stable',
      lastUpdated: new Date().toISOString(),
      disclaimer: `Estimated from active signals: ${activeNames}. Academic prototype — not a clinical diagnosis.`,
    },
    emotions: {
      neutral: normNeutral,
      joy: normJoy,
      sadness: normSadness,
      fear_anxiety: normFear,
      anger: normAnger,
      surprise: normSurprise,
      disgust: normDisgust,
    },
    safetyTriggered: isCrisis,
    safetyReason,
    suggestedAction,
  };
}
