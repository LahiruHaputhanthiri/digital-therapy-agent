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
        'mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 shadow-2xs cursor-pointer',
        meta.className
      )}
    >
      {meta.icon}
      {meta.label}
    </button>
  );
}

/**
 * MessageBubble - Phase 4 Chat Interface
 * Renders User, Assistant, and System conversation messages with:
 * - Distinct, accessible bubble styling per sender
 * - Timestamp and active modality indicator icons
 * - Optional quick-action chips for suggested therapeutic interventions
 * - Non-intrusive stress snapshot annotations on assistant messages
 * - System message styled as centered informational card
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

  // --- System messages: centered informational strip ---
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center py-1"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="h-3 w-3 shrink-0 text-blue-500" />
          <span>{message.content}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn('flex items-start gap-3 py-1.5', isUser ? 'justify-end' : 'justify-start')}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mt-1 shadow-xs border border-blue-200/50 dark:border-blue-800/50"
          aria-hidden="true"
        >
          <Bot className="h-4 w-4" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={cn(
          'flex flex-col max-w-[85%] sm:max-w-[75%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Main Content Bubble */}
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs',
            isUser
              ? 'bg-blue-600 text-white rounded-tr-xs dark:bg-blue-600 dark:text-white'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80'
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
            'flex items-center gap-2 mt-1.5 px-1 text-[10px] text-slate-500 dark:text-slate-400',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span suppressHydrationWarning className="tabular-nums">
            {formatTime(message.timestamp)}
          </span>

          {/* TTS Speaker Play/Stop Button for Assistant Messages */}
          {isAssistant && message.content && (
            <button
              type="button"
              onClick={handleToggleSpeech}
              title={isPlaying ? 'Stop speaking this response' : 'Listen to this response'}
              aria-label={isPlaying ? 'Stop speaking this response' : 'Listen to this response'}
              className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md text-[10px] transition-colors cursor-pointer ${
                isPlaying
                  ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 font-medium'
                  : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-blue-400'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="h-2.5 w-2.5 fill-current animate-pulse" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-2.5 w-2.5" />
                  <span className="hidden sm:inline">Listen</span>
                </>
              )}
            </button>
          )}

          {/* Stress snapshot annotation on assistant messages */}
          {isAssistant && message.stressSnapshot && (
            <span
              className={cn(
                'flex items-center gap-1 font-medium',
                message.stressSnapshot.level === 'low'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : message.stressSnapshot.level === 'moderate'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              •
              <span>
                {message.stressSnapshot.level === 'low'
                  ? 'Low'
                  : message.stressSnapshot.level === 'moderate'
                  ? 'Moderate'
                  : 'High'}{' '}
                stress est. ({message.stressSnapshot.score}%)
              </span>
            </span>
          )}

          {/* Active Modality Icons on user messages */}
          {isUser && message.activeModalities && (
            <div className="flex items-center gap-1" aria-label="Active signal modalities">
              {message.activeModalities.audio && (
                <span aria-label="Voice signal active">
                  <Mic className="h-3 w-3 text-teal-500 dark:text-teal-400" />
                </span>
              )}
              {message.activeModalities.video && (
                <span aria-label="Facial signal active">
                  <Camera className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                </span>
              )}
              {message.activeModalities.keystroke && (
                <span aria-label="Keystroke dynamics active">
                  <Keyboard className="h-3 w-3 text-purple-500 dark:text-purple-400" />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 mt-1 shadow-xs border border-slate-300/50 dark:border-slate-700/50"
          aria-hidden="true"
        >
          <User className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}
