'use client';

import React, { useState } from 'react';
import { Phone, MessageSquare, ExternalLink, Globe, Shield, User } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SupportResourceService } from '@/services/supportResources';
import { useStressStore } from '@/store/useStressStore';

export interface CrisisResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrisisResourceModal({ open, onOpenChange }: CrisisResourceModalProps) {
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const userProfile = useStressStore((state) => state.userProfile);

  const countries = SupportResourceService.getSupportedCountries();
  const filteredResources =
    selectedCountry === 'ALL'
      ? SupportResourceService.getAll()
      : SupportResourceService.getByCountry(selectedCountry);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Support & Crisis Resources"
      description="Confidential, free, and available 24/7. You are never alone."
      maxWidth="lg"
    >
      <div className="space-y-4 pt-1">
        {/* Trusted Contact Quick Card */}
        {userProfile.trustedContact.phone && (
          <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="rounded-full bg-blue-600 p-2 text-white shadow-xs">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Your Trusted Contact: {userProfile.trustedContact.name}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {userProfile.trustedContact.relationship} • {userProfile.trustedContact.phone}
                </p>
              </div>
            </div>
            <a
              href={`tel:${userProfile.trustedContact.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Phone className="h-3.5 w-3.5" />
              Call
            </a>
          </div>
        )}

        {/* Country Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0 font-medium">Region:</span>
          {countries.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setSelectedCountry(code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCountry === code
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Resource List */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 flex flex-col gap-2 shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {res.name}
                    </h5>
                    <Badge variant="outline" className="text-[10px] py-0 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-900/60">
                      {res.country}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                    {res.description}
                  </p>
                </div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold whitespace-nowrap">
                  {res.available}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {res.website ? (
                  <a
                    href={res.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-700 transition-colors shadow-xs"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                ) : null}

                {res.phone && !res.phone.startsWith('Free') && (
                  <a
                    href={`tel:${res.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call {res.phone}
                  </a>
                )}

                {res.sms && (
                  <span className="text-[11px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <MessageSquare className="inline h-3 w-3 mr-1 text-slate-400" />
                    {res.sms}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Ethical Safety Notice */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <Shield className="h-3.5 w-3.5 text-teal-500 shrink-0" />
          <span>
            If you are in immediate physical danger, please call your local emergency services (e.g. 911, 999, 112).
          </span>
        </div>
      </div>
    </Dialog>
  );
}
