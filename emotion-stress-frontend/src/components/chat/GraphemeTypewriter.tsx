'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Splits text into true user-perceived grapheme clusters.
 * Prevents Unicode composite characters (e.g. Sinhala consonant + vowel modifier 'කො', 'ක්‍ර', 'ශ්‍රී')
 * from being broken into isolated/floating diacritics during animation or rendering.
 *
 * @param text The input text string.
 * @returns An array of atomic grapheme cluster strings.
 */
export function splitIntoGraphemes(text: string): string[] {
  if (!text) return [];

  // 1. Use standard Intl.Segmenter if supported (modern browser standard)
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (s) => s.segment);
    } catch {
      // Fallback if segmenter instantiation encounters issues
    }
  }

  // 2. Unicode combining character regex fallback (supports Sinhala, Tamil, Devanagari, Latin combining marks)
  // Matches any base character followed by zero or more combining diacritical marks or Zero-Width-Joiners
  const matches = text.match(/[\s\S][\u0300-\u036f\u0D82-\u0DDF\u0B82-\u0BCC\u200D\u200C]*/g);
  return matches || Array.from(text);
}

export interface GraphemeTypewriterProps {
  /** The full text content to display */
  text: string;
  /** Whether to animate with a smooth grapheme-by-grapheme typewriter effect */
  animate?: boolean;
  /** Milliseconds delay per grapheme step (default: 16ms) */
  speedMs?: number;
  /** Additional CSS class names */
  className?: string;
  /** Callback fired when typing animation completes */
  onComplete?: () => void;
}

/**
 * GraphemeTypewriter
 *
 * Unicode-aware text renderer that treats Indic (Sinhala/Tamil) composite glyphs as atomic units.
 * Eliminates character breaking, modifier flicker, and dotted-circle rendering artifacts.
 */
export function GraphemeTypewriter({
  text,
  animate = false,
  speedMs = 16,
  className,
  onComplete,
}: GraphemeTypewriterProps) {
  const graphemes = useMemo(() => splitIntoGraphemes(text), [text]);
  const [displayedCount, setDisplayedCount] = useState(animate ? 0 : graphemes.length);

  const isSinhala = useMemo(() => /[\u0D80-\u0DFF]/.test(text), [text]);
  const isTamil = useMemo(() => /[\u0B80-\u0BFF]/.test(text), [text]);

  useEffect(() => {
    if (!animate) {
      setDisplayedCount(graphemes.length);
      return;
    }

    // Reset when text changes
    setDisplayedCount(0);
    let index = 0;
    const total = graphemes.length;

    if (total === 0) return;

    // Fast-pacing: step by 1-2 graphemes per interval for responsive fluidity
    const stepSize = total > 120 ? 3 : total > 60 ? 2 : 1;

    const interval = setInterval(() => {
      index += stepSize;
      if (index >= total) {
        setDisplayedCount(total);
        clearInterval(interval);
        onComplete?.();
      } else {
        setDisplayedCount(index);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [animate, graphemes, speedMs, onComplete]);

  const visibleText = useMemo(() => {
    if (!animate || displayedCount >= graphemes.length) {
      return text;
    }
    return graphemes.slice(0, displayedCount).join('');
  }, [animate, displayedCount, graphemes, text]);

  return (
    <span
      lang={isSinhala ? 'si' : isTamil ? 'ta' : 'en'}
      className={cn(
        'select-text whitespace-pre-wrap break-words inline',
        isSinhala && 'font-sinhala leading-[1.8] tracking-[0.01em]',
        isTamil && 'font-tamil leading-[1.7] tracking-[0.01em]',
        className
      )}
    >
      {visibleText}
    </span>
  );
}
