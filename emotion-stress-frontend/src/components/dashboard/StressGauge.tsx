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
 */
function getStressTier(scorePct: number): {
  level: StressLevel;
  rawScore: number;
  label: string;
  badgeVariant: 'success' | 'warning' | 'danger';
  colorHex: string;
  description: string;
} {
  const rawScore = Number(((scorePct / 100) * 2.0).toFixed(2));

  if (rawScore <= 0.65) {
    return {
      level: 'low',
      rawScore,
      label: 'Low Stress',
      badgeVariant: 'success',
      colorHex: '#10b981', // Emerald 500
      description: 'Physiological and behavioral signals indicate calm emotional equilibrium.',
    };
  } else if (rawScore <= 1.3) {
    return {
      level: 'moderate',
      rawScore,
      label: 'Moderate Stress',
      badgeVariant: 'warning',
      colorHex: '#f59e0b', // Amber 500
      description: 'Elevated cognitive load or physical tension detected. Gentle pacing suggested.',
    };
  } else {
    return {
      level: 'high',
      rawScore,
      label: 'High Stress',
      badgeVariant: 'danger',
      colorHex: '#f43f5e', // Rose 500
      description: 'Marked distress markers observed. Supportive grounding exercises recommended.',
    };
  }
}

/**
 * StressGauge — Polar SVG Emotional Stress State Visualizer.
 * Displays normalized stress metric (0–2.0 index & percentage),
 * confidence rating, directional trend, and non-clinical ethics disclaimer.
 */
export function StressGauge() {
  const stressEstimate = useStressStore((state) => state.stressEstimate);

  const tier = getStressTier(stressEstimate.score);
  const confidencePercent = Math.round((stressEstimate.confidence || 0.85) * 100);

  // SVG Gauge Math (180-degree sweep from PI to 0)
  const radius = 54;
  const cx = 80;
  const cy = 72;
  const strokeWidth = 10;

  // Calculate needle rotation angle (-90deg at 0% to +90deg at 100%)
  const angleDeg = -90 + (stressEstimate.score / 100) * 180;

  const renderTrendIcon = () => {
    switch (stressEstimate.trend) {
      case 'increasing':
        return (
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            Increasing
          </span>
        );
      case 'decreasing':
        return (
          <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
            <TrendingDown className="h-3.5 w-3.5" />
            Decreasing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
            <Minus className="h-3.5 w-3.5" />
            Stable
          </span>
        );
    }
  };

  return (
    <Card className="border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Activity className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-bold">Estimated Stress State</CardTitle>
          </div>
          <Badge variant={tier.badgeVariant} className="font-bold px-2.5 py-0.5">
            {tier.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex flex-col items-center">
        {/* SVG Half Gauge */}
        <div className="relative flex flex-col items-center justify-center -mb-2">
          <svg width="160" height="96" viewBox="0 0 160 96" className="overflow-visible">
            <defs>
              <linearGradient id="stressGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 26 72 A 54 54 0 0 1 134 72"
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="text-slate-100 dark:text-slate-800"
            />

            {/* Active Stress Arc */}
            <path
              d="M 26 72 A 54 54 0 0 1 134 72"
              fill="none"
              stroke="url(#stressGaugeGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={Math.PI * radius}
              strokeDashoffset={Math.PI * radius * (1 - stressEstimate.score / 100)}
              className="transition-all duration-700 ease-out"
            />

            {/* Center Pivot Point */}
            <circle cx={cx} cy={cy} r="5" className="fill-slate-700 dark:fill-slate-200 shadow-md" />
            <circle cx={cx} cy={cy} r="2.5" className="fill-white dark:fill-slate-900" />
          </svg>

          {/* Value Display */}
          <div className="flex flex-col items-center -mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                {stressEstimate.score}%
              </span>
              <span className="text-xs font-semibold text-slate-400">
                ({tier.rawScore.toFixed(2)} / 2.0)
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Somatic Stress Index
            </p>
          </div>
        </div>

        {/* Telemetry Metrics Strip */}
        <div className="w-full mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col items-start p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 font-semibold">Directional Trend</span>
            <div className="mt-0.5">{renderTrendIcon()}</div>
          </div>

          <div className="flex flex-col items-start p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 font-semibold">Model Confidence</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
              {confidencePercent}%
            </span>
          </div>
        </div>

        {/* Clinical Disclaimer Footnote */}
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Non-clinical research estimate calculated from multimodal signals.</span>
        </div>
      </CardContent>
    </Card>
  );
}
