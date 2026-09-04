'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  ShieldCheck,
  Wind,
  Settings,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  History,
  LogOut,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SessionHistory } from '@/components/dashboard/SessionHistory';
import { SettingsModal } from '@/components/layout/SettingsModal';
import { useStressStore } from '@/store/useStressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/locales';

export interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Computes a "wellbeing streak" badge based on how many consecutive low-stress
 * days appear at the tail end of the mood history.
 */
function computeStreak(moodHistory: Array<{ estimatedStress: number }>): number {
  let streak = 0;
  for (let i = moodHistory.length - 1; i >= 0; i--) {
    if (moodHistory[i].estimatedStress <= 40) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * HistoryDrawer - Left-Side Slide-Over Panel with Bilingual Support
 *
 * Zen/Focus-First Architecture:
 * - Houses session archives, past reflective notes, and user account settings.
 * - Accessible cleanly from the top navigation hamburger/avatar button.
 */
export function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const [showSettings, setShowSettings] = useState(false);

  const userProfile = useStressStore((state) => state.userProfile);
  const stressEstimate = useStressStore((state) => state.stressEstimate);
  const moodHistory = useStressStore((state) => state.moodHistory);
  const setIntervention = useStressStore((state) => state.setIntervention);
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openProfileModal = useAuthStore((state) => state.openProfileModal);
  const logout = useAuthStore((state) => state.logout);
  const { t, language } = useTranslation();

  const displayName = authUser?.username || userProfile.preferredName;
  const streak = computeStreak(moodHistory);

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

  // Lock body scroll when drawer is open
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'si') {
      if (hour < 12) return 'සුබ උදෑසනක්';
      if (hour < 17) return 'සුබ දහවලක්';
      return 'සුබ සැන්දෑවක්';
    }
    if (language === 'ta') {
      if (hour < 12) return 'காலை வணக்கம்';
      if (hour < 17) return 'மதிய வணக்கம்';
      return 'மாலை வணக்கம்';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const TrendIcon =
    stressEstimate.trend === 'increasing'
      ? TrendingUp
      : stressEstimate.trend === 'decreasing'
      ? TrendingDown
      : Minus;

  const trendColor =
    stressEstimate.trend === 'increasing'
      ? 'text-rose-500'
      : stressEstimate.trend === 'decreasing'
      ? 'text-emerald-500'
      : 'text-slate-400';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label={t.historyDrawer.title}>
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
            <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="w-screen max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400 flex items-center justify-center shadow-xs">
                      <History className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {t.historyDrawer.title}
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.historyDrawer.subtitle}
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

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
                  {/* User Profile Card */}
                  <Card className="border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 overflow-hidden ring-2 ring-teal-500/20">
                            {authUser?.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={authUser.avatar}
                                alt={displayName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>{displayName.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3
                              suppressHydrationWarning
                              className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate"
                            >
                              {getGreeting()}, {displayName}
                            </h3>
                            <p className="text-xs text-teal-600 dark:text-teal-400 font-medium truncate">
                              {t.historyDrawer.presenceText}
                            </p>
                          </div>
                        </div>

                        {isAuthenticated && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onClose();
                              openProfileModal();
                            }}
                            className="rounded-xl text-xs px-2.5 h-8 gap-1 shrink-0 cursor-pointer text-slate-600 dark:text-slate-300"
                            title="Edit Profile Settings"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        )}
                      </div>

                      {/* Wellbeing State + Trend + Streak */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={
                              stressEstimate.level === 'low'
                                ? 'success'
                                : stressEstimate.level === 'moderate'
                                ? 'warning'
                                : 'danger'
                            }
                            className="capitalize text-[10px]"
                          >
                            {stressEstimate.level === 'low'
                              ? t.ambientStatus.low
                              : stressEstimate.level === 'moderate'
                              ? t.ambientStatus.moderate
                              : t.ambientStatus.high}
                          </Badge>
                          <div
                            className={`flex items-center gap-0.5 text-[10px] font-medium ${trendColor}`}
                            aria-label={`Trend: ${stressEstimate.trend}`}
                          >
                            <TrendIcon className="h-3 w-3" />
                            <span className="capitalize">{stressEstimate.trend}</span>
                          </div>
                        </div>

                        {streak >= 2 && (
                          <div
                            className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400"
                            title={`${streak} ${t.historyDrawer.streak}`}
                          >
                            <Flame className="h-3.5 w-3.5" />
                            <span>{streak} {t.historyDrawer.streak}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Breathing Shortcut */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setIntervention('breathing');
                          onClose();
                        }}
                        className="w-full justify-center gap-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <Wind className="h-3.5 w-3.5 text-teal-500" />
                        {t.historyDrawer.boxBreathingBtn}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Past Session Archive (Database-backed) */}
                  <SessionHistory onSelectSession={onClose} />

                  {/* Settings Button Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    aria-label={t.historyDrawer.settingsBtn}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="font-semibold">{t.historyDrawer.settingsBtn}</span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 text-xs">→</span>
                  </button>

                  {/* Academic Protocol Notice */}
                  <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                      <span>{t.historyDrawer.ethicsTitle}</span>
                    </div>
                    <p className="leading-relaxed">
                      {t.historyDrawer.ethicsBody}
                    </p>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-3 px-5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                  <span>{t.historyDrawer.version}</span>
                  <div className="flex items-center gap-2">
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                    >
                      {t.common.close}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
