'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * CursorGlow - Calming, Ethereal Cursor Follower.
 *
 * Provides a soft, relaxing bioluminescent glow that follows the user's cursor
 * with gentle spring physics, creating a soothing, grounded aesthetic.
 *
 * Features:
 * - Fluid spring lag: High damping and smooth mass simulating liquid movement.
 * - Reactive expansion: Softly expands when hovering over interactive elements.
 * - Accessibility-First: Automatically disabled on touch screens and when
 *   `prefers-reduced-motion` is enabled.
 * - Zero interference: Pure `pointer-events-none` with high z-index overlay.
 */
export function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Raw mouse coordinates
  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);

  // Spring physics for outer ethereal orb (fluid, relaxing lag)
  const springConfig = { damping: 26, stiffness: 180, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Spring physics for inner pinpoint
  const pinConfig = { damping: 35, stiffness: 350, mass: 0.2 };
  const pinX = useSpring(mouseX, pinConfig);
  const pinY = useSpring(mouseY, pinConfig);

  useEffect(() => {
    // Check if device has a fine pointer (mouse/trackpad) and user doesn't prefer reduced motion
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('[role="button"]') ||
          target.closest('[tabindex="0"]') ||
          target.classList.contains('cursor-pointer')
        );
        setIsHoveringInteractive(isInteractive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!mounted || !isVisible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {/* ── Outer Calming Diffuse Orb ──────────────────────────────────────── */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.85 : isHoveringInteractive ? 1.35 : 1,
          opacity: isHoveringInteractive ? 0.8 : 0.55,
        }}
        transition={{
          scale: { type: 'spring', damping: 20, stiffness: 240 },
          opacity: { duration: 0.25 },
        }}
        className="absolute h-72 w-72 rounded-full blur-3xl will-change-transform bg-radial from-teal-400/20 via-blue-500/15 to-transparent dark:from-teal-400/25 dark:via-indigo-500/20 dark:to-transparent"
      />

      {/* ── Inner Focused Aura ────────────────────────────────────────────── */}
      <motion.div
        style={{
          x: pinX,
          y: pinY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.75 : isHoveringInteractive ? 1.4 : 1,
          borderColor: isHoveringInteractive
            ? 'rgba(45, 212, 191, 0.6)'
            : 'rgba(96, 165, 250, 0.4)',
        }}
        transition={{
          scale: { type: 'spring', damping: 22, stiffness: 300 },
        }}
        className="absolute h-8 w-8 rounded-full border border-blue-400/30 bg-blue-400/10 dark:bg-teal-400/10 backdrop-blur-2xs will-change-transform"
      />
    </div>
  );
}
