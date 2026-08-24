'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { TelemetryDrawer } from '@/components/layout/TelemetryDrawer';
import { HistoryDrawer } from '@/components/layout/HistoryDrawer';
import { MobileNavigation, MobileTab } from '@/components/layout/MobileNavigation';

/**
 * DashboardShell - Zen / Focus-First Architecture
 *
 * Mindful Digital Therapeutics (DTx) Layout:
 * 1. Default View: The central conversational therapy window (`ChatWindow`) is
 *    the uncluttered, distraction-free hero of the interface, centered with generous
 *    calming margins to prevent "Cognitive Overload" and "Biofeedback Anxiety".
 * 2. On-Demand Drawers:
 *    - Right Panel (`TelemetryDrawer`): Real-time biometric stress gauges, 7-emotion
 *      probability distributions, keystroke dynamics, and camera stream are kept
 *      in a slide-over drawer accessible when needed by researchers or users.
 *    - Left Panel (`HistoryDrawer`): Profile, past session archives, mood streaks,
 *      and settings.
 */
export function DashboardShell() {
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('chat');

  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === 'insights' || tab === 'sensors') {
      setIsTelemetryOpen(true);
      setIsHistoryOpen(false);
    } else if (tab === 'history') {
      setIsHistoryOpen(true);
      setIsTelemetryOpen(false);
    } else {
      setIsTelemetryOpen(false);
      setIsHistoryOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Zen Navigation Header */}
      <Header
        onToggleTelemetry={() => setIsTelemetryOpen((prev) => !prev)}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        isTelemetryOpen={isTelemetryOpen}
        isHistoryOpen={isHistoryOpen}
      />

      {/* Main Centered Therapeutic Stage */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 pb-20 lg:pb-4 flex flex-col h-[calc(100vh-4.25rem)] min-h-[560px]">
        <div className="flex-1 h-full w-full">
          <ChatWindow />
        </div>
      </main>

      {/* Right Slide-Over: Clinical Insights & Telemetry Drawer */}
      <TelemetryDrawer
        isOpen={isTelemetryOpen}
        onClose={() => {
          setIsTelemetryOpen(false);
          if (mobileTab === 'insights' || mobileTab === 'sensors') setMobileTab('chat');
        }}
      />

      {/* Left Slide-Over: Session History & Profile Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          if (mobileTab === 'history') setMobileTab('chat');
        }}
      />

      {/* Mobile Bottom Navigation (< 1024px) */}
      <MobileNavigation activeTab={mobileTab} onTabChange={handleMobileTabChange} />
    </div>
  );
}
