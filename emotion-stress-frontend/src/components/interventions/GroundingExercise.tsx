'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Hand,
  Volume2,
  Flower2,
  Coffee,
  Check,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStressStore } from '@/store/useStressStore';

interface GroundingStep {
  count: number;
  sense: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  microCopy: string;
  colorToken: {
    bg: string;
    text: string;
    border: string;
    checkBg: string;
    checkText: string;
  };
  items: string[];
}

/**
 * 5-4-3-2-1 Sensory Grounding exercise steps with rich micro-copy,
 * per-step item checkboxes, and soothing per-sense color themes.
 */
const STEPS: GroundingStep[] = [
  {
    count: 5,
    sense: 'See',
    icon: Eye,
    prompt: 'Look around slowly. Name 5 distinct objects you can see right now.',
    microCopy:
      'Take your time — a chair, a window, a shadow, the texture of the wall. Let your eyes rest on each one.',
    colorToken: {
      bg: 'bg-blue-50/80 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200/80 dark:border-blue-900/50',
      checkBg: 'bg-blue-500',
      checkText: 'text-white',
    },
    items: ['Object 1', 'Object 2', 'Object 3', 'Object 4', 'Object 5'],
  },
  {
    count: 4,
    sense: 'Feel',
    icon: Hand,
    prompt: 'Notice 4 physical textures or sensations you can touch right now.',
    microCopy:
      'The fabric of your sleeve, the chair beneath you, the cool surface of the desk, the warmth of your own hands.',
    colorToken: {
      bg: 'bg-teal-50/80 dark:bg-teal-950/40',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-200/80 dark:border-teal-900/50',
      checkBg: 'bg-teal-500',
      checkText: 'text-white',
    },
    items: ['Sensation 1', 'Sensation 2', 'Sensation 3', 'Sensation 4'],
  },
  {
    count: 3,
    sense: 'Hear',
    icon: Volume2,
    prompt: 'Listen carefully. Identify 3 distinct sounds in your environment.',
    microCopy:
      'Your own breath, the hum of a device, traffic outside, bird sounds, or the subtle silence itself.',
    colorToken: {
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/40',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200/80 dark:border-indigo-900/50',
      checkBg: 'bg-indigo-500',
      checkText: 'text-white',
    },
    items: ['Sound 1', 'Sound 2', 'Sound 3'],
  },
  {
    count: 2,
    sense: 'Smell',
    icon: Flower2,
    prompt: 'Identify 2 scents — real or remembered — to anchor your senses.',
    microCopy:
      'The air around you, coffee, your lotion, fresh laundry, or simply recall a comforting scent from memory.',
    colorToken: {
      bg: 'bg-purple-50/80 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200/80 dark:border-purple-900/50',
      checkBg: 'bg-purple-500',
      checkText: 'text-white',
    },
    items: ['Scent 1', 'Scent 2'],
  },
  {
    count: 1,
    sense: 'Taste',
    icon: Coffee,
    prompt: 'Notice 1 taste — sip of water, a mint, or simply acknowledge the absence.',
    microCopy:
      'Take a slow sip of water and notice its coolness. This physical sensation brings you into the present moment.',
    colorToken: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200/80 dark:border-amber-900/50',
      checkBg: 'bg-amber-500',
      checkText: 'text-white',
    },
    items: ['Taste / sensation'],
  },
];

/**
 * GroundingExercise - Centered Sensory Grounding Modal Intervention.
 *
 * Appears dead-center in the viewport with a frosted backdrop overlay (`z-[100]`),
 * completely decoupled from the scroll position of the chat log.
 */
