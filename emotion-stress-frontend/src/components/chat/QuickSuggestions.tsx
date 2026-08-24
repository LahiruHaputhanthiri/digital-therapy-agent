'use client';

import React from 'react';
import { Sparkles, Wind, Anchor, Phone, Heart, Feather, ArrowRight } from 'lucide-react';
import { useStressStore } from '@/store/useStressStore';
import { useTranslation } from '@/locales';

export interface QuickSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

/**
 * QuickSuggestions - Bilingual Stress-Adaptive Prompt Chips
 * Renders prompts in English or Sinhala depending on current language selection.
 */
export function QuickSuggestions({ onSelectPrompt }: QuickSuggestionsProps) {
  const stressLevel = useStressStore((state) => state.stressEstimate.level);
  const setIntervention = useStressStore((state) => state.setIntervention);
  const { t } = useTranslation();

  const chips = t.suggestions[stressLevel] ?? t.suggestions.low;

  // Icon mapping for suggestion chips based on index/topic
  const chipIcons = [
    <Heart key="heart" className="h-3 w-3" />,
    <Feather key="feather" className="h-3 w-3" />,
    <Sparkles key="sparkles" className="h-3 w-3" />,
    <Wind key="wind" className="h-3 w-3" />,
  ];

  return (
    <div
      className="flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 scrollbar-none"
      role="group"
      aria-label="Quick conversation prompts"
    >
      {/* Label */}
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-blue-500" aria-hidden="true" />
        {stressLevel === 'high'
          ? t.suggestions.supportLabel
          : stressLevel === 'moderate'
          ? t.suggestions.suggestionsLabel
          : t.suggestions.exploreLabel}
      </span>

      {/* Breathing shortcut — visible when stress is moderate/high */}
      {stressLevel !== 'low' && (
        <button
          type="button"
          onClick={() => setIntervention('breathing')}
          aria-label={t.suggestions.boxBreathingAction}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200/80 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-900/60 transition-all duration-150 shadow-2xs cursor-pointer"
        >
          <Wind className="h-3 w-3" aria-hidden="true" />
          {t.suggestions.boxBreathingAction}
        </button>
      )}

      {/* Grounding shortcut — only when high stress */}
      {stressLevel === 'high' && (
        <button
          type="button"
          onClick={() => setIntervention('grounding')}
          aria-label={t.suggestions.groundingAction}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/60 transition-all duration-150 shadow-2xs cursor-pointer"
        >
          <Anchor className="h-3 w-3" aria-hidden="true" />
          {t.suggestions.groundingAction}
        </button>
      )}

      {/* Adaptive Prompt Chips */}
      {chips.map((chip, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelectPrompt(chip.prompt)}
          aria-label={`Send prompt: ${chip.label}`}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-slate-100 text-slate-700 border-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700/80 dark:hover:bg-slate-700 transition-all duration-150 shadow-2xs cursor-pointer"
        >
          <span aria-hidden="true">{chipIcons[i % chipIcons.length]}</span>
          <span className="truncate max-w-[240px] sm:max-w-none">{chip.label}</span>
          <ArrowRight className="h-2.5 w-2.5 opacity-40 shrink-0" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
