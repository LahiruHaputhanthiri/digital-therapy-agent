'use client';

import React from 'react';
import { MessageSquare, Activity, Shield, History, LifeBuoy } from 'lucide-react';
import { useStressStore } from '@/store/useStressStore';

export type MobileTab = 'chat' | 'insights' | 'sensors' | 'history';

export interface MobileNavigationProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

interface TabDef {
  id: MobileTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** If set, show a notification dot when this condition is true */
  dotCondition?: boolean;
  dotColor?: string;
}

/**
 * MobileNavigation - Phase 5 Layout Assembly
 * Fixed bottom navigation bar for mobile viewports (< 1024px).
 * Tabs: Chat | Insights (with stress dot) | Sensors | History
 * Plus an Emergency shortcut that triggers the safety protocol.
 */
export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const stressEstimate = useStressStore((state) => state.stressEstimate);
  const triggerSafetyProtocol = useStressStore((state) => state.triggerSafetyProtocol);

  const tabs: TabDef[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: MessageSquare,
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: Activity,
      dotCondition: stressEstimate.level !== 'low',
      dotColor: stressEstimate.level === 'moderate' ? 'bg-amber-500' : 'bg-rose-500',
    },
    {
      id: 'sensors',
      label: 'Sensors',
      icon: Shield,
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
    },
  ];

  const handleEmergency = () => {
    triggerSafetyProtocol({
      triggerReason: 'Emergency quick-access activated from mobile navigation.',
      riskLevel: 'potential_concern',
      requiresCrisisResources: true,
    });
    onTabChange('chat'); // Switch to chat so the SafetyBanner is visible
  };

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 dark:bg-slate-900/92 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around safe-area-bottom"
    >
      {/* Main tabs */}
      {tabs.map(({ id, label, icon: Icon, dotCondition, dotColor }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            aria-label={`${label} tab`}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 sm:px-4 rounded-xl transition-all cursor-pointer flex-1 max-w-[5rem] ${
              isActive
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              {dotCondition && (
                <span
                  className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${dotColor ?? 'bg-amber-500'} ring-1 ring-white dark:ring-slate-900`}
                  aria-hidden="true"
                />
              )}
            </div>
            <span className={`text-[9px] font-medium ${isActive ? 'font-bold' : ''}`}>
              {label}
            </span>
          </button>
        );
      })}

      {/* Emergency Quick-Access Button */}
      <button
        type="button"
        onClick={handleEmergency}
        aria-label="Emergency support — opens crisis resources"
        className="flex flex-col items-center gap-0.5 py-1 px-3 sm:px-4 rounded-xl transition-all cursor-pointer flex-1 max-w-[5rem] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
      >
        <LifeBuoy className="h-5 w-5" />
        <span className="text-[9px] font-medium">Emergency</span>
      </button>
    </nav>
  );
}
