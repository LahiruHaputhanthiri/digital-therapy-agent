'use client';

import { useCallback, useRef } from 'react';
import { useStressStore } from '@/store/useStressStore';

/**
 * useKeystrokeTracker
 *
 * Privacy-First Behavioral Typing Dynamics Tracker:
 * - Collects ONLY timing characteristics (press duration, inter-key delay, backspace count, pause count)
 * - NEVER captures or logs key codes, characters, or text content.
 * - Complies with ethical research data collection standards.
 */
export function useKeystrokeTracker() {
  const isKeystrokeEnabled = useStressStore((state) => state.activeModalities.keystroke);
  const updateKeystrokeMetrics = useStressStore((state) => state.updateKeystrokeMetrics);

  const keyDownTimesRef = useRef<Map<number, number>>(new Map()); // internal anonymous key sequence id -> timestamp
  const keySequenceCounterRef = useRef<number>(0);
  const lastKeyUpTimeRef = useRef<number | null>(null);
  const lastActivityTimeRef = useRef<number>(Date.now());

  // Metrics buffers for rolling averages
  const dwellTimesRef = useRef<number[]>([]);
  const flightTimesRef = useRef<number[]>([]);
  const backspaceCountRef = useRef<number>(0);
  const pauseCountRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const totalKeystrokesRef = useRef<number>(0);

  /**
   * Called on KeyDown event on the input field
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (!isKeystrokeEnabled) return;

      const now = performance.now();
      const wallTime = Date.now();

      // Check for pause duration (> 1500ms since last activity)
      if (wallTime - lastActivityTimeRef.current > 1500 && totalKeystrokesRef.current > 0) {
        pauseCountRef.current += 1;
      }
      lastActivityTimeRef.current = wallTime;
      totalKeystrokesRef.current += 1;

      // Track backspace / delete frequency anonymously
      if (e.key === 'Backspace' || e.key === 'Delete') {
        backspaceCountRef.current += 1;
      }

      // Calculate Flight Time (from previous keyup to current keydown)
      if (lastKeyUpTimeRef.current !== null) {
        const flightTime = now - lastKeyUpTimeRef.current;
        if (flightTime >= 0 && flightTime < 2500) {
          flightTimesRef.current.push(flightTime);
          if (flightTimesRef.current.length > 30) flightTimesRef.current.shift();
        }
      }

      // Generate an anonymous sequence id for this keypress
      const seqId = ++keySequenceCounterRef.current;
      keyDownTimesRef.current.set(seqId, now);

      // Clean up old entries if map grows unexpectedly
      if (keyDownTimesRef.current.size > 20) {
        const firstKey = keyDownTimesRef.current.keys().next().value;
        if (firstKey !== undefined) keyDownTimesRef.current.delete(firstKey);
      }
    },
    [isKeystrokeEnabled]
  );

  /**
   * Called on KeyUp event on the input field
   */
  const handleKeyUp = useCallback(
    (_e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (!isKeystrokeEnabled) return;

      const now = performance.now();
      lastKeyUpTimeRef.current = now;

      // Find the most recent keydown timestamp to compute dwell time
      const entries = Array.from(keyDownTimesRef.current.entries());
      if (entries.length > 0) {
        const [oldestSeqId, downTime] = entries[0];
        const dwellTime = now - downTime;
        keyDownTimesRef.current.delete(oldestSeqId);

        if (dwellTime > 10 && dwellTime < 1000) {
          dwellTimesRef.current.push(dwellTime);
          if (dwellTimesRef.current.length > 30) dwellTimesRef.current.shift();
        }
      }

      // Compute rolling metrics
      const avgDwell =
        dwellTimesRef.current.length > 0
          ? Math.round(
              dwellTimesRef.current.reduce((a, b) => a + b, 0) / dwellTimesRef.current.length
            )
          : 110;

      const avgFlight =
        flightTimesRef.current.length > 0
          ? Math.round(
              flightTimesRef.current.reduce((a, b) => a + b, 0) / flightTimesRef.current.length
            )
          : 145;

      const elapsedMinutes = (Date.now() - sessionStartTimeRef.current) / 60000;
      const computedWpm =
        elapsedMinutes > 0.05
          ? Math.min(130, Math.max(10, Math.round((totalKeystrokesRef.current / 5) / elapsedMinutes)))
          : 55;

      // Variance calculation for cadence consistency
      let cadenceScore = 0.85;
      if (flightTimesRef.current.length > 5) {
        const mean = avgFlight;
        const variance =
          flightTimesRef.current.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
          flightTimesRef.current.length;
        const stdDev = Math.sqrt(variance);
        cadenceScore = Math.max(0.4, Math.min(1.0, 1 - stdDev / (mean * 1.5)));
      }

      updateKeystrokeMetrics({
        dwellTimeMs: avgDwell,
        flightTimeMs: avgFlight,
        wpm: computedWpm,
        backspaceCount: backspaceCountRef.current,
        pauseCount: pauseCountRef.current,
        cadenceConsistency: Number(cadenceScore.toFixed(2)),
      });
    },
    [isKeystrokeEnabled, updateKeystrokeMetrics]
  );

  /**
   * Resets the local metrics buffer (e.g. after message send)
   */
  const resetMetrics = useCallback(() => {
    dwellTimesRef.current = [];
    flightTimesRef.current = [];
    backspaceCountRef.current = 0;
    pauseCountRef.current = 0;
    sessionStartTimeRef.current = Date.now();
    totalKeystrokesRef.current = 0;
    keyDownTimesRef.current.clear();
    lastKeyUpTimeRef.current = null;
  }, []);

  return {
    handleKeyDown,
    handleKeyUp,
    resetMetrics,
    isKeystrokeEnabled,
  };
}
