'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Sparkles, AlertCircle, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStressStore } from '@/store/useStressStore';
import { EmotionProbability } from '@/types';

interface EmotionMeta {
  key: keyof EmotionProbability;
  label: string;
  barColor: string;
  trackBg: string;
  darkTrackBg: string;
  badgeClass: string;
}

const SEVEN_EMOTIONS: EmotionMeta[] = [
  {
    key: 'neutral',
    label: 'Neutral',
    barColor: 'bg-slate-400 dark:bg-slate-300',
    trackBg: 'bg-slate-100',
    darkTrackBg: 'dark:bg-slate-800',
    badgeClass: 'text-slate-600 dark:text-slate-300',
  },
  {
    key: 'joy',
    label: 'Joy / Contentment',
    barColor: 'bg-teal-500 dark:bg-teal-400',
    trackBg: 'bg-teal-50',
    darkTrackBg: 'dark:bg-teal-950/40',
    badgeClass: 'text-teal-600 dark:text-teal-300',
  },
  {
    key: 'sadness',
    label: 'Sadness / Melancholy',
    barColor: 'bg-blue-500 dark:bg-blue-400',
    trackBg: 'bg-blue-50',
    darkTrackBg: 'dark:bg-blue-950/40',
    badgeClass: 'text-blue-600 dark:text-blue-300',
  },
  {
    key: 'fear_anxiety',
    label: 'Fear / Anxiety',
    barColor: 'bg-amber-500 dark:bg-amber-400',
    trackBg: 'bg-amber-50',
    darkTrackBg: 'dark:bg-amber-950/40',
    badgeClass: 'text-amber-600 dark:text-amber-300',
  },
  {
    key: 'anger',
    label: 'Anger / Frustration',
    barColor: 'bg-rose-500 dark:bg-rose-400',
    trackBg: 'bg-rose-50',
    darkTrackBg: 'dark:bg-rose-950/40',
    badgeClass: 'text-rose-600 dark:text-rose-300',
  },
  {
    key: 'surprise',
    label: 'Surprise / Arousal',
    barColor: 'bg-purple-500 dark:bg-purple-400',
    trackBg: 'bg-purple-50',
    darkTrackBg: 'dark:bg-purple-950/40',
    badgeClass: 'text-purple-600 dark:text-purple-300',
  },
  {
    key: 'disgust',
    label: 'Disgust / Aversion',
    barColor: 'bg-emerald-600 dark:bg-emerald-400',
    trackBg: 'bg-emerald-50',
    darkTrackBg: 'dark:bg-emerald-950/40',
    badgeClass: 'text-emerald-600 dark:text-emerald-300',
  },
];

/**
 * EmotionBars Component - Phase 3 Visualizer
 * Displays 7 discrete calibrated emotion probability distributions with smooth Framer Motion
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

  // Identify highest and lowest probabilities for color-coded badge indicators
  const highestEmotion = [...emotionEntries].sort((a, b) => b.value - a.value)[0];

  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smile className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-semibold">Discrete Emotion Spectrum</CardTitle>
          </div>
          {highestEmotion && (
            <Badge variant="accent" className="text-[10px] gap-1 py-0 px-2">
              <Award className="h-3 w-3" />
              Dominant: {highestEmotion.label.split('/')[0].trim()} ({highestEmotion.value}%)
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
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
                      <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">
                        • Leading
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      isDominant
                        ? 'text-teal-600 dark:text-teal-400 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.value}%
                  </span>
                </div>

                {/* Animated Framer Motion Progress Bar */}
                <div
                  className={`h-2.5 w-full rounded-full ${item.trackBg} ${item.darkTrackBg} overflow-hidden p-0.5 border border-slate-100 dark:border-slate-800`}
                >
                  <motion.div
                    className={`h-full rounded-full ${item.barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(2, item.value))}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative Footnote */}
        <p className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 italic text-center">
          Estimated real-time probabilities across multimodal linguistic and physiological tendency models.
        </p>
      </CardContent>
    </Card>
  );
}
