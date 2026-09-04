'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Info, Mic, Camera, Keyboard, Wind, Sparkles, Phone, Volume2, Square } from 'lucide-react';
import { Message, InterventionType } from '@/types';
import { formatTime, cn } from '@/lib/utils';
import { useStressStore } from '@/store/useStressStore';
import { GraphemeTypewriter } from '@/components/chat/GraphemeTypewriter';
import { playTTS, stopTTS } from '@/utils/tts';

export interface MessageBubbleProps {
  message: Message;
}

/**
 * Quick-action chip rendered beneath assistant messages that carry a suggestedAction.
 * Maps InterventionType to an appropriate label, icon, and store action.
 */
function SuggestedActionChip({ action }: { action: InterventionType }) {
  const setIntervention = useStressStore((state) => state.setIntervention);

  if (action === 'none') return null;

  const chipMeta: Record<
    Exclude<InterventionType, 'none'>,
    { label: string; icon: React.ReactNode; className: string; onClick: () => void }
  > = {
    breathing: {
      label: 'Try Box Breathing',
      icon: <Wind className="h-3 w-3" />,
      className:
        'bg-teal-50 text-teal-700 border-teal-200/80 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-900/60',
      onClick: () => setIntervention('breathing'),
    },
    grounding: {
      label: '5-4-3-2-1 Grounding',
      icon: <Sparkles className="h-3 w-3" />,
      className:
        'bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/60',
      onClick: () => setIntervention('grounding'),
    },
    safety: {
      label: 'View Crisis Helplines',
      icon: <Phone className="h-3 w-3" />,
      className:
        'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60',
      onClick: () => setIntervention('safety'),
    },
  };

  const meta = chipMeta[action as Exclude<InterventionType, 'none'>];
  if (!meta) return null;

  return (
    <button
      type="button"
      onClick={meta.onClick}
      className={cn(
        'mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 shadow-2xs cursor-pointer',
        meta.className
      )}
    >
      {meta.icon}
      {meta.label}
    </button>
  );
}

/**
 * MessageBubble — Calm Intelligence Chat Bubble.
 *
 * Features:
 * - Distinct, high-legibility bubble styling for Assistant, User, and System messages
 * - Preserved `GraphemeTypewriter` for Unicode-safe Sinhala/Tamil/English rendering
 * - Modality attribution badges (Mic, Camera, Keystroke)
 * - TTS speech playback with animated audio indicators
 * - Non-intrusive stress snapshot annotations and quick-action intervention chips
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.sender === 'assistant';
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  const language = useStressStore((state) => state.language);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleSpeech = () => {
    if (isPlaying) {
      stopTTS();
      setIsPlaying(false);
    } else {
      playTTS(message.content, language, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  // --- System messages: centered informational pill ---
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center py-1.5"
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 shadow-2xs">
          <Info className="h-3 w-3 shrink-0 text-teal-500" />
          <span>{message.content}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex items-start gap-3 py-2', isUser ? 'justify-end' : 'justify-start')}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white mt-1 shadow-md border border-teal-400/30"
          aria-hidden="true"
        >
          <Bot className="h-4.5 w-4.5" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={cn(
          'flex flex-col max-w-[88%] sm:max-w-[78%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Main Content Bubble */}
        <div
          className={cn(
            'px-4.5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-sm transition-all',
            isUser
              ? 'bg-gradient-to-tr from-teal-600 via-cyan-600 to-blue-600 text-white rounded-tr-xs shadow-md'
              : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80 shadow-md'
          )}
        >
          <GraphemeTypewriter text={message.content} />
        </div>

        {/* Suggested Action Quick-Action Chip (Assistant only) */}
        {isAssistant && message.stressSnapshot && message.stressSnapshot.level !== 'low' && (
          <SuggestedActionChip
            action={
              message.stressSnapshot.level === 'high' ? 'safety' : 'breathing'
            }
          />
        )}

        {/* Footer: Timestamp, Stress Snapshot, Active Modality Icons */}
        <div
          className={cn(
            'flex items-center gap-2 mt-1.5 px-1.5 text-[10px] text-slate-500 dark:text-slate-400',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span suppressHydrationWarning className="tabular-nums font-medium">
            {formatTime(message.timestamp)}
          </span>

          {/* TTS Speaker Play/Stop Button for Assistant Messages */}
          {isAssistant && message.content && (
            <button
              type="button"
              onClick={handleToggleSpeech}
              title={isPlaying ? 'Stop speaking' : 'Listen to this response'}
              aria-label={isPlaying ? 'Stop speaking' : 'Listen to this response'}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-semibold'
                  : 'hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="h-2.5 w-2.5 fill-current animate-pulse" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3" />
                  <span>Listen</span>
                </>
              )}
            </button>
          )}

          {/* Stress snapshot indicator on assistant messages */}
          {isAssistant && message.stressSnapshot && (
            <span
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border',
                message.stressSnapshot.level === 'low' &&
                  'bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/40 dark:text-teal-300',
                message.stressSnapshot.level === 'moderate' &&
                  'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300',
                message.stressSnapshot.level === 'high' &&
                  'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300'
              )}
            >
              Stress {Math.round(message.stressSnapshot.score)}%
            </span>
          )}

          {/* Active modality indicator icons on user messages */}
          {isUser && message.activeModalities && (
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
              {message.activeModalities.audio && (
                <span title="Audio turn (SER + STT)">
                  <Mic className="h-3 w-3 text-teal-500" />
                </span>
              )}
              {message.activeModalities.video && (
                <span title="Video turn (DenseNet FER)">
                  <Camera className="h-3 w-3 text-blue-500" />
                </span>
              )}
              {message.activeModalities.keystroke && (
                <span title="Keystroke dynamics active">
                  <Keyboard className="h-3 w-3 text-purple-500" />
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
