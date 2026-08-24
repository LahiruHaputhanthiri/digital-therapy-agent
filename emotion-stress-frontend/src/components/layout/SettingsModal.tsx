'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Phone,
  Sun,
  Moon,
  Monitor,
  Check,
  Trash2,
  Globe,
  AlertTriangle,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useStressStore } from '@/store/useStressStore';
import { useTheme, Theme } from '@/hooks/useTheme';
import { getAvailableCrisisRegions } from '@/lib/utils';

export interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * SettingsModal - Phase 5 Layout Assembly
 * Accessible modal dialog providing full application configuration:
 * 1. Appearance — 3-state theme selector (Light / Dark / System)
 * 2. Trusted Contact — Emergency contact name, relationship, phone
 * 3. Preferred Crisis Region — Country selector for localized helplines
 * 4. Data & Privacy Consent — Keystroke / History / Research toggles
 * 5. Data Management — Clear local session logs with confirmation guard
 */
export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const userProfile = useStressStore((state) => state.userProfile);
  const updateUserProfile = useStressStore((state) => state.updateUserProfile);
  const privacyConsent = useStressStore((state) => state.privacyConsent);
  const updatePrivacyConsent = useStressStore((state) => state.updatePrivacyConsent);
  const clearMessages = useStressStore((state) => state.clearMessages);

  const [contactName, setContactName] = useState(userProfile.trustedContact.name);
  const [contactPhone, setContactPhone] = useState(userProfile.trustedContact.phone);
  const [contactRelation, setContactRelation] = useState(userProfile.trustedContact.relationship);
  const [preferredRegion, setPreferredRegion] = useState(
    userProfile.preferredCrisisRegion ?? 'LK'
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearDone, setClearDone] = useState(false);

  const crisisRegions = getAvailableCrisisRegions();

  const handleSaveContact = () => {
    updateUserProfile({
      trustedContact: {
        ...userProfile.trustedContact,
        name: contactName,
        phone: contactPhone,
        relationship: contactRelation,
      },
      preferredCrisisRegion: preferredRegion,
    });
  };

  const handleClearLogs = () => {
    clearMessages();
    setClearDone(true);
    setShowClearConfirm(false);
    setTimeout(() => setClearDone(false), 3000);
  };

  const themeOptions: {
    key: Theme;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[] = [
    { key: 'light', label: 'Light', icon: Sun, description: 'Clean, soft & bright for daytime' },
    { key: 'dark', label: 'Dark', icon: Moon, description: 'Calm, low-glare & comfortable for night' },
    { key: 'system', label: 'System', icon: Monitor, description: 'Follows your device OS preference' },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Application & Privacy Settings"
      description="Manage your appearance, trusted contacts, crisis region, and privacy preferences."
      maxWidth="lg"
    >
      <div className="space-y-5 pt-1 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">

        {/* ── 1. Appearance ─────────────────────────────────────────── */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Appearance
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Active:{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-200 capitalize">
                {theme}
              </strong>{' '}
              {theme === 'system' && `(${resolvedTheme})`}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(({ key, label, icon: Icon, description }) => {
              const isSelected = theme === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTheme(key)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </div>
                    {isSelected && <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 2. Trusted Contact ────────────────────────────────────── */}
        <section className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-blue-500" />
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Trusted Contact
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Designate a trusted person you can quickly call during moments of elevated distress.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { label: 'Name', value: contactName, setter: setContactName, type: 'text' },
              { label: 'Relationship', value: contactRelation, setter: setContactRelation, type: 'text' },
              { label: 'Phone Number', value: contactPhone, setter: setContactPhone, type: 'tel' },
            ].map(({ label, value, setter, type }) => (
              <div key={label}>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  onBlur={handleSaveContact}
                  placeholder={label}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. Preferred Crisis Region ───────────────────────────── */}
        <section className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Preferred Crisis Region
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Selects which regional crisis helpline is shown prominently during safety alerts.
          </p>

          <div className="flex flex-wrap gap-2">
            {crisisRegions.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setPreferredRegion(code);
                  updateUserProfile({ preferredCrisisRegion: code });
                }}
                aria-pressed={preferredRegion === code}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  preferredRegion === code
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/80 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── 4. Privacy Consent Toggles ───────────────────────────── */}
        <section className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Research Data & Privacy Consent
            </h4>
          </div>

          <div className="space-y-2">
            {[
              {
                key: 'allowKeystrokeAnalysis' as const,
                label: 'Allow Keystroke Dynamics Analysis',
                description: 'Computes key press timing & cadence only. Never logs typed characters.',
              },
              {
                key: 'allowHistoricalStorage' as const,
                label: 'Store Session Summary History',
                description: 'Saves session topics and stress trends for longitudinal review.',
              },
              {
                key: 'allowAnonymousResearchData' as const,
                label: 'Anonymous Research Contribution',
                description: 'De-identified stress variance data for academic multimodal modeling.',
              },
            ].map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <div className="pr-3">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                </div>
                <Switch
                  checked={privacyConsent[key]}
                  onCheckedChange={(checked) => updatePrivacyConsent({ [key]: checked })}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Data Management ───────────────────────────────────── */}
        <section className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-rose-500" />
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Data Management
            </h4>
          </div>

          {clearDone ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="h-4 w-4" />
              Session logs cleared successfully.
            </div>
          ) : !showClearConfirm ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100/60 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Local Session Logs
            </button>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium flex-1">
                This will permanently clear all conversation and session logs.
              </span>
              <Button
                size="sm"
                onClick={handleClearLogs}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs px-3"
              >
                Clear
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-800/80">
          <Button size="sm" onClick={() => onOpenChange(false)} className="rounded-xl px-5">
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
