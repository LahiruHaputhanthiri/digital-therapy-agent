import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StressLevel } from '@/types';

/**
 * Merges Tailwind CSS class names using clsx for conditionals and tailwind-merge
 * to eliminate conflicting utility class duplicates (e.g. `p-2 p-4` → `p-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Returns visual metadata corresponding to the estimated stress level tier.
 * Uses non-alarming, therapeutic color language per mental health UX best practices.
 */
export function getStressLevelDetails(level: StressLevel): {
  label: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  accentColor: string;
  description: string;
} {
  switch (level) {
    case 'low':
      return {
        label: 'Low',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        borderColor: 'border-emerald-200 dark:border-emerald-800/40',
        accentColor: '#10B981',
        description: 'Estimated stress is currently low. Physiological and behavioral signals are calm.',
      };
    case 'moderate':
      return {
        label: 'Moderate',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
        badgeText: 'text-amber-700 dark:text-amber-300',
        borderColor: 'border-amber-200 dark:border-amber-800/40',
        accentColor: '#F59E0B',
        description: 'Some stress-related signals are present. Gentle grounding or breathing may help.',
      };
    case 'high':
      return {
        label: 'Elevated',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
        badgeText: 'text-rose-700 dark:text-rose-300',
        borderColor: 'border-rose-200 dark:border-rose-800/40',
        accentColor: '#F43F5E',
        description: 'Multiple signals indicate elevated stress. Support options are available.',
      };
  }
}

/**
 * Formats an ISO timestamp string into a friendly HH:MM time string.
 * Returns empty string on invalid input (safe for SSR hydration).
 */
export function formatTime(timestampIso: string): string {
  try {
    const date = new Date(timestampIso);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/**
 * Formats a total number of seconds into MM:SS display string.
 */
export function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Returns a relative human-readable timestamp string (e.g. "just now", "3 min ago", "2 days ago").
 * Useful for session history cards and message timestamps on hover.
 */
export function formatRelativeTime(timestampIso: string): string {
  try {
    const date = new Date(timestampIso);
    if (isNaN(date.getTime())) return '';

    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 30) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'yesterday';
    if (diffDay < 7) return `${diffDay} days ago`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

/**
 * Formats minutes into a readable session duration string (e.g. "14 min", "1h 5m").
 */
export function formatSessionDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Typed definition for a regional crisis hotline entry.
 */
export interface CrisisHotline {
  region: string;
  countryCode: string;
  name: string;
  number: string;
  sms?: string;
  website?: string;
  available: string;
}

/**
 * Comprehensive regional crisis hotline registry.
 * Used by SafetyBanner, CrisisResourceModal, and SettingsModal for contextual emergency access.
 */
export const CRISIS_HOTLINES: CrisisHotline[] = [
  {
    region: 'Sri Lanka',
    countryCode: 'LK',
    name: 'Sumithrayo Sri Lanka',
    number: '1926',
    website: 'https://www.sumithrayo.org',
    available: '24/7',
  },
  {
    region: 'United States',
    countryCode: 'US',
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    sms: 'Text HOME to 741741',
    website: 'https://988lifeline.org',
    available: '24/7',
  },
  {
    region: 'United Kingdom',
    countryCode: 'GB',
    name: 'Samaritans',
    number: '116 123',
    website: 'https://www.samaritans.org',
    available: '24/7 Free',
  },
  {
    region: 'Australia',
    countryCode: 'AU',
    name: 'Lifeline Australia',
    number: '13 11 14',
    sms: 'Text 0477 13 11 14',
    website: 'https://www.lifeline.org.au',
    available: '24/7',
  },
  {
    region: 'India',
    countryCode: 'IN',
    name: 'iCall / Vandrevala Foundation',
    number: '9999 666 555',
    website: 'https://vandrevalafoundation.com',
    available: '24/7',
  },
  {
    region: 'Canada',
    countryCode: 'CA',
    name: 'Crisis Services Canada',
    number: '1-833-456-4566',
    sms: 'Text 45645',
    website: 'https://www.crisisservicescanada.ca',
    available: '24/7',
  },
  {
    region: 'Global (Online)',
    countryCode: 'WW',
    name: 'International Association for Suicide Prevention',
    number: '',
    website: 'https://www.iasp.info/resources/Crisis_Centres',
    available: 'Directory',
  },
];

/**
 * Returns the best matching crisis hotline for a given country code.
 * Falls back to the global directory entry if no match is found.
 */
export function getCrisisHotlineByCountry(countryCode: string): CrisisHotline {
  const match = CRISIS_HOTLINES.find(
    (h) => h.countryCode === countryCode.toUpperCase()
  );
  return match ?? CRISIS_HOTLINES[CRISIS_HOTLINES.length - 1];
}

/**
 * Returns all country codes available in the crisis hotline registry.
 */
export function getAvailableCrisisRegions(): { code: string; label: string }[] {
  return CRISIS_HOTLINES.map((h) => ({ code: h.countryCode, label: h.region }));
}
