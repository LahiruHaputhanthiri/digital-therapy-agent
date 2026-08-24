'use client';

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Wind,
  Settings,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoodHistory } from '@/components/dashboard/MoodHistory';
import { SessionHistory } from '@/components/dashboard/SessionHistory';
import { SettingsModal } from '@/components/layout/SettingsModal';
import { useStressStore } from '@/store/useStressStore';

/**
 * Computes a "wellbeing streak" badge based on how many consecutive low-stress
 * days appear at the tail end of the mood history.
 * Returns 0 if there are no consecutive low-stress sessions.
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
 * Sidebar - Phase 5 Layout Assembly
 * Left-panel sidebar containing:
 * - User profile card with greeting, wellbeing badge, and mood streak
 * - Trend indicator (rising / stable / improving)
 * - Quick Box Breathing shortcut
 * - Weekly mood history chart
 * - Session history list
 * - Quick Settings trigger button
 * - Ethical & academic disclaimer pinned to bottom
 */
export function Sidebar() {
  const [showSettings, setShowSettings] = useState(false);

  const userProfile = useStressStore((state) => state.userProfile);
  const stressEstimate = useStressStore((state) => state.stressEstimate);
  const moodHistory = useStressStore((state) => state.moodHistory);
  const setIntervention = useStressStore((state) => state.setIntervention);

  const streak = computeStreak(moodHistory);

  const getGreeting = () => {
    const hour = new Date().getHours();
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
      <aside className="w-full space-y-4">
        {/* ── User Profile Card ────────────────────────────────────── */}
        <Card className="border-slate-200/80 dark:border-slate-800/80">
          <CardContent className="p-4 space-y-3">
            {/* Avatar + Greeting */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                {userProfile.preferredName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  suppressHydrationWarning
                  className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate"
                >
                  {getGreeting()}, {userProfile.preferredName}
                </h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                  Let&apos;s take a mindful moment.
                </p>
              </div>
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
                  {stressEstimate.level} stress
                </Badge>
                {/* Trend indicator */}
                <div
                  className={`flex items-center gap-0.5 text-[10px] font-medium ${trendColor}`}
                  aria-label={`Trend: ${stressEstimate.trend}`}
                >
                  <TrendIcon className="h-3 w-3" />
                  <span className="capitalize hidden sm:inline">{stressEstimate.trend}</span>
                </div>
              </div>

              {/* Streak badge */}
              {streak >= 2 && (
                <div
                  className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400"
                  title={`${streak}-day low-stress streak`}
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>{streak}d streak</span>
                </div>
              )}
            </div>

            {/* Quick Breathing Shortcut */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIntervention('breathing')}
              className="w-full justify-center gap-2 rounded-xl text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              <Wind className="h-3.5 w-3.5 text-teal-500" />
              Quick 4-4-4 Box Breathing
            </Button>
          </CardContent>
        </Card>

        {/* ── Mood History Chart ───────────────────────────────────── */}
        <MoodHistory />

        {/* ── Session History List ─────────────────────────────────── */}
        <SessionHistory />

        {/* ── Settings Quick-Access ────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          aria-label="Open application settings"
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="font-medium">App Settings & Privacy</span>
          </div>
          <span className="text-slate-400 dark:text-slate-500 text-[10px]">→</span>
        </button>

        {/* ── Academic Disclaimer ──────────────────────────────────── */}
        <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
            <span>Privacy & Ethics Protocol</span>
          </div>
          <p className="leading-relaxed">
            MindCare is an academic research prototype. Emotion signals are estimated from
            active sensors and are not presented as clinical diagnoses. Not a replacement for
            professional mental health care.
          </p>
        </div>
      </aside>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
