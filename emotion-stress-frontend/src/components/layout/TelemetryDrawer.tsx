'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Sparkles, ShieldCheck } from 'lucide-react';
import { StressGauge } from '@/components/dashboard/StressGauge';
import { EmotionBars } from '@/components/dashboard/EmotionBars';
import { MoodHistory } from '@/components/dashboard/MoodHistory';
import { KeystrokeMetricsCard } from '@/components/dashboard/KeystrokeMetricsCard';
import { CameraFeed } from '@/components/sensors/CameraFeed';
import { PrivacyControls } from '@/components/sensors/PrivacyControls';
import { Badge } from '@/components/ui/badge';
import { useStressStore } from '@/store/useStressStore';
import { useTranslation } from '@/locales';

export interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * TelemetryDrawer - Clinical Insights & Telemetry Slide-Over Panel with Bilingual Support
 *
 * Zen/Focus-First Architecture:
 * - Hides intrusive real-time biometric dials and live video streams by default
 *   to avoid "Biofeedback Anxiety" and "Cognitive Overload" during active therapy.
 * - Accessible on-demand for researchers, clinicians, or reflective user reviews.
 * - Glassmorphic slide-over with smooth Framer Motion spring physics and ESC key support.
 */
export function TelemetryDrawer({ isOpen, onClose }: TelemetryDrawerProps) {
  const stressEstimate = useStressStore((state) => state.stressEstimate);
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label={t.telemetryDrawer.title}>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md sm:max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {t.telemetryDrawer.title}
                      </h2>
                      <Badge
                        variant={
                          stressEstimate.level === 'low'
                            ? 'success'
                            : stressEstimate.level === 'moderate'
                            ? 'warning'
                            : 'danger'
                        }
                        className="text-[10px] capitalize py-0 px-2"
                      >
                        {stressEstimate.level === 'low'
                          ? t.ambientStatus.low
                          : stressEstimate.level === 'moderate'
                          ? t.ambientStatus.moderate
                          : t.ambientStatus.high}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.telemetryDrawer.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t.common.close}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Research Notice Banner */}
              <div className="px-5 py-2.5 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/40 flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {t.telemetryDrawer.bannerNotice}
                </span>
              </div>

              {/* Scrollable Telemetry Cards Container */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
                {/* 1. Real-Time Stress Gauge with non-clinical disclaimer */}
                <StressGauge />

                {/* 2. 7-Discrete Emotion Probability Breakdown */}
                <EmotionBars />

                {/* 3. Longitudinal Weekly Mood Trend */}
                <MoodHistory />

                {/* 4. Keystroke Timing & Dynamics */}
                <KeystrokeMetricsCard />

                {/* 5. Sensory Feeds & Privacy Controls */}
                <CameraFeed />
                <PrivacyControls />
              </div>

              {/* Drawer Footer */}
              <div className="p-3 px-5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{t.telemetryDrawer.footerNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                >
                  {t.telemetryDrawer.closeDrawer}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
