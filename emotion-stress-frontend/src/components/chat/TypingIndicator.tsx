'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, BrainCircuit } from 'lucide-react';
import { useTranslation } from '@/locales';

/**
 * TypingIndicator - Phase 4 Chat Interface with Bilingual Support
 * Displays a pulsing three-dot animation with an "Assistant is reflecting..." label
 * to signal that the AI is processing and generating a therapeutic response.
 */
export function TypingIndicator() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-start gap-3 py-1.5 justify-start"
      aria-live="polite"
      aria-label={t.chat.reflecting}
    >
      {/* Assistant Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mt-1 shadow-xs border border-blue-200/50 dark:border-blue-800/50">
        <Bot className="h-4 w-4" />
      </div>

      {/* Bubble Container */}
      <div className="flex flex-col gap-1.5 items-start">
        <div className="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 px-4 py-3 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          {/* Three-Dot Bounce Animation */}
          <div className="flex items-center gap-1.5 h-5" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-2 w-2 rounded-full bg-blue-400/80 dark:bg-blue-400"
                animate={{ y: ['0%', '-45%', '0%'] }}
                transition={{
                  duration: 0.75,
                  repeat: Infinity,
                  delay: dot * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>

        {/* Reflective Status Label */}
        <div className="flex items-center gap-1.5 px-1">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BrainCircuit className="h-3 w-3 text-blue-400 dark:text-blue-500" aria-hidden="true" />
          </motion.div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 italic font-medium">
            {t.chat.reflecting}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
