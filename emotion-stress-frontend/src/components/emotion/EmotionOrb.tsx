'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wind, Activity, Heart, Shield } from 'lucide-react';
import { useStressStore } from '@/store/useStressStore';
import { cn } from '@/lib/utils';

export interface EmotionOrbProps {
  /** Size variant for different layout contexts */
  size?: 'sm' | 'md' | 'lg' | 'hero';
  /** Show emotional metrics & status text alongside the orb */
  showDetails?: boolean;
  /** Allow clicking the orb to initiate a calming breathing intervention */
  interactive?: boolean;
  /** Custom className for the container */
  className?: string;
}

/**
 * EmotionOrb — Living Emotion & Stress Intelligence Orb.
 *
 * Visualizes real-time physiological & affective telemetry from `useStressStore`:
 * - Somatic breathing pulsation synchronized to stress levels
 * - Bioluminescent multi-layer gradients shifting across affective states
 * - Interactive biofeedback cues and direct 4-4-4 breathing intervention trigger
 */
export function EmotionOrb({
  size = 'md',
  showDetails = true,
  interactive = true,
  className,
}: EmotionOrbProps) {
  const stressEstimate = useStressStore((state) => state.stressEstimate);
  const emotionProbabilities = useStressStore((state) => state.emotionProbabilities);
  const setIntervention = useStressStore((state) => state.setIntervention);

  const score = stressEstimate?.score ?? 28;
  const level = stressEstimate?.level ?? 'low';
  const trend = stressEstimate?.trend ?? 'stable';

  // Find dominant emotion and its confidence
  const dominantEmotion = useMemo(() => {
    if (!emotionProbabilities) return { name: 'Neutral', confidence: 0.85 };
    let topName = 'Neutral';
    let topVal = 0;
    Object.entries(emotionProbabilities).forEach(([name, val]) => {
      if (typeof val === 'number' && val > topVal) {
        topVal = val;
        topName = name;
      }
    });
    // Format label nicely
    const formatted = topName
      .replace('_', ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { name: formatted, confidence: Math.round(topVal * 100) };
  }, [emotionProbabilities]);

  // Visual state configurations based on real stress score & level
  const stateTheme = useMemo(() => {
    if (score < 35 || level === 'low') {
      return {
        name: 'Calm Sanctuary',
        orbGradient: 'from-teal-400 via-cyan-500 to-blue-600',
        glowColor: 'rgba(20, 184, 166, 0.35)',
        haloColor: 'rgba(6, 182, 212, 0.20)',
        pulseDuration: 9, // Somatic 9-second deep breath
        scaleRange: [1, 1.08, 1.08, 1],
        accentColor: 'text-teal-600 dark:text-teal-300',
        badgeBg: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
        ringColor: 'border-teal-500/30',
      };
    }
    if (score < 65 || level === 'moderate') {
      return {
        name: 'Balanced Focus',
        orbGradient: 'from-cyan-400 via-indigo-500 to-purple-600',
        glowColor: 'rgba(99, 102, 241, 0.35)',
        haloColor: 'rgba(168, 85, 247, 0.20)',
        pulseDuration: 6, // 6-second moderate rhythm
        scaleRange: [1, 1.10, 1.10, 1],
        accentColor: 'text-indigo-600 dark:text-indigo-300',
        badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        ringColor: 'border-indigo-500/30',
      };
    }
    if (score < 80) {
      return {
        name: 'Elevated Energy',
        orbGradient: 'from-amber-400 via-orange-500 to-rose-500',
        glowColor: 'rgba(245, 158, 11, 0.35)',
        haloColor: 'rgba(244, 63, 94, 0.20)',
        pulseDuration: 4.5, // 4.5-second active rhythm
        scaleRange: [1, 1.12, 1.12, 1],
        accentColor: 'text-amber-600 dark:text-amber-300',
        badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        ringColor: 'border-amber-500/30',
      };
    }
    return {
      name: 'High Stress Alert',
      orbGradient: 'from-rose-400 via-pink-500 to-purple-700',
      glowColor: 'rgba(244, 63, 94, 0.40)',
      haloColor: 'rgba(236, 72, 153, 0.25)',
      pulseDuration: 3.5, // Controlled 3.5s grounding beacon
      scaleRange: [1, 1.14, 1.14, 1],
      accentColor: 'text-rose-600 dark:text-rose-300',
      badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
      ringColor: 'border-rose-500/30',
    };
  }, [score, level]);

  // Dimensions by size variant
  const dimensions = {
    sm: { orb: 'w-12 h-12', glow: 'w-20 h-20', font: 'text-xs' },
    md: { orb: 'w-24 h-24', glow: 'w-36 h-36', font: 'text-sm' },
    lg: { orb: 'w-36 h-36', glow: 'w-52 h-52', font: 'text-base' },
    hero: { orb: 'w-48 h-48 sm:w-56 sm:h-56', glow: 'w-72 h-72 sm:w-80 sm:h-80', font: 'text-lg' },
  }[size];

  const handleOrbClick = () => {
    if (!interactive) return;
    setIntervention('breathing');
  };

  return (
    <div className={cn('flex flex-col items-center justify-center select-none', className)}>
      {/* Central Living Orb */}
      <div
        className={cn(
          'relative flex items-center justify-center group',
          interactive && 'cursor-pointer'
        )}
        onClick={handleOrbClick}
        title={interactive ? 'Click to start guided Box Breathing' : undefined}
      >
        {/* Outermost Pulsing Halo */}
        <motion.div
          animate={{
            scale: stateTheme.scaleRange,
            opacity: [0.35, 0.65, 0.65, 0.35],
          }}
          transition={{
            duration: stateTheme.pulseDuration,
            ease: 'easeInOut',
            repeat: Infinity,
            times: [0, 0.4, 0.6, 1],
          }}
          style={{ backgroundColor: stateTheme.haloColor }}
          className={cn(
            'absolute rounded-full blur-2xl pointer-events-none transition-colors duration-1000',
            dimensions.glow
          )}
        />

        {/* Ambient Ring Wave */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1.25, 1],
            opacity: [0.5, 0, 0, 0.5],
          }}
          transition={{
            duration: stateTheme.pulseDuration * 1.2,
            ease: 'easeOut',
            repeat: Infinity,
          }}
          className={cn(
            'absolute inset-0 rounded-full border border-dashed transition-colors duration-700',
            stateTheme.ringColor
          )}
        />

        {/* Spherical Gradient Core with Glass Surface */}
        <motion.div
          animate={{
            scale: stateTheme.scaleRange,
            rotate: [0, 180, 360],
          }}
          transition={{
            scale: {
              duration: stateTheme.pulseDuration,
              ease: 'easeInOut',
              repeat: Infinity,
              times: [0, 0.4, 0.6, 1],
            },
            rotate: {
              duration: 40,
              ease: 'linear',
              repeat: Infinity,
            },
          }}
          className={cn(
            'relative rounded-full shadow-2xl overflow-hidden bg-gradient-to-tr transition-all duration-1000',
            stateTheme.orbGradient,
            dimensions.orb
          )}
          style={{
            boxShadow: `0 0 45px ${stateTheme.glowColor}, inset 0 2px 14px rgba(255, 255, 255, 0.6)`,
          }}
        >
          {/* Inner Caustic Specular Highlights */}
          <div className="absolute top-1 left-2 w-1/2 h-1/2 rounded-full bg-white/40 blur-xs transform -rotate-45" />
          <div className="absolute bottom-2 right-2 w-1/3 h-1/3 rounded-full bg-indigo-900/40 blur-xs" />

          {/* Floating Stardust Shimmer */}
          <motion.div
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 bg-radial from-white/30 to-transparent pointer-events-none"
          />
        </motion.div>

        {/* Interactive Quick-Action Icon Overlay */}
        {interactive && (
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            className="absolute inset-0 rounded-full bg-slate-950/40 backdrop-blur-xs flex items-center justify-center text-white transition-opacity duration-200 pointer-events-none"
          >
            <Wind className="h-6 w-6 animate-pulse" />
          </motion.div>
        )}
      </div>

      {/* Details & Telemetry Labeling */}
      {showDetails && (
        <div className="mt-4 flex flex-col items-center text-center space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-colors',
                stateTheme.badgeBg
              )}
            >
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>{dominantEmotion.name} ({dominantEmotion.confidence}%)</span>
            </span>

            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              • Stress {score}%
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {stateTheme.name}
            {trend === 'decreasing' && ' • Calming'}
            {trend === 'increasing' && ' • Elevated'}
          </p>

          {interactive && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-teal-500 transition-colors">
              Click orb for calming Box Breathing
            </p>
          )}
        </div>
      )}
    </div>
  );
}
