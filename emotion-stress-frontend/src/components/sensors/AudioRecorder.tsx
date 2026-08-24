'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AudioRecorderProps {
  isRecording: boolean;
  recordingDuration: number;
  audioVolume: number; // 0 - 100
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}

/**
 * AudioRecorder Component - Phase 3 Sensory Feeds
 * Manages audio recording trigger, animated Framer Motion multi-bar equalizer visualization,
 * live duration counter, and cancel/complete actions.
 */
export function AudioRecorder({
  isRecording,
  recordingDuration,
  audioVolume,
  onStart,
  onStop,
  onCancel,
}: AudioRecorderProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 5 Equalizer bar heights calculated dynamically from live volume
  const getBarHeight = (index: number) => {
    if (!isRecording) return 4;
    const base = Math.max(6, (audioVolume / 100) * 26);
    // Modulate height slightly across bars for organic acoustic feel
    const multiplier = [0.85, 1.2, 1.0, 1.3, 0.7][index % 5];
    return Math.min(28, Math.max(4, base * multiplier));
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-center gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 px-3 py-1.5 shadow-sm"
        >
          {/* Pulsing Recording Indicator */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
            <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-300">
              {formatDuration(recordingDuration)}
            </span>
          </div>

          {/* Animated 5-Bar Waveform Equalizer */}
          <div className="flex items-center gap-0.5 h-6 px-1">
            {[0, 1, 2, 3, 4].map((bar) => (
              <motion.span
                key={bar}
                className="w-1 rounded-full bg-rose-500 dark:bg-rose-400"
                animate={{ height: getBarHeight(bar) }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            ))}
          </div>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            title="Cancel voice recording"
            aria-label="Cancel voice recording"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-rose-100/60 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Complete / Stop Button */}
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={onStop}
            className="h-7 text-xs px-2.5 gap-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
          >
            <Square className="h-3 w-3 fill-current" />
            Done
          </Button>
        </motion.div>
      ) : (
        /* Inactive State Mic Trigger Button */
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onStart}
          title="Record voice message for acoustic tone analysis"
          aria-label="Start voice message recording"
          className="h-9 w-9 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:text-slate-400 dark:hover:text-teal-300 dark:hover:bg-teal-950/40 transition-colors"
        >
          <Mic className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
