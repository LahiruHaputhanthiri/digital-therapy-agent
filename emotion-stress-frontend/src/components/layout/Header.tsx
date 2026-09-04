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
  LogOut,
  LogIn,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SettingsModal } from '@/components/layout/SettingsModal';
import { CrisisResourceModal } from '@/components/interventions/CrisisResourceModal';
import { ProfileSettingsModal } from '@/components/layout/ProfileSettingsModal';
import { useStressStore } from '@/store/useStressStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/locales';

export interface HeaderProps {
  onToggleTelemetry?: () => void;
  onToggleHistory?: () => void;
  isTelemetryOpen?: boolean;
  isHistoryOpen?: boolean;
}

/**
 * Header - Zen / Focus-First Architecture with Bilingual Support.
 *
 * Responsive, overflow-safe top navigation:
 * - Left: Menu/Profile drawer trigger + App branding.
 * - Center: Subtle ambient status dot with responsive biofeedback pill.
 * - Right: Trilingual Switcher, Telemetry, Role Switcher, and Guaranteed
 *   Overflow-Proof User Profile & Logout Action.
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

  const {
    user,
    isAuthenticated,
    activeView,
    setActiveView,
    openAuthModal,
    openProfileModal,
    logout,
  } = useAuthStore();

  const isPrivileged = user && (user.role === 'admin' || user.role === 'super_admin');

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
      pillBg:
        'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
    },
    moderate: {
      dotBg: 'bg-amber-500',
      pingBg: 'bg-amber-400',
      label: t.ambientStatus.moderate,
      pillBg:
        'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
    },
    high: {
      dotBg: 'bg-rose-500',
      pingBg: 'bg-rose-400',
      label: t.ambientStatus.high,
      pillBg:
        'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
    },
  }[stressEstimate.level];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800 transition-colors duration-200">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-3">

          {/* ── Left: Menu Trigger & App Branding ──────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* History / Profile Drawer Trigger */}
            <button
              type="button"
              onClick={onToggleHistory}
              aria-label={t.header.openHistory}
              className={`p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border ${
                isHistoryOpen
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                  : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo & Name */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-sm shrink-0">
                <HeartHandshake className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                    {t.common.appName}
                  </span>
                  <Badge
                    variant="accent"
                    className="text-[9px] py-0 px-1 hidden xl:inline-flex"
                  >
                    {t.common.zenMode}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] md:max-w-[200px] hidden sm:block">
                  {t.header.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* ── Center: Ambient Wellbeing Dot (Collapsible Biofeedback) ── */}
          <div className="hidden md:flex items-center justify-center shrink">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border text-xs font-medium transition-all ${ambientStatus.pillBg}`}
              title={`Ambient wellbeing indicator: ${ambientStatus.label} (Score ~${stressEstimate.score}%)`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ambientStatus.pingBg}`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${ambientStatus.dotBg}`}
                />
              </span>
              <span className="text-[11px] font-semibold tracking-tight hidden lg:inline">
                {ambientStatus.label}
              </span>
            </div>
          </div>

          {/* ── Right: Trilingual Switcher, Telemetry & Auth Section ───── */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 min-w-0">
            {/* Trilingual Switcher: [ EN | සිං | தமிழ் ] */}
            <div
              className="flex items-center gap-0.5 px-1 py-0.5 sm:px-1.5 sm:py-1 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-xs font-bold transition-all shadow-2xs shrink-0"
              role="group"
              aria-label="Language selection"
            >
              <Languages className="h-3 w-3 text-teal-600 dark:text-teal-400 shrink-0 hidden md:inline ml-0.5" />
              <button
                type="button"
                onClick={() => setLanguage('en')}
                title="Switch to English"
                aria-pressed={language === 'en'}
                className={`px-1 sm:px-1.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer ${
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
                className={`px-1 sm:px-1.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer ${
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
                className={`px-1 sm:px-1.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer ${
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
              className={`rounded-xl text-xs gap-1 px-2 sm:px-2.5 shadow-xs transition-all shrink-0 ${
                isTelemetryOpen
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="font-semibold hidden lg:inline">{t.header.insightsBtn}</span>
              <span className="font-semibold hidden sm:inline lg:hidden">{t.header.insightsBtnShort}</span>
            </Button>

            {/* Demo Stress Simulator Cycle Button (Desktop only) */}
            <Button
              size="sm"
              variant="ghost"
              onClick={cycleStressLevel}
              title="Click to cycle simulated stress level (Low → Moderate → High)"
              className="hidden 2xl:flex text-xs gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl shrink-0"
            >
              <span className="text-[10px] text-slate-400">{t.header.simulateLabel}</span>
              <span className="font-bold capitalize text-[11px] text-blue-600 dark:text-blue-400">
                {stressEstimate.level}
              </span>
            </Button>

            {/* Crisis Support Trigger (Compact on tablet/desktop) */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCrisis(true)}
              aria-label="Open crisis support hotlines"
              className="text-xs p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-xl hidden sm:flex shrink-0"
            >
              <LifeBuoy className="h-4 w-4" />
              <span className="hidden 2xl:inline ml-1">{t.header.crisisBtn}</span>
            </Button>

            {/* 3-State Theme Switcher */}
            <button
              type="button"
              onClick={cycleTheme}
              title={`${t.header.toggleTheme}: ${theme}`}
              aria-label={`${t.header.toggleTheme}: ${theme}`}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              {getThemeIcon()}
            </button>

            {/* Settings Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              aria-label={t.header.openSettings}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden xs:flex shrink-0"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* ── Role-Based Access Control & User Auth Segment ───────── */}
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 shrink-0" />

            {/* Privileged View Switcher (Admin / Super Admin) */}
            {isPrivileged && (
              <Button
                size="sm"
                variant={activeView === 'admin' ? 'default' : 'outline'}
                onClick={() => setActiveView(activeView === 'admin' ? 'chat' : 'admin')}
                title={activeView === 'admin' ? 'Switch to Therapy Chat' : 'Open Admin Control Center'}
                className={`rounded-xl text-xs gap-1.5 px-2 sm:px-2.5 transition-all cursor-pointer shrink-0 ${
                  activeView === 'admin'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                    : 'bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                }`}
              >
                {activeView === 'admin' ? (
                  <>
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden lg:inline font-semibold">Therapy</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden lg:inline font-semibold">Admin</span>
                  </>
                )}
              </Button>
            )}

            {/* User Profile & Permanent Overflow-Proof Logout Button */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1 shrink-0">
                {/* User Identity Pill (Clickable -> Opens Profile Modal) */}
                <button
                  type="button"
                  onClick={openProfileModal}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 dark:hover:bg-slate-700/90 border border-slate-200/80 dark:border-slate-700/80 text-xs shrink-0 cursor-pointer transition-all shadow-2xs group"
                  title={`Logged in as ${user.username} (${user.email}) - Click to edit profile`}
                >
                  <div className="h-6 w-6 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shadow-2xs shrink-0 overflow-hidden ring-1 ring-slate-300 dark:ring-slate-600">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{user.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="font-bold text-[11px] leading-tight text-slate-800 dark:text-slate-200 truncate max-w-[75px] md:max-w-[100px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {user.username}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 capitalize">
                      {user.role === 'super_admin' ? 'Super Admin' : user.role}
                    </span>
                  </div>
                </button>

                {/* Highly Visible, Dedicated Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  title={`Sign out of ${user.username}`}
                  aria-label="Sign out of account"
                  className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-rose-200 dark:hover:border-rose-900/60 transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openAuthModal('login')}
                  className="text-xs px-2 sm:px-2.5 py-1 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shrink-0"
                >
                  <LogIn className="h-3.5 w-3.5 mr-1 shrink-0" />
                  <span>Sign In</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => openAuthModal('register')}
                  className="text-xs px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold shadow-xs hidden sm:flex shrink-0"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
      <CrisisResourceModal open={showCrisis} onOpenChange={setShowCrisis} />
      <ProfileSettingsModal />
    </>
  );
}
