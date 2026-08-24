'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  HeartHandshake,
  Sparkles,
  Phone,
  Wind,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CrisisResourceModal } from '@/components/interventions/CrisisResourceModal';
import { useStressStore } from '@/store/useStressStore';
import { useTranslation } from '@/locales';

/** Region-specific emergency hotlines displayed inline without opening the full modal. */
const QUICK_HOTLINES = [
  { region: 'LK', label: 'Sri Lanka', number: '1926', href: 'tel:1926' },
  { region: 'US', label: 'US Lifeline', number: '988', href: 'tel:988' },
  { region: 'UK', label: 'UK Crisis', number: '116 123', href: 'tel:116123' },
  { region: 'AU', label: 'Lifeline AU', number: '13 11 14', href: 'tel:131114' },
];

/**
 * SafetyBanner - Phase 4 Intervention with Bilingual Support
 * Anchored banner component shown when `safetyState.isTriggered` is true.
 * Features:
 * - Non-judgmental, compassionate messaging in English and Sinhala
 * - One-click grounding / breathing intervention triggers
 * - Inline quick-dial hotline links
 * - Full crisis resources modal link
 * - Dismissal with a 2-step confirmation safeguard
 */
export function SafetyBanner() {
  const safetyState = useStressStore((state) => state.safetyState);
  const acknowledgeSafety = useStressStore((state) => state.acknowledgeSafety);
  const setIntervention = useStressStore((state) => state.setIntervention);
  const { t } = useTranslation();

  const [showResources, setShowResources] = useState(false);
  const [showDismissConfirm, setShowDismissConfirm] = useState(false);

  if (!safetyState.isTriggered) return null;

  const isHighRisk = safetyState.riskLevel === 'high_safety_risk';

  const handleDismissRequest = () => {
    setShowDismissConfirm(true);
  };

  const handleDismissConfirm = () => {
    setShowDismissConfirm(false);
    acknowledgeSafety();
  };

  const handleDismissCancel = () => {
    setShowDismissConfirm(false);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="safety-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className={`w-full rounded-2xl p-4 backdrop-blur-md transition-all duration-300 shadow-md border ${
            isHighRisk
              ? 'bg-rose-500/10 border-rose-500/30 dark:bg-rose-950/30 dark:border-rose-700/40'
              : 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/30 dark:border-amber-700/40'
          }`}
        >
          {/* Banner Body */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`rounded-xl p-2 shrink-0 mt-0.5 ${
                  isHighRisk
                    ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                    : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                }`}
              >
                {isHighRisk ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : (
                  <HeartHandshake className="h-5 w-5" />
                )}
              </div>

              {/* Message */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isHighRisk ? t.safetyBanner.highRiskTitle : t.safetyBanner.moderateRiskTitle}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                  {safetyState.triggerReason ||
                    (isHighRisk
                      ? t.safetyBanner.highRiskBody
                      : t.safetyBanner.moderateRiskBody)}
                </p>
              </div>
            </div>

            {/* Dismiss Button with Confirmation Guard */}
            <div className="self-start shrink-0">
              {!showDismissConfirm ? (
                <button
                  type="button"
                  onClick={handleDismissRequest}
                  aria-label="Request to dismiss safety notice"
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 shadow-sm"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {t.safetyBanner.confirmDismiss}
                    </span>
                    <button
                      type="button"
                      onClick={handleDismissConfirm}
                      className="px-2 py-0.5 rounded-md bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[11px] font-bold hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      {t.common.yes}
                    </button>
                    <button
                      type="button"
                      onClick={handleDismissCancel}
                      className="px-2 py-0.5 rounded-md text-slate-500 dark:text-slate-400 text-[11px] hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {t.common.no}
                    </button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Quick Hotlines */}
          <div className="mt-3.5 flex flex-wrap gap-2">
            {QUICK_HOTLINES.map((h) => (
              <a
                key={h.region}
                href={h.href}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/70 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Phone className="h-3 w-3 text-blue-500 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 font-normal">{h.label}:</span>
                {h.number}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div
            className={`flex flex-wrap items-center gap-2 pt-3.5 mt-3 border-t ${
              isHighRisk
                ? 'border-rose-500/20'
                : 'border-amber-500/20'
            }`}
          >
            <Button
              size="sm"
              onClick={() => setIntervention('grounding')}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t.safetyBanner.groundingBtn}
            </Button>

            <Button
              size="sm"
              onClick={() => setIntervention('breathing')}
              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs gap-1.5 shadow-xs cursor-pointer"
            >
              <Wind className="h-3.5 w-3.5" />
              {t.safetyBanner.breathingBtn}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowResources(true)}
              className="rounded-xl text-xs gap-1.5 border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 text-blue-500" />
              {t.safetyBanner.allHotlinesBtn}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={acknowledgeSafety}
              className="rounded-xl text-xs text-slate-600 dark:text-slate-300 ml-auto gap-1 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              {t.safetyBanner.continueBtn}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Full Crisis Resource Modal */}
      <CrisisResourceModal open={showResources} onOpenChange={setShowResources} />
    </>
  );
}
