'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Play, Pause, X, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStressStore } from '@/store/useStressStore';

type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';
type BreathingMode = 'box' | '478';

/**
 * Phase durations for each supported breathing technique.
 * Box Breathing: 4-4-4-4 (Inhale, Hold, Exhale, Rest)
 * 4-7-8 Relaxing Breath: 4-7-8-0 (Inhale, Hold, Exhale, no rest pause)
 */
const MODE_DURATIONS: Record<BreathingMode, Record<BreathPhase, number>> = {
  box: { Inhale: 4, Hold: 4, Exhale: 4, Rest: 4 },
  '478': { Inhale: 4, Hold: 7, Exhale: 8, Rest: 0 },
};

const MODE_LABELS: Record<BreathingMode, { title: string; description: string; tag: string }> = {
  box: {
    title: 'Box Breathing',
    description: '4-4-4-4 pattern used by military and first responders for acute stress regulation.',
    tag: '4-4-4',
  },
  '478': {
    title: '4-7-8 Relaxing Breath',
    description: 'Dr. Andrew Weil\'s technique for nervous system down-regulation and anxiety relief.',
    tag: '4-7-8',
  },
};

const PHASE_INSTRUCTIONS: Record<BreathPhase, string> = {
  Inhale: 'Breathe in slowly and deeply through your nose...',
  Hold: 'Hold your breath gently in calm stillness...',
  Exhale: 'Release all breath slowly through your mouth...',
  Rest: 'Rest and pause before the next cycle begins...',
};

const PHASE_COLORS: Record<BreathPhase, { text: string; ring: string; glow: string }> = {
  Inhale: {
    text: 'text-teal-600 dark:text-teal-300',
    ring: 'ring-teal-400/50',
    glow: 'bg-teal-400/25',
  },
  Hold: {
    text: 'text-blue-600 dark:text-blue-300',
    ring: 'ring-blue-400/50',
    glow: 'bg-blue-400/25',
  },
  Exhale: {
    text: 'text-indigo-600 dark:text-indigo-300',
    ring: 'ring-indigo-400/50',
    glow: 'bg-indigo-400/25',
  },
  Rest: {
    text: 'text-slate-500 dark:text-slate-400',
    ring: 'ring-slate-300/40',
    glow: 'bg-slate-400/15',
  },
};

/**
 * BreathingCircle - Centered Somatic Modal Intervention.
 *
 * Appears dead-center in the viewport with a frosted backdrop overlay (`z-[100]`),
 * completely decoupled from the scroll position of the chat log.
 */
export function BreathingCircle() {
  const setIntervention = useStressStore((state) => state.setIntervention);

  const [mode, setMode] = useState<BreathingMode>('box');
  const [isActive, setIsActive] = useState(true);
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);

  const durations = MODE_DURATIONS[mode];

  // Lock body scroll and handle Escape key for modal dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIntervention('none');
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIntervention]);

  /** Advance to the next breath phase in sequence */
  const advancePhase = useCallback(
    (currentPhase: BreathPhase): BreathPhase => {
      if (currentPhase === 'Inhale') return 'Hold';
      if (currentPhase === 'Hold') return 'Exhale';
      if (currentPhase === 'Exhale') {
        // Skip Rest phase for 4-7-8 (duration = 0)
        return durations.Rest === 0 ? 'Inhale' : 'Rest';
      }
      return 'Inhale';
    },
    [durations.Rest]
  );

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setPhase((currentPhase) => {
            const next = advancePhase(currentPhase);
            if (next === 'Inhale' && currentPhase !== 'Inhale') {
              setCompletedCycles((c) => c + 1);
            }
            setSecondsLeft(durations[next]);
            return next;
          });
          return durations[advancePhase(phase)];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, durations, advancePhase]);

  // Switch mode — reset state
  const handleModeChange = (newMode: BreathingMode) => {
    setMode(newMode);
    setPhase('Inhale');
    setSecondsLeft(MODE_DURATIONS[newMode].Inhale);
    setCompletedCycles(0);
    setIsActive(true);
  };

  const handleReset = () => {
    setPhase('Inhale');
    setSecondsLeft(durations.Inhale);
    setCompletedCycles(0);
    setIsActive(true);
  };

  // Circle scale: expand on Inhale/Hold, contract on Exhale/Rest
  const circleScale =
    phase === 'Inhale' || phase === 'Hold'
      ? 1.32
      : 0.82;

  const colors = PHASE_COLORS[phase];
  const modeInfo = MODE_LABELS[mode];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={modeInfo.title}
    >
      {/* Click backdrop to dismiss */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => setIntervention('none')}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="relative w-full max-w-md my-auto overflow-hidden rounded-3xl bg-gradient-to-b from-teal-50/95 via-blue-50/90 to-slate-50 dark:from-slate-900/95 dark:via-slate-900/95 dark:to-slate-950 p-6 sm:p-7 border border-teal-200/80 dark:border-teal-900/60 shadow-2xl text-center"
      >
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-300">
              <Wind className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {modeInfo.title}
            </h4>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-teal-100/80 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
              {modeInfo.tag}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIntervention('none')}
            aria-label="Close breathing exercise"
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Selector Pills */}
        <div className="flex justify-center gap-2 mb-5">
          {(Object.keys(MODE_LABELS) as BreathingMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              aria-pressed={mode === m}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                mode === m
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
              }`}
            >
              {MODE_LABELS[m].tag}
            </button>
          ))}
        </div>

        {/* Animated Breathing Circle */}
        <div className="py-4 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center h-48 w-48">
            {/* Pulsing Outer Glow */}
            <motion.div
              animate={{ scale: circleScale * 1.18, opacity: isActive ? 0.35 : 0.08 }}
              transition={{ duration: 3.8, ease: 'easeInOut' }}
              className={`absolute h-40 w-40 rounded-full blur-xl ${colors.glow}`}
            />

            {/* Primary Animated Circle */}
            <motion.div
              animate={{ scale: circleScale }}
              transition={{ duration: 3.8, ease: 'easeInOut' }}
              className={`h-36 w-36 rounded-full bg-gradient-to-tr from-teal-500 to-blue-500 shadow-xl flex flex-col items-center justify-center text-white select-none ring-4 ${colors.ring}`}
            >
              <span className="text-2xl font-bold tracking-tight font-mono leading-none">
                {secondsLeft}s
              </span>
              <span className="text-xs uppercase tracking-widest font-bold opacity-90 mt-1">
                {phase}
              </span>
            </motion.div>
          </div>

          {/* Phase Instruction & Cycle Counter */}
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className={`mt-4 text-xs font-medium max-w-xs h-6 ${colors.text}`}
            >
              {PHASE_INSTRUCTIONS[phase]}
            </motion.p>
          </AnimatePresence>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            Completed cycles: <span className="font-semibold font-mono text-slate-700 dark:text-slate-300">{completedCycles}</span>
          </p>
        </div>

        {/* Technique Description */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mb-5 max-w-xs mx-auto">
          {modeInfo.description}
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsActive((a) => !a)}
            aria-label={isActive ? 'Pause breathing exercise' : 'Resume breathing exercise'}
            className="rounded-xl px-3 gap-1.5 text-xs cursor-pointer"
          >
            {isActive ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                Resume
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            aria-label="Reset breathing exercise"
            className="rounded-xl px-3 gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </Button>

          <Button
            size="sm"
            variant="accent"
            onClick={() => setIntervention('none')}
            className="rounded-xl px-4 text-xs gap-1.5 cursor-pointer font-bold shadow-sm"
          >
            <Check className="h-3.5 w-3.5" />
            I Feel Calmer
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
