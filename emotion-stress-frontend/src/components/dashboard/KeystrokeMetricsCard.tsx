'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Keyboard,
  ShieldCheck,
  Timer,
  Gauge,
  RotateCcw,
  PauseCircle,
  HelpCircle,
  ActivitySquare,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStressStore } from '@/store/useStressStore';

/**
 * KeystrokeMetricsCard Component - Phase 3 Visualizer
 * Visualizes non-invasive keystroke dynamics: dwell time, flight time, pauses,
 * typing speed (WPM), and estimated cognitive hesitation patterns with explicit zero-keylogging notice.
 */
export function KeystrokeMetricsCard() {
  const metrics = useStressStore((state) => state.keystrokeMetrics);
  const isEnabled = useStressStore((state) => state.activeModalities.keystroke);

  // Derive cognitive hesitation marker based on pause frequency and high flight time
  const hasCognitiveHesitation =
    metrics.pauseCount > 2 || metrics.flightTimeMs > 240 || metrics.backspaceCount > 6;

  return (
    <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-sm font-semibold">Keystroke Dynamics</CardTitle>
          </div>
          <Badge variant={isEnabled ? 'accent' : 'secondary'}>
            {isEnabled ? 'Live Rhythm Active' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3.5">
        {isEnabled ? (
          <>
            {/* Cognitive Hesitation Status Ribbon */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/60">
              <div className="flex items-center gap-2">
                <ActivitySquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Cognitive Hesitation State:
                </span>
              </div>
              <Badge
                variant={hasCognitiveHesitation ? 'warning' : 'success'}
                className="text-[10px] px-2 py-0.5"
              >
                {hasCognitiveHesitation ? 'Hesitation Detected' : 'Fluid Cadence'}
              </Badge>
            </div>

            {/* 4-Tile Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Tile 1: Dwell Time */}
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3 text-purple-500" />
                    Avg Dwell
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {metrics.dwellTimeMs}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">ms</span>
                </div>
              </div>

              {/* Tile 2: Flight Time */}
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3 text-blue-500" />
                    Avg Flight
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {metrics.flightTimeMs}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">ms</span>
                </div>
              </div>

              {/* Tile 3: Cadence Rate (WPM) */}
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Gauge className="h-3 w-3 text-teal-500" />
                    Cadence Rate
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {metrics.wpm}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">WPM</span>
                </div>
              </div>

              {/* Tile 4: Pauses & Corrections */}
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <PauseCircle className="h-3 w-3 text-amber-500" />
                    Pauses (&gt;1.2s)
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {metrics.pauseCount || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    ({metrics.backspaceCount} del)
                  </span>
                </div>
              </div>
            </div>

            {/* Zero-Keylogging Privacy Assurance Badge */}
            <div className="flex items-start gap-1.5 p-2 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900/60 text-[11px] text-teal-800 dark:text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <span>
                <strong className="font-semibold">Zero Keylogging Guarantee:</strong> Only timing intervals between key events are analyzed. Keystroke characters and text values are strictly discarded.
              </span>
            </div>
          </>
        ) : (
          /* Graceful Missing-Modality Fallback Screen */
          <div className="py-6 px-3 text-center space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700">
            <div className="mx-auto h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-500">
              <Keyboard className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Keystroke Dynamics Paused
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[210px] mx-auto">
              Behavioral rhythm tracking is currently disabled in your sensor privacy controls.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
