'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * BreathingBackground - Ambient Respiratory Canvas.
 *
 * Implements a slow, hypnotic, calming atmospheric gradient animation that
 * mirrors a natural 8-to-10 second human respiratory rhythm (Inhale → Hold → Exhale → Rest).
 *
 * Designed to reduce cognitive load and induce involuntary somatic grounding
 * as soon as stressed users arrive on the platform.
 */
export function BreathingBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── Layer 1: Primary Calming Cyan/Teal Respiratory Aurora ─────── */}
      <motion.div
        animate={{
          scale: [1, 1.18, 1.18, 0.95, 1],
          opacity: [0.35, 0.55, 0.55, 0.3, 0.35],
          x: ['0%', '4%', '3%', '-2%', '0%'],
          y: ['0%', '-3%', '-2%', '3%', '0%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-[20%] -left-[10%] w-[65vw] h-[65vw] max-w-[850px] max-h-[850px] rounded-full blur-[100px] sm:blur-[140px] bg-gradient-to-br from-teal-400/25 via-blue-500/20 to-transparent dark:from-teal-500/18 dark:via-cyan-600/14 dark:to-transparent will-change-transform"
      />

      {/* ── Layer 2: Deep Indigo / Lavender Serenity Orb ──────────────── */}
      <motion.div
        animate={{
          scale: [1, 0.92, 0.92, 1.15, 1],
          opacity: [0.3, 0.25, 0.25, 0.5, 0.3],
          x: ['0%', '-4%', '-3%', '3%', '0%'],
          y: ['0%', '3%', '2%', '-3%', '0%'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full blur-[110px] sm:blur-[150px] bg-gradient-to-tl from-indigo-500/25 via-purple-500/15 to-transparent dark:from-indigo-600/20 dark:via-purple-700/12 dark:to-transparent will-change-transform"
      />

      {/* ── Layer 3: Central Grounding Respiratory Pulse ──────────────── */}
      <motion.div
        animate={{
          scale: [0.95, 1.12, 1.12, 0.92, 0.95],
          opacity: [0.15, 0.28, 0.28, 0.12, 0.15],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full blur-[120px] bg-radial from-blue-400/20 via-teal-400/10 to-transparent dark:from-blue-600/15 dark:via-teal-500/10 dark:to-transparent will-change-transform"
      />

      {/* ── Subtle Geometric Grid Texture (Soft Antigravity Depth) ──── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
    </div>
  );
}
