'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Sparkles, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStressStore } from '@/store/useStressStore';
import { EmotionProbability } from '@/types';

interface EmotionMeta {
  key: keyof EmotionProbability;
  label: string;
  barGradient: string;
  trackBg: string;
}

const SEVEN_EMOTIONS: EmotionMeta[] = [
  {
    key: 'neutral',
    label: 'Neutral / Grounded',
    barGradient: 'from-slate-400 to-slate-500',
    trackBg: 'bg-slate-100 dark:bg-slate-800',
  },
  {
    key: 'joy',
    label: 'Joy / Contentment',
    barGradient: 'from-teal-400 to-emerald-500',
    trackBg: 'bg-teal-50 dark:bg-teal-950/40',
  },
  {
    key: 'sadness',
    label: 'Sadness / Melancholy',
    barGradient: 'from-blue-400 to-indigo-500',
    trackBg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  {
    key: 'fear_anxiety',
    label: 'Fear / Anxiety',
    barGradient: 'from-amber-400 to-orange-500',
    trackBg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    key: 'anger',
    label: 'Anger / Frustration',
    barGradient: 'from-rose-400 to-red-500',
    trackBg: 'bg-rose-50 dark:bg-rose-950/40',
  },
  {
    key: 'surprise',
    label: 'Surprise / Arousal',
    barGradient: 'from-purple-400 to-pink-500',
    trackBg: 'bg-purple-50 dark:bg-purple-950/40',
  },
  {
    key: 'disgust',
    label: 'Disgust / Aversion',
    barGradient: 'from-emerald-500 to-teal-700',
    trackBg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
];

/**
 * EmotionBars — Discrete Affective Spectrum Visualizer.
 * Displays 7 calibrated emotion probability distributions with smooth Framer Motion
 * width transitions, dynamic highlight badges for dominant emotion, and non-clinical guidance.
 */
export function EmotionBars() {
  const emotionProbabilities = useStressStore((state) => state.emotionProbabilities);

  // Compute emotion values with defaults for surprise & disgust
  const emotionEntries = SEVEN_EMOTIONS.map((item) => {
    const value =
      typeof emotionProbabilities[item.key] === 'number'
        ? emotionProbabilities[item.key]!
        : item.key === 'surprise'
        ? 8
        : item.key === 'disgust'
        ? 4
        : 0;
    return {
      ...item,
      value,
    };
  });

  // Identify highest emotion
  const highestEmotion = [...emotionEntries].sort((a, b) => b.value - a.value)[0];

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Smile className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-bold">Emotion Distribution</CardTitle>
          </div>
          {highestEmotion && (
            <Badge variant="accent" className="text-[10px] gap-1 py-0.5 px-2.5 font-bold">
              <Award className="h-3 w-3 text-teal-500" />
              Dominant: {highestEmotion.label.split('/')[0].trim()} ({highestEmotion.value}%)
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-1">
        {/* 7 Discrete Emotion Calibrated Progress Bars */}
        <div className="space-y-2.5">
          {emotionEntries.map((item) => {
            const isDominant = item.key === highestEmotion?.key;

            return (
              <div key={item.key} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                    {isDominant && (
                      <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.2 rounded-md">
                        Leading
                      </span>
                    )}
                  </div>
                  <span
                    className={`tabular-nums font-bold text-[11px] ${
                      isDominant
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.value}%
                  </span>
                </div>

                {/* Animated Gradient Bar */}
                <div
                  className={`h-2.5 w-full rounded-full overflow-hidden ${item.trackBg} shadow-inner`}
                >
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${item.barGradient} ${
                      isDominant ? 'shadow-xs' : ''
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(item.value, 100)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote */}
        <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
          <span>Fused neural probability distribution</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">DenseNet + SER</span>
        </div>
      </CardContent>
    </Card>
  );
}
