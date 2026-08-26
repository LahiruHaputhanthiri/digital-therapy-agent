/**
 * Text-to-Speech (TTS) Utility with Backend Proxy & Native Web Speech Support
 * - Backend FastAPI /api/v1/tts (gTTS) for Sinhala ('si') and Tamil ('ta') ensuring 100% reliable, block-free audio.
 * - Native Web Speech API (window.speechSynthesis) for English ('en') when a native English voice exists.
 */

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = RAW_API_URL.endsWith('/api/v1')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, '')}/api/v1`;

let cachedVoices: SpeechSynthesisVoice[] = [];
let isVoiceListInitialized = false;

// Audio element & playback cancellation tracking
let currentAudio: HTMLAudioElement | null = null;
let playbackId = 0;

/**
 * Initializes native voice list and registers onvoiceschanged listener safely
 */
function initVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  try {
    cachedVoices = window.speechSynthesis.getVoices();
    if (!isVoiceListInitialized) {
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
      };
      isVoiceListInitialized = true;
    }
  } catch (err) {
    console.warn('[TTS] Error initializing native voices:', err);
  }

  return cachedVoices;
}

/**
 * Finds a valid matching native voice for the given language code without crossing language families.
 */
export function getNativeVoice(languageCode: string): SpeechSynthesisVoice | null {
  const voices = initVoices();
  const code = (languageCode || 'en').trim().toLowerCase();

  let targetLocales: string[] = [];
  let baseLang = 'en';

  if (code === 'si' || code.startsWith('si')) {
    targetLocales = ['si-lk', 'si'];
    baseLang = 'si';
  } else if (code === 'ta' || code.startsWith('ta')) {
    targetLocales = ['ta-lk', 'ta-in', 'ta'];
    baseLang = 'ta';
  } else {
    targetLocales = ['en-us', 'en-gb', 'en-au', 'en-ca', 'en'];
    baseLang = 'en';
  }

  // 1. Exact locale match
  for (const locale of targetLocales) {
    const match = voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === locale
    );
    if (match) return match;
  }

  // 2. Base language prefix match (strictly in the same language family)
  const prefixMatch = voices.find((v) =>
    v.lang.toLowerCase().replace('_', '-').startsWith(baseLang)
  );
  if (prefixMatch) return prefixMatch;

  return null;
}

/**
 * Clean text for natural speech synthesis (strips markdown formatting, bullets, quotes)
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*{1,3}([\s\S]*?)\*{1,3}/g, '$1') // Bold / italic asterisks
    .replace(/_{1,3}([\s\S]*?)_{1,3}/g, '$1') // Underscores
    .replace(/`{1,3}([\s\S]*?)(?:`{1,3}|$)/g, '$1') // Code blocks / backticks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Markdown links
    .replace(/^#+\s+/gm, '') // Heading markers
    .replace(/^[•\-\*]\s+/gm, '') // Bullet points
    .replace(/\s+/g, ' ') // Multiple spaces
    .trim();
}

/**
 * Stops all speech synthesis (both native Web Speech API and backend HTML5 Audio)
 */
export function stopTTS(): void {
  // 1. Invalidate any in-flight playback sessions
  playbackId++;

  // 2. Cancel native browser speech synthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (err) {
      console.warn('[TTS] Error cancelling native speech:', err);
    }
  }

  // 3. Halt and clean up active HTML5 Audio element
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.onplay = null;
    } catch (err) {
      console.warn('[TTS] Error pausing HTMLAudioElement:', err);
    }
    currentAudio = null;
  }
}

/**
 * Checks if speech synthesis is currently active or speaking
 */
export function isTTSSpeaking(): boolean {
  const isAudioActive = currentAudio !== null && !currentAudio.paused;
  const isNativeActive =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    (window.speechSynthesis.speaking || window.speechSynthesis.pending);
  return isAudioActive || isNativeActive;
}

/**
 * Plays speech using the Backend FastAPI TTS endpoint (/api/v1/tts)
 */
function playBackendTTS(
  text: string,
  languageCode: string,
  targetPlaybackId: number,
  options?: TTSOptions
): void {
  const lang = languageCode === 'si' ? 'si' : languageCode === 'ta' ? 'ta' : 'en';
  const url = `${API_BASE_URL}/tts?text=${encodeURIComponent(text)}&lang=${lang}`;

  console.log(`[TTS] Streaming speech via Backend Proxy | lang=${lang} | length=${text.length}`);

  const audio = new Audio(url);
  currentAudio = audio;

  audio.onplay = () => {
    if (targetPlaybackId === playbackId) {
      options?.onStart?.();
    }
  };

  audio.onended = () => {
    if (targetPlaybackId === playbackId) {
      currentAudio = null;
      options?.onEnd?.();
    }
  };

  audio.onerror = (err) => {
    console.warn('[TTS] Backend TTS playback error:', err);
    if (targetPlaybackId === playbackId) {
      currentAudio = null;
      options?.onError?.(err);
    }
  };

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn('[TTS] Audio play() notice (browser autoplay policy or connection):', err);
      if (targetPlaybackId === playbackId) {
        currentAudio = null;
        options?.onError?.(err);
      }
    });
  }
}

/**
 * Plays speech using native window.speechSynthesis
 */
function playNativeTTS(
  text: string,
  voice: SpeechSynthesisVoice,
  localeTag: string,
  options?: TTSOptions
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  console.log('[TTS] Speaking via native Web Speech API', {
    language: localeTag,
    voiceName: voice.name,
    length: text.length,
  });

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = localeTag;
  utterance.voice = voice;
  utterance.rate = options?.rate ?? 0.95;
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = options?.volume ?? 1.0;

  utterance.onstart = () => {
    options?.onStart?.();
  };

  utterance.onend = () => {
    options?.onEnd?.();
  };

  utterance.onerror = (event) => {
    if (event.error !== 'canceled' && event.error !== 'interrupted') {
      console.warn('[TTS] Native speech synthesis notice:', event.error);
      options?.onError?.(event);
    }
  };

  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Plays AI response text with appropriate language routing:
 * - Sinhala ('si'): Routes to Backend FastAPI TTS Proxy (/api/v1/tts).
 * - Tamil ('ta'): Routes to Backend FastAPI TTS Proxy (/api/v1/tts).
 * - English ('en'): Uses native Web Speech API if an English voice is present; otherwise routes to Backend TTS Proxy.
 */
export function playTTS(
  text: string,
  languageCode: string = 'en',
  options?: TTSOptions
): void {
  const cleanedText = cleanTextForSpeech(text);
  if (!cleanedText) {
    return;
  }

  // 1. Stop any ongoing speech and establish a new unique playback session
  stopTTS();
  const currentPlaybackId = playbackId;

  const lang = (languageCode || 'en').trim().toLowerCase();

  // 2. Language Routing Policy
  if (lang === 'si' || lang.startsWith('si') || lang === 'ta' || lang.startsWith('ta')) {
    // Sinhala and Tamil: Use Backend TTS Proxy
    playBackendTTS(cleanedText, lang, currentPlaybackId, options);
    return;
  }

  if (lang === 'en' || lang.startsWith('en')) {
    // English: Check for native English voice in browser
    const nativeVoice = getNativeVoice('en');
    if (nativeVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      playNativeTTS(cleanedText, nativeVoice, 'en-US', options);
      return;
    } else {
      console.log('[TTS] No native English voice found; using Backend TTS proxy.');
      playBackendTTS(cleanedText, 'en', currentPlaybackId, options);
      return;
    }
  }

  // Default fallback
  playBackendTTS(cleanedText, lang, currentPlaybackId, options);
}
