'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStressStore } from '@/store/useStressStore';
import { StressLevel } from '@/types';

/**
 * Maps continuous stress score (0 - 2.0 scale) and percentage (0 - 100%) to clinical tier metadata.
 * Tiers:
 * - Low Stress (<= 0.65)
 * - Moderate Stress (0.65 - 1.30)
 * - High Stress (> 1.30)
 */
function getStressTier(scorePct: number): {
  level: StressLevel;
  rawScore: number;
  label: string;
  badgeVariant: 'success' | 'warning' | 'danger';
  colorHex: string;
  bgLightHex: string;
  strokeClass: string;
  description: string;
} {
  // Map 0-100% to 0.0 - 2.0 scale
  const rawScore = Number(((scorePct / 100) * 2.0).toFixed(2));

  if (rawScore <= 0.65) {
    return {
      level: 'low',
      rawScore,
      label: 'Low Stress',
      badgeVariant: 'success',
      colorHex: '#10b981', // Emerald 500
      bgLightHex: '#d1fae5',
      strokeClass: 'text-emerald-500',
      description: 'Physiological and behavioral signals indicate calm emotional equilibrium.',
    };
  } else if (rawScore <= 1.3) {
    return {
      level: 'moderate',
      rawScore,
      label: 'Moderate Stress',
      badgeVariant: 'warning',
      colorHex: '#f59e0b', // Amber 500
      bgLightHex: '#fef3c7',
      strokeClass: 'text-amber-500',
      description: 'Elevated cognitive load or physical tension detected. Gentle pacing suggested.',
    };
  } else {
    return {
      level: 'high',
      rawScore,
      label: 'High Stress',
      badgeVariant: 'danger',
      colorHex: '#f43f5e', // Rose 500
      bgLightHex: '#ffe4e6',
      strokeClass: 'text-rose-500',
      description: 'Marked distress markers observed. Supportive grounding exercises recommended.',
    };
  }
}

/**
 * StressGauge Component - Phase 3 Visualizer
 * Provides an animated SVG circular gauge displaying continuous stress metric (0-2.0 index & percentage),
 * confidence rating, directional trend, and non-clinical ethics disclaimer.
 */
export function StressGauge() {
  const stressEstimate = useStressStore((state) => state.stressEstimate);

  const tier = getStressTier(stressEstimate.score);
  const confidencePercent = Math.round((stressEstimate.confidence || 0.85) * 100);

  // SVG Gauge Math (Semi-arc representation)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  // Use 75% sweep (270 degrees) for open arc look
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (stressEstimate.score / 100) * arcLength;

  const renderTrendIcon = () => {
    switch (stressEstimate.trend) {
      case 'increasing':
        return (
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            Increasing
          </span>
        );
      case 'decreasing':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingDown className="h-3.5 w-3.5" />
            Decreasing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
            <Minus className="h-3.5 w-3.5" />
            Stable
          </span>
        );
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-sm font-semibold">Estimated Stress State</CardTitle>
          </div>
          <Badge variant={tier.badgeVariant}>
            {tier.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Animated Radial Gauge Container */}
        <div className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
          <div className="relative h-32 w-32 flex items-center justify-center">
            <svg className="h-32 w-32 -rotate-135" viewBox="0 0 120 120">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth="9"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
                className="stroke-slate-200 dark:stroke-slate-700/80"
              />
              {/* Dynamic Animated Value Fill */}
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                strokeWidth="9"
                stroke={tier.colorHex}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: arcLength }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>

            {/* Central Score Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
                {tier.rawScore}
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                Index ({stressEstimate.score}%)
              </span>
            </div>
          </div>

          {/* Metric Sub-bar: Confidence & Trend */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Confidence</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {confidencePercent}%
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Trend</span>
              <div className="text-xs">{renderTrendIcon()}</div>
            </div>
          </div>
        </div>

        {/* 3-Tier Multi-Segment Calibrated Legend */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <span>Low (≤0.65)</span>
            <span>Moderate (0.66–1.30)</span>
            <span>High (&gt;1.30)</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 h-2">
            <div
              className={`rounded-full transition-all duration-300 ${
                tier.rawScore <= 0.65
                  ? 'bg-emerald-500 ring-2 ring-emerald-400/40 shadow-xs'
                  : 'bg-emerald-500/30 dark:bg-emerald-500/20'
              }`}
            />
            <div
              className={`rounded-full transition-all duration-300 ${
                tier.rawScore > 0.65 && tier.rawScore <= 1.3
                  ? 'bg-amber-500 ring-2 ring-amber-400/40 shadow-xs'
                  : 'bg-amber-500/30 dark:bg-amber-500/20'
              }`}
            />
            <div
              className={`rounded-full transition-all duration-300 ${
                tier.rawScore > 1.3
                  ? 'bg-rose-500 ring-2 ring-rose-400/40 shadow-xs'
                  : 'bg-rose-500/30 dark:bg-rose-500/20'
              }`}
            />
          </div>
        </div>

        {/* Ethical Non-Clinical Disclaimer Badge */}
        <div className="flex items-start gap-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-2.5 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
          <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong className="font-semibold text-slate-800 dark:text-slate-200">Estimated Metric:</strong>{' '}
            Derived from multimodal behavioral cues for mindful self-reflection. Not a clinical psychological diagnosis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
