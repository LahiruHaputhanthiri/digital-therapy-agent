'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStressStore } from '@/store/useStressStore';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'mindcare_theme';

export function useTheme() {
  const theme = useStressStore((state) => state.theme);
  const setThemeInStore = useStressStore((state) => state.setTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // Apply theme to document element
  const applyTheme = useCallback((targetTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    let effectiveTheme: ResolvedTheme = 'light';

    if (targetTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = systemDark ? 'dark' : 'light';
    } else {
      effectiveTheme = targetTheme;
    }

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    setResolvedTheme(effectiveTheme);
  }, []);

  // Initialize theme from localStorage or system on mount
  useEffect(() => {
    setMounted(true);
    let savedTheme: Theme = 'system';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        savedTheme = stored;
      }
    } catch {
      // localStorage unavailable or restricted
    }

    setThemeInStore(savedTheme);
    applyTheme(savedTheme);

    // Listen for OS system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentStored = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'system';
      if (currentStored === 'system') {
        applyTheme('system');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [applyTheme, setThemeInStore]);

  // Handler to set theme and persist to localStorage
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeInStore(newTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {
        // ignore storage error
      }
      applyTheme(newTheme);
    },
    [applyTheme, setThemeInStore]
  );

  return {
    theme,
    resolvedTheme,
    setTheme,
    mounted,
  };
}
