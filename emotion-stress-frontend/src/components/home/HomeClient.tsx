'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LandingPage } from '@/components/home/LandingPage';
import { Loader2 } from 'lucide-react';

/**
 * HomeClient - Dynamic Client Root Switcher.
 * - When unauthenticated -> Renders the professional MindCare LandingPage.
 * - When authenticated -> Renders the 3-panel DashboardShell / Admin Control Center.
 * - Manages hydration state cleanly to avoid screen flashing.
 */
export function HomeClient() {
  const { isAuthenticated, isInitialized, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Loading indicator during initial session verification
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-lg animate-pulse">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
            Initializing MindCare...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <DashboardShell />;
  }

  return <LandingPage />;
}