export function GroundingExercise() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<number, Set<number>>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const setIntervention = useStressStore((state) => state.setIntervention);

  const step = STEPS[currentStepIndex];
  const StepIcon = step.icon;

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

  // Get checked set for current step
  const currentChecked = checkedItems[currentStepIndex] ?? new Set<number>();
  const allItemsChecked = currentChecked.size >= step.items.length;

  const toggleItem = (itemIndex: number) => {
    setCheckedItems((prev) => {
      const existing = new Set(prev[currentStepIndex] ?? []);
      if (existing.has(itemIndex)) {
        existing.delete(itemIndex);
      } else {
        existing.add(itemIndex);
      }
      return { ...prev, [currentStepIndex]: existing };
    });
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Overall progress: sum of all checked items / total items across all steps
  const totalItems = STEPS.reduce((sum, s) => sum + s.items.length, 0);
  const totalChecked = Object.values(checkedItems).reduce(
    (sum, set) => sum + set.size,
    0
  );
  const progressPercent = Math.round((totalChecked / totalItems) * 100);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="5-4-3-2-1 Sensory Grounding"
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
        className="relative w-full max-w-lg my-auto overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-6 sm:p-7 border border-indigo-200/80 dark:border-indigo-900/60 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                5-4-3-2-1 Sensory Grounding
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Anchor your nervous system in the present moment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIntervention('none')}
            aria-label="Close grounding exercise"
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!isCompleted ? (
          <div className="space-y-4">
            {/* Overall Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>
                  Step {currentStepIndex + 1} of {STEPS.length}
                </span>
                <span>{progressPercent}% complete</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Step Progress Dots */}
            <div className="flex justify-between items-center px-1">
              {STEPS.map((s, idx) => {
                const stepChecked = checkedItems[idx] ?? new Set();
                const stepDone = stepChecked.size >= s.items.length;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div
                      className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                        idx === currentStepIndex
                          ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400 ring-4 ring-indigo-100 dark:ring-indigo-950'
                          : stepDone
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-300 dark:border-slate-700 bg-transparent'
                      }`}
                    />
                    <span className="text-[9px] font-mono font-bold text-slate-400">{s.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Active Step Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className={`rounded-2xl p-4 border ${step.colorToken.bg} ${step.colorToken.border} space-y-3`}
              >
                {/* Step Header */}
                <div className="flex items-start gap-2.5">
                  <div className={`rounded-xl p-2 bg-white/80 dark:bg-slate-900/80 shadow-2xs ${step.colorToken.text}`}>
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${step.colorToken.text}`}
                    >
                      Step {currentStepIndex + 1} of {STEPS.length} — {step.count} Things You Can{' '}
                      {step.sense}
                    </span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      {step.prompt}
                    </p>
                  </div>
                </div>

                {/* Soothing Micro-copy */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-indigo-300/60 dark:border-indigo-700/60 pl-2.5">
                  {step.microCopy}
                </p>

                {/* Per-Item Checklist */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5">
                  {step.items.map((item, itemIdx) => {
                    const isChecked = currentChecked.has(itemIdx);
                    return (
                      <button
                        key={itemIdx}
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        onClick={() => toggleItem(itemIdx)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all duration-150 cursor-pointer ${
                          isChecked
                            ? `${step.colorToken.checkBg} ${step.colorToken.checkText} border-transparent shadow-xs font-semibold`
                            : 'bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/70 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all ${
                            isChecked
                              ? 'border-transparent bg-white/30'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="h-2.5 w-2.5" />}
                        </span>
                        <span className="text-left leading-tight text-[11px]">{item}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {allItemsChecked
                  ? 'All noticed! Move to the next sense.'
                  : 'Check each item as you observe it.'}
              </span>
              <Button
                size="sm"
                onClick={handleNext}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs shadow-xs font-bold cursor-pointer"
              >
                {currentStepIndex === STEPS.length - 1 ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Finish Grounding
                  </>
                ) : (
                  <>
                    Next Sense
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Completion Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="py-6 text-center space-y-3"
          >
            <div className="inline-flex rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 p-3.5 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Check className="h-7 w-7" />
            </div>
            <h5 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Grounding Complete ✓
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              You have re-anchored your senses in the present moment. The present is safe. Notice how your
              body feels right now.
            </p>
            <Button
              size="sm"
              variant="default"
              onClick={() => setIntervention('none')}
              className="rounded-xl mt-3 text-xs font-bold cursor-pointer"
            >
              Return to Conversation
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
