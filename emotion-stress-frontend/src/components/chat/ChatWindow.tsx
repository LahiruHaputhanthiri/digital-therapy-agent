'use client';

import React, { useRef, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Shield,
  Sparkles,
  Radio,
  Mic,
  Camera,
  Keyboard,
  Text,
  History,
  Volume2,
  VolumeX,
  Square,
  Activity,
} from 'lucide-react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { InputBar } from '@/components/chat/InputBar';
import { QuickSuggestions } from '@/components/chat/QuickSuggestions';
import { SafetyBanner } from '@/components/interventions/SafetyBanner';
import { BreathingCircle } from '@/components/interventions/BreathingCircle';
import { GroundingExercise } from '@/components/interventions/GroundingExercise';
import { Badge } from '@/components/ui/badge';
import { useStressStore } from '@/store/useStressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTranslation } from '@/locales';
import { playTTS, stopTTS } from '@/utils/tts';
import { ApiService } from '@/services/api';

/**
 * Modality badge configuration — maps modality keys to display metadata.
 */
const MODALITY_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string; activeClass: string }
> = {
  text: {
    icon: Text,
    label: 'Text',
    activeClass: 'text-slate-600 dark:text-slate-300',
  },
  audio: {
    icon: Mic,
    label: 'Voice',
    activeClass: 'text-teal-600 dark:text-teal-400',
  },
  video: {
    icon: Camera,
    label: 'Face',
    activeClass: 'text-blue-600 dark:text-blue-400',
  },
  keystroke: {
    icon: Keyboard,
    label: 'Keystroke',
    activeClass: 'text-purple-600 dark:text-purple-400',
  },
  history: {
    icon: History,
    label: 'History',
    activeClass: 'text-amber-600 dark:text-amber-400',
  },
};

/**
 * ChatWindow — Calm Intelligence AI Companion Interface.
 * Complete conversation container providing:
 * - Sticky header with assistant identity, connection status, modality indicator badges, and session stress badge
 * - Auto-scrolling message list with SafetyBanner and inline therapeutic intervention panels
 * - Native Web Speech API Text-to-Speech playback for new assistant messages
 * - Footer with stress-adaptive QuickSuggestions and full-featured InputBar
 */
