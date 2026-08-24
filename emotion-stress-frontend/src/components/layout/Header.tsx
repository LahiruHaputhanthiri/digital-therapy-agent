'use client';

import React, { useState } from 'react';
import {
  HeartHandshake,
  Settings,
  Sun,
  Moon,
  Monitor,
  LifeBuoy,
  Activity,
  Menu,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SettingsModal } from '@/components/layout/SettingsModal';
import { CrisisResourceModal } from '@/components/interventions/CrisisResourceModal';
import { useStressStore } from '@/store/useStressStore';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/locales';

export interface HeaderProps {
  onToggleTelemetry?: () => void;
  onToggleHistory?: () => void;
  isTelemetryOpen?: boolean;
  isHistoryOpen?: boolean;
}

/**
 * Header - Zen / Focus-First Architecture with Bilingual Support
 *
 * Minimalist, calming top navigation:
 * - Left: Menu/Profile drawer trigger + App branding
 * - Center: Subtle ambient status dot (Green / Amber / Red) with bilingual status
 * - Right:
 *   * Language Toggle [ EN | සිං ]
 *   * "📊 Insights & Telemetry" drawer toggle
 *   * Demo Simulator + Crisis Support + Theme Switcher + Settings
 */
export function Header({
  onToggleTelemetry,
  onToggleHistory,
  isTelemetryOpen = false,
  isHistoryOpen = false,
}: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);

  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const stressEstimate = useStressStore((state) => state.stressEstimate);
  const updateStressEstimate = useStressStore((state) => state.updateStressEstimate);

  // Cycle: Light → Dark → System
  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  // Cycle simulated stress level for testing the adaptive UI
  const cycleStressLevel = () => {
    if (stressEstimate.level === 'low') {
      updateStressEstimate({ score: 54, level: 'moderate', trend: 'increasing' });
    } else if (stressEstimate.level === 'moderate') {
      updateStressEstimate({ score: 78, level: 'high', trend: 'increasing' });
    } else {
      updateStressEstimate({ score: 26, level: 'low', trend: 'decreasing' });
    }
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor className="h-4 w-4" />;
    return resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  // Ambient Status Dot Styling (Subtle & Non-Alarming)
  const ambientStatus = {
    low: {
      dotBg: 'bg-emerald-500',
      pingBg: 'bg-emerald-400',
      label: t.ambientStatus.low,
      pillBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
    },
    moderate: {
      dotBg: 'bg-amber-500',
      pingBg: 'bg-amber-400',
      label: t.ambientStatus.moderate,
      pillBg: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
    },
    high: {
      dotBg: 'bg-rose-500',
      pingBg: 'bg-rose-400',
      label: t.ambientStatus.high,
      pillBg: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
    },
  }[stressEstimate.level];

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">

          {/* ── Left: Menu / Profile Trigger & App Logo ──────────────── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* History / Profile Drawer Trigger */}
            <button
              type="button"
              onClick={onToggleHistory}
              aria-label={t.header.openHistory}
              className={`p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border ${
                isHistoryOpen
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-sm shrink-0">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                    {t.common.appName}
                  </span>
                  <Badge variant="accent" className="text-[10px] py-0 px-1.5 hidden md:inline-flex">
                    {t.common.zenMode}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] lg:max-w-none">
                  {t.header.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* ── Center: Ambient Wellbeing Dot (Subtle Biofeedback) ────── */}
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium transition-all ${ambientStatus.pillBg}`}
              title={`Ambient wellbeing indicator: ${ambientStatus.label} (Score ~${stressEstimate.score}%)`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ambientStatus.pingBg}`}
                />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${ambientStatus.dotBg}`} />
              </span>
              <span className="text-[11px] font-semibold tracking-tight">{ambientStatus.label}</span>
            </div>
          </div>

          {/* ── Right: Language Toggle, Insights Button & Controls ───── */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Trilingual Switcher: [ EN | සිං | தமிழ் ] */}
            <div
              className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-xs font-bold transition-all shadow-2xs"
              role="group"
              aria-label="Language selection"
            >
              <Languages className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0 hidden sm:inline ml-0.5" />
              <button
                type="button"
                onClick={() => setLanguage('en')}
                title="Switch to English"
                aria-pressed={language === 'en'}
                className={`px-1.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <span className="text-slate-300 dark:text-slate-600 text-[10px]">|</span>
              <button
                type="button"
                onClick={() => setLanguage('si')}
                title="සිංහල භාෂාවට මාරු වන්න (Switch to Sinhala)"
                aria-pressed={language === 'si'}
                className={`px-1.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  language === 'si'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                සිං
              </button>
              <span className="text-slate-300 dark:text-slate-600 text-[10px]">|</span>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                title="தமிழுக்கு மாற்றவும் (Switch to Tamil)"
                aria-pressed={language === 'ta'}
                className={`px-1.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  language === 'ta'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                தமிழ்
              </button>
            </div>

            {/* 📊 Insights & Telemetry Slide-Over Button */}
            <Button
              size="sm"
              variant={isTelemetryOpen ? 'default' : 'outline'}
              onClick={onToggleTelemetry}
              aria-label={t.header.insightsBtn}
              className={`rounded-xl text-xs gap-1.5 px-2.5 sm:px-3 shadow-xs transition-all ${
                isTelemetryOpen
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
              <span className="font-semibold hidden md:inline">{t.header.insightsBtn}</span>
              <span className="font-semibold md:hidden">{t.header.insightsBtnShort}</span>
            </Button>

            {/* Demo Stress Simulator Cycle Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={cycleStressLevel}
              title="Click to cycle simulated stress level (Low → Moderate → High)"
              className="hidden lg:flex text-xs gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl"
            >
              <span className="text-[10px] text-slate-400">{t.header.simulateLabel}</span>
              <span className="font-bold capitalize text-[11px] text-blue-600 dark:text-blue-400">
                {stressEstimate.level}
              </span>
            </Button>

            {/* Crisis Support Trigger */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCrisis(true)}
              aria-label="Open crisis support hotlines"
              className="text-xs gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-xl hidden sm:flex"
            >
              <LifeBuoy className="h-4 w-4" />
              <span className="hidden xl:inline">{t.header.crisisBtn}</span>
            </Button>

            {/* 3-State Theme Switcher */}
            <button
              type="button"
              onClick={cycleTheme}
              title={`${t.header.toggleTheme}: ${theme}`}
              aria-label={`${t.header.toggleTheme}: ${theme}`}
              className="flex items-center gap-1.5 p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {getThemeIcon()}
            </button>

            {/* Settings Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              aria-label={t.header.openSettings}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
      <CrisisResourceModal open={showCrisis} onOpenChange={setShowCrisis} />
    </>
  );
}