export function ChatWindow() {
  const messages = useStressStore((state) => state.messages);
  const isAiTyping = useStressStore((state) => state.isAiTyping);
  const activeIntervention = useStressStore((state) => state.activeIntervention);
  const activeModalities = useStressStore((state) => state.activeModalities);
  const stressEstimate = useStressStore((state) => state.stressEstimate);
  const isTtsEnabled = useStressStore((state) => state.isTtsEnabled);
  const toggleTts = useStressStore((state) => state.toggleTts);
  const language = useStressStore((state) => state.language);
  const { status: wsStatus, sendMultimodalTurn } = useWebSocket();
  const { t } = useTranslation();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollBottomRef = useRef<HTMLDivElement | null>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  const hasInitializedRef = useRef<boolean>(false);

  // Auto-load past chat logs from backend whenever authenticated
  useEffect(() => {
    async function hydrateHistory() {
      if (isAuthenticated) {
        try {
          const logs = await ApiService.getChatHistory();
          if (logs && logs.length > 0) {
            useStressStore.getState().loadChatHistory(logs);
          }
        } catch (err) {
          console.warn('[ChatWindow] Failed to load chat history:', err);
        }
      }
    }
    hydrateHistory();
  }, [isAuthenticated]);

  // Auto-scroll to bottom on new messages, typing state, or intervention change
  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping, activeIntervention]);

  // Record initial messages so existing history is never read aloud on load
  useEffect(() => {
    if (!hasInitializedRef.current) {
      messages.forEach((m) => processedMessageIdsRef.current.add(m.id));
      hasInitializedRef.current = true;
    }
  }, []);

  // Trigger TTS only when a NEW assistant message arrives
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.sender === 'assistant' &&
      !processedMessageIdsRef.current.has(lastMessage.id)
    ) {
      processedMessageIdsRef.current.add(lastMessage.id);

      if (isTtsEnabled && lastMessage.content) {
        playTTS(lastMessage.content, language, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    }
  }, [messages, isTtsEnabled, language]);

  // Clean up any ongoing TTS when ChatWindow unmounts
  useEffect(() => {
    return () => {
      stopTTS();
    };
  }, []);

  const handleSuggestionSelect = (prompt: string) => {
    stopTTS();
    sendMultimodalTurn(prompt);
  };

  // Build the list of active modality keys for the header indicators
  const activeModalityKeys = (
    Object.entries(activeModalities) as [keyof typeof activeModalities, boolean][]
  )
    .filter(([, active]) => active)
    .map(([key]) => key);

  return (
    <div
      className="flex flex-col h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden"
      role="main"
      aria-label={t.chat.assistantTitle}
    >
      {/* ── Sticky Chat Header ────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 shrink-0 gap-3">
        {/* Assistant Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            {/* Online presence dot */}
            <span
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
              aria-label={t.chat.onlineStatus}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {t.chat.assistantTitle}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              {t.chat.assistantSubtitle}
            </p>
          </div>
        </div>

        {/* Header Badges: Modalities + TTS Toggle + Connection + Stress */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          {/* Active Modality Indicator Badges */}
          {activeModalityKeys.map((key) => {
            const meta = MODALITY_META[key];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <div
                key={key}
                title={`${meta.label} signal active`}
                className={`hidden sm:flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 ${meta.activeClass}`}
              >
                <Icon className="h-3 w-3" />
                {meta.label}
              </div>
            );
          })}

          {/* Voice Response Toggle / Stop Audio Button */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) {
                stopTTS();
                setIsSpeaking(false);
              } else {
                toggleTts();
              }
            }}
            title={
              isSpeaking
                ? 'Stop voice playback'
                : isTtsEnabled
                ? 'Voice Responses On (Click to Mute)'
                : 'Voice Responses Off (Click to Enable)'
            }
            aria-label={
              isSpeaking
                ? 'Stop voice playback'
                : isTtsEnabled
                ? 'Voice Responses On'
                : 'Voice Responses Off'
            }
            className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
              isSpeaking
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                : isTtsEnabled
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70'
            }`}
          >
            {isSpeaking ? (
              <>
                <Square className="h-2.5 w-2.5 fill-current" />
                <span>Stop Voice</span>
              </>
            ) : isTtsEnabled ? (
              <>
                <Volume2 className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">Voice On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3 w-3 text-slate-400" />
                <span className="hidden sm:inline">Voice Off</span>
              </>
            )}
          </button>

          {/* Stress Level Badge */}
          <Badge
            variant={
              stressEstimate.level === 'low'
                ? 'success'
                : stressEstimate.level === 'moderate'
                ? 'warning'
                : 'danger'
            }
            className="text-[10px] px-2.5 py-0.5 font-bold"
          >
            {stressEstimate.level === 'low'
              ? t.ambientStatus.low
              : stressEstimate.level === 'moderate'
              ? t.ambientStatus.moderate
              : t.ambientStatus.high}{' '}
            ({stressEstimate.score}%)
          </Badge>

          {/* Connection Status */}
          <Badge
            variant={
              wsStatus === 'connected' ? 'success' : wsStatus === 'demo' ? 'accent' : 'secondary'
            }
            className="text-[10px] gap-1 px-2.5 py-0.5 font-bold"
          >
            <Radio className="h-2.5 w-2.5" />
            {wsStatus === 'connected'
              ? t.common.connected
              : wsStatus === 'demo'
              ? t.common.demo
              : t.common.connecting}
          </Badge>

          {/* Private Session Indicator */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-800/90 px-3 py-0.5 rounded-full border border-slate-200/70 dark:border-slate-700">
            <Shield className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            <span>{t.common.private}</span>
          </div>
        </div>
      </header>

      {/* ── Messages Scroll Container ─────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3"
        role="log"
        aria-live="polite"
        aria-label={t.chat.conversationAriaLabel}
      >
        {/* Safety Banner (shown when triggered) */}
        <SafetyBanner />

        {/* Message List */}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* AI Typing Indicator */}
        {isAiTyping && <TypingIndicator />}

        {/* Auto-scroll anchor */}
        <div ref={scrollBottomRef} aria-hidden="true" />
      </div>

      {/* ── Footer: Suggestions + Input Bar ──────────────────────────── */}
      <footer className="p-3 sm:p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-t border-slate-200/70 dark:border-slate-800 space-y-2 shrink-0">
        <QuickSuggestions onSelectPrompt={handleSuggestionSelect} />
        <InputBar onSendMessage={sendMultimodalTurn} disabled={isAiTyping} />
      </footer>

      {/* ── Centered Modal Interventions (Overlay z-[100]) ────────────── */}
      <AnimatePresence>
        {activeIntervention === 'breathing' && <BreathingCircle />}
        {activeIntervention === 'grounding' && <GroundingExercise />}
      </AnimatePresence>
    </div>
  );
}
